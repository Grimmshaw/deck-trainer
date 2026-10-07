import { DISTRESS_SIGNALS, NOT_DISTRESS } from '../../content/distress'
import type { Generator, Question } from '../types'
import { pick, sample, shuffle } from '../util'

// COLREG Annex IV: recognise the signals that indicate distress and need of assistance.

const PREFIX = 'distress:'
const byKey = (key: string) => DISTRESS_SIGNALS.find((d) => PREFIX + d.id === key)!

export const distressGenerator: Generator = {
  category: 'distress',
  items: () => DISTRESS_SIGNALS.map((d) => PREFIX + d.id),
  label: (key) => byKey(key).text,

  make(key): Question {
    const d = byKey(key)
    if (d.picture && Math.random() < 0.6) {
      return {
        key,
        category: 'distress',
        prompt: 'A vessel shows this signal. What does it mean?',
        media: <div className="flag-stage">{d.picture()}</div>,
        options: shuffle([
          { id: 'distress', label: 'She is in distress and requires assistance' },
          { id: 'pilot', label: 'She requires a pilot' },
          { id: 'anchor', label: 'She is at anchor' },
          { id: 'clear', label: 'Keep clear of me; I am manoeuvring with difficulty' },
        ]),
        correctId: 'distress',
        explanation: (
          <>
            {d.text}. <strong>{d.ref}</strong>
          </>
        ),
      }
    }
    const wrong = sample(NOT_DISTRESS, 3)
    const ask = pick(['Which of these signals indicates distress and need of assistance?', 'Which of these is a distress signal under COLREG Annex IV?'])
    return {
      key,
      category: 'distress',
      prompt: ask,
      options: shuffle([{ id: 'right', label: d.text }, ...wrong.map((w, i) => ({ id: `w${i}`, label: w }))]),
      correctId: 'right',
      explanation: (
        <>
          {d.text} is a distress signal. <strong>{d.ref}</strong>
        </>
      ),
    }
  },

  card(key) {
    const d = byKey(key)
    return {
      title: d.ref,
      front: d.picture ? <div className="flag-stage">{d.picture()}</div> : <p className="card-text">{d.text}</p>,
      back: (
        <>
          <strong>Distress signal</strong>
          <p>{d.text}</p>
          <p className="rule">{d.ref}</p>
        </>
      ),
    }
  },
}
