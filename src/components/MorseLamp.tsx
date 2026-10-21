import { useEffect, useRef, useState } from 'react'
import { load, save } from '../storage'
import { toMorse } from '../morse'

// Morse by light: a signal lamp flashes the word. Standard timing: a dot is
// one unit, a dash three, one unit dark between the dots and dashes of a
// letter, three between letters. Plays once by itself; "Play again" repeats it.

export const SPEEDS = { slow: 300, normal: 200, fast: 140 } as const
export type Speed = keyof typeof SPEEDS
const SPEED_KEY = 'morse.lightSpeed'
const SPEED_TEXT: Record<Speed, string> = { slow: 'Slow', normal: 'Normal', fast: 'Fast' }

/** On/off steps for a word, in units: [lit, units][] */
export function lampSteps(word: string): [boolean, number][] {
  const out: [boolean, number][] = []
  toMorse(word).forEach((code, i) => {
    if (i > 0) out.push([false, 3])
    code.split('').forEach((s, j) => {
      if (j > 0) out.push([false, 1])
      out.push([true, s === '-' ? 3 : 1])
    })
  })
  return out
}

export function savedSpeed(): Speed {
  const s = load(SPEED_KEY, { speed: 'normal' as Speed }).speed
  return s in SPEEDS ? s : 'normal'
}

interface Props {
  word: string
  onDone?: () => void
  /** Play again and speed buttons (off in the exam simulator: the signal is shown once) */
  controls?: boolean
  /** A fixed speed instead of the saved one */
  speed?: Speed
}

export default function MorseLamp({ word, onDone, controls = true, speed: fixed }: Props) {
  const [chosen, setSpeed] = useState<Speed>(savedSpeed)
  const speed = fixed ?? chosen
  const [lit, setLit] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [run, setRun] = useState(0)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const steps = lampSteps(word)
    const unit = SPEEDS[speed]
    const timers: number[] = []
    // A short dark pause before the first flash, so it isn't missed
    let t = 700
    setPlaying(true)
    setLit(false)
    for (const [on, units] of steps) {
      timers.push(window.setTimeout(() => setLit(on), t))
      t += units * unit
    }
    timers.push(
      window.setTimeout(() => {
        setLit(false)
        setPlaying(false)
        done.current?.()
      }, t),
    )
    return () => timers.forEach((x) => window.clearTimeout(x))
  }, [word, run, speed])

  const changeSpeed = (s: Speed) => {
    setSpeed(s)
    save(SPEED_KEY, { speed: s })
    setRun((r) => r + 1)
  }

  return (
    <div className="morse-lamp">
      <svg viewBox="0 0 200 120" width="260" height="156" role="img" aria-label={lit ? 'Lamp on' : 'Lamp off'}>
        <rect width="200" height="120" rx="12" fill="#030812" />
        <rect y="80" width="200" height="40" fill="#06111f" />
        {/* The lamp on a dark ship's side */}
        <rect x="70" y="72" width="60" height="12" rx="3" fill="#0d1a2b" />
        <circle cx="100" cy="56" r="9" fill="#1b2533" />
        {lit && (
          <>
            <circle cx="100" cy="56" r="40" fill="#fff6d6" opacity="0.16" />
            <circle cx="100" cy="56" r="20" fill="#fff6d6" opacity="0.45" />
            <circle cx="100" cy="56" r="9" fill="#ffffff" />
          </>
        )}
      </svg>
      {controls && (
      <div className="lamp-controls">
        <button type="button" className="secondary" onClick={() => setRun((r) => r + 1)} disabled={playing}>
          {playing ? 'Signalling…' : 'Play again'}
        </button>
        <div className="speed-chips" role="group" aria-label="Speed">
          {(Object.keys(SPEEDS) as Speed[]).map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={speed === s} onClick={() => changeSpeed(s)}>
              {SPEED_TEXT[s]}
            </button>
          ))}
        </div>
      </div>
      )}
      {!controls && <p className="muted small center">{playing ? 'Signalling…' : 'The signal is shown once.'}</p>}
    </div>
  )
}
