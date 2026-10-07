import type { CategoryId } from './categories'
import { buoyageGenerator } from './generators/buoyage'
import { chartGenerator } from './generators/chart'
import { colregsGenerator } from './generators/colregs'
import { distressGenerator } from './generators/distress'
import { flagsGenerator } from './generators/flags'
import { lightsGenerator } from './generators/lights'
import { morseGenerator } from './generators/morse'
import { soundGenerator } from './generators/sound'
import { withTheory } from './generators/theory'
import type { Generator } from './types'
import { CHART_THEORY } from '../content/chartTheory'
import { DISTRESS_THEORY } from '../content/distressTheory'
import { FLAGS_THEORY } from '../content/flagsTheory'
import { LIGHTS_THEORY } from '../content/lightsTheory'
import { MORSE_THEORY } from '../content/morseTheory'
import { SOUND_THEORY } from '../content/soundTheory'

export const GENERATORS: Partial<Record<CategoryId, Generator>> = {
  morse: withTheory(morseGenerator, MORSE_THEORY, 'Morse'),
  buoyage: buoyageGenerator,
  lights: withTheory(lightsGenerator, LIGHTS_THEORY, 'Lights & shapes'),
  colregs: colregsGenerator,
  sound: withTheory(soundGenerator, SOUND_THEORY, 'Sound signals'),
  flags: withTheory(flagsGenerator, FLAGS_THEORY, 'Signal flags'),
  distress: withTheory(distressGenerator, DISTRESS_THEORY, 'Distress'),
  chart: withTheory(chartGenerator, CHART_THEORY, 'Chart'),
}

/** The categories mixed in the final exam */
export const EXAM_CATEGORIES: CategoryId[] = ['morse', 'buoyage', 'lights', 'colregs', 'sound', 'flags', 'distress', 'chart']
