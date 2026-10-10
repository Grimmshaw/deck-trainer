import type { Category } from '../../study/categories'
import { mastery, useProgress, weakKeys } from '../../study/progress'
import type { Ctx, Focus, Generator } from '../../study/types'
import CategoryArt from '../../art/CategoryArt'
import SoundModeToggle from '../../sound/SoundModeToggle'
import { LEVELS, MAX_LENGTH, MIN_LENGTH, type Level } from '../../morse'
import { wordsFor } from '../../wordPicker'

// The start page of a category, and the steps after it.
//
// Every button on the start page does one thing: it either starts right away or
// opens the next step, a page with one question ("How many questions?") and one
// big button per answer. Pressing an answer goes on to the next step or starts.
// Each step is its own screen in the app's history, so the phone's back button
// goes back one step.

export type ModeId = 'learn' | 'match' | 'practice' | 'exam' | 'mistakes' | 'decode' | 'encode'

/** The choices made so far on the way to starting something */
export interface Choice {
  mode: ModeId
  focus?: Focus
  count?: number
  level?: Level
  length?: number
}

type Step = 'focus' | 'count' | 'level' | 'length'

const COUNTS = [10, 30, 50]
const FOCUS_ORDER: Focus[] = ['alphabet', 'meaning', 'both']
const FOCUS_TITLE: Record<Focus, string> = { alphabet: 'Alphabet', meaning: 'Meanings', both: 'Both' }

const MODE_TITLE: Record<ModeId, string> = {
  learn: 'Learn',
  match: 'Match pairs',
  practice: 'Practice',
  exam: 'Test',
  mistakes: 'My mistakes',
  decode: 'Read Morse',
  encode: 'Send Morse',
}

/** The step still to answer, or null when everything is chosen */
export function nextStep(c: Choice, gen: Generator): Step | null {
  const focusable = c.mode === 'learn' || c.mode === 'match' || c.mode === 'practice' || c.mode === 'exam'
  if (focusable && gen.focus && !c.focus) return 'focus'
  if (c.mode === 'practice' && !c.count) return 'count'
  if ((c.mode === 'decode' || c.mode === 'encode') && !c.level) return 'level'
  if ((c.mode === 'decode' || c.mode === 'encode') && !c.length) return 'length'
  return null
}

/** The choice one step back (the step page before this one), or undefined for the start page */
export function previousChoice(c: Choice): Choice | undefined {
  if (c.length) return { ...c, length: undefined }
  if (c.count) return { ...c, count: undefined }
  if (c.level) return { ...c, level: undefined }
  if (c.focus) return { ...c, focus: undefined }
  return undefined
}

interface Props {
  category: Category
  generator: Generator
  ctx: Ctx
  /** Set when a step page is shown */
  choice?: Choice
  onBack: () => void
  /** Show the next step page. `fromStep` is true when it comes from a step page. */
  onChoose: (c: Choice, fromStep: boolean) => void
  /** Everything is chosen: start. `fromStep` is true when started from a step page. */
  onLaunch: (c: Choice, fromStep: boolean) => void
  /** Optional reference page, for example the gallery of all marks */
  reference?: { label: string; text: string; open: () => void }
  /** Morse only: the typing practice (read and send Morse) */
  typing?: { bestStreak: number }
}

export default function CategoryHome(props: Props) {
  const { category, generator, choice } = props
  // Hooks first, the same on the start page and on every step page
  useProgress()
  const step = choice ? nextStep(choice, generator) : null
  if (choice && step) return <StepPage {...props} choice={choice} step={step} />

  const { ctx, onBack, reference, typing } = props
  const items = generator.items(ctx)
  const m = mastery(items)
  const weak = weakKeys(items).length

  const press = (mode: ModeId) => {
    const c: Choice = { mode }
    if (nextStep(c, generator)) props.onChoose(c, false)
    else props.onLaunch(c, false)
  }

  return (
    <div className={`screen cat-${category.id}`}>
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
        <CategoryArt id={category.id} icon={category.icon} />
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
        {typing && (
          <>
            <button className="mode-row" onClick={() => press('decode')}>
              <strong>Read Morse</strong>
              <span>See dots and dashes – type the word</span>
            </button>
            <button className="mode-row" onClick={() => press('encode')}>
              <strong>Send Morse</strong>
              <span>
                See the word – tap it in Morse
                {typing.bestStreak > 0 ? ` · Best streak ${typing.bestStreak}` : ''}
              </span>
            </button>
          </>
        )}

        {generator.card && (
          <button className="mode-row" onClick={() => press('learn')}>
            <strong>Learn</strong>
            <span>Flashcards – turn the card and say if you knew it</span>
          </button>
        )}

        {generator.pairs && (
          <button className="mode-row" onClick={() => press('match')}>
            <strong>Match pairs</strong>
            <span>Pair pictures with their meanings – five quick rounds</span>
          </button>
        )}

        <button className="mode-row" onClick={() => press('practice')}>
          <strong>Practice</strong>
          <span>Multiple choice with the answer explained after each question</span>
        </button>

        <button className="mode-row" onClick={() => press('exam')}>
          <strong>Test</strong>
          <span>30 questions on time. Results and review at the end.</span>
        </button>

        <button className="mode-row" onClick={() => press('mistakes')} disabled={weak === 0}>
          <strong>My mistakes {weak > 0 && <span className="tag tag-preview">{weak}</span>}</strong>
          <span>{weak > 0 ? 'Practise the topics you got wrong' : 'Nothing to practise – no recent mistakes'}</span>
        </button>

        {reference && (
          <button className="mode-row" onClick={reference.open}>
            <strong>{reference.label}</strong>
            <span>{reference.text}</span>
          </button>
        )}
      </div>
    </div>
  )
}

/** One step: a single question with one big button per answer */
function StepPage({ category, generator, choice, step, onBack, onChoose, onLaunch }: Props & { choice: Choice; step: Step }) {
  const answer = (patch: Partial<Choice>) => {
    const c = { ...choice, ...patch }
    if (nextStep(c, generator)) onChoose(c, true)
    else onLaunch(c, true)
  }

  let question: string
  let options: { key: string; title: string; text?: string; pick: () => void }[]
  let grid = false

  switch (step) {
    case 'focus':
      question = 'What do you want to practise?'
      options = FOCUS_ORDER.map((f) => ({ key: f, title: FOCUS_TITLE[f], text: generator.focus![f], pick: () => answer({ focus: f }) }))
      break
    case 'count':
      question = 'How many questions?'
      options = COUNTS.map((n) => ({ key: String(n), title: `${n} questions`, pick: () => answer({ count: n }) }))
      break
    case 'level':
      question = 'Which characters?'
      options = ([1, 2, 3] as Level[]).map((l) => ({ key: String(l), title: LEVELS[l].label, text: LEVELS[l].summary, pick: () => answer({ level: l }) }))
      break
    case 'length': {
      question = 'How many letters in each word?'
      grid = true
      const lengths = Array.from({ length: MAX_LENGTH - MIN_LENGTH + 1 }, (_, i) => MIN_LENGTH + i)
      options = lengths.map((n) => {
        const words = wordsFor(choice.level!, n).length
        return {
          key: String(n),
          title: String(n),
          text: words > 0 ? `${words} words` : 'random letters',
          pick: () => answer({ length: n }),
        }
      })
      break
    }
  }

  return (
    <div className={`screen cat-${category.id}`}>
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">
          {MODE_TITLE[choice.mode]}
          <small>
            {category.title}
            {choice.focus && step !== 'focus' ? ` · ${FOCUS_TITLE[choice.focus]}` : ''}
            {choice.level && step === 'length' ? ` · ${LEVELS[choice.level].label}` : ''}
          </small>
        </div>
        <span className="topbar-spacer" />
      </header>

      <h2 className="step-question">{question}</h2>
      <div className={grid ? 'step-grid' : 'mode-list'}>
        {options.map((o) => (
          <button key={o.key} className="mode-row step-option" onClick={o.pick}>
            <strong>{o.title}</strong>
            {o.text && <span>{o.text}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
