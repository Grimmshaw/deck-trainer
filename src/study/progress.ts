import { useSyncExternalStore } from 'react'

// Progress per knowledge item, using a simple Leitner system:
// each item sits in a box 0–5. A right answer moves it up one box and it
// comes back later; a wrong answer sends it back to box 0 so it comes back soon.
// Saved on the device (localStorage).

export interface ItemProgress {
  box: number
  /** When the item should be asked again (ms since 1970) */
  due: number
  seen: number
  right: number
}

export const MAX_BOX = 5
const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
/** How long to wait before asking again, per box */
const INTERVAL = [0, 10 * MINUTE, DAY, 3 * DAY, 7 * DAY, 21 * DAY]
const STORAGE_KEY = 'deck.progress'

type Store = Record<string, ItemProgress>

let store: Store = read()
let version = 0
const listeners = new Set<() => void>()

function read(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Store) : {}
  } catch {
    return {}
  }
}

function write() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* storage may be blocked; progress then lasts for this visit only */
  }
  version++
  listeners.forEach((l) => l())
}

export function getProgress(key: string): ItemProgress | undefined {
  return store[key]
}

export function record(key: string, correct: boolean, now = Date.now()) {
  const p = store[key] ?? { box: 0, due: now, seen: 0, right: 0 }
  const box = correct ? Math.min(MAX_BOX, p.box + 1) : 0
  store = {
    ...store,
    [key]: { box, due: now + INTERVAL[box], seen: p.seen + 1, right: p.right + (correct ? 1 : 0) },
  }
  write()
}

export function resetProgress(keys: string[]) {
  const next = { ...store }
  keys.forEach((k) => delete next[k])
  store = next
  write()
}

/** 0–1: how well the items are learned */
export function mastery(keys: string[]): number {
  if (keys.length === 0) return 0
  const sum = keys.reduce((s, k) => s + (store[k]?.box ?? 0), 0)
  return sum / (keys.length * MAX_BOX)
}

/** Items answered wrong recently (seen, but still in box 0 or 1) */
export function weakKeys(keys: string[]): string[] {
  return keys.filter((k) => {
    const p = store[k]
    return p !== undefined && p.seen > 0 && p.box <= 1
  })
}

/**
 * Picks the next item to ask. Items that are due, weak or never seen are
 * much more likely; recently asked items are skipped when possible.
 */
export function pickKey(keys: string[], recent: string[] = [], now = Date.now()): string {
  const avoid = new Set(recent.slice(-Math.min(5, Math.floor(keys.length / 2))))
  const pool = keys.filter((k) => !avoid.has(k))
  const list = pool.length > 0 ? pool : keys
  const weights = list.map((k) => {
    const p = store[k]
    if (!p) return 2
    if (p.due <= now) return 3 + (MAX_BOX - p.box)
    return 0.3 / (p.box + 1)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < list.length; i++) {
    r -= weights[i]
    if (r <= 0) return list[i]
  }
  return list[list.length - 1]
}

/** Re-renders the component whenever progress changes */
export function useProgress(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => version,
  )
}
