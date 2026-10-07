import { MORSE } from '../morse'

// Turns a light character as written on a chart, e.g. "Q(6)+LFl 15s" or
// "Fl(2+1) R 10s", into a sequence of on/off periods that can be animated.

export type LightColor = 'W' | 'R' | 'G' | 'Y' | 'Bu'

export interface Segment {
  on: boolean
  ms: number
  color: LightColor
}

export interface Light {
  /** The character as written on a chart */
  label: string
  segments: Segment[]
  periodMs: number
}

// Timings in milliseconds. Quick = 60 flashes/min, very quick = 120 flashes/min
// (IALA: Q 50–60/min, VQ 100–120/min). A long flash is at least 2 s.
const T = {
  flash: 500,
  flashGap: 1000,
  groupGap: 2000,
  long: 2000,
  qOn: 400,
  qOff: 600,
  vqOn: 200,
  vqOff: 300,
  dot: 500,
  dash: 1500,
  morseGap: 500,
}

const COLORS = ['W', 'R', 'G', 'Y'] as const

export function parseLight(label: string): Light {
  const parts = label.trim().split(/\s+/)
  const spec = parts[0]
  let color: LightColor = 'W'
  let periodMs: number | undefined

  for (const p of parts.slice(1)) {
    if (/^\d+(\.\d+)?s$/.test(p)) periodMs = parseFloat(p) * 1000
    else if ((COLORS as readonly string[]).includes(p)) color = p as LightColor
    else throw new Error(`Unknown part "${p}" in light "${label}"`)
  }

  const m = spec.match(/^(VQ|Q|LFl|Fl|Iso|Oc|Mo)(?:\(([^)]+)\))?(\+LFl)?$/)
  if (!m) throw new Error(`Unknown light character "${label}"`)
  const [, type, group, plusLong] = m

  const seq: Segment[] = []
  const on = (ms: number) => seq.push({ on: true, ms, color })
  const off = (ms: number) => seq.push({ on: false, ms, color })

  switch (type) {
    case 'Fl': {
      const groups = group ? group.split('+').map(Number) : [1]
      groups.forEach((n, gi) => {
        for (let i = 0; i < n; i++) {
          on(T.flash)
          if (i < n - 1) off(T.flashGap)
        }
        if (gi < groups.length - 1) off(T.groupGap)
      })
      break
    }
    case 'LFl':
      on(T.long)
      break
    case 'Q':
    case 'VQ': {
      const [onMs, offMs] = type === 'Q' ? [T.qOn, T.qOff] : [T.vqOn, T.vqOff]
      const n = group ? Number(group) : 1
      for (let i = 0; i < n; i++) {
        on(onMs)
        off(offMs)
      }
      if (plusLong) on(T.long)
      // Continuous quick/very quick has no period: one flash cycle repeats
      if (!group && !plusLong && periodMs === undefined) periodMs = onMs + offMs
      break
    }
    case 'Iso': {
      if (!periodMs) throw new Error(`Iso needs a period: "${label}"`)
      on(periodMs / 2)
      off(periodMs / 2)
      break
    }
    case 'Oc': {
      if (!periodMs) throw new Error(`Oc needs a period: "${label}"`)
      on(periodMs * 0.75)
      off(periodMs * 0.25)
      break
    }
    case 'Mo': {
      const code = group ? MORSE[group] : undefined
      if (!code) throw new Error(`Unknown Morse letter in "${label}"`)
      code.split('').forEach((s, i) => {
        if (i > 0) off(T.morseGap)
        on(s === '.' ? T.dot : T.dash)
      })
      break
    }
  }

  const total = seq.reduce((sum, s) => sum + s.ms, 0)
  const period = periodMs ?? total + T.groupGap
  if (total > period + 1) {
    throw new Error(`Light "${label}" does not fit in its period (${total} ms > ${period} ms)`)
  }
  if (period > total) off(period - total)

  return { label, segments: merge(seq), periodMs: period }
}

/** Emergency Wreck Marking Buoy: alternating blue and yellow flashes */
export function alternatingBlueYellow(): Light {
  return {
    label: 'Al.Bu.Y 3s',
    periodMs: 3000,
    segments: [
      { on: true, ms: 1000, color: 'Bu' },
      { on: false, ms: 500, color: 'Bu' },
      { on: true, ms: 1000, color: 'Y' },
      { on: false, ms: 500, color: 'Y' },
    ],
  }
}

/** Joins neighbouring segments with the same state */
function merge(seq: Segment[]): Segment[] {
  const out: Segment[] = []
  for (const s of seq) {
    const last = out[out.length - 1]
    if (last && last.on === s.on && (!s.on || last.color === s.color)) last.ms += s.ms
    else out.push({ ...s })
  }
  return out
}

export const LIGHT_CSS: Record<LightColor, string> = {
  W: '#fff6d6',
  R: '#ff3b30',
  G: '#3ee06a',
  Y: '#ffd60a',
  Bu: '#3d7bff',
}
