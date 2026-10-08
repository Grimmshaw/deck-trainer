import { useId, useMemo } from 'react'
import { useLight } from '../buoyage/BuoySvg'
import { LIGHT_CSS, parseLight } from '../buoyage/light'
import { islandPath, SKY, wavePath, type Island } from './scenery'

// The picture at the top of the start page: sea, islands and a lighthouse.
// The sky follows the time of day, and from dusk to dawn the lighthouse
// shows its light – Fl(2) 10s.

type Time = 'night' | 'dawn' | 'day' | 'dusk'

function timeOfDay(h: number): Time {
  if (h >= 21 || h < 5) return 'night'
  if (h < 7) return 'dawn'
  if (h < 18) return 'day'
  return 'dusk'
}

const W = 360
const H = 120
const HORIZON = 82

const ISLANDS: Island[] = [
  { x: -20, width: 150, height: 14, profile: [0.5, 0.9, 0.7, 1, 0.6], far: true },
  { x: 120, width: 110, height: 9, profile: [0.6, 1, 0.8, 0.5], far: true },
  { x: 40, width: 90, height: 18, profile: [0.4, 0.8, 1, 0.7], far: false },
]

const LIGHT = parseLight('Fl(2) 10s')

export default function HubScene({ hour = new Date().getHours() }: { hour?: number }) {
  const uid = useId().replace(/:/g, '')
  const time = timeOfDay(hour)
  const dark = time !== 'day'
  const colors = SKY[time === 'night' ? 'night' : time === 'day' ? 'clear' : 'evening']
  const lit = useLight(LIGHT, dark)
  const stars = useMemo(
    () => Array.from({ length: 26 }, (_, i) => ({ x: (i * 137.5) % W, y: 4 + ((i * 53) % 60), r: i % 4 === 0 ? 1.1 : 0.6 })),
    [],
  )

  // Lighthouse on a rock to the right
  const LX = 300
  const towerTop = 34
  const lantern = towerTop - 7

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="hub-scene" role="img" aria-label={`The sea at ${time}, with a lighthouse`}>
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.top} />
          <stop offset="100%" stopColor={colors.bottom} />
        </linearGradient>
        <linearGradient id={`sea-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.seaFar} />
          <stop offset="100%" stopColor={colors.sea} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`}>
          <stop offset="0%" stopColor={LIGHT_CSS.W} stopOpacity="0.9" />
          <stop offset="40%" stopColor={LIGHT_CSS.W} stopOpacity="0.3" />
          <stop offset="100%" stopColor={LIGHT_CSS.W} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`beam-${uid}`} x1="1" x2="0">
          <stop offset="0%" stopColor="#fff6d8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff6d8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={W} height={HORIZON + 1} fill={`url(#sky-${uid})`} />
      {time === 'night' && stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#dfe8ff" opacity={0.7} />)}
      {ISLANDS.map((isl, i) => (
        <path key={i} d={islandPath(isl, HORIZON)} fill={isl.far ? colors.landFar : colors.land} />
      ))}
      <rect y={HORIZON} width={W} height={H - HORIZON} fill={`url(#sea-${uid})`} />
      <path d={wavePath(104, 0.5, W)} fill="none" stroke={colors.wave} strokeWidth="1.4" opacity="0.7" />

      {/* Light beams while the light is on */}
      {dark && lit && <path d={`M${LX} ${lantern} L${LX - 170} ${lantern - 16} L${LX - 170} ${lantern + 14} Z`} fill={`url(#beam-${uid})`} />}

      {/* Rock */}
      <path d={`M${LX - 30} ${HORIZON + 6} Q${LX - 18} ${HORIZON - 10} ${LX - 4} ${HORIZON - 9} Q${LX + 14} ${HORIZON - 12} ${LX + 34} ${HORIZON + 6} Z`} fill={dark ? '#05090f' : '#5f5750'} />
      {/* Tower with red bands */}
      <g opacity={dark ? 0.55 : 1}>
        <path d={`M${LX - 7} ${HORIZON - 8} L${LX - 4.5} ${towerTop} H${LX + 4.5} L${LX + 7} ${HORIZON - 8} Z`} fill={dark ? '#1a2333' : '#f4f2ea'} />
        {[0, 1].map((i) => {
          const y1 = towerTop + 8 + i * 16
          const y2 = y1 + 7
          const half = (y: number) => 4.5 + ((y - towerTop) / (HORIZON - 8 - towerTop)) * 2.5
          return (
            <path
              key={i}
              d={`M${LX - half(y1)} ${y1} H${LX + half(y1)} L${LX + half(y2)} ${y2} H${LX - half(y2)} Z`}
              fill={dark ? '#2a1a1a' : '#c8322b'}
            />
          )
        })}
        <rect x={LX - 7} y={towerTop - 1.5} width="14" height="2" fill={dark ? '#111' : '#333'} />
        <rect x={LX - 3.5} y={lantern - 4} width="7" height="8" fill={dark ? '#111' : '#d9e6ef'} stroke="#333" strokeWidth="0.6" />
        <path d={`M${LX - 4.5} ${lantern - 4} L${LX} ${lantern - 9} L${LX + 4.5} ${lantern - 4} Z`} fill={dark ? '#111' : '#2b2b2b'} />
      </g>
      {dark && lit && (
        <>
          <circle cx={LX} cy={lantern} r="16" fill={`url(#glow-${uid})`} />
          <circle cx={LX} cy={lantern} r="2.4" fill={LIGHT_CSS.W} />
        </>
      )}
      <path d={`M0 ${H - 0.5} H${W}`} stroke="none" />
    </svg>
  )
}
