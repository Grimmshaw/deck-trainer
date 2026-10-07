import { useId } from 'react'
import { islandPath, SKY, wavePath } from '../art/scenery'
import { LIGHT_CSS } from '../buoyage/light'
import { boxCorners, convexHull, HULL_MODELS, isVisible, project, type Pt3 } from './geometry'
import { plainShipScene, type ShipScene } from './scene'
import { HULLS, type DayShape, type Variant } from './vessels'

const W = 300
const H = 200
/** Heights are stretched a little so lights in a vertical line are easy to tell apart */
const VEX = 1.7

interface Props {
  variant: Variant
  night?: boolean
  /** At night, show a faint outline of the vessel (off in quizzes) */
  silhouette?: boolean
  scene?: ShipScene
  size?: number
}

export default function VesselSvg({ variant, night = false, silhouette = true, scene, size = 300 }: Props) {
  const uid = useId().replace(/:/g, '')
  const sc = scene ?? plainShipScene(0)
  const spec = HULLS[variant.hull]
  const model = HULL_MODELS[variant.hull]
  const colors = SKY[night ? 'night' : sc.sky]

  const k = (230 / Math.max(spec.length, 70)) * sc.scale
  const waterY = sc.horizon + (192 - sc.horizon) * (0.3 + 0.7 * sc.scale)
  const toScreen = (p: Pt3): [number, number] => {
    const q = project(p, sc.aspect)
    return [sc.x + q.u * k, waterY - q.z * k * VEX]
  }
  const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const depthOf = (p: Pt3) => project(p, sc.aspect).depth

  const hullOpacity = !night ? 1 : silhouette ? 0.14 : 0
  const boxes = [...model.boxes].sort(
    (a, b) =>
      depthOf({ x: (a.x[0] + a.x[1]) / 2, y: 0, z: 0 }) - depthOf({ x: (b.x[0] + b.x[1]) / 2, y: 0, z: 0 }),
  )
  const lights = night ? variant.lights.filter((l) => isVisible(l, sc.aspect)) : []
  const core = Math.max(1.8, 3.1 * sc.scale)
  const glow = 5 + 7 * sc.scale

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={size}
      height={(size * H) / W}
      role="img"
      aria-label={night ? 'Lights of a vessel at night' : 'A vessel by day'}
      className="vessel-svg"
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.top} />
          <stop offset="100%" stopColor={colors.bottom} />
        </linearGradient>
        <linearGradient id={`sea-${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1={sc.horizon} x2="0" y2={H}>
          <stop offset="0%" stopColor={colors.seaFar} />
          <stop offset="100%" stopColor={colors.sea} />
        </linearGradient>
      </defs>

      <rect width={W} height={sc.horizon + 1} fill={`url(#sky-${uid})`} />
      {sc.islands.map((isl, i) => (
        <path key={i} d={islandPath(isl, sc.horizon)} fill={isl.far ? colors.landFar : colors.land} />
      ))}
      <rect y={sc.horizon} width={W} height={H - sc.horizon} fill={`url(#sea-${uid})`} />

      <g opacity={hullOpacity}>
        <polygon points={poly(convexHull(model.outline.map(toScreen)))} fill={model.hullFill} stroke="#111" strokeOpacity={0.3} />
        {boxes.map((b, i) => (
          <polygon key={i} points={poly(convexHull(boxCorners(b).map(toScreen)))} fill={b.fill} stroke="#111" strokeOpacity={0.25} />
        ))}
        {model.sails.map((s, i) => (
          <polygon key={i} points={poly(s.map(toScreen))} fill="#fbfbf8" stroke="#9aa" strokeWidth={0.8} />
        ))}
        {model.masts.map(([a, b], i) => {
          const [x1, y1] = toScreen(a)
          const [x2, y2] = toScreen(b)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeWidth={Math.max(1, 1.8 * sc.scale)} />
        })}
        {!night &&
          variant.shapes.map((s, i) => {
            // Day shapes are drawn about twice life size and stacked down from the top of the hoist
            const size = Math.max(7, spec.shapeSize * k * VEX * 2.2)
            const [cx, top] = toScreen({ x: spec.shapeX, y: 0, z: spec.shapeTop })
            return <ShapeMark key={i} kind={s} cx={cx} cy={top + size * 0.6 + i * size * 1.3} size={size} />
          })}
      </g>

      {lights.map((l, i) => {
        const [x, y] = toScreen(l)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={glow} fill={LIGHT_CSS[l.color]} opacity={0.14} />
            <circle cx={x} cy={y} r={glow * 0.55} fill={LIGHT_CSS[l.color]} opacity={0.3} />
            <circle cx={x} cy={y} r={core} fill={LIGHT_CSS[l.color]} />
          </g>
        )
      })}

      {/* Sea in front of the hull */}
      <rect y={waterY} width={W} height={H - waterY} fill={`url(#sea-${uid})`} />
      <path d={wavePath(waterY, sc.scale, W)} fill="none" stroke={colors.wave} strokeWidth={1 + 1.5 * sc.scale} />
    </svg>
  )
}

/** A black day shape centred on (cx, cy) */
function ShapeMark({ kind, cx, cy, size }: { kind: DayShape; cx: number; cy: number; size: number }) {
  const h = size / 2
  switch (kind) {
    case 'ball':
      return <circle cx={cx} cy={cy} r={h} fill="#111" />
    case 'coneUp':
      return <polygon points={`${cx - h},${cy + h} ${cx + h},${cy + h} ${cx},${cy - h}`} fill="#111" />
    case 'coneDown':
      return <polygon points={`${cx - h},${cy - h} ${cx + h},${cy - h} ${cx},${cy + h}`} fill="#111" />
    case 'diamond':
      return <polygon points={`${cx},${cy - size * 0.7} ${cx + h},${cy} ${cx},${cy + size * 0.7} ${cx - h},${cy}`} fill="#111" />
    case 'cylinder':
      return <rect x={cx - h * 0.8} y={cy - size * 0.8} width={h * 1.6} height={size * 1.6} fill="#111" />
  }
}
