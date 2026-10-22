import { FLAGS } from '../../flags/flags'
import {
  courseQuestion,
  MARKER_CONFUSED,
  MARKER_SITUATIONS,
  MARKER_USE,
  MARKERS,
  OLD_ALPHABET,
  ORDERS,
  timeQuestion,
  type Marker,
  type NumberQuestion,
  type Order,
} from '../../content/vhf'
import type { Ctx, Generator, MatchPair, Question } from '../types'
import { pick, sample, shuffle } from '../util'

// VHF & SMCP. Kinds of items:
//   vhf:abc:K       the phonetic alphabet – how do you say K, which letter is "Kilo"
//   vhf:mm:<id>     which message marker goes in front of a message
//   vhf:order:<id>  standard wheel and engine orders
//   vhf:num:course / vhf:num:time   numbers on the radio, digit by digit
// plus theory questions (vhf:t:…) from content/vhfTheory.ts.

const ABC = 'vhf:abc:'
const MM = 'vhf:mm:'
const ORDER = 'vhf:order:'
const NUM = 'vhf:num:'

const wants = (ctx: Ctx, f: 'alphabet' | 'meaning') => !ctx.focus || ctx.focus === 'both' || ctx.focus === f
const letter = (key: string) => FLAGS.find((f) => key === ABC + f.letter)!
const situation = (key: string) => MARKER_SITUATIONS.find((x) => MM + x.id === key)!
const order = (key: string) => ORDERS.find((o) => ORDER + o.id === key)!

const spoken = (word: string) => <span className="smcp">{word}</span>

// ---------- Phonetic alphabet ----------

function abcQuestion(key: string): Question {
  const f = letter(key)
  const others = FLAGS.filter((o) => o.letter !== f.letter)
  const explanation = (
    <>
      <strong>
        {f.letter} – {f.word}
      </strong>{' '}
      in the international phonetic alphabet (ITU, ICAO and the International Code of Signals).
      {OLD_ALPHABET[f.letter] ? ` "${OLD_ALPHABET[f.letter]}" is from the old spelling alphabet of the Second World War.` : ''}
    </>
  )
  if (Math.random() < 0.6) {
    // How do you say the letter? One wrong option may be the old word for the same letter.
    const old = OLD_ALPHABET[f.letter]
    const wrong = [...(old && Math.random() < 0.5 ? [old] : []), ...sample(others, 3).map((o) => o.word)].slice(0, 3)
    const extra: Record<string, string[]> = { A: ['Alpha'], J: ['Juliet'], X: ['Xray', 'X ray'] }
    return {
      key,
      category: 'vhf',
      prompt: `You spell a word on the radio. How do you say the letter ${f.letter}?`,
      options: shuffle([f.word, ...wrong]).map((w) => ({ id: w, label: w })),
      correctId: f.word,
      explanation,
      typed: { accept: [f.word, ...(extra[f.letter] ?? [])], reject: [old, ...wrong].filter(Boolean).map((w) => w!.toLowerCase()), hint: 'The spelling word' },
    }
  }
  const wrong = sample(others, 3)
  return {
    key,
    category: 'vhf',
    prompt: `Which letter is "${f.word}"?`,
    options: shuffle([f, ...wrong]).map((o) => ({ id: o.letter, label: o.letter })),
    correctId: f.letter,
    explanation,
  }
}

// ---------- Message markers ----------

function markerQuestion(key: string): Question {
  const x = situation(key)
  const wrong: Marker[] = [MARKER_CONFUSED[x.marker], ...sample(MARKERS.filter((m) => m !== x.marker && m !== MARKER_CONFUSED[x.marker]), 2)]
  return {
    key,
    category: 'vhf',
    prompt: `${x.text} Which message marker goes in front of the message?`,
    media: (
      <p className="smcp-message">
        <span className="smcp-blank">?</span> {x.says}
      </p>
    ),
    options: shuffle([x.marker, ...wrong]).map((m) => ({ id: m, label: m })),
    correctId: x.marker,
    explanation: (
      <>
        <strong>{x.marker}</strong> – it {MARKER_USE[x.marker]}. "{x.marker.charAt(0) + x.marker.slice(1).toLowerCase()}. {x.says}"
      </>
    ),
    typed: { accept: [x.marker], reject: MARKERS.filter((m) => m !== x.marker).map((m) => m.toLowerCase()), hint: 'One word' },
  }
}

// ---------- Wheel and engine orders ----------

function orderQuestion(key: string): Question {
  const o = order(key)
  const pool = ORDERS.filter((x) => x.id !== o.id && x.kind === o.kind)
  const wrong = sample(pool.length >= 3 ? pool : ORDERS.filter((x) => x.id !== o.id), 3)
  const explanation = (
    <>
      {spoken(o.order)}: {o.meaning.charAt(0).toLowerCase() + o.meaning.slice(1)}.
    </>
  )
  if (Math.random() < 0.6) {
    return {
      key,
      category: 'vhf',
      prompt: `On the bridge you hear the ${o.kind} order "${o.order}". What does it mean?`,
      options: shuffle([o, ...wrong]).map((x: Order) => ({ id: x.id, label: x.meaning })),
      correctId: o.id,
      explanation,
    }
  }
  return {
    key,
    category: 'vhf',
    prompt: `Which ${o.kind} order means: "${o.meaning}"?`,
    options: shuffle([o, ...wrong]).map((x: Order) => ({ id: x.id, label: x.order })),
    correctId: o.id,
    explanation,
  }
}

// ---------- Numbers ----------

function numberData(key: string): NumberQuestion {
  if (key === NUM + 'time') {
    const hour = Math.floor(Math.random() * 24)
    return timeQuestion(hour, pick([0, 15, 30, 45, 10, 20, 40, 50]))
  }
  return courseQuestion(10 + Math.floor(Math.random() * 350))
}

function numberQuestion(key: string): Question {
  const d = numberData(key)
  return {
    key,
    category: 'vhf',
    prompt: d.prompt,
    options: shuffle([d.right, ...d.wrong]).map((w, i) => ({ id: w === d.right ? 'right' : `w${i}`, label: w })),
    correctId: 'right',
    explanation: <>{d.why}</>,
  }
}

// ---------- The generator ----------

export const vhfGenerator: Generator = {
  category: 'vhf',
  focus: {
    alphabet: 'Spelling on the radio – K is Kilo, Q is Quebec',
    meaning: 'SMCP phrases, message markers, wheel orders and radio procedure',
    both: 'Everything mixed',
  },
  focusTitles: { alphabet: 'Phonetic alphabet', meaning: 'Phrases & procedure' },

  items: (ctx) => [
    ...(wants(ctx, 'alphabet') ? FLAGS.map((f) => ABC + f.letter) : []),
    ...(wants(ctx, 'meaning')
      ? [...MARKER_SITUATIONS.map((x) => MM + x.id), ...ORDERS.map((o) => ORDER + o.id), NUM + 'course', NUM + 'time']
      : []),
  ],

  label(key) {
    if (key.startsWith(ABC)) {
      const f = letter(key)
      return `${f.letter} – ${f.word}`
    }
    if (key.startsWith(MM)) return `Message marker: ${situation(key).text}`
    if (key.startsWith(ORDER)) {
      const o = order(key)
      return `${o.order} – ${o.meaning}`
    }
    return key === NUM + 'time' ? 'Saying a time on the radio' : 'Saying a course on the radio'
  },

  make(key): Question {
    if (key.startsWith(ABC)) return abcQuestion(key)
    if (key.startsWith(MM)) return markerQuestion(key)
    if (key.startsWith(ORDER)) return orderQuestion(key)
    return numberQuestion(key)
  },

  pairs(ctx) {
    const out: MatchPair[] = []
    if (wants(ctx, 'alphabet')) for (const f of FLAGS) out.push({ key: ABC + f.letter, group: f.letter, left: <span className="match-letter">{f.letter}</span>, right: f.word })
    if (wants(ctx, 'meaning')) for (const o of ORDERS) out.push({ key: ORDER + o.id, group: o.group, left: spoken(o.order), right: o.meaning })
    return out
  },

  card(key) {
    if (key.startsWith(ABC)) {
      const f = letter(key)
      return {
        title: 'Phonetic alphabet',
        front: <div className="card-big-letter">{f.letter}</div>,
        back: <strong>{f.word}</strong>,
      }
    }
    if (key.startsWith(MM)) {
      const x = situation(key)
      return {
        title: 'Message marker',
        front: (
          <>
            <p className="card-text">{x.text}</p>
            <p className="smcp-message">
              <span className="smcp-blank">?</span> {x.says}
            </p>
          </>
        ),
        back: (
          <>
            <strong>{x.marker}</strong>
            <p>It {MARKER_USE[x.marker]}.</p>
          </>
        ),
      }
    }
    if (key.startsWith(ORDER)) {
      const o = order(key)
      return {
        title: o.kind === 'wheel' ? 'Wheel order' : 'Engine order',
        front: <p className="card-text">{spoken(o.order)}</p>,
        back: <strong>{o.meaning}</strong>,
      }
    }
    const d = numberData(key)
    return {
      title: 'Numbers on the radio',
      front: <p className="card-text">{d.prompt}</p>,
      back: (
        <>
          <strong>{d.right}</strong>
          <p>{d.why}</p>
        </>
      ),
    }
  },
}
