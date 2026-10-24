import { describe, expect, it, vi } from 'vitest'
import { channel, CHANNELS } from '../../netlify/lib/channels'
import { ago, countryName, describeEvent, devicesOfDay, foundVia, languageName, renderStats, type Ev } from '../../netlify/lib/statsPage'
import { deviceCutoff, parseKey, withoutDevice } from '../../netlify/lib/usageKeys'

const ev = (over: Partial<Ev>): Ev => ({
  day: '2026-10-22',
  t: '-',
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
  d: '-',
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

  it('ranks the devices of today by exercises started, and never mixes days', () => {
    const list = [
      ev({ d: 'aaaaaaaa', t: '0610', e: 'open', isNew: true }),
      ev({ d: 'aaaaaaaa', t: '0612', e: 'start', c: 'colregs', m: 'practice' }),
      ev({ d: 'bbbbbbbb', t: '0615', e: 'open', country: 'in', src: 'in-amet' }),
      ev({ d: 'bbbbbbbb', t: '0620', e: 'start', c: 'lights', m: 'practice', country: 'in', src: 'in-amet' }),
      ev({ d: 'bbbbbbbb', t: '0640', e: 'start', c: 'lights', m: 'test', country: 'in', src: 'in-amet' }),
      ev({ d: 'bbbbbbbb', t: '0655', e: 'finish', c: 'lights', m: 'test', score: '80', country: 'in', src: 'in-amet' }),
      // The same number on another day is another device
      ev({ day: '2026-10-21', d: 'aaaaaaaa', t: '2200', e: 'start', c: 'flags' }),
      // Events without a number are not devices
      ev({ t: '0700', e: 'start', c: 'sound' }),
    ]
    const top = devicesOfDay(list, '2026-10-22')
    expect(top.map((x) => [x.label, x.started, x.country])).toEqual([
      ['Device B', 2, 'in'],
      ['Device A', 1, 'ph'],
    ])
    const html = renderStats({ events: list, answers: new Map(), days, now, key: 'k' })
    expect(html).toContain('Most active today')
    expect(html).toContain('Lights &amp; shapes ×2')
    expect(html).toContain('new today')
    expect(html).not.toContain('aaaaaaaa') // the number itself is never shown
    expect(html).toContain('Last activity <b>1 h ago</b>')
  })

  it('says when the app was last used, in Swedish time', () => {
    const at = new Date('2026-10-22T08:00:00Z')
    expect(ago(new Date('2026-10-22T07:56:00Z'), at)).toBe('4 min ago')
    expect(ago(new Date('2026-10-22T05:55:00Z'), at)).toBe('2 h 5 min ago')
    expect(ago(new Date('2026-10-21T21:40:00Z'), at)).toBe('yesterday 23:40')
    expect(describeEvent(ev({ e: 'finish', c: 'colregs', m: 'test', score: '70' }))).toBe('Finished COLREGs · Test · 70 %')
    const html = renderStats({ events: [ev({ t: '0756', e: 'start', c: 'vhf', m: 'trial', country: 'lv' })], answers: new Map(), days, now, key: 'k' })
    expect(html).toContain('class="live on"')
    expect(html).toContain('Started VHF &amp; SMCP · Free round')
    expect(html).toContain('Latvia')
    const none = renderStats({ events: [ev({})], answers: new Map(), days, now, key: 'k' })
    expect(none).toContain('times are recorded from 24 Oct')
  })

  it('removes the device number from events older than 30 days', () => {
    const key = 'e3/2026-09-20/1015/start/colregs/practice/-/play/ph/0/-/en/w1/-/10/k3x9a0bq/abc123'
    expect(parseKey(key)).toMatchObject({ day: '2026-09-20', t: '1015', e: 'start', d: 'k3x9a0bq', k: '10' })
    expect(parseKey('e2/2026-10-20/open/-/-/-/play/ph/1/-/en/d0/-/-/xyz')).toMatchObject({ t: '-', d: '-', isNew: true })
    const cutoff = deviceCutoff(new Date('2026-10-24T03:00:00Z'))
    expect(cutoff).toBe('2026-09-24')
    expect(withoutDevice(key, cutoff)).toBe('e3/2026-09-20/1015/start/colregs/practice/-/play/ph/0/-/en/w1/-/10/-/abc123')
    expect(withoutDevice(key.replace('2026-09-20', '2026-10-01'), cutoff)).toBeNull()
    expect(withoutDevice(key.replace('k3x9a0bq', '-'), cutoff)).toBeNull()
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
    const post = new Request('https://x/api/usage', { method: 'POST', headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 14) Chrome/155.0 Mobile Safari/537.36' }, body: JSON.stringify({ e: 'bought', p: 'play', c: 'lights', src: 'rc-dman', d: 'k3x9a0bq' }) })
    expect((await handler(post, { geo: { country: { code: 'PH' } } })).status).toBe(204)
    expect((await handler(new Request('https://x/stats?key=wrong'), {})).status).toBe(404)
    const page = await (await handler(new Request('https://x/stats?key=secret&days=7'), {})).text()
    expect(page).toContain('A purchase today!')
    expect(page).toContain('DMAN Maritime Review Center')
    expect(page).toContain('<b>7 days</b>')
    expect(keys[0]).toMatch(/^e3\/\d{4}-\d\d-\d\d\/\d{4}\/bought\/lights\/.*\/k3x9a0bq\/[a-z0-9]+$/)
    expect(page).toContain('Most active today')
    expect(page).toContain('Last activity <b>just now</b>')
    // A made-up number that is not 8 letters/digits is not stored
    await handler(new Request('https://x/api/usage', { method: 'POST', headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 14) Chrome/155.0 Mobile Safari/537.36' }, body: JSON.stringify({ e: 'start', d: '../evil' }) }), {})
    expect(keys[1].split('/')[15]).toBe('-')
  })
})
