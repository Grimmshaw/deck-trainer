import { newSeed } from '../../art/scenery'
import {
  describeTokens,
  fixCandidates,
  HEADING_TEXT,
  HEADING_WHY,
  HEADINGS,
  makeFixQuestion,
  makeHeadingQuestion,
  makeLightPickQuestion,
  makeLightQuestion,
  type Heading,
} from '../../lights/quiz'
import { closeShipScene, randomShipScene } from '../../lights/scene'
import { daySignature } from '../../lights/geometry'
import VesselSvg from '../../lights/VesselSvg'
import { ASPECTS, VESSELS } from '../../lights/vessels'
import type { Generator, Question } from '../types'
import { pick, shuffle } from '../util'

// "What is this vessel?" from her lights at night or her day shapes.
// Built on the navigation lights engine, which avoids ambiguous pictures.

const PREFIX = 'lights:'
const HEADING = 'lights:heading:'
const FIX = 'lights:fix:'

export const lightsGenerator: Generator = {
  category: 'lights',
  items: () => [
    ...VESSELS.map((v) => PREFIX + v.id),
    ...HEADINGS.map((h) => HEADING + h),
    ...[...new Set([...fixCandidates(true), ...fixCandidates(false)])].map((v) => FIX + v.id),
  ],
  label: (key) => {
    if (key.startsWith(HEADING)) return `Which way is she heading? (${HEADING_TEXT[key.slice(HEADING.length) as Heading].toLowerCase()})`
    if (key.startsWith(FIX)) return `What is wrong? (${VESSELS.find((v) => FIX + v.id === key)?.name.toLowerCase()})`
    return VESSELS.find((v) => PREFIX + v.id === key)?.name ?? key
  },

  pairs: () =>
    VESSELS.flatMap((v) => {
      const variant = v.variants.find((x) => x.shapes.length > 0)
      if (!variant) return []
      return [
        {
          key: PREFIX + v.id,
          group: daySignature(variant),
          left: <VesselSvg variant={variant} scene={closeShipScene(45, newSeed())} size={130} zoom={1.3} />,
          right: v.name,
        },
      ]
    }),
  make(key): Question | null {
    if (key.startsWith(HEADING)) return headingQuestion(key)
    if (key.startsWith(FIX)) return fixQuestion(key)
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
    if (key.startsWith(HEADING)) {
      const h = key.slice(HEADING.length) as Heading
      const q = makeHeadingQuestion(h)
      return {
        title: 'Which way is she heading?',
        front: <VesselSvg variant={q.variant} night silhouette={false} scene={q.scene} size={320} />,
        back: (
          <>
            <strong>{HEADING_TEXT[h]}</strong>
            <p>{HEADING_WHY[h]}</p>
          </>
        ),
      }
    }
    if (key.startsWith(FIX)) {
      const q = makeFixQuestion(key.slice(FIX.length))
      return {
        title: q.vessel.name,
        front: <p className="card-text">What does a {q.vessel.name.toLowerCase()} show {q.night ? 'at night' : 'by day'}?</p>,
        back: (
          <>
            <strong>{describeTokens(q.correct, q.night)}</strong>
            <p>
              {q.vessel.description} <span className="rule">{q.vessel.rule}</span>
            </p>
          </>
        ),
      }
    }
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

function headingQuestion(key: string): Question {
  const h = key.slice(HEADING.length) as Heading
  const q = makeHeadingQuestion(h)
  return {
    key,
    category: 'lights',
    prompt: 'At night you see these lights. Which way is she heading?',
    media: <VesselSvg variant={q.variant} night silhouette={false} scene={q.scene} size={340} />,
    reveal: <VesselSvg variant={q.variant} scene={q.scene} size={340} />,
    options: HEADINGS.map((x) => ({ id: x, label: HEADING_TEXT[x] })),
    correctId: h,
    explanation: (
      <>
        {HEADING_WHY[h]} She is {article(q.vessel.name)} {lower(q.vessel.name)} and you are {q.aspect.name}.
      </>
    ),
  }
}

function fixQuestion(key: string): Question {
  const q = makeFixQuestion(key.slice(FIX.length))
  const ok = q.shown.length === q.correct.length && q.shown.every((t, i) => t === q.correct[i])
  const lists = ok ? q.decoys.slice(0, 3) : [q.correct, ...q.decoys.slice(0, 2)]
  const options = [
    { id: 'ok', label: 'Nothing is wrong – she shows the right signals' },
    ...lists.map((l, i) => ({ id: i === 0 && !ok ? 'fix' : `d${i}`, label: `She should show: ${describeTokens(l, q.night)}` })),
  ]
  return {
    key,
    category: 'lights',
    prompt: `This is ${article(q.vessel.name)} ${lower(q.vessel.name)}${variantNote(q.vessel.name, q.variant.label)}. ${
      q.night ? 'At night she shows these lights.' : 'By day she shows these shapes.'
    } What is wrong?`,
    media: <VesselSvg variant={q.variant} night={q.night} silhouette={false} scene={q.scene} size={340} />,
    options: shuffle(options),
    correctId: ok ? 'ok' : 'fix',
    explanation: (
      <>
        {ok ? 'Nothing is wrong. ' : `She shows ${describeTokens(q.shown, q.night)} but should show ${describeTokens(q.correct, q.night)}. `}
        {q.vessel.description} <strong>{q.vessel.rule}</strong>
      </>
    ),
  }
}

function article(name: string): string {
  return /^[aeiou]/i.test(name) ? 'an' : 'a'
}

/** ", not making way" – but nothing when the label only repeats the name ("aground", "underway") */
function variantNote(name: string, label: string): string {
  if (label === 'underway' || name.toLowerCase().includes(label.toLowerCase()) || label === 'towing astern' || label === 'under sail and engine') return ''
  return `, ${label}`
}
