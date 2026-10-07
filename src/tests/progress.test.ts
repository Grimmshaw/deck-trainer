import { describe, expect, it } from 'vitest'
import { getProgress, mastery, MAX_BOX, pickKey, record, resetProgress, weakKeys } from '../study/progress'

describe('Spaced repetition', () => {
  it('moves an item up a box when right and back to 0 when wrong', () => {
    resetProgress(['t:a'])
    record('t:a', true)
    record('t:a', true)
    expect(getProgress('t:a')!.box).toBe(2)
    record('t:a', false)
    expect(getProgress('t:a')!.box).toBe(0)
    expect(weakKeys(['t:a'])).toEqual(['t:a'])
  })
  it('reports mastery from 0 to 1', () => {
    resetProgress(['t:b', 't:c'])
    for (let i = 0; i < MAX_BOX; i++) record('t:b', true)
    expect(mastery(['t:b', 't:c'])).toBe(0.5)
  })
  it('prefers items that are due over items learned well', () => {
    resetProgress(['t:d', 't:e'])
    for (let i = 0; i < MAX_BOX; i++) record('t:d', true)
    record('t:e', false)
    let e = 0
    for (let i = 0; i < 200; i++) if (pickKey(['t:d', 't:e']) === 't:e') e++
    expect(e).toBeGreaterThan(150)
  })
})
