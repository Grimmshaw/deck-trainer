import { useEffect, useRef, useState } from 'react'

// After an answer is shown, a tap anywhere on the screen (or Enter / Space on a
// computer) goes on to the next question. There is no Next button.

/** Taps right after answering are ignored, so a double tap on an answer can't skip the explanation */
const DELAY_MS = 450
/** Taps on these still do their own thing and don't go on */
const IGNORE = 'button, a, input, textarea, select, label, [role="dialog"], .sheet-backdrop'

/** Listens for the tap while `active`. Returns true once taps count (for showing the hint). */
export function useTapToContinue(active: boolean, onNext: () => void): boolean {
  const next = useRef(onNext)
  next.current = onNext
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    if (!active) return
    // The answer button that was just pressed would otherwise swallow Enter
    if (document.activeElement instanceof HTMLButtonElement) document.activeElement.blur()
    let on = false
    const timer = window.setTimeout(() => {
      on = true
      setReady(true)
    }, DELAY_MS)
    const onClick = (e: MouseEvent) => {
      if (!on || e.defaultPrevented) return
      if ((e.target as Element | null)?.closest?.(IGNORE)) return
      on = false
      next.current()
    }
    const onKey = (e: KeyboardEvent) => {
      if (!on || (e.key !== 'Enter' && e.key !== ' ')) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if ((e.target as Element | null)?.closest?.('input, textarea, select, button, a')) return
      e.preventDefault()
      on = false
      next.current()
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [active])

  return active && ready
}

/** The "Tap anywhere to continue" line, fixed at the bottom of the screen */
export function TapHint({ ready, last }: { ready: boolean; last?: boolean }) {
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  const how = touch ? 'Tap anywhere' : 'Click anywhere or press Enter'
  return (
    <>
      <div className="tap-spacer" aria-hidden="true" />
      <p className={`tap-hint ${ready ? 'ready' : ''}`} aria-live="polite">
        {how} {last ? 'to see results' : 'to continue'}
      </p>
    </>
  )
}
