import type { CSSProperties } from 'react'

interface Props {
  code: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Optional exact size of one dot in pixels (overrides size) */
  unit?: number
}

/** Draws a Morse code string (".-") as dots and dashes */
export default function MorseSymbols({ code, size = 'md', unit }: Props) {
  const label = code
    .split('')
    .map((c) => (c === '.' ? 'dot' : 'dash'))
    .join(' ')
  return (
    <span
      className={`morse morse-${size}`}
      style={unit ? ({ '--u': `${unit}px` } as CSSProperties) : undefined}
      role="img"
      aria-label={label}
    >
      {code.split('').map((c, i) => (
        <span key={i} className={c === '.' ? 'dot' : 'dash'} />
      ))}
    </span>
  )
}
