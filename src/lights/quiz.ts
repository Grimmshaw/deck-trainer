import { newSeed } from '../art/scenery'
import { daySignature, nightSignature } from './geometry'
import { closeShipScene, randomShipScene, type ShipScene } from './scene'
import { ASPECTS, HULLS, VESSELS, type Aspect, type DayShape, type ShipLight, type ShipLightColor, type Variant, type Vessel } from './vessels'

export interface LightQuestion {
  vessel: Vessel
  variant: Variant
  night: boolean
  aspect: Aspect
  scene: ShipScene
  options: Vessel[]
  /** Other vessels that look exactly the same in this picture (kept out of the options) */
  lookalikes: Vessel[]
}

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

export function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Has something to show by day: a day shape or a sailing rig */
export function showsByDay(v: Variant): boolean {
  return v.shapes.length > 0 || v.hull === 'sail'
}

/**
 * Builds a question from the data model. At night it only uses aspects where
 * the lights can't be mistaken for another vessel's, so every question has
 * exactly one right answer among the options.
 */
export function makeLightQuestion(previousId?: string, onlyId?: string): LightQuestion {
  for (let attempt = 0; attempt < 300; attempt++) {
    const vessel = onlyId ? VESSELS.find((v) => v.id === onlyId)! : pick(VESSELS.filter((v) => v.id !== previousId))
    const variant = pick(vessel.variants)
    const night = vessel.dayOnly ? false : showsByDay(variant) ? Math.random() < 0.6 : true
    const aspect = pick(ASPECTS)

    let lookalikes: Vessel[]
    if (night) {
      const sig = nightSignature(variant, aspect.deg)
      if (sig === 'none') continue
      lookalikes = VESSELS.filter(
        (v) => v.id !== vessel.id && !v.dayOnly && v.variants.some((x) => nightSignature(x, aspect.deg) === sig),
      )
      // Ambiguous at night (for example only a sternlight): try again
      if (lookalikes.length > 0) continue
    } else {
      const sig = daySignature(variant)
      lookalikes = VESSELS.filter(
        (v) => v.id !== vessel.id && v.variants.some((x) => showsByDay(x) && daySignature(x) === sig),
      )
    }

    const pool = VESSELS.filter((v) => v.id !== vessel.id && !lookalikes.includes(v) && (night ? !v.dayOnly : true))
    return {
      vessel,
      variant,
      night,
      aspect,
      scene: randomShipScene(aspect.deg, newSeed()),
      options: shuffle([vessel, ...shuffle(pool).slice(0, 3)]),
      lookalikes,
    }
  }
  throw new Error('Could not make an unambiguous question')
}

// ---------- "Which picture shows ...?" ----------

export interface PickPicture {
  vessel: Vessel
  variant: Variant
  aspect: Aspect
  scene: ShipScene
}

export interface LightPickQuestion {
  target: Vessel
  night: boolean
  /** The right picture first, then three wrong ones (shuffle before showing) */
  pictures: PickPicture[]
}

/** Every night picture a vessel can show, from any aspect */
function allNightSignatures(v: Vessel): Set<string> {
  const s = new Set<string>()
  for (const x of v.variants) for (const a of ASPECTS) s.add(nightSignature(x, a.deg))
  return s
}

function allDaySignatures(v: Vessel): Set<string> {
  return new Set(v.variants.filter(showsByDay).map(daySignature))
}

/**
 * Four pictures, one of them the asked-for vessel. None of the wrong pictures
 * could show that vessel from any aspect, and the right picture could not be
 * any other vessel from any aspect.
 */
export function makeLightPickQuestion(onlyId?: string): LightPickQuestion {
  for (let attempt = 0; attempt < 400; attempt++) {
    const target = onlyId ? VESSELS.find((v) => v.id === onlyId)! : pick(VESSELS)
    const variant = pick(target.variants)
    const night = target.dayOnly ? false : showsByDay(variant) ? Math.random() < 0.5 : true
    const others = VESSELS.filter((v) => v.id !== target.id && (night ? !v.dayOnly : true))

    const sigOf = (v: Variant, deg: number) => (night ? nightSignature(v, deg) : daySignature(v))
    const targetSigs = night ? allNightSignatures(target) : allDaySignatures(target)

    const aspect = pick(ASPECTS)
    const sig = sigOf(variant, aspect.deg)
    if (sig === 'none') continue
    // The right picture must not be possible for any other vessel
    if (others.some((v) => (night ? allNightSignatures(v) : allDaySignatures(v)).has(sig))) continue

    const pictures: PickPicture[] = [{ vessel: target, variant, aspect, scene: closeShipScene(aspect.deg, newSeed()) }]
    const used = new Set([sig])
    for (const v of shuffle(others)) {
      if (pictures.length === 4) break
      for (let t = 0; t < 12; t++) {
        const x = pick(v.variants)
        if (!night && !showsByDay(x)) continue
        const a = pick(ASPECTS)
        const s = sigOf(x, a.deg)
        if (s === 'none' || targetSigs.has(s) || used.has(s)) continue
        used.add(s)
        pictures.push({ vessel: v, variant: x, aspect: a, scene: closeShipScene(a.deg, newSeed()) })
        break
      }
    }
    if (pictures.length === 4) return { target, night, pictures }
  }
  throw new Error('Could not make a picture question')
}

// ---------- "Which way is she heading?" ----------

export type Heading = 'towards' | 'leftToRight' | 'rightToLeft' | 'away'

export const HEADINGS: Heading[] = ['towards', 'leftToRight', 'rightToLeft', 'away']

export const HEADING_TEXT: Record<Heading, string> = {
  towards: 'Heading straight towards you',
  leftToRight: 'Crossing from your left to your right',
  rightToLeft: 'Crossing from your right to your left',
  away: 'Heading away from you',
}

/** Where you are, seen from her bow, for each answer */
const HEADING_ASPECTS: Record<Heading, number[]> = {
  towards: [0],
  // You see her starboard side, so she moves from your left to your right
  leftToRight: [45, 90],
  rightToLeft: [-45, -90],
  away: [135, 180, -135],
}

export const HEADING_WHY: Record<Heading, string> = {
  towards: 'You see both sidelights (and two masthead lights in line, if she has them): she is coming straight at you.',
  leftToRight: 'You see her green sidelight but not her red one or her sternlight: you are on her starboard side, so she is crossing from your left to your right.',
  rightToLeft: 'You see her red sidelight but not her green one or her sternlight: you are on her port side, so she is crossing from your right to your left.',
  away: 'You see her sternlight (and maybe a towing light) but no sidelights or masthead lights: she is heading away from you.',
}

export interface HeadingQuestion {
  vessel: Vessel
  variant: Variant
  aspect: Aspect
  scene: ShipScene
}

/** A vessel underway with sidelights, seen at night from an aspect that matches the answer */
export function makeHeadingQuestion(heading: Heading): HeadingQuestion {
  const pool = VESSELS.flatMap((vessel) =>
    vessel.dayOnly ? [] : vessel.variants.filter((v) => v.lights.some((l) => l.kind === 'sideStbd')).map((variant) => ({ vessel, variant })),
  )
  const { vessel, variant } = pick(pool)
  const deg = pick(HEADING_ASPECTS[heading])
  const aspect = ASPECTS.find((a) => a.deg === deg)!
  return { vessel, variant, aspect, scene: randomShipScene(aspect.deg, newSeed()) }
}

// ---------- "What is wrong with her signals?" ----------

export type FixToken = DayShape | ShipLightColor

export interface FixQuestion {
  vessel: Vessel
  night: boolean
  /** What she should show, top to bottom */
  correct: FixToken[]
  /** What the picture shows */
  shown: FixToken[]
  /** Picture to draw */
  variant: Variant
  aspect: Aspect
  scene: ShipScene
  /** Other lists offered as wrong answers */
  decoys: FixToken[][]
}

const SHAPE_ALPHABET: DayShape[] = ['ball', 'diamond', 'cylinder', 'coneUp', 'coneDown']
const LIGHT_ALPHABET: ShipLightColor[] = ['R', 'W', 'G']

/** The vertical line of all-round signal lights (not anchor lights) */
function signalLights(v: Variant): ShipLight[] {
  const x = HULLS[v.hull].signalX
  return v.lights.filter((l) => l.kind === 'allRound' && l.x === x).sort((a, b) => b.z - a.z)
}

/** Vessels that can be asked about, by day (shapes) or by night (signal lights) */
export function fixCandidates(night: boolean): Vessel[] {
  return VESSELS.filter((v) =>
    v.id !== 'sailing' &&
    v.variants.some((x) => (night ? !v.dayOnly && signalLights(x).length > 0 : x.shapes.length > 0)),
  )
}

const same = (a: FixToken[], b: FixToken[]) => a.length === b.length && a.every((t, i) => t === b[i])

/** One small change: replace, remove, add or swap */
function mutate(list: FixToken[], alphabet: FixToken[]): FixToken[] {
  for (let i = 0; i < 50; i++) {
    const out = [...list]
    const kind = pick(['replace', 'replace', 'remove', 'add', 'swap'])
    if (kind === 'replace') out[Math.floor(Math.random() * out.length)] = pick(alphabet)
    else if (kind === 'remove' && out.length > 1) out.splice(Math.floor(Math.random() * out.length), 1)
    else if (kind === 'add' && out.length < 3) out.splice(Math.floor(Math.random() * (out.length + 1)), 0, pick(alphabet))
    else if (kind === 'swap' && out.length > 1) {
      const j = Math.floor(Math.random() * (out.length - 1))
      ;[out[j], out[j + 1]] = [out[j + 1], out[j]]
    }
    if (!same(out, list)) return out
  }
  return [...list, pick(alphabet)]
}

function withSignals(v: Variant, colors: ShipLightColor[]): Variant {
  const old = signalLights(v)
  const s = HULLS[v.hull]
  const top = old.length ? old[0].z : s.signalTop
  const kept = v.lights.filter((l) => !old.includes(l))
  const fresh = colors.map((c, i): ShipLight => ({ kind: 'allRound', color: c, x: s.signalX, y: 0, z: top - i * s.signalStep }))
  return { ...v, lights: [...fresh, ...kept] }
}

export function makeFixQuestion(vesselId: string): FixQuestion {
  const vessel = VESSELS.find((v) => v.id === vesselId)!
  const canNight = !vessel.dayOnly && vessel.variants.some((x) => signalLights(x).length > 0)
  const canDay = vessel.variants.some((x) => x.shapes.length > 0)
  const night = canNight && canDay ? Math.random() < 0.5 : canNight
  const base = pick(vessel.variants.filter((x) => (night ? signalLights(x).length > 0 : x.shapes.length > 0)))
  const correct: FixToken[] = night ? signalLights(base).map((l) => l.color) : [...base.shapes]
  const alphabet: FixToken[] = night ? LIGHT_ALPHABET : SHAPE_ALPHABET

  // About one picture in five is correct, so "nothing is wrong" must be considered too
  const shown = Math.random() < 0.2 ? [...correct] : mutate(correct, alphabet)
  const variant = night ? withSignals(base, shown as ShipLightColor[]) : { ...base, shapes: shown as DayShape[] }

  // Wrong answers: other small changes, never what is shown and never the right list
  const decoys: FixToken[][] = []
  for (let i = 0; i < 100 && decoys.length < 3; i++) {
    const d = mutate(pick([correct, shown]), alphabet)
    if (same(d, correct) || same(d, shown) || decoys.some((x) => same(x, d))) continue
    decoys.push(d)
  }

  const aspect = pick(ASPECTS.filter((a) => Math.abs(a.deg) <= 90))
  return { vessel, night, correct, shown, variant, aspect, scene: randomShipScene(aspect.deg, newSeed()), decoys }
}

const TOKEN_TEXT: Record<FixToken, string> = {
  ball: 'ball',
  diamond: 'diamond',
  cylinder: 'cylinder',
  coneUp: 'cone point up',
  coneDown: 'cone point down',
  R: 'red',
  W: 'white',
  G: 'green',
  Y: 'yellow',
}

/** "ball, diamond, ball" or "red over white over red" */
export function describeTokens(list: FixToken[], night: boolean): string {
  const words = list.map((t) => TOKEN_TEXT[t])
  return night ? `${words.join(' over ')} (all-round lights)` : `${words.join(', ')} (top to bottom)`
}
