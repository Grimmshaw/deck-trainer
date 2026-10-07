import { useEffect, useRef, useState, type FormEvent } from 'react'
import { toMorse } from '../morse'
import MorseSymbols from './MorseSymbols'

interface Props {
  word: string
  onResult: (ok: boolean) => void
  onNext: () => void
}

/**
 * Size of one dot in pixels, chosen so the whole word fits on one line
 * on a normal phone (about 340px of room). Long words get smaller symbols.
 */
function dotSize(codes: string[]): number {
  const ROOM = 340
  const CELL_EXTRA = 38 // padding, border and gap around each letter
  const units = codes.reduce((sum, c) => {
    const dashes = c.split('').filter((s) => s === '-').length
    const dots = c.length - dashes
    return sum + dots + dashes * 3 + (c.length - 1) * 0.6
  }, 0)
  const u = Math.floor((ROOM - CELL_EXTRA * codes.length) / units)
  return Math.max(7, Math.min(16, u))
}

export default function DecodeRound({ word, onResult, onNext }: Props) {
  const codes = toMorse(word)
  const unit = dotSize(codes)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<boolean | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (result === null) inputRef.current?.focus()
    else nextRef.current?.focus()
  }, [result])

  const finish = (ok: boolean) => {
    setResult(ok)
    onResult(ok)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (result !== null) return onNext()
    const cleaned = answer.replace(/\s+/g, '').toUpperCase()
    if (!cleaned) return
    finish(cleaned === word)
  }

  const typed = answer.replace(/\s+/g, '').toUpperCase()

  return (
    <form className="round" onSubmit={submit}>
      <p className="prompt">What does this say?</p>

      <div className="letters">
        {codes.map((code, i) => {
          const state =
            result === null ? '' : typed[i] === word[i] ? 'right' : 'wrong'
          return (
            <div key={i} className={`letter-cell ${state}`}>
              <MorseSymbols code={code} unit={unit} />
              {result !== null && <span className="letter-answer">{word[i]}</span>}
            </div>
          )
        })}
      </div>

      <input
        ref={inputRef}
        className={`answer ${result === true ? 'right' : result === false ? 'wrong' : ''}`}
        value={answer}
        onChange={(e) => setAnswer(e.target.value.toUpperCase())}
        placeholder="Type the word"
        maxLength={word.length + 4}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        readOnly={result !== null}
        aria-label="Your answer"
      />

      {result === null ? (
        <div className="actions">
          <button type="button" className="secondary" onClick={() => finish(false)}>
            Show answer
          </button>
          <button type="submit" className="primary" disabled={!answer.trim()}>
            Check
          </button>
        </div>
      ) : (
        <>
          <Feedback ok={result} word={word} />
          <button ref={nextRef} type="submit" className="primary big">
            Next →
          </button>
        </>
      )}
    </form>
  )
}

export function Feedback({ ok, word }: { ok: boolean; word: string }) {
  return (
    <p className={`feedback ${ok ? 'right' : 'wrong'}`} role="status">
      {ok ? 'Correct!' : (
        <>
          Not quite – the answer is <strong>{word}</strong>
        </>
      )}
    </p>
  )
}
