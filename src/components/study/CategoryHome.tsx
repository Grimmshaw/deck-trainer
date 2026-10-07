import { useState } from 'react'
import type { Category } from '../../study/categories'
import { mastery, useProgress, weakKeys } from '../../study/progress'
import type { Ctx, Generator } from '../../study/types'
import CategoryIcon from '../CategoryIcon'
import SoundModeToggle from '../../sound/SoundModeToggle'
import type { SessionMode } from './Session'

interface Props {
  category: Category
  generator: Generator
  ctx: Ctx
  onBack: () => void
  onStart: (mode: SessionMode, count: number) => void
  onLearn: () => void
  onMatch: () => void
  /** Optional reference page, for example the gallery of all marks */
  reference?: { label: string; open: () => void }
}

const COUNTS = [10, 30, 50]

export default function CategoryHome({ category, generator, ctx, onBack, onStart, onLearn, onMatch, reference }: Props) {
  useProgress()
  const [count, setCount] = useState(10)
  const items = generator.items(ctx)
  const m = mastery(items)
  const weak = weakKeys(items).length

  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back to start">
          ←
        </button>
        <div className="topbar-title">
          {category.title}
          <small>{category.tag === 'Preview' ? 'Preview' : category.tag}</small>
        </div>
        <span className="topbar-spacer" />
      </header>

      <section className="mastery-card">
        <CategoryIcon kind={category.icon} size={40} />
        <div>
          <div className="mastery-head">
            <strong>{Math.round(m * 100)}% learned</strong>
            <span className="muted small">{items.length} topics</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${m * 100}%` }} />
          </div>
        </div>
      </section>

      {category.id === 'sound' && (
        <div className="sound-mode-row">
          <SoundModeToggle />
        </div>
      )}

      <div className="mode-list">
        {generator.card && (
          <button className="mode-row" onClick={onLearn}>
            <strong>Learn</strong>
            <span>Flashcards – turn the card and say if you knew it</span>
          </button>
        )}

        {generator.pairs && (
          <button className="mode-row" onClick={onMatch}>
            <strong>Match pairs</strong>
            <span>Pair pictures with their meanings – five quick rounds</span>
          </button>
        )}

        <div className="mode-row practice-row">
          <strong>Practice</strong>
          <span>Multiple choice with the answer explained after each question</span>
          <div className="practice-controls">
            <div className="count-row" role="group" aria-label="Number of questions">
              <span className="muted small">Questions</span>
              {COUNTS.map((c) => (
                <button key={c} className={`chip ${count === c ? 'selected' : ''}`} onClick={() => setCount(c)}>
                  {c}
                </button>
              ))}
            </div>
            <button className="primary" onClick={() => onStart('practice', count)}>
              Start
            </button>
          </div>
        </div>

        <button className="mode-row" onClick={() => onStart('exam', 30)}>
          <strong>Test</strong>
          <span>30 questions on time. Results and review at the end.</span>
        </button>

        <button className="mode-row" onClick={() => onStart('mistakes', 10)} disabled={weak === 0}>
          <strong>My mistakes {weak > 0 && <span className="tag tag-preview">{weak}</span>}</strong>
          <span>{weak > 0 ? 'Practise the topics you got wrong' : 'Nothing to practise – no recent mistakes'}</span>
        </button>

        {reference && (
          <button className="mode-row" onClick={reference.open}>
            <strong>{reference.label}</strong>
            <span>Look at everything, by day and by night</span>
          </button>
        )}
      </div>
    </div>
  )
}
