import { describe, expect, it } from 'vitest'
import { parseLight } from '../buoyage/light'
import { getMark, MARK_IDS } from '../buoyage/marks'
import { ACTION_TEXT, classify, makeEncounter, TEMPLATES } from '../colregs/encounter'
import { COLREGS_THEORY } from '../content/colregsTheory'
import { IALA_THEORY } from '../content/ialaTheory'
import { LIGHTS_THEORY } from '../content/lightsTheory'
import { SOUND_THEORY } from '../content/soundTheory'
import { FLAGS_THEORY } from '../content/flagsTheory'
import { DISTRESS_THEORY } from '../content/distressTheory'
import { MORSE_THEORY } from '../content/morseTheory'
import { CHART_THEORY } from '../content/chartTheory'
import { CHART_SYMBOLS } from '../chart/symbols'
import { fogAction, fogDistractors, FOG_SECTORS, makeFogScenario } from '../colregs/fog'
import { FLAGS } from '../flags/flags'
import { daySignature, isVisible, nightSignature, project } from '../lights/geometry'
import { fixCandidates, HEADINGS, makeFixQuestion, makeHeadingQuestion, makeLightPickQuestion, makeLightQuestion, showsByDay } from '../lights/quiz'
import { CHARS, charLight, coloursFor } from '../buoyage/characters'
import { VESSELS, type ShipLight } from '../lights/vessels'
import { fitsLevel, MORSE } from '../morse'
import { SOUND_SIGNALS } from '../sound/signals'

// These tests guard the facts the questions are built on.
// Run them with: npm test

describe('Morse', () => {
  it('has all letters and digits', () => {
    expect(Object.keys(MORSE).length).toBe(36)
    expect(MORSE.S).toBe('...')
    expect(MORSE.O).toBe('---')
  })
  it('filters words by level', () => {
    expect(fitsLevel('SEAMAN', 1)).toBe(true)
    expect(fitsLevel('SHIP', 1)).toBe(false)
  })
})

describe('Light characters', () => {
  it('fit inside their period', () => {
    for (const l of ['Q', 'VQ(3) 5s', 'Q(6)+LFl 15s', 'VQ(9) 10s', 'Fl(2+1) R 10s', 'Iso 4s', 'Mo(A) 6s']) {
      const light = parseLight(l)
      const total = light.segments.reduce((s, x) => s + x.ms, 0)
      expect(total).toBe(light.periodMs)
    }
  })
  it('rejects a character that does not fit', () => {
    expect(() => parseLight('Q(9) 5s')).toThrow()
  })
  it('gives the south cardinal a long flash of at least 2 s', () => {
    const on = parseLight('Q(6)+LFl 15s').segments.filter((s) => s.on)
    expect(on.length).toBe(7)
    expect(on[6].ms).toBeGreaterThanOrEqual(2000)
  })
})

describe('IALA marks', () => {
  it('swaps lateral colours between region A and B', () => {
    expect(getMark('port', 'A').paint.colors[0]).toBe('red')
    expect(getMark('port', 'B').paint.colors[0]).toBe('green')
    expect(getMark('starboard', 'B').paint.colors[0]).toBe('red')
  })
  it('uses Fl(2+1) only on preferred channel marks', () => {
    for (const id of MARK_IDS) {
      const usesComposite = getMark(id, 'A').lights.some((l) => l.label.startsWith('Fl(2+1)'))
      expect(usesComposite).toBe(id === 'prefPort' || id === 'prefStarboard')
    }
  })
  it('has the right cardinal topmarks', () => {
    expect(getMark('north', 'A').topmark).toBe('conesUp')
    expect(getMark('south', 'A').topmark).toBe('conesDown')
    expect(getMark('east', 'A').topmark).toBe('conesBase')
    expect(getMark('west', 'A').topmark).toBe('conesPoint')
  })
})

describe('Navigation lights (Rule 21)', () => {
  const l = (kind: ShipLight['kind']): ShipLight => ({ kind, color: 'W', x: 0, y: 0, z: 0 })
  it('shows the masthead light to 22.5° abaft the beam', () => {
    expect(isVisible(l('masthead'), 112)).toBe(true)
    expect(isVisible(l('masthead'), 115)).toBe(false)
  })
  it('shows each sidelight only on its own side', () => {
    expect(isVisible(l('sideStbd'), 45)).toBe(true)
    expect(isVisible(l('sideStbd'), -45)).toBe(false)
    expect(isVisible(l('sidePort'), -45)).toBe(true)
  })
  it('shows the sternlight only from astern', () => {
    expect(isVisible(l('stern'), 180)).toBe(true)
    expect(isVisible(l('stern'), 100)).toBe(false)
  })
  it('puts the green sidelight on your left when she is coming straight at you', () => {
    expect(project({ x: 0, y: 5, z: 0 }, 0).u).toBeLessThan(0)
  })
  it('never offers two vessels that look the same at night', () => {
    for (let i = 0; i < 300; i++) {
      const q = makeLightQuestion()
      if (!q.night) continue
      const sig = nightSignature(q.variant, q.aspect.deg)
      for (const o of q.options) {
        if (o.id === q.vessel.id) continue
        expect(o.variants.some((v) => nightSignature(v, q.aspect.deg) === sig)).toBe(false)
      }
    }
  })
})

describe('COLREGs decisions (Rules 13–18)', () => {
  const v = (id: string) => VESSELS.find((x) => x.id === id)!
  it('head-on: both alter to starboard', () => {
    expect(classify(v('power50'), v('power50').variants[0], 2, -1)).toBe('headOn')
  })
  it('crossing from starboard: give way', () => {
    expect(classify(v('power'), v('power').variants[0], 45, -60)).toBe('giveWay')
  })
  it('crossing from port: stand on', () => {
    expect(classify(v('power'), v('power').variants[0], -45, 60)).toBe('standOn')
  })
  it('overtaking comes before Rule 18', () => {
    expect(classify(v('sailing'), v('sailing').variants[0], 5, 170)).toBe('overtaking')
  })
  it('power-driven keeps out of the way of NUC, RAM, fishing and sailing', () => {
    for (const id of ['nuc', 'ram', 'fishing', 'trawling', 'sailing']) {
      expect(classify(v(id), v(id).variants[0], 30, -40)).toBe('keepOut18')
    }
  })
  it('every template gives the expected answer', () => {
    const expected: Record<string, string> = {
      headOn: 'headOn',
      crossingStbd: 'giveWay',
      crossingPort: 'standOn',
      overtaking: 'overtaking',
      overtaken: 'standOnOvertaken',
      cbd: 'notImpede',
      anchored: 'anchored',
      aground: 'aground',
    }
    for (const t of TEMPLATES) {
      for (let i = 0; i < 40; i++) {
        expect(makeEncounter(t).action).toBe(expected[t] ?? 'keepOut18')
      }
    }
  })
  it('has a text for every action', () => {
    expect(Object.keys(ACTION_TEXT).length).toBeGreaterThan(8)
  })
})

describe('Sound signals and flags', () => {
  it('has no two signals with the same pattern in the same situation', () => {
    const seen = new Set<string>()
    for (const s of SOUND_SIGNALS) {
      const k = `${s.context}:${s.pattern.join('')}`
      expect(seen.has(k)).toBe(false)
      seen.add(k)
    }
  })
  it('has all 26 letter flags', () => {
    expect(FLAGS.map((f) => f.letter).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    expect(FLAGS.find((f) => f.letter === 'O')!.meaning).toBe('Man overboard')
  })
})

describe('Rule 19 – restricted visibility', () => {
  it('never turns to port for a vessel forward of the beam', () => {
    for (const b of [0, 5, -5, 30, -30, 60, -60, 80, -80]) expect(fogAction(b)).toBe('starboard')
  })
  it('never turns towards a vessel abeam or abaft the beam', () => {
    for (const b of [90, 120, 160]) expect(fogAction(b)).toBe('port')
    for (const b of [-90, -120, -160]) expect(fogAction(b)).toBe('starboard')
  })
  it('keeps every scenario inside its sector and the right answer out of the distractors', () => {
    for (const sector of FOG_SECTORS) {
      for (let i = 0; i < 40; i++) {
        const f = makeFogScenario(sector)
        expect(f.action).toBe(fogAction(f.bearing))
        // Stay clear of the borderline just forward of the beam
        expect(Math.abs(f.bearing) > 60 && Math.abs(f.bearing) < 90).toBe(false)
        expect(fogDistractors(f.action).includes(f.action)).toBe(false)
      }
    }
  })
})

describe('Theory questions', () => {
  it('have unique ids and four different options', () => {
    for (const list of [COLREGS_THEORY, IALA_THEORY, LIGHTS_THEORY, SOUND_THEORY, FLAGS_THEORY, DISTRESS_THEORY, MORSE_THEORY, CHART_THEORY]) {
      const ids = new Set(list.map((q) => q.id))
      expect(ids.size).toBe(list.length)
      for (const q of list) {
        expect(q.options.length).toBe(4)
        expect(new Set(q.options).size).toBe(q.options.length)
      }
    }
  })
})

describe('Picture-choice light questions', () => {
  it('always has exactly one picture that can be the asked-for vessel', () => {
    const sigs = (v: (typeof VESSELS)[number], night: boolean) => {
      const out = new Set<string>()
      for (const x of v.variants) {
        if (night) for (const a of [0, 45, 90, 135, 180, -135, -90, -45]) out.add(nightSignature(x, a))
        else if (showsByDay(x)) out.add(daySignature(x))
      }
      return out
    }
    for (const v of VESSELS) {
      for (let i = 0; i < 30; i++) {
        const q = makeLightPickQuestion(v.id)
        expect(q.pictures.length).toBe(4)
        expect(q.pictures[0].vessel.id).toBe(v.id)
        const sigOf = (p: (typeof q.pictures)[number]) =>
          q.night ? nightSignature(p.variant, p.aspect.deg) : daySignature(p.variant)
        const targetSigs = sigs(v, q.night)
        for (const p of q.pictures.slice(1)) expect(targetSigs.has(sigOf(p))).toBe(false)
        // A motor-sailer shows power-driven lights at night, so she only counts by day
        for (const o of VESSELS.filter((o) => o.id !== v.id && !(q.night && o.dayOnly))) expect(sigs(o, q.night).has(sigOf(q.pictures[0]))).toBe(false)
        expect(new Set(q.pictures.map((p) => p.vessel.id)).size).toBe(4)
      }
    }
  })
})

describe('Chart symbols', () => {
  it('have unique ids and names, and every group has at least two symbols', () => {
    expect(new Set(CHART_SYMBOLS.map((s) => s.id)).size).toBe(CHART_SYMBOLS.length)
    expect(new Set(CHART_SYMBOLS.map((s) => s.name)).size).toBe(CHART_SYMBOLS.length)
    for (const g of new Set(CHART_SYMBOLS.map((s) => s.group))) {
      expect(CHART_SYMBOLS.filter((s) => s.group === g).length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('New question types', () => {
  it('heading questions match the lights you see', () => {
    for (const h of HEADINGS) {
      for (let i = 0; i < 40; i++) {
        const q = makeHeadingQuestion(h)
        const seen = q.variant.lights.filter((l) => isVisible(l, q.aspect.deg)).map((l) => l.kind)
        const green = seen.includes('sideStbd')
        const red = seen.includes('sidePort')
        if (h === 'towards') expect(green && red).toBe(true)
        if (h === 'leftToRight') expect(green && !red && !seen.includes('stern')).toBe(true)
        if (h === 'rightToLeft') expect(red && !green && !seen.includes('stern')).toBe(true)
        if (h === 'away') expect(!green && !red && seen.includes('stern')).toBe(true)
      }
    }
  })
  it('"what is wrong" always has exactly one right answer', () => {
    for (const night of [true, false]) {
      for (const v of fixCandidates(night)) {
        for (let i = 0; i < 30; i++) {
          const q = makeFixQuestion(v.id)
          const key = (l: string[]) => l.join(',')
          expect(q.decoys.some((d) => key(d) === key(q.correct) || key(d) === key(q.shown))).toBe(false)
          expect(q.correct.length).toBeGreaterThan(0)
        }
      }
    }
  })
  it('every light character can be drawn in every colour it is offered in', () => {
    for (const c of CHARS) for (const col of coloursFor(c)) expect(charLight(c.spec, col).periodMs).toBeGreaterThan(0)
  })
})
