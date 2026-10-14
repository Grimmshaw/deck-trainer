import { describe, expect, it } from 'vitest'
import { gradeTyped, normalize } from '../study/typed'
import { CHART_THEORY } from '../content/chartTheory'
import { COLREGS_THEORY } from '../content/colregsTheory'
import { DISTRESS_THEORY } from '../content/distressTheory'
import { FLAGS_THEORY } from '../content/flagsTheory'
import { IALA_THEORY } from '../content/ialaTheory'
import { LIGHTS_THEORY } from '../content/lightsTheory'
import { MORSE_THEORY } from '../content/morseTheory'
import { SOUND_THEORY } from '../content/soundTheory'

describe('Typed answers', () => {
  it('ignores case, spaces, punctuation and a leading article', () => {
    expect(normalize('The  Port-Side!')).toBe('port side')
    expect(normalize('Fl(2+1) W')).toBe('fl 2+1 w')
    expect(normalize('ch16')).toBe('ch 16')
  })

  it('accepts whole answers and sentences with the keywords', () => {
    const port = { accept: ['port', 'port side'], keywords: ['port'], reject: ['starboard'] }
    expect(gradeTyped('PORT SIDE', port).verdict).toBe('right')
    expect(gradeTyped('keep it on my port side', port).verdict).toBe('right')
    expect(gradeTyped('starboard', port).verdict).toBe('wrong')
    expect(gradeTyped('', port).verdict).toBe('wrong')
  })

  it('allows a spelling mistake in longer words, but never one that is another option', () => {
    expect(gradeTyped('starbord', { accept: ['starboard'] }, ['port']).verdict).toBe('typo')
    expect(gradeTyped('gravle', { accept: ['gravel'] }, ['grass']).verdict).toBe('typo')
    expect(gradeTyped('west', { accept: ['east'] }, ['west']).verdict).toBe('wrong')
    expect(gradeTyped('wast', { accept: ['east'] }, ['west']).verdict).toBe('wrong')
  })

  it('gives no spelling allowance for codes', () => {
    const fl = { accept: ['Fl(2+1)'], exact: true }
    expect(gradeTyped('fl 2+1', fl).verdict).toBe('right')
    expect(gradeTyped('Fl(2+2)', fl).verdict).toBe('wrong')
  })

  it('gives partly right when only some keywords are there', () => {
    const r = gradeTyped('white', { accept: ['white Fl(2)'], keywords: ['white', 'fl 2'], exact: true })
    expect(r.verdict).toBe('partial')
    expect(r.missing).toEqual(['fl 2'])
  })
})

describe('Typed answers in the theory questions', () => {
  // A wrong option may come out as "partly right" (e.g. "White, Iso" has the right colour), never as right
  it('accept the correct option and none of the wrong ones', () => {
    for (const list of [COLREGS_THEORY, IALA_THEORY, LIGHTS_THEORY, SOUND_THEORY, FLAGS_THEORY, DISTRESS_THEORY, MORSE_THEORY, CHART_THEORY]) {
      for (const q of list) {
        if (!q.typed) continue
        const wrong = q.options.slice(1)
        expect([q.id, gradeTyped(q.options[0], q.typed, wrong).verdict]).toEqual([q.id, 'right'])
        for (const a of q.typed.accept) expect([q.id, a, gradeTyped(a, q.typed, wrong).verdict]).toEqual([q.id, a, 'right'])
        for (const w of wrong) expect([q.id, w, gradeTyped(w, q.typed, wrong).verdict]).not.toContain('right')
        for (const w of wrong) expect([q.id, w, gradeTyped(w, q.typed, wrong).verdict]).not.toContain('typo')
      }
    }
  })
})
