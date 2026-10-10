import { useEffect, useId, useState } from 'react'
import { LIGHT_CSS, type Light, type LightColor } from './light'
import type { BodyShape, Mark, Paint, Topmark } from './marks'
import { islandPath, SKY, wavePath } from '../art/scenery'
import { plainScene, type Scene } from './scene'

const PAINT: Record<Paint, string> = {
  red: '#d62828',
  green: '#1f9d55',
  black: '#1c1c1c',
  yellow: '#f5c400',
  white: '#f2f2f2',
  blue: '#1f5fd1',
}

// The picture is 200 x 300. The mark itself is drawn in its own coordinates
// (centre x = 100, waterline y = 255) and then moved and scaled into the scene.
const W = 200
const H = 300
const WATER = 255
const CX = 100

interface Zone {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

interface ShapeGeo {
  d: string
  top: number
  xMin: number
  xMax: number
  /** Width of the body where it meets the water (0 = stands on a rock) */
  waterWidth: number
  /** Where horizontal bands end. Defaults to the waterline. */
  paintBottom?: number
  /**
   * Parts of the body that are round on their own, e.g. the narrow tower and the wide
   * float of a pillar buoy. Used for vertical stripes and for the shading.
   */
  zones?: Zone[]
  /** Height of a dark rubbing band (fender) around the float */
  fender?: number
  /** Open lattice tower (pillar buoys) */
  lattice?: boolean
}

const SHAPES: Record<BodyShape, ShapeGeo> = {
  // A can on a wider float
  can: {
    d: 'M68 186 H132 V236 H140 Q146 236 146 243 V266 H54 V243 Q54 236 60 236 H68 Z',
    top: 186,
    xMin: 54,
    xMax: 146,
    waterWidth: 92,
    zones: [
      { xMin: 68, xMax: 132, yMin: 0, yMax: 236 },
      { xMin: 54, xMax: 146, yMin: 236, yMax: H },
    ],
    fender: 243,
  },
  cone: { d: 'M62 266 L138 266 L106 178 L94 178 Z', top: 178, xMin: 62, xMax: 138, waterWidth: 68 },
  sphere: {
    d: 'M54 214 A46 46 0 1 1 146 214 A46 46 0 1 1 54 214 Z',
    top: 168,
    xMin: 54,
    xMax: 146,
    waterWidth: 42,
  },
  // A big round float with an open lattice tower on top
  pillar: {
    d: 'M52 266 L52 239 Q52 220 72 219 L84 219 L89 128 L111 128 L116 219 L128 219 Q148 220 148 239 L148 266 Z',
    top: 128,
    xMin: 52,
    xMax: 148,
    waterWidth: 96,
    zones: [
      { xMin: 84, xMax: 116, yMin: 0, yMax: 219 },
      { xMin: 52, xMax: 148, yMin: 219, yMax: H },
    ],
    fender: 232,
    lattice: true,
  },
  spar: { d: 'M89 266 L111 266 L106 104 L94 104 Z', top: 104, xMin: 89, xMax: 111, waterWidth: 21 },
  beacon: { d: 'M89 232 L111 232 L107 118 L93 118 Z', top: 118, xMin: 89, xMax: 111, waterWidth: 0, paintBottom: 229 },
}

/** Rock that a fixed beacon stands on */
const ROCK = 'M24 270 L36 250 L54 236 L74 228 L96 224 L118 226 L138 233 L158 245 L176 270 Z'
const ROCK_FACE = 'M54 236 L74 228 L96 224 L104 252 L62 258 Z'

/** Current state of a flashing light */
export function useLight(light: Light | undefined, running: boolean): LightColor | null {
  const [lit, setLit] = useState<LightColor | null>(null)

  useEffect(() => {
    if (!light || !running) {
      setLit(null)
      return
    }
    let i = 0
    let timer: number
    const step = () => {
      const seg = light.segments[i]
      setLit(seg.on ? seg.color : null)
      timer = window.setTimeout(step, seg.ms)
      i = (i + 1) % light.segments.length
    }
    // Small random start delay so buoys in a list don't flash in sync
    timer = window.setTimeout(step, Math.random() * 800)
    return () => window.clearTimeout(timer)
  }, [light, running])

  return lit
}

interface Props {
  mark: Mark
  light?: Light
  night?: boolean
  /** At night, show a faint outline of the mark (off in quizzes: you only see the light) */
  silhouette?: boolean
  /** Shape, distance and background. Defaults to the plain gallery look. */
  scene?: Scene
  size?: number
}

/** Colours of the dark shape of a mark at night */
const NIGHT_SHAPE = '#010307'
const NIGHT_EDGE = '#1b2b42'

export default function BuoySvg({ mark, light, night = false, silhouette = true, scene, size = 160 }: Props) {
  const uid = useId().replace(/:/g, '')
  const sc = scene ?? plainScene(mark)
  const geo = SHAPES[sc.shape]
  const lit = useLight(light ?? mark.lights[0], night)
  const hull = night ? 0 : 1
  const nightBody = sc.shape === 'beacon' ? geo : SHAPES.pillar
  const colors = SKY[night ? 'night' : sc.sky]

  const lanternY = geo.top - 12
  const topmarkBase = geo.top - 24
  const topmarkTop = topmarkBase - 44

  // Further away = smaller and closer to the horizon
  const waterY = sc.horizon + (258 - sc.horizon) * (0.3 + 0.7 * sc.scale)
  const place = `translate(${sc.x} ${waterY}) scale(${sc.scale}) rotate(${sc.tilt}) translate(${-CX} ${-WATER})`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={size}
      height={(size * H) / W}
      role="img"
      aria-label={night ? 'A light at night' : mark.name}
      className="buoy-svg"
    >
      <defs>
        <clipPath id={`body-${uid}`}>
          <path d={geo.d} />
        </clipPath>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.top} />
          <stop offset="100%" stopColor={colors.bottom} />
        </linearGradient>
        <linearGradient id={`sea-${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1={sc.horizon} x2="0" y2={H}>
          <stop offset="0%" stopColor={colors.seaFar} />
          <stop offset="100%" stopColor={colors.sea} />
        </linearGradient>
        <filter id={`blur-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={2.2 + 1.6 * sc.scale} />
        </filter>
        <linearGradient id={`shade-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.3" />
          <stop offset="24%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="48%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.34" />
        </linearGradient>
        <radialGradient id={`glow-${uid}`}>
          <stop offset="0%" stopColor={lit ? LIGHT_CSS[lit] : 'transparent'} stopOpacity="0.95" />
          <stop offset="35%" stopColor={lit ? LIGHT_CSS[lit] : 'transparent'} stopOpacity="0.45" />
          <stop offset="100%" stopColor={lit ? LIGHT_CSS[lit] : 'transparent'} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky, islands and sea behind the mark */}
      <rect width={W} height={sc.horizon + 1} fill={`url(#sky-${uid})`} />
      {sc.islands.map((isl, i) => (
        <path key={i} d={islandPath(isl, sc.horizon)} fill={isl.far ? colors.landFar : colors.land} />
      ))}
      <rect y={sc.horizon} width={W} height={H - sc.horizon} fill={`url(#sea-${uid})`} />

      <g transform={place}>
        {night && (
          // At night the mark is only a dark, blurred shape: you can sense it is there,
          // but not its colours, topmark or exact shape (a generic buoy outline is used,
          // so a can or a cone does not give the answer away).
          <g filter={`url(#blur-${uid})`} opacity={silhouette ? 1 : 0.85}>
            <rect
              x={CX - 3}
              y={Math.min(lanternY, nightBody.top)}
              width={6}
              height={Math.abs(nightBody.top - lanternY) + 4}
              fill={NIGHT_SHAPE}
            />
            <path d={nightBody.d} fill={NIGHT_SHAPE} stroke={NIGHT_EDGE} strokeWidth="1.5" />
            {sc.shape === 'beacon' && <path d={ROCK} fill={NIGHT_SHAPE} stroke={NIGHT_EDGE} strokeWidth="1.5" />}
          </g>
        )}
        <g opacity={hull}>
          {/* Mast */}
          <rect x={CX - 2} y={topmarkBase - 2} width={4} height={geo.top - topmarkBase + 4} fill="#333" />

          {/* Body with paint */}
          <g clipPath={`url(#body-${uid})`}>
            <Paintwork mark={mark} geo={geo} />
            {geo.lattice && <Lattice />}
            {geo.fender && <rect x={0} y={geo.fender - 1.5} width={W} height={3} fill="#000" opacity={0.4} />}
            {/* Shading that makes the body look round */}
            {(geo.zones ?? [{ xMin: geo.xMin, xMax: geo.xMax, yMin: 0, yMax: H }]).map((z, i) => (
              <rect key={i} x={z.xMin} y={z.yMin} width={z.xMax - z.xMin} height={z.yMax - z.yMin} fill={`url(#shade-${uid})`} />
            ))}
          </g>
          <path d={geo.d} fill="none" stroke="#111" strokeOpacity="0.35" strokeWidth="1.5" />
          {geo.lattice && (
            // Platform with a railing round the lantern
            <g stroke="#3b3b3b" strokeWidth={1.6}>
              <line x1={82} y1={127} x2={118} y2={127} strokeWidth={3.5} />
              <line x1={83} y1={127} x2={83} y2={117} />
              <line x1={117} y1={127} x2={117} y2={117} />
              <line x1={83} y1={118} x2={117} y2={118} />
            </g>
          )}
          {sc.shape === 'beacon' && (
            <>
              <path d={ROCK} fill={night ? '#111' : '#5f5750'} />
              <path d={ROCK_FACE} fill={night ? '#161616' : '#7a7068'} />
            </>
          )}

          {/* Lantern housing */}
          <rect x={CX - 6} y={lanternY - 7} width={12} height={14} rx={3} fill="#555" />

          {/* Topmark */}
          <g transform={`translate(${CX} ${topmarkBase}) scale(1.4) translate(${-CX} ${-topmarkBase})`}>
            <TopmarkShape kind={mark.topmark} color={PAINT[mark.topmarkColor]} base={topmarkBase} top={topmarkTop} />
          </g>
        </g>

        {/* The light */}
        {lit && (
          <>
            <circle cx={CX} cy={lanternY} r={46} fill={`url(#glow-${uid})`} />
            <circle cx={CX} cy={lanternY} r={6} fill={LIGHT_CSS[lit]} />
          </>
        )}
      </g>

      {/* Sea in front of the mark hides the part below the waterline */}
      <rect y={waterY} width={W} height={H - waterY} fill={`url(#sea-${uid})`} />
      {!night && geo.waterWidth > 0 && (
        // A floating mark sits in the water: a dark shadow and a ring of foam round it
        <>
          <ellipse cx={sc.x} cy={waterY + 4 * sc.scale} rx={(geo.waterWidth / 2 + 4) * sc.scale} ry={4 * sc.scale} fill="#06213a" opacity={0.3} />
          <ellipse cx={sc.x} cy={waterY + 0.5} rx={(geo.waterWidth / 2 + 7) * sc.scale} ry={2.2 * sc.scale + 0.8} fill="#fff" opacity={0.65} />
        </>
      )}
      <path
        d={wavePath(waterY, sc.scale, W)}
        fill="none"
        stroke={colors.wave}
        strokeWidth={1 + 2 * sc.scale}
        opacity={sc.shape === 'beacon' ? 0.7 : 1}
      />
    </svg>
  )
}

function Paintwork({ mark, geo }: { mark: Mark; geo: ShapeGeo }) {
  const colors = mark.paint.colors.map((c) => PAINT[c])
  if (mark.paint.pattern === 'bands') {
    // Equal horizontal bands between the top of the body and the waterline (or rock)
    const bottom = geo.paintBottom ?? WATER
    const h = (bottom - geo.top) / colors.length
    return (
      <>
        {colors.map((c, i) => (
          <rect
            key={i}
            x={0}
            y={geo.top + i * h}
            width={W}
            height={i === colors.length - 1 ? H : h + 0.5}
            fill={c}
          />
        ))}
      </>
    )
  }
  const zones = geo.zones ?? [{ xMin: geo.xMin, xMax: geo.xMax, yMin: 0, yMax: H }]
  return (
    <>
      {zones.map((z, zi) => {
        const w = (z.xMax - z.xMin) / colors.length
        return colors.map((c, i) => (
          <rect key={`${zi}-${i}`} x={z.xMin + i * w} y={z.yMin} width={w + 0.5} height={z.yMax - z.yMin} fill={c} />
        ))
      })}
    </>
  )
}

/** Cross-bracing of the open tower on a pillar buoy (its edges run from x 84/116 at y 219 to 89/111 at y 128) */
function Lattice() {
  const levels = [219, 189, 158, 128]
  const xl = (y: number) => 89 - (5 * (y - 128)) / 91
  const xr = (y: number) => 111 + (5 * (y - 128)) / 91
  return (
    <g stroke="#000" strokeOpacity={0.32} strokeWidth={1.6}>
      {levels.map((y) => (
        <line key={`h${y}`} x1={xl(y)} y1={y} x2={xr(y)} y2={y} />
      ))}
      {levels.slice(1).map((y, i) => {
        const y0 = levels[i]
        return (
          <g key={`x${y}`}>
            <line x1={xl(y0)} y1={y0} x2={xr(y)} y2={y} />
            <line x1={xr(y0)} y1={y0} x2={xl(y)} y2={y} />
          </g>
        )
      })}
    </g>
  )
}

/** A cone with its base at baseY and its point at tipY */
function cone(baseY: number, tipY: number, half = 12) {
  return `M${CX - half} ${baseY} L${CX + half} ${baseY} L${CX} ${tipY} Z`
}

function TopmarkShape({ kind, color, base, top }: { kind: Topmark; color: string; base: number; top: number }) {
  const mid = (base + top) / 2
  const lower = (tip: boolean) => (tip ? cone(base, mid + 3) : cone(mid + 3, base)) // point up : point down
  const upper = (tip: boolean) => (tip ? cone(mid - 3, top) : cone(top, mid - 3))
  switch (kind) {
    case 'can':
      return <rect x={CX - 11} y={base - 24} width={22} height={24} fill={color} />
    case 'cone':
      return <path d={cone(base, base - 24, 13)} fill={color} />
    case 'sphere':
      return <circle cx={CX} cy={base - 12} r={12} fill={color} />
    case 'conesUp':
      return <path d={`${upper(true)} ${lower(true)}`} fill={color} />
    case 'conesDown':
      return <path d={`${upper(false)} ${lower(false)}`} fill={color} />
    case 'conesBase': // east: base to base
      return <path d={`${upper(true)} ${lower(false)}`} fill={color} />
    case 'conesPoint': // west: point to point
      return <path d={`${upper(false)} ${lower(true)}`} fill={color} />
    case 'spheres2':
      return (
        <>
          <circle cx={CX} cy={base - 10} r={10} fill={color} />
          <circle cx={CX} cy={base - 33} r={10} fill={color} />
        </>
      )
    case 'x':
      return (
        <g stroke={color} strokeWidth={6} strokeLinecap="square">
          <line x1={CX - 11} y1={base - 26} x2={CX + 11} y2={base - 2} />
          <line x1={CX + 11} y1={base - 26} x2={CX - 11} y2={base - 2} />
        </g>
      )
    case 'cross':
      return (
        <g stroke={color} strokeWidth={6}>
          <line x1={CX} y1={base - 30} x2={CX} y2={base} />
          <line x1={CX - 12} y1={base - 17} x2={CX + 12} y2={base - 17} />
        </g>
      )
  }
}
