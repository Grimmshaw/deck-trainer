import { useSyncExternalStore } from 'react'
import { load, save } from '../storage'
import type { CategoryId } from '../study/categories'

// One-time purchase "Unlock all" through Google Play Billing.
//
// - In the Google Play app (a Trusted Web Activity) the Digital Goods API
//   is available, and the purchase is made with the Payment Request API.
// - On the web there is no purchase: the free part is open and the rest
//   shows a link to the app on Google Play. Testers can unlock the web
//   version with an access code (checked by netlify/functions/access-code.mts).
//   Codes never unlock the Google Play app – Google requires Play Billing there.
// - While PAYWALL_ON is false (the beta), everything is open everywhere.

/** Turn on when the app is released on Google Play */
export const PAYWALL_ON = false

/** In-app product id, created in Play Console (Monetise → Products → In-app products) */
export const SKU = 'lanterna_full'
export const PACKAGE = 'se.lanternakonsult.lanterna'
export const PLAY_URL = `https://play.google.com/store/apps/details?id=${PACKAGE}`
/** Shown until Google Play gives the real, local price */
export const FALLBACK_PRICE = '€9.90'

const PLAY_BILLING = 'https://play.google.com/billing'
const FREE: CategoryId[] = ['morse']

const KEY = 'deck.unlock'
/** code is set when the unlock came from an access code (web only) */
const stored = load(KEY, { unlocked: false, code: '' })
let unlocked = stored.unlocked
let unlockCode = stored.code
const listeners = new Set<() => void>()

function setUnlocked(v: boolean, code = '') {
  unlocked = v
  unlockCode = v ? code : ''
  save(KEY, { unlocked: v, code: unlockCode })
  listeners.forEach((l) => l())
}

export function isFree(id: CategoryId): boolean {
  return FREE.includes(id)
}

export function canOpen(id: CategoryId): boolean {
  return !PAYWALL_ON || unlocked || isFree(id)
}

/** Re-renders when the purchase state changes */
export function useUnlocked(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => unlocked,
  )
}

// ---------- Google Play Billing ----------

interface DigitalGoodsService {
  getDetails(ids: string[]): Promise<{ itemId: string; title: string; price: { currency: string; value: string } }[]>
  listPurchases(): Promise<{ itemId: string; purchaseToken: string }[]>
}

declare global {
  interface Window {
    getDigitalGoodsService?: (store: string) => Promise<DigitalGoodsService>
  }
}

let servicePromise: Promise<DigitalGoodsService | null> | null = null

/** The Play Billing service, or null on the web */
export function playService(): Promise<DigitalGoodsService | null> {
  if (!servicePromise) {
    servicePromise = (async () => {
      if (!('getDigitalGoodsService' in window) || !window.getDigitalGoodsService) return null
      try {
        return await window.getDigitalGoodsService(PLAY_BILLING)
      } catch {
        return null
      }
    })()
  }
  return servicePromise
}

/** The local price from Google Play, e.g. "99,00 kr", or the fallback */
export async function localPrice(): Promise<string> {
  const s = await playService()
  if (!s) return FALLBACK_PRICE
  try {
    const [item] = await s.getDetails([SKU])
    if (!item) return FALLBACK_PRICE
    return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: item.price.currency }).format(
      Number(item.price.value),
    )
  } catch {
    return FALLBACK_PRICE
  }
}

/** Asks our server to check the purchase with Google and acknowledge it */
async function verify(token: string): Promise<boolean> {
  try {
    const res = await fetch('/.netlify/functions/verify-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, sku: SKU }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { valid?: boolean }
    return data.valid === true
  } catch {
    return false
  }
}

/** On start in the Play app: unlock if the user has bought before (also after reinstalling) */
export async function restorePurchases(): Promise<void> {
  const s = await playService()
  if (!s) {
    await recheckCode()
    return
  }
  try {
    const owned = (await s.listPurchases()).find((p) => p.itemId === SKU)
    if (!owned) {
      // An access code from the web does not count in the Google Play app
      if (unlockCode) setUnlocked(false)
      return
    }
    if (!unlocked || unlockCode) setUnlocked(true)
    // Make sure it is acknowledged, otherwise Google refunds it after three days
    const done = load('deck.ack', { token: '' }).token
    if (done !== owned.purchaseToken && (await verify(owned.purchaseToken))) save('deck.ack', { token: owned.purchaseToken })
  } catch {
    /* offline – try again next time */
  }
}

export type BuyResult = 'ok' | 'cancelled' | 'failed' | 'unavailable'

export async function buy(): Promise<BuyResult> {
  if (!(await playService()) || !('PaymentRequest' in window)) return 'unavailable'
  try {
    const request = new PaymentRequest([{ supportedMethods: PLAY_BILLING, data: { sku: SKU } }], {
      // Required by the API but ignored by Google Play
      total: { label: 'Total', amount: { currency: 'EUR', value: '0' } },
    })
    const response = await request.show()
    const token = (response.details as { purchaseToken?: string }).purchaseToken
    const ok = token ? await verify(token) : false
    await response.complete(ok ? 'success' : 'fail')
    if (ok && token) {
      save('deck.ack', { token })
      setUnlocked(true)
      return 'ok'
    }
    return 'failed'
  } catch (e) {
    return (e as Error).name === 'AbortError' ? 'cancelled' : 'failed'
  }
}

// ---------- Access codes (web only) ----------

async function checkCode(code: string): Promise<boolean | null> {
  try {
    const res = await fetch('/api/access-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    if (!res.ok) return null
    return ((await res.json()) as { valid?: boolean }).valid === true
  } catch {
    return null // offline
  }
}

export type CodeResult = 'ok' | 'wrong' | 'offline' | 'in-app'

export async function redeemCode(code: string): Promise<CodeResult> {
  if (await playService()) return 'in-app'
  const valid = await checkCode(code)
  if (valid === null) return 'offline'
  if (!valid) return 'wrong'
  setUnlocked(true, code.trim())
  return 'ok'
}

/** On start on the web: lock again if the code has been removed on the server */
async function recheckCode(): Promise<void> {
  if (!unlockCode) return
  if ((await checkCode(unlockCode)) === false) setUnlocked(false)
}
