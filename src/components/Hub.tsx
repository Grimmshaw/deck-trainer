import type { StudyRegion } from '../regions'
import { CATEGORIES, FINAL_EXAM, type Category, type CategoryId } from '../study/categories'
import { mastery, useProgress } from '../study/progress'
import { GENERATORS } from '../study/registry'
import type { Ctx } from '../study/types'
import { useState } from 'react'
import { LanternMark } from '../brand/Logo'
import ReportDialog from '../report/ReportDialog'
import CategoryIcon from './CategoryIcon'

interface Props {
  region: StudyRegion
  onOpen: (id: CategoryId) => void
  onRegion: () => void
}

export default function Hub({ region, onOpen, onRegion }: Props) {
  useProgress()
  const ctx: Ctx = { region }
  const active = CATEGORIES.filter((c) => c.tag !== 'Soon')
  const soon = CATEGORIES.filter((c) => c.tag === 'Soon')
  const [reporting, setReporting] = useState(false)

  return (
    <div className="screen hub">
      <header className="hub-header">
        <div className="hub-brand">
          <LanternMark size={46} />
          <div>
            <h1>Lanterna</h1>
            <p className="muted small">Study for your deck officer exams</p>
          </div>
        </div>
        <button className="region-chip" onClick={onRegion} aria-label={`Region: ${region.name}. Change region`}>
          <CategoryIcon kind="globe" size={18} />
          <span>
            {region.name}
            <small>IALA {region.buoyage}</small>
          </span>
        </button>
      </header>

      <div className="category-list">
        {active.map((c) => {
          const g = GENERATORS[c.id]
          return <CategoryButton key={c.id} c={c} onOpen={onOpen} progress={g ? mastery(g.items(ctx)) : undefined} />
        })}
      </div>

      <CategoryButton c={FINAL_EXAM} onOpen={onOpen} big />

      {soon.length > 0 && (
        <section>
          <h2 className="label">Coming soon</h2>
          <div className="soon-grid">
            {soon.map((c) => (
              <button key={c.id} className="soon-tile" onClick={() => onOpen(c.id)}>
                <CategoryIcon kind={c.icon} size={26} />
                <span>{c.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <footer className="footer muted small">
        Lanterna ·{' '}
        <button className="footer-link" onClick={() => setReporting(true)}>
          Report a problem
        </button>{' '}
        ·{' '}
        <a href="/privacy.html" target="_blank" rel="noopener">
          Privacy policy
        </a>
      </footer>
      {reporting && <ReportDialog base={{ kind: 'bug' }} onClose={() => setReporting(false)} />}
    </div>
  )
}

function CategoryButton({
  c,
  onOpen,
  big = false,
  progress,
}: {
  c: Category
  onOpen: (id: CategoryId) => void
  big?: boolean
  progress?: number
}) {
  return (
    <button className={`category ${c.tag === 'Soon' ? 'soon' : ''} ${big ? 'exam' : ''}`} onClick={() => onOpen(c.id)}>
      <span className="category-icon">
        <CategoryIcon kind={c.icon} size={30} />
      </span>
      <span className="category-body">
        <span className="category-title">
          {c.title}
          {c.tag === 'Free' && <span className="tag tag-free">Free</span>}
          {c.tag === 'Soon' && <span className="tag tag-soon">Coming soon</span>}
        </span>
        <span className="category-text">{c.text}</span>
        {progress !== undefined && (
          <span className="progress-track small-track" aria-label={`${Math.round(progress * 100)}% learned`}>
            <span className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </span>
        )}
      </span>
      <span className="category-arrow" aria-hidden="true">
        ›
      </span>
    </button>
  )
}
