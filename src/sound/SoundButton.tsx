import { useEffect, useRef, useState } from 'react'
import { playPattern, stop } from './player'
import type { SoundSignal } from './signals'

/** A big play button for a sound signal. Shows progress while playing. */
export default function SoundButton({ signal, autoPlay = false }: { signal: SoundSignal; autoPlay?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const play = () => {
    window.clearTimeout(timer.current)
    const secs = playPattern(signal.pattern, { rapid: signal.rapid, stoppedGap: signal.stoppedGap })
    setPlaying(true)
    timer.current = window.setTimeout(() => setPlaying(false), secs * 1000)
  }

  useEffect(() => {
    // Browsers only allow sound after the user has tapped something;
    // in a quiz the user has always tapped "Next" or "Start" first.
    if (autoPlay) play()
    return () => {
      window.clearTimeout(timer.current)
      stop()
    }
  }, [signal.id])

  return (
    <button className={`sound-button ${playing ? 'playing' : ''}`} onClick={play} aria-label="Play the signal">
      <svg viewBox="0 0 32 32" width="40" height="40" aria-hidden="true">
        <path d="M5 13 H10 L16 8 V24 L10 19 H5 Z" fill="currentColor" />
        <path d="M20 12 q3 4 0 8 M23.5 9 q6 7 0 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <span>{playing ? 'Playing…' : 'Play signal'}</span>
    </button>
  )
}
