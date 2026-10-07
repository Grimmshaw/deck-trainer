// The International Code of Signals letter flags and their single-letter meanings.
// Drawn in SVG on a 60 x 40 grid; the hoist (mast side) is on the left.

import { useId, type ReactNode } from 'react'

const Y = '#f6c700'
const B = '#1d4fa3'
const R = '#d11f2f'
const W = '#ffffff'
const K = '#111111'

export interface Flag {
  letter: string
  word: string
  /** Single-letter meaning in the International Code of Signals (none for R) */
  meaning?: string
  draw: () => ReactNode
}

const rect = (x: number, y: number, w: number, h: number, fill: string, key?: string | number) => (
  <rect key={key} x={x} y={y} width={w} height={h} fill={fill} />
)
const swallow = 'M0 0 H60 L44 20 L60 40 H0 Z'

export const FLAGS: Flag[] = [
  {
    letter: 'A',
    word: 'Alfa',
    meaning: 'I have a diver down; keep well clear at slow speed',
    draw: () => (
      <>
        {rect(0, 0, 30, 40, W)}
        {rect(30, 0, 30, 40, B)}
      </>
    ),
  },
  {
    letter: 'B',
    word: 'Bravo',
    meaning: 'I am taking in, discharging or carrying dangerous goods',
    draw: () => <path d={swallow} fill={R} />,
  },
  {
    letter: 'C',
    word: 'Charlie',
    meaning: 'Affirmative ("yes")',
    draw: () => (
      <>
        {rect(0, 0, 60, 8, B)}
        {rect(0, 8, 60, 8, W)}
        {rect(0, 16, 60, 8, R)}
        {rect(0, 24, 60, 8, W)}
        {rect(0, 32, 60, 8, B)}
      </>
    ),
  },
  {
    letter: 'D',
    word: 'Delta',
    meaning: 'Keep clear of me; I am manoeuvring with difficulty',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, Y)}
        {rect(0, 10, 60, 20, B)}
      </>
    ),
  },
  {
    letter: 'E',
    word: 'Echo',
    meaning: 'I am altering my course to starboard',
    draw: () => (
      <>
        {rect(0, 0, 60, 20, B)}
        {rect(0, 20, 60, 20, R)}
      </>
    ),
  },
  {
    letter: 'F',
    word: 'Foxtrot',
    meaning: 'I am disabled; communicate with me',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, W)}
        <path d="M30 0 L60 20 L30 40 L0 20 Z" fill={R} />
      </>
    ),
  },
  {
    letter: 'G',
    word: 'Golf',
    meaning: 'I require a pilot',
    draw: () => <>{[0, 1, 2, 3, 4, 5].map((i) => rect(i * 10, 0, 10, 40, i % 2 === 0 ? Y : B, i))}</>,
  },
  {
    letter: 'H',
    word: 'Hotel',
    meaning: 'I have a pilot on board',
    draw: () => (
      <>
        {rect(0, 0, 30, 40, W)}
        {rect(30, 0, 30, 40, R)}
      </>
    ),
  },
  {
    letter: 'I',
    word: 'India',
    meaning: 'I am altering my course to port',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, Y)}
        <circle cx={30} cy={20} r={11} fill={K} />
      </>
    ),
  },
  {
    letter: 'J',
    word: 'Juliett',
    meaning: 'I am on fire and have dangerous cargo on board; keep well clear of me',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, B)}
        {rect(0, 13.33, 60, 13.34, W)}
      </>
    ),
  },
  {
    letter: 'K',
    word: 'Kilo',
    meaning: 'I wish to communicate with you',
    draw: () => (
      <>
        {rect(0, 0, 30, 40, Y)}
        {rect(30, 0, 30, 40, B)}
      </>
    ),
  },
  {
    letter: 'L',
    word: 'Lima',
    meaning: 'You should stop your vessel instantly',
    draw: () => (
      <>
        {rect(0, 0, 30, 20, Y)}
        {rect(30, 0, 30, 20, K)}
        {rect(0, 20, 30, 20, K)}
        {rect(30, 20, 30, 20, Y)}
      </>
    ),
  },
  {
    letter: 'M',
    word: 'Mike',
    meaning: 'My vessel is stopped and making no way through the water',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, B)}
        <path d="M0 0 L60 40 M60 0 L0 40" stroke={W} strokeWidth={8} />
      </>
    ),
  },
  {
    letter: 'N',
    word: 'November',
    meaning: 'Negative ("no")',
    draw: () => (
      <>
        {[0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3].map((c) => rect(c * 15, r * 10, 15, 10, (r + c) % 2 === 0 ? B : W, `${r}-${c}`)))}
      </>
    ),
  },
  {
    letter: 'O',
    word: 'Oscar',
    meaning: 'Man overboard',
    draw: () => (
      <>
        <path d="M0 0 H60 V40 Z" fill={R} />
        <path d="M0 0 V40 H60 Z" fill={Y} />
      </>
    ),
  },
  {
    letter: 'P',
    word: 'Papa',
    meaning: 'In harbour: all persons should report on board, as the vessel is about to proceed to sea',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, B)}
        {rect(20, 13.33, 20, 13.34, W)}
      </>
    ),
  },
  {
    letter: 'Q',
    word: 'Quebec',
    meaning: 'My vessel is "healthy" and I request free pratique',
    draw: () => rect(0, 0, 60, 40, Y),
  },
  {
    letter: 'R',
    word: 'Romeo',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, R)}
        {rect(0, 16, 60, 8, Y)}
        {rect(26, 0, 8, 40, Y)}
      </>
    ),
  },
  {
    letter: 'S',
    word: 'Sierra',
    meaning: 'I am operating astern propulsion',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, W)}
        {rect(20, 13.33, 20, 13.34, B)}
      </>
    ),
  },
  {
    letter: 'T',
    word: 'Tango',
    meaning: 'Keep clear of me; I am engaged in pair trawling',
    draw: () => (
      <>
        {rect(0, 0, 20, 40, R)}
        {rect(20, 0, 20, 40, W)}
        {rect(40, 0, 20, 40, B)}
      </>
    ),
  },
  {
    letter: 'U',
    word: 'Uniform',
    meaning: 'You are running into danger',
    draw: () => (
      <>
        {rect(0, 0, 30, 20, R)}
        {rect(30, 0, 30, 20, W)}
        {rect(0, 20, 30, 20, W)}
        {rect(30, 20, 30, 20, R)}
      </>
    ),
  },
  {
    letter: 'V',
    word: 'Victor',
    meaning: 'I require assistance',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, W)}
        <path d="M0 0 L60 40 M60 0 L0 40" stroke={R} strokeWidth={8} />
      </>
    ),
  },
  {
    letter: 'W',
    word: 'Whiskey',
    meaning: 'I require medical assistance',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, B)}
        {rect(8, 8, 44, 24, W)}
        {rect(18, 15, 24, 10, R)}
      </>
    ),
  },
  {
    letter: 'X',
    word: 'X-ray',
    meaning: 'Stop carrying out your intentions and watch for my signals',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, W)}
        {rect(0, 16, 60, 8, B)}
        {rect(26, 0, 8, 40, B)}
      </>
    ),
  },
  {
    letter: 'Y',
    word: 'Yankee',
    meaning: 'I am dragging my anchor',
    draw: () => (
      <>
        {rect(0, 0, 60, 40, Y)}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${-40 + i * 20 + 10} 40 L${i * 20 + 10} 0 L${i * 20 + 20} 0 L${-40 + i * 20 + 20} 40 Z`} fill={R} />
        ))}
      </>
    ),
  },
  {
    letter: 'Z',
    word: 'Zulu',
    meaning: 'I require a tug',
    draw: () => (
      <>
        <path d="M0 0 H60 L30 20 Z" fill={Y} />
        <path d="M0 0 L30 20 L0 40 Z" fill={K} />
        <path d="M0 40 L30 20 L60 40 Z" fill={R} />
        <path d="M60 0 L30 20 L60 40 Z" fill={B} />
      </>
    ),
  },
]

export function FlagSvg({ flag, size = 90 }: { flag: Flag; size?: number }) {
  const id = `flag-${useId().replace(/:/g, '')}`
  const swallowtail = flag.letter === 'A' || flag.letter === 'B'
  return (
    <svg viewBox="-1 -1 62 42" width={size} height={(size * 42) / 62} role="img" aria-label={`Flag ${flag.letter}`} className="flag-svg">
      <clipPath id={id}>{swallowtail ? <path d={swallow} /> : <rect width={60} height={40} />}</clipPath>
      <g clipPath={`url(#${id})`}>{flag.draw()}</g>
      {/* Thin outline so white flags show on any background */}
      {swallowtail ? (
        <path d={swallow} fill="none" stroke="#99a" strokeWidth={0.6} />
      ) : (
        <rect x={0} y={0} width={60} height={40} fill="none" stroke="#99a" strokeWidth={0.6} />
      )}
    </svg>
  )
}
