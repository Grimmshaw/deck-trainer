import { useRef, useState } from 'react'
import type { Settings } from '../App'
import { LEVELS } from '../morse'
import { pickWord, type Pick } from '../wordPicker'
import ChartGrid from './ChartGrid'
import DecodeRound from './DecodeRound'
import EncodeRound from './EncodeRound'

interface Props {
  settings: Settings
  onExit: () => void
  onStreak: (streak: number) => void
}

const RECENT_MAX = 15

export default function Practice({ settings, onExit, onStreak }: Props) {
  const { mode, level, length } = settings
  const recent = useRef<string[]>([])
  const [pick, setPick] = useState<Pick>(() => pickWord(level, length))
  const [round, setRound] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showChart, setShowChart] = useState(false)

  const handleResult = (ok: boolean) => {
    setAttempts((a) => a + 1)
    if (ok) {
      setCorrect((c) => c + 1)
      const next = streak + 1
      setStreak(next)
      onStreak(next)
    } else {
      setStreak(0)
    }
  }

  const handleNext = () => {
    recent.current = [pick.word, ...recent.current].slice(0, RECENT_MAX)
    setPick(pickWord(level, length, recent.current))
    setRound((r) => r + 1)
  }

  return (
    <div className="screen practice">
      <header className="topbar">
        <button className="icon-btn" onClick={onExit} aria-label="Back to menu">
          ←
        </button>
        <div className="topbar-title">
          {mode === 'decode' ? 'Decode' : 'Encode'}
          <small>
            {LEVELS[level].label} · {length} letters
          </small>
        </div>
        <button
          className={`icon-btn ${showChart ? 'active' : ''}`}
          onClick={() => setShowChart((s) => !s)}
          aria-label="Toggle Morse chart"
          aria-pressed={showChart}
        >
          ?
        </button>
      </header>

      <div className="scorebar">
        <span>
          Score <strong>{correct}</strong>/{attempts}
        </span>
        <span>
          Streak <strong>{streak}</strong>
        </span>
      </div>

      {showChart && <ChartGrid level={level} onlyLevel />}

      {pick.source === 'random' && <p className="muted small center">Random letters</p>}

      {mode === 'decode' ? (
        <DecodeRound key={round} word={pick.word} onResult={handleResult} onNext={handleNext} />
      ) : (
        <EncodeRound key={round} word={pick.word} onResult={handleResult} onNext={handleNext} />
      )}
    </div>
  )
}
