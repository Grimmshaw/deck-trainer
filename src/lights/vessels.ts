// Navigation lights and day shapes (COLREG Part C, Rules 21–30) as data.
// Every picture and every generated question comes from this file.
//
// Positions are in metres in the vessel's own frame:
//   x = forward from midships, y = towards starboard, z = height above the waterline.
// Heights are schematic (lights in a vertical line are spaced so they are easy to see).

export type LightKind = 'masthead' | 'sideStbd' | 'sidePort' | 'stern' | 'towing' | 'allRound'
export type ShipLightColor = 'W' | 'R' | 'G' | 'Y'
export type DayShape = 'ball' | 'diamond' | 'cylinder' | 'coneUp' | 'coneDown'
export type HullType = 'large' | 'small' | 'sail'

export interface ShipLight {
  kind: LightKind
  color: ShipLightColor
  x: number
  y: number
  z: number
}

export interface Variant {
  /** For example "making way" or "not making way" */
  label: string
  hull: HullType
  lights: ShipLight[]
  /** Day shapes from top to bottom */
  shapes: DayShape[]
}

export interface Vessel {
  id: string
  name: string
  rule: string
  description: string
  variants: Variant[]
  /** Shown only by day: at night it looks exactly like another vessel */
  dayOnly?: boolean
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

// ---------- The vessels ----------

export const VESSELS: Vessel[] = [
  {
    id: 'power50',
    name: 'Power-driven vessel, 50 m or more',
    rule: 'Rule 23(a)',
    description: 'Two masthead lights (the aft one higher), sidelights and a sternlight.',
    variants: [{ label: 'underway', hull: 'large', lights: [...masthead('large'), ...sidelightsAndStern('large')], shapes: [] }],
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
    description: 'Sidelights and a sternlight only. She may also show all-round red over green at the top of the mast.',
    variants: [
      { label: 'underway', hull: 'sail', lights: sidelightsAndStern('sail'), shapes: [] },
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
    variants: [
      { label: 'making way', hull: 'large', lights: [...signals('large', ['R', 'R']), ...sidelightsAndStern('large')], shapes: ['ball', 'ball'] },
      { label: 'not making way', hull: 'large', lights: signals('large', ['R', 'R']), shapes: ['ball', 'ball'] },
    ],
  },
  {
    id: 'ram',
    name: 'Vessel restricted in her ability to manoeuvre',
    rule: 'Rule 27(b)',
    description: 'All-round red, white, red in a vertical line. When making way also masthead lights, sidelights and sternlight. By day ball, diamond, ball.',
    variants: [
      {
        label: 'making way',
        hull: 'large',
        lights: [...signals('large', ['R', 'W', 'R']), ...masthead('large'), ...sidelightsAndStern('large')],
        shapes: ['ball', 'diamond', 'ball'],
      },
      { label: 'not making way', hull: 'large', lights: signals('large', ['R', 'W', 'R']), shapes: ['ball', 'diamond', 'ball'] },
    ],
  },
  {
    id: 'cbd',
    name: 'Vessel constrained by her draught',
    rule: 'Rule 28',
    description: 'The lights of a power-driven vessel plus three all-round red lights in a vertical line. By day a cylinder.',
    variants: [
      {
        label: 'underway',
        hull: 'large',
        lights: [...signals('large', ['R', 'R', 'R']), ...masthead('large'), ...sidelightsAndStern('large')],
        shapes: ['cylinder'],
      },
    ],
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
      { label: '50 m or more', hull: 'large', lights: anchorLights('large'), shapes: ['ball'] },
      { label: 'less than 50 m', hull: 'small', lights: anchorLights('small'), shapes: ['ball'] },
    ],
  },
  {
    id: 'aground',
    name: 'Vessel aground',
    rule: 'Rule 30(d)',
    description: 'Anchor lights plus two all-round red lights in a vertical line. By day three balls.',
    variants: [{ label: 'aground', hull: 'large', lights: [...anchorLights('large'), ...signals('large', ['R', 'R'])], shapes: ['ball', 'ball', 'ball'] }],
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
