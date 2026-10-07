import type { CategoryId } from '../categories'
import type { Generator, Question } from '../types'
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

/**
 * Adds written theory questions to a generator: they become extra items with
 * their own progress, questions and flashcards. Other keys go to the generator.
 */
export function withTheory(gen: Generator, list: (TheoryItem & { id: string })[], title: string): Generator {
  const prefix = `${gen.category}:t:`
  const find = (key: string) => list.find((t) => prefix + t.id === key)
  return {
    ...gen,
    items: (ctx) => [...gen.items(ctx), ...list.map((t) => prefix + t.id)],
    label: (key, ctx) => find(key)?.q ?? gen.label(key, ctx),
    make(key, ctx) {
      const t = find(key)
      return t ? theoryQuestion(key, gen.category, t) : gen.make(key, ctx)
    },
    card(key, ctx) {
      const t = find(key)
      if (t) {
        return {
          title,
          front: <p className="card-text">{t.q}</p>,
          back: (
            <>
              <strong>{t.options[0]}</strong>
              <p>{t.why}</p>
              <p className="muted small">{t.source}</p>
            </>
          ),
        }
      }
      return gen.card!(key, ctx)
    },
  }
}
