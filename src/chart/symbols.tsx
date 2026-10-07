import type { ReactNode } from 'react'

// Chart symbols from INT 1 (Symbols, Abbreviations and Terms used on Paper Charts).
// Each symbol is drawn in a 100 × 100 box on a piece of "chart paper".
// The INT 1 number is given so every drawing can be checked against the book.

export type ChartGroup = 'danger' | 'area' | 'aid' | 'water' | 'depth'

export interface ChartSymbol {
  id: string
  name: string
  meaning: string
  int1: string
  group: ChartGroup
  /** Background: open water, shallow water or drying foreshore */
  ground?: 'water' | 'shallow' | 'drying'
  draw: () => ReactNode
}

const INK = '#1b1b1b'
const MAG = '#b5157f'
const PAPER = '#fbfaf3'
const SHALLOW = '#c9e4f4'
const DRYING = '#c8dcb4'

/** Dotted danger line around a danger */
const dangerLine = (r = 26) => <circle cx="50" cy="50" r={r} fill={SHALLOW} stroke={INK} strokeWidth="1.6" strokeDasharray="1.5 3.2" strokeLinecap="round" />

/** The wreck symbol: a line with three cross strokes */
const wreckMark = () => (
  <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
    <line x1="32" y1="50" x2="68" y2="50" />
    <line x1="41" y1="43" x2="41" y2="57" />
    <line x1="50" y1="40" x2="50" y2="60" />
    <line x1="59" y1="43" x2="59" y2="57" />
  </g>
)

const anchor = (x = 50, y = 50, s = 1) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={MAG} strokeWidth="3" fill="none" strokeLinecap="round">
    <circle cx="0" cy="-20" r="4" />
    <line x1="0" y1="-16" x2="0" y2="20" />
    <line x1="-9" y1="-9" x2="9" y2="-9" />
    <path d="M-17 6 Q-14 20 0 20 Q14 20 17 6" />
  </g>
)

const fish = () => (
  <g fill="none" stroke={MAG} strokeWidth="3" strokeLinejoin="round">
    <path d="M22 50 Q40 32 62 50 Q40 68 22 50 Z" />
    <path d="M62 50 L78 38 L78 62 Z" />
    <circle cx="32" cy="48" r="1.6" fill={MAG} />
  </g>
)

const slash = <line x1="24" y1="78" x2="76" y2="22" stroke={MAG} strokeWidth="3.4" strokeLinecap="round" />

const arrow = (feathered: boolean) => (
  <g stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round">
    <line x1="18" y1="62" x2="78" y2="38" />
    <path d="M66 36 L80 37 L71 48" fill="none" />
    {feathered &&
      [0, 1, 2, 3].map((i) => {
        const x = 24 + i * 10
        const y = 60 - i * 4
        return <line key={i} x1={x} y1={y} x2={x - 3} y2={y - 9} />
      })}
    <text x="40" y="76" fontSize="12" fill={INK} stroke="none" fontStyle="italic">
      2·5kn
    </text>
  </g>
)

export const CHART_SYMBOLS: ChartSymbol[] = [
  {
    id: 'wreckDanger',
    name: 'Dangerous wreck, depth unknown',
    meaning: 'A wreck of unknown depth that is considered dangerous to surface navigation. The dotted line is the danger line.',
    int1: 'K29',
    group: 'danger',
    draw: () => (
      <>
        {dangerLine()}
        {wreckMark()}
      </>
    ),
  },
  {
    id: 'wreck',
    name: 'Wreck, not dangerous to surface navigation',
    meaning: 'A wreck of unknown depth that is not considered dangerous to surface navigation – no danger line around it.',
    int1: 'K30',
    group: 'danger',
    draw: wreckMark,
  },
  {
    id: 'wreckHull',
    name: 'Wreck showing part of its hull',
    meaning: 'A stranded wreck: some part of the hull or superstructure is above chart datum.',
    int1: 'K24',
    group: 'danger',
    ground: 'drying',
    draw: () => (
      <g fill={INK}>
        <path d="M26 56 L74 56 L68 66 L32 66 Z" />
        <rect x="44" y="46" width="12" height="10" />
        <rect x="58" y="40" width="2.4" height="16" />
      </g>
    ),
  },
  {
    id: 'rockAwash',
    name: 'Rock awash at chart datum',
    meaning: 'A rock whose top is at about the level of chart datum.',
    int1: 'K13',
    group: 'danger',
    draw: () => (
      <g fill={INK} stroke={INK} strokeLinecap="round">
        <line x1="36" y1="50" x2="64" y2="50" strokeWidth="2.6" />
        <line x1="50" y1="36" x2="50" y2="64" strokeWidth="2.6" />
        {[
          [43, 43],
          [57, 43],
          [43, 57],
          [57, 57],
        ].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="2" stroke="none" />
        ))}
      </g>
    ),
  },
  {
    id: 'rockDrying',
    name: 'Drying rock',
    meaning: 'A rock that covers and uncovers. The figure in brackets is its drying height above chart datum, here 1.2 m.',
    int1: 'K11',
    group: 'danger',
    draw: () => (
      <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
        <line x1="40" y1="50" x2="60" y2="50" />
        <line x1="45" y1="41" x2="55" y2="59" />
        <line x1="55" y1="41" x2="45" y2="59" />
        <text x="62" y="70" fontSize="13" fill={INK} stroke="none">
          (1₂)
        </text>
      </g>
    ),
  },
  {
    id: 'rockUnder',
    name: 'Dangerous underwater rock, depth unknown',
    meaning: 'An underwater rock of unknown depth, dangerous to surface navigation.',
    int1: 'K14',
    group: 'danger',
    draw: () => (
      <>
        {dangerLine()}
        <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
          <line x1="40" y1="50" x2="60" y2="50" />
          <line x1="50" y1="40" x2="50" y2="60" />
        </g>
      </>
    ),
  },
  {
    id: 'obstruction',
    name: 'Obstruction, depth unknown',
    meaning: 'An obstruction of unknown depth (for example something on the seabed), dangerous to surface navigation.',
    int1: 'K40',
    group: 'danger',
    draw: () => (
      <>
        {dangerLine(28)}
        <text x="50" y="55" fontSize="14" fill={INK} textAnchor="middle" fontStyle="italic">
          Obstn
        </text>
      </>
    ),
  },
  {
    id: 'foul',
    name: 'Foul ground',
    meaning: 'Foul ground: not dangerous to surface navigation, but to be avoided when anchoring or trawling.',
    int1: 'K31',
    group: 'danger',
    draw: () => (
      <g stroke={INK} strokeWidth="2.4" strokeLinecap="round">
        <line x1="44" y1="36" x2="40" y2="64" />
        <line x1="60" y1="36" x2="56" y2="64" />
        <line x1="34" y1="45" x2="66" y2="45" />
        <line x1="33" y1="55" x2="65" y2="55" />
      </g>
    ),
  },
  {
    id: 'anchorage',
    name: 'Anchorage',
    meaning: 'An anchorage.',
    int1: 'N10',
    group: 'area',
    draw: () => anchor(),
  },
  {
    id: 'noAnchoring',
    name: 'Anchoring prohibited',
    meaning: 'Anchoring is prohibited, for example over cables or pipelines.',
    int1: 'N20',
    group: 'area',
    draw: () => (
      <>
        {anchor()}
        {slash}
      </>
    ),
  },
  {
    id: 'noFishing',
    name: 'Fishing prohibited',
    meaning: 'Fishing is prohibited in the area.',
    int1: 'N21',
    group: 'area',
    draw: () => (
      <>
        {fish()}
        {slash}
      </>
    ),
  },
  {
    id: 'restricted',
    name: 'Limit of restricted area',
    meaning: 'The boundary of a restricted area: a magenta line with T-shaped marks.',
    int1: 'N2.1',
    group: 'area',
    draw: () => (
      <g stroke={MAG} strokeWidth="2.4" strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => {
          const x = 14 + i * 20
          return (
            <g key={i}>
              <line x1={x} y1="50" x2={x + 14} y2="50" />
              <line x1={x + 7} y1="50" x2={x + 7} y2="58" />
            </g>
          )
        })}
      </g>
    ),
  },
  {
    id: 'cable',
    name: 'Submarine cable',
    meaning: 'A submarine cable on the seabed – a wavy magenta line. Avoid anchoring and trawling near it.',
    int1: 'L30.1',
    group: 'area',
    draw: () => (
      <path
        d="M10 50 q5 -7 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0"
        fill="none"
        stroke={MAG}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    ),
  },
  {
    id: 'light',
    name: 'Light',
    meaning: 'A light: the magenta flare points out from the black position dot. The light characteristics are written beside it.',
    int1: 'P1',
    group: 'aid',
    draw: () => (
      <g>
        <path d="M44 62 C40 46 52 26 66 22 C64 36 56 54 44 62 Z" fill={MAG} />
        <circle cx="44" cy="62" r="3.4" fill={INK} />
      </g>
    ),
  },
  {
    id: 'fog',
    name: 'Fog signal',
    meaning: 'A fog signal at the position – three magenta arcs. The type, for example Horn or Siren, is written beside it.',
    int1: 'R1',
    group: 'aid',
    draw: () => (
      <g fill="none" stroke={MAG} strokeWidth="2.6" strokeLinecap="round">
        <circle cx="30" cy="62" r="3" fill={INK} stroke="none" />
        <path d="M38 52 A12 12 0 0 1 40 66" />
        <path d="M46 46 A20 20 0 0 1 49 70" />
        <path d="M54 40 A28 28 0 0 1 58 74" />
      </g>
    ),
  },
  {
    id: 'racon',
    name: 'Racon',
    meaning: 'A radar transponder beacon (racon) – a magenta circle round the position. Its Morse identity is written beside it, for example Racon (T).',
    int1: 'S3.1',
    group: 'aid',
    draw: () => (
      <g>
        <circle cx="50" cy="50" r="20" fill="none" stroke={MAG} strokeWidth="2.6" />
        <circle cx="50" cy="50" r="2.6" fill={INK} />
        <text x="74" y="78" fontSize="11" fill={MAG} textAnchor="middle" fontStyle="italic">
          Racon
        </text>
      </g>
    ),
  },
  {
    id: 'floodStream',
    name: 'Flood tidal stream',
    meaning: 'Flood tidal stream with its mean spring rate – the arrow has feathers along the shaft.',
    int1: 'H40',
    group: 'water',
    draw: () => arrow(true),
  },
  {
    id: 'ebbStream',
    name: 'Ebb tidal stream',
    meaning: 'Ebb tidal stream with its mean spring rate – a plain arrow without feathers.',
    int1: 'H41',
    group: 'water',
    draw: () => arrow(false),
  },
  {
    id: 'overfalls',
    name: 'Overfalls, tide rips or races',
    meaning: 'Overfalls, tide rips and races: broken, turbulent water.',
    int1: 'H44',
    group: 'water',
    draw: () => (
      <g fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round">
        {[
          [24, 36],
          [52, 36],
          [38, 50],
          [66, 50],
          [24, 64],
          [52, 64],
        ].map(([x, y]) => (
          <path key={`${x}${y}`} d={`M${x} ${y} q3 -5 6 0 t6 0 t6 0`} />
        ))}
      </g>
    ),
  },
  {
    id: 'eddies',
    name: 'Eddies',
    meaning: 'Eddies: water turning in circles.',
    int1: 'H45',
    group: 'water',
    draw: () => (
      <g fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round">
        {[
          [34, 40],
          [64, 46],
          [42, 66],
        ].map(([x, y]) => (
          <path key={`${x}${y}`} d={`M${x} ${y} a2 2 0 1 1 3 2 a5 5 0 1 1 -8 -5 a8 8 0 1 1 12 10`} />
        ))}
      </g>
    ),
  },
  {
    id: 'sounding',
    name: 'Sounding (depth)',
    meaning: 'A depth below chart datum, here 12.4 m. The small figure is tenths of a metre.',
    int1: 'I10',
    group: 'depth',
    draw: () => (
      <text x="50" y="58" fontSize="26" fill={INK} textAnchor="middle" fontStyle="italic">
        12₄
      </text>
    ),
  },
  {
    id: 'drying',
    name: 'Drying height',
    meaning: 'A drying height above chart datum, here 2.3 m – shown by underlining the figure.',
    int1: 'I15',
    group: 'depth',
    ground: 'drying',
    draw: () => (
      <g>
        <text x="50" y="58" fontSize="26" fill={INK} textAnchor="middle" fontStyle="italic">
          2₃
        </text>
        <line x1="40" y1="62" x2="54" y2="62" stroke={INK} strokeWidth="2" />
      </g>
    ),
  },
]

export function ChartSymbolSvg({ symbol, size = 140 }: { symbol: ChartSymbol; size?: number }) {
  const bg = symbol.ground === 'drying' ? DRYING : symbol.ground === 'shallow' ? SHALLOW : PAPER
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Chart symbol" className="chart-symbol">
      <rect width="100" height="100" fill={bg} />
      {/* A faint depth contour, so it looks like a piece of chart */}
      <path d="M0 88 Q30 80 55 90 T100 84" fill="none" stroke="#7fb3d6" strokeWidth="0.8" />
      {symbol.draw()}
    </svg>
  )
}
