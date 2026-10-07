import { useMemo, useRef, useState } from 'react'
import { pickKey, record } from '../../study/progress'
import type { Ctx, Flashcard, Generator } from '../../study/types'

interface Props {
  title: string
  generator: Generator
  ctx: Ctx
  onExit: () => void
}

/**
 * Flashcards: look at the front, think of the answer, flip, and say honestly
 * whether you knew it. Cards you don't know come back sooner.
 */
export default function Learn({ title, generator, ctx, onExit }: Props) {
  const items = useMemo(() => generator.items(ctx), [generator, ctx])
  const recent = useRef<string[]>([])

  const draw = () => {
    const key = pickKey(items, recent.current)
    recent.current = [...recent.current, key].slice(-10)
    return { key, card: generator.card!(key, ctx) }
  }

  const [current, setCurrent] = useState<{ key: string; card: Flashcard }>(draw)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState({ known: 0, total: 0 })

  const answer = (knew: boolean) => {
    record(current.key, knew)
    setDone((d) => ({ known: d.known + (knew ? 1 : 0), total: d.total + 1 }))
    setFlipped(false)
    setCurrent(draw())
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onExit} aria-label="Close">
          ✕
        </button>
        <div className="topbar-title">
          {title}
          <small>Learn</small>
        </div>
        <span className="topbar-spacer" />
      </header>

      <div className="scorebar">
        <span>
          Cards <strong>{done.total}</strong>
        </span>
        <span>
          Knew <strong>{done.known}</strong>
        </span>
      </div>

      <div className="flashcard" key={done.total}>
        <div className="flashcard-front">{current.card.front}</div>
        {flipped ? (
          <div className="flashcard-back">{current.card.back}</div>
        ) : (
          <p className="muted small center">Think of the answer, then turn the card.</p>
        )}
      </div>

      {!flipped ? (
        <button className="primary big" onClick={() => setFlipped(true)}>
          Show answer
        </button>
      ) : (
        <div className="actions">
          <button className="secondary" onClick={() => answer(false)}>
            Didn’t know
          </button>
          <button className="primary" onClick={() => answer(true)}>
            Knew it
          </button>
        </div>
      )}
    </div>
  )
}
