import { describe, expect, it, vi } from 'vitest'
import { channel, CHANNELS } from '../../netlify/lib/channels'
import { countryName, foundVia, languageName, renderStats, type Ev } from '../../netlify/lib/statsPage'

const ev = (over: Partial<Ev>): Ev => ({
  day: '2026-10-22',
  e: 'open',
  c: '-',
  m: '-',
  f: '-',
  p: 'play',
  country: 'ph',
  isNew: false,
  score: '-',
  lang: 'en',
  age: 'd0',
  src: '-',
  k: '-',
  ...over,
})

const days = Array.from({ length: 30 }, (_, i) => new Date(Date.UTC(2026, 9, 22) - (29 - i) * 86400000).toISOString().slice(0, 10))
const now = new Date('2026-10-22T08:00:00Z')

describe('statistics page', () => {
  it('names countries and languages instead of codes', () => {
    expect(countryName('ph')).toBe('Philippines')
    expect(countryName('in')).toBe('India')
    expect(countryName('-')).toBe('Unknown')
    expect(languageName('ru')).toBe('Russian')
  })

  it('names the link codes, and falls back on the first part for unknown codes', () => {
    expect(channel('rc-dman').name).toBe('DMAN Maritime Review Center')
    expect(channel('in-fosma-noida').name).toBe('FOSMA Noida')
    expect(channel('in-newplace').group).toBe('India')
    expect(channel('zzz').name).toBe('zzz')
    // Every code is a valid ?src= value (the app only keeps a-z, 0-9 and -, at most 24 characters)
    for (const code of Object.keys(CHANNELS)) expect(code).toMatch(/^[a-z0-9-]{1,24}$/)
  })

  it('tells Play installs and direct web visits apart when there is no link code', () => {
    expect(foundVia(ev({ p: 'play' })).name).toBe('Google Play')
    expect(foundVia(ev({ p: 'ios' })).name).toBe('Web, direct')
    expect(foundVia(ev({ src: 'fb-mk' })).name).toBe('Maritime Knowledge')
  })

  it('shows a purchase today prominently, and only then', () => {
    const base = [ev({ isNew: true }), ev({ country: 'in', src: 'in-amet' })]
    const without = renderStats({ events: base, answers: new Map(), days, now, key: 'k' })
    expect(without).toContain('No purchase today')
    expect(without).not.toContain('class="buy')

    const withBuy = renderStats({
      events: [...base, ev({ e: 'bought', c: 'lights', src: 'rc-dman' })],
      answers: new Map(),
      days,
      now,
      key: 'k',
    })
    expect(withBuy).toContain('A purchase today!')
    expect(withBuy).toContain('DMAN Maritime Review Center')
    expect(withBuy).toContain('Philippines')
    expect(withBuy).not.toContain('>PH<')
  })

  it('escapes what comes from the keys', () => {
    const html = renderStats({ events: [ev({ src: '<b>' })], answers: new Map(), days, now, key: 'k' })
    expect(html).not.toContain('<b><')
  })
})

// The Netlify function itself, with a pretend blob store
const keys: string[] = []
vi.mock('@netlify/blobs', () => ({
  getStore: () => ({
    set: async (k: string) => void keys.push(k),
    list: async ({ prefix }: { prefix: string }) => ({ blobs: keys.filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }),
  }),
}))

describe('statistics function', () => {
  it('stores an event and shows it on the page with the right key only', async () => {
    ;(globalThis as unknown as { process: { env: Record<string, string> } }).process.env.STATS_KEY = 'secret'
    // A variable path, so the type check of the app does not follow it into Netlify's Node code
    const path = '../../netlify/functions/usage.mts'
    const { default: handler } = (await import(/* @vite-ignore */ path)) as {
      default: (req: Request, ctx: { geo?: { country?: { code?: string } } }) => Promise<Response>
    }
    const post = new Request('https://x/api/usage', { method: 'POST', headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 14) Chrome/155.0 Mobile Safari/537.36' }, body: JSON.stringify({ e: 'bought', p: 'play', c: 'lights', src: 'rc-dman' }) })
    expect((await handler(post, { geo: { country: { code: 'PH' } } })).status).toBe(204)
    expect((await handler(new Request('https://x/stats?key=wrong'), {})).status).toBe(404)
    const page = await (await handler(new Request('https://x/stats?key=secret&days=7'), {})).text()
    expect(page).toContain('A purchase today!')
    expect(page).toContain('DMAN Maritime Review Center')
    expect(page).toContain('<b>7 days</b>')
  })
})
