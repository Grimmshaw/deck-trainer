import { newSeed } from '../art/scenery'
import { daySignature, nightSignature } from './geometry'
import { closeShipScene, randomShipScene, type ShipScene } from './scene'
import { ASPECTS, VESSELS, type Aspect, type Variant, type Vessel } from './vessels'

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
