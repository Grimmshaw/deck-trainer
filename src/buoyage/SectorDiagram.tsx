import { LIGHT_CSS } from './light'

// A sector light as on the chart: the light on the coast at the top, its
// sectors fanning out to seaward. Seen from seaward (steering towards the
// light, north up), `left` is the sector to the west of the white sector.

interface Props {
  left: 'R' | 'G'
  size?: number
}

const LX = 150
const LY = 34
const R = 196

function wedge(from: number, to: number): string {
  // Angles from straight down (south), positive to the east (screen right)
  const p = (a: number) => {
    const t = (a * Math.PI) / 180
    return `${(LX + R * Math.sin(t)).toFixed(1)},${(LY + R * Math.cos(t)).toFixed(1)}`
  }
  return `M${LX},${LY} L${p(from)} A${R},${R} 0 0 0 ${p(to)} Z`
}

export default function SectorDiagram({ left, size = 300 }: Props) {
  const right = left === 'R' ? 'G' : 'R'
  const sectors: { from: number; to: number; c: 'R' | 'G' | 'W' }[] = [
    { from: -34, to: -5, c: left },
    { from: -5, to: 5, c: 'W' },
    { from: 5, to: 34, c: right },
  ]
  const label = (a: number, c: string) => {
    const t = (a * Math.PI) / 180
    return (
      <text x={LX + 150 * Math.sin(t)} y={LY + 150 * Math.cos(t)} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="800" fill="var(--text)">
        {c}
      </text>
    )
  }
  return (
    <svg viewBox="0 0 300 250" width={size} height={(size * 250) / 300} role="img" aria-label="A sector light on the chart" className="sector-diagram">
      <rect width="300" height="250" fill="#cfe4f5" rx="10" />
      {sectors.map((s) => (
        <path key={s.c} d={wedge(s.to, s.from)} fill={LIGHT_CSS[s.c]} fillOpacity={s.c === 'W' ? 0.75 : 0.45} stroke={s.c === 'W' ? '#b9a978' : LIGHT_CSS[s.c]} />
      ))}
      {sectors.map((s) => label((s.from + s.to) / 2, s.c))}
      {/* Coast with a harbour entrance behind the light */}
      <path d="M0,0 H300 V30 C250,38 205,26 168,30 L162,22 H138 L132,30 C95,26 50,38 0,30 Z" fill="#f2e3b3" stroke="#8a7a50" />
      <circle cx={LX} cy={LY} r="5" fill="#d02020" stroke="#fff" strokeWidth="1.5" />
      <text x={LX + 10} y={LY + 18} fontSize="10" fill="#0b1d33">
        Lt
      </text>
      {/* Compass rose: north up */}
      <g transform="translate(278,62)">
        <polygon points="0,-14 4,0 -4,0" fill="#0b1d33" />
        <text y="12" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0b1d33">
          N
        </text>
      </g>
    </svg>
  )
}
