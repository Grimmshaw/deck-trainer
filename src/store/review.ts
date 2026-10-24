import { load, save } from '../storage'
import { track } from '../stats/usage'
import { PACKAGE, playService } from './entitlement'

// Google Play's own rating box (the In-App Review API), added 24 Oct 2026.
//
// Play shows ratings per country, so the rating box is shown in the app to
// real users after something good has happened:
// - a Test or the Final exam passed (at least PASS_PERCENT), or the
//   India signals exam passed
// - the third finished practice round (and later ones), if it went
//   reasonably well (at least PRACTICE_OK_PERCENT)
// at most once every PAUSE_DAYS, never after a free round, and only in the
// Google Play app. There is no question of our own first – Google's box
// is the only thing the user sees, and Google decides itself if it is shown
// at all (it often is not, and the app never learns if it was).
//
// How it works: the rating box is Android code, which the web page cannot
// call. The Android app (from version code 3) has a small invisible screen,
// ReviewActivity, that opens Google's box and closes itself. The page opens
// it with an intent link (REVIEW_LINK). Older versions of the Android app
// do not have that screen, so the link is only used when the Android app
// has told the page that it is new enough: it starts the page with ?twa=3,
// which is saved on the device (SHELL_KEY) and removed from the address.

/** The first version code of the Android app that has ReviewActivity */
export const SHELL_WITH_REVIEW = 3
export const PASS_PERCENT = 70
export const PRACTICE_OK_PERCENT = 60
export const PRACTICES_BEFORE_ASKING = 3
export const PAUSE_DAYS = 120

const SHELL_KEY = 'deck.shell'
const REVIEW_KEY = 'deck.review'
const DAY = 24 * 60 * 60 * 1000

/** Opens ReviewActivity in the Android app (see android/README.md) */
export const REVIEW_LINK = `intent://review#Intent;scheme=lanterna;package=${PACKAGE};end`

// ---------- Which Android app is this ----------

/** Called once at start: saves ?twa=<version code> from the Android app and removes it from the address */
export function rememberShell(): void {
  try {
    const url = new URL(window.location.href)
    const v = url.searchParams.get('twa')
    if (v === null) return
    if (/^\d{1,4}$/.test(v)) save(SHELL_KEY, { version: Number(v) })
    // Keep the other parts of the address exactly as they were (?nostats stays ?nostats)
    const rest = url.search
      .slice(1)
      .split('&')
      .filter((part) => part && !part.startsWith('twa='))
      .join('&')
    window.history.replaceState(window.history.state, '', url.pathname + (rest ? `?${rest}` : '') + url.hash)
  } catch {
    /* ignore */
  }
}

/** The version code of the Android app, or 0 on the web and in older Android apps */
export function shellVersion(): number {
  return load(SHELL_KEY, { version: 0 }).version
}

// ---------- When to ask ----------

export interface Round {
  /** 'signals' = the India signals exam (points out of 100) */
  mode: 'practice' | 'mistakes' | 'exam' | 'signals'
  /** Right answers (signals exam: points) */
  right: number
  /** Questions in the round (signals exam: 100) */
  count: number
  /** Questions answered (less than count if the round was ended early) */
  answered: number
  /** The free round in a locked category */
  trial?: boolean
}

export interface ReviewState {
  /** Practice rounds finished to the end */
  practices: number
  /** When the rating box was last asked for (ms since 1970), 0 = never */
  lastAsked: number
}

const NEVER: ReviewState = { practices: 0, lastAsked: 0 }

/** Counts the round and says if this is a good moment for the rating box. Pure, so it can be tested. */
export function judgeRound(state: ReviewState, r: Round, now: number): { state: ReviewState; good: boolean } {
  if (r.trial || r.count <= 0) return { state, good: false }
  const pct = (r.right / r.count) * 100
  let next = state
  let good = false
  if (r.mode === 'exam' || r.mode === 'signals') {
    good = pct >= PASS_PERCENT
  } else if (r.answered >= r.count) {
    next = { ...state, practices: state.practices + 1 }
    good = next.practices >= PRACTICES_BEFORE_ASKING && pct >= PRACTICE_OK_PERCENT
  }
  const rested = state.lastAsked === 0 || now - state.lastAsked >= PAUSE_DAYS * DAY
  return { state: next, good: good && rested }
}

let busy = false

/** At the end of a round: counts it, and opens Google Play's rating box if the moment is right */
export async function afterRound(r: Round, category: string): Promise<void> {
  if (busy) return
  busy = true
  try {
    const { state, good } = judgeRound(load(REVIEW_KEY, NEVER), r, Date.now())
    save(REVIEW_KEY, state)
    if (!good || shellVersion() < SHELL_WITH_REVIEW || !(await playService())) return
    save(REVIEW_KEY, { ...state, lastAsked: Date.now() })
    track('review', { category, mode: r.mode })
    // Let the result screen appear first; Google's box opens on top of it
    await new Promise((ok) => setTimeout(ok, 700))
    window.location.assign(REVIEW_LINK)
  } catch {
    /* never in the way of the result screen */
  } finally {
    busy = false
  }
}
