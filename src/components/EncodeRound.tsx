import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { toMorse } from '../morse'
import { Feedback } from './DecodeRound'
import MorseSymbols from './MorseSymbols'

interface Props {
  word: string
  onResult: (ok: boolean) => void
  onNext: () => void
}

/**
 * The user's input is stored as a string like ".- -..":
 * "." = dot, "-" = dash, " " = gap between letters.
 */
// Keeps buttons from taking keyboard focus, so Space/Enter don't click them twice
const noFocus = (e: MouseEvent) => e.preventDefault()

export default function EncodeRound({ word, onResult, onNext }: Props) {
  const codes = toMorse(word)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<boolean | null>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const groups = input.split(' ')
  const entered = input.trim().split(/\s+/).filter(Boolean)
  const currentIndex = Math.min(groups.length - 1, word.length - 1)

  const done = result !== null

  const add = useCallback(
    (sym: '.' | '-') => {
      if (done) return
      setInput((i) => {
        const last = i.split(' ').at(-1) ?? ''
        return last.length >= 6 ? i : i + sym
      })
    },
    [done],
  )

  const gap = useCallback(() => {
    if (done) return
    setInput((i) => (i === '' || i.endsWith(' ') ? i : i + ' '))
  }, [done])

  const back = useCallback(() => {
    if (done) return
    setInput((i) => i.slice(0, -1))
  }, [done])

  const check = useCallback(() => {
    if (done || entered.length === 0) return
    const ok = entered.length === codes.length && entered.every((c, i) => c === codes[i])
    setResult(ok)
    onResult(ok)
  }, [done, entered, codes, onResult])

  // Keyboard support on a computer: . - space Backspace Enter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (done) {
        if (e.key === 'Enter') {
          e.preventDefault()
          onNext()
        }
        return
      }
      if (e.key === '.' || e.key === ',') add('.')
      else if (e.key === '-' || e.key === '_') add('-')
      else if (e.key === ' ') gap()
      else if (e.key === 'Backspace') back()
      else if (e.key === 'Enter') check()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [add, gap, back, check, done, onNext])

  useEffect(() => {
    if (done) nextRef.current?.focus()
  }, [done])

  return (
    <div className="round">
      <p className="prompt">Send this word in Morse</p>

      <div className="target-word" aria-label={word}>
        {word.split('').map((c, i) => (
          <span key={i} className={!done && i === currentIndex ? 'current' : i < currentIndex ? 'past' : ''}>
            {c}
          </span>
        ))}
      </div>

      {!done ? (
        <>
          <div className="entry" aria-live="polite">
            {input === '' ? (
              <span className="muted">Tap · and – below</span>
            ) : (
              groups.map((g, i) => (
                <span key={i} className={`entry-group ${i === groups.length - 1 ? 'active' : ''}`}>
                  {g ? <MorseSymbols code={g} size="md" /> : <span className="caret" />}
                </span>
              ))
            )}
          </div>

          <div className="keypad">
            <button onMouseDown={noFocus} className="key key-dot" onClick={() => add('.')} aria-label="Dot">
              <span className="dot" />
            </button>
            <button onMouseDown={noFocus} className="key key-dash" onClick={() => add('-')} aria-label="Dash">
              <span className="dash" />
            </button>
            <button onMouseDown={noFocus} className="key key-small" onClick={back} aria-label="Delete">
              ⌫
            </button>
            <button onMouseDown={noFocus} className="key key-small" onClick={gap}>
              Next letter
            </button>
          </div>

          <button onMouseDown={noFocus} className="primary big" onClick={check} disabled={entered.length === 0}>
            Check
          </button>
          <p className="muted small center keyboard-hint">
            Keyboard: <kbd>.</kbd> dot <kbd>-</kbd> dash <kbd>Space</kbd> next letter{' '}
            <kbd>Enter</kbd> check
          </p>
        </>
      ) : (
        <>
          <table className="compare">
            <thead>
              <tr>
                <th></th>
                <th>You</th>
                <th>Correct</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code, i) => {
                const yours = entered[i] ?? ''
                const ok = yours === code
                return (
                  <tr key={i} className={ok ? 'right' : 'wrong'}>
                    <td className="compare-char">{word[i]}</td>
                    <td>{yours ? <MorseSymbols code={yours} size="sm" /> : <span className="muted small">missing</span>}</td>
                    <td>
                      <MorseSymbols code={code} size="sm" />
                    </td>
                  </tr>
                )
              })}
              {entered.length > codes.length && (
                <tr className="wrong">
                  <td className="compare-char">+</td>
                  <td colSpan={2} className="muted small">
                    {entered.length - codes.length} extra letter(s)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Feedback ok={result === true} word={word} />
          <button ref={nextRef} className="primary big" onClick={onNext}>
            Next →
          </button>
        </>
      )}
    </div>
  )
}
