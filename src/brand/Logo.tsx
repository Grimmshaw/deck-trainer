import { useId } from 'react'

// The Lanterna logo: a ship's lantern with a bicolour lens – red to port,
// green to starboard – like the sidelights. Drawn on a 512 × 512 grid.

const GOLD = '#ffc83d'
const GOLD_DARK = '#d99a1e'
const NAVY = '#0b1d33'
const GLASS = 'M178 196 C152 252 152 300 178 356 H334 C360 300 360 252 334 196 Z'

export function LanternMark({ size = 64, glow = true }: { size?: number; glow?: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="40 40 432 432" width={size} height={size} role="img" aria-label="Lanterna" className="lantern-mark">
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.5" />
          <stop offset="60%" stopColor={GOLD} stopOpacity="0.1" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`lens-${id}`} x1="0" x2="1">
          <stop offset="0%" stopColor="#c8322b" />
          <stop offset="49.8%" stopColor="#ff5a4f" />
          <stop offset="50.2%" stopColor="#37d67a" />
          <stop offset="100%" stopColor="#1f9b55" />
        </linearGradient>
        <radialGradient id={`hot-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`glass-${id}`}>
          <path d={GLASS} />
        </clipPath>
      </defs>
      {glow && <circle cx="256" cy="276" r="230" fill={`url(#glow-${id})`} />}
      <circle cx="256" cy="74" r="26" fill="none" stroke={GOLD} strokeWidth="15" />
      <rect x="236" y="94" width="40" height="28" rx="6" fill={GOLD} />
      <path d="M170 176 Q256 96 342 176 Z" fill={GOLD} />
      <rect x="152" y="170" width="208" height="30" rx="10" fill={GOLD} />
      <g clipPath={`url(#glass-${id})`}>
        <rect x="140" y="190" width="232" height="176" fill={`url(#lens-${id})`} />
        <ellipse cx="256" cy="276" rx="60" ry="70" fill={`url(#hot-${id})`} />
        {[226, 256, 286, 316].map((y) => (
          <path key={y} d={`M150 ${y} Q256 ${y + 10} 362 ${y}`} fill="none" stroke={NAVY} strokeOpacity="0.22" strokeWidth="7" />
        ))}
      </g>
      <path d={GLASS} fill="none" stroke={GOLD_DARK} strokeWidth="4" />
      <rect x="250" y="196" width="12" height="160" rx="5" fill={GOLD} />
      <rect x="152" y="352" width="208" height="30" rx="10" fill={GOLD} />
      <path d="M178 382 H334 L314 420 H198 Z" fill={GOLD} />
    </svg>
  )
}

/** Splash shown for a moment when the app starts */
export function Splash({ leaving }: { leaving: boolean }) {
  return (
    <div className={`splash ${leaving ? 'leaving' : ''}`} aria-hidden="true">
      <LanternMark size={150} />
    </div>
  )
}
