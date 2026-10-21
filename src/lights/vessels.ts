// Navigation lights and day shapes (COLREG Part C, Rules 21–30) as data.
// Every picture and every generated question comes from this file.
//
// Positions are in metres in the vessel's own frame:
//   x = forward from midships, y = towards starboard, z = height above the waterline.
// Heights are schematic (lights in a vertical line are spaced so they are easy to see).

export type LightKind = 'masthead' | 'sideStbd' | 'sidePort' | 'stern' | 'towing' | 'allRound'
export type ShipLightColor = 'W' | 'R' | 'G' | 'Y'
/** 'flagA' is the rigid replica of code flag A (Rule 27(e), small vessels diving) */
export type DayShape = 'ball' | 'diamond' | 'cylinder' | 'coneUp' | 'coneDown' | 'flagA'
/** 'largeFwd' is a large vessel with her bridge forward (ro-ro, ferry, supply vessel); 'boat' is an 8 m motorboat */
export type HullType = 'large' | 'largeFwd' | 'small' | 'sail' | 'boat'

export interface ShipLight {
  kind: LightKind
  color: ShipLightColor
  x: number
  y: number
  z: number
  /** A flashing light (the yellow light of an air-cushion vessel) */
  flash?: boolean
}

export interface Variant {
  /** For example "making way" or "not making way" */
  label: string
  hull: HullType
  lights: ShipLight[]
  /** Day shapes from top to bottom */
  shapes: DayShape[]
  /**
   * Where each shape hangs, when they are not in one vertical line (mine
   * clearance: one at the masthead and one at each yardarm). Top of the shape.
   */
  shapeAt?: { x: number; y: number; z: number }[]
}

export interface Vessel {
  id: string
  name: string
  rule: string
  description: string
  variants: Variant[]
  /** Shown only by day: at night it looks exactly like another vessel */
  dayOnly?: boolean
  /** For a day-only vessel: what she looks like at night (shown in the gallery) */
  nightLooksLike?: string
  /** Not used in "What is wrong?" (her signals are not one vertical line) */
  noFix?: boolean
  /**
   * Only show her from these aspects in questions. Shapes and lights at the
   * ends of a yard line up behind each other from the side, so a mine clearance
   * vessel or a dredger is only asked about from ahead or astern.
   */
  aspects?: number[]
}

// ---------- Where things go on each hull ----------

export interface HullSpec {
  length: number
  mastheadFwd: Pos
  mastheadAft?: Pos
  sides: { x: number; y: number; z: number }
  stern: Pos
  /** Top of the vertical line of all-round signal lights, and the spacing */
  signalX: number
  signalTop: number
  signalStep: number
  anchorFwd: Pos
  anchorAft?: Pos
  /** Where day shapes hang (top of the hoist) and their size. Shapes are drawn larger than life so they are easy to see. */
  shapeX: number
  shapeTop: number
  shapeSize: number
}

type Pos = { x: number; z: number }

export const HULLS: Record<HullType, HullSpec> = {
  large: {
    length: 120,
    mastheadFwd: { x: 40, z: 17 },
    mastheadAft: { x: -40, z: 38 },
    sides: { x: -30, y: 10, z: 16 },
    stern: { x: -60, z: 10 },
    signalX: -40,
    signalTop: 33.5,
    signalStep: 4.5,
    anchorFwd: { x: 57, z: 14 },
    anchorAft: { x: -59, z: 11 },
    shapeX: 40,
    shapeTop: 31,
    shapeSize: 2.6,
  },
  // Bridge forward (COLREG Annex I): the forward masthead light is on the mast on
  // top of the bridge, no more than a quarter of the length from the stem. The
  // after masthead light is at least half the length further aft and at least
  // 4.5 m higher. The sidelights are on the bridge wings, not forward of the
  // forward masthead light, and no higher than 3/4 of its height.
  largeFwd: {
    length: 120,
    mastheadFwd: { x: 42, z: 26 },
    mastheadAft: { x: -35, z: 33 },
    sides: { x: 40, y: 11, z: 19.4 },
    stern: { x: -60, z: 10 },
    signalX: -35,
    signalTop: 28.5,
    signalStep: 4.5,
    anchorFwd: { x: 57, z: 14 },
    anchorAft: { x: -59, z: 11 },
    shapeX: 42,
    shapeTop: 37,
    shapeSize: 2.6,
  },
  small: {
    length: 35,
    mastheadFwd: { x: 4, z: 13.5 },
    sides: { x: 7, y: 3.5, z: 5.5 },
    stern: { x: -17, z: 4 },
    signalX: 4,
    signalTop: 13.5,
    signalStep: 2.8,
    anchorFwd: { x: 16, z: 6 },
    shapeX: 4,
    shapeTop: 16.6,
    shapeSize: 1.5,
  },
  // An 8 m motorboat. The short mast with the all-round light is at x 1.
  boat: {
    length: 8,
    mastheadFwd: { x: 1, z: 3.6 },
    sides: { x: 2.2, y: 0.95, z: 1.35 },
    stern: { x: -3.8, z: 1.1 },
    signalX: 1,
    signalTop: 3.6,
    signalStep: 0.75,
    anchorFwd: { x: 1, z: 3.6 },
    shapeX: 1,
    shapeTop: 4.2,
    shapeSize: 0.55,
  },
  sail: {
    length: 12,
    mastheadFwd: { x: 1, z: 10 },
    sides: { x: 5, y: 1.4, z: 1.6 },
    stern: { x: -6, z: 1.4 },
    signalX: 1,
    signalTop: 15,
    signalStep: 2.2,
    anchorFwd: { x: 5.5, z: 6 },
    shapeX: 3,
    shapeTop: 11.5,
    shapeSize: 1.3,
  },
}

// ---------- Helpers that build the lights for a hull ----------

const light = (kind: LightKind, color: ShipLightColor, x: number, z: number, y = 0): ShipLight => ({
  kind,
  color,
  x,
  y,
  z,
})

/** Masthead light(s): one forward, plus the aft one on hulls that have it (50 m or more) */
function masthead(h: HullType): ShipLight[] {
  const s = HULLS[h]
  const out = [light('masthead', 'W', s.mastheadFwd.x, s.mastheadFwd.z)]
  if (s.mastheadAft) out.push(light('masthead', 'W', s.mastheadAft.x, s.mastheadAft.z))
  return out
}

function sidelightsAndStern(h: HullType): ShipLight[] {
  const s = HULLS[h]
  return [
    light('sideStbd', 'G', s.sides.x, s.sides.z, s.sides.y),
    light('sidePort', 'R', s.sides.x, s.sides.z, -s.sides.y),
    light('stern', 'W', s.stern.x, s.stern.z),
  ]
}

/** All-round lights in a vertical line, top to bottom */
function signals(h: HullType, colors: ShipLightColor[], top = HULLS[h].signalTop): ShipLight[] {
  const s = HULLS[h]
  return colors.map((c, i) => light('allRound', c, s.signalX, top - i * s.signalStep))
}

function anchorLights(h: HullType): ShipLight[] {
  const s = HULLS[h]
  const out = [light('allRound', 'W', s.anchorFwd.x, s.anchorFwd.z)]
  if (s.anchorAft) out.push(light('allRound', 'W', s.anchorAft.x, s.anchorAft.z))
  return out
}

/** Masthead lights in a vertical line at the forward mast (towing) */
function towingMasthead(h: HullType, count: number): ShipLight[] {
  const s = HULLS[h]
  return Array.from({ length: count }, (_, i) => light('masthead', 'W', s.mastheadFwd.x, s.mastheadFwd.z - i * s.signalStep))
}

function towingLight(h: HullType): ShipLight {
  const s = HULLS[h]
  return light('towing', 'Y', s.stern.x, s.stern.z + s.signalStep)
}

/** The same variants for a large vessel with her bridge aft and one with her bridge forward */
function large(make: (h: HullType) => Variant[]): Variant[] {
  return [...make('large'), ...make('largeFwd')]
}

// ---------- The vessels ----------

export const VESSELS: Vessel[] = [
  {
    id: 'power50',
    name: 'Power-driven vessel, 50 m or more',
    rule: 'Rule 23(a)',
    description: 'Two masthead lights (the aft one higher), sidelights and a sternlight.',
    variants: large((h) => [{ label: 'underway', hull: h, lights: [...masthead(h), ...sidelightsAndStern(h)], shapes: [] }]),
  },
  {
    id: 'power',
    name: 'Power-driven vessel, less than 50 m',
    rule: 'Rule 23(a)',
    description: 'One masthead light, sidelights and a sternlight. A second masthead light is optional.',
    variants: [{ label: 'underway', hull: 'small', lights: [...masthead('small'), ...sidelightsAndStern('small')], shapes: [] }],
  },
  {
    id: 'sailing',
    name: 'Sailing vessel underway',
    rule: 'Rule 25',
    description:
      'Sidelights and a sternlight only. Under 20 m they may be combined in one tricolour lantern at the top of the mast. She may also show all-round red over green at the top of the mast (never with the tricolour).',
    variants: [
      { label: 'underway', hull: 'sail', lights: sidelightsAndStern('sail'), shapes: [] },
      {
        label: 'underway, with a tricolour lantern',
        hull: 'sail',
        // Rule 25(b): sidelights and sternlight combined in one lantern at the masthead
        lights: [light('sideStbd', 'G', 1.15, 15.4, 0.12), light('sidePort', 'R', 1.15, 15.4, -0.12), light('stern', 'W', 0.85, 15.4)],
        shapes: [],
      },
      {
        label: 'underway, with optional red over green',
        hull: 'sail',
        lights: [...signals('sail', ['R', 'G']), ...sidelightsAndStern('sail')],
        shapes: [],
      },
    ],
  },
  {
    id: 'motorSailing',
    name: 'Sailing vessel also using her engine',
    rule: 'Rule 25(e)',
    description: 'By day a cone, point down, in the forepart. At night she shows the lights of a power-driven vessel.',
    dayOnly: true,
    variants: [
      { label: 'under sail and engine', hull: 'sail', lights: [...masthead('sail'), ...sidelightsAndStern('sail')], shapes: ['coneDown'] },
    ],
  },
  {
    id: 'trawling',
    name: 'Vessel engaged in trawling',
    rule: 'Rule 26(b)',
    description: 'All-round green over white. Sidelights and sternlight only when making way. By day two cones, points together.',
    variants: [
      { label: 'making way', hull: 'small', lights: [...signals('small', ['G', 'W']), ...sidelightsAndStern('small')], shapes: ['coneDown', 'coneUp'] },
      { label: 'not making way', hull: 'small', lights: signals('small', ['G', 'W']), shapes: ['coneDown', 'coneUp'] },
    ],
  },
  {
    id: 'fishing',
    name: 'Vessel engaged in fishing (not trawling)',
    rule: 'Rule 26(c)',
    description: 'All-round red over white. Sidelights and sternlight only when making way. By day two cones, points together.',
    variants: [
      { label: 'making way', hull: 'small', lights: [...signals('small', ['R', 'W']), ...sidelightsAndStern('small')], shapes: ['coneDown', 'coneUp'] },
      { label: 'not making way', hull: 'small', lights: signals('small', ['R', 'W']), shapes: ['coneDown', 'coneUp'] },
    ],
  },
  {
    id: 'nuc',
    name: 'Vessel not under command',
    rule: 'Rule 27(a)',
    description: 'Two all-round red lights in a vertical line. Sidelights and sternlight when making way. By day two balls.',
    variants: large((h) => [
      { label: 'making way', hull: h, lights: [...signals(h, ['R', 'R']), ...sidelightsAndStern(h)], shapes: ['ball', 'ball'] },
      { label: 'not making way', hull: h, lights: signals(h, ['R', 'R']), shapes: ['ball', 'ball'] },
    ]),
  },
  {
    id: 'ram',
    name: 'Vessel restricted in her ability to manoeuvre',
    rule: 'Rule 27(b)',
    description: 'All-round red, white, red in a vertical line. When making way also masthead lights, sidelights and sternlight. By day ball, diamond, ball.',
    variants: large((h) => [
      {
        label: 'making way',
        hull: h,
        lights: [...signals(h, ['R', 'W', 'R']), ...masthead(h), ...sidelightsAndStern(h)],
        shapes: ['ball', 'diamond', 'ball'],
      },
      { label: 'not making way', hull: h, lights: signals(h, ['R', 'W', 'R']), shapes: ['ball', 'diamond', 'ball'] },
    ]),
  },
  {
    id: 'cbd',
    name: 'Vessel constrained by her draught',
    rule: 'Rule 28',
    description: 'The lights of a power-driven vessel plus three all-round red lights in a vertical line. By day a cylinder.',
    variants: large((h) => [
      {
        label: 'underway',
        hull: h,
        lights: [...signals(h, ['R', 'R', 'R']), ...masthead(h), ...sidelightsAndStern(h)],
        shapes: ['cylinder'],
      },
    ]),
  },
  {
    id: 'pilot',
    name: 'Pilot vessel on duty',
    rule: 'Rule 29',
    description: 'All-round white over red at or near the masthead. Sidelights and sternlight when underway, anchor light when at anchor.',
    variants: [
      { label: 'underway', hull: 'small', lights: [...signals('small', ['W', 'R']), ...sidelightsAndStern('small')], shapes: [] },
      { label: 'at anchor', hull: 'small', lights: [...signals('small', ['W', 'R']), ...anchorLights('small')], shapes: [] },
    ],
  },
  {
    id: 'towing',
    name: 'Power-driven vessel towing, tow 200 m or less',
    rule: 'Rule 24(a)',
    description: 'Two masthead lights in a vertical line, sidelights, sternlight and a yellow towing light above the sternlight.',
    variants: [
      {
        label: 'towing astern',
        hull: 'small',
        lights: [...towingMasthead('small', 2), ...sidelightsAndStern('small'), towingLight('small')],
        shapes: [],
      },
    ],
  },
  {
    id: 'towingLong',
    name: 'Power-driven vessel towing, tow over 200 m',
    rule: 'Rule 24(a)',
    description: 'Three masthead lights in a vertical line, sidelights, sternlight and a yellow towing light. By day a diamond.',
    variants: [
      {
        label: 'towing astern',
        hull: 'small',
        lights: [...towingMasthead('small', 3), ...sidelightsAndStern('small'), towingLight('small')],
        shapes: ['diamond'],
      },
    ],
  },
  {
    id: 'anchor',
    name: 'Vessel at anchor',
    rule: 'Rule 30(a)',
    description: 'All-round white light(s): two if 50 m or more (the forward one higher), one if less than 50 m. By day one ball.',
    variants: [
      ...large((h) => [{ label: '50 m or more', hull: h, lights: anchorLights(h), shapes: ['ball'] }]),
      { label: 'less than 50 m', hull: 'small', lights: anchorLights('small'), shapes: ['ball'] },
    ],
  },
  {
    id: 'aground',
    name: 'Vessel aground',
    rule: 'Rule 30(d)',
    description: 'Anchor lights plus two all-round red lights in a vertical line. By day three balls.',
    variants: large((h) => [{ label: 'aground', hull: h, lights: [...anchorLights(h), ...signals(h, ['R', 'R'])], shapes: ['ball', 'ball', 'ball'] }]),
  },

  // ---------- Added 15 Oct 2026 ----------
  {
    id: 'aircushion',
    name: 'Air-cushion vessel (hovercraft)',
    rule: 'Rule 23(b)',
    description: 'In the non-displacement mode: the lights of a power-driven vessel plus an all-round flashing yellow light.',
    noFix: true,
    variants: [
      {
        label: 'underway',
        hull: 'small',
        lights: [...masthead('small'), ...sidelightsAndStern('small'), { ...light('allRound', 'Y', 4, 15.8), flash: true }],
        shapes: [],
      },
    ],
  },
  {
    id: 'towed',
    name: 'Vessel being towed',
    rule: 'Rule 24(e)',
    description: 'Sidelights and a sternlight. By day a diamond where it can best be seen when the tow is longer than 200 m.',
    variants: [
      { label: 'tow 200 m or less', hull: 'small', lights: sidelightsAndStern('small'), shapes: [] },
      { label: 'tow over 200 m', hull: 'small', lights: sidelightsAndStern('small'), shapes: ['diamond'] },
    ],
  },
  {
    id: 'towingRam',
    name: 'Towing vessel restricted in her ability to manoeuvre',
    rule: 'Rule 27(c)',
    description:
      'A towing operation that severely restricts her and her tow from deviating from their course: the lights of a towing vessel plus all-round red, white, red in a vertical line. By day ball, diamond, ball.',
    noFix: true,
    variants: [
      {
        label: 'towing astern',
        hull: 'small',
        lights: [
          ...towingMasthead('small', 2),
          ...sidelightsAndStern('small'),
          towingLight('small'),
          light('allRound', 'R', -6, 12.5),
          light('allRound', 'W', -6, 9.7),
          light('allRound', 'R', -6, 6.9),
        ],
        shapes: ['ball', 'diamond', 'ball'],
      },
    ],
  },
  {
    id: 'dredging',
    name: 'Dredger with an obstruction on one side',
    rule: 'Rule 27(d)',
    description:
      'All-round red, white, red in a vertical line, two all-round red lights on the side of the obstruction and two all-round green lights on the side where you may pass. By day ball, diamond, ball, two balls on the obstruction side and two diamonds on the passing side.',
    noFix: true,
    aspects: [0, 180],
    variants: (['port', 'starboard'] as const).map((side): Variant => {
      const red = side === 'port' ? -8 : 8
      return {
        label: `obstruction to ${side}`,
        hull: 'small',
        lights: [
          ...signals('small', ['R', 'W', 'R']),
          light('allRound', 'R', 4, 12.1, red),
          light('allRound', 'R', 4, 9.3, red),
          light('allRound', 'G', 4, 12.1, -red),
          light('allRound', 'G', 4, 9.3, -red),
        ],
        shapes: ['ball', 'diamond', 'ball', 'ball', 'ball', 'diamond', 'diamond'],
        shapeAt: [
          { x: 4, y: 0, z: 16.6 },
          { x: 4, y: 0, z: 12.3 },
          { x: 4, y: 0, z: 8 },
          { x: 4, y: red, z: 14.5 },
          { x: 4, y: red, z: 10.2 },
          { x: 4, y: -red, z: 14.5 },
          { x: 4, y: -red, z: 10.2 },
        ],
      }
    }),
  },
  {
    id: 'mineClearance',
    aspects: [0, 180],
    name: 'Vessel engaged in mine clearance',
    rule: 'Rule 27(f)',
    description:
      'The lights of a power-driven vessel plus three all-round green lights: one near the foremast head and one at each end of the fore yard. By day three balls in the same places. It is dangerous to come within 1000 m.',
    noFix: true,
    variants: [
      {
        label: 'making way',
        hull: 'small',
        lights: [
          ...masthead('small'),
          ...sidelightsAndStern('small'),
          light('allRound', 'G', 4, 16),
          light('allRound', 'G', 4, 11.2, 8),
          light('allRound', 'G', 4, 11.2, -8),
        ],
        shapes: ['ball', 'ball', 'ball'],
        shapeAt: [
          { x: 4, y: 0, z: 16.6 },
          { x: 4, y: 8, z: 12.8 },
          { x: 4, y: -8, z: 12.8 },
        ],
      },
    ],
  },
  {
    id: 'diving',
    name: 'Small vessel engaged in diving operations',
    rule: 'Rule 27(e)',
    description:
      'Too small to show all the lights and shapes of Rule 27(b): all-round red, white, red, and by day a rigid replica of the code flag A, at least 1 m high. At night she looks like any vessel restricted in her ability to manoeuvre.',
    dayOnly: true,
    nightLooksLike: 'At night she shows red, white, red and looks like any vessel restricted in her ability to manoeuvre.',
    noFix: true,
    variants: [{ label: 'diving', hull: 'boat', lights: signals('boat', ['R', 'W', 'R']), shapes: ['flagA'] }],
  },
]

// ---------- Aspects: where you are, seen from the vessel ----------

export interface Aspect {
  /** Relative bearing of the observer from the vessel's bow, + = starboard */
  deg: number
  name: string
  short: string
}

export const ASPECTS: Aspect[] = [
  { deg: 0, name: 'right ahead of her', short: 'Ahead' },
  { deg: 45, name: 'on her starboard bow', short: 'Stbd bow' },
  { deg: 90, name: 'on her starboard beam', short: 'Stbd beam' },
  { deg: 135, name: 'on her starboard quarter', short: 'Stbd qtr' },
  { deg: 180, name: 'right astern of her', short: 'Astern' },
  { deg: -135, name: 'on her port quarter', short: 'Port qtr' },
  { deg: -90, name: 'on her port beam', short: 'Port beam' },
  { deg: -45, name: 'on her port bow', short: 'Port bow' },
]

/** The aspects a vessel may be shown from in questions */
export function aspectsFor(v: Vessel): Aspect[] {
  return v.aspects ? ASPECTS.filter((a) => v.aspects!.includes(a.deg)) : ASPECTS
}
