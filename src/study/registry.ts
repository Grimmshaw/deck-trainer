import type { CategoryId } from './categories'
import { buoyageGenerator } from './generators/buoyage'
import { colregsGenerator } from './generators/colregs'
import { distressGenerator } from './generators/distress'
import { flagsGenerator } from './generators/flags'
import { lightsGenerator } from './generators/lights'
import { morseGenerator } from './generators/morse'
import { soundGenerator } from './generators/sound'
import type { Generator } from './types'

export const GENERATORS: Partial<Record<CategoryId, Generator>> = {
  morse: morseGenerator,
  buoyage: buoyageGenerator,
  lights: lightsGenerator,
  colregs: colregsGenerator,
  sound: soundGenerator,
  flags: flagsGenerator,
  distress: distressGenerator,
}

/** The categories mixed in the final exam */
export const EXAM_CATEGORIES: CategoryId[] = ['morse', 'buoyage', 'lights', 'colregs', 'sound', 'flags', 'distress']
