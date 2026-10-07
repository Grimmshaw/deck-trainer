import { CHART_SYMBOLS, ChartSymbolSvg, type ChartSymbol } from '../../chart/symbols'
import type { Generator, Question } from '../types'
import { shuffle } from '../util'

// Chart symbols (INT 1): name the symbol, or pick the right symbol.

const PREFIX = 'chart:'
const byKey = (key: string) => CHART_SYMBOLS.find((s) => PREFIX + s.id === key)!

/** Wrong answers: from the same group first, so they are close to the right one */
function others(s: ChartSymbol): ChartSymbol[] {
  const pool = CHART_SYMBOLS.filter((o) => o.id !== s.id)
  const same = shuffle(pool.filter((o) => o.group === s.group))
  const rest = shuffle(pool.filter((o) => o.group !== s.group))
  return [...same.slice(0, 2), ...rest].slice(0, 3)
}

const explain = (s: ChartSymbol) => (
  <>
    <strong>{s.name}.</strong> {s.meaning} <span className="muted small">(INT 1 {s.int1})</span>
  </>
)

export const chartGenerator: Generator = {
  category: 'chart',
  items: () => CHART_SYMBOLS.map((s) => PREFIX + s.id),
  label: (key) => byKey(key).name,

  pairs: () =>
    CHART_SYMBOLS.map((s) => ({ key: PREFIX + s.id, group: s.id, left: <ChartSymbolSvg symbol={s} size={76} />, right: s.name })),
  make(key): Question {
    const s = byKey(key)
    const wrong = others(s)
    if (Math.random() < 0.6) {
      return {
        key,
        category: 'chart',
        prompt: 'What does this chart symbol mean?',
        media: (
          <div className="chart-stage">
            <ChartSymbolSvg symbol={s} size={170} />
          </div>
        ),
        options: shuffle([s, ...wrong]).map((o) => ({ id: o.id, label: o.name })),
        correctId: s.id,
        explanation: explain(s),
      }
    }
    return {
      key,
      category: 'chart',
      prompt: `Which symbol shows: ${s.name.toLowerCase()}?`,
      layout: 'pictures',
      options: shuffle([s, ...wrong]).map((o) => ({ id: o.id, label: o.name, node: <ChartSymbolSvg symbol={o} size={120} /> })),
      correctId: s.id,
      explanation: explain(s),
    }
  },

  card(key) {
    const s = byKey(key)
    return {
      title: 'Chart symbol',
      front: (
        <div className="chart-stage">
          <ChartSymbolSvg symbol={s} size={170} />
        </div>
      ),
      back: explain(s),
    }
  },
}
