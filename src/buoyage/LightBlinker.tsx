import { useEffect, useState } from 'react'
import { useLight } from './BuoySvg'
import { LIGHT_CSS, type Light } from './light'

/** A light flashing in the dark, with a stopwatch so the period can be timed */
export default function LightBlinker({ light }: { light: Light }) {
  const lit = useLight(light, true)
  const [start] = useState(() => Date.now())
  const [now, setNow] = useState(start)
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(t)
  }, [])
  const secs = ((now - start) / 1000).toFixed(1)
  return (
    <div className="light-blinker">
      <svg viewBox="0 0 200 120" width="260" height="156" role="img" aria-label="A flashing light">
        <rect width="200" height="120" rx="12" fill="#030812" />
        <rect y="78" width="200" height="42" fill="#06111f" />
        {lit && (
          <>
            <circle cx="100" cy="60" r="34" fill={LIGHT_CSS[lit]} opacity="0.18" />
            <circle cx="100" cy="60" r="16" fill={LIGHT_CSS[lit]} opacity="0.45" />
            <circle cx="100" cy="60" r="7" fill={LIGHT_CSS[lit]} />
          </>
        )}
      </svg>
      <span className="stopwatch" aria-label="Stopwatch">
        ⏱ {secs} s
      </span>
    </div>
  )
}
