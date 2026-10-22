import { describe, expect, it } from 'vitest'
import { courseQuestion, digitByDigit, MARKER_CONFUSED, timeQuestion, words999 } from '../content/vhf'
import { VHF_THEORY } from '../content/vhfTheory'
import { GENERATORS, EXAM_CATEGORIES } from '../study/registry'
import { gradeTyped } from '../study/typed'
import type { Ctx } from '../study/types'
import { REGIONS } from '../regions'

const ctx: Ctx = { region: REGIONS[0] } as unknown as Ctx
const gen = GENERATORS.vhf!

describe('VHF & SMCP', () => {
  it('is a study category and part of the final exam', () => {
    expect(gen).toBeTruthy()
    expect(EXAM_CATEGORIES).toContain('vhf')
  })

  it('makes sound questions for every item: four different options, one of them right', () => {
    const keys = gen.items(ctx)
    expect(keys.length).toBeGreaterThan(70)
    expect(new Set(keys).size).toBe(keys.length)
    for (const key of keys) {
      for (let i = 0; i < 25; i++) {
        const q = gen.make(key, ctx)!
        expect(q.category).toBe('vhf')
        expect(q.options.length).toBe(4)
        expect(new Set(q.options.map((o) => o.id)).size).toBe(4)
        expect(new Set(q.options.map((o) => o.label)).size).toBe(4)
        expect(q.options.some((o) => o.id === q.correctId)).toBe(true)
        if (q.typed) {
          const right = q.options.find((o) => o.id === q.correctId)!.label
          expect(gradeTyped(q.typed.accept[0], q.typed).verdict).toBe('right')
          for (const o of q.options.filter((x) => x.id !== q.correctId)) {
            if (o.label.toLowerCase() !== right.toLowerCase()) expect(gradeTyped(o.label, q.typed).verdict).not.toBe('right')
          }
        }
      }
      expect(gen.label(key, ctx).length).toBeGreaterThan(0)
      expect(gen.card!(key, ctx).title.length).toBeGreaterThan(0)
    }
  })

  it('splits the phonetic alphabet from the phrases', () => {
    const abc = gen.items({ ...ctx, focus: 'alphabet' })
    const phrases = gen.items({ ...ctx, focus: 'meaning' })
    expect(abc.length).toBe(26)
    expect(abc.every((k) => k.startsWith('vhf:abc:'))).toBe(true)
    expect(phrases.some((k) => k.startsWith('vhf:abc:'))).toBe(false)
    expect(phrases.some((k) => k.startsWith('vhf:t:'))).toBe(true)
  })

  it('always offers the most easily confused message marker as a wrong option', () => {
    for (const key of gen.items(ctx).filter((k) => k.startsWith('vhf:mm:'))) {
      const q = gen.make(key, ctx)!
      expect(q.options.map((o) => o.id)).toContain(MARKER_CONFUSED[q.correctId as keyof typeof MARKER_CONFUSED])
    }
  })

  it('says numbers digit by digit', () => {
    expect(digitByDigit('095')).toBe('zero-nine-five')
    expect(words999(230)).toBe('two hundred and thirty')
    for (let c = 10; c < 360; c++) {
      const q = courseQuestion(c)
      expect(q.wrong.length).toBe(3)
      expect(q.wrong).not.toContain(q.right)
      expect(q.right.toLowerCase()).toBe(digitByDigit(String(c).padStart(3, '0')))
    }
    for (let h = 0; h < 24; h++) {
      const q = timeQuestion(h, 30)
      expect(new Set([q.right, ...q.wrong]).size).toBe(4)
      expect(q.right.endsWith('UTC')).toBe(true)
    }
  })

  it('theory questions have unique ids and grade their typed answers', () => {
    expect(new Set(VHF_THEORY.map((t) => t.id)).size).toBe(VHF_THEORY.length)
    for (const t of VHF_THEORY.filter((x) => x.typed)) {
      expect(gradeTyped(t.typed!.accept[0], t.typed!).verdict).toBe('right')
      for (const w of t.options.slice(1)) expect(gradeTyped(w, t.typed!).verdict).not.toBe('right')
    }
  })

  it('has match pairs for the alphabet and the orders', () => {
    const pairs = gen.pairs!(ctx)
    expect(pairs.length).toBe(26 + 12)
    expect(new Set(pairs.map((p) => p.key)).size).toBe(pairs.length)
  })
})
