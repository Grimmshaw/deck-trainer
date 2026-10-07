import { parseLight, type Light, type LightColor } from './light'

// Light characters for the "which light is this?" drill. Each family has
// members that differ in count or period, so the wrong answers are close.

export interface CharSpec {
  /** Character without colour, e.g. "Fl(3) 10s" */
  spec: string
  family: string
}

export const CHARS: CharSpec[] = [
  { spec: 'Fl 5s', family: 'fl' },
  { spec: 'Fl 3s', family: 'fl' },
  { spec: 'Fl(2) 6s', family: 'fl' },
  { spec: 'Fl(2) 10s', family: 'fl' },
  { spec: 'Fl(3) 10s', family: 'fl' },
  { spec: 'Fl(4) 12s', family: 'fl' },
  { spec: 'Fl(2+1) 10s', family: 'fl' },
  { spec: 'LFl 10s', family: 'long' },
  { spec: 'Iso 4s', family: 'long' },
  { spec: 'Iso 6s', family: 'long' },
  { spec: 'Oc 4s', family: 'long' },
  { spec: 'Q', family: 'q' },
  { spec: 'VQ', family: 'q' },
  { spec: 'Q(3) 10s', family: 'q' },
  { spec: 'VQ(3) 5s', family: 'q' },
  { spec: 'Q(6)+LFl 15s', family: 'q' },
  { spec: 'VQ(6)+LFl 10s', family: 'q' },
  { spec: 'Q(9) 15s', family: 'q' },
  { spec: 'VQ(9) 10s', family: 'q' },
  { spec: 'Mo(A) 6s', family: 'long' },
]

/** Colours that can be used with each character (cardinal-type characters stay white) */
export function coloursFor(c: CharSpec): LightColor[] {
  if (c.family === 'q' || c.spec.startsWith('Iso') || c.spec.startsWith('LFl') || c.spec.startsWith('Mo')) return ['W']
  return ['W', 'R', 'G']
}

/** "Fl(3) 10s" + R -> "Fl(3) R 10s" (colour after the rhythm, as on charts) */
export function withColour(spec: string, colour: LightColor): string {
  if (colour === 'W') return spec
  const parts = spec.split(' ')
  return parts.length === 1 ? `${spec} ${colour}` : `${parts[0]} ${colour} ${parts.slice(1).join(' ')}`
}

export function charLight(spec: string, colour: LightColor): Light {
  return parseLight(withColour(spec, colour))
}
