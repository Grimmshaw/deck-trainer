import { describe, expect, it } from 'vitest'
import { markTrialUsed, PAYWALL_ON, trialAvailable } from '../store/entitlement'

describe('Free round', () => {
  it('gives each locked category one free round, never Morse or the final exam', () => {
    if (!PAYWALL_ON) return
    expect(trialAvailable('morse')).toBe(false)
    expect(trialAvailable('exam')).toBe(false)
    expect(trialAvailable('colregs')).toBe(true)
    markTrialUsed('colregs')
    expect(trialAvailable('colregs')).toBe(false)
    expect(trialAvailable('lights')).toBe(true)
  })
})
