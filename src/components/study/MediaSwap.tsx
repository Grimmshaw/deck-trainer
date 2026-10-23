import { useState, type ReactNode } from 'react'
import type { RevealTransition } from '../../study/types'

// The question picture, and after answering the answer picture in its place.
// Night → day is shown as a short dawn: the day picture rises out of a dark,
// warm twilight while the night picture and its lights fade away.
// A small button switches back and forth, so the two can be compared.

interface Props {
  media: ReactNode
  reveal: ReactNode
  kind: RevealTransition
  /** The question has been answered: show the reveal */
  revealed: boolean
}

const LABELS: Record<RevealTransition, [showing: string, back: string]> = {
  // [label while the answer picture is shown, label while the question picture is shown]
  dawn: ['See it at night', 'See it by day'],
  dusk: ['See it by day', 'See it at night'],
  fade: ['Show the question', 'Show the answer'],
}

export default function MediaSwap({ media, reveal, kind, revealed }: Props) {
  // Which picture is shown after answering (the answer picture first)
  const [answerShown, setAnswerShown] = useState(true)
  const showAnswer = revealed && answerShown
  return (
    <div className="question-media">
      <div className={`media-swap swap-${kind} ${revealed ? 'revealed' : ''} ${showAnswer ? 'show-answer' : ''}`}>
        <div className="swap-layer swap-from" aria-hidden={showAnswer}>
          {media}
        </div>
        {revealed && (
          <div className="swap-layer swap-to" aria-hidden={!showAnswer}>
            {reveal}
          </div>
        )}
        {revealed && (
          <button type="button" className="swap-toggle" onClick={() => setAnswerShown((s) => !s)}>
            {LABELS[kind][answerShown ? 0 : 1]}
          </button>
        )}
      </div>
    </div>
  )
}
