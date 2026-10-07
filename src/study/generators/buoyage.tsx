import { newSeed } from '../../art/scenery'
import BuoySvg from '../../buoyage/BuoySvg'
import { getMark, MARK_IDS, type MarkId } from '../../buoyage/marks'
import { randomScene } from '../../buoyage/scene'
import { IALA_THEORY } from '../../content/ialaTheory'
import type { Generator, Question } from '../types'
import { pick, sample, shuffle } from '../util'
import { theoryQuestion } from './theory'

// Buoyage questions: "what is this mark?" generated from the IALA data model
// (by day or only the light at night), plus the reviewed theory questions.

const MARK_PREFIX = 'iala:mark:'
const THEORY_PREFIX = 'iala:q:'

export const buoyageGenerator: Generator = {
  category: 'buoyage',
  items: () => [...MARK_IDS.map((id) => MARK_PREFIX + id), ...IALA_THEORY.map((q) => THEORY_PREFIX + q.id)],

  label(key, ctx) {
    if (key.startsWith(MARK_PREFIX)) return getMark(key.slice(MARK_PREFIX.length) as MarkId, ctx.region.buoyage).name
    const t = IALA_THEORY.find((q) => THEORY_PREFIX + q.id === key)
    return t ? t.q : key
  },

  make(key, ctx): Question | null {
    if (key.startsWith(THEORY_PREFIX)) {
      const t = IALA_THEORY.find((q) => THEORY_PREFIX + q.id === key)
      return t ? theoryQuestion(key, 'buoyage', t) : null
    }
    const region = ctx.region.buoyage
    const mark = getMark(key.slice(MARK_PREFIX.length) as MarkId, region)
    const others = sample(
      MARK_IDS.filter((id) => id !== mark.id).map((id) => getMark(id, region)),
      3,
    )
    const night = Math.random() < 0.5
    const light = pick(mark.lights)
    const scene = randomScene(mark, newSeed())
    return {
      key,
      category: 'buoyage',
      prompt: night
        ? `Region ${region}. At night you see this light. What is it?`
        : `Region ${region}. What is this mark?`,
      media: (
        <div className="buoy-stage">
          <BuoySvg mark={mark} light={light} night={night} silhouette={false} scene={scene} size={190} />
        </div>
      ),
      reveal: night ? (
        <div className="buoy-stage">
          <BuoySvg mark={mark} scene={scene} size={150} />
        </div>
      ) : undefined,
      options: shuffle([mark, ...others]).map((m) => ({ id: m.id, label: m.name })),
      correctId: mark.id,
      explanation: (
        <>
          {mark.meaning} Light: <strong>{light.label}</strong>
        </>
      ),
    }
  },

  card(key, ctx) {
    if (key.startsWith(THEORY_PREFIX)) {
      const t = IALA_THEORY.find((q) => THEORY_PREFIX + q.id === key)!
      return { title: 'IALA', front: <p className="card-text">{t.q}</p>, back: <TheoryBack t={t} /> }
    }
    const mark = getMark(key.slice(MARK_PREFIX.length) as MarkId, ctx.region.buoyage)
    const scene = randomScene(mark, newSeed())
    return {
      title: mark.name,
      front: (
        <div className="buoy-stage">
          <BuoySvg mark={mark} scene={scene} size={170} />
        </div>
      ),
      back: (
        <>
          <strong>{mark.name}</strong>
          <p>{mark.meaning}</p>
          <p className="muted">Lights: {mark.lights.map((l) => l.label).join(', ')}</p>
          <div className="buoy-stage">
            <BuoySvg mark={mark} night scene={scene} size={120} />
          </div>
        </>
      ),
    }
  },
}

function TheoryBack({ t }: { t: { options: string[]; why: string; source: string } }) {
  return (
    <>
      <strong>{t.options[0]}</strong>
      <p>{t.why}</p>
      <p className="muted small">{t.source}</p>
    </>
  )
}
