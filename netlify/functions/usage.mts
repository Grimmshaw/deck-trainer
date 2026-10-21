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
  lang: string
  age: string
  src: string
  k: string
}

const DAYS = 30

/** Exercises that have no natural end: they only send "finish" when left */
const ENDLESS = ['learn', 'decode', 'encode', 'light']

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
  if (!secret || url.searchParams.get('key') !== secret) {
    return new Response('Not found', { status: 404 })
  }

  const store = getStore('usage')
  const days: string[] = []
  for (let i = DAYS - 1; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10))
  const months = [...new Set(days.map((d) => d.slice(0, 7)))]

  const events: Ev[] = []
  const answers = new Map<string, { c: string; r: number; w: number }>()
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

  const of = (e: string) => events.filter((x) => x.e === e)
  const opens = of('open')
  const starts = of('start')
  const finishes = of('finish')
  const quits = of('quit')
  const today = days[days.length - 1]
  const last7 = days.slice(-7)

  const count = (list: Ev[], by: (x: Ev) => string) => {
    const m = new Map<string, number>()
    for (const x of list) m.set(by(x), (m.get(by(x)) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }
  const table = (title: string, rows: [string, number][], note = '') =>
    `<section><h2>${title}</h2>${note ? `<p class="muted">${note}</p>` : ''}${
      rows.length
        ? `<table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${v}</td></tr>`).join('')}</table>`
        : '<p class="muted">Nothing yet</p>'
    }</section>`
  const grid = (title: string, head: string[], rows: (string | number)[][], note = '') =>
    `<section><h2>${title}</h2>${note ? `<p class="muted">${note}</p>` : ''}${
      rows.length
        ? `<table><tr>${head.map((h, i) => `<th${i ? ' class="n"' : ''}>${h}</th>`).join('')}</tr>${rows
            .map((r) => `<tr>${r.map((v, i) => `<td${i ? ' class="n"' : ''}>${esc(String(v))}</td>`).join('')}</tr>`)
            .join('')}</table>`
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

  const avg = (list: Ev[]) => {
    const s = list.filter((x) => x.score !== '-').map((x) => Number(x.score))
    return s.length ? `${Math.round(s.reduce((a, b) => a + b, 0) / s.length)} %` : '–'
  }
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : '–')

  // Categories: started, finished, left early. Learn and Read/Send Morse have no end, so they are not in "finished of those that can finish".
  const cats = [...new Set(starts.map((x) => x.c))]
  const catRows = cats
    .map((c) => {
      const st = starts.filter((x) => x.c === c)
      const fin = finishes.filter((x) => x.c === c && !ENDLESS.includes(x.m))
      const q = quits.filter((x) => x.c === c)
      return [c, st.length, fin.length, q.length, pct(fin.length, fin.length + q.length), avg(fin)] as (string | number)[]
    })
    .sort((a, b) => Number(b[1]) - Number(a[1]))

  // Practice length: does anyone finish 50 questions?
  const lenRows = ['10', '30', '50'].map((k) => {
    const fin = finishes.filter((x) => x.m === 'practice' && x.k === k)
    const q = quits.filter((x) => x.m === 'practice' && x.k === k)
    return [`${k} questions`, starts.filter((x) => x.m === 'practice' && x.k === k).length, fin.length, q.length, avg(q)]
  })

  // The purchase path
  const buyRows: [string, number][] = [
    ['Free rounds started', starts.filter((x) => x.m === 'trial').length],
    ['Lock page shown', of('lock').length],
    ['Web: "Get Lanterna on Google Play" pressed', of('getapp').length],
    ['Play app: "Unlock all" pressed', of('buy').length],
    ['Bought', of('bought').length],
    ...count(of('buyfail'), (x) => `Not bought: ${x.m}`),
  ]
  const lockRows = count(of('lock'), (x) => x.c).map(([c, n]) => [
    c,
    n,
    of('buy').filter((x) => x.c === c).length,
    of('bought').filter((x) => x.c === c).length,
  ])

  // Questions that most people get wrong (at least 5 answers)
  const hard = [...answers.entries()]
    .filter(([, a]) => a.r + a.w >= 5)
    .sort((a, b) => b[1].w / (b[1].r + b[1].w) - a[1].w / (a[1].r + a[1].w))
    .slice(0, 30)
    .map(([id, a]) => [id, a.c === 'exam' ? `exam (${id.split(':')[0]})` : a.c, a.r + a.w, pct(a.w, a.r + a.w)])

  const AGE_NAMES: Record<string, string> = { d0: 'First day', w1: 'Day 2–7', m1: 'Day 8–30', old: 'After a month', '-': 'Unknown (before 15 Oct)' }
  const opens2 = opens.filter((x) => x.age !== '-')

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Lanterna – usage</title><style>
body{margin:0;background:#0b1d33;color:#e7edf6;font:15px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:20px 16px 48px}h1{font-size:1.4rem;margin:0}h2{font-size:1rem;color:#ffc83d;margin:0 0 6px}
.muted{color:#8ea3bf;font-size:.9rem;margin:0 0 6px}.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:16px 0}
.tile{background:#14304f;border-radius:12px;padding:12px}.tile b{display:block;font-size:1.6rem}section{background:#14304f;border-radius:12px;padding:12px;margin-top:12px;overflow-x:auto}
table{width:100%;border-collapse:collapse}td,th{padding:4px 6px 4px 0;border-bottom:1px solid #1f4064;text-align:left}th{color:#8ea3bf;font-weight:600;font-size:.85rem}
.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.chart{display:flex;align-items:flex-end;gap:2px;height:140px}.bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%}
.bar span{width:100%;background:#ffc83d;border-radius:3px 3px 0 0;min-height:1px}.bar small{font-size:9px;color:#8ea3bf}
</style></head><body><main>
<h1>Lanterna – usage</h1><p class="muted">Last ${DAYS} days · anonymous · a device counts once per day</p>
<div class="tiles">
<div class="tile"><b>${opens.filter((x) => x.day === today).length}</b>devices today</div>
<div class="tile"><b>${opens.filter((x) => last7.includes(x.day)).length}</b>device-days, last 7 days</div>
<div class="tile"><b>${opens.filter((x) => x.isNew).length}</b>new devices, ${DAYS} days</div>
<div class="tile"><b>${starts.length}</b>exercises started</div>
<div class="tile"><b>${of('bought').length}</b>bought in the app</div>
</div>
<section><h2>Devices per day</h2><div class="chart">${chart}</div></section>
${table('Purchase path', buyRows, 'Compare with the orders in Play Console. "Not bought" shows why: cancelled, failed, unavailable or notfound.')}
${grid('Lock page by category', ['Category', 'Shown', 'Unlock pressed', 'Bought'], lockRows, 'Which locked category made people want to buy.')}
${grid('Categories', ['Category', 'Started', 'Finished', 'Left early', 'Finished of those that can', 'Average result'], catRows, 'Learn and Read/Send Morse have no end; they count as finished when left and are not in the share.')}
${grid('Practice length', ['Practice', 'Started', 'Finished', 'Left early', 'How far, when left'], lenRows, 'Is 30 or 50 questions too long?')}
${grid('Hardest questions', ['Question id', 'Category', 'Answers', 'Wrong'], hard, 'At least 5 answers. Almost everyone wrong = check the wording and the answer key.')}
${table('Questions shared as a picture', count(of('share'), (x) => x.c))}
${table('Ways of studying', count(starts, (x) => (x.f !== '-' ? `${x.m} · ${x.f}` : x.m)))}
${table('Countries (device-days)', count(opens, (x) => x.country.toUpperCase()))}
${table('Phone language (device-days)', count(opens2, (x) => x.lang), 'Decides if a Russian translation is worth it.')}
${table('Coming back (device-days)', count(opens2, (x) => AGE_NAMES[x.age] ?? x.age), 'How long since the device first opened the app.')}
${grid('Channels (?src=)', ['Channel', 'Device-days', 'New devices', 'Bought'], count(opens2, (x) => x.src).map(([s, n]) => [s === '-' ? 'No code' : s, n, opens2.filter((x) => x.src === s && x.isNew).length, of('bought').filter((x) => x.src === s).length]))}
${table('Devices (device-days)', count(opens, (x) => PLATFORM_NAMES[x.p] ?? x.p))}
${table('Buoyage region (device-days)', count(opens2, (x) => x.c))}
${table('Theme (device-days)', count(opens2, (x) => x.m))}
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
