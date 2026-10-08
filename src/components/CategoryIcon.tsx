export type IconKind =
  | 'morse'
  | 'buoy'
  | 'lights'
  | 'colregs'
  | 'sound'
  | 'flag'
  | 'distress'
  | 'vhf'
  | 'exam'
  | 'globe'
  | 'chart'

const Y = '#ffc83d'
const R = '#ff4d4d'
const G = '#3ee06a'
const W = '#f4f6fa'
const B = '#4fa3e0'

/** Small line icons for the categories, drawn on a 32 x 32 grid */
export default function CategoryIcon({ kind, size = 28 }: { kind: IconKind; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {icon(kind)}
    </svg>
  )
}

function icon(kind: IconKind) {
  switch (kind) {
    case 'morse':
      return (
        <>
          <circle cx="8" cy="16" r="3.5" fill={Y} />
          <rect x="14" y="12.5" width="14" height="7" rx="3.5" fill={Y} />
        </>
      )
    case 'buoy':
      return (
        <>
          <path d="M11 9 L16 3 L21 9 Z M11 10 L21 10 L16 16 Z" fill={W} />
          <path d="M13.5 17 H18.5 L19.5 26 H12.5 Z" fill={Y} />
          <path d="M13 21.5 H19" stroke="#111" strokeWidth="3" />
          <path d="M4 27 q3 -2 6 0 t6 0 t6 0 t6 0" stroke={B} strokeWidth="2" />
        </>
      )
    case 'lights':
      return (
        <>
          <circle cx="16" cy="6" r="3" fill={W} />
          <circle cx="16" cy="14" r="3" fill={W} />
          <circle cx="7" cy="22" r="3" fill={G} />
          <circle cx="25" cy="22" r="3" fill={R} />
        </>
      )
    case 'colregs':
      return (
        <>
          <path d="M5 24 L19 10" stroke={W} strokeWidth="2.5" />
          <path d="M14 9 H20 V15" stroke={W} strokeWidth="2.5" />
          <path d="M27 24 L13 10" stroke={Y} strokeWidth="2.5" strokeDasharray="3 3" />
          <circle cx="16" cy="13" r="2.5" fill={R} />
        </>
      )
    case 'sound':
      return (
        <>
          <path d="M5 13 H10 L16 8 V24 L10 19 H5 Z" fill={W} />
          <path d="M20 12 q3 4 0 8 M23.5 9 q6 7 0 14" stroke={B} strokeWidth="2" />
        </>
      )
    case 'flag':
      return (
        <>
          <path d="M8 4 V28" stroke={W} strokeWidth="2" />
          <path d="M9 5 H26 V17 H9 Z" fill={Y} />
          <path d="M9 5 H17.5 V11 H9 Z M17.5 11 H26 V17 H17.5 Z" fill={B} />
        </>
      )
    case 'distress':
      return (
        <>
          <circle cx="16" cy="16" r="10" stroke={R} strokeWidth="5" />
          <circle cx="16" cy="16" r="10" stroke={W} strokeWidth="5" strokeDasharray="7.85 7.85" />
        </>
      )
    case 'vhf':
      return (
        <>
          <rect x="11" y="10" width="10" height="18" rx="2" fill={W} />
          <path d="M14 10 V4" stroke={W} strokeWidth="2" />
          <path d="M23 7 q3 3 0 6 M8 7 q-3 3 0 6" stroke={B} strokeWidth="2" />
          <rect x="13" y="13" width="6" height="4" rx="1" fill="#1b3150" />
        </>
      )
    case 'exam':
      return (
        <>
          <rect x="7" y="4" width="18" height="24" rx="2" fill={W} />
          <path d="M11 11 l2 2 l4 -4 M11 19 l2 2 l4 -4" stroke="#1f9d55" strokeWidth="2" />
          <path d="M19 12 H22 M19 20 H22" stroke="#7a8799" strokeWidth="2" />
        </>
      )
    case 'chart':
      return (
        <>
          <rect x="4" y="6" width="24" height="20" rx="2" stroke={W} strokeWidth="1.8" />
          <circle cx="12" cy="16" r="5" stroke={W} strokeWidth="1.4" strokeDasharray="1 2" />
          <path d="M9 16 H15 M12 13 V19" stroke={W} strokeWidth="1.6" />
          <path d="M21 20 C19 16 21 11 25 10 C25 14 23 18 21 20 Z" fill="#d23aa0" />
        </>
      )
    case 'globe':
      return (
        <>
          <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
          <path d="M4 16 H28 M16 4 q-8 12 0 24 M16 4 q8 12 0 24" stroke="currentColor" strokeWidth="1.6" />
        </>
      )
  }
}
