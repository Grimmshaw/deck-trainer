import MorseSymbols from '../../components/MorseSymbols'
import { MORSE } from '../../morse'
import type { Generator, Question } from '../types'
import { sample, shuffle } from '../util'

// Multiple-choice Morse questions (used in Learn mode and the final exam).
// The typing practice for Morse lives in its own screens.

const CHARS = Object.keys(MORSE)

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
  items: () => CHARS.map((c) => `morse:${c}`),
  label: (key) => key.slice(6),
  make(key): Question {
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
