import type { Settings, Stats } from '../App'
import { LEVELS, MAX_LENGTH, MIN_LENGTH, type Level, type Mode } from '../morse'
import { wordsFor } from '../wordPicker'

interface Props {
  settings: Settings
  stats: Stats
  onChange: (s: Settings) => void
  onStart: () => void
  onChart: () => void
  onLearn: () => void
  onQuiz: () => void
  onBack: () => void
}

const MODES: { id: Mode; title: string; text: string }[] = [
  { id: 'decode', title: 'Decode', text: 'See dots and dashes – type the word' },
  { id: 'encode', title: 'Encode', text: 'See the word – tap it in Morse' },
]

export default function Home({ settings, stats, onChange, onStart, onChart, onLearn, onQuiz, onBack }: Props) {
  const { mode, level, length } = settings
  const available = wordsFor(level, length).length
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch })

  return (
    <div className="screen home">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back to start">
          ←
        </button>
        <div className="topbar-title">
          Morse code
          <small>Visual Morse practice</small>
        </div>
        <span className="topbar-spacer" />
      </header>

      <section>
        <h2 className="label">Mode</h2>
        <div className="mode-grid">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`card-btn ${mode === m.id ? 'selected' : ''}`}
              onClick={() => set({ mode: m.id })}
              aria-pressed={mode === m.id}
            >
              <span className="card-title">{m.title}</span>
              <span className="card-text">{m.text}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="label">Level</h2>
        <div className="segmented">
          {([1, 2, 3] as Level[]).map((l) => (
            <button
              key={l}
              className={level === l ? 'selected' : ''}
              onClick={() => set({ level: l })}
              aria-pressed={level === l}
            >
              <span className="seg-title">{LEVELS[l].label}</span>
              <span className="seg-text">{LEVELS[l].summary}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="label">Word length</h2>
        <div className="stepper">
          <button
            className="icon-btn"
            onClick={() => set({ length: Math.max(MIN_LENGTH, length - 1) })}
            disabled={length <= MIN_LENGTH}
            aria-label="Shorter"
          >
            −
          </button>
          <span className="stepper-value">
            {length} <small>letters</small>
          </span>
          <button
            className="icon-btn"
            onClick={() => set({ length: Math.min(MAX_LENGTH, length + 1) })}
            disabled={length >= MAX_LENGTH}
            aria-label="Longer"
          >
            +
          </button>
        </div>
        <p className="muted small center">
          {available > 0
            ? `${available} words available${level === 3 ? ' + groups with digits' : ''}`
            : 'No real words fit – random letters will be used'}
        </p>
      </section>

      <button className="primary big" onClick={onStart}>
        Start
      </button>
      <div className="toggle-row">
        <button className="secondary" onClick={onLearn}>
          Flashcards
        </button>
        <button className="secondary" onClick={onQuiz}>
          Quick quiz
        </button>
      </div>
      <button className="secondary" onClick={onChart}>
        Morse chart
      </button>

      <footer className="footer muted small">
        Best streak: {stats.bestStreak}
      </footer>
    </div>
  )
}
