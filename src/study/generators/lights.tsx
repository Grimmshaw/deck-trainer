import { newSeed } from '../../art/scenery'
import { makeLightPickQuestion, makeLightQuestion } from '../../lights/quiz'
import { randomShipScene } from '../../lights/scene'
import VesselSvg from '../../lights/VesselSvg'
import { ASPECTS, VESSELS } from '../../lights/vessels'
import type { Generator, Question } from '../types'
import { pick, shuffle } from '../util'

// "What is this vessel?" from her lights at night or her day shapes.
// Built on the navigation lights engine, which avoids ambiguous pictures.

const PREFIX = 'lights:'

export const lightsGenerator: Generator = {
  category: 'lights',
  items: () => VESSELS.map((v) => PREFIX + v.id),
  label: (key) => VESSELS.find((v) => PREFIX + v.id === key)?.name ?? key,

  make(key): Question | null {
    // About one question in three is the other way round: pick the right picture
    if (Math.random() < 0.35) return pickQuestion(key)
    const q = makeLightQuestion(undefined, key.slice(PREFIX.length))
    const variantNote = q.variant.label !== 'underway' ? ` She is ${q.variant.label}.` : ''
    return {
      key,
      category: 'lights',
      prompt: q.night ? 'At night you see these lights. What is it?' : 'By day you see this. What is it?',
      media: <VesselSvg variant={q.variant} night={q.night} silhouette={false} scene={q.scene} size={340} />,
      reveal: q.vessel.dayOnly ? undefined : <VesselSvg variant={q.variant} night={!q.night} scene={q.scene} size={340} />,
      options: q.options.map((v) => ({ id: v.id, label: v.name })),
      correctId: q.vessel.id,
      explanation: (
        <>
          {q.vessel.description} You are {q.aspect.name}.{variantNote} <strong>{q.vessel.rule}</strong>
          {q.lookalikes.length > 0 && (
            <span className="muted">
              {' '}
              By day, the same shapes are shown by: {q.lookalikes.map((v) => v.name.toLowerCase()).join(', ')}.
            </span>
          )}
        </>
      ),
    }
  },

  card(key) {
    const vessel = VESSELS.find((v) => PREFIX + v.id === key)!
    const variant = pick(vessel.variants)
    const aspect = pick(ASPECTS.filter((a) => Math.abs(a.deg) <= 90))
    const scene = randomShipScene(aspect.deg, newSeed())
    return {
      title: vessel.name,
      front: <VesselSvg variant={variant} night={!vessel.dayOnly} silhouette={false} scene={scene} size={320} />,
      back: (
        <>
          <strong>{vessel.name}</strong>
          <p>
            {vessel.description} <span className="rule">{vessel.rule}</span>
          </p>
          <p className="muted small">
            You are {aspect.name}. She is {variant.label}.
          </p>
          <VesselSvg variant={variant} scene={scene} size={320} />
        </>
      ),
    }
  },
}

function pickQuestion(key: string): Question {
  const q = makeLightPickQuestion(key.slice(PREFIX.length))
  const right = q.pictures[0]
  return {
    key,
    category: 'lights',
    prompt: q.night
      ? `At night: which picture shows a ${lower(q.target.name)}?`
      : `By day: which picture shows a ${lower(q.target.name)}?`,
    layout: 'pictures',
    options: shuffle(q.pictures).map((p) => ({
      id: p.vessel.id,
      label: `${p.vessel.name}${p.variant.label !== 'underway' ? ` (${p.variant.label})` : ''}`,
      node: <VesselSvg variant={p.variant} night={q.night} silhouette={false} scene={p.scene} size={170} zoom={q.night ? 1.6 : 1.3} />,
    })),
    correctId: q.target.id,
    explanation: (
      <>
        {q.target.description} In the right picture you are {right.aspect.name}. <strong>{q.target.rule}</strong>
      </>
    ),
  }
}

/** "Vessel at anchor" -> "vessel at anchor", but keep "Power-driven" readable */
function lower(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1)
}
