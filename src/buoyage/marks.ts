import { alternatingBlueYellow, parseLight, type Light } from './light'

// The IALA Maritime Buoyage System as data. Every picture and every
// generated question comes from this one file, so a fix here fixes them all.
// Source: IALA Recommendation R1001, The IALA Maritime Buoyage System.

export type Region = 'A' | 'B'

export type MarkId =
  | 'port'
  | 'starboard'
  | 'prefStarboard'
  | 'prefPort'
  | 'north'
  | 'east'
  | 'south'
  | 'west'
  | 'isolated'
  | 'safe'
  | 'special'
  | 'wreck'

export type Paint = 'red' | 'green' | 'black' | 'yellow' | 'white' | 'blue'
/** 'beacon' is a fixed structure standing on a rock; the others are floating buoys */
export type BodyShape = 'can' | 'cone' | 'pillar' | 'spar' | 'sphere' | 'beacon'
export type Topmark =
  | 'can'
  | 'cone'
  | 'sphere'
  | 'conesUp'
  | 'conesDown'
  | 'conesBase'
  | 'conesPoint'
  | 'spheres2'
  | 'x'
  | 'cross'

export interface Mark {
  id: MarkId
  name: string
  meaning: string
  /** Shapes IALA allows for this mark. The first one is used in the gallery. */
  shapes: BodyShape[]
  /** Horizontal bands from top to bottom, or vertical stripes left to right */
  paint: { pattern: 'bands' | 'stripes'; colors: Paint[] }
  topmark: Topmark
  topmarkColor: Paint
  /** Allowed light characters. The first one is shown in the gallery. */
  lights: Light[]
}

export const MARK_IDS: MarkId[] = [
  'port',
  'starboard',
  'prefStarboard',
  'prefPort',
  'north',
  'east',
  'south',
  'west',
  'isolated',
  'safe',
  'special',
  'wreck',
]

export function getMark(id: MarkId, region: Region): Mark {
  // Region A: port = red, starboard = green. Region B is the other way round.
  const portPaint: Paint = region === 'A' ? 'red' : 'green'
  const stbdPaint: Paint = region === 'A' ? 'green' : 'red'
  const portLight = region === 'A' ? 'R' : 'G'
  const stbdLight = region === 'A' ? 'G' : 'R'
  // Lateral marks may use any rhythm except Fl(2+1)
  const lateral = (c: string) =>
    [`Fl ${c} 4s`, `Fl(2) ${c} 6s`, `Fl(3) ${c} 10s`, `Q ${c}`, `Iso ${c} 4s`].map(parseLight)

  switch (id) {
    case 'port':
      return {
        id,
        name: 'Port-hand mark',
        meaning: 'Keep it on your port side when following the direction of buoyage.',
        shapes: ['can', 'pillar', 'spar', 'beacon'],
        paint: { pattern: 'bands', colors: [portPaint] },
        topmark: 'can',
        topmarkColor: portPaint,
        lights: lateral(portLight),
      }
    case 'starboard':
      return {
        id,
        name: 'Starboard-hand mark',
        meaning: 'Keep it on your starboard side when following the direction of buoyage.',
        shapes: ['cone', 'pillar', 'spar', 'beacon'],
        paint: { pattern: 'bands', colors: [stbdPaint] },
        topmark: 'cone',
        topmarkColor: stbdPaint,
        lights: lateral(stbdLight),
      }
    case 'prefStarboard':
      return {
        id,
        name: 'Preferred channel to starboard',
        meaning:
          'Modified port-hand mark where a channel divides. The preferred channel is to starboard: keep the mark on your port side.',
        shapes: ['can', 'pillar', 'spar'],
        paint: { pattern: 'bands', colors: [portPaint, stbdPaint, portPaint] },
        topmark: 'can',
        topmarkColor: portPaint,
        lights: [parseLight(`Fl(2+1) ${portLight} 10s`)],
      }
    case 'prefPort':
      return {
        id,
        name: 'Preferred channel to port',
        meaning:
          'Modified starboard-hand mark where a channel divides. The preferred channel is to port: keep the mark on your starboard side.',
        shapes: ['cone', 'pillar', 'spar'],
        paint: { pattern: 'bands', colors: [stbdPaint, portPaint, stbdPaint] },
        topmark: 'cone',
        topmarkColor: stbdPaint,
        lights: [parseLight(`Fl(2+1) ${stbdLight} 10s`)],
      }
    case 'north':
      return {
        id,
        name: 'North cardinal mark',
        meaning: 'The safe water is to the north. Pass north of the mark.',
        shapes: ['pillar', 'spar', 'beacon'],
        paint: { pattern: 'bands', colors: ['black', 'yellow'] },
        topmark: 'conesUp',
        topmarkColor: 'black',
        lights: ['VQ', 'Q'].map(parseLight),
      }
    case 'east':
      return {
        id,
        name: 'East cardinal mark',
        meaning: 'The safe water is to the east. Pass east of the mark.',
        shapes: ['pillar', 'spar', 'beacon'],
        paint: { pattern: 'bands', colors: ['black', 'yellow', 'black'] },
        topmark: 'conesBase',
        topmarkColor: 'black',
        lights: ['VQ(3) 5s', 'Q(3) 10s'].map(parseLight),
      }
    case 'south':
      return {
        id,
        name: 'South cardinal mark',
        meaning: 'The safe water is to the south. Pass south of the mark.',
        shapes: ['pillar', 'spar', 'beacon'],
        paint: { pattern: 'bands', colors: ['yellow', 'black'] },
        topmark: 'conesDown',
        topmarkColor: 'black',
        lights: ['Q(6)+LFl 15s', 'VQ(6)+LFl 10s'].map(parseLight),
      }
    case 'west':
      return {
        id,
        name: 'West cardinal mark',
        meaning: 'The safe water is to the west. Pass west of the mark.',
        shapes: ['pillar', 'spar', 'beacon'],
        paint: { pattern: 'bands', colors: ['yellow', 'black', 'yellow'] },
        topmark: 'conesPoint',
        topmarkColor: 'black',
        lights: ['Q(9) 15s', 'VQ(9) 10s'].map(parseLight),
      }
    case 'isolated':
      return {
        id,
        name: 'Isolated danger mark',
        meaning: 'A danger of limited extent with navigable water all around it.',
        shapes: ['pillar', 'spar', 'beacon'],
        paint: { pattern: 'bands', colors: ['black', 'red', 'black'] },
        topmark: 'spheres2',
        topmarkColor: 'black',
        lights: [parseLight('Fl(2) 5s')],
      }
    case 'safe':
      return {
        id,
        name: 'Safe water mark',
        meaning: 'Navigable water all around, for example a landfall or mid-channel mark.',
        shapes: ['sphere', 'pillar', 'spar'],
        paint: { pattern: 'stripes', colors: ['red', 'white', 'red', 'white', 'red', 'white', 'red'] },
        topmark: 'sphere',
        topmarkColor: 'red',
        lights: ['Iso 4s', 'Oc 4s', 'LFl 10s', 'Mo(A) 6s'].map(parseLight),
      }
    case 'special':
      return {
        id,
        name: 'Special mark',
        meaning: 'A special area or feature, for example a cable, spoil ground or data buoy.',
        shapes: ['can', 'pillar', 'spar'],
        paint: { pattern: 'bands', colors: ['yellow'] },
        topmark: 'x',
        topmarkColor: 'yellow',
        lights: ['Fl Y 5s', 'Fl(4) Y 12s'].map(parseLight),
      }
    case 'wreck':
      return {
        id,
        name: 'Emergency wreck marking buoy',
        meaning: 'Marks a new wreck until it is surveyed and permanently marked.',
        shapes: ['pillar', 'spar'],
        paint: {
          pattern: 'stripes',
          colors: ['blue', 'yellow', 'blue', 'yellow', 'blue', 'yellow', 'blue', 'yellow'],
        },
        topmark: 'cross',
        topmarkColor: 'yellow',
        lights: [alternatingBlueYellow()],
      }
  }
}

export function allMarks(region: Region): Mark[] {
  return MARK_IDS.map((id) => getMark(id, region))
}
