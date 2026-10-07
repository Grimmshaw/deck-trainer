import type { Sound } from './signals'

/** Draws a sound pattern: short and prolonged blasts as bars, bell and gong as symbols */
export default function PatternBars({ pattern, size = 'md' }: { pattern: Sound[]; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 10 : 14
  return (
    <span className={`pattern pattern-${size}`} role="img" aria-label={pattern.map(name).join(', ')}>
      {pattern.map((s, i) => {
        if (s === 'S') return <span key={i} className="blast" style={{ width: h * 1.4, height: h }} />
        if (s === 'L') return <span key={i} className="blast" style={{ width: h * 5, height: h }} />
        return (
          <span key={i} className={`bell-mark ${s === 'G' ? 'gong' : ''}`} style={{ fontSize: h }}>
            {s === 'B' ? 'bell ×5 s' : s === 'b' ? 'ding' : 'gong'}
          </span>
        )
      })}
    </span>
  )
}

function name(s: Sound): string {
  return { S: 'short blast', L: 'prolonged blast', B: 'rapid ringing of the bell', b: 'one stroke of the bell', G: 'gong' }[s]
}
