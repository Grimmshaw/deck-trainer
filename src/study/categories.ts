import type { IconKind } from '../components/CategoryIcon'

export type CategoryId = 'morse' | 'buoyage' | 'lights' | 'colregs' | 'sound' | 'flags' | 'distress' | 'chart' | 'vhf' | 'exam'

export interface Category {
  id: CategoryId
  title: string
  text: string
  tag: 'Free' | 'Preview' | 'Soon'
  icon: IconKind
}

export const CATEGORIES: Category[] = [
  { id: 'morse', title: 'Morse code', text: 'Read and send Morse, like signals by light', tag: 'Free', icon: 'morse' },
  { id: 'buoyage', title: 'Buoyage (IALA)', text: 'Lateral, cardinal and other marks, by day and night', tag: 'Preview', icon: 'buoy' },
  { id: 'lights', title: 'Lights & Shapes', text: 'Identify vessels by their lights and day shapes', tag: 'Preview', icon: 'lights' },
  { id: 'colregs', title: 'COLREGs', text: 'What do you do? Avoiding collision in practice', tag: 'Preview', icon: 'colregs' },
  { id: 'sound', title: 'Sound signals', text: 'Manoeuvring, warning and fog signals', tag: 'Preview', icon: 'sound' },
  { id: 'flags', title: 'Flags & signals', text: 'Single-letter signals of the International Code', tag: 'Preview', icon: 'flag' },
  { id: 'distress', title: 'Distress signals', text: 'COLREG Annex IV', tag: 'Preview', icon: 'distress' },
  { id: 'chart', title: 'Chart symbols', text: 'Wrecks, rocks, lights and abbreviations (INT 1)', tag: 'Preview', icon: 'chart' },
  { id: 'vhf', title: 'VHF & SMCP', text: 'Standard Marine Communication Phrases', tag: 'Soon', icon: 'vhf' },
]

export const FINAL_EXAM: Category = {
  id: 'exam',
  title: 'Final exam',
  text: 'Everything mixed, on time, like the real test',
  tag: 'Preview',
  icon: 'exam',
}

export function findCategory(id: CategoryId): Category {
  return [...CATEGORIES, FINAL_EXAM].find((c) => c.id === id) ?? FINAL_EXAM
}
