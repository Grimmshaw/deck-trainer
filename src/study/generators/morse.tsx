import MorseSymbols from '../../components/MorseSymbols'
import { FLAGS } from '../../flags/flags'
import { MORSE } from '../../morse'
import type { Ctx, Generator, MatchPair, Question } from '../types'
import { sample, shuffle } from '../util'

// Multiple-choice Morse questions (used in Learn mode and the final exam).
// The typing practice for Morse lives in its own screens.
//
// Two kinds of items:
//   morse:A      the alphabet – which letter is ·–
//   morse:sig:A  the single-letter signals of the International Code of Signals.
//                They mean the same whether sent by flag, by light or by sound,
//                so the meanings come from the flags.

const CHARS = Object.keys(MORSE)
const SIG = 'morse:sig:'
const SIGNALS = FLAGS.filter((f) => f.meaning).map((f) => ({ letter: f.letter, meaning: f.meaning! }))
const signal = (key: string) => SIGNALS.find((x) => SIG + x.letter === key)!

const alphabetKeys = () => CHARS.map((c) => `morse:${c}`)
const signalKeys = () => SIGNALS.map((x) => SIG + x.letter)
const wants = (ctx: Ctx, f: 'alphabet' | 'meaning') => !ctx.focus || ctx.focus === 'both' || ctx.focus === f

function signalQuestion(key: string): Question {
  const x = signal(key)
  const wrong = sample(SIGNALS.filter((o) => o.letter !== x.letter), 3)
  const explanation = (
    <>
      <MorseSymbols code={MORSE[x.letter]} size="sm" /> is {x.letter}. As a single-letter signal it means: {x.meaning}.
    </>
  )
  if (Math.random() < 0.6) {
    return {
      key,
      category: 'morse',
      prompt: 'A vessel signals this single letter to you by light. What does it mean?',
      media: (
        <div className="morse-stage">
          <MorseSymbols code={MORSE[x.letter]} size="lg" />
        </div>
      ),
      options: shuffle([x, ...wrong]).map((o) => ({ id: o.letter, label: o.meaning })),
      correctId: x.letter,
      explanation,
    }
  }
  return {
    key,
    category: 'morse',
    prompt: `Which single-letter signal means: "${x.meaning}"?`,
    options: shuffle([x, ...wrong]).map((o) => ({ id: o.letter, label: MORSE[o.letter], node: <MorseSymbols code={MORSE[o.letter]} size="sm" /> })),
    correctId: x.letter,
    explanation,
  }
}

/** Characters that look alike in Morse make the best wrong answers */
function lookalikes(c: string): string[] {
  const code = MORSE[c]
  const score = (o: string) => {
    const oc = MORSE[o]
    let s = Math.abs(oc.length - code.length) * 2
    for (let i = 0; i < Math.min(oc.length, code.length); i++) if (oc[i] !== code[i]) s++
    return s
  }
  return CHARS.filter((o) => o !== c).sort((a, b) => score(a) - score(b) + (Math.random() - 0.5))
}

export const morseGenerator: Generator = {
  category: 'morse',
  focus: {
    alphabet: 'Letters and numbers – ·– is A',
    meaning: 'What the single-letter signals mean – ·– means "I have a diver down"',
    both: 'Letters and meanings mixed',
  },
  items: (ctx) => [...(wants(ctx, 'alphabet') ? alphabetKeys() : []), ...(wants(ctx, 'meaning') ? signalKeys() : [])],
  label: (key) => (key.startsWith(SIG) ? `${signal(key).letter} – ${signal(key).meaning}` : key.slice(6)),
  pairs: (ctx) => {
    const out: MatchPair[] = []
    if (wants(ctx, 'alphabet'))
      for (const c of CHARS) out.push({ key: `morse:${c}`, group: c, left: <MorseSymbols code={MORSE[c]} size="sm" />, right: c })
    if (wants(ctx, 'meaning'))
      for (const x of SIGNALS)
        out.push({ key: SIG + x.letter, group: x.letter, left: <MorseSymbols code={MORSE[x.letter]} size="sm" />, right: x.meaning })
    return out
  },
  make(key): Question {
    if (key.startsWith(SIG)) return signalQuestion(key)
    const c = key.slice(6)
    const wrong = sample(lookalikes(c).slice(0, 6), 3)
    const reverse = Math.random() < 0.5
    if (reverse) {
      return {
        key,
        category: 'morse',
        prompt: `Which is "${c}" in Morse?`,
        media: <div className="big-char">{c}</div>,
        options: shuffle([c, ...wrong]).map((x) => ({ id: x, label: MORSE[x], node: <MorseSymbols code={MORSE[x]} size="sm" /> })),
        correctId: c,
        explanation: (
          <>
            {c} is <MorseSymbols code={MORSE[c]} size="sm" />
          </>
        ),
      }
    }
    return {
      key,
      category: 'morse',
      prompt: 'Which character is this?',
      media: (
        <div className="morse-stage">
          <MorseSymbols code={MORSE[c]} size="lg" />
        </div>
      ),
      options: shuffle([c, ...wrong]).map((x) => ({ id: x, label: x })),
      correctId: c,
      explanation: (
        <>
          <MorseSymbols code={MORSE[c]} size="sm" /> is {c}.
        </>
      ),
    }
  },
  card(key) {
    if (key.startsWith(SIG)) {
      const x = signal(key)
      return {
        title: 'Single-letter signal',
        front: (
          <div className="morse-stage">
            <MorseSymbols code={MORSE[x.letter]} size="lg" />
          </div>
        ),
        back: (
          <>
            <strong>{x.letter}</strong>
            <p>{x.meaning}</p>
          </>
        ),
      }
    }
    const c = key.slice(6)
    return {
      title: c,
      front: (
        <div className="morse-stage">
          <MorseSymbols code={MORSE[c]} size="lg" />
        </div>
      ),
      back: <div className="big-char">{c}</div>,
    }
  },
}
