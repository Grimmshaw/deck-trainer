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
  /** Windows and other details on the sides of the box */
  details?: Decal[]
}

/**
 * A flat detail on a surface (a window, an anchor, the name on the stern).
 * It is only drawn when its surface faces the observer.
 */
export interface Decal {
  pts: Pt3[]
  /** Outward direction of the surface in the x/y plane */
  normal: [number, number]
  fill: string
}

export interface HullModel {
  outline: Pt3[]
  hullFill: string
  /** Coloured bands along the hull, e.g. red boot-topping at the waterline */
  bands: { outline: Pt3[]; fill: string }[]
  /** Details on the hull itself (anchors, name on the stern) */
  decals: Decal[]
  boxes: Box[]
  /** Masts, booms, crane jibs and gantries, drawn as lines (dark unless a colour is given) */
  masts: Mast[]
  sails: Pt3[][]
  /** Colour of the sails (white if left out) */
  sailFill?: string
}

export type Mast = [Pt3, Pt3, string?]

/** Is a surface with this outward normal turned towards an observer at relative bearing `deg`? */
export function facesObserver(normal: [number, number], deg: number): boolean {
  const t = (deg * Math.PI) / 180
  return normal[0] * Math.cos(t) + normal[1] * Math.sin(t) > 0.05
}

const pts = (list: [number, number, number][]): Pt3[] => list.map(([x, y, z]) => ({ x, y, z }))

/** The same plan at a new height, a little narrower or wider (hulls flare out towards the deck) */
const lift = (ring: Pt3[], z: number, widen = 1): Pt3[] => ring.map((p) => ({ x: p.x, y: p.y * widen, z }))

const GLASS = '#1d2a36'
const BOOT_TOP = '#a3322b'

/**
 * Rows of windows on all four sides of a box. `spacing` is the distance between
 * window centres in metres and `width` how much of each slot the glass fills.
 */
function windowRows(
  b: { x: [number, number]; y: [number, number] },
  rows: { z: [number, number]; spacing: number; width: number }[],
): Decal[] {
  const e = 0.05 // just outside the face
  const faces: { normal: [number, number]; from: number; to: number; at: (s: number) => [number, number] }[] = [
    { normal: [1, 0], from: b.y[0], to: b.y[1], at: (s) => [b.x[1] + e, s] },
    { normal: [-1, 0], from: b.y[0], to: b.y[1], at: (s) => [b.x[0] - e, s] },
    { normal: [0, 1], from: b.x[0], to: b.x[1], at: (s) => [s, b.y[1] + e] },
    { normal: [0, -1], from: b.x[0], to: b.x[1], at: (s) => [s, b.y[0] - e] },
  ]
  const out: Decal[] = []
  for (const f of faces)
    for (const r of rows) {
      const n = Math.max(1, Math.round((f.to - f.from) / r.spacing))
      const slot = (f.to - f.from) / n
      const w = (slot * r.width) / 2
      for (let i = 0; i < n; i++) {
        const c = f.from + slot * (i + 0.5)
        const [x0, y0] = f.at(c - w)
        const [x1, y1] = f.at(c + w)
        out.push({
          normal: f.normal,
          fill: GLASS,
          pts: pts([[x0, y0, r.z[0]], [x1, y1, r.z[0]], [x1, y1, r.z[1]], [x0, y0, r.z[1]]]),
        })
      }
    }
  return out
}

// ---------- Looks ----------
// Each hull type can be drawn in several looks (a tanker, a bulk carrier, a
// trawler, a ketch ...), chosen at random for each picture so the pictures vary.
// Every look keeps its masts where the lights and day shapes are, so a look
// never changes what the vessel shows. A look with `fits` is only used for
// those vessels (a trawler look is never used for a tug, so the hull does not
// contradict the lights or shapes); a look without `fits` can be any vessel.

export interface Look extends HullModel {
  name: string
  /** Vessel ids this look may be used for. Leave out for a neutral look. */
  fits?: string[]
}

const DARK = '#2a2f35'
const NAME = '#e9ecef'

// Large vessel (120 m): flared hull with a raised bow, boot-topping, anchors,
// accommodation aft with bridge windows and bridge wings, funnel. The aft mast
// stands on the accommodation (x -40) and the forward mast at x 40.
const LARGE_DECK = pts([[61, 0, 11.5], [48, 10, 10.2], [-60, 10, 9.5], [-60, -10, 9.5], [48, -10, 10.2]])
const LARGE_WL = pts([[56, 0, 0], [44, 8.6, 0], [-58, 8.6, 0], [-58, -8.6, 0], [44, -8.6, 0]])
const LARGE_HOUSE = { x: [-58, -36] as [number, number], y: [-9, 9] as [number, number] }

function largeLook(o: {
  name: string
  hull: string
  funnel: string
  cargo: Box[]
  extraMasts?: Mast[]
  boot?: string
}): Look {
  return {
    name: o.name,
    outline: [...LARGE_DECK, ...LARGE_WL],
    hullFill: o.hull,
    bands: [{ outline: [...LARGE_WL, ...lift(LARGE_WL, 1.8, 1.02)], fill: o.boot ?? BOOT_TOP }],
    decals: [
      // Anchors in the hawse pipes, one each side of the bow
      { normal: [0.55, 0.83], fill: '#0f1317', pts: pts([[54.5, 6.7, 8.4], [56.8, 5.3, 8.4], [56.8, 5.3, 6.4], [54.5, 6.7, 6.4]]) },
      { normal: [0.55, -0.83], fill: '#0f1317', pts: pts([[54.5, -6.7, 8.4], [56.8, -5.3, 8.4], [56.8, -5.3, 6.4], [54.5, -6.7, 6.4]]) },
      // Name and port of registry on the stern
      { normal: [-1, 0], fill: NAME, pts: pts([[-60.1, -4.5, 7.4], [-60.1, 4.5, 7.4], [-60.1, 4.5, 6.4], [-60.1, -4.5, 6.4]]) },
      { normal: [-1, 0], fill: NAME, pts: pts([[-60.1, -3, 5.6], [-60.1, 3, 5.6], [-60.1, 3, 4.9], [-60.1, -3, 4.9]]) },
    ],
    boxes: [
      ...o.cargo,
      {
        ...LARGE_HOUSE,
        z: [9, 24],
        fill: '#e9ecef',
        details: windowRows(LARGE_HOUSE, [
          { z: [21.4, 23.1], spacing: 2.6, width: 0.78 },
          { z: [17.4, 18.3], spacing: 3, width: 0.45 },
          { z: [13.6, 14.5], spacing: 3, width: 0.45 },
        ]),
      },
      // Bridge wings, sticking out past the ship's side just below the bridge windows
      { x: [-40, -36.5], y: [-12.5, 12.5], z: [20, 21.2], fill: '#dfe3e7' },
      { x: [-56, -50], y: [-3, 3], z: [24, 29.5], fill: o.funnel },
      { x: [-56, -50], y: [-3, 3], z: [29.5, 31], fill: DARK },
    ],
    masts: [[{ x: 40, y: 0, z: 10 }, { x: 40, y: 0, z: 31 }], [{ x: -40, y: 0, z: 24 }, { x: -40, y: 0, z: 39 }], ...(o.extraMasts ?? [])],
    sails: [],
  }
}

/** Container stacks: bays along the deck, each a few tiers high in mixed colours */
function containerStacks(): Box[] {
  const colors = ['#b5523b', '#2f6f9f', '#d9a441', '#3f7f4f', '#8a8f96', '#7a3b6e', '#c46a2f', '#4d5c8a']
  const bays: [number, number][] = [[-33, -21.5], [-20.5, -9], [-8, 4.5], [5.5, 18], [19, 31.5], [32.5, 37]]
  const tiers = [3, 3, 2, 3, 2, 2]
  const out: Box[] = []
  bays.forEach((x, i) => {
    for (let t = 0; t < tiers[i]; t++) {
      out.push({ x, y: [-8.4, 8.4], z: [10.2 + t * 2.6, 10.2 + (t + 1) * 2.6 - 0.15], fill: colors[(i * 3 + t * 5) % colors.length] })
    }
  })
  return out
}

/** A deck crane: yellow pedestal with the jib resting forward */
function crane(x: number, y = 0, top = 15.5, color = '#e0b030'): { box: Box; jib: Mast } {
  return {
    box: { x: [x - 1.1, x + 1.1], y: [y - 1.1, y + 1.1], z: [10, top], fill: color },
    jib: [{ x, y, z: top - 0.4 }, { x: x + 9, y, z: top + 3.5 }, color],
  }
}

const BULKER_CRANES = [-20, -6, 8, 22].map((x) => crane(x))
const TANKER_CRANE = crane(-2, 6.5, 14.5, '#c9a227')

const LARGE_LOOKS: Look[] = [
  largeLook({
    name: 'general cargo',
    hull: '#34404c',
    funnel: '#d29b2a',
    cargo: [{ x: [-32, 38], y: [-8.5, 8.5], z: [10, 14.5], fill: '#b5523b' }],
  }),
  largeLook({ name: 'container ship', hull: '#1e2a38', funnel: '#2f6f9f', cargo: containerStacks() }),
  largeLook({
    name: 'bulk carrier',
    hull: '#2b3f63',
    funnel: '#b5523b',
    cargo: [
      ...[-27, -13, 1, 15, 29].map((c): Box => ({ x: [c - 5, c + 5], y: [-7, 7], z: [10, 12.2], fill: '#a8432f' })),
      ...BULKER_CRANES.map((c) => c.box),
    ],
    extraMasts: BULKER_CRANES.map((c) => c.jib),
  }),
  largeLook({
    name: 'tanker',
    hull: '#3b2626',
    funnel: '#e9ecef',
    boot: '#1c1c1c',
    cargo: [
      // Pipes and catwalk along the deck, the manifold amidships and a hose crane
      { x: [-34, 52], y: [-1.2, 1.2], z: [10, 11.3], fill: '#8b9096' },
      { x: [-6, 2], y: [-7.5, 7.5], z: [10, 11.6], fill: '#c9a227' },
      { x: [50, 56], y: [-5, 5], z: [10.5, 12.5], fill: '#8b9096' },
      TANKER_CRANE.box,
    ],
    extraMasts: [TANKER_CRANE.jib],
  }),
]

// Large vessel with her bridge forward (ro-ro, ferry, offshore supply vessel).
// Lights (see HULLS.largeFwd): forward masthead light on the bridge mast at x 42,
// sidelights on the bridge wings at x 40, after masthead light on a mast at x -35.
const FWD_BRIDGE = { x: [30, 46] as [number, number], y: [-9, 9] as [number, number] }

function fwdLook(o: {
  name: string
  hull: string
  boot?: string
  /** Everything abaft the bridge: decks, cargo, funnels */
  boxes: Box[]
  /** Where the after mast (x -35) stands */
  aftMastFoot: number
  decals?: Decal[]
}): Look {
  return {
    name: o.name,
    outline: [...LARGE_DECK, ...LARGE_WL],
    hullFill: o.hull,
    bands: [{ outline: [...LARGE_WL, ...lift(LARGE_WL, 1.8, 1.02)], fill: o.boot ?? BOOT_TOP }],
    decals: [
      { normal: [0.55, 0.83], fill: '#0f1317', pts: pts([[54.5, 6.7, 8.4], [56.8, 5.3, 8.4], [56.8, 5.3, 6.4], [54.5, 6.7, 6.4]]) },
      { normal: [0.55, -0.83], fill: '#0f1317', pts: pts([[54.5, -6.7, 8.4], [56.8, -5.3, 8.4], [56.8, -5.3, 6.4], [54.5, -6.7, 6.4]]) },
      { normal: [-1, 0], fill: NAME, pts: pts([[-60.1, -4.5, 7.4], [-60.1, 4.5, 7.4], [-60.1, 4.5, 6.4], [-60.1, -4.5, 6.4]]) },
      ...(o.decals ?? []),
    ],
    boxes: [
      ...o.boxes,
      {
        ...FWD_BRIDGE,
        z: [10, 22],
        fill: '#eef0f2',
        details: windowRows(FWD_BRIDGE, [
          { z: [19.9, 21.5], spacing: 2.4, width: 0.8 },
          { z: [15.8, 16.7], spacing: 3, width: 0.45 },
          { z: [12.6, 13.5], spacing: 3, width: 0.45 },
        ]),
      },
      // Bridge wings carrying the sidelights
      { x: [38, 41.5], y: [-12, 12], z: [18.2, 19], fill: '#dfe3e7' },
    ],
    masts: [
      [{ x: 42, y: 0, z: 22 }, { x: 42, y: 0, z: 38 }],
      [{ x: -35, y: 0, z: o.aftMastFoot }, { x: -35, y: 0, z: 34 }],
    ],
    sails: [],
  }
}

const FWD_LOOKS: Look[] = [
  fwdLook({
    name: 'ro-ro',
    hull: '#1f3b63',
    // The high, closed car and trailer decks, with the stern ramp
    boxes: [
      {
        x: [-58, 30],
        y: [-9.6, 9.6],
        z: [9.5, 21.5],
        fill: '#e3e6e9',
        details: [{ normal: [-1, 0], fill: '#4a4f55', pts: pts([[-58.1, -5, 17.5], [-58.1, 5, 17.5], [-58.1, 5, 9.8], [-58.1, -5, 9.8]]) }],
      },
      { x: [-50, -45], y: [-2.2, 2.2], z: [21.5, 25], fill: '#1e2a38' },
    ],
    aftMastFoot: 21.5,
  }),
  fwdLook({
    name: 'ro-pax ferry',
    hull: '#1e2a38',
    boxes: [
      {
        x: [-52, 30],
        y: [-9.4, 9.4],
        z: [10, 19.5],
        fill: '#eef0f2',
        details: windowRows({ x: [-52, 30], y: [-9.4, 9.4] }, [
          { z: [16.4, 17.7], spacing: 2.2, width: 0.8 },
          { z: [12.8, 13.9], spacing: 2.2, width: 0.8 },
        ]),
      },
      {
        x: [-40, 30],
        y: [-8, 8],
        z: [19.5, 22],
        fill: '#eef0f2',
        details: windowRows({ x: [-40, 30], y: [-8, 8] }, [{ z: [20.2, 21.3], spacing: 2.6, width: 0.6 }]),
      },
      // Lifeboats, orange, hanging outside the ship's side
      ...[-20, -6].flatMap((x): Box[] => [
        { x: [x - 3, x + 3], y: [9.4, 10.8], z: [19.6, 21], fill: '#e46a1c' },
        { x: [x - 3, x + 3], y: [-10.8, -9.4], z: [19.6, 21], fill: '#e46a1c' },
      ]),
      { x: [-30, -23], y: [-3, 3], z: [22, 27.5], fill: '#a3322b' },
      { x: [-30, -23], y: [-3, 3], z: [27.5, 29], fill: DARK },
    ],
    aftMastFoot: 22,
  }),
  fwdLook({
    name: 'offshore supply vessel',
    hull: '#b23a2e',
    boot: '#1c1c1c',
    // A long, open cargo deck abaft the bridge, with some deck cargo and twin funnels
    boxes: [
      { x: [-30, -24], y: [-6.5, -2], z: [10, 12.6], fill: '#2f6f9f' },
      { x: [-18, -6], y: [1.5, 7.5], z: [10, 11.4], fill: '#8b9096' },
      { x: [-4, 2], y: [-7, -2.5], z: [10, 12.6], fill: '#d9a441' },
      { x: [27, 30], y: [-7.5, -5], z: [14, 25], fill: '#eef0f2' },
      { x: [27, 30], y: [5, 7.5], z: [14, 25], fill: '#eef0f2' },
    ],
    aftMastFoot: 10,
  }),
]

// Small vessel (35 m): raised bow, a band along the top of the hull. The mast
// with the masthead light, the signal lights and the day shapes is at x 4.
const SMALL_DECK = pts([[18, 0, 4.4], [11, 4.3, 4.15], [-17.5, 4.3, 3.2], [-17.5, -4.3, 3.2], [11, -4.3, 4.15]])
const SMALL_WL = pts([[16, 0, 0], [10, 3.1, 0], [-17, 3.1, 0], [-17, -3.1, 0], [10, -3.1, 0]])

function smallLook(o: {
  name: string
  fits?: string[]
  hull: string
  /** Band along the top of the hull, and how deep it is */
  sheer: string
  sheerDepth?: number
  boot?: string
  /** The wheelhouse */
  house: { x: [number, number]; y?: [number, number]; z: [number, number]; fill: string }
  /** Where the mast at x 4 stands */
  mastFoot: number
  boxes?: Box[]
  extraMasts?: Mast[]
  decals?: Decal[]
}): Look {
  const d = o.sheerDepth ?? 0.8
  const house = { x: o.house.x, y: o.house.y ?? ([-3, 3] as [number, number]) }
  return {
    name: o.name,
    fits: o.fits,
    outline: [...SMALL_DECK, ...SMALL_WL],
    hullFill: o.hull,
    bands: [
      { outline: [...SMALL_WL, ...lift(SMALL_WL, 0.8, 1.02)], fill: o.boot ?? BOOT_TOP },
      { outline: [...SMALL_DECK, ...SMALL_DECK.map((p) => ({ x: p.x, y: p.y * 0.98, z: p.z - d }))], fill: o.sheer },
    ],
    decals: [
      { normal: [-1, 0], fill: NAME, pts: pts([[-17.6, -2, 2.1], [-17.6, 2, 2.1], [-17.6, 2, 1.5], [-17.6, -2, 1.5]]) },
      ...(o.decals ?? []),
    ],
    boxes: [
      ...(o.boxes ?? []),
      {
        ...house,
        z: o.house.z,
        fill: o.house.fill,
        details: windowRows(house, [{ z: [o.house.z[1] - 2, o.house.z[1] - 0.6], spacing: 2, width: 0.78 }]),
      },
    ],
    masts: [[{ x: 4, y: 0, z: o.mastFoot }, { x: 4, y: 0, z: 16.6 }], ...(o.extraMasts ?? [])],
    sails: [],
  }
}

/** A gantry across the deck at x: two legs and a crossbar */
function gantry(x: number, top: number, half: number, color: string, lean = 0): Mast[] {
  return [
    [{ x, y: -half - 0.3, z: 3.3 }, { x: x + lean, y: -half, z: top }, color],
    [{ x, y: half + 0.3, z: 3.3 }, { x: x + lean, y: half, z: top }, color],
    [{ x: x + lean, y: -half, z: top }, { x: x + lean, y: half, z: top }, color],
  ]
}

const SMALL_LOOKS: Look[] = [
  smallLook({
    name: 'workboat',
    hull: '#2c4a6b',
    sheer: '#e8edf2',
    house: { x: [-2, 9], z: [3.5, 8.5], fill: '#eef1f4' },
    mastFoot: 8.5,
  }),
  smallLook({
    name: 'tug',
    fits: ['power', 'towing', 'towingLong', 'anchor'],
    hull: '#8c2a22',
    boot: '#1c1c1c',
    // Thick black rubber fender all round
    sheer: '#1b1b1b',
    sheerDepth: 1.1,
    house: { x: [-1, 9], z: [3.6, 8.9], fill: '#f0e9d8' },
    mastFoot: 8.9,
    boxes: [{ x: [-7.5, -5.5], y: [-0.8, 0.8], z: [3.4, 5], fill: '#1b1b1b' }],
    extraMasts: gantry(-10, 7.2, 2.6, '#1b1b1b'),
    decals: [{ normal: [1, 0], fill: '#1b1b1b', pts: pts([[18.1, -1.3, 4.4], [18.1, 1.3, 4.4], [18.1, 1.3, 0.8], [18.1, -1.3, 0.8]]) }],
  }),
  smallLook({
    name: 'trawler',
    fits: ['trawling', 'fishing', 'power', 'anchor'],
    hull: '#b23a2e',
    boot: '#1f1f1f',
    sheer: '#e8edf2',
    house: { x: [2, 10], z: [3.9, 8.9], fill: '#f4f4f0' },
    mastFoot: 8.9,
    // Net drum on the after deck and the A-frame over the stern
    boxes: [{ x: [-10, -6], y: [-2.2, 2.2], z: [3.4, 5.8], fill: '#2e5a3a' }],
    extraMasts: gantry(-16.5, 10, 2.2, '#e0b030', 1.5),
  }),
  smallLook({
    name: 'pilot boat',
    fits: ['pilot', 'power', 'anchor'],
    hull: '#1d1f22',
    sheer: '#e46a1c',
    sheerDepth: 1,
    house: { x: [-5, 9], z: [3.6, 8.6], fill: '#f4f4f4' },
    mastFoot: 8.6,
  }),
  smallLook({
    name: 'coaster',
    fits: ['power', 'anchor'],
    hull: '#2f5a3a',
    sheer: '#e8edf2',
    sheerDepth: 0.5,
    // Wheelhouse aft, a long hatch forward of it
    house: { x: [-16.5, -9], z: [3.4, 9.2], fill: '#eef1f4' },
    mastFoot: 5.4,
    boxes: [{ x: [-7.5, 13.5], y: [-3.2, 3.2], z: [3.6, 5.4], fill: '#6b7178' }],
  }),
]

// Sailing vessel (12 m): the sails are sheeted out a little to one side, so that
// they are still seen as sails from right ahead or right astern. The mainmast is at x 1.
const SAIL_DECK = pts([[6.8, 0, 1.6], [3, 2.1, 1.35], [-6, 1.8, 1.3], [-6, -1.8, 1.3], [3, -2.1, 1.35]])
const SAIL_WL = pts([[5.5, 0, 0], [2.5, 1.6, 0], [-5.5, 1.4, 0], [-5.5, -1.4, 0], [2.5, -1.6, 0]])
const SAIL_CABIN = { x: [-2.4, 1.6] as [number, number], y: [-1.15, 1.15] as [number, number] }

function sailLook(o: { name: string; hull: string; boot: string; sails: string; mizzen?: boolean }): Look {
  const masts: Mast[] = [
    [{ x: 1, y: 0, z: 1.3 }, { x: 1, y: 0, z: 15.6 }],
    // Boom, swung out with the mainsail
    [{ x: 1, y: 0, z: 2.5 }, { x: -4.3, y: 3.3, z: 2.5 }],
  ]
  const sails: Pt3[][] = [
    [{ x: 1, y: 0, z: 2.6 }, { x: 1, y: 0, z: 15 }, { x: -4.3, y: 3.3, z: 2.6 }],
    [{ x: 1.3, y: 0, z: 14 }, { x: 6.3, y: 0, z: 1.6 }, { x: 2, y: 2.1, z: 2.2 }],
  ]
  if (o.mizzen) {
    // A ketch: a smaller mast aft with its own sail
    masts.push([{ x: -4.3, y: 0, z: 1.3 }, { x: -4.3, y: 0, z: 9.5 }], [{ x: -4.3, y: 0, z: 2.3 }, { x: -6.6, y: 1.6, z: 2.3 }])
    sails.push([{ x: -4.3, y: 0, z: 2.4 }, { x: -4.3, y: 0, z: 9.1 }, { x: -6.6, y: 1.6, z: 2.4 }])
  }
  return {
    name: o.name,
    outline: [...SAIL_DECK, ...SAIL_WL],
    hullFill: o.hull,
    bands: [{ outline: [...SAIL_WL, ...lift(SAIL_WL, 0.35, 1.03)], fill: o.boot }],
    decals: [],
    boxes: [
      {
        ...SAIL_CABIN,
        z: [1.3, 2.1],
        fill: '#e4e4dc',
        details: windowRows(SAIL_CABIN, [{ z: [1.55, 1.85], spacing: 1.3, width: 0.6 }]),
      },
    ],
    masts,
    sails,
    sailFill: o.sails,
  }
}

const SAIL_LOOKS: Look[] = [
  sailLook({ name: 'sloop', hull: '#f2f2f2', boot: '#1f3b63', sails: '#fbfbf8' }),
  sailLook({ name: 'dark-hulled sloop', hull: '#1f3352', boot: '#e8e8e8', sails: '#f3ead6' }),
  sailLook({ name: 'ketch', hull: '#f2f2f2', boot: '#7a1f1f', sails: '#c98b5a', mizzen: true }),
]

export const HULL_LOOKS: Record<HullType, Look[]> = { large: LARGE_LOOKS, largeFwd: FWD_LOOKS, small: SMALL_LOOKS, sail: SAIL_LOOKS }

/** The first look of each hull, used where the picture should always be the same */
export const HULL_MODELS: Record<HullType, HullModel> = {
  large: LARGE_LOOKS[0],
  largeFwd: FWD_LOOKS[0],
  small: SMALL_LOOKS[0],
  sail: SAIL_LOOKS[0],
}

/** The looks a vessel may be drawn with */
export function looksFor(hull: HullType, vesselId?: string): Look[] {
  return HULL_LOOKS[hull].filter((l) => !l.fits || (vesselId !== undefined && l.fits.includes(vesselId)))
}

/** Picks a look from a random number 0–1 (0 = the first, neutral look) */
export function pickLook(hull: HullType, vesselId: string | undefined, r: number): Look {
  const list = looksFor(hull, vesselId)
  return list[Math.min(list.length - 1, Math.floor(r * list.length))]
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
