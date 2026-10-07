import { FLAGS, FlagSvg, type Flag } from '../../flags/flags'
import MorseSymbols from '../../components/MorseSymbols'
import { MORSE } from '../../morse'
import type { Generator, Question } from '../types'
import { pick, sample, shuffle } from '../util'

// International Code of Signals letter flags: name the flag, its meaning, or pick the flag.

const PREFIX = 'flag:'
const byKey = (key: string) => FLAGS.find((f) => PREFIX + f.letter === key)!
const withMeaning = FLAGS.filter((f) => f.meaning)

function explain(f: Flag) {
  return (
    <>
      <strong>
        {f.letter} ({f.word})
      </strong>
      {f.meaning ? `: ${f.meaning}.` : ' has no single-letter meaning in the International Code.'} In Morse:{' '}
      <MorseSymbols code={MORSE[f.letter]} size="sm" />
    </>
  )
}

export const flagsGenerator: Generator = {
  category: 'flags',
  items: () => FLAGS.map((f) => PREFIX + f.letter),
  label: (key) => {
    const f = byKey(key)
    return `${f.letter} (${f.word})`
  },

  make(key): Question {
    const f = byKey(key)
    const kind = f.meaning ? pick(['meaning', 'meaning', 'letter', 'pick']) : 'letter'

    if (kind === 'meaning') {
      const wrong = sample(withMeaning.filter((o) => o.letter !== f.letter), 3)
      return {
        key,
        category: 'flags',
        prompt: 'A vessel flies this single flag. What does it mean?',
        media: (
          <div className="flag-stage">
            <FlagSvg flag={f} size={150} />
          </div>
        ),
        options: shuffle([f, ...wrong]).map((o) => ({ id: o.letter, label: o.meaning! })),
        correctId: f.letter,
        explanation: explain(f),
      }
    }
    if (kind === 'pick') {
      const wrong = sample(FLAGS.filter((o) => o.letter !== f.letter), 3)
      return {
        key,
        category: 'flags',
        prompt: `Which flag means: "${f.meaning}"?`,
        options: shuffle([f, ...wrong]).map((o) => ({ id: o.letter, label: `Flag ${o.letter}`, node: <FlagSvg flag={o} size={64} /> })),
        correctId: f.letter,
        explanation: explain(f),
      }
    }
    const wrong = sample(FLAGS.filter((o) => o.letter !== f.letter), 3)
    return {
      key,
      category: 'flags',
      prompt: 'Which letter is this flag?',
      media: (
        <div className="flag-stage">
          <FlagSvg flag={f} size={150} />
        </div>
      ),
      options: shuffle([f, ...wrong]).map((o) => ({ id: o.letter, label: `${o.letter} – ${o.word}` })),
      correctId: f.letter,
      explanation: explain(f),
    }
  },

  card(key) {
    const f = byKey(key)
    return {
      title: f.word,
      front: (
        <div className="flag-stage">
          <FlagSvg flag={f} size={160} />
        </div>
      ),
      back: (
        <>
          <strong>
            {f.letter} – {f.word}
          </strong>
          <p>{f.meaning ?? 'No single-letter meaning in the International Code.'}</p>
          <MorseSymbols code={MORSE[f.letter]} size="sm" />
        </>
      ),
    }
  },
}
