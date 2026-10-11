import { getStore } from '@netlify/blobs'

// Anonymous usage statistics.
//
//   POST /api/usage          the app sends one event (see src/stats/usage.ts)
//   GET  /stats?key=SECRET   the statistics page. SECRET is the environment
//                            variable STATS_KEY in Netlify (Project configuration
//                            → Environment variables). Without it the page is closed.
//
// Every event is stored as its own, empty blob in the store "usage". All the
// information is in the key, so the page only has to list keys:
//   e/<day>/<event>/<category>/<mode>/<focus>/<platform>/<country>/<new>/<score>/<random>
// No IP address or other personal data is stored.

export const config = { path: ['/api/usage', '/stats'] }

const EVENTS = ['open', 'start', 'finish']
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
    if (text.length > 1000) return new Response('Too large', { status: 413 })
    body = JSON.parse(text)
  } catch {
    return new Response('Bad request', { status: 400 })
  }
  const e = clean(body.e)
  if (!EVENTS.includes(e)) return new Response('Bad event', { status: 400 })
  const p = PLATFORMS.includes(clean(body.p)) ? clean(body.p) : '-'
  const score = typeof body.s === 'number' && body.s >= 0 && body.s <= 100 ? String(Math.round(body.s / 10) * 10) : '-'
  const country = clean(context.geo?.country?.code, 2)
  const day = new Date().toISOString().slice(0, 10)
  const rand = Math.random().toString(36).slice(2, 10)
  const key = ['e', day, e, clean(body.c), clean(body.m), clean(body.f), p, country, body.n === 1 ? '1' : '0', score, rand].join('/')

  await getStore('usage').set(key, '')
  return new Response(null, { status: 204 })
}

// ---------- The statistics page ----------

interface Ev {
  day: string
  e: string
  c: string
  m: string
  f: string
  p: string
  country: string
  isNew: boolean
  score: string
}

const DAYS = 30

async function statsPage(url: URL): Promise<Response> {
  const secret = process.env.STATS_KEY
  if (!secret || url.searchParams.get('key') !== secret) {
    return new Response('Not found', { status: 404 })
  }

  const store = getStore('usage')
  const days: string[] = []
  for (let i = DAYS - 1; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10))
  const months = [...new Set(days.map((d) => d.slice(0, 7)))]

  const events: Ev[] = []
  for (const month of months) {
    const { blobs } = await store.list({ prefix: `e/${month}` })
    for (const b of blobs) {
      const [, day, e, c, m, f, p, country, n, score] = b.key.split('/')
      if (day >= days[0]) events.push({ day, e, c, m, f, p, country, isNew: n === '1', score })
    }
  }

  const opens = events.filter((x) => x.e === 'open')
  const starts = events.filter((x) => x.e === 'start')
  const finishes = events.filter((x) => x.e === 'finish')
  const today = days[days.length - 1]
  const last7 = days.slice(-7)

  const count = (list: Ev[], by: (x: Ev) => string) => {
    const m = new Map<string, number>()
    for (const x of list) m.set(by(x), (m.get(by(x)) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }
  const table = (title: string, rows: [string, number][], unit = '') =>
    `<section><h2>${title}</h2>${
      rows.length
        ? `<table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${v}${unit}</td></tr>`).join('')}</table>`
        : '<p class="muted">Nothing yet</p>'
    }</section>`

  const perDay = days.map((d) => ({
    d,
    devices: opens.filter((x) => x.day === d).length,
    starts: starts.filter((x) => x.day === d).length,
  }))
  const max = Math.max(1, ...perDay.map((x) => x.devices))
  const chart = perDay
    .map(
      (x) =>
        `<div class="bar" title="${x.d}: ${x.devices} devices, ${x.starts} started"><span style="height:${(x.devices / max) * 100}%"></span><small>${x.d.slice(8)}</small></div>`,
    )
    .join('')

  const avgScore = (list: Ev[]) => {
    const s = list.filter((x) => x.score !== '-').map((x) => Number(x.score))
    return s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : 0
  }
  const byCategory = count(starts, (x) => x.c).map(([c, n]) => {
    const done = finishes.filter((x) => x.c === c)
    return [`${c} – ${done.length} finished${done.length ? `, average ${avgScore(done)} %` : ''}`, n] as [string, number]
  })

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Lanterna – usage</title><style>
body{margin:0;background:#0b1d33;color:#e7edf6;font:15px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:20px 16px 48px}h1{font-size:1.4rem;margin:0}h2{font-size:1rem;color:#ffc83d;margin:0 0 6px}
.muted{color:#8ea3bf;font-size:.9rem}.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:16px 0}
.tile{background:#14304f;border-radius:12px;padding:12px}.tile b{display:block;font-size:1.6rem}section{background:#14304f;border-radius:12px;padding:12px;margin-top:12px}
table{width:100%;border-collapse:collapse}td{padding:4px 0;border-bottom:1px solid #1f4064}td.n{text-align:right;font-variant-numeric:tabular-nums}
.chart{display:flex;align-items:flex-end;gap:2px;height:140px}.bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%}
.bar span{width:100%;background:#ffc83d;border-radius:3px 3px 0 0;min-height:1px}.bar small{font-size:9px;color:#8ea3bf}
</style></head><body><main>
<h1>Lanterna – usage</h1><p class="muted">Last ${DAYS} days · anonymous · a device counts once per day</p>
<div class="tiles">
<div class="tile"><b>${opens.filter((x) => x.day === today).length}</b>devices today</div>
<div class="tile"><b>${opens.filter((x) => last7.includes(x.day)).length}</b>device-days, last 7 days</div>
<div class="tile"><b>${opens.filter((x) => x.isNew).length}</b>new devices, ${DAYS} days</div>
<div class="tile"><b>${starts.length}</b>exercises started</div>
<div class="tile"><b>${finishes.length}</b>tests/practices finished</div>
</div>
<section><h2>Devices per day</h2><div class="chart">${chart}</div></section>
${table('Categories (exercises started)', byCategory)}
${table('Ways of studying', count(starts, (x) => (x.f !== '-' ? `${x.m} · ${x.f}` : x.m)))}
${table('Countries (device-days)', count(opens, (x) => x.country.toUpperCase()))}
${table('Devices (device-days)', count(opens, (x) => PLATFORM_NAMES[x.p] ?? x.p))}
</main></body></html>`
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}

const PLATFORM_NAMES: Record<string, string> = {
  play: 'Google Play app',
  ios: 'iPhone / iPad – browser',
  'ios-home': 'iPhone / iPad – home screen',
  android: 'Android – browser',
  'android-home': 'Android – installed web app',
  desktop: 'Computer',
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
