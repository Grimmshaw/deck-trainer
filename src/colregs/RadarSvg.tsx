// A simple head-up radar picture: own ship in the centre, range rings,
// heading line, and an echo with its afterglow trail. The trail runs
// straight towards the centre: steady bearing, range closing.

interface Props {
  bearing: number
  /** Range in nautical miles (the display is 6 nm, rings every 2 nm) */
  range: number
  size?: number
}

const SCALE_NM = 6

export default function RadarSvg({ bearing, range, size = 300 }: Props) {
  const R = 140
  const c = 150
  const t = (bearing * Math.PI) / 180
  const at = (nm: number) => {
    const r = (nm / SCALE_NM) * R
    return { x: c + Math.sin(t) * r, y: c - Math.cos(t) * r }
  }
  const echo = at(range)
  const trail = [0.45, 0.9, 1.35].map((d) => at(Math.min(range + d, SCALE_NM - 0.1)))

  return (
    <svg viewBox="0 0 300 300" width={size} height={size} role="img" aria-label={`Radar: echo bearing ${Math.round(bearing)} degrees relative, ${range} miles`} className="radar">
      <defs>
        <radialGradient id="radar-bg">
          <stop offset="0%" stopColor="#0c2a22" />
          <stop offset="100%" stopColor="#06150f" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={R + 6} fill="#030b08" stroke="#1f4d3e" strokeWidth="2" />
      <circle cx={c} cy={c} r={R} fill="url(#radar-bg)" />
      {[1, 2, 3].map((i) => (
        <circle key={i} cx={c} cy={c} r={(R * i) / 3} fill="none" stroke="#1f6b52" strokeWidth="0.8" />
      ))}
      {/* Bearing ticks every 30° */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180
        return (
          <line
            key={i}
            x1={c + Math.sin(a) * (R - 6)}
            y1={c - Math.cos(a) * (R - 6)}
            x2={c + Math.sin(a) * R}
            y2={c - Math.cos(a) * R}
            stroke="#2f8f6d"
          />
        )
      })}
      {/* Beam line, faint */}
      <line x1={c - R} y1={c} x2={c + R} y2={c} stroke="#174a3a" strokeDasharray="3 5" />
      {/* Heading line */}
      <line x1={c} y1={c} x2={c} y2={c - R} stroke="#9ff5d0" strokeWidth="1.2" />
      {/* Afterglow */}
      {trail.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4 - i * 0.6} fill="#5fe0a8" opacity={0.55 - i * 0.15} />
      ))}
      {/* Echo */}
      <ellipse cx={echo.x} cy={echo.y} rx="6" ry="4.5" fill="#b8ffd9" transform={`rotate(${bearing} ${echo.x} ${echo.y})`} />
      {/* Own ship */}
      <circle cx={c} cy={c} r="3.5" fill="#9ff5d0" />
      <text x={c + 4} y={c - (R * 2) / 3 + 11} fontSize="9" fill="#2f8f6d">
        4
      </text>
      <text x={c + 4} y={c - R / 3 + 11} fontSize="9" fill="#2f8f6d">
        2
      </text>
      <text x="10" y="18" fontSize="10" fill="#5fe0a8">
        HEAD UP
      </text>
      <text x="290" y="18" fontSize="10" fill="#5fe0a8" textAnchor="end">
        6 NM
      </text>
    </svg>
  )
}
