import { normDeg, daySignature, nightSignature } from '../lights/geometry'
import { showsByDay } from '../lights/quiz'
import { VESSELS, type Variant, type Vessel } from '../lights/vessels'
import { between, pick } from '../study/util'

// "What do you do?" — the decision part of COLREG Part B (Rules 13–18).
//
// You are always a power-driven vessel making way. The other vessel is seen
// at a relative bearing `bearing` from your bow, and you are at relative
// bearing `aspect` from HER bow (which decides which of her lights you see).
// The compass bearing is steady and the range is closing, so risk of collision exists.

export type Action =
  | 'headOn'
  | 'giveWay'
  | 'standOn'
  | 'standOnOvertaken'
  | 'overtaking'
  | 'keepOut18'
  | 'notImpede'
  | 'anchored'
  | 'aground'

export type Distractor = 'port' | 'speedUp'

export const ACTION_TEXT: Record<Action | Distractor, string> = {
  headOn: 'Alter course to starboard – you are meeting head-on',
  giveWay: 'Give way – she is crossing from starboard: alter to starboard and pass astern of her',
  standOn: 'Stand on – keep your course and speed, and watch her closely',
  standOnOvertaken: 'Stand on – she is overtaking you: keep your course and speed',
  overtaking: 'Keep out of her way – you are overtaking her',
  keepOut18: 'Keep out of her way – she has priority over you under Rule 18',
  notImpede: 'Avoid impeding her – she is constrained by her draught',
  anchored: 'She is at anchor – pass well clear of her',
  aground: 'She is aground – keep well clear of the shallows',
  port: 'Alter course to port and pass ahead of her',
  speedUp: 'Increase speed so you pass ahead of her',
}

export const ACTION_WHY: Record<Action, string> = {
  headOn:
    'Rule 14: two power-driven vessels meeting on reciprocal or nearly reciprocal courses. Each alters course to starboard so that they pass port to port. If in doubt, assume it is head-on.',
  giveWay:
    'Rule 15: in a crossing situation the vessel that has the other on her own starboard side keeps out of the way and avoids crossing ahead. Rule 16: take early and substantial action.',
  standOn:
    'Rules 15 and 17: she has you on her starboard side, so she must give way. You keep your course and speed, but may act if she clearly does not (17(a)(ii)) and must act if collision can no longer be avoided by her alone. Avoid altering to port for a vessel on your port side (17(c)).',
  standOnOvertaken:
    'Rule 13: a vessel coming up from more than 22.5° abaft your beam is overtaking and must keep out of your way. Rule 17: you keep your course and speed.',
  overtaking:
    'Rule 13: you see her sternlight but none of her masthead lights or sidelights, so you are coming up from more than 22.5° abaft her beam. You are overtaking and must keep out of her way until you are finally past and clear.',
  keepOut18:
    'Rule 18(a): a power-driven vessel underway keeps out of the way of a vessel not under command, a vessel restricted in her ability to manoeuvre, a vessel engaged in fishing and a sailing vessel.',
  notImpede:
    'Rule 18(d): any vessel other than one not under command or restricted in her ability to manoeuvre shall, if the circumstances admit, avoid impeding the safe passage of a vessel constrained by her draught.',
  anchored: 'Rule 30: she is at anchor. There is no give-way situation, but you keep well clear of her and her anchor cable.',
  aground: 'Rule 30(d): she is aground. Keep well clear – the water there is too shallow.',
}

/** Rules 13–18 decide what you do, from the other vessel's type and the geometry */
export function classify(vessel: Vessel, variant: Variant, bearing: number, aspect: number): Action {
  const b = normDeg(bearing)
  const a = normDeg(aspect)
  if (vessel.id === 'aground') return 'aground'
  if (vessel.id === 'anchor' || variant.label === 'at anchor') return 'anchored'
  // Rule 13 comes before Rules 14–18
  if (Math.abs(a) > 112.5 && Math.abs(b) < 90) return 'overtaking'
  if (Math.abs(b) > 112.5 && Math.abs(a) < 90) return 'standOnOvertaken'
  if (['nuc', 'ram', 'fishing', 'trawling', 'sailing'].includes(vessel.id)) return 'keepOut18'
  if (vessel.id === 'cbd') return 'notImpede'
  if (Math.abs(b) <= 6 && Math.abs(a) <= 6) return 'headOn'
  return b > 0 ? 'giveWay' : 'standOn'
}

export type Template =
  | 'headOn'
  | 'crossingStbd'
  | 'crossingPort'
  | 'overtaking'
  | 'overtaken'
  | 'cbd'
  | 'anchored'
  | 'aground'
  | 'r18:nuc'
  | 'r18:ram'
  | 'r18:fishing'
  | 'r18:trawling'
  | 'r18:sailing'

export const TEMPLATES: Template[] = [
  'headOn',
  'crossingStbd',
  'crossingPort',
  'overtaking',
  'overtaken',
  'cbd',
  'anchored',
  'aground',
  'r18:nuc',
  'r18:ram',
  'r18:fishing',
  'r18:trawling',
  'r18:sailing',
]

export const TEMPLATE_LABEL: Record<Template, string> = {
  headOn: 'Head-on situation',
  crossingStbd: 'Crossing – she is on your starboard side',
  crossingPort: 'Crossing – she is on your port side',
  overtaking: 'You are overtaking',
  overtaken: 'You are being overtaken',
  cbd: 'Vessel constrained by her draught',
  anchored: 'Vessel at anchor',
  aground: 'Vessel aground',
  'r18:nuc': 'Vessel not under command',
  'r18:ram': 'Vessel restricted in her ability to manoeuvre',
  'r18:fishing': 'Vessel engaged in fishing',
  'r18:trawling': 'Vessel engaged in trawling',
  'r18:sailing': 'Sailing vessel',
}

const POWER_IDS = ['power50', 'power', 'pilot', 'towing', 'towingLong']

export interface Encounter {
  template: Template
  vessel: Vessel
  variant: Variant
  bearing: number
  aspect: number
  night: boolean
  action: Action
}

const vesselById = (id: string) => VESSELS.find((v) => v.id === id)!
const sign = () => (Math.random() < 0.5 ? -1 : 1)
const underway = (v: Vessel) => v.variants.filter((x) => x.label !== 'at anchor')

function sampleGeometry(t: Template): { vessel: Vessel; variant: Variant; bearing: number; aspect: number } {
  if (t.startsWith('r18:')) {
    const vessel = vesselById(t.slice(4))
    return { vessel, variant: pick(vessel.variants), bearing: between(-60, 60), aspect: between(-100, 100) }
  }
  if (t === 'cbd' || t === 'anchored' || t === 'aground') {
    const vessel =
      t === 'cbd' ? vesselById('cbd') : t === 'aground' ? vesselById('aground') : pick([vesselById('anchor'), vesselById('pilot')])
    const variant = vessel.id === 'pilot' ? vessel.variants.find((x) => x.label === 'at anchor')! : pick(vessel.variants)
    const aspect = t === 'cbd' ? between(-60, 60) : between(-180, 180)
    return { vessel, variant, bearing: between(-45, 45), aspect }
  }
  const vessel = vesselById(pick(POWER_IDS))
  const variant = pick(underway(vessel))
  switch (t) {
    case 'headOn':
      return { vessel, variant, bearing: between(-4, 4), aspect: between(-4, 4) }
    case 'crossingStbd':
      return { vessel, variant, bearing: between(15, 100), aspect: -between(15, 100) }
    case 'crossingPort':
      return { vessel, variant, bearing: -between(15, 100), aspect: between(15, 100) }
    case 'overtaking':
      return { vessel, variant, bearing: between(-25, 25), aspect: sign() * between(150, 180) }
    default:
      // overtaken: she is on your quarter, you are on her bow
      return { vessel, variant, bearing: sign() * between(125, 165), aspect: between(-30, 30) }
  }
}

/**
 * Makes an encounter for a template. Re-rolls until the picture can only mean
 * one thing: every vessel that would look the same must call for the same action.
 */
export function makeEncounter(t: Template): Encounter {
  for (let attempt = 0; attempt < 300; attempt++) {
    const g = sampleGeometry(t)
    const action = classify(g.vessel, g.variant, g.bearing, g.aspect)
    const canDay = showsByDay(g.variant) && !POWER_IDS.includes(g.vessel.id)
    const night = canDay ? Math.random() < 0.6 : true

    const sameLooking = VESSELS.flatMap((v) =>
      v.dayOnly
        ? []
        : v.variants
            .filter((x) =>
              night
                ? nightSignature(x, g.aspect) === nightSignature(g.variant, g.aspect)
                : showsByDay(x) && daySignature(x) === daySignature(g.variant),
            )
            .map((x) => ({ v, x })),
    )
    const unambiguous = sameLooking.every(({ v, x }) => classify(v, x, g.bearing, g.aspect) === action)
    if (unambiguous && nightSignature(g.variant, g.aspect) !== 'none') return { template: t, ...g, night, action }
  }
  throw new Error(`Could not make an unambiguous encounter for ${t}`)
}

/** Words for a relative bearing, e.g. "on your starboard bow" */
export function bearingWords(bearing: number): string {
  const b = normDeg(bearing)
  const side = b >= 0 ? 'starboard' : 'port'
  const x = Math.abs(b)
  if (x <= 5) return 'right ahead'
  if (x <= 22.5) return `fine on your ${side} bow`
  if (x <= 67.5) return `on your ${side} bow`
  if (x <= 112.5) return `on your ${side} beam`
  if (x <= 167.5) return `on your ${side} quarter`
  return 'right astern'
}

/** Relative bearing as a three-figure number, e.g. 045° or 315° */
export function bearingText(bearing: number): string {
  const b = Math.round(((normDeg(bearing) % 360) + 360) % 360)
  return `${String(b).padStart(3, '0')}°`
}

/** Wrong answers that make sense next to the right one */
export function distractorsFor(action: Action): (Action | Distractor)[] {
  const all: (Action | Distractor)[] = ['headOn', 'giveWay', 'standOn', 'overtaking', 'keepOut18', 'notImpede', 'port', 'speedUp']
  const exclude: Record<Action, (Action | Distractor)[]> = {
    headOn: ['headOn'],
    giveWay: ['giveWay'],
    standOn: ['standOn', 'standOnOvertaken'],
    standOnOvertaken: ['standOn', 'standOnOvertaken'],
    overtaking: ['overtaking', 'keepOut18', 'giveWay'],
    keepOut18: ['keepOut18', 'giveWay', 'headOn', 'overtaking'],
    notImpede: ['notImpede', 'giveWay', 'headOn'],
    anchored: ['anchored', 'aground'],
    aground: ['aground', 'anchored'],
  }
  const pool = all.filter((a) => !exclude[action].includes(a))
  if (action === 'anchored' || action === 'aground') pool.push(action === 'anchored' ? 'aground' : 'anchored')
  return pool
}
