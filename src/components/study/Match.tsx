import { useMemo, useState } from 'react'
import { record } from '../../study/progress'
import type { Ctx, Generator, MatchPair } from '../../study/types'
import { shuffle } from '../../study/util'

// "Match pairs": four pictures (or codes) on the left, four meanings on the right.
// Tap one on each side. A right pair locks, a wrong one flashes red.

const PER_ROUND = 4
const ROUNDS = 5

interface Props {
  title: string
  generator: Generator
  ctx: Ctx
  onExit: () => void
}

/** Four pairs with different groups and different meanings */
function deal(all: MatchPair[]): MatchPair[] {
  const out: MatchPair[] = []
  for (const p of shuffle(all)) {
    if (out.some((o) => o.group === p.group || o.right === p.right)) continue
    out.push(p)
    if (out.length === PER_ROUND) break
  }
  return out
}

export default function Match({ title, generator, ctx, onExit }: Props) {
  const all = useMemo(() => generator.pairs!(ctx), [])
  const [round, setRound] = useState(1)
  const [pairs, setPairs] = useState(() => deal(all))
  const [rightOrder, setRightOrder] = useState(() => shuffle(pairs.map((p) => p.key)))
  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [wrong, setWrong] = useState<string | null>(null)
  const [missed, setMissed] = useState<Set<string>>(new Set())
  const [mistakes, setMistakes] = useState(0)
  const [done, setDone] = useState(false)

  const roundDone = matched.length === pairs.length

  const tapRight = (key: string) => {
    if (!selected || matched.includes(key)) return
    if (key === selected) {
      const next = [...matched, key]
      setMatched(next)
      setSelected(null)
      if (next.length === pairs.length) {
        // Record each item once per round: right only if it was matched without a mistake
        pairs.forEach((p) => record(p.key, !missed.has(p.key)))
      }
    } else {
      setMissed((m) => new Set(m).add(selected))
      setMistakes((n) => n + 1)
      setWrong(key)
      window.setTimeout(() => setWrong(null), 500)
    }
  }

  const newRound = (n: number) => {
    const p = deal(all)
    setPairs(p)
    setRightOrder(shuffle(p.map((x) => x.key)))
    setMatched([])
    setMissed(new Set())
    setSelected(null)
    setRound(n)
  }

  const nextRound = () => {
    if (round >= ROUNDS) setDone(true)
    else newRound(round + 1)
  }

  const restart = () => {
    setMistakes(0)
    setDone(false)
    newRound(1)
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onExit} aria-label="Close">
          ✕
        </button>
        <h1 className="topbar-title">
          {title}
          <small>Match pairs</small>
        </h1>
        <span className="topbar-spacer" />
      </header>

      {done ? (
        <div className="results">
          <div className={`score-ring ${mistakes === 0 ? 'good' : mistakes <= 4 ? 'ok' : 'low'}`}>
            <strong>{ROUNDS * PER_ROUND}</strong>
            <span>pairs</span>
          </div>
          <p className="center">
            {mistakes === 0 ? 'Perfect – no mistakes!' : `${mistakes} wrong ${mistakes === 1 ? 'try' : 'tries'}.`}
          </p>
          <div className="actions-col">
            <button
              className="primary big"
              onClick={restart}
            >
              Play again
            </button>
            <button className="secondary" onClick={onExit}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="scorebar">
            <span>
              Round <strong>{round}</strong>/{ROUNDS}
            </span>
            <span>
              Wrong <strong>{mistakes}</strong>
            </span>
          </div>
          <p className="muted small center">Tap a picture, then its meaning.</p>
          <div className="match-grid">
            <div className="match-col">
              {pairs.map((p) => (
                <button
                  key={p.key}
                  className={`match-item match-left ${selected === p.key ? 'selected' : ''} ${matched.includes(p.key) ? 'matched' : ''}`}
                  onClick={() => !matched.includes(p.key) && setSelected(p.key)}
                  disabled={matched.includes(p.key)}
                >
                  {p.left}
                </button>
              ))}
            </div>
            <div className="match-col">
              {rightOrder.map((k) => {
                const p = pairs.find((x) => x.key === k)!
                return (
                  <button
                    key={k}
                    className={`match-item match-right ${matched.includes(k) ? 'matched' : ''} ${wrong === k ? 'wrong' : ''}`}
                    onClick={() => tapRight(k)}
                    disabled={matched.includes(k)}
                  >
                    {p.right}
                  </button>
                )
              })}
            </div>
          </div>
          {roundDone && (
            <button className="primary big" onClick={nextRound}>
              {round >= ROUNDS ? 'See result' : 'Next round →'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
