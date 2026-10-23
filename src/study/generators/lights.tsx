import { newSeed } from '../../art/scenery'
import {
  describeTokens,
  canAskAtNight,
  fixCandidates,
  hasDayShapes,
  HEADING_TEXT,
  HEADING_WHY,
  HEADINGS,
  makeFixQuestion,
  makeHeadingQuestion,
  makeLightPickQuestion,
  makeLightQuestion,
  type Heading,
  type When,
} from '../../lights/quiz'
import { closeShipScene, randomShipScene } from '../../lights/scene'
import { daySignature, nightSignature } from '../../lights/geometry'
import VesselSvg from '../../lights/VesselSvg'
import ArcDiagram, { type ArcLight } from '../../lights/ArcDiagram'
import { makeMissingQuestion, missingCandidates, missingDistractors, missingId, MISSING_TEXT } from '../../lights/missing'
import { aspectsFor, VESSELS } from '../../lights/vessels'
import type { Ctx, Generator, MatchPair, Question } from '../types'
import { between, pick, shuffle } from '../util'
import { HEADING_TYPED, VESSEL_TYPED } from '../typedAnswers'

// "What is this vessel?" from her lights at night or her day shapes.
// Built on the navigation lights engine, which avoids ambiguous pictures.

const PREFIX = 'lights:'
const HEADING = 'lights:heading:'
const FIX = 'lights:fix:'
/** Seen from above: which lights do you see from here? */
const ARC_POS = 'lights:arcpos:'
/** Seen from above: which light shows over this arc? */
const ARC = 'lights:arc:'
/** One light is missing: what should be there? */
const MISSING = 'lights:missing:'

type ArcPos = 'ahead' | 'stbd' | 'port' | 'astern'
const ARC_POSITIONS: ArcPos[] = ['ahead', 'stbd', 'port', 'astern']
const ARC_POS_TEXT: Record<ArcPos, string> = {
  ahead: 'Masthead light, red and green sidelights',
  stbd: 'Masthead light and green sidelight',
  port: 'Masthead light and red sidelight',
  astern: 'Sternlight only',
}
const ARC_POS_WHY: Record<ArcPos, string> = {
  ahead:
    'You are right ahead of her: you see the masthead light (225°) and both sidelights, green on your left and red on your right.',
  stbd: 'You are on her starboard side, forward of 22.5° abaft the beam: inside the arcs of the masthead light (225°) and the green sidelight (112.5°).',
  port: 'You are on her port side, forward of 22.5° abaft the beam: inside the arcs of the masthead light (225°) and the red sidelight (112.5°).',
  astern: 'You are more than 22.5° abaft her beam: only the sternlight (135°) shows there. The masthead light and the sidelights are hidden.',
}
const ARC_LIGHTS: ArcLight[] = ['masthead', 'stbd', 'port', 'stern']
const ARC_LIGHT_TEXT: Record<ArcLight, string> = {
  masthead: 'Masthead light',
  stbd: 'Starboard sidelight (green)',
  port: 'Port sidelight (red)',
  stern: 'Sternlight',
}
const ARC_LIGHT_WHY: Record<ArcLight, string> = {
  masthead: 'The masthead light shows over 225°: from right ahead to 22.5° abaft the beam on either side. Rule 21(a).',
  stbd: 'The green starboard sidelight shows over 112.5°: from right ahead to 22.5° abaft the beam on the starboard side. Rule 21(b).',
  port: 'The red port sidelight shows over 112.5°: from right ahead to 22.5° abaft the beam on the port side. Rule 21(b).',
  stern: 'The sternlight shows over 135°: 67.5° to each side of right astern. Rule 21(c).',
}

/** An observer bearing well inside the sector, never on a boundary */
function arcBearing(p: ArcPos): number {
  if (p === 'ahead') return 0
  if (p === 'stbd') return Math.round(between(15, 100))
  if (p === 'port') return -Math.round(between(15, 100))
  return Math.round(between(125, 235))
}

/** The new picture questions (arcs from above, missing light) – night only */
const nightExtras = () => [
  ...ARC_POSITIONS.map((p) => ARC_POS + p),
  ...ARC_LIGHTS.map((l) => ARC + l),
  ...missingCandidates().map((v) => MISSING + v.id),
]

/** Lights only = night pictures, day shapes only = day pictures, otherwise both */
function when(ctx: Ctx): When | undefined {
  return ctx.focus === 'lights' ? 'night' : ctx.focus === 'shapes' ? 'day' : undefined
}

export const lightsGenerator: Generator = {
  category: 'lights',
  focus: {
    lights: 'Lights at night – what is she, and which way is she heading?',
    shapes: 'Day shapes – balls, cones, diamonds and cylinders',
    both: 'Lights and day shapes mixed',
  },
  items: (ctx) => {
    const w = when(ctx)
    if (w === 'night')
      return [
        ...VESSELS.filter(canAskAtNight).map((v) => PREFIX + v.id),
        ...HEADINGS.map((h) => HEADING + h),
        ...fixCandidates(true).map((v) => FIX + v.id),
        ...nightExtras(),
      ]
    if (w === 'day') return [...VESSELS.filter(hasDayShapes).map((v) => PREFIX + v.id), ...fixCandidates(false).map((v) => FIX + v.id)]
    return [
      ...VESSELS.map((v) => PREFIX + v.id),
      ...HEADINGS.map((h) => HEADING + h),
      ...[...new Set([...fixCandidates(true), ...fixCandidates(false)])].map((v) => FIX + v.id),
      ...nightExtras(),
    ]
  },
  label: (key) => {
    if (key.startsWith(ARC_POS)) return `Seen from above: which lights do you see? (${ARC_POS_TEXT[key.slice(ARC_POS.length) as ArcPos].toLowerCase()})`
    if (key.startsWith(ARC)) return `Seen from above: which light shows over this arc? (${ARC_LIGHT_TEXT[key.slice(ARC.length) as ArcLight].toLowerCase()})`
    if (key.startsWith(MISSING)) return `One light is missing (${VESSELS.find((v) => MISSING + v.id === key)?.name.toLowerCase()})`
    if (key.startsWith(HEADING)) return `Which way is she heading? (${HEADING_TEXT[key.slice(HEADING.length) as Heading].toLowerCase()})`
    if (key.startsWith(FIX)) return `What is wrong? (${VESSELS.find((v) => FIX + v.id === key)?.name.toLowerCase()})`
    return VESSELS.find((v) => PREFIX + v.id === key)?.name ?? key
  },

  pairs: (ctx) => (when(ctx) === 'night' ? nightPairs() : dayPairs()),
  make(key, ctx): Question | null {
    const w = when(ctx)
    if (key.startsWith(ARC_POS)) return w === 'day' ? null : arcPosQuestion(key)
    if (key.startsWith(ARC)) return w === 'day' ? null : arcLightQuestion(key)
    if (key.startsWith(MISSING)) return w === 'day' ? null : missingQuestion(key)
    if (key.startsWith(HEADING)) return w === 'day' ? null : headingQuestion(key)
    if (key.startsWith(FIX)) return fixQuestion(key, w)
    // About one question in three is the other way round: pick the right picture.
    // Not always possible (a trawler by day looks like any other fishing vessel): then ask the usual way.
    if (Math.random() < 0.35) {
      try {
        return pickQuestion(key, w)
      } catch {
        /* fall through */
      }
    }
    const q = makeLightQuestion(undefined, key.slice(PREFIX.length), w)
    const variantNote = q.variant.label !== 'underway' ? ` She is ${q.variant.label}.` : ''
    return {
      key,
      category: 'lights',
      prompt: q.night ? 'At night you see these lights. What is it?' : 'By day you see this. What is it?',
      media: <VesselSvg variant={q.variant} night={q.night} silhouette={false} scene={q.scene} size={340} />,
      reveal: q.vessel.dayOnly ? undefined : <VesselSvg variant={q.variant} night={!q.night} scene={q.scene} size={340} />,
      transition: q.night ? 'dawn' : 'dusk',
      options: q.options.map((v) => ({ id: v.id, label: v.name })),
      correctId: q.vessel.id,
      // Not when other vessels show the same day shapes: a typed name of one of them would also be right
      typed: q.lookalikes.length ? undefined : { accept: [q.vessel.name.toLowerCase()], ...VESSEL_TYPED[q.vessel.id] },
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

  card(key, ctx) {
    if (key.startsWith(ARC_POS)) {
      const p = key.slice(ARC_POS.length) as ArcPos
      const b = arcBearing(p)
      return {
        title: 'Which lights do you see?',
        front: <ArcDiagram observer={b} size={240} />,
        back: (
          <>
            <strong>{ARC_POS_TEXT[p]}</strong>
            <p>{ARC_POS_WHY[p]}</p>
            <ArcDiagram arcs observer={b} size={200} />
          </>
        ),
      }
    }
    if (key.startsWith(ARC)) {
      const l = key.slice(ARC.length) as ArcLight
      return {
        title: 'Which light shows over this arc?',
        front: <ArcDiagram highlight={l} size={240} />,
        back: (
          <>
            <strong>{ARC_LIGHT_TEXT[l]}</strong>
            <p>{ARC_LIGHT_WHY[l]}</p>
          </>
        ),
      }
    }
    if (key.startsWith(MISSING)) {
      const q = makeMissingQuestion(key.slice(MISSING.length))!
      return {
        title: q.vessel.name,
        front: <VesselSvg variant={q.shown} night silhouette={false} scene={q.scene} size={320} marker={q.missing} />,
        back: (
          <>
            <strong>{MISSING_TEXT[missingId(q.missing)]}</strong>
            <p>
              {q.vessel.description} <span className="rule">{q.vessel.rule}</span>
            </p>
            <VesselSvg variant={q.variant} night silhouette={false} scene={q.scene} size={320} />
          </>
        ),
      }
    }
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
      const q = makeFixQuestion(key.slice(FIX.length), when(ctx))
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
    const byDay = when(ctx) === 'day'
    const variant = pick(byDay ? vessel.variants.filter((x) => x.shapes.length > 0) : vessel.variants)
    const aspect = pick(aspectsFor(vessel).filter((a) => Math.abs(a.deg) <= 90))
    const scene = randomShipScene(aspect.deg, newSeed())
    return {
      title: vessel.name,
      front: <VesselSvg variant={variant} night={!vessel.dayOnly && !byDay} silhouette={false} scene={scene} size={320} />,
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

/** Match pairs by day: each vessel's day shapes */
function dayPairs(): MatchPair[] {
  return VESSELS.flatMap((v) => {
    const variant = v.variants.find((x) => x.shapes.length > 0)
    if (!variant) return []
    return [
      {
        key: PREFIX + v.id,
        group: daySignature(variant),
        left: <VesselSvg variant={variant} scene={closeShipScene(v.aspects?.[0] ?? 45, newSeed())} size={130} zoom={1.3} />,
        right: v.name,
      },
    ]
  })
}

/** Match pairs at night: each vessel's lights, from an aspect where no other vessel looks the same */
function nightPairs(): MatchPair[] {
  return VESSELS.filter((v) => !v.dayOnly).flatMap((v) => {
    for (const variant of v.variants) {
      for (const deg of v.aspects ?? [45, -45, 0, 90, -90]) {
        const sig = nightSignature(variant, deg)
        if (sig === 'none') continue
        const same = VESSELS.some((o) => o.id !== v.id && !o.dayOnly && o.variants.some((x) => nightSignature(x, deg) === sig))
        if (same) continue
        return [
          {
            key: PREFIX + v.id,
            group: sig,
            left: <VesselSvg variant={variant} night silhouette={false} scene={closeShipScene(deg, newSeed())} size={130} zoom={1.6} />,
            right: v.name,
          },
        ]
      }
    }
    return []
  })
}

function pickQuestion(key: string, w?: When): Question {
  const q = makeLightPickQuestion(key.slice(PREFIX.length), w)
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
    transition: 'dawn',
    options: HEADINGS.map((x) => ({ id: x, label: HEADING_TEXT[x] })),
    correctId: h,
    typed: HEADING_TYPED[h],
    explanation: (
      <>
        {HEADING_WHY[h]} She is {article(q.vessel.name)} {lower(q.vessel.name)} and you are {q.aspect.name}.
      </>
    ),
  }
}

function fixQuestion(key: string, w?: When): Question {
  const q = makeFixQuestion(key.slice(FIX.length), w)
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

const POWER_SMALL = 'a power-driven vessel of less than 50 m, underway'

function arcPosQuestion(key: string): Question {
  const p = key.slice(ARC_POS.length) as ArcPos
  const b = arcBearing(p)
  return {
    key,
    category: 'lights',
    prompt: `Seen from above, bow up: ${POWER_SMALL}. At night you are where the dot is. Which of her lights do you see?`,
    media: <ArcDiagram observer={b} size={260} />,
    reveal: <ArcDiagram arcs observer={b} size={260} />,
    transition: 'fade',
    options: shuffle(ARC_POSITIONS).map((x) => ({ id: x, label: ARC_POS_TEXT[x] })),
    correctId: p,
    explanation: <>{ARC_POS_WHY[p]} <strong>Rule 21</strong></>,
  }
}

function arcLightQuestion(key: string): Question {
  const l = key.slice(ARC.length) as ArcLight
  return {
    key,
    category: 'lights',
    prompt: `Seen from above, bow up: ${POWER_SMALL}. Which of her lights shows over the shaded arc?`,
    media: <ArcDiagram highlight={l} size={260} />,
    reveal: <ArcDiagram arcs size={260} />,
    transition: 'fade',
    options: shuffle(ARC_LIGHTS).map((x) => ({ id: x, label: ARC_LIGHT_TEXT[x] })),
    correctId: l,
    explanation: <>{ARC_LIGHT_WHY[l]}</>,
  }
}

function missingQuestion(key: string): Question | null {
  const q = makeMissingQuestion(key.slice(MISSING.length))
  if (!q) return null
  const id = missingId(q.missing)
  return {
    key,
    category: 'lights',
    prompt: `This is ${article(q.vessel.name)} ${lower(q.vessel.name)}${variantNote(q.vessel.name, q.variant.label)}, at night. One light is missing where the ring is. What should be there?`,
    media: <VesselSvg variant={q.shown} night silhouette={false} scene={q.scene} size={340} zoom={1.4} marker={q.missing} />,
    reveal: <VesselSvg variant={q.variant} night silhouette={false} scene={q.scene} size={340} zoom={1.4} />,
    transition: 'fade',
    options: shuffle([id, ...missingDistractors(id)]).map((x) => ({ id: x, label: MISSING_TEXT[x] })),
    correctId: id,
    explanation: (
      <>
        You are {q.aspect.name}. {q.vessel.description} <strong>{q.vessel.rule}</strong>
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
