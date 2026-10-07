import { newSeed } from '../../art/scenery'
import BuoySvg from '../../buoyage/BuoySvg'
import { getMark, MARK_IDS, type Mark, type MarkId, type Region } from '../../buoyage/marks'
import { randomScene } from '../../buoyage/scene'
import { IALA_THEORY } from '../../content/ialaTheory'
import { charLight, CHARS, coloursFor, withColour } from '../../buoyage/characters'
import LightBlinker from '../../buoyage/LightBlinker'
import type { Generator, Question } from '../types'
import { pick, sample, shuffle } from '../util'
import { theoryQuestion } from './theory'

// Buoyage questions: "what is this mark?" generated from the IALA data model
// (by day or only the light at night), plus the reviewed theory questions.

const MARK_PREFIX = 'iala:mark:'
const THEORY_PREFIX = 'iala:q:'
const CHAR_PREFIX = 'iala:char:'

export const buoyageGenerator: Generator = {
  category: 'buoyage',
  items: () => [
    ...MARK_IDS.map((id) => MARK_PREFIX + id),
    ...CHARS.map((c) => CHAR_PREFIX + c.spec),
    ...IALA_THEORY.map((q) => THEORY_PREFIX + q.id),
  ],

  label(key, ctx) {
    if (key.startsWith(MARK_PREFIX)) return getMark(key.slice(MARK_PREFIX.length) as MarkId, ctx.region.buoyage).name
    if (key.startsWith(CHAR_PREFIX)) return `Light character ${key.slice(CHAR_PREFIX.length)}`
    const t = IALA_THEORY.find((q) => THEORY_PREFIX + q.id === key)
    return t ? t.q : key
  },

  pairs: (ctx) =>
    MARK_IDS.map((id) => {
      const m = getMark(id, ctx.region.buoyage)
      return { key: MARK_PREFIX + id, group: id, left: <BuoySvg mark={m} size={70} />, right: m.name }
    }),
  make(key, ctx): Question | null {
    if (key.startsWith(THEORY_PREFIX)) {
      const t = IALA_THEORY.find((q) => THEORY_PREFIX + q.id === key)
      return t ? theoryQuestion(key, 'buoyage', t) : null
    }
    if (key.startsWith(CHAR_PREFIX)) return charQuestion(key)
    const region = ctx.region.buoyage
    const mark = getMark(key.slice(MARK_PREFIX.length) as MarkId, region)
    // About one question in three is the other way round: pick the right picture
    if (Math.random() < 0.35) return pickMark(key, mark, region)
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
    if (key.startsWith(CHAR_PREFIX)) {
      const spec = key.slice(CHAR_PREFIX.length)
      return {
        title: 'Light character',
        front: (
          <div className="chart-stage">
            <LightBlinker light={charLight(spec, 'W')} />
          </div>
        ),
        back: <strong>{spec}</strong>,
      }
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

function charQuestion(key: string): Question {
  const spec = key.slice(CHAR_PREFIX.length)
  const c = CHARS.find((x) => x.spec === spec)!
  const colour = pick(coloursFor(c))
  const fits = CHARS.filter((x) => x.spec !== spec && coloursFor(x).includes(colour))
  const near = shuffle(fits.filter((x) => x.family === c.family)).slice(0, 2)
  const far = shuffle(fits.filter((x) => !near.includes(x)))
  const wrong = [...near, ...far].slice(0, 3)
  const label = withColour(spec, colour)
  return {
    key,
    category: 'buoyage',
    prompt: 'Watch the light and time it with the stopwatch. Which character is it?',
    media: <LightBlinker light={charLight(spec, colour)} />,
    options: shuffle([c, ...wrong]).map((x) => ({ id: x.spec, label: withColour(x.spec, colour) })),
    correctId: spec,
    explanation: (
      <>
        <strong>{label}</strong>. {CHAR_HELP[c.family]}
      </>
    ),
  }
}

const CHAR_HELP: Record<string, string> = {
  fl: 'Fl = flashing: the light is on for less time than it is off. The figure in brackets is the number of flashes in each group, and the last figure is the period – the time for one whole cycle.',
  long: 'LFl = a long flash of at least 2 s. Iso = equal light and dark. Oc = occulting: light longer than dark. Mo(A) = Morse letter A.',
  q: 'Q = quick (50–60 flashes a minute), VQ = very quick (100–120 a minute). The figure in brackets is the number of flashes in a group – 3 east, 6 + long flash south, 9 west, continuous north.',
}

function pickMark(key: string, mark: Mark, region: Region): Question {
  const others = sample(
    MARK_IDS.filter((id) => id !== mark.id).map((id) => getMark(id, region)),
    3,
  )
  return {
    key,
    category: 'buoyage',
    prompt: `Region ${region}. Which picture shows ${markPhrase(mark.name)}?`,
    layout: 'pictures',
    options: shuffle([mark, ...others]).map((m) => ({
      id: m.id,
      label: m.name,
      node: (
        <div className="buoy-stage buoy-pick">
          <BuoySvg mark={m} scene={randomScene(m, newSeed())} size={120} />
        </div>
      ),
    })),
    correctId: mark.id,
    explanation: <>{mark.meaning}</>,
  }
}

/** "West cardinal mark" -> "a west cardinal mark", "Preferred channel to port" -> "a “preferred channel to port” mark" */
function markPhrase(name: string): string {
  const n = name.charAt(0).toLowerCase() + name.slice(1)
  const phrase = n.startsWith('preferred') ? `“${n}” mark` : n
  return `${/^[aeiou]/i.test(phrase) ? 'an' : 'a'} ${phrase}`
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
