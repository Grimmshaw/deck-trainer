import type { LightColor } from '../buoyage/light'
import type { TypedAnswer } from './typed'

// Typed answers for the generated questions (the theory questions carry their own).
// Each table is checked in tests/typedGenerated.test.ts: the right answer text is
// always accepted, and no other answer from the same table is.

const PROHIBITED = ['prohibited', 'forbidden', 'not allowed', 'no', 'banned']
const POWER = ['power', 'power driven', 'motor', 'powered', 'engine']

/** Morse or flags: the letter (or number) itself */
export function letterTyped(letter: string, word?: string): TypedAnswer {
  const extra: Record<string, string[]> = { A: ['alpha'], J: ['juliet'], X: ['xray'] }
  return {
    accept: [letter, ...(word ? [word, `${letter} ${word}`, `flag ${letter}`, ...(extra[letter] ?? [])] : [])],
    exact: !word,
    hint: /\d/.test(letter) ? 'Letter or number' : 'The letter',
  }
}

/** What a single-letter signal means (the same by flag, light or sound) */
export const SIGNAL_TYPED: Record<string, Omit<TypedAnswer, 'accept'>> = {
  A: { keywords: [['diver', 'divers', 'diving']] },
  B: { keywords: [['dangerous goods', 'dangerous cargo', 'dangerous', 'explosives', 'hazardous']], reject: ['fire'] },
  C: { keywords: [['yes', 'affirmative']], reject: ['no', 'negative'] },
  D: { keywords: [['difficulty', 'difficult', 'manoeuvring', 'maneuvering', 'manoeuvering']], reject: ['pair', 'trawling', 'fire', 'diver'] },
  E: { keywords: ['starboard'], reject: ['port', 'overtake'] },
  F: { keywords: [['disabled', 'broken down', 'not under command']] },
  G: { keywords: ['pilot', ['require', 'need', 'want', 'request', 'requires']], reject: ['on board', 'onboard', 'have'] },
  H: { keywords: ['pilot', ['on board', 'onboard', 'have', 'aboard']], reject: ['require', 'need', 'want'] },
  I: { keywords: ['port'], reject: ['starboard', 'harbour', 'overtake'] },
  J: { keywords: ['fire', ['dangerous', 'dangerous cargo', 'dangerous goods', 'hazardous', 'explosives']] },
  K: { keywords: [['communicate', 'talk', 'contact', 'communication', 'speak']], reject: ['disabled'] },
  L: { keywords: ['stop', ['instantly', 'immediately', 'at once', 'now']], reject: ['stopped', 'intentions', 'carrying'] },
  M: { keywords: [['stopped', 'not moving', 'no way']], reject: ['stop your', 'instantly'] },
  N: { keywords: [['no', 'negative']], reject: ['yes', 'affirmative', 'no way'] },
  O: { keywords: [['man overboard', 'overboard', 'man over board', 'over board', 'mob', 'person overboard']] },
  P: { keywords: [['on board', 'aboard', 'onboard', 'back on board', 'return'], ['sea', 'sail', 'sailing', 'depart', 'departing', 'leaving', 'proceed']] },
  Q: { keywords: [['healthy', 'health', 'pratique', 'free pratique', 'no disease']] },
  S: { keywords: [['astern', 'reverse', 'backing']] },
  T: { keywords: [['pair trawling', 'pair trawl', 'trawling', 'pair']] },
  U: { keywords: [['running into danger', 'standing into danger', 'into danger', 'danger']], reject: ['goods', 'cargo', 'fire'] },
  V: { keywords: [['assistance', 'help']], reject: ['medical', 'doctor', 'tug'] },
  W: { keywords: [['medical', 'doctor', 'medic']], reject: ['tug'] },
  X: { keywords: [['intentions', 'intention', 'what you are doing']] },
  Y: { keywords: [['dragging', 'drag', 'dragging anchor']] },
  Z: { keywords: [['tug', 'tow', 'towing']] },
}

export function signalTyped(letter: string, meaning: string): TypedAnswer {
  return { accept: [meaning.toLowerCase()], ...SIGNAL_TYPED[letter] }
}

/** IALA mark names, by mark id */
export const MARK_TYPED: Record<string, TypedAnswer> = {
  port: { accept: ['port-hand mark', 'port hand', 'port lateral mark'], keywords: ['port'], reject: ['starboard', 'preferred', 'main'] },
  starboard: { accept: ['starboard-hand mark', 'starboard hand', 'starboard lateral mark'], keywords: ['starboard'], reject: ['port', 'preferred', 'main'] },
  prefStarboard: { accept: ['preferred channel to starboard', 'modified port-hand mark'], keywords: [['preferred', 'main'], 'starboard'] },
  prefPort: { accept: ['preferred channel to port', 'modified starboard-hand mark'], keywords: [['preferred', 'main'], 'port'] },
  north: { accept: ['north cardinal mark', 'north cardinal', 'north'], keywords: ['north'], reject: ['south', 'east', 'west'] },
  east: { accept: ['east cardinal mark', 'east cardinal', 'east'], keywords: ['east'], reject: ['north', 'south', 'west'] },
  south: { accept: ['south cardinal mark', 'south cardinal', 'south'], keywords: ['south'], reject: ['north', 'east', 'west'] },
  west: { accept: ['west cardinal mark', 'west cardinal', 'west'], keywords: ['west'], reject: ['north', 'south', 'east'] },
  isolated: { accept: ['isolated danger mark', 'isolated danger'], keywords: [['isolated', 'isolated danger']], reject: ['new danger', 'wreck'] },
  safe: { accept: ['safe water mark', 'safe water'], keywords: ['safe water'] },
  special: { accept: ['special mark', 'special'], keywords: ['special'] },
  wreck: { accept: ['emergency wreck marking buoy', 'emergency wreck mark', 'wreck buoy'], keywords: [['wreck', 'new danger']] },
}

/** A light character such as "Q(6)+LFl 15s" with colour W, R or G, in any order and spacing */
export function charTyped(spec: string, colour: LightColor): TypedAnswer {
  const [rhythm, period] = spec.split(' ')
  const periods = period ? [period, period.replace('s', ' sec'), period.replace('s', '')] : ['']
  const names: Record<string, string> = { R: 'red', G: 'green', Y: 'yellow', Bu: 'blue' }
  const colours = colour === 'W' ? ['', 'W', 'white'] : [colour, names[colour] ?? colour]
  const accept = new Set<string>()
  for (const p of periods)
    for (const c of colours) {
      accept.add(`${rhythm} ${c} ${p}`)
      accept.add(`${rhythm} ${p} ${c}`)
      accept.add(`${c} ${rhythm} ${p}`)
    }
  const shown = colour === 'W' ? spec : period ? `${rhythm} ${colour} ${period}` : `${rhythm} ${colour}`
  return { accept: [shown, ...[...accept].filter((a) => a !== shown)], exact: true, hint: 'e.g. Fl(2) R 6s' }
}

/** Chart symbols, by symbol id */
export const CHART_TYPED: Record<string, Omit<TypedAnswer, 'accept'>> = {
  wreckDanger: { keywords: ['wreck', 'dangerous'], reject: ['not dangerous', 'non dangerous', 'hull', 'least depth', 'depth known', 'known depth'] },
  wreck: { keywords: ['wreck', ['not dangerous', 'non dangerous', 'safe', 'harmless']], reject: ['hull'] },
  wreckHull: { keywords: ['wreck', ['hull', 'showing', 'visible', 'mast', 'masts']] },
  rockAwash: { keywords: ['rock', 'awash'], reject: ['drying', 'dries', 'underwater', 'under water', 'islet'] },
  rockDrying: { keywords: ['rock', ['drying', 'dries', 'uncovers']], reject: ['awash', 'underwater', 'under water', 'does not cover'] },
  rockUnder: { keywords: ['rock', ['underwater', 'under water', 'submerged', 'sunken']], reject: ['awash', 'drying', 'dries'] },
  obstruction: { keywords: ['obstruction'], reject: ['least depth', 'depth known', 'known depth'] },
  foul: { keywords: [['foul']] },
  anchorage: { keywords: [['anchorage', 'anchoring', 'anchor']], reject: [...PROHIBITED, 'area', 'berth'] },
  noAnchoring: { keywords: [['anchor', 'anchoring', 'anchorage'], PROHIBITED] },
  noFishing: { keywords: [['fishing', 'fish'], PROHIBITED] },
  restricted: { keywords: ['restricted'] },
  cable: { keywords: [['cable', 'cables']], reject: ['area'] },
  cableArea: { keywords: [['cable', 'cables'], 'area'] },
  light: { keywords: [['light', 'lighthouse']], reject: ['vessel', 'leading', 'sector', 'fog', 'ship', 'float'] },
  fog: { keywords: ['fog'] },
  racon: { keywords: ['racon'] },
  floodStream: { keywords: ['flood'], reject: ['ebb'] },
  ebbStream: { keywords: ['ebb'], reject: ['flood'] },
  overfalls: { keywords: [['overfalls', 'overfall', 'tide rips', 'rips', 'race', 'races']] },
  eddies: { keywords: [['eddies', 'eddy', 'whirlpool', 'whirlpools']] },
  sounding: { keywords: [['sounding', 'depth']], reject: ['drying', 'contour', 'line', 'least', 'unknown', 'wreck', 'obstruction', 'rock'] },
  drying: { keywords: [['height', 'drying height']], reject: ['rock'] },
  islet: { keywords: [['islet', 'island', 'does not cover', 'never covers', 'above water']] },
  breakers: { keywords: [['breakers', 'breaking', 'surf']] },
  wreckDepth: { keywords: ['wreck', ['least depth', 'depth known', 'known depth', 'swept', 'depth']], reject: ['unknown', 'hull'] },
  obstructionDepth: { keywords: ['obstruction', ['least depth', 'depth known', 'known depth', 'depth']], reject: ['unknown'] },
  anchorageArea: { keywords: [['anchorage', 'anchoring', 'anchor'], 'area'], reject: [...PROHIBITED, 'berth'] },
  anchorBerth: { keywords: [['berth']] },
  pipeline: { keywords: [['pipeline', 'pipe', 'pipelines']] },
  windTurbine: { keywords: [['wind turbine', 'turbine', 'windmill', 'wind']] },
  platform: { keywords: [['platform', 'rig', 'oil rig']] },
  tssArrow: { keywords: [['established', 'tss', 'traffic separation', 'traffic lane', 'lane']], reject: ['recommended'] },
  tssRecommended: { keywords: [['recommended']], reject: ['established'] },
  sepZone: { keywords: [['separation zone', 'separation']] },
  lightVessel: { keywords: [['light vessel', 'lightship', 'light ship', 'lightvessel', 'light float']] },
  leadingLights: { keywords: [['leading', 'transit', 'range lights']] },
  sectorLight: { keywords: [['sector', 'sectors']] },
  ais: { keywords: ['ais'] },
  contour: { keywords: [['contour', 'depth line', 'isobath']] },
}

/** Vessels by their lights or shapes, by vessel id */
export const VESSEL_TYPED: Record<string, Omit<TypedAnswer, 'accept'>> = {
  power50: { keywords: [POWER, ['50 m or more', '50 or more', 'over 50', 'more than 50', 'above 50', '50m or more', 'large', 'big']], reject: ['towing', 'tow', 'sailing', 'less than', 'under', 'small'] },
  power: { keywords: [POWER, ['less than 50', 'under 50', 'below 50', 'small', 'smaller', 'less than 50m']], reject: ['towing', 'tow', 'sailing', 'more', 'over'] },
  sailing: { keywords: [['sailing', 'sail', 'yacht', 'sailboat']], reject: ['engine', 'motor', 'power', 'motorsailing', 'motoring'] },
  motorSailing: { keywords: [['sailing', 'sail', 'yacht', 'motorsailing', 'motorsailer'], ['engine', 'motor', 'power', 'motoring', 'motorsailing', 'motorsailer']] },
  trawling: { keywords: [['trawling', 'trawler', 'trawl']], reject: ['not trawling'] },
  fishing: { keywords: [['fishing', 'fisher', 'fishing vessel', 'longliner', 'long liner', 'seiner', 'netting']] },
  nuc: { keywords: [['not under command', 'nuc']] },
  ram: { keywords: [['restricted', 'ram']], reject: ['draught', 'draft'] },
  cbd: { keywords: [['draught', 'draft', 'cbd', 'constrained']], reject: ['restricted'] },
  pilot: { keywords: ['pilot'] },
  towing: {
    keywords: [['towing', 'tow', 'tug'], ['200 m or less', '200m or less', '200 or less', 'less than 200', 'under 200', 'below 200', 'up to 200', 'not more than 200', 'short']],
    reject: ['over 200', 'more than 200', 'exceeding', 'long', 'longer'],
  },
  towingLong: {
    keywords: [['towing', 'tow', 'tug'], ['over 200', 'more than 200', 'exceeding 200', 'longer than 200', 'above 200', 'long']],
    reject: ['or less', 'less than', 'under', 'short', 'below'],
  },
  anchor: { keywords: [['anchor', 'anchored', 'at anchor']], reject: ['aground', 'dragging'] },
  aground: { keywords: [['aground', 'grounded', 'ashore']] },
}

/** "Which way is she heading?" */
export const HEADING_TYPED: Record<string, TypedAnswer> = {
  towards: { accept: ['towards you', 'towards me', 'straight towards you'], keywords: [['towards', 'toward', 'head on', 'straight at', 'coming at', 'approaching']], reject: ['away', 'left', 'right', 'crossing'] },
  leftToRight: { accept: ['left to right', 'from left to right', 'crossing left to right', 'from your left to your right', 'crossing from your left to your right', 'port to starboard', 'to the right', 'going right', 'moving right', 'right'] },
  rightToLeft: { accept: ['right to left', 'from right to left', 'crossing right to left', 'from your right to your left', 'crossing from your right to your left', 'starboard to port', 'to the left', 'going left', 'moving left', 'left'] },
  away: { accept: ['away from you', 'away'], keywords: [['away', 'going away', 'receding']], reject: ['towards', 'toward', 'left', 'right'] },
}

const STAND_ON = [['stand on', 'keep course', 'keep your course', 'maintain course', 'course and speed', 'hold course']]
const NOT_STAND_ON = ['alter', 'give way', 'port', 'starboard', 'increase', 'keep out', 'avoid']

/** COLREG "What do you do?" situations, by action */
export const ACTION_TYPED: Record<string, TypedAnswer> = {
  headOn: { accept: ['alter course to starboard'], keywords: ['starboard'], reject: ['port', 'increase', 'stand on', 'keep your course', 'keep course', 'give way', 'astern', 'speed'] },
  giveWay: {
    accept: ['give way, alter to starboard and pass astern'],
    keywords: [['give way', 'starboard', 'pass astern', 'astern', 'slow down', 'reduce speed', 'keep out', 'keep clear']],
    reject: ['port', 'increase', 'stand on', 'keep course', 'keep your course', 'ahead', 'head on', 'rule 18', 'priority', 'overtaking'],
  },
  standOn: { accept: ['stand on'], keywords: STAND_ON, reject: NOT_STAND_ON },
  standOnOvertaken: { accept: ['stand on'], keywords: STAND_ON, reject: NOT_STAND_ON },
  overtaking: { accept: ['keep out of her way'], keywords: [['keep out', 'keep clear', 'give way', 'stay clear', 'overtaking']], reject: ['stand on', 'keep course', 'keep your course', 'increase', 'impede', 'impeding', 'port'] },
  keepOut18: { accept: ['keep out of her way'], keywords: [['keep out', 'keep clear', 'give way', 'stay clear']], reject: ['stand on', 'keep course', 'keep your course', 'increase', 'impede', 'impeding', 'port'] },
  notImpede: { accept: ['avoid impeding her'], keywords: [['impede', 'impeding', 'not impede']], reject: ['stand on', 'keep course', 'keep your course', 'increase', 'port'] },
  anchored: { accept: ['she is at anchor, pass well clear'], keywords: [['anchor', 'anchored']], reject: ['aground'] },
  aground: { accept: ['she is aground, keep clear of the shallows'], keywords: [['aground', 'shallow', 'shallows', 'grounded']], reject: ['anchor', 'anchored'] },
}

/** Rule 19: the alteration allowed for a radar contact */
export const FOG_TYPED: Record<string, TypedAnswer> = {
  starboard: { accept: ['alter course to starboard'], keywords: ['starboard'], reject: ['port', 'short blast', 'one short', 'stand on', 'keep course', 'keep your course'] },
  port: { accept: ['alter course to port'], keywords: ['port'], reject: ['starboard', 'stand on', 'keep course', 'keep your course', 'short blast'] },
}

/** Sound signal meanings, by signal id */
export const SOUND_TYPED: Record<string, Omit<TypedAnswer, 'accept'>> = {
  stbd: { keywords: ['starboard'], reject: ['port', 'overtake', 'overtaking'] },
  port: { keywords: ['port'], reject: ['starboard', 'overtake', 'overtaking'] },
  astern: { keywords: [['astern', 'reverse', 'backing']] },
  overtakeStbd: { keywords: [['overtake', 'overtaking', 'pass'], 'starboard'], reject: ['port'] },
  overtakePort: { keywords: [['overtake', 'overtaking', 'pass'], 'port'], reject: ['starboard'] },
  agree: { keywords: [['agree', 'agreement', 'agreed', 'agrees']] },
  doubt: { keywords: [['doubt', 'understand', 'not understand', 'fail to understand', 'wake up', 'danger']] },
  bend: { keywords: [['bend', 'obstruction', 'hidden', 'blind']] },
  fogPowerWay: { keywords: [POWER, ['making way', 'under way', 'underway', 'moving']], reject: ['stopped', 'no way', 'towing', 'towed', 'anchor'] },
  fogPowerStopped: { keywords: [POWER, ['stopped', 'no way', 'not making way']] },
  fogLss: {
    keywords: [['not under command', 'nuc', 'restricted', 'ram', 'constrained', 'draught', 'cbd', 'sailing', 'fishing', 'towing', 'pushing']],
    reject: ['towed', 'anchor', 'aground', 'pilot', 'power driven vessel making', 'stopped'],
  },
  fogTowed: { keywords: [['towed', 'being towed', 'last vessel']], reject: ['towing', 'pushing'] },
  fogAnchor: { keywords: [['anchor', 'anchored']], reject: ['100 m or more', 'more than 100', 'over 100', 'warning', 'warn', 'aground', 'fishing', 'gong'] },
  fogAnchorLarge: {
    keywords: [['anchor', 'anchored'], ['100 m or more', '100m or more', 'over 100', 'more than 100', '100 or more', 'large', 'gong']],
    reject: ['less than', 'warning', 'warn', 'aground'],
  },
  fogAnchorWarn: { keywords: [['warning', 'warn', 'position']], reject: ['bend'] },
  fogAground: { keywords: ['aground'] },
  fogPilot: { keywords: ['pilot'] },
}

/** A distress signal shown as a picture: what does it mean? */
export const DISTRESS_TYPED: TypedAnswer = {
  accept: ['distress', 'she is in distress', 'she is in distress and requires assistance'],
  keywords: [['distress', 'assistance', 'help', 'mayday', 'emergency', 'sos']],
  reject: ['pilot', 'anchor', 'manoeuvring', 'difficulty'],
}
