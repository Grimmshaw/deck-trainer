import type { Ev } from './statsPage'

// The keys of the usage store (see netlify/functions/usage.mts). All the
// information about an event is in its key:
//   e3/<day>/<time>/<event>/<category>/<mode>/<focus>/<platform>/<country>/<new>/<score>/<lang>/<age>/<src>/<count>/<device>/<random>
// <time> is HHMM in UTC. <device> is the random "device of the day" number
// (src/stats/usage.ts), or "-". Older keys:
//   e2/… (15–24 Oct 2026): no <time> and no <device>
//   e/…  (before 15 Oct 2026): ends after <score>

/** How many days the device number is kept before it is removed from the key */
export const KEEP_DEVICE_DAYS = 30

export function parseKey(key: string): Ev | null {
  const x = key.split('/')
  if (x[0] === 'e3') {
    const [, day, t, e, c, m, f, p, country, n, score, lang, age, src, k, d] = x
    return { day, t, e, c, m, f, p, country, isNew: n === '1', score, lang, age, src, k, d }
  }
  if (x[0] === 'e2') {
    const [, day, e, c, m, f, p, country, n, score, lang, age, src, k] = x
    return { day, t: '-', e, c, m, f, p, country, isNew: n === '1', score, lang, age, src, k, d: '-' }
  }
  if (x[0] === 'e') {
    const [, day, e, c, m, f, p, country, n, score] = x
    return { day, t: '-', e, c, m, f, p, country, isNew: n === '1', score, lang: '-', age: '-', src: '-', k: '-', d: '-' }
  }
  return null
}

/**
 * The same key without the device number, if the event is from before
 * `cutoff` (YYYY-MM-DD) and still has one. Otherwise null: nothing to change.
 */
export function withoutDevice(key: string, cutoff: string): string | null {
  const x = key.split('/')
  if (x[0] !== 'e3' || x.length !== 17) return null
  if (x[1] >= cutoff || x[15] === '-') return null
  x[15] = '-'
  return x.join('/')
}

/** The first day that still keeps the device number, KEEP_DEVICE_DAYS back from `now` */
export function deviceCutoff(now: Date): string {
  return new Date(now.getTime() - KEEP_DEVICE_DAYS * 86400000).toISOString().slice(0, 10)
}
