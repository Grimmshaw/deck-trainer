import { HULLS, type HullType, type ShipLight, type Variant } from './vessels'

// Turns the vessel's 3D model into a 2D picture for a given aspect, and
// decides which lights can be seen from there (COLREG Rule 21 arcs).

export interface Pt3 {
  x: number
  y: number
  z: number
}

/** Bring an angle into the range -180..180 */
export function normDeg(a: number): number {
  let d = ((a % 360) + 360) % 360
  if (d > 180) d -= 360
  return d
}

/**
 * Is the light visible from an observer at relative bearing `deg` from the bow?
 * Rule 21: masthead 225° (to 22.5° abaft the beam each side), sidelights 112.5°
 * each side, sternlight and towing light 135° astern, all-round 360°.
 */
export function isVisible(l: ShipLight, deg: number): boolean {
  const a = normDeg(deg)
  const EPS = 0.01
  switch (l.kind) {
    case 'masthead':
      return Math.abs(a) <= 112.5 + EPS
    case 'sideStbd':
      return a >= -EPS && a <= 112.5 + EPS
    case 'sidePort':
      return a <= EPS && a >= -112.5 - EPS
    case 'stern':
    case 'towing':
      return Math.abs(a) >= 112.5 - EPS
    case 'allRound':
      return true
  }
}

/**
 * Orthographic projection. Returns u = sideways position on the screen
 * (+ = observer's right) and depth (+ = closer to the observer).
 * From right ahead the vessel's starboard side (green) is on your left.
 */
export function project(p: Pt3, deg: number): { u: number; z: number; depth: number } {
  const t = (deg * Math.PI) / 180
  return {
    u: p.x * Math.sin(t) - p.y * Math.cos(t),
    z: p.z,
    depth: p.x * Math.cos(t) + p.y * Math.sin(t),
  }
}

/**
 * A short description of what an observer actually sees: the colours of the
 * visible lights and how they are arranged. Two pictures with the same
 * signature look the same, so they must never both be answer options.
 */
export function nightSignature(v: Variant, deg: number): string {
  const L = HULLS[v.hull].length
  const seen = v.lights
    .filter((l) => isVisible(l, deg))
    .map((l) => ({ c: l.color, col: Math.round((project(l, deg).u / L) * 8), z: l.z }))
  if (seen.length === 0) return 'none'
  const min = Math.min(...seen.map((s) => s.col))
  return seen
    .map((s) => ({ ...s, col: s.col - min }))
    .sort((a, b) => a.col - b.col || b.z - a.z)
    .map((s) => `${s.col}${s.c}`)
    .join(' ')
}

export function daySignature(v: Variant): string {
  return `${v.hull === 'sail' ? 'sail' : 'ship'}:${v.shapes.join(',')}`
}

// ---------- Hull models ----------

export interface Box {
  x: [number, number]
  y: [number, number]
  z: [number, number]
  fill: string
}

export interface HullModel {
  outline: Pt3[]
  hullFill: string
  boxes: Box[]
  masts: [Pt3, Pt3][]
  sails: Pt3[][]
}

function ring(points: [number, number][], z: number): Pt3[] {
  return points.map(([x, y]) => ({ x, y, z }))
}

export const HULL_MODELS: Record<HullType, HullModel> = {
  large: {
    outline: [
      ...ring([[60, 0], [46, 10], [-60, 10], [-60, -10], [46, -10]], 9),
      ...ring([[57, 0], [44, 9.5], [-59, 9.5], [-59, -9.5], [44, -9.5]], 0),
    ],
    hullFill: '#34404c',
    boxes: [
      { x: [-32, 38], y: [-8.5, 8.5], z: [9, 14], fill: '#b5523b' },
      { x: [-58, -36], y: [-9, 9], z: [9, 24], fill: '#e9ecef' },
      { x: [-56, -50], y: [-3, 3], z: [24, 28], fill: '#2a2f35' },
    ],
    masts: [
      [{ x: 40, y: 0, z: 9 }, { x: 40, y: 0, z: 31 }],
      [{ x: -40, y: 0, z: 24 }, { x: -40, y: 0, z: 39 }],
    ],
    sails: [],
  },
  small: {
    outline: [
      ...ring([[17.5, 0], [11, 4], [-17.5, 4], [-17.5, -4], [11, -4]], 3.2),
      ...ring([[16, 0], [10, 3.6], [-17, 3.6], [-17, -3.6], [10, -3.6]], 0),
    ],
    hullFill: '#2c4a6b',
    boxes: [{ x: [-2, 9], y: [-3, 3], z: [3.2, 8.5], fill: '#eef1f4' }],
    masts: [[{ x: 4, y: 0, z: 8.5 }, { x: 4, y: 0, z: 16.6 }]],
    sails: [],
  },
  sail: {
    outline: [
      ...ring([[6.5, 0], [3, 2], [-6, 1.8], [-6, -1.8], [3, -2]], 1.3),
      ...ring([[5.5, 0], [2.5, 1.7], [-5.5, 1.6], [-5.5, -1.6], [2.5, -1.7]], 0),
    ],
    hullFill: '#f2f2f2',
    boxes: [],
    masts: [[{ x: 1, y: 0, z: 1.3 }, { x: 1, y: 0, z: 15.6 }]],
    sails: [
      [{ x: 1, y: 0, z: 2.5 }, { x: 1, y: 0, z: 15 }, { x: -5.5, y: 0, z: 2.5 }],
      [{ x: 1.3, y: 0, z: 14 }, { x: 6.3, y: 0, z: 1.6 }, { x: 1.3, y: 0, z: 2.2 }],
    ],
  },
}

export function boxCorners(b: Box): Pt3[] {
  const out: Pt3[] = []
  for (const x of b.x) for (const y of b.y) for (const z of b.z) out.push({ x, y, z })
  return out
}

/** Convex hull of 2D points (Andrew's monotone chain) */
export function convexHull(pts: [number, number][]): [number, number][] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (p.length < 3) return p
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: [number, number][] = []
  for (const pt of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pt) <= 0) lower.pop()
    lower.push(pt)
  }
  const upper: [number, number][] = []
  for (const pt of [...p].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pt) <= 0) upper.pop()
    upper.push(pt)
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}
