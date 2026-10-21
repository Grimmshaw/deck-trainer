import { LIGHT_CSS } from '../buoyage/light'

// A power-driven vessel seen from above, bow up, with the arcs of her lights
// (COLREG Rule 21) and optionally where the observer is.

export type ArcLight = 'masthead' | 'stbd' | 'port' | 'stern'

/** Start and end of each arc, as relative bearings from the bow (clockwise) */
export const ARCS: Record<ArcLight, [number, number]> = {
  masthead: [-112.5, 112.5],
  stbd: [0, 112.5],
  port: [-112.5, 0],
  stern: [112.5, 247.5],
}

const S = 240
const C = S / 2

/** Point at relative bearing `deg` (clockwise from the bow, which points up) and radius r */
function at(deg: number, r: number): [number, number] {
  const t = (deg * Math.PI) / 180
  return [C + r * Math.sin(t), C - r * Math.cos(t)]
}

function wedge([from, to]: [number, number], r: number): string {
  const [x1, y1] = at(from, r)
  const [x2, y2] = at(to, r)
  const large = to - from > 180 ? 1 : 0
  return `M${C},${C} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`
}

interface Props {
  /** Show every arc in its colour, with the angles */
  arcs?: boolean
  /** Shade one arc, in a neutral colour (for "which light shows over this arc?") */
  highlight?: ArcLight
  /** Relative bearing of the observer from the vessel's bow */
  observer?: number
  size?: number
}

export default function ArcDiagram({ arcs, highlight, observer, size = 240 }: Props) {
  const mastSide = observer !== undefined && observer < 0 ? 90 : -90
  const hull = 'M120,78 C129,92 131,104 131,118 L130,160 L110,160 L109,118 C109,104 111,92 120,78 Z'
  const label = (deg: number, r: number, text: string, fill: string) => {
    const [x, y] = at(deg, r)
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill={fill}>
        {text}
      </text>
    )
  }
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width={size} height={size} role="img" aria-label="A vessel seen from above, bow up" className="arc-diagram">
      <circle cx={C} cy={C} r={108} fill="none" stroke="var(--line)" strokeDasharray="3 4" />
      {arcs && (
        <>
          {/* White lights are drawn in a neutral grey, so they show on both light and dark backgrounds */}
          <path d={wedge(ARCS.masthead, 104)} fill="var(--muted)" fillOpacity={0.18} stroke="var(--muted)" strokeOpacity={0.7} />
          <path d={wedge(ARCS.stern, 74)} fill="var(--muted)" fillOpacity={0.35} stroke="var(--muted)" />
          <path d={wedge(ARCS.stbd, 74)} fill={LIGHT_CSS.G} fillOpacity={0.4} stroke={LIGHT_CSS.G} />
          <path d={wedge(ARCS.port, 74)} fill={LIGHT_CSS.R} fillOpacity={0.4} stroke={LIGHT_CSS.R} />
          {/* In the masthead light's band, on the beam away from the observer */}
          {label(mastSide, 89, 'Masthead', 'var(--text)')}
          {(() => {
            const [x, y] = at(mastSide, 89)
            return (
              <text x={x} y={y + 13} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="var(--text)">
                225°
              </text>
            )
          })()}
          {label(56, 60, '112.5°', 'var(--text)')}
          {label(-56, 60, '112.5°', 'var(--text)')}
          {label(180, 60, '135°', 'var(--text)')}
        </>
      )}
      {highlight && (
        <path d={wedge(ARCS[highlight], 100)} fill="var(--signal)" fillOpacity={0.35} stroke="var(--signal)" strokeWidth={2} />
      )}
      {/* Lines through the beam and 22.5° abaft the beam */}
      {[112.5, -112.5].map((d) => {
        const [x, y] = at(d, 108)
        return <line key={d} x1={C} y1={C} x2={x} y2={y} stroke="var(--muted)" strokeOpacity={0.5} strokeDasharray="2 3" />
      })}
      <path d={hull} fill="var(--surface-2)" stroke="var(--text)" strokeWidth={1.5} />
      <line x1={C} y1={70} x2={C} y2={62} stroke="var(--text)" strokeWidth={1.5} />
      <polygon points={`${C - 4},64 ${C + 4},64 ${C},56`} fill="var(--text)" />
      {observer !== undefined &&
        (() => {
          const [x, y] = at(observer, 112)
          const [lx, ly] = at(observer, 112 - 14)
          return (
            <g>
              <line x1={C} y1={C} x2={lx} y2={ly} stroke="var(--signal)" strokeWidth={1.5} strokeDasharray="4 3" />
              <circle cx={x} cy={y} r={8} fill="var(--signal)" stroke="var(--bg)" strokeWidth={2} />
              <text
                x={x + (x < C ? 12 : -12)}
                y={y + (y < C ? 4 : -4)}
                textAnchor={x < C ? 'start' : 'end'}
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="700"
                fill="var(--signal)"
              >
                You
              </text>
            </g>
          )
        })()}
    </svg>
  )
}
