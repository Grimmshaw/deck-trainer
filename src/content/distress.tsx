import { FLAGS, FlagSvg } from '../flags/flags'
import type { ReactNode } from 'react'

// COLREG Annex IV – Distress signals. Each one is a knowledge item.

export interface DistressSignal {
  id: string
  text: string
  ref: string
  picture?: () => ReactNode
}

const flag = (letter: string) => FLAGS.find((f) => f.letter === letter)!

export const DISTRESS_SIGNALS: DistressSignal[] = [
  { id: 'gun', text: 'A gun or other explosive signal fired at intervals of about a minute', ref: 'Annex IV 1(a)' },
  { id: 'fog', text: 'A continuous sounding with any fog-signalling apparatus', ref: 'Annex IV 1(b)' },
  { id: 'redStars', text: 'Rockets or shells throwing red stars, fired one at a time at short intervals', ref: 'Annex IV 1(c)' },
  { id: 'sos', text: 'The group ··· – – – ··· (SOS) in Morse code, by radiotelegraphy or any other signalling method', ref: 'Annex IV 1(d)' },
  { id: 'mayday', text: 'The spoken word "MAYDAY" by radiotelephony', ref: 'Annex IV 1(e)' },
  {
    id: 'nc',
    text: 'The International Code signal of distress: flags N over C',
    ref: 'Annex IV 1(f)',
    picture: () => (
      <div className="flag-hoist">
        <FlagSvg flag={flag('N')} size={90} />
        <FlagSvg flag={flag('C')} size={90} />
      </div>
    ),
  },
  {
    id: 'flagBall',
    text: 'A square flag having above or below it a ball or anything resembling a ball',
    ref: 'Annex IV 1(g)',
    picture: () => (
      <svg viewBox="0 0 80 90" width={90} height={100} role="img" aria-label="A square flag with a ball above it">
        <line x1="6" y1="0" x2="6" y2="90" stroke="#ccd" strokeWidth="2" />
        <circle cx="30" cy="16" r="12" fill="#111" stroke="#99a" />
        <rect x="8" y="34" width="52" height="40" fill="#2b5fae" stroke="#99a" />
      </svg>
    ),
  },
  { id: 'flames', text: 'Flames on the vessel (as from a burning tar barrel, oil barrel, etc.)', ref: 'Annex IV 1(h)' },
  { id: 'redFlare', text: 'A rocket parachute flare or a hand flare showing a red light', ref: 'Annex IV 1(i)' },
  { id: 'orangeSmoke', text: 'A smoke signal giving off orange-coloured smoke', ref: 'Annex IV 1(j)' },
  { id: 'arms', text: 'Slowly and repeatedly raising and lowering arms outstretched to each side', ref: 'Annex IV 1(k)' },
  { id: 'dsc', text: 'A distress alert by digital selective calling (DSC), for example on VHF channel 70', ref: 'Annex IV 1(l)' },
  { id: 'satellite', text: 'A ship-to-shore distress alert sent by the ship’s Inmarsat or other satellite ship earth station', ref: 'Annex IV 1(m)' },
  { id: 'epirb', text: 'Signals transmitted by an emergency position-indicating radio beacon (EPIRB)', ref: 'Annex IV 1(n)' },
  { id: 'sart', text: 'Approved signals by radiocommunication systems, including survival craft radar transponders (SART)', ref: 'Annex IV 1(o)' },
]

/** Plausible signals that are NOT distress signals */
export const NOT_DISTRESS: string[] = [
  'A white parachute flare',
  'Rockets throwing green stars',
  'A smoke signal giving off yellow smoke',
  'Five short and rapid blasts on the whistle',
  'Flag O (man overboard) hoisted alone',
  'A gun fired every ten minutes',
  'An all-round flashing yellow light',
  'Two all-round red lights in a vertical line',
  'Waving a white flag from side to side',
  'One prolonged blast every two minutes',
  'The spoken word "PAN-PAN" by radiotelephony',
  'The spoken word "SECURITE" by radiotelephony',
  'Flag V (I require assistance)',
  'A blue light flashing at intervals',
]
