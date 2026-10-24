import { channel } from './channels'

// The statistics page (/stats), drawn as plain HTML on the server.
// Everything here is a pure function of the events, so it can be tested
// without Netlify (see src/tests/statsPage.test.ts).

export interface Ev {
  day: string
  /** HHMM in UTC, or "-" (events from before 24 Oct 2026 have no time) */
  t: string
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
  /** The random "device of the day" number, or "-" */
  d: string
}

export interface Answer {
  c: string
  r: number
  w: number
}

export interface StatsInput {
  events: Ev[]
  answers: Map<string, Answer>
  /** The days in the period, oldest first, as YYYY-MM-DD (UTC). The last one is today. */
  days: string[]
  now: Date
  /** The secret key, so the period links keep working */
  key: string
}

export const PERIODS = [7, 30, 90]

/** Exercises that have no natural end: they only send "finish" when left */
const ENDLESS = ['learn', 'decode', 'encode', 'light']

// ---------- Names ----------

const CATEGORY_NAMES: Record<string, string> = {
  morse: 'Morse code',
  buoyage: 'Buoyage (IALA)',
  lights: 'Lights & shapes',
  colregs: 'COLREGs',
  sound: 'Sound signals',
  flags: 'Flags & signals',
  distress: 'Distress signals',
  chart: 'Chart symbols',
  vhf: 'VHF & SMCP',
  exam: 'Final exam',
}
const MODE_NAMES: Record<string, string> = {
  practice: 'Practice',
  test: 'Test',
  learn: 'Learn (flashcards)',
  match: 'Match pairs',
  mistakes: 'My mistakes',
  trial: 'Free round',
  exam: 'Final exam',
  decode: 'Read Morse',
  encode: 'Send Morse',
  light: 'Morse by light',
  india: 'Signals exam (India)',
}
const FOCUS_NAMES: Record<string, string> = {
  alphabet: 'alphabet',
  meaning: 'meanings',
  both: 'mixed',
  lights: 'lights',
  shapes: 'day shapes',
}
const PLATFORM_NAMES: Record<string, string> = {
  play: 'Google Play app',
  ios: 'iPhone / iPad – browser',
  'ios-home': 'iPhone / iPad – home screen',
  android: 'Android – browser',
  'android-home': 'Android – installed web app',
  desktop: 'Computer',
}
const AGE_NAMES: Record<string, string> = { d0: 'First day', w1: 'Day 2–7', m1: 'Day 8–30', old: 'After a month' }
const BUYFAIL_NAMES: Record<string, string> = {
  cancelled: 'Not bought: cancelled',
  failed: 'Not bought: payment failed',
  unavailable: 'Not bought: Play unavailable',
  notfound: 'Not bought: product not found',
}
const THEME_NAMES: Record<string, string> = { auto: 'Follows the phone', light: 'Light', dark: 'Dark' }

const catName = (c: string) => CATEGORY_NAMES[c] ?? (c === '-' ? 'Unknown' : c)
const modeName = (m: string) => MODE_NAMES[m] ?? m

let regionNames: Intl.DisplayNames | null = null
let languageNames: Intl.DisplayNames | null = null
try {
  regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
  languageNames = new Intl.DisplayNames(['en'], { type: 'language' })
} catch {
  // Very old runtime: codes are shown instead
}

/** "ph" → "Philippines" */
export function countryName(code: string): string {
  if (!code || code === '-') return 'Unknown'
  const up = code.toUpperCase()
  try {
    const name = regionNames?.of(up)
    return name && name !== up ? name : up
  } catch {
    return up
  }
}

/** "tl" → "Tagalog" */
export function languageName(code: string): string {
  if (!code || code === '-') return 'Unknown'
  try {
    const name = languageNames?.of(code)
    return name && name !== code ? name : code
  } catch {
    return code
  }
}

/** How a device found Lanterna: the link it came with, or else where it runs */
export function foundVia(x: Ev): { name: string; group: string; code: string } {
  if (x.src && x.src !== '-') return { ...channel(x.src), code: x.src }
  if (x.p === 'play') return { name: 'Google Play', group: 'No link code', code: '' }
  return { name: 'Web, direct', group: 'No link code', code: '' }
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const prettyDay = (d: string) => `${Number(d.slice(8))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`

// ---------- Building blocks ----------

interface Row {
  label: string
  sub?: string
  value: number
  note?: string
}

function count<T>(list: T[], by: (x: T) => string): [string, number][] {
  const m = new Map<string, number>()
  for (const x of list) m.set(by(x), (m.get(by(x)) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : '–')

function avg(list: Ev[]): string {
  const s = list.filter((x) => x.score !== '-').map((x) => Number(x.score))
  return s.length ? `${Math.round(s.reduce((a, b) => a + b, 0) / s.length)} %` : '–'
}

/** A list with a bar per row, for "how many of each" */
function bars(rows: Row[], opts: { limit?: number; empty?: string } = {}): string {
  if (!rows.length) return `<p class="empty">${opts.empty ?? 'Nothing yet'}</p>`
  const limit = opts.limit ?? 10
  const max = Math.max(...rows.map((r) => r.value), 1)
  const shown = rows.slice(0, limit)
  const rest = rows.slice(limit)
  return `<ul class="bars">${shown
    .map(
      (r) =>
        `<li><div class="bl"><span class="name">${esc(r.label)}</span>${r.sub ? `<span class="sub">${esc(r.sub)}</span>` : ''}</div>` +
        `<div class="bv"><span class="track"><span style="width:${Math.max(2, (r.value / max) * 100)}%"></span></span><b>${r.value}</b>${
          r.note ? `<small>${esc(r.note)}</small>` : ''
        }</div></li>`,
    )
    .join('')}</ul>${rest.length ? `<p class="more">+ ${rest.length} more (${rest.reduce((a, r) => a + r.value, 0)})</p>` : ''}`
}

/** A table with a text column first and numbers after */
function table(head: string[], rows: (string | number)[][], opts: { empty?: string; firstHtml?: boolean; text?: number } = {}): string {
  const text = opts.text ?? 1
  if (!rows.length) return `<p class="empty">${opts.empty ?? 'Nothing yet'}</p>`
  return `<div class="tw"><table><thead><tr>${head.map((h, i) => `<th${i >= text ? ' class="n"' : ''}>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map(
      (r) =>
        `<tr>${r
          .map((v, i) => (i === 0 && opts.firstHtml ? `<td>${v}</td>` : `<td${i >= text ? ' class="n"' : ''}>${esc(String(v))}</td>`))
          .join('')}</tr>`,
    )
    .join('')}</tbody></table></div>`
}

function card(title: string, body: string, opts: { span?: number; note?: string; cls?: string } = {}): string {
  return `<section class="card s${opts.span ?? 6}${opts.cls ? ' ' + opts.cls : ''}"><h2>${title}</h2>${
    opts.note ? `<p class="note">${opts.note}</p>` : ''
  }${body}</section>`
}

function kpi(value: string | number, label: string, sub = '', cls = ''): string {
  return `<div class="kpi${cls ? ' ' + cls : ''}"><b>${value}</b><span>${label}</span>${sub ? `<small>${sub}</small>` : ''}</div>`
}

function delta(now: number, before: number): string {
  if (now === before) return `same as yesterday (${before})`
  const d = now - before
  return `<span class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d)}</span> vs yesterday (${before})`
}

/** Name in bold and the group and code in small text, for table cells */
function channelCell(f: { name: string; group: string; code: string }): string {
  return `<span class="name">${esc(f.name)}</span><span class="sub">${esc(f.group)}${f.code ? ` · <code>${esc(f.code)}</code>` : ''}</span>`
}


// ---------- Latest activity and the most active devices today ----------

/** When an event happened, or null if it has no time */
export function eventTime(x: Ev): Date | null {
  if (!/^\d{4}$/.test(x.t)) return null
  return new Date(`${x.day}T${x.t.slice(0, 2)}:${x.t.slice(2)}:00Z`)
}

const swTime = (d: Date) => d.toLocaleTimeString('en-GB', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' })
const swDay = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Europe/Stockholm' })

/** "just now", "4 min ago", "2 h 5 min ago", "yesterday 23:40" */
export function ago(when: Date, now: Date): string {
  const min = Math.max(0, Math.floor((now.getTime() - when.getTime()) / 60000))
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  if (min < 3 * 60) return `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''} ago`
  if (swDay(when) === swDay(now)) return `today ${swTime(when)}`
  if (swDay(when) === swDay(new Date(now.getTime() - 86400000))) return `yesterday ${swTime(when)}`
  return `${prettyDay(swDay(when))} ${swTime(when)}`
}

/** A short line about what happened, for the latest activity */
export function describeEvent(x: Ev): string {
  const what = x.c !== '-' ? catName(x.c) : ''
  const how = x.m !== '-' && x.m !== x.c ? modeName(x.m) : ''
  const both = [what, how].filter(Boolean).join(' · ')
  const score = x.score !== '-' ? ` · ${x.score} %` : ''
  switch (x.e) {
    case 'open':
      return x.isNew ? 'Opened the app for the first time' : 'Opened the app'
    case 'start':
      return `Started ${both || 'an exercise'}`
    case 'finish':
      return `Finished ${both || 'an exercise'}${score}`
    case 'quit':
      return `Left ${both || 'an exercise'}${x.score !== '-' ? ` at ${x.score} %` : ''}`
    case 'lock':
      return `Saw the lock page${what ? ` (${what})` : ''}`
    case 'buy':
      return `Pressed Unlock${what ? ` (${what})` : ''}`
    case 'bought':
      return `★ Bought${what ? ` (${what})` : ''}`
    case 'buyfail':
      return `Purchase not completed${x.m !== '-' ? ` (${x.m})` : ''}`
    case 'getapp':
      return 'Went to Google Play'
    case 'share':
      return `Shared a question${what ? ` (${what})` : ''}`
    default:
      return x.e
  }
}

/** "A", "B" … "Z", "AA" … – the devices of the day in the order they first did something */
function letter(i: number): string {
  let s = ''
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

export interface DeviceDay {
  id: string
  label: string
  events: Ev[]
  started: number
  finished: number
  country: string
  first: Date | null
  last: Date | null
}

/** The devices that sent a device number on `day`, most exercises first */
export function devicesOfDay(events: Ev[], day: string): DeviceDay[] {
  const byId = new Map<string, Ev[]>()
  const timed = events
    .filter((x) => x.day === day && x.d !== '-')
    .sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0))
  for (const x of timed) byId.set(x.d, [...(byId.get(x.d) ?? []), x])
  return [...byId.entries()]
    .map(([id, list], i) => {
      const times = list.map(eventTime).filter((t): t is Date => t !== null)
      return {
        id,
        label: `Device ${letter(i)}`,
        events: list,
        started: list.filter((x) => x.e === 'start').length,
        finished: list.filter((x) => x.e === 'finish').length,
        country: count(list, (x) => x.country)[0][0],
        first: times[0] ?? null,
        last: times[times.length - 1] ?? null,
      }
    })
    .sort((a, b) => b.started - a.started || b.events.length - a.events.length || (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0))
}

// ---------- The page ----------

export function renderStats({ events, answers, days, now, key }: StatsInput): string {
  const period = days.length
  const today = days[days.length - 1]
  const yesterday = days[days.length - 2] ?? ''
  const inPeriod = events.filter((x) => x.day >= days[0])
  const of = (e: string, list = inPeriod) => list.filter((x) => x.e === e)
  const onDay = (list: Ev[], d: string) => list.filter((x) => x.day === d)

  const opens = of('open')
  const starts = of('start')
  const finishes = of('finish')
  const quits = of('quit')
  const bought = of('bought')

  // ----- Latest activity and the most active devices today -----
  const devices = devicesOfDay(inPeriod, today)
  const labelOf = new Map(devices.map((x) => [x.id, x.label]))
  const recent = inPeriod
    .filter((x) => eventTime(x) && (x.day === today || x.day === yesterday))
    .sort((a, b) => eventTime(b)!.getTime() - eventTime(a)!.getTime())
  const latest = recent[0]
  const lastTime = latest ? eventTime(latest)! : null
  const fresh15 = lastTime && now.getTime() - lastTime.getTime() < 15 * 60000
  const live = latest
    ? `<p class="live${fresh15 ? ' on' : ''}"><i></i>Last activity <b>${esc(ago(lastTime!, now))}</b> · ${esc(countryName(latest.country))} · ${esc(describeEvent(latest))}</p>`
    : `<p class="live"><i></i>No activity with a time yet – times are recorded from 24 Oct 2026</p>`

  const activity = recent.length
    ? `<ul class="feed">${recent
        .slice(0, 12)
        .map((x) => {
          const f = foundVia(x)
          const who = labelOf.get(x.d)
          return `<li><time>${esc(ago(eventTime(x)!, now))}</time><div><span class="name">${esc(describeEvent(x))}</span><span class="sub">${esc(
            countryName(x.country),
          )}${who ? ` · ${esc(who)}` : ''} · ${esc(PLATFORM_NAMES[x.p] ?? x.p)}${f.code ? ` · via ${esc(f.name)}` : ''}</span></div></li>`
        })
        .join('')}</ul>`
    : '<p class="empty">Nothing in the last two days with a time</p>'

  const topList = devices.length
    ? `<ol class="top">${devices
        .slice(0, 5)
        .map((x) => {
          const open = x.events.find((y) => y.e === 'open')
          const withSrc = x.events.find((y) => y.src !== '-') ?? x.events[0]
          const f = foundVia(withSrc)
          const since = open ? (open.isNew ? 'new today' : `using it: ${(AGE_NAMES[open.age] ?? '').toLowerCase() || 'returning'}`) : ''
          const cats = count(
            x.events.filter((y) => y.e === 'start'),
            (y) => y.c,
          )
            .slice(0, 3)
            .map(([c, n]) => `${catName(c)}${n > 1 ? ` ×${n}` : ''}`)
            .join(', ')
          const fins = x.events.filter((y) => y.e === 'finish')
          const bought = x.events.some((y) => y.e === 'bought')
          return `<li><div class="who"><span class="name">${esc(x.label)} · ${esc(countryName(x.country))}${bought ? ' <span class="star">★</span>' : ''}</span><span class="sub">${esc(
            PLATFORM_NAMES[x.events[0].p] ?? x.events[0].p,
          )} · via ${esc(f.name)}${f.code ? ` <code>${esc(f.code)}</code>` : ''}${since ? ` · ${esc(since)}` : ''}</span>${
            cats ? `<span class="sub">${esc(cats)}</span>` : ''
          }</div><div class="nums"><b>${x.started}</b><span>${x.started === 1 ? 'exercise' : 'exercises'}</span><small>${x.finished} finished${
            fins.length ? ` · avg ${avg(fins)}` : ''
          }</small><small>${x.first ? `${swTime(x.first)}–${swTime(x.last!)} · last seen ${esc(ago(x.last!, now))}` : ''}</small></div></li>`
        })
        .join('')}</ol>${devices.length > 5 ? `<p class="more">+ ${devices.length - 5} more devices today</p>` : ''}`
    : '<p class="empty">No device with a day number yet today</p>'

  // ----- Today -----
  const tOpens = onDay(opens, today)
  const yOpens = onDay(opens, yesterday)
  const tStarts = onDay(starts, today)
  const tBought = onDay(bought, today)
  const tNew = tOpens.filter((x) => x.isNew).length

  const countryRows = (list: Ev[]): Row[] =>
    count(list, (x) => x.country).map(([c, n]) => {
      const fresh = list.filter((x) => x.country === c && x.isNew).length
      return { label: countryName(c), value: n, note: fresh ? `${fresh} new` : '' }
    })

  const foundRows = (list: Ev[]): Row[] =>
    count(list, (x) => {
      const f = foundVia(x)
      return `${f.name}|${f.group}|${f.code}`
    }).map(([k, n]) => {
      const [name, group, code] = k.split('|')
      const fresh = list.filter((x) => {
        const f = foundVia(x)
        return f.name === name && f.code === code && x.isNew
      }).length
      return { label: name, sub: code ? `${group} · ${code}` : group, value: n, note: fresh ? `${fresh} new` : '' }
    })

  const studiedRows = count(tStarts, (x) => x.c).map(([c, n]) => ({ label: catName(c), value: n }))

  // Who bought: country, how they found Lanterna, and the category where they pressed Unlock
  const buyLine = (x: Ev) => {
    const f = foundVia(x)
    return `<li><b>${esc(countryName(x.country))}</b><span>${esc(catName(x.c))}</span><span>via ${esc(f.name)}${
      f.code ? ` <code>${esc(f.code)}</code>` : ''
    }</span></li>`
  }
  const lastBuy = [...bought].sort((a, b) => (a.day < b.day ? 1 : -1)).find((x) => x.day !== today)
  const banner = tBought.length
    ? `<section class="buy s12"><div class="star">★</div><div><h2>${tBought.length === 1 ? 'A purchase today!' : `${tBought.length} purchases today!`}</h2><ul>${tBought
        .map(buyLine)
        .join('')}</ul><p>Check the order in Play Console → Order management.</p></div></section>`
    : `<section class="nobuy s12">No purchase today${
        lastBuy ? ` · last purchase ${prettyDay(lastBuy.day)} (${esc(countryName(lastBuy.country))})` : ` · none in the last ${period} days`
      }${bought.length ? ` · ${bought.length} in the last ${period} days` : ''}</section>`

  const dayStart = new Date(`${today}T00:00:00Z`).toLocaleTimeString('en-GB', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' })
  const todayCard = `<section class="card s12 today"><h2>Today <span class="muted">· ${prettyDay(today)} · counted in UTC, the day starts at ${dayStart} Swedish time</span></h2>
${live}
<div class="kpis">
${kpi(tOpens.length, 'devices today', delta(tOpens.length, yOpens.length))}
${kpi(tNew, 'new devices', `${tOpens.length - tNew} came back`)}
${kpi(tStarts.length, 'exercises started', `${onDay(finishes, today).length} finished`)}
${kpi(tBought.length, tBought.length === 1 ? 'purchase' : 'purchases', `${onDay(of('lock'), today).length} saw the lock page`, tBought.length ? 'gold' : '')}
</div>
<div class="cols3">
<div><h3>Where they are</h3>${bars(countryRows(tOpens), { limit: 8, empty: 'No devices yet today' })}</div>
<div><h3>How they found Lanterna</h3>${bars(foundRows(tOpens), { limit: 8, empty: 'No devices yet today' })}</div>
<div><h3>What they studied</h3>${bars(studiedRows, { limit: 8, empty: 'No exercises yet today' })}</div>
</div></section>`

  // ----- The period -----
  const fresh = opens.filter((x) => x.isNew).length
  const lockN = of('lock').length
  const periodKpis = `<div class="kpis s12 strip">
${kpi(opens.length, 'device-days', `about ${Math.round(opens.length / period)} a day`)}
${kpi(fresh, 'new devices')}
${kpi(starts.length, 'exercises started', `${finishes.length} finished`)}
${kpi(bought.length, 'bought in the app', lockN ? `${pct(bought.length, lockN)} of lock pages shown` : '', bought.length ? 'gold' : '')}
</div>`

  // Devices per day: new (gold) on top of returning (blue)
  const perDay = days.map((d) => {
    const o = onDay(opens, d)
    const n = o.filter((x) => x.isNew).length
    return { d, all: o.length, fresh: n, back: o.length - n, buys: onDay(bought, d).length }
  })
  const max = Math.max(1, ...perDay.map((x) => x.all))
  const every = period <= 14 ? 1 : period <= 31 ? 3 : 7
  const chart = `<div class="chart">${perDay
    .map(
      (x, i) =>
        `<div class="col${x.d === today ? ' now' : ''}" title="${prettyDay(x.d)}: ${x.all} devices (${x.fresh} new)${x.buys ? `, ${x.buys} bought` : ''}">` +
        `${x.buys ? '<i class="b">★</i>' : ''}<span class="stack" style="height:${(x.all / max) * 100}%"><span class="fresh" style="height:${
          x.all ? (x.fresh / x.all) * 100 : 0
        }%"></span></span><small>${(period - 1 - i) % every === 0 ? Number(x.d.slice(8)) : ''}</small></div>`,
    )
    .join('')}</div><div class="legend"><span><i class="lb"></i>came back</span><span><i class="lg"></i>new</span><span>★ purchase</span><span class="muted">top: ${max}</span></div>`

  // The purchase path, as a funnel
  const steps: Row[] = [
    { label: 'Free rounds started', value: starts.filter((x) => x.m === 'trial').length },
    { label: 'Lock page shown', value: lockN },
    { label: 'Web: went to Google Play', value: of('getapp').length },
    { label: 'Play app: Unlock pressed', value: of('buy').length },
    { label: 'Bought', value: bought.length },
  ]
  const fails = count(of('buyfail'), (x) => x.m).map(([m, n]) => ({ label: BUYFAIL_NAMES[m] ?? `Not bought: ${m}`, value: n }))
  const funnel = bars([...steps, ...fails], { limit: 12 })

  // Channels: every link code, plus devices without one
  const chRows = count(opens, (x) => {
    const f = foundVia(x)
    return `${f.name}|${f.group}|${f.code}`
  }).map(([k, n]) => {
    const [name, group, code] = k.split('|')
    const match = (x: Ev) => {
      const f = foundVia(x)
      return f.name === name && f.code === code
    }
    return [channelCell({ name, group, code }), n, opens.filter((x) => match(x) && x.isNew).length, bought.filter(match).length]
  })

  // Categories
  const cats = [...new Set(starts.map((x) => x.c))]
  const catRows = cats
    .map((c) => {
      const st = starts.filter((x) => x.c === c)
      const fin = finishes.filter((x) => x.c === c && !ENDLESS.includes(x.m))
      const q = quits.filter((x) => x.c === c)
      return [catName(c), st.length, fin.length, q.length, pct(fin.length, fin.length + q.length), avg(fin)] as (string | number)[]
    })
    .sort((a, b) => Number(b[1]) - Number(a[1]))

  const lockRows = count(of('lock'), (x) => x.c).map(([c, n]) => [catName(c), n, of('buy').filter((x) => x.c === c).length, bought.filter((x) => x.c === c).length])

  const lenRows = ['10', '30', '50'].map((k) => {
    const fin = finishes.filter((x) => x.m === 'practice' && x.k === k)
    const q = quits.filter((x) => x.m === 'practice' && x.k === k)
    return [`${k} questions`, starts.filter((x) => x.m === 'practice' && x.k === k).length, fin.length, q.length, avg(q)]
  })

  const hard = [...answers.entries()]
    .filter(([, a]) => a.r + a.w >= 5)
    .sort((a, b) => b[1].w / (b[1].r + b[1].w) - a[1].w / (a[1].r + a[1].w))
    .slice(0, 20)
    .map(([id, a]) => [`<code>${esc(id)}</code>`, a.c === 'exam' ? `Final exam (${catName(id.split(':')[0])})` : catName(a.c), a.r + a.w, pct(a.w, a.r + a.w)])

  const opens2 = opens.filter((x) => x.age !== '-')
  const ways = count(starts, (x) => (x.f !== '-' ? `${modeName(x.m)} · ${FOCUS_NAMES[x.f] ?? x.f}` : modeName(x.m))).map(([l, n]) => ({ label: l, value: n }))
  const simple = (list: Ev[], by: (x: Ev) => string) => count(list, by).map(([l, n]) => ({ label: l, value: n }))

  const periodLinks = PERIODS.map((p) =>
    p === period ? `<b>${p} days</b>` : `<a href="?key=${encodeURIComponent(key)}&days=${p}">${p} days</a>`,
  ).join('')
  const updated = now.toLocaleString('en-GB', { timeZone: 'Europe/Stockholm', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Lanterna – usage</title>
<link rel="icon" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Semi+Condensed:wght@600;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body><main>
<header class="s12"><div class="brand"><img src="/logo.svg" alt=""><div><h1>Lanterna – usage</h1><p>Anonymous · a device counts once per day · updated ${esc(updated)} Swedish time</p></div></div>
<nav>${periodLinks}</nav></header>
${banner}
${todayCard}
${card('Most active today', topList, {
  span: 7,
  note: 'A device gets a new random number every day, so a device can only be followed within one day. Times are Swedish time.',
})}
${card('Latest activity', activity, { span: 5, note: 'Today and yesterday, newest first.' })}
<h2 class="section s12">Last ${period} days</h2>
${periodKpis}
${card('Devices per day', chart, { span: 8 })}
${card('Purchase path', funnel, { span: 4, note: 'Compare with the orders in Play Console.' })}
${card(
  'How they found Lanterna',
  table(['Link / channel', 'Device-days', 'New devices', 'Bought'], chRows, { firstHtml: true }),
  {
    span: 7,
    note: 'The link code only follows a web link (<code>?src=</code>). Installs from a Play link arrive as “Google Play” – see Play Console → Statistics for those (UTM).',
  },
)}
${card('Countries', bars(countryRows(opens), { limit: 14 }), { span: 5, note: 'Device-days, with how many were new.' })}
${card('Categories', table(['Category', 'Started', 'Finished', 'Left early', 'Completed', 'Avg result'], catRows), {
  span: 7,
  note: 'Learn and Read/Send Morse have no end; they are not in “Completed”.',
})}
${card('Lock page by category', table(['Category', 'Shown', 'Unlock pressed', 'Bought'], lockRows), { span: 5, note: 'Which locked category made people want to buy.' })}
${card('Hardest questions', table(['Question', 'Category', 'Answers', 'Wrong'], hard, { firstHtml: true, text: 2, empty: 'No question has 5 answers yet' }), {
  span: 7,
  note: 'At least 5 answers. Almost everyone wrong = check the wording and the answer key.',
})}
${card('Practice length', table(['Practice', 'Started', 'Finished', 'Left early', 'How far, when left'], lenRows), { span: 5, note: 'Is 30 or 50 questions too long?' })}
${card('Ways of studying', bars(ways, { limit: 10 }), { span: 4 })}
${card('Phone language', bars(simple(opens2, (x) => languageName(x.lang)), { limit: 8 }), { span: 4, note: 'Decides if a translation is worth it.' })}
${card('Coming back', bars(simple(opens2, (x) => AGE_NAMES[x.age] ?? x.age)), { span: 4, note: 'Time since the device first opened the app.' })}
${card('Devices', bars(simple(opens, (x) => PLATFORM_NAMES[x.p] ?? x.p)), { span: 4 })}
${card('Buoyage region', bars(simple(opens2, (x) => (x.c === '-' ? 'Unknown' : x.c.toUpperCase()))), { span: 4 })}
${card('Theme', bars(simple(opens2, (x) => THEME_NAMES[x.m] ?? x.m)), { span: 4 })}
${card('Questions shared as a picture', bars(simple(of('share'), (x) => catName(x.c))), { span: 4 })}
<footer class="s12">No IP address, name or cookie is stored · the device number is new every day and removed after 30 days · <code>?nostats</code> on a device stops counting it</footer>
</main></body></html>`
}

const CSS = `
:root{--bg:#081627;--card:#0f2640;--line:#1c3a5c;--text:#e8eef7;--muted:#8ea3bf;--gold:#ffc83d;--blue:#4f8fd6;--green:#4cc38a;--red:#ef6b6b}
*{box-sizing:border-box}
body{margin:0;background:radial-gradient(1200px 500px at 20% -10%,#14365c 0,transparent 60%),var(--bg);color:var(--text);font:15px/1.45 Barlow,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;min-height:100vh}
main{max-width:1280px;margin:0 auto;padding:28px 24px 56px;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px;align-items:start}
.s12{grid-column:span 12}.s8{grid-column:span 8}.s7{grid-column:span 7}.s6{grid-column:span 6}.s5{grid-column:span 5}.s4{grid-column:span 4}
header{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.brand{display:flex;gap:14px;align-items:center}.brand img{width:44px;height:44px}
h1{font:700 1.6rem/1.1 'Barlow Semi Condensed',Barlow,sans-serif;margin:0;letter-spacing:.01em}
header p{margin:2px 0 0;color:var(--muted);font-size:.9rem}
nav{display:flex;gap:4px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px}
nav a,nav b{padding:6px 14px;border-radius:999px;font-size:.9rem;color:var(--muted);text-decoration:none}
nav b{background:var(--gold);color:#1a1300}nav a:hover{color:var(--text)}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 20px;min-width:0}
.card h2,h2.section{font:600 .8rem/1 Barlow,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin:0 0 12px}
h2.section{margin:18px 0 -4px;color:var(--muted)}
.card h2 .muted{letter-spacing:.02em;text-transform:none;font-weight:500}
h3{font-size:.95rem;font-weight:600;margin:0 0 10px;color:var(--text)}
.note{color:var(--muted);font-size:.85rem;margin:-6px 0 12px}
.muted{color:var(--muted)}
code{font:.8em ui-monospace,Consolas,monospace;background:#0a1d33;border:1px solid var(--line);border-radius:5px;padding:0 4px;color:#b9c8dc}
.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.today .kpis{margin-bottom:20px}
.kpi{background:#0b2036;border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.strip .kpi{background:var(--card)}
.kpi b{display:block;font:700 2.4rem/1 'Barlow Semi Condensed',Barlow,sans-serif}
.kpi span{display:block;color:var(--muted);margin-top:4px}
.kpi small{display:block;color:var(--muted);font-size:.8rem;margin-top:6px}
.kpi.gold{background:linear-gradient(135deg,#3b2c06,#2a2005);border-color:#8a6a12}.kpi.gold b{color:var(--gold)}
.up{color:var(--green)}.down{color:var(--red)}
.cols3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.bars{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.bars li{display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,45%);gap:10px;align-items:center}
.bl{min-width:0}.bl .name,.bl .sub{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.name{font-weight:500}.sub{display:block;color:var(--muted);font-size:.78rem}
.bv{display:flex;align-items:center;gap:8px}
.track{flex:1;height:8px;background:#0a1d33;border-radius:99px;overflow:hidden}.track span{display:block;height:100%;background:var(--gold);border-radius:99px}
.bv b{font-variant-numeric:tabular-nums;min-width:2ch;text-align:right}.bv small{color:var(--green);font-size:.75rem;white-space:nowrap}
.more,.empty{color:var(--muted);font-size:.85rem;margin:8px 0 0}
.buy{display:flex;gap:18px;align-items:center;background:linear-gradient(120deg,#ffcf4a,#f2a91d);color:#1d1400;border-radius:16px;padding:18px 24px;box-shadow:0 10px 30px -10px #f2a91d88}
.buy .star{font-size:2.6rem;line-height:1}
.buy h2{margin:0 0 6px;font:700 1.6rem/1.1 'Barlow Semi Condensed',Barlow,sans-serif}
.buy ul{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.buy li{display:flex;gap:14px;flex-wrap:wrap}.buy li span{opacity:.8}
.buy code{background:#ffffff55;border-color:#0002;color:#1d1400}
.buy p{margin:8px 0 0;font-size:.85rem;opacity:.75}
.nobuy{background:var(--card);border:1px dashed var(--line);border-radius:12px;padding:10px 16px;color:var(--muted);font-size:.9rem}
.chart{display:flex;align-items:flex-end;gap:3px;height:200px;padding-top:16px}
.col{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;position:relative;min-width:0}
.stack{width:100%;background:var(--blue);border-radius:4px 4px 0 0;min-height:2px;display:flex;flex-direction:column;overflow:hidden}
.fresh{display:block;width:100%;background:var(--gold)}
.col small{font-size:10px;color:var(--muted);height:14px;margin-top:4px}
.col.now .stack{outline:2px solid #fff6;outline-offset:1px}
.col .b{position:absolute;top:-4px;font-style:normal;color:var(--gold);font-size:12px}
.col:hover .stack{filter:brightness(1.25)}
.legend{display:flex;gap:16px;color:var(--muted);font-size:.8rem;margin-top:8px}
.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}.lb{background:var(--blue)}.lg{background:var(--gold)}
.legend .muted{margin-left:auto}
.tw{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:.92rem}
th{color:var(--muted);font-weight:500;font-size:.8rem;text-align:left;padding:0 8px 8px 0;border-bottom:1px solid var(--line)}
td{padding:8px 8px 8px 0;border-bottom:1px solid #16314f;vertical-align:top}
tr:last-child td{border-bottom:0}
.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.live{display:flex;align-items:center;gap:8px;margin:-4px 0 14px;color:var(--muted);font-size:.9rem}
.live b{color:var(--text)}
.live i{width:9px;height:9px;border-radius:50%;background:var(--muted);flex:none}
.live.on i{background:var(--green);box-shadow:0 0 0 0 #4cc38a88;animation:pulse 2s infinite}
@keyframes pulse{70%{box-shadow:0 0 0 8px #4cc38a00}100%{box-shadow:0 0 0 0 #4cc38a00}}
@media (prefers-reduced-motion:reduce){.live.on i{animation:none}}
.feed{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.feed li{display:grid;grid-template-columns:7.5em minmax(0,1fr);gap:10px;align-items:baseline}
.feed time{color:var(--muted);font-size:.82rem;font-variant-numeric:tabular-nums}
.top{list-style:none;margin:0;padding:0;display:grid;gap:10px;counter-reset:top}
.top li{counter-increment:top;display:grid;grid-template-columns:2em minmax(0,1fr) auto;gap:12px;align-items:start;background:#0b2036;border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.top li::before{content:counter(top);font:700 1.4rem/1 'Barlow Semi Condensed',Barlow,sans-serif;color:var(--gold)}
.top .who{min-width:0}.top .who .sub{margin-top:2px}
.top .star{color:var(--gold)}
.nums{text-align:right;white-space:nowrap}
.nums b{font:700 1.6rem/1 'Barlow Semi Condensed',Barlow,sans-serif;margin-right:4px}
.nums span{color:var(--muted);font-size:.85rem}
.nums small{display:block;color:var(--muted);font-size:.78rem;margin-top:3px}
footer{color:var(--muted);font-size:.8rem;text-align:center;margin-top:12px}
@media (max-width:1000px){.s8,.s7,.s6,.s5{grid-column:span 12}.s4{grid-column:span 6}}
@media (max-width:700px){main{padding:18px 16px 40px;gap:12px}.s4{grid-column:span 12}.kpis,.cols3{grid-template-columns:1fr 1fr}.cols3{gap:18px}.kpi b{font-size:2rem}.buy{flex-direction:column;align-items:flex-start}}
@media (max-width:460px){.cols3{grid-template-columns:1fr}.top li{grid-template-columns:1.6em minmax(0,1fr)}.nums{grid-column:2;text-align:left}.feed li{grid-template-columns:1fr;gap:0}}
`
