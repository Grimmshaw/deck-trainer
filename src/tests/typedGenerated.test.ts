import { describe, expect, it } from 'vitest'
import { CHART_SYMBOLS } from '../chart/symbols'
import { ACTION_TEXT } from '../colregs/encounter'
import { FOG_ACTION_TEXT } from '../colregs/fog'
import { FLAGS } from '../flags/flags'
import { HEADING_TEXT } from '../lights/quiz'
import { VESSELS } from '../lights/vessels'
import { getMark, MARK_IDS } from '../buoyage/marks'
import { REGIONS } from '../regions'
import { SOUND_SIGNALS } from '../sound/signals'
import { GENERATORS } from '../study/registry'
import { gradeTyped, type TypedAnswer } from '../study/typed'
import {
  ACTION_TYPED,
  CHART_TYPED,
  FOG_TYPED,
  HEADING_TYPED,
  MARK_TYPED,
  SIGNAL_TYPED,
  signalTyped,
  SOUND_TYPED,
  VESSEL_TYPED,
} from '../study/typedAnswers'

/** Every right text is right, and every other text in the same table is not right (it may be "partly right") */
function checkTable(rows: { id: string; text: string; typed: TypedAnswer }[]) {
  const problems: string[] = []
  for (const r of rows) {
    const v = gradeTyped(r.text, r.typed).verdict
    if (v !== 'right') problems.push(`${r.id}: own text "${r.text}" → ${v}`)
    for (const o of rows) {
      if (o.id === r.id || o.text === r.text) continue
      const w = gradeTyped(o.text, r.typed, [o.text]).verdict
      if (w === 'right' || w === 'typo') problems.push(`${r.id}: "${o.text}" → ${w}`)
    }
  }
  expect(problems).toEqual([])
}

describe('Typed answers for generated questions', () => {
  it('single-letter signal meanings', () => {
    const rows = FLAGS.filter((f) => f.meaning).map((f) => ({ id: f.letter, text: f.meaning!, typed: signalTyped(f.letter, f.meaning!) }))
    expect(Object.keys(SIGNAL_TYPED).sort()).toEqual(rows.map((r) => r.id).sort())
    checkTable(rows)
  })

  it('IALA mark names', () => {
    checkTable(MARK_IDS.map((id) => ({ id, text: getMark(id, 'A').name, typed: MARK_TYPED[id] })))
  })

  it('chart symbol names', () => {
    expect(Object.keys(CHART_TYPED).sort()).toEqual(CHART_SYMBOLS.map((s) => s.id).sort())
    checkTable(CHART_SYMBOLS.map((s) => ({ id: s.id, text: s.name, typed: { accept: [s.name.toLowerCase()], ...CHART_TYPED[s.id] } })))
  })

  it('vessel names', () => {
    checkTable(VESSELS.map((v) => ({ id: v.id, text: v.name, typed: { accept: [v.name.toLowerCase()], ...VESSEL_TYPED[v.id] } })))
  })

  it('sound signal meanings', () => {
    checkTable(SOUND_SIGNALS.map((s) => ({ id: s.id, text: s.meaning, typed: { accept: [s.meaning.toLowerCase()], ...SOUND_TYPED[s.id] } })))
  })

  it('headings', () => {
    checkTable(Object.entries(HEADING_TEXT).map(([id, text]) => ({ id, text, typed: HEADING_TYPED[id] })))
  })

  it('COLREG and Rule 19 actions', () => {
    for (const [id, typed] of Object.entries(ACTION_TYPED)) expect([id, gradeTyped(ACTION_TEXT[id as keyof typeof ACTION_TEXT], typed).verdict]).toEqual([id, 'right'])
    for (const [id, typed] of Object.entries(FOG_TYPED)) expect([id, gradeTyped(FOG_ACTION_TEXT[id as keyof typeof FOG_ACTION_TEXT], typed).verdict]).toEqual([id, 'right'])
  })

  // The real questions, many times over: the right option is accepted, the wrong ones never
  it('every generated question with a typed answer grades its own options correctly', () => {
    const problems = new Set<string>()
    let typed = 0
    // One region of each buoyage system
    const regions = ['A', 'B'].map((b) => REGIONS.find((r) => r.buoyage === b)!).filter(Boolean)
    for (const region of regions) {
      for (const g of Object.values(GENERATORS)) {
        if (!g) continue
        const ctx = { region }
        for (const key of g.items(ctx)) {
          for (let i = 0; i < 15; i++) {
            const q = g.make(key, ctx)
            if (!q?.typed) continue
            typed++
            const right = q.typed.answer ?? q.options.find((o) => o.id === q.correctId)!.label
            const wrong = q.options.filter((o) => o.id !== q.correctId).map((o) => o.label)
            const v = gradeTyped(right, q.typed, wrong).verdict
            if (v !== 'right') problems.add(`${key}: right "${right}" → ${v}`)
            for (const w of wrong) {
              const x = gradeTyped(w, q.typed, wrong).verdict
              if (x === 'right' || x === 'typo') problems.add(`${key}: wrong "${w}" → ${x}`)
            }
          }
        }
      }
    }
    expect(typed).toBeGreaterThan(1000)
    expect([...problems]).toEqual([])
  }, 60_000)
})
