import { useState } from 'react'
import { load, save } from '../../storage'
import { findCategory, type CategoryId } from '../../study/categories'
import { EXAM_CATEGORIES } from '../../study/registry'

// Before the final exam: choose which categories it covers, so the ones you
// already know can be left out. All are chosen the first time; the last
// choice is remembered.

const KEY = 'deck.examCategories'

export function savedExamCategories(): CategoryId[] {
  const ids = load(KEY, { ids: EXAM_CATEGORIES }).ids.filter((id) => EXAM_CATEGORIES.includes(id))
  return ids.length ? ids : EXAM_CATEGORIES
}

interface Props {
  questions: number
  minutes: number
  onBack: () => void
  onStart: (ids: CategoryId[]) => void
}

export default function ExamSetup({ questions, minutes, onBack, onStart }: Props) {
  const [chosen, setChosen] = useState<CategoryId[]>(savedExamCategories)
  const all = chosen.length === EXAM_CATEGORIES.length

  const toggle = (id: CategoryId) =>
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : EXAM_CATEGORIES.filter((x) => x === id || c.includes(x))))

  const start = () => {
    save(KEY, { ids: chosen })
    onStart(chosen)
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">
          Final exam
          <small>
            {questions} questions · {minutes} min
          </small>
        </div>
        <span className="topbar-spacer" />
      </header>

      <h2 className="step-question">Which categories?</h2>
      <button className="link-button exam-all" onClick={() => setChosen(all ? [] : EXAM_CATEGORIES)}>
        {all ? 'Clear all' : 'Choose all'}
      </button>
      <div className="mode-list">
        {EXAM_CATEGORIES.map((id) => {
          const on = chosen.includes(id)
          return (
            <button key={id} className={`mode-row exam-cat ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggle(id)}>
              <span className="exam-check" aria-hidden="true">
                {on ? '✓' : ''}
              </span>
              <strong>{findCategory(id).title}</strong>
            </button>
          )
        })}
      </div>
      <button className="primary big exam-start" disabled={chosen.length === 0} onClick={start}>
        {chosen.length === 0 ? 'Choose at least one' : 'Start exam'}
      </button>
    </div>
  )
}
