import { FLAGS, FlagSvg, type Flag } from '../../flags/flags'
import MorseSymbols from '../../components/MorseSymbols'
import { MORSE } from '../../morse'
import type { Ctx, Generator, MatchPair, Question } from '../types'
import { sample, shuffle } from '../util'

// International Code of Signals letter flags. Two kinds of items:
//   flag:A      the alphabet – which letter is this flag, which flag is K
//   flag:sig:A  the single-letter meaning – what does flag A mean, which flag means ...

const PREFIX = 'flag:'
const SIG = 'flag:sig:'
const withMeaning = FLAGS.filter((f) => f.meaning)
const byKey = (key: string) => FLAGS.find((f) => key === PREFIX + f.letter || key === SIG + f.letter)!
const wants = (ctx: Ctx, f: 'alphabet' | 'meaning') => !ctx.focus || ctx.focus === 'both' || ctx.focus === f

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

const stage = (f: Flag) => (
  <div className="flag-stage">
    <FlagSvg flag={f} size={150} />
  </div>
)

export const flagsGenerator: Generator = {
  category: 'flags',
  focus: {
    alphabet: 'Which letter each flag is – the yellow and black flag is Q',
    meaning: 'What a single flag means – flag A means "I have a diver down"',
    both: 'Letters and meanings mixed',
  },
  items: (ctx) => [
    ...(wants(ctx, 'alphabet') ? FLAGS.map((f) => PREFIX + f.letter) : []),
    ...(wants(ctx, 'meaning') ? withMeaning.map((f) => SIG + f.letter) : []),
  ],
  label: (key) => {
    const f = byKey(key)
    return key.startsWith(SIG) ? `${f.letter} – ${f.meaning}` : `${f.letter} (${f.word})`
  },

  pairs: (ctx) => {
    const out: MatchPair[] = []
    if (wants(ctx, 'alphabet'))
      for (const f of FLAGS) out.push({ key: PREFIX + f.letter, group: f.letter, left: <FlagSvg flag={f} size={64} />, right: `${f.letter} – ${f.word}` })
    if (wants(ctx, 'meaning'))
      for (const f of withMeaning) out.push({ key: SIG + f.letter, group: f.letter, left: <FlagSvg flag={f} size={64} />, right: f.meaning! })
    return out
  },

  make(key): Question {
    const f = byKey(key)

    if (key.startsWith(SIG)) {
      const wrong = sample(withMeaning.filter((o) => o.letter !== f.letter), 3)
      if (Math.random() < 0.6) {
        return {
          key,
          category: 'flags',
          prompt: 'A vessel flies this single flag. What does it mean?',
          media: stage(f),
          options: shuffle([f, ...wrong]).map((o) => ({ id: o.letter, label: o.meaning! })),
          correctId: f.letter,
          explanation: explain(f),
        }
      }
      return {
        key,
        category: 'flags',
        prompt: `Which flag means: "${f.meaning}"?`,
        options: shuffle([f, ...wrong]).map((o) => ({ id: o.letter, label: `Flag ${o.letter}`, node: <FlagSvg flag={o} size={64} /> })),
        correctId: f.letter,
        explanation: explain(f),
        layout: 'pictures',
      }
    }

    const wrong = sample(FLAGS.filter((o) => o.letter !== f.letter), 3)
    if (Math.random() < 0.6) {
      return {
        key,
        category: 'flags',
        prompt: 'Which letter is this flag?',
        media: stage(f),
        options: shuffle([f, ...wrong]).map((o) => ({ id: o.letter, label: `${o.letter} – ${o.word}` })),
        correctId: f.letter,
        explanation: explain(f),
      }
    }
    return {
      key,
      category: 'flags',
      prompt: `Which flag is ${f.letter} (${f.word})?`,
      options: shuffle([f, ...wrong]).map((o) => ({ id: o.letter, label: `${o.letter} – ${o.word}`, node: <FlagSvg flag={o} size={64} /> })),
      correctId: f.letter,
      explanation: explain(f),
      layout: 'pictures',
    }
  },

  card(key) {
    const f = byKey(key)
    if (key.startsWith(SIG)) {
      return {
        title: 'Single-letter signal',
        front: (
          <div className="flag-stage">
            <FlagSvg flag={f} size={160} />
          </div>
        ),
        back: (
          <>
            <strong>{f.letter}</strong>
            <p>{f.meaning}</p>
          </>
        ),
      }
    }
    return {
      title: 'Letter flag',
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
          <MorseSymbols code={MORSE[f.letter]} size="sm" />
        </>
      ),
    }
  },
}
