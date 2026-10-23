import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { findCategory, type CategoryId } from '../../study/categories'
import { pickKey, record, weakKeys } from '../../study/progress'
import type { Ctx, Generator, Question } from '../../study/types'
import { pick } from '../../study/util'
import SoundModeToggle from '../../sound/SoundModeToggle'
import ReportDialog from '../../report/ReportDialog'
import { track, trackAnswers } from '../../stats/usage'
import { gradeTyped, type TypedResult } from '../../study/typed'
import { PLAY_URL, playService, ratingAsked, shouldAskForRating } from '../../store/entitlement'
import { TapHint, useTapToContinue } from './TapToContinue'
import { shareQuestion } from '../../share/shareQuestion'
import MediaSwap from './MediaSwap'

export type SessionMode = 'practice' | 'exam' | 'mistakes'

interface Props {
  title: string
  /** For the statistics: the category, or 'exam' for the final exam */
  statsCategory: CategoryId
  generators: Generator[]
  mode: SessionMode
  count: number
  ctx: Ctx
  onExit: () => void
  /** Start a new session that practises the items answered wrong */
  onPracticeMistakes?: () => void
  /** The free round in a locked category */
  trial?: boolean
  /** Open the unlock page (after the free round) */
  onUnlock?: () => void
}

interface Answered {
  q: Question
  chosen: string | null
  /** What the user typed, if the question was answered by typing */
  typed?: string
}

/** A typed answer and how it was graded */
interface TypedState {
  text: string
  result: TypedResult
  /** The user said the grading was too strict and counted it as right */
  override: boolean
}

/** `chosen` for a typed answer that was wrong (it matches no option) */
const TYPED_WRONG = 'typed'
/** Share of questions that ask for a typed answer, when the question has one (never in the exam) */
const TYPED_SHARE = 0.25
const rollTyped = () => Math.random() < TYPED_SHARE

/** Seconds per question in exam mode */
const EXAM_SECONDS_PER_QUESTION = 45

export default function Session({ title, statsCategory, generators, mode, count, ctx, onExit, onPracticeMistakes, trial, onUnlock }: Props) {
  const recent = useRef<string[]>([])
  const pools = useMemo(
    () =>
      generators.map((g) => {
        const items = g.items(ctx)
        return { g, items: mode === 'mistakes' ? weakKeys(items) : items }
      }),
    // A session keeps the same item pools from start to finish
    [],
  )
  const usable = pools.filter((p) => p.items.length > 0)

  const next = (): Question | null => {
    for (let i = 0; i < 20; i++) {
      const p = pick(usable)
      const key = pickKey(p.items, recent.current)
      const q = p.g.make(key, ctx)
      if (q) {
        recent.current = [...recent.current, key].slice(-10)
        return q
      }
    }
    return null
  }

  const [question, setQuestion] = useState<Question | null>(() => (usable.length ? next() : null))
  const [chosen, setChosen] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Answered[]>([])
  const [finished, setFinished] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [reporting, setReporting] = useState(false)
  const roundRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState<'busy' | 'saved' | 'failed' | null>(null)
  const exam = mode === 'exam'
  // Now and then a question is answered by typing instead of choosing (only questions that have a `typed` block)
  const [typeMode, setTypeMode] = useState(rollTyped)
  const [typed, setTyped] = useState<TypedState | null>(null)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const goNext = useRef<() => void>(() => {})
  const [secondsLeft, setSecondsLeft] = useState(count * EXAM_SECONDS_PER_QUESTION)

  // Anonymous usage statistics: the session was finished, and how it went,
  // or (when it is left before the end) how far it got
  const statsMode = trial ? 'trial' : mode
  const sent = useRef(false)
  const sendAnswers = (list: Answered[]) =>
    trackAnswers(statsCategory, list.map((a) => [a.q.key, a.chosen === a.q.correctId]))
  useEffect(() => {
    if (!finished || answers.length === 0 || sent.current) return
    sent.current = true
    const right = answers.filter((a) => a.chosen === a.q.correctId).length
    track('finish', { category: statsCategory, mode: statsMode, focus: ctx.focus, score: Math.round((right / count) * 10) * 10, count })
    sendAnswers(answers)
  }, [finished])
  const latest = useRef(answers)
  latest.current = answers
  useEffect(
    () => () => {
      const list = latest.current
      if (sent.current || list.length === 0) return
      track('quit', { category: statsCategory, mode: statsMode, focus: ctx.focus, score: Math.round((list.length / count) * 10) * 10, count })
      sendAnswers(list)
    },
    [],
  )

  // After the answer is shown, a tap anywhere goes on (not while the report sheet is open)
  const tapReady = useTapToContinue((chosen !== null || typed !== null) && !reporting && !finished, () => goNext.current())

  // Exam clock
  useEffect(() => {
    if (!exam || finished) return
    const t = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearInterval(t)
  }, [exam, finished])
  useEffect(() => {
    if (exam && secondsLeft <= 0) {
      setTimedOut(true)
      setFinished(true)
    }
  }, [exam, secondsLeft])

  if (usable.length === 0) {
    return (
      <Shell title={title} onExit={onExit}>
        <div className="coming-soon">
          <p>No mistakes to practise right now – well done!</p>
          <button className="secondary" onClick={onExit}>
            Back
          </button>
        </div>
      </Shell>
    )
  }

  if (finished || !question) {
    return (
      <Results
        title={title}
        answers={answers}
        count={count}
        timedOut={timedOut}
        onExit={onExit}
        onPracticeMistakes={onPracticeMistakes}
        trial={trial}
        onUnlock={onUnlock}
      />
    )
  }

  const choose = (id: string) => {
    if (chosen !== null) return
    record(question.key, id === question.correctId)
    buzz(id === question.correctId)
    if (exam) {
      advance({ q: question, chosen: id })
    } else {
      setChosen(id)
    }
  }

  const advance = (a: Answered) => {
    const all = [...answers, a]
    setAnswers(all)
    setChosen(null)
    setTyped(null)
    setText('')
    setTypeMode(rollTyped())
    setSharing(null)
    if (all.length >= count) {
      setFinished(true)
    } else {
      setQuestion(next())
      window.scrollTo(0, 0)
    }
  }

  const canType = !exam && !!question.typed
  const typing = canType && typeMode
  const correctLabel = question.typed?.answer ?? question.options.find((o) => o.id === question.correctId)?.label ?? ''
  const typedOk = !!typed && (typed.override || typed.result.verdict === 'right' || typed.result.verdict === 'typo')

  const check = (giveUp = false) => {
    if (typed || !question.typed) return
    const input = giveUp ? '' : text
    const wrong = question.options.filter((o) => o.id !== question.correctId).map((o) => o.label)
    const result = gradeTyped(input, question.typed, wrong)
    setTyped({ text: input.trim(), result, override: false })
    buzz(result.verdict === 'right' || result.verdict === 'typo')
  }

  // A typed answer is recorded when moving on, so "Count it as right" can still change it
  const nextAfterTyped = (t: TypedState) => {
    const ok = t.override || t.result.verdict === 'right' || t.result.verdict === 'typo'
    record(question.key, ok)
    advance({ q: question, chosen: ok ? question.correctId : t.text ? TYPED_WRONG : null, typed: t.text || undefined })
  }

  const right = answers.filter((a) => a.chosen === a.q.correctId).length
  const answered = chosen !== null || typed !== null
  const correct = typed ? typedOk : chosen === question.correctId
  goNext.current = () => (typed ? nextAfterTyped(typed) : advance({ q: question, chosen }))

  const hasSound = generators.some((g) => g.category === 'sound')

  return (
    <Shell title={title} onExit={onExit} right={hasSound ? <SoundModeToggle compact /> : undefined}>
      <div className="scorebar">
        <span>
          {trial && <span className="trial-chip">Free round</span>}
          Question <strong>{answers.length + 1}</strong>/{count}
        </span>
        {exam ? (
          <span className={secondsLeft < 60 ? 'time-low' : ''}>
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
          </span>
        ) : (
          <span>
            Right <strong>{right}</strong>
          </span>
        )}
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${(answers.length / count) * 100}%` }} />
      </div>

      <div className="round" key={answers.length} ref={roundRef}>
        {generators.length > 1 && <span className="category-chip">{findCategory(question.category).title}</span>}
        <p className="question-text">{question.prompt}</p>
        {question.media && question.reveal && question.transition ? (
          <MediaSwap media={question.media} reveal={question.reveal} kind={question.transition} revealed={answered} />
        ) : (
          question.media && <div className="question-media">{question.media}</div>
        )}
        {answered && question.reveal && !question.transition && <div className="question-media reveal-in">{question.reveal}</div>}

        {typing ? (
          <form
            className="typed-form"
            onSubmit={(e) => {
              e.preventDefault()
              if (typed) nextAfterTyped(typed)
              else if (text.trim()) check()
            }}
          >
            <input
              ref={inputRef}
              className={`answer typed-answer ${typed ? (typedOk ? 'right' : 'wrong') : ''}`}
              value={typed ? typed.text : text}
              onChange={(e) => setText(e.target.value)}
              placeholder={question.typed?.hint ?? 'Type your answer'}
              maxLength={120}
              autoFocus
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint={typed ? 'next' : 'done'}
              readOnly={!!typed}
              aria-label="Your answer"
            />
            {!typed && (
              <div className="actions">
                <button type="button" className="secondary" onClick={() => check(true)}>
                  Show answer
                </button>
                <button type="submit" className="primary" disabled={!text.trim()}>
                  Check
                </button>
              </div>
            )}
          </form>
        ) : (
        <div className={`options ${question.layout === 'pictures' ? 'options-pictures' : ''}`}>
          {question.options.map((o) => {
            const state = !answered ? '' : o.id === question.correctId ? 'right' : o.id === chosen ? 'wrong' : 'dim'
            return (
              <button key={o.id} className={`option ${state} ${o.node ? 'option-rich' : ''}`} onClick={() => choose(o.id)} disabled={answered}>
                {o.node ?? o.label}
                {answered && question.layout === 'pictures' && <span className="pic-caption">{o.label}</span>}
              </button>
            )
          })}
        </div>
        )}

        {answered && (
          <>
            <div className={`feedback ${correct ? 'right' : 'wrong'}`} role="status">
              {typed ? <TypedVerdict t={typed} answer={correctLabel} /> : correct ? 'Correct!' : 'Not quite.'}
              <p className="feedback-detail">{question.explanation}</p>
            </div>
            {typed && !typedOk && typed.text && (
              <button className="secondary" onClick={() => setTyped({ ...typed, override: true })}>
                My answer was right – count it
              </button>
            )}
          </>
        )}
        {exam && (
          <button className="secondary" onClick={() => setFinished(true)}>
            Finish exam now
          </button>
        )}
        {!exam && (
          <div className="question-links">
            {/* Sound questions have nothing to show in a picture */}
            {question.category !== 'sound' && (
              <button
                className="report-link"
                disabled={sharing === 'busy'}
                onClick={async () => {
                  if (!roundRef.current) return
                  setSharing('busy')
                  track('share', { category: question.category })
                  const r = await shareQuestion(roundRef.current, findCategory(question.category).title)
                  setSharing(r === 'saved' || r === 'failed' ? r : null)
                }}
              >
                {sharing === 'busy' ? 'Making the picture…' : sharing === 'saved' ? 'Picture saved' : sharing === 'failed' ? 'Could not make the picture' : 'Share this question'}
              </button>
            )}
            <button className="report-link" onClick={() => setReporting(true)}>
              Report a problem with this question
            </button>
          </div>
        )}
        {answered && <TapHint ready={tapReady} last={answers.length + 1 >= count} />}
      </div>
      {reporting && (
        <ReportDialog
          base={{
            kind: 'question',
            category: question.category,
            key: question.key,
            question: question.prompt,
            answer: question.options.find((o) => o.id === question.correctId)?.label,
            chosen: typed?.text || (chosen ? question.options.find((o) => o.id === chosen)?.label : undefined),
          }}
          onClose={() => setReporting(false)}
        />
      )}
    </Shell>
  )
}

function Shell({ title, onExit, children, right }: { title: string; onExit: () => void; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onExit} aria-label="Close">
          ✕
        </button>
        <h1 className="topbar-title">{title}</h1>
        {right ?? <span className="topbar-spacer" />}
      </header>
      {children}
    </div>
  )
}

function Results({
  title,
  answers,
  count,
  timedOut,
  onExit,
  onPracticeMistakes,
  trial,
  onUnlock,
}: {
  title: string
  answers: Answered[]
  count: number
  timedOut: boolean
  onExit: () => void
  onPracticeMistakes?: () => void
  trial?: boolean
  onUnlock?: () => void
}) {
  const right = answers.filter((a) => a.chosen === a.q.correctId).length
  const pct = Math.round((right / count) * 100)
  const shownPct = useCountUp(pct)
  const wrong = answers.filter((a) => a.chosen !== a.q.correctId)

  // Ask once for a rating on Google Play, after a good round, only in the Play app
  const [askRating, setAskRating] = useState(false)
  useEffect(() => {
    if (trial || !shouldAskForRating(right, answers.length)) return
    playService().then((s) => {
      if (!s) return
      ratingAsked()
      setAskRating(true)
    })
  }, [])

  // Score per category (useful in the mixed final exam)
  const byCat = new Map<CategoryId, { right: number; total: number }>()
  answers.forEach((a) => {
    const c = byCat.get(a.q.category) ?? { right: 0, total: 0 }
    c.total++
    if (a.chosen === a.q.correctId) c.right++
    byCat.set(a.q.category, c)
  })

  return (
    <Shell title={title} onExit={onExit}>
      <div className="results">
        <div className={`score-ring ${grade(pct)}`} style={{ '--ring': pct } as CSSProperties}>
          <strong>{shownPct}%</strong>
          <span>
            {right} of {count}
          </span>
        </div>
        <p className="center">
          {pct >= 90 ? 'Excellent!' : pct >= 75 ? 'Well done.' : pct >= 50 ? 'Getting there – keep practising.' : 'Keep at it – practise your mistakes.'}
          {answers.length < count &&
            (timedOut
              ? ` Time ran out after ${answers.length} of ${count} questions.`
              : ` You answered ${answers.length} of ${count} questions.`)}
        </p>

        {trial && onUnlock && (
          <div className="trial-card">
            <p>
              That was your free round. Unlock the full version to keep going in every category – one payment, no
              subscription.
            </p>
            <button className="primary big" onClick={onUnlock}>
              Unlock all
            </button>
          </div>
        )}

        {askRating && (
          <div className="rate-card">
            <p>Finding Lanterna useful? A rating on Google Play helps other cadets find it.</p>
            <div className="actions">
              <button className="secondary" onClick={() => setAskRating(false)}>
                Not now
              </button>
              <a className="primary as-button" href={PLAY_URL} target="_blank" rel="noopener" onClick={() => setAskRating(false)}>
                Rate Lanterna
              </a>
            </div>
          </div>
        )}

        {byCat.size > 1 && (
          <div className="cat-scores">
            {[...byCat.entries()].map(([id, s]) => (
              <div key={id} className="cat-score">
                <span>{findCategory(id).title}</span>
                <strong>
                  {s.right}/{s.total}
                </strong>
                <span
                  className={`cat-bar ${grade((s.right / s.total) * 100)}`}
                  style={{ width: `${(s.right / s.total) * 100}%` }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        )}

        <div className="actions-col">
          {wrong.length > 0 && onPracticeMistakes && (
            <button className="primary big" onClick={onPracticeMistakes}>
              Practise my mistakes
            </button>
          )}
          <button className="secondary" onClick={onExit}>
            Done
          </button>
        </div>

        {wrong.length > 0 && (
          <>
            <h2 className="label">Review your mistakes</h2>
            {wrong.map((a, i) => (
              <div key={i} className="review-item">
                <p className="question-text small-q">{a.q.prompt}</p>
                {/* Pictures are shown again; sound questions are not, so nothing plays by itself */}
                {a.q.media && a.q.category !== 'sound' && (
                  <div className="question-media review-media">{a.q.media}</div>
                )}
                {a.chosen && (
                  <p className="review-wrong">
                    Your answer: {a.typed ?? answerText(a.q, a.chosen)}
                  </p>
                )}
                {!a.chosen && <p className="review-wrong">Not answered</p>}
                <p className="review-right">
                  Correct: {answerText(a.q, a.q.correctId)}
                </p>
                <p className="muted small">{a.q.explanation}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </Shell>
  )
}

/** The verdict line for a typed answer */
function TypedVerdict({ t, answer }: { t: TypedState; answer: string }) {
  const v = t.result.verdict
  if (t.override) return <>Counted as right.</>
  if (v === 'right') return <>Correct!</>
  return (
    <>
      {v === 'typo' ? 'Correct – check the spelling.' : v === 'partial' ? 'Partly right.' : t.text ? 'Not quite.' : 'No answer.'}
      {v === 'partial' && t.result.missing.length > 0 && (
        <span className="typed-missing">Missing: {t.result.missing.join(', ')}</span>
      )}
      <span className="typed-correct">{answer}</span>
    </>
  )
}

/** Picture options are shown by name in the review, other rich options as they are */
function answerText(q: Question, id: string): ReactNode {
  const o = q.options.find((x) => x.id === id)
  if (!o) return null
  return q.layout === 'pictures' ? o.label : (o.node ?? o.label)
}

/** Colour class for a score in per cent */
function grade(pct: number): 'good' | 'ok' | 'low' {
  return pct >= 75 ? 'good' : pct >= 50 ? 'ok' : 'low'
}

/** Counts up from 0 to `target` in about a second (at once if the user prefers less motion) */
function useCountUp(target: number, ms = 1000): number {
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [value, setValue] = useState(reduce ? target : 0)
  useEffect(() => {
    if (reduce || target === 0) {
      setValue(target)
      return
    }
    let raf = 0
    let start = 0
    const delay = 150
    const step = (t: number) => {
      if (!start) start = t
      const k = Math.min(1, Math.max(0, (t - start - delay) / ms))
      // Same easing as the ring: fast at first, gently to the end
      const eased = 1 - Math.pow(1 - k, 3)
      setValue(Math.round(target * eased))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return value
}

/** A short vibration on Android: one tap for right, a double buzz for wrong */
function buzz(right: boolean) {
  try {
    navigator.vibrate?.(right ? 12 : [30, 50, 30])
  } catch {
    /* not supported */
  }
}
