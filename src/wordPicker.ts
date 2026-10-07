import { fitsLevel, LEVELS, type Level } from './morse'
import { DIGIT_WORDS, WORDS } from './words'

export type WordSource = 'word' | 'digits' | 'random'

export interface Pick {
  word: string
  source: WordSource
}

/** Real words that fit the chosen level and length */
export function wordsFor(level: Level, length: number): string[] {
  return WORDS.filter((w) => w.length === length && fitsLevel(w, level))
}

function digitWordsFor(length: number): string[] {
  return DIGIT_WORDS.filter((w) => w.length === length)
}

function randomFrom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

function randomString(chars: string, length: number): string {
  let s = ''
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

/** Chance that a level 3 round uses a group with digits */
const DIGIT_CHANCE = 0.35

/**
 * Picks the next word. Avoids the most recently used words when possible.
 * Falls back to random letters if no real word fits.
 */
export function pickWord(level: Level, length: number, recent: string[] = []): Pick {
  const avoid = (list: string[]) => {
    const fresh = list.filter((w) => !recent.includes(w))
    return fresh.length > 0 ? fresh : list
  }

  if (level === 3 && Math.random() < DIGIT_CHANCE) {
    const groups = digitWordsFor(length)
    if (groups.length > 0) return { word: randomFrom(avoid(groups)), source: 'digits' }
    return { word: randomString('0123456789', length), source: 'digits' }
  }

  const words = wordsFor(level, length)
  if (words.length > 0) return { word: randomFrom(avoid(words)), source: 'word' }

  return { word: randomString(LEVELS[level].chars, length), source: 'random' }
}
