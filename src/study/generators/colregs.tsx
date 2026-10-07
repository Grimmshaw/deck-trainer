import { newSeed } from '../../art/scenery'
import BearingDial from '../../colregs/BearingDial'
import {
  ACTION_TEXT,
  ACTION_WHY,
  bearingText,
  bearingWords,
  distractorsFor,
  makeEncounter,
  TEMPLATE_LABEL,
  TEMPLATES,
  type Template,
} from '../../colregs/encounter'
import { FOG_ACTION_TEXT, FOG_SECTOR_LABEL, FOG_SECTORS, fogDistractors, fogWhy, makeFogScenario, type FogScenario, type FogSector } from '../../colregs/fog'
import RadarSvg from '../../colregs/RadarSvg'
import { COLREGS_THEORY } from '../../content/colregsTheory'
import { randomShipScene } from '../../lights/scene'
import VesselSvg from '../../lights/VesselSvg'
import type { Generator, Question } from '../types'
import { sample, shuffle } from '../util'
import { theoryQuestion } from './theory'

// "What do you do?" scenarios built on the lights engine, plus theory questions.

const SIT = 'colregs:sit:'
const THEORY = 'colregs:q:'
const FOG = 'colregs:fog:'

function fogPrompt(f: FogScenario) {
  return `Restricted visibility (about ${f.visibility} nm). You are a power-driven vessel making way and sounding your fog signal. Radar shows an echo ${bearingWords(f.bearing)} (${bearingText(f.bearing)} relative), ${f.range} nm, bearing steady and range closing. Nothing is in sight. What do you do?`
}

function fogMedia(f: FogScenario) {
  return (
    <div className="encounter">
      <RadarSvg bearing={f.bearing} range={f.range} size={300} />
    </div>
  )
}

export const colregsGenerator: Generator = {
  category: 'colregs',
  items: () => [
    ...TEMPLATES.map((t) => SIT + t),
    ...FOG_SECTORS.map((f) => FOG + f),
    ...COLREGS_THEORY.map((q) => THEORY + q.id),
  ],

  label(key) {
    if (key.startsWith(SIT)) return TEMPLATE_LABEL[key.slice(SIT.length) as Template]
    if (key.startsWith(FOG)) return FOG_SECTOR_LABEL[key.slice(FOG.length) as FogSector]
    return COLREGS_THEORY.find((q) => THEORY + q.id === key)?.q ?? key
  },

  make(key): Question | null {
    if (key.startsWith(THEORY)) {
      const t = COLREGS_THEORY.find((q) => THEORY + q.id === key)
      return t ? theoryQuestion(key, 'colregs', t) : null
    }
    if (key.startsWith(FOG)) {
      const f = makeFogScenario(key.slice(FOG.length) as FogSector)
      return {
        key,
        category: 'colregs',
        prompt: fogPrompt(f),
        media: fogMedia(f),
        options: shuffle([f.action, ...fogDistractors(f.action)]).map((a) => ({ id: a, label: FOG_ACTION_TEXT[a] })),
        correctId: f.action,
        explanation: fogWhy(f),
      }
    }
    const e = makeEncounter(key.slice(SIT.length) as Template)
    const scene = randomShipScene(e.aspect, newSeed())
    const wrong = sample(distractorsFor(e.action), 3)
    const where = `${bearingWords(e.bearing)} (${bearingText(e.bearing)} relative)`
    return {
      key,
      category: 'colregs',
      prompt: `You are on a power-driven vessel making way. ${e.night ? 'At night you see these lights' : 'You see this vessel'} ${where}. The compass bearing is steady and the range is closing. What do you do?`,
      media: (
        <div className="encounter">
          <VesselSvg variant={e.variant} night={e.night} silhouette={false} scene={scene} size={340} />
          <div className="encounter-dial">
            <BearingDial bearing={e.bearing} size={96} />
            <span className="muted small">
              Relative bearing
              <br />
              <strong>{bearingText(e.bearing)}</strong>
            </span>
          </div>
        </div>
      ),
      reveal: e.night ? <VesselSvg variant={e.variant} scene={scene} size={340} /> : undefined,
      options: shuffle([e.action, ...wrong]).map((a) => ({ id: a, label: ACTION_TEXT[a] })),
      correctId: e.action,
      explanation: (
        <>
          She is: <strong>{e.vessel.name.toLowerCase()}</strong>
          {e.variant.label !== 'underway' ? `, ${e.variant.label}` : ''}. {ACTION_WHY[e.action]}
        </>
      ),
    }
  },

  card(key) {
    if (key.startsWith(THEORY)) {
      const t = COLREGS_THEORY.find((q) => THEORY + q.id === key)!
      return {
        title: t.source,
        front: <p className="card-text">{t.q}</p>,
        back: (
          <>
            <strong>{t.options[0]}</strong>
            <p>{t.why}</p>
          </>
        ),
      }
    }
    if (key.startsWith(FOG)) {
      const f = makeFogScenario(key.slice(FOG.length) as FogSector)
      return {
        title: 'Restricted visibility – Rule 19',
        front: (
          <div className="encounter">
            <RadarSvg bearing={f.bearing} range={f.range} size={260} />
            <p className="card-text small">
              Fog. Radar only: echo {bearingWords(f.bearing)}, steady bearing, closing. Which way do you turn?
            </p>
          </div>
        ),
        back: (
          <>
            <strong>{FOG_ACTION_TEXT[f.action]}</strong>
            <p>{fogWhy(f)}</p>
          </>
        ),
      }
    }
    const e = makeEncounter(key.slice(SIT.length) as Template)
    const scene = randomShipScene(e.aspect, newSeed())
    return {
      title: TEMPLATE_LABEL[e.template],
      front: (
        <div className="encounter">
          <VesselSvg variant={e.variant} night={e.night} silhouette={false} scene={scene} size={320} />
          <p className="card-text small">
            You are power-driven. She is {bearingWords(e.bearing)}, steady bearing, closing.
          </p>
        </div>
      ),
      back: (
        <>
          <strong>{ACTION_TEXT[e.action]}</strong>
          <p>{ACTION_WHY[e.action]}</p>
          <p className="muted small">She is: {e.vessel.name.toLowerCase()}.</p>
        </>
      ),
    }
  },
}
