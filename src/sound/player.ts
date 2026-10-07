import type { Sound } from './signals'

// Plays sound signals with the Web Audio API – no sound files needed.
// The whistle is two slightly detuned low tones; the bell and gong are
// struck tones that fade out.

const SHORT = 1.0 // seconds (Rule 32: about 1 s)
const PROLONGED = 4.5 // seconds (Rule 32: 4–6 s)
const GAP = 1.0
const RAPID_SHORT = 0.45
const RAPID_GAP = 0.25

let ctx: AudioContext | null = null
let stopAll: (() => void) | null = null

function audio(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function whistle(ac: AudioContext, out: AudioNode, start: number, length: number) {
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(0.25, start + 0.06)
  gain.gain.setValueAtTime(0.25, start + length - 0.08)
  gain.gain.linearRampToValueAtTime(0, start + length)
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 900
  gain.connect(filter).connect(out)
  for (const f of [138, 207]) {
    const o = ac.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = f
    o.connect(gain)
    o.start(start)
    o.stop(start + length + 0.05)
  }
}

function strike(ac: AudioContext, out: AudioNode, start: number, base: number, decay: number, level: number) {
  // A bell-like tone: a few inharmonic partials that fade out
  for (const [ratio, amp] of [
    [1, 1],
    [2.76, 0.5],
    [5.4, 0.25],
    [8.93, 0.12],
  ]) {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = 'sine'
    o.frequency.value = base * ratio
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(level * amp, start + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, start + decay)
    o.connect(g).connect(out)
    o.start(start)
    o.stop(start + decay + 0.05)
  }
}

/** Plays a pattern. Returns its length in seconds. */
export function playPattern(pattern: Sound[], opts: { rapid?: boolean; stoppedGap?: boolean } = {}): number {
  stop()
  const ac = audio()
  const master = ac.createGain()
  master.gain.value = 0.9
  master.connect(ac.destination)
  stopAll = () => master.disconnect()

  let t = ac.currentTime + 0.1
  const start = t
  pattern.forEach((s, i) => {
    switch (s) {
      case 'S': {
        const len = opts.rapid ? RAPID_SHORT : SHORT
        whistle(ac, master, t, len)
        t += len + (opts.rapid ? RAPID_GAP : GAP)
        break
      }
      case 'L':
        whistle(ac, master, t, PROLONGED)
        t += PROLONGED + (opts.stoppedGap && i === 0 ? 2 : GAP)
        break
      case 'B':
        // Rapid ringing of the bell for about 5 seconds
        for (let k = 0; k < 30; k++) strike(ac, master, t + k * 0.17, 820, 0.9, 0.18)
        t += 5.6
        break
      case 'b':
        strike(ac, master, t, 820, 1.6, 0.3)
        t += 1.0
        break
      case 'G':
        for (let k = 0; k < 14; k++) strike(ac, master, t + k * 0.35, 190, 2.2, 0.22)
        t += 5.5
        break
    }
  })
  return t - start
}

export function stop() {
  if (stopAll) stopAll()
  stopAll = null
}
