import { useId } from 'react'
import { islandPath, SKY, wavePath } from '../art/scenery'
import { LIGHT_CSS } from '../buoyage/light'
import { boxCorners, convexHull, facesObserver, isVisible, pickLook, project, type Decal, type Pt3 } from './geometry'
import { plainShipScene, type ShipScene } from './scene'
import { HULLS, VESSELS, type DayShape, type Variant } from './vessels'

const W = 300
const H = 200
/** Heights are stretched a little so lights in a vertical line are easy to tell apart */
const VEX = 1.7
/** Colours of the dark vessel shape at night */
const NIGHT_HULL = '#010307'
const NIGHT_EDGE = '#1b2b42'

interface Props {
  variant: Variant
  night?: boolean
  /** At night, show a faint outline of the vessel (off in quizzes) */
  silhouette?: boolean
  scene?: ShipScene
  size?: number
  /** Crop in towards the vessel, for small pictures (1 = whole scene) */
  zoom?: number
}

export default function VesselSvg({ variant, night = false, silhouette = true, scene, size = 300, zoom = 1 }: Props) {
  const uid = useId().replace(/:/g, '')
  const sc = scene ?? plainShipScene(0)
  const spec = HULLS[variant.hull]
  // Which vessel this is decides which looks fit (a tug is never drawn as a trawler)
  const vesselId = VESSELS.find((v) => v.variants.includes(variant))?.id
  const model = pickLook(variant.hull, vesselId, sc.look ?? 0)
  const colors = SKY[night ? 'night' : sc.sky]

  const k = (230 / Math.max(spec.length, 70)) * sc.scale
  const waterY = sc.horizon + (192 - sc.horizon) * (0.3 + 0.7 * sc.scale)
  const toScreen = (p: Pt3): [number, number] => {
    const q = project(p, sc.aspect)
    return [sc.x + q.u * k, waterY - q.z * k * VEX]
  }
  const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const depthOf = (p: Pt3) => project(p, sc.aspect).depth
  const detail = (d: Decal, key: string) =>
    facesObserver(d.normal, sc.aspect) ? <polygon key={key} points={poly(d.pts.map(toScreen))} fill={d.fill} /> : null

  const boxes = [...model.boxes].sort(
    (a, b) =>
      depthOf({ x: (a.x[0] + a.x[1]) / 2, y: 0, z: 0 }) - depthOf({ x: (b.x[0] + b.x[1]) / 2, y: 0, z: 0 }),
  )
  const lights = night ? variant.lights.filter((l) => isVisible(l, sc.aspect)) : []
  const core = Math.max(1.8, 3.1 * sc.scale)
  const glow = 5 + 7 * sc.scale

  // Cropped view box, kept inside the scene. At night it is centred on the
  // visible lights and never crops any of them; by day on the vessel.
  let z = zoom
  let cx = sc.x
  let cy = waterY - (H / zoom) * 0.12
  if (zoom > 1 && night && lights.length > 0) {
    const pts = lights.map((l) => toScreen(l))
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    const bw = Math.max(...xs) - Math.min(...xs)
    const bh = Math.max(...ys) - Math.min(...ys)
    z = Math.max(1, Math.min(zoom, (W * 0.7) / (bw + 1), (H * 0.65) / (bh + 1)))
    cx = (Math.max(...xs) + Math.min(...xs)) / 2
    cy = (Math.max(...ys) + Math.min(...ys)) / 2
  }
  const vbW = W / z
  const vbH = H / z
  const vbX = Math.min(Math.max(cx - vbW / 2, 0), W - vbW)
  const vbY = Math.min(Math.max(cy - vbH / 2, 0), H - vbH)

  return (
    <svg
      viewBox={`${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`}
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
        <filter id={`blur-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={1.3 + 0.9 * sc.scale} />
        </filter>
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

      {night && (
        // At night the vessel is a dark, blurred shape against the sky and the sea:
        // you can sense that something is there, but not see what it is.
        // Sails and masts are only shown in the gallery (silhouette), not in quizzes.
        <g filter={`url(#blur-${uid})`} opacity={silhouette ? 1 : 0.8}>
          <polygon points={poly(convexHull(model.outline.map(toScreen)))} fill={NIGHT_HULL} stroke={NIGHT_EDGE} strokeWidth={0.8} />
          {boxes.map((b, i) => (
            <polygon key={i} points={poly(convexHull(boxCorners(b).map(toScreen)))} fill={NIGHT_HULL} stroke={NIGHT_EDGE} strokeWidth={0.8} />
          ))}
          {silhouette &&
            model.sails.map((sl, i) => <polygon key={i} points={poly(sl.map(toScreen))} fill="#141d2a" />)}
        </g>
      )}

      <g opacity={night ? 0 : 1}>
        <polygon points={poly(convexHull(model.outline.map(toScreen)))} fill={model.hullFill} stroke="#111" strokeOpacity={0.3} />
        {model.bands.map((b, i) => (
          <polygon key={i} points={poly(convexHull(b.outline.map(toScreen)))} fill={b.fill} />
        ))}
        {model.decals.map((d, i) => detail(d, `d${i}`))}
        {boxes.map((b, i) => (
          <g key={i}>
            <polygon points={poly(convexHull(boxCorners(b).map(toScreen)))} fill={b.fill} stroke="#111" strokeOpacity={0.25} />
            {b.details?.map((d, j) => detail(d, `w${j}`))}
          </g>
        ))}
        {model.sails.map((s, i) => (
          <polygon key={i} points={poly(s.map(toScreen))} fill={model.sailFill ?? '#fbfbf8'} stroke="#9aa" strokeWidth={0.8} />
        ))}
        {model.masts.map(([a, b, color], i) => {
          const [x1, y1] = toScreen(a)
          const [x2, y2] = toScreen(b)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color ?? '#333'} strokeWidth={Math.max(1, 1.8 * sc.scale)} />
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
