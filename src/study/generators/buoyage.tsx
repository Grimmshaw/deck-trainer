import { newSeed } from '../../art/scenery'
import BuoySvg from '../../buoyage/BuoySvg'
import { getMark, MARK_IDS, type Mark, type MarkId, type Region } from '../../buoyage/marks'
import { randomScene } from '../../buoyage/scene'
import { IALA_THEORY } from '../../content/ialaTheory'
import { charLight, CHARS, coloursFor, withColour } from '../../buoyage/characters'
import LightBlinker from '../../buoyage/LightBlinker'
import SectorDiagram from '../../buoyage/SectorDiagram'
import type { Generator, Question } from '../types'
import { pick, sample, shuffle } from '../util'
import { theoryQuestion } from './theory'
import { charTyped, MARK_TYPED } from '../typedAnswers'

// Buoyage questions: "what is this mark?" generated from the IALA data model
// (by day or only the light at night), plus the reviewed theory questions.

const MARK_PREFIX = 'iala:mark:'
const THEORY_PREFIX = 'iala:q:'
const CHAR_PREFIX = 'iala:char:'
/** "What do you do?" – which side to pass a mark */
const PASS_PREFIX = 'iala:pass:'
/** "What do you do?" – a sector light */
const SECTOR_PREFIX = 'iala:sector:'

// ---------- Passing marks ----------

type PassId = 'portSide' | 'stbdSide' | 'either' | 'clear' | 'north' | 'east' | 'south' | 'west'
const PASS_TEXT: Record<PassId, string> = {
  portSide: 'Keep it on your port side',
  stbdSide: 'Keep it on your starboard side',
  either: 'Either side – the mark itself stands in safe water',
  clear: 'Either side, but not close – the danger is right under it',
  north: 'Pass to the north of it',
  east: 'Pass to the east of it',
  south: 'Pass to the south of it',
  west: 'Pass to the west of it',
}
const PASS_MARKS: MarkId[] = ['port', 'starboard', 'prefStarboard', 'prefPort', 'north', 'east', 'south', 'west', 'isolated', 'safe']
const CARDINAL: PassId[] = ['north', 'east', 'south', 'west']
const SIDES: PassId[] = ['portSide', 'stbdSide', 'either', 'clear']

/** The right way to pass, entering harbour (in the direction of buoyage) or leaving */
export function passAnswer(id: MarkId, entering: boolean): PassId {
  const keep = (onPortEntering: boolean) => (onPortEntering === entering ? 'portSide' : 'stbdSide')
  switch (id) {
    case 'port':
    case 'prefStarboard':
      return keep(true)
    case 'starboard':
    case 'prefPort':
      return keep(false)
    case 'isolated':
      return 'clear'
    case 'safe':
      return 'either'
    default:
      return id as PassId
  }
}

function passWhy(mark: Mark, entering: boolean, answer: PassId): string {
  const dir = entering ? 'entering (in the direction of buoyage)' : 'leaving (against the direction of buoyage)'
  switch (mark.id) {
    case 'port':
    case 'starboard':
      return `It is a ${mark.name.toLowerCase()}. ${entering ? 'Entering' : 'Leaving'}, you keep it on your ${answer === 'portSide' ? 'port' : 'starboard'} side.`
    case 'prefStarboard':
    case 'prefPort':
      return `It is a “${mark.name.toLowerCase()}” mark (a modified ${mark.id === 'prefStarboard' ? 'port' : 'starboard'}-hand mark). To follow the main channel when ${dir}, keep it on your ${answer === 'portSide' ? 'port' : 'starboard'} side.`
    case 'isolated':
      return 'It is an isolated danger mark: it stands on a danger with safe water all round. Pass either side, but not close.'
    case 'safe':
      return 'It is a safe water mark: there is navigable water all round it. It often marks a landfall, the middle of a channel or its centre line.'
    default:
      return `It is a ${mark.name.toLowerCase()}: the safe water is to the ${mark.id} of it, so you pass to the ${mark.id} of the mark.`
  }
}

// ---------- Sector lights ----------

type SectorSeen = 'R' | 'G' | 'W'
type SectorAction = 'stbd' | 'port' | 'stay' | 'stop'
const SECTOR_TEXT: Record<SectorAction, string> = {
  stbd: 'Alter to starboard until the light turns white',
  port: 'Alter to port until the light turns white',
  stay: 'Stay in the white sector – you are on the safe line',
  stop: 'Hold your course – the colour will change by itself',
}
const COLOUR_WORD: Record<SectorSeen, string> = { R: 'red', G: 'green', W: 'white' }

/** Steering towards the light, the left-hand sector is to the west of the white one: from there, the white sector is to starboard */
export function sectorAnswer(seen: SectorSeen, left: 'R' | 'G'): SectorAction {
  return seen === 'W' ? 'stay' : seen === left ? 'stbd' : 'port'
}

export const buoyageGenerator: Generator = {
  category: 'buoyage',
  items: () => [
    ...MARK_IDS.map((id) => MARK_PREFIX + id),
    ...PASS_MARKS.map((id) => PASS_PREFIX + id),
    ...(['R', 'G', 'W'] as SectorSeen[]).map((c) => SECTOR_PREFIX + c),
    ...CHARS.map((c) => CHAR_PREFIX + c.spec),
    ...IALA_THEORY.map((q) => THEORY_PREFIX + q.id),
  ],

  label(key, ctx) {
    if (key.startsWith(PASS_PREFIX)) return `Which side do you pass? (${getMark(key.slice(PASS_PREFIX.length) as MarkId, ctx.region.buoyage).name.toLowerCase()})`
    if (key.startsWith(SECTOR_PREFIX)) return `Sector light: you see ${COLOUR_WORD[key.slice(SECTOR_PREFIX.length) as SectorSeen]}`
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
    if (key.startsWith(PASS_PREFIX)) return passQuestion(key, ctx.region.buoyage)
    if (key.startsWith(SECTOR_PREFIX)) return sectorQuestion(key)
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
          <BuoySvg mark={mark} scene={scene} size={190} />
        </div>
      ) : undefined,
      transition: night ? 'dawn' : undefined,
      options: shuffle([mark, ...others]).map((m) => ({ id: m.id, label: m.name })),
      correctId: mark.id,
      typed: MARK_TYPED[mark.id],
      explanation: (
        <>
          {mark.meaning} Light: <strong>{light.label}</strong>
        </>
      ),
    }
  },

  card(key, ctx) {
    if (key.startsWith(PASS_PREFIX) || key.startsWith(SECTOR_PREFIX)) {
      const q = key.startsWith(PASS_PREFIX) ? passQuestion(key, ctx.region.buoyage) : sectorQuestion(key)
      return {
        title: key.startsWith(PASS_PREFIX) ? 'What do you do?' : 'Sector light',
        front: (
          <>
            <p className="card-text small">{q.prompt}</p>
            {q.media}
          </>
        ),
        back: (
          <>
            <strong>{q.options.find((o) => o.id === q.correctId)!.label}</strong>
            <p>{q.explanation}</p>
          </>
        ),
      }
    }
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

function passQuestion(key: string, region: Region): Question {
  const mark = getMark(key.slice(PASS_PREFIX.length) as MarkId, region)
  const lateral = ['port', 'starboard', 'prefStarboard', 'prefPort'].includes(mark.id)
  const entering = Math.random() < 0.5
  const answer = passAnswer(mark.id, entering)
  const night = Math.random() < 0.25
  const light = pick(mark.lights)
  const scene = randomScene(mark, newSeed())
  const situation = lateral ? (entering ? 'You are entering harbour, in the direction of buoyage. ' : 'You are leaving harbour, heading out to sea. ') : ''
  return {
    key,
    category: 'buoyage',
    prompt: `Region ${region}. ${situation}${night ? 'At night you see this light ahead' : 'You see this mark ahead'}. How do you pass it?`,
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
    options: shuffle(CARDINAL.includes(answer) ? CARDINAL : SIDES).map((x) => ({ id: x, label: PASS_TEXT[x] })),
    correctId: answer,
    explanation: (
      <>
        {passWhy(mark, entering, answer)} Light: <strong>{light.label}</strong>
      </>
    ),
  }
}

function sectorQuestion(key: string): Question {
  const seen = key.slice(SECTOR_PREFIX.length) as SectorSeen
  const left = pick(['R', 'G'] as const)
  const answer = sectorAnswer(seen, left)
  const leftWord = COLOUR_WORD[left]
  return {
    key,
    category: 'buoyage',
    prompt: `You are steering north towards the harbour and this sector light (see the chart). You see a ${COLOUR_WORD[seen]} light. What do you do?`,
    media: (
      <div className="buoy-stage">
        <SectorDiagram left={left} size={300} />
      </div>
    ),
    options: shuffle(['stbd', 'port', 'stay', 'stop'] as SectorAction[]).map((x) => ({ id: x, label: SECTOR_TEXT[x] })),
    correctId: answer,
    explanation: (
      <>
        The colour you see tells which sector you are in. On this chart the {leftWord} sector is to the west of the white sector and
        the {leftWord === 'red' ? 'green' : 'red'} one to the east.{' '}
        {seen === 'W'
          ? 'White means you are in the safe sector: keep the light white.'
          : `${COLOUR_WORD[seen][0].toUpperCase() + COLOUR_WORD[seen].slice(1)} means you are ${seen === left ? 'west' : 'east'} of the safe line, so you alter to ${answer === 'stbd' ? 'starboard (east)' : 'port (west)'} until the light turns white.`}{' '}
        Which colour is on which side differs from light to light – always check the chart.
      </>
    ),
  }
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
    typed: charTyped(spec, colour),
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
