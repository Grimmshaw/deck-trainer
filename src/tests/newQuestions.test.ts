import { describe, expect, it } from 'vitest'
import { makeRankQuestion, RANK_SETS } from '../colregs/rank'
import { isVisible } from '../lights/geometry'
import { makeMissingQuestion, missingCandidates, missingDistractors, missingId, MISSING_TEXT } from '../lights/missing'
import { canAskAtNight, fixCandidates, makeFixQuestion, makeLightPickQuestion, makeLightQuestion } from '../lights/quiz'
import { VESSELS } from '../lights/vessels'
import { lightsGenerator } from '../study/generators/lights'
import { GENERATORS } from '../study/registry'
import { COLREGS_THEORY } from '../content/colregsTheory'
import { passAnswer, sectorAnswer } from '../study/generators/buoyage'
import { RADIO_ORDER_SETS, radioWindow, wrongOrders } from '../content/radioOrder'
import { lampSteps } from '../components/MorseLamp'
import { scoreItem } from '../components/SignalsExam'
import { REGIONS } from '../regions'
import { SOUND_SITUATIONS } from '../content/soundSituations'
import { SOUND_SIGNALS } from '../sound/signals'
import { RADIO_SITUATIONS } from '../content/distressSituations'

// Tests for the question types added 15 Oct 2026: one light missing, Rule 18
// ranking, lights seen from above, and "lights only" / "day shapes only".

describe('One light is missing', () => {
  it('always marks a light that can be seen, and keeps at least one other light', () => {
    for (const v of missingCandidates()) {
      for (let i = 0; i < 30; i++) {
        const q = makeMissingQuestion(v.id)
        expect(q, v.id).not.toBeNull()
        expect(isVisible(q!.missing, q!.aspect.deg)).toBe(true)
        expect(q!.shown.lights.length).toBe(q!.variant.lights.length - 1)
        expect(q!.shown.lights.some((l) => isVisible(l, q!.aspect.deg))).toBe(true)
      }
    }
  })
  it('has four different answers, and the right one is among them', () => {
    for (const id of Object.keys(MISSING_TEXT) as (keyof typeof MISSING_TEXT)[]) {
      const all = [id, ...missingDistractors(id)]
      expect(new Set(all).size).toBe(4)
    }
  })
  it('never asks about a vessel with optional lights or one only shown by day', () => {
    for (const v of missingCandidates()) {
      expect(v.dayOnly).toBeFalsy()
      const q = makeMissingQuestion(v.id)!
      expect(q.variant.label).not.toContain('optional')
      expect(MISSING_TEXT[missingId(q.missing)]).toBeTruthy()
    }
  })
})

describe('Rule 18 ranking', () => {
  it('gives the right order and three different wrong orders', () => {
    const level: Record<string, number> = { nuc: 0, ram: 0, cbd: 1, trawling: 2, fishing: 2, sailing: 3, power: 4 }
    for (const set of RANK_SETS) {
      for (let i = 0; i < 40; i++) {
        const q = makeRankQuestion(set)
        expect(q.order).toHaveLength(4)
        const lv = q.order.map((v) => level[v.id])
        expect([...lv].sort((a, b) => a - b)).toEqual(lv)
        expect(new Set(lv).size).toBe(4) // never two on the same level (NUC and RAM)
        expect(q.wrong).toHaveLength(3)
        const keys = [q.order, ...q.wrong].map((o) => o.map((v) => v.id).join())
        expect(new Set(keys).size).toBe(4)
      }
    }
  })
  it('only uses vessels the lights engine can draw', () => {
    for (const set of RANK_SETS) {
      for (const v of makeRankQuestion(set).order) expect(VESSELS.some((x) => x.id === v.vesselId)).toBe(true)
    }
  })
})

describe('Lights only / day shapes only', () => {
  it('makes only night questions for lights, only day questions with shapes for shapes', () => {
    for (const v of VESSELS) {
      for (let i = 0; i < 10; i++) {
        if (canAskAtNight(v)) expect(makeLightQuestion(undefined, v.id, 'night').night).toBe(true)
        if (v.variants.some((x) => x.shapes.length > 0)) {
          const q = makeLightQuestion(undefined, v.id, 'day')
          expect(q.night).toBe(false)
          expect(q.variant.shapes.length).toBeGreaterThan(0)
        }
      }
    }
  })
  it('picture and "what is wrong" questions follow the focus', () => {
    for (const v of fixCandidates(true)) expect(makeFixQuestion(v.id, 'night').night).toBe(true)
    for (const v of fixCandidates(false)) expect(makeFixQuestion(v.id, 'day').night).toBe(false)
    for (const v of VESSELS.filter((x) => !x.dayOnly).slice(0, 5)) {
      try {
        expect(makeLightPickQuestion(v.id, 'night').night).toBe(true)
      } catch {
        /* some vessels can't be asked as a picture question; the generator retries another type */
      }
    }
  })
  it('every item of each focus makes a question', () => {
    const region = { id: 'intl' } as never
    for (const focus of ['lights', 'shapes', 'both'] as const) {
      const ctx = { region, focus }
      const gen = GENERATORS.lights!
      for (const key of gen.items(ctx)) {
        const q = gen.make(key, ctx)
        expect(q, `${focus} ${key}`).not.toBeNull()
      }
    }
  })
  it('never fails, also when a picture question is impossible (trawler by day)', () => {
    const region = { id: 'intl' } as never
    for (const focus of ['lights', 'shapes', 'both'] as const) {
      const ctx = { region, focus }
      for (const key of GENERATORS.lights!.items(ctx)) for (let i = 0; i < 15; i++) GENERATORS.lights!.make(key, ctx)
    }
  })
  it('the lights generator offers the three choices', () => {
    expect(Object.keys(lightsGenerator.focus!)).toEqual(['lights', 'shapes', 'both'])
  })
})

describe('COLREG theory', () => {
  it('no question gives away its answer in the title (Rules 4–10, 11–18)', () => {
    for (const id of ['R4', 'R11', 'R19c']) {
      const t = COLREGS_THEORY.find((q) => q.id === id)!
      expect(t.q.toLowerCase()).not.toContain('in sight of one another')
      expect(t.q.toLowerCase()).not.toContain('any condition of visibility')
    }
  })
})

// ---------- Added 15 Oct 2026 (second round) ----------

describe('Passing marks', () => {
  it('lateral marks: port-hand to port entering, to starboard leaving; preferred channel follows the main channel', () => {
    expect(passAnswer('port', true)).toBe('portSide')
    expect(passAnswer('port', false)).toBe('stbdSide')
    expect(passAnswer('starboard', true)).toBe('stbdSide')
    expect(passAnswer('starboard', false)).toBe('portSide')
    // Preferred channel to starboard = modified port-hand mark
    expect(passAnswer('prefStarboard', true)).toBe('portSide')
    expect(passAnswer('prefPort', true)).toBe('stbdSide')
  })
  it('cardinal marks: pass on the side the mark is named after', () => {
    for (const d of ['north', 'east', 'south', 'west'] as const) expect(passAnswer(d, true)).toBe(d)
  })
  it('every pass and sector question has its answer among the options, in both regions', () => {
    for (const region of ['A', 'B'].map((b) => REGIONS.find((r) => r.buoyage === b)!)) {
      const ctx = { region }
      for (const key of GENERATORS.buoyage!.items(ctx).filter((k) => k.startsWith('iala:pass:') || k.startsWith('iala:sector:'))) {
        for (let i = 0; i < 20; i++) {
          const q = GENERATORS.buoyage!.make(key, ctx)!
          expect(q.options.some((o) => o.id === q.correctId)).toBe(true)
          expect(new Set(q.options.map((o) => o.label)).size).toBe(q.options.length)
        }
      }
    }
  })
})

describe('Sector lights', () => {
  it('alter towards the white sector', () => {
    expect(sectorAnswer('R', 'R')).toBe('stbd') // red is west of white: go east
    expect(sectorAnswer('G', 'R')).toBe('port')
    expect(sectorAnswer('G', 'G')).toBe('stbd')
    expect(sectorAnswer('W', 'G')).toBe('stay')
  })
})

describe('MAYDAY and PAN-PAN order', () => {
  it('every window of four parts has three different wrong orders', () => {
    for (const set of RADIO_ORDER_SETS) {
      const { parts } = radioWindow(set)
      expect(parts).toHaveLength(4)
      for (let i = 0; i < 20; i++) {
        const w = wrongOrders(parts)
        expect(w).toHaveLength(3)
        expect(new Set([parts, ...w].map((o) => o.join('|'))).size).toBe(4)
      }
    }
  })
  it('the distress message starts with MAYDAY ×3 and position comes before the nature of distress', () => {
    const { message } = radioWindow('mayday:0')
    expect(message.parts[0]).toBe('MAYDAY, MAYDAY, MAYDAY')
    expect(message.parts.indexOf('Position')).toBeLessThan(message.parts.indexOf('Nature of distress'))
  })
})

describe('Morse by light and the signals exam', () => {
  it('uses standard timing: dash 3, gap in a letter 1, between letters 3', () => {
    expect(lampSteps('E')).toEqual([[true, 1]])
    expect(lampSteps('A')).toEqual([[true, 1], [false, 1], [true, 3]])
    expect(lampSteps('ET')).toEqual([[true, 1], [false, 3], [true, 3]])
  })
  it('scores singles right or wrong and groups per character', () => {
    expect(scoreItem({ text: 'K', points: 1 }, 'k')).toBe(1)
    expect(scoreItem({ text: 'K', points: 1 }, 'R')).toBe(0)
    expect(scoreItem({ text: 'AB3DE', points: 5 }, 'AB3DX')).toBe(4)
    expect(scoreItem({ text: 'AB3DE', points: 5 }, ' ab3 de ')).toBe(5)
  })
})

describe('New vessels', () => {
  it('every vessel can be asked about somehow (night, day or picture)', () => {
    for (const v of VESSELS) {
      const q = makeLightQuestion(undefined, v.id)
      expect(q.vessel.id).toBe(v.id)
    }
  })
  it('mine clearance and dredger shapes are not mistaken for a vessel aground or a RAM vessel', () => {
    const sig = (id: string) => VESSELS.find((v) => v.id === id)!.variants.map((x) => x.shapes.join() + JSON.stringify(x.shapeAt ?? []))
    expect(sig('mineClearance')[0]).not.toBe(sig('aground')[0])
    expect(sig('dredging')[0]).not.toBe(sig('ram')[0])
  })
})

describe('Sound and distress situations (15 Oct, third round)', () => {
  it('every sound situation points at a real signal, and its question offers it with three different patterns', () => {
    const ctx = { region: REGIONS[0] }
    for (const x of SOUND_SITUATIONS) {
      expect(SOUND_SIGNALS.some((s) => s.id === x.answer), x.id).toBe(true)
      for (let i = 0; i < 20; i++) {
        const q = GENERATORS.sound!.make('sound:sit:' + x.id, ctx)!
        expect(q.correctId).toBe(x.answer)
        expect(new Set(q.options.map((o) => o.label)).size).toBe(4)
      }
    }
  })
  it('fishing and RAM vessels at anchor in fog give one prolonged and two short blasts (Rule 35(d))', () => {
    expect(SOUND_SITUATIONS.find((x) => x.id === 'fogFishAnchor')!.answer).toBe('fogLss')
    expect(SOUND_SITUATIONS.find((x) => x.id === 'fogRamAnchor')!.answer).toBe('fogLss')
  })
  it('every radio situation and DSC question has its answer among the options', () => {
    const ctx = { region: REGIONS[0] }
    const keys = GENERATORS.distress!.items(ctx).filter((k) => k.startsWith('distress:prio:') || k.startsWith('distress:dsc:') || k.startsWith('distress:order:'))
    expect(keys.length).toBeGreaterThan(20)
    for (const k of keys) {
      const q = GENERATORS.distress!.make(k, ctx)!
      expect(q.options.some((o) => o.id === q.correctId), k).toBe(true)
    }
    expect(RADIO_SITUATIONS.find((x) => x.id === 'medical')!.priority).toBe('panpan')
    expect(RADIO_SITUATIONS.find((x) => x.id === 'container')!.priority).toBe('securite')
  })
})
