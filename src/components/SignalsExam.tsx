import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LEVELS, toMorse } from '../morse'
import { track } from '../stats/usage'
import MorseLamp, { savedSpeed, SPEEDS, type Speed } from './MorseLamp'
import MorseSymbols from './MorseSymbols'

// Unofficial practice exam modelled on the published format of the Indian
// signals (Morse) exam: 60 single characters at 1 point each and 8 groups of
// five characters at 5 points each (1 per character), 100 points, 70 to pass.
// Robin should confirm with an Indian colleague whether the exam is read from
// a flashing light; both ways are offered here, the light first.

const SINGLES = 60
const GROUPS = 8
const GROUP_LEN = 5
const PASS = 70
const CHARS = LEVELS[3].chars

interface Item {
  text: string
  points: number
}

function makeItems(): Item[] {
  const r = () => CHARS[Math.floor(Math.random() * CHARS.length)]
  const singles = Array.from({ length: SINGLES }, () => ({ text: r(), points: 1 }))
  const groups = Array.from({ length: GROUPS }, () => ({ text: Array.from({ length: GROUP_LEN }, r).join(''), points: GROUP_LEN }))
  return [...singles, ...groups]
}

/** Points for one answer: a single character is right or wrong; a group gets one point per character in its place */
export function scoreItem(item: Item, answer: string): number {
  const a = answer.replace(/\s+/g, '').toUpperCase()
  if (item.text.length === 1) return a === item.text ? 1 : 0
  let p = 0
  for (let i = 0; i < item.text.length; i++) if (a[i] === item.text[i]) p++
  return p
}

type Stage = 'start' | 'run' | 'done'

export default function SignalsExam({ onExit }: { onExit: () => void }) {
  const [stage, setStage] = useState<Stage>('start')
  const [byLight, setByLight] = useState(true)
  const [speed, setSpeed] = useState<Speed>(savedSpeed)
  const [items, setItems] = useState<Item[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const i = answers.length

  const start = () => {
    setItems(makeItems())
    setAnswers([])
    setText('')
    setStage('run')
    track('start', { category: 'morse', mode: 'india' })
  }

  useEffect(() => {
    if (stage === 'run') inputRef.current?.focus()
  }, [stage, i])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = [...answers, text]
    setAnswers(next)
    setText('')
    if (next.length === items.length) {
      setStage('done')
      const score = items.reduce((s, it, j) => s + scoreItem(it, next[j]), 0)
      track('finish', { category: 'morse', mode: 'india', score: Math.round(score / 10) * 10, count: items.length })
    }
  }

  const header = (
    <header className="topbar">
      <button className="icon-btn" onClick={onExit} aria-label="Close">
        ✕
      </button>
      <div className="topbar-title">
        Signals exam – India
        <small>Unofficial practice</small>
      </div>
      <span className="topbar-spacer" />
    </header>
  )

  if (stage === 'start') {
    return (
      <div className="screen">
        {header}
        <div className="exam-sim-intro">
          <p>
            Practice modelled on the published format of the Indian signals exam: <strong>{SINGLES} single characters</strong> (1
            point each) and <strong>{GROUPS} groups of {GROUP_LEN} characters</strong> (1 point per character). {PASS} of 100
            points to pass.
          </p>
          <p className="muted small">Not an official exam and not made by the DG Shipping. Each signal is shown once.</p>
        </div>
        <h2 className="step-question">How is the Morse shown?</h2>
        <div className="mode-list">
          <button className={`mode-row exam-cat ${byLight ? 'on' : ''}`} aria-pressed={byLight} onClick={() => setByLight(true)}>
            <span className="exam-check" aria-hidden="true">{byLight ? '✓' : ''}</span>
            <strong>Flashing light</strong>
          </button>
          <button className={`mode-row exam-cat ${!byLight ? 'on' : ''}`} aria-pressed={!byLight} onClick={() => setByLight(false)}>
            <span className="exam-check" aria-hidden="true">{!byLight ? '✓' : ''}</span>
            <strong>Dots and dashes</strong>
          </button>
        </div>
        {byLight && (
          <div className="speed-chips center-row" role="group" aria-label="Speed">
            {(Object.keys(SPEEDS) as Speed[]).map((s) => (
              <button key={s} type="button" className="chip" aria-pressed={speed === s} onClick={() => setSpeed(s)}>
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}
        <button className="primary big" onClick={start}>
          Start
        </button>
      </div>
    )
  }

  if (stage === 'done') {
    const scores = items.map((it, j) => scoreItem(it, answers[j]))
    const total = scores.reduce((a, b) => a + b, 0)
    const passed = total >= PASS
    const wrong = items.map((it, j) => ({ it, a: answers[j], p: scores[j] })).filter((x) => x.p < x.it.points)
    return (
      <div className="screen">
        {header}
        <div className="results">
          <div className={`score-ring ${passed ? 'good' : total >= PASS - 15 ? 'ok' : 'low'}`}>
            <strong>{total}</strong>
            <span>of 100</span>
          </div>
          <p className="center">
            {passed ? `Passed – ${PASS} points needed.` : `Not passed this time – ${PASS} points needed.`} Singles{' '}
            {scores.slice(0, SINGLES).reduce((a, b) => a + b, 0)}/{SINGLES}, groups {scores.slice(SINGLES).reduce((a, b) => a + b, 0)}/
            {GROUPS * GROUP_LEN}.
          </p>
          <div className="actions-col">
            <button className="primary big" onClick={start}>
              Try again
            </button>
            <button className="secondary" onClick={onExit}>
              Done
            </button>
          </div>
          {wrong.length > 0 && (
            <>
              <h2 className="label">Your mistakes</h2>
              {wrong.map((x, j) => (
                <div key={j} className="review-item sim-mistake">
                  <div className="sim-code">
                    {toMorse(x.it.text).map((c, k) => (
                      <MorseSymbols key={k} code={c} size="sm" />
                    ))}
                  </div>
                  <p className="review-wrong">Your answer: {x.a.trim() || '–'}</p>
                  <p className="review-right">Correct: {x.it.text}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    )
  }

  const item = items[i]
  return (
    <div className="screen">
      {header}
      <div className="scorebar">
        <span>
          {i < SINGLES ? 'Single character' : 'Group'} <strong>{i < SINGLES ? i + 1 : i - SINGLES + 1}</strong>/{i < SINGLES ? SINGLES : GROUPS}
        </span>
        <span>
          {i + 1}/{items.length}
        </span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${(i / items.length) * 100}%` }} />
      </div>
      <form className="round" onSubmit={submit} key={i}>
        {byLight ? (
          <MorseLamp word={item.text} controls={false} speed={speed} />
        ) : (
          <div className="letters">
            {toMorse(item.text).map((c, k) => (
              <div key={k} className="letter-cell">
                <MorseSymbols code={c} unit={item.text.length > 1 ? 9 : 14} />
              </div>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          className="answer"
          value={text}
          onChange={(e) => setText(e.target.value.toUpperCase())}
          placeholder={item.text.length > 1 ? 'Type the group' : 'Type the character'}
          maxLength={item.text.length + 3}
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Your answer"
        />
        <button type="submit" className="primary big">
          {i + 1 === items.length ? 'Finish' : 'Next'}
        </button>
      </form>
    </div>
  )
}
