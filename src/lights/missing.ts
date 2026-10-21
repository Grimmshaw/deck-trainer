import { newSeed } from '../art/scenery'
import { isVisible } from './geometry'
import { closeShipScene, type ShipScene } from './scene'
import { aspectsFor, VESSELS, type Aspect, type ShipLight, type Variant, type Vessel } from './vessels'

// "One light is missing – what should be here?" The vessel is named in the
// question, so the full set of lights is known, and the marked position plus
// the aspect decide which light it is.

export type MissingId = 'masthead' | 'sideStbd' | 'sidePort' | 'stern' | 'towing' | 'allW' | 'allR' | 'allG'

export const MISSING_TEXT: Record<MissingId, string> = {
  masthead: 'White masthead light',
  sideStbd: 'Green sidelight',
  sidePort: 'Red sidelight',
  stern: 'White sternlight',
  towing: 'Yellow towing light',
  allW: 'All-round white light',
  allR: 'All-round red light',
  allG: 'All-round green light',
}

export function missingId(l: ShipLight): MissingId {
  if (l.kind !== 'allRound') return l.kind
  return l.color === 'R' ? 'allR' : l.color === 'G' ? 'allG' : 'allW'
}

/** Wrong answers that look plausible next to the right one */
const NEAR: Record<MissingId, MissingId[]> = {
  masthead: ['allW', 'stern', 'allR', 'towing'],
  sideStbd: ['sidePort', 'allG', 'masthead', 'stern'],
  sidePort: ['sideStbd', 'allR', 'masthead', 'stern'],
  stern: ['masthead', 'towing', 'allW', 'sideStbd'],
  towing: ['stern', 'masthead', 'allW', 'allR'],
  allW: ['masthead', 'allR', 'allG', 'stern'],
  allR: ['allW', 'allG', 'sidePort', 'masthead'],
  allG: ['allW', 'allR', 'sideStbd', 'masthead'],
}

export function missingDistractors(id: MissingId): MissingId[] {
  return NEAR[id].slice(0, 3)
}

/** Variants that can be asked about: shown at night, and no optional lights */
function usable(v: Vessel): Variant[] {
  if (v.dayOnly) return []
  // Not a light of a combined tricolour lantern either: the lantern is one light
  return v.variants.filter((x) => !x.label.includes('optional') && !x.label.includes('tricolour') && x.lights.length >= 2)
}

export function missingCandidates(): Vessel[] {
  return VESSELS.filter((v) => usable(v).length > 0)
}

export interface MissingQuestion {
  vessel: Vessel
  /** The full variant (for the answer picture) */
  variant: Variant
  /** The variant without the missing light (for the question picture) */
  shown: Variant
  missing: ShipLight
  aspect: Aspect
  scene: ShipScene
}

export function makeMissingQuestion(vesselId: string): MissingQuestion | null {
  const vessel = VESSELS.find((v) => v.id === vesselId)
  if (!vessel) return null
  const variants = usable(vessel)
  for (let attempt = 0; attempt < 60; attempt++) {
    const variant = variants[Math.floor(Math.random() * variants.length)]
    // At least one light must remain, so the marker isn't alone in the dark
    const aspects = aspectsFor(vessel).filter((a) => variant.lights.filter((l) => isVisible(l, a.deg)).length >= 2)
    if (!aspects.length) continue
    const aspect = aspects[Math.floor(Math.random() * aspects.length)]
    const seen = variant.lights.filter((l) => isVisible(l, aspect.deg))
    // Signal lights (the ones that tell what she is) are asked about more often
    const signal = seen.filter((l) => l.kind === 'allRound' || l.kind === 'towing')
    const pool = signal.length && Math.random() < 0.6 ? signal : seen
    const missing = pool[Math.floor(Math.random() * pool.length)]
    const shown = { ...variant, lights: variant.lights.filter((l) => l !== missing) }
    return { vessel, variant, shown, missing, aspect, scene: closeShipScene(aspect.deg, newSeed()) }
  }
  return null
}
