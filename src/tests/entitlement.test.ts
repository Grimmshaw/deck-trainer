import { describe, expect, it } from 'vitest'
import { markTrialUsed, PAYWALL_ON, shouldAskForRating, trialAvailable } from '../store/entitlement'

describe('Free round and rating request', () => {
  it('gives each locked category one free round, never Morse or the final exam', () => {
    if (!PAYWALL_ON) return
    expect(trialAvailable('morse')).toBe(false)
    expect(trialAvailable('exam')).toBe(false)
    expect(trialAvailable('colregs')).toBe(true)
    markTrialUsed('colregs')
    expect(trialAvailable('colregs')).toBe(false)
    expect(trialAvailable('lights')).toBe(true)
  })
  it('asks for a rating only after a good round of at least 10 questions', () => {
    expect(shouldAskForRating(8, 10)).toBe(true)
    expect(shouldAskForRating(7, 10)).toBe(false)
    expect(shouldAskForRating(9, 9)).toBe(false)
  })
})
