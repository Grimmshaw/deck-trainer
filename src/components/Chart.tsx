import { LEVELS, type Level } from '../morse'
import ChartGrid from './ChartGrid'

interface Props {
  level: Level
  onBack: () => void
}

export default function Chart({ level, onBack }: Props) {
  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h1 className="topbar-title">Morse chart</h1>
        <span className="topbar-spacer" />
      </header>
      <p className="muted center">
        Highlighted: {LEVELS[level].label} ({LEVELS[level].summary})
      </p>
      <ChartGrid level={level} />
      <div className="tip">
        <strong>Timing:</strong> a dash is three dots long. Gap inside a letter = 1 dot, between
        letters = 3 dots, between words = 7 dots.
      </div>
    </div>
  )
}
