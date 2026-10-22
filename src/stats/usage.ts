import { APP_VERSION } from '../report/report'

// Anonymous usage statistics, so we can see if and how the app is used.
//
// What is sent: what happened ("open", "start", "finish"), the category and
// mode, roughly which kind of device (Play app, iPhone, Android, computer) and
// the app version. The server adds the country. Nothing else: no id, no
// cookie, no IP address is stored, and nothing that could identify a person.
//
// "open" is sent at most once a day per device, so the number of opens per day
// is the number of devices that used the app that day.
//
// Visit the app once with ?nostats in the address to stop counting on that
// device (for your own phones and computers). ?stats turns it back on.
//
// Added 15 Oct 2026 (still anonymous – no id, no IP, no fingerprint):
// - the phone's language (just "en", "ru", "tl" …)
// - how long since the app was first opened on this device, only as an
//   interval: first day / first week / first month / older
// - the channel the device first came from, if the link had ?src=… (for
//   example app.lanternakonsult.se/?src=fb-ph)
// - "quit" when an exercise is left before the end, with how far it got
// - the purchase path: lock page shown, Buy pressed, bought, purchase failed
// - at the end of an exercise, which questions were answered right or wrong
//   (only the question ids, to find unclear questions)

export type UsageEvent = 'open' | 'start' | 'finish' | 'quit' | 'lock' | 'buy' | 'bought' | 'buyfail' | 'getapp' | 'share'

export interface UsageData {
  category?: string
  mode?: string
  focus?: string
  /** Result in percent, rounded to tens (for "quit": how far it got) */
  score?: number
  /** A count: the number of questions in a practice, or words or cards done */
  count?: number
  /** "open" only: buoyage region and light/dark theme */
  region?: string
  theme?: string
}

const OFF_KEY = 'deck.nostats'
const DAY_KEY = 'deck.statsDay'
const SEEN_KEY = 'deck.statsSeen'
const FIRST_KEY = 'deck.statsFirst'
const SRC_KEY = 'deck.statsSrc'

function get(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function set(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Private mode or storage blocked: nothing to remember
  }
}

// ?nostats / ?stats in the address turns counting off or on for this device
try {
  const q = new URLSearchParams(window.location.search)
  if (q.has('nostats')) set(OFF_KEY, '1')
  if (q.has('stats')) set(OFF_KEY, null)
  // The first channel a device came from is kept (later links don't change it)
  const src = (q.get('src') ?? '').toLowerCase()
  if (/^[a-z0-9-]{1,24}$/.test(src) && !get(SRC_KEY)) set(SRC_KEY, src)
} catch {
  // ignore
}

/** A browser driven by a program (link scanners, test robots) is never counted */
function automated(): boolean {
  try {
    return navigator.webdriver === true || /bot|crawl|spider|headless|lighthouse|facebookexternalhit/i.test(navigator.userAgent)
  } catch {
    return false
  }
}

function off(): boolean {
  return import.meta.env.DEV || get(OFF_KEY) === '1' || automated()
}

// Nothing is sent until a person has touched the screen, clicked or pressed a
// key. Link scanners only load the page, so they never count as a device.
// (Added 22 Oct 2026 – Facebook's scanners showed up as new devices in the USA.)
let human = false
const waiting: (() => void)[] = []
function whenHuman(fn: () => void) {
  if (human) fn()
  else waiting.push(fn)
}
try {
  const mark = () => {
    if (human) return
    human = true
    for (const t of ['pointerdown', 'keydown', 'touchstart'] as const) window.removeEventListener(t, mark, true)
    waiting.splice(0).forEach((fn) => fn())
  }
  for (const t of ['pointerdown', 'keydown', 'touchstart'] as const) window.addEventListener(t, mark, { capture: true, passive: true })
} catch {
  human = true
}

/** Which kind of device, very roughly */
function platform(): string {
  const ua = navigator.userAgent
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches
  if (document.referrer.startsWith('android-app://')) return 'play'
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return standalone ? 'ios-home' : 'ios'
  if (/Android/.test(ua)) return standalone ? 'android-home' : 'android'
  return 'desktop'
}

/** The phone's language, just the main part: "en", "ru", "tl" */
function language(): string {
  const l = (navigator.language || '').toLowerCase().split('-')[0]
  return /^[a-z]{2,3}$/.test(l) ? l : '-'
}

/** Only an interval since the first open on this device: d0 = first day, w1 = first week, m1 = first month, old */
function age(): string {
  const today = new Date().toISOString().slice(0, 10)
  const first = get(FIRST_KEY)
  if (!first) {
    set(FIRST_KEY, today)
    return 'd0'
  }
  const days = Math.round((Date.parse(today) - Date.parse(first)) / 86400000)
  return days < 1 ? 'd0' : days <= 7 ? 'w1' : days <= 30 ? 'm1' : 'old'
}

function send(body: Record<string, unknown>) {
  const json = JSON.stringify(body)
  try {
    if (navigator.sendBeacon?.('/api/usage', new Blob([json], { type: 'application/json' }))) return
  } catch {
    // fall back to fetch
  }
  fetch('/api/usage', { method: 'POST', body: json, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
}

export function track(event: UsageEvent, data: UsageData = {}) {
  if (off()) return
  const base = { e: event, p: platform(), v: APP_VERSION, l: language(), src: get(SRC_KEY) ?? undefined }
  if (event === 'open') {
    const today = new Date().toISOString().slice(0, 10)
    if (get(DAY_KEY) === today) return
    whenHuman(() => {
      if (get(DAY_KEY) === today) return
      set(DAY_KEY, today)
      const isNew = get(SEEN_KEY) === null
      set(SEEN_KEY, '1')
      send({ ...base, n: isNew ? 1 : 0, a: age(), c: data.region, m: data.theme })
    })
    return
  }
  whenHuman(() => send({ ...base, c: data.category, m: data.mode, f: data.focus, s: data.score, k: data.count }))
}

/**
 * Which questions were answered right or wrong in one exercise (only the
 * question ids). The statistics page lists the questions almost everyone
 * gets wrong: often an unclear question or a wrong answer key.
 */
export function trackAnswers(category: string, answers: [key: string, right: boolean][]) {
  if (off() || answers.length === 0) return
  whenHuman(() => send({ e: 'ans', c: category, a: answers.slice(0, 60).map(([k, ok]) => [k, ok ? 1 : 0]) }))
}
