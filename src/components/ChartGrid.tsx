import { LEVELS, MORSE, type Level } from '../morse'

// Object keys put digits first, so we set the order ourselves
const ORDER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
import MorseSymbols from './MorseSymbols'

interface Props {
  level: Level
  /** Only show the characters in the level */
  onlyLevel?: boolean
}

export default function ChartGrid({ level, onlyLevel = false }: Props) {
  const levelChars = LEVELS[level].chars
  const chars = onlyLevel ? ORDER.filter((c) => levelChars.includes(c)) : ORDER

  return (
    <div className={`chart-grid ${onlyLevel ? 'compact' : ''}`}>
      {chars.map((c) => (
        <div key={c} className={`chart-cell ${levelChars.includes(c) ? '' : 'dim'}`}>
          <span className="chart-char">{c}</span>
          <MorseSymbols code={MORSE[c]} size={onlyLevel ? 'xs' : 'sm'} />
        </div>
      ))}
    </div>
  )
}
