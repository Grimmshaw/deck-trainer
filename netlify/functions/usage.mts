import { getStore } from '@netlify/blobs'
import { PERIODS, renderStats, type Answer, type Ev } from '../lib/statsPage'

// Anonymous usage statistics.
//
//   POST /api/usage          the app sends one event (see src/stats/usage.ts)
//   GET  /stats?key=SECRET   the statistics page. SECRET is the environment
//                            variable STATS_KEY in Netlify (Project configuration
//                            → Environment variables). Without it the page is closed.
//
// Every event is stored as its own, empty blob in the store "usage". All the
// information is in the key, so the page only has to list keys:
//   e2/<day>/<event>/<category>/<mode>/<focus>/<platform>/<country>/<new>/<score>/<lang>/<age>/<src>/<count>/<random>
// (keys from before 15 Oct 2026 start with e/ and end after <score>/<random>).
// Answers ("which questions were answered right or wrong") are one blob per question:
//   q/<day>/<category>/<question id>/<r or w>/<random>
// No IP address or other personal data is stored.

export const config = { path: ['/api/usage', '/stats'] }

const EVENTS = ['open', 'start', 'finish', 'quit', 'lock', 'buy', 'bought', 'buyfail', 'getapp', 'share']
const AGES = ['d0', 'w1', 'm1', 'old']
const PLATFORMS = ['play', 'ios', 'ios-home', 'android', 'android-home', 'desktop']

/** Keeps only short, plain words: letters, digits and dashes */
const clean = (v: unknown, max = 24): string =>
  typeof v === 'string' && /^[a-z0-9-]{1,24}$/i.test(v) ? v.slice(0, max).toLowerCase() : '-'

interface Ctx {
  geo?: { country?: { code?: string } }
}

export default async (req: Request, context: Ctx): Promise<Response> => {
  const url = new URL(req.url)
  if (url.pathname === '/stats') return statsPage(url)
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let body: Record<string, unknown>
  try {
    const text = await req.text()
    if (text.length > 4000) return new Response('Too large', { status: 413 })
    body = JSON.parse(text)
  } catch {
    return new Response('Bad request', { status: 400 })
  }
  const day = new Date().toISOString().slice(0, 10)
  const rand = () => Math.random().toString(36).slice(2, 10)

  // Which questions were answered right or wrong
  if (body.e === 'ans') {
    const c = clean(body.c)
    const list = Array.isArray(body.a) ? body.a.slice(0, 60) : []
    const store = getStore('usage')
    await Promise.all(
      list.map((x) => {
        if (!Array.isArray(x) || typeof x[0] !== 'string' || !/^[a-z0-9:_.-]{1,60}$/i.test(x[0])) return null
        return store.set(['q', day, c, x[0], x[1] === 1 ? 'r' : 'w', rand()].join('/'), '')
      }),
    )
    return new Response(null, { status: 204 })
  }

  const e = clean(body.e)
  if (!EVENTS.includes(e)) return new Response('Bad event', { status: 400 })
  const p = PLATFORMS.includes(clean(body.p)) ? clean(body.p) : '-'
  const score = typeof body.s === 'number' && body.s >= 0 && body.s <= 100 ? String(Math.round(body.s / 10) * 10) : '-'
  const country = clean(context.geo?.country?.code, 2)
  const lang = typeof body.l === 'string' && /^[a-z]{2,3}$/.test(body.l) ? body.l : '-'
  const age = typeof body.a === 'string' && AGES.includes(body.a) ? body.a : '-'
  const k = typeof body.k === 'number' && body.k >= 0 && body.k < 1000 ? String(Math.round(body.k)) : '-'
  const key = ['e2', day, e, clean(body.c), clean(body.m), clean(body.f), p, country, body.n === 1 ? '1' : '0', score, lang, age, clean(body.src), k, rand()].join('/')

  await getStore('usage').set(key, '')
  return new Response(null, { status: 204 })
}

// ---------- The statistics page ----------
// The page itself is drawn in netlify/lib/statsPage.ts; readable names for the
// link codes (?src=…) are in netlify/lib/channels.ts.

function parse(key: string): Ev | null {
  const x = key.split('/')
  if (x[0] === 'e2') {
    const [, day, e, c, m, f, p, country, n, score, lang, age, src, k] = x
    return { day, e, c, m, f, p, country, isNew: n === '1', score, lang, age, src, k }
  }
  if (x[0] === 'e') {
    const [, day, e, c, m, f, p, country, n, score] = x
    return { day, e, c, m, f, p, country, isNew: n === '1', score, lang: '-', age: '-', src: '-', k: '-' }
  }
  return null
}

async function statsPage(url: URL): Promise<Response> {
  const secret = process.env.STATS_KEY
  const key = url.searchParams.get('key') ?? ''
  if (!secret || key !== secret) {
    return new Response('Not found', { status: 404 })
  }
  const asked = Number(url.searchParams.get('days'))
  const period = PERIODS.includes(asked) ? asked : 30

  const store = getStore('usage')
  const now = new Date()
  const days: string[] = []
  for (let i = period - 1; i >= 0; i--) days.push(new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10))
  const months = [...new Set(days.map((d) => d.slice(0, 7)))]

  const events: Ev[] = []
  const answers = new Map<string, Answer>()
  for (const month of months) {
    for (const prefix of ['e/', 'e2/']) {
      const { blobs } = await store.list({ prefix: prefix + month })
      for (const b of blobs) {
        const ev = parse(b.key)
        if (ev && ev.day >= days[0]) events.push(ev)
      }
    }
    const { blobs } = await store.list({ prefix: `q/${month}` })
    for (const b of blobs) {
      const [, day, c, id, rw] = b.key.split('/')
      if (day < days[0]) continue
      const a = answers.get(id) ?? { c, r: 0, w: 0 }
      if (rw === 'r') a.r++
      else a.w++
      answers.set(id, a)
    }
  }

  const html = renderStats({ events, answers, days, now, key })
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}
