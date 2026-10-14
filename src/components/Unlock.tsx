import { useEffect, useState, type FormEvent } from 'react'
import { LanternMark } from '../brand/Logo'
import { buy, lastBuyError, localPrice, PLAY_URL, playService, redeemCode, useUnlocked, type BuyResult, type CodeResult } from '../store/entitlement'

// Shown when a locked category is opened. In the Google Play app it sells
// "Unlock all"; on the web it points to the app, and testers can enter an
// access code. The code field is never shown in the Google Play app.

const INCLUDED = [
  'Buoyage (IALA) – marks, lights and light characters',
  'Lights & Shapes – by day and by night',
  'COLREGs – what do you do, also in fog',
  'Sound signals, flags and distress signals',
  'Chart symbols (INT 1)',
  'Final exam with everything mixed',
]

export default function Unlock({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const unlocked = useUnlocked()
  const [inApp, setInApp] = useState<boolean | null>(null)
  const [price, setPrice] = useState('')
  const [state, setState] = useState<BuyResult | 'busy' | null>(null)
  const [showCode, setShowCode] = useState(false)
  const [code, setCode] = useState('')
  const [codeState, setCodeState] = useState<CodeResult | 'busy' | null>(null)

  useEffect(() => {
    playService().then((s) => setInApp(!!s))
    localPrice().then(setPrice)
  }, [])

  useEffect(() => {
    if (unlocked) onDone()
  }, [unlocked])

  const purchase = async () => {
    setState('busy')
    setState(await buy())
  }

  const submitCode = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setCodeState('busy')
    setCodeState(await redeemCode(code))
  }

  return (
    <div className="screen unlock">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">Lanterna</div>
        <span className="topbar-spacer" />
      </header>

      <div className="unlock-hero">
        <LanternMark size={96} />
        <h1>Unlock everything</h1>
        <p className="muted">One payment – no subscription. Morse code stays free.</p>
      </div>

      <ul className="unlock-list">
        {INCLUDED.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      {inApp === false ? (
        <div className="actions-col">
          <a className="primary big as-button" href={PLAY_URL} target="_blank" rel="noopener">
            Get Lanterna on Google Play
          </a>
          <p className="muted small center">The full version is unlocked in the app on Google Play.</p>

          {!showCode ? (
            <button type="button" className="link-btn small" onClick={() => setShowCode(true)}>
              I have an access code
            </button>
          ) : (
            <form className="code-form" onSubmit={submitCode}>
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setCodeState(null)
                }}
                placeholder="Access code"
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Access code"
                autoFocus
              />
              <button type="submit" className="secondary" disabled={!code.trim() || codeState === 'busy'}>
                {codeState === 'busy' ? 'Checking…' : 'Unlock'}
              </button>
              {codeState === 'wrong' && <p className="small center feedback-detail">That code is not valid.</p>}
              {codeState === 'offline' && <p className="small center">No connection – try again when you are online.</p>}
            </form>
          )}
        </div>
      ) : (
        <div className="actions-col">
          <button className="primary big" onClick={purchase} disabled={inApp === null || state === 'busy'}>
            {state === 'busy' ? 'Opening Google Play…' : `Unlock all – ${price}`}
          </button>
          {state === 'cancelled' && <p className="muted small center">No purchase was made.</p>}
          {state === 'failed' && (
            <p className="small center feedback-detail">
              Something went wrong. You have not been charged twice – try again, or reopen the app to restore the purchase.
            </p>
          )}
          {state === 'unavailable' && <p className="small center">Google Play Billing is not available on this device.</p>}
          {state === 'notfound' && (
            <p className="small center feedback-detail">The purchase is not available right now. Please try again later.</p>
          )}
          {(state === 'failed' || state === 'notfound') && lastBuyError && (
            <p className="muted small center">({lastBuyError})</p>
          )}
        </div>
      )}
    </div>
  )
}
