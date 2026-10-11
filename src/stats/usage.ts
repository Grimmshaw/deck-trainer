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

export type UsageEvent = 'open' | 'start' | 'finish'

export interface UsageData {
  category?: string
  mode?: string
  focus?: string
  /** Result in percent, rounded to tens */
  score?: number
}

const OFF_KEY = 'deck.nostats'
const DAY_KEY = 'deck.statsDay'
const SEEN_KEY = 'deck.statsSeen'

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
} catch {
  // ignore
}

function off(): boolean {
  return import.meta.env.DEV || get(OFF_KEY) === '1'
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
  const base = { e: event, p: platform(), v: APP_VERSION }
  if (event === 'open') {
    const today = new Date().toISOString().slice(0, 10)
    if (get(DAY_KEY) === today) return
    set(DAY_KEY, today)
    const isNew = get(SEEN_KEY) === null
    set(SEEN_KEY, '1')
    send({ ...base, n: isNew ? 1 : 0 })
    return
  }
  send({ ...base, c: data.category, m: data.mode, f: data.focus, s: data.score })
}
