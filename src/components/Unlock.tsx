import { useEffect, useState } from 'react'
import { LanternMark } from '../brand/Logo'
import { buy, localPrice, PLAY_URL, playService, useUnlocked, type BuyResult } from '../store/entitlement'

// Shown when a locked category is opened. In the Google Play app it sells
// "Unlock all"; on the web it points to the app.

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
        </div>
      )}
    </div>
  )
}
