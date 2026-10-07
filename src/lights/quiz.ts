import { newSeed } from '../art/scenery'
import { daySignature, nightSignature } from './geometry'
import { randomShipScene, type ShipScene } from './scene'
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
