import type { CategoryId } from '../categories'
import type { Question } from '../types'
import { shuffle } from '../util'

export interface TheoryItem {
  q: string
  /** The first option is the correct one */
  options: string[]
  why: string
  source: string
}

/** Turns a written multiple-choice question into a Question with shuffled options */
export function theoryQuestion(key: string, category: CategoryId, t: TheoryItem): Question {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f']
  return {
    key,
    category,
    prompt: t.q,
    options: shuffle(t.options.map((label, i) => ({ id: ids[i], label }))),
    correctId: 'a',
    explanation: (
      <>
        {t.why} <span className="muted small">({t.source})</span>
      </>
    ),
  }
}
