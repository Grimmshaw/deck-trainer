import PatternBars from '../../sound/PatternBars'
import { SOUND_SIGNALS, type SoundSignal } from '../../sound/signals'
import SoundButton from '../../sound/SoundButton'
import { isSilent } from '../../sound/soundMode'
import type { Generator, Question } from '../types'
import { sample, shuffle } from '../util'

// Sound signals (Rules 32–35): hear a signal and pick its meaning, or the other way round.

const PREFIX = 'sound:'
const byKey = (key: string) => SOUND_SIGNALS.find((s) => PREFIX + s.id === key)!
const samePattern = (a: SoundSignal, b: SoundSignal) => a.pattern.join('') === b.pattern.join('')
const contextText = (s: SoundSignal) =>
  s.context === 'sight' ? 'Vessels in sight of one another.' : 'In restricted visibility.'

/** Wrong answers: same situation (in sight / in fog) first, never the same pattern */
function others(s: SoundSignal): SoundSignal[] {
  const pool = SOUND_SIGNALS.filter((o) => o.id !== s.id && !samePattern(o, s))
  const same = pool.filter((o) => o.context === s.context)
  const rest = pool.filter((o) => o.context !== s.context)
  return [...sample(same, 3), ...sample(rest, 3)].slice(0, 3)
}

function explain(s: SoundSignal) {
  return (
    <>
      <PatternBars pattern={s.pattern} size="sm" /> {s.meaning}. {s.note} <strong>{s.rule}</strong>
    </>
  )
}

export const soundGenerator: Generator = {
  category: 'sound',
  items: () => SOUND_SIGNALS.map((s) => PREFIX + s.id),
  label: (key) => byKey(key).meaning,

  pairs: () =>
    SOUND_SIGNALS.map((s) => ({
      key: PREFIX + s.id,
      group: s.pattern.join(''),
      left: <PatternBars pattern={s.pattern} size="sm" />,
      right: `${s.context === 'sight' ? 'In sight' : 'Fog'}: ${s.meaning}`,
    })),
  make(key): Question {
    const s = byKey(key)
    const wrong = others(s)
    if (Math.random() < 0.65) {
      const silent = isSilent()
      return {
        key,
        category: 'sound',
        prompt: silent
          ? `${contextText(s)} You hear the signal shown below. What does it mean?`
          : `${contextText(s)} You hear this signal. What does it mean?`,
        media: silent ? (
          <div className="sound-visual">
            <PatternBars pattern={s.pattern} />
            <span className="muted small">Short bar ≈ 1 s · long bar = prolonged blast, 4–6 s</span>
          </div>
        ) : (
          <SoundButton signal={s} autoPlay />
        ),
        reveal: silent ? undefined : (
          <div className="sound-visual">
            <PatternBars pattern={s.pattern} />
          </div>
        ),
        options: shuffle([s, ...wrong]).map((o) => ({ id: o.id, label: o.meaning })),
        correctId: s.id,
        explanation: explain(s),
      }
    }
    return {
      key,
      category: 'sound',
      prompt: `${contextText(s)} Which signal means: "${s.meaning}"?`,
      options: shuffle([s, ...wrong]).map((o) => ({ id: o.id, label: o.pattern.join(' '), node: <PatternBars pattern={o.pattern} /> })),
      correctId: s.id,
      explanation: explain(s),
    }
  },

  card(key) {
    const s = byKey(key)
    return {
      title: s.rule,
      front: (
        <div className="sound-card">
          <p className="muted small">{contextText(s)}</p>
          <SoundButton signal={s} />
          <PatternBars pattern={s.pattern} />
        </div>
      ),
      back: (
        <>
          <strong>{s.meaning}</strong>
          {s.note && <p>{s.note}</p>}
          <p className="rule">{s.rule}</p>
        </>
      ),
    }
  },
}
