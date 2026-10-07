// International Morse code (ITU-R M.1677-1)
export const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
}

export type Level = 1 | 2 | 3
export type Mode = 'decode' | 'encode'

const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'

export const LEVELS: Record<Level, { label: string; chars: string; summary: string }> = {
  1: { label: 'Level 1', chars: 'ETAINMSO', summary: 'E T A I N M S O' },
  2: { label: 'Level 2', chars: AZ, summary: 'A–Z' },
  3: { label: 'Level 3', chars: AZ + DIGITS, summary: 'A–Z + 0–9' },
}

export const MIN_LENGTH = 2
export const MAX_LENGTH = 8

/** Morse code for each character in a word, e.g. "SOS" -> ["...", "---", "..."] */
export function toMorse(word: string): string[] {
  return word
    .toUpperCase()
    .split('')
    .map((c) => MORSE[c] ?? '')
}

/** True if every character of the word belongs to the level */
export function fitsLevel(word: string, level: Level): boolean {
  const chars = LEVELS[level].chars
  for (const c of word) if (!chars.includes(c)) return false
  return true
}
