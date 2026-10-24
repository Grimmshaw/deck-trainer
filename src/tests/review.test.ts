import { describe, expect, it } from 'vitest'
import { judgeRound, PAUSE_DAYS, REVIEW_LINK, type ReviewState, type Round } from '../store/review'

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 9, 24)
const fresh: ReviewState = { practices: 0, lastAsked: 0 }
const practice = (right: number, extra: Partial<Round> = {}): Round => ({ mode: 'practice', right, count: 10, answered: 10, ...extra })

/** Runs rounds one after the other and returns, for each, whether it was a good moment */
function run(rounds: Round[], state = fresh, now = NOW) {
  return rounds.map((r) => {
    const out = judgeRound(state, r, now)
    state = out.state
    return out.good
  })
}

describe('Google Play rating box', () => {
  it('asks after a passed Test or Final exam, not a failed one', () => {
    expect(judgeRound(fresh, { mode: 'exam', right: 7, count: 10, answered: 10 }, NOW).good).toBe(true)
    expect(judgeRound(fresh, { mode: 'exam', right: 28, count: 40, answered: 40 }, NOW).good).toBe(true)
    expect(judgeRound(fresh, { mode: 'exam', right: 6, count: 10, answered: 10 }, NOW).good).toBe(false)
    // Time ran out: unanswered questions count as wrong
    expect(judgeRound(fresh, { mode: 'exam', right: 20, count: 40, answered: 22 }, NOW).good).toBe(false)
  })
  it('asks after a passed signals exam (70 of 100)', () => {
    expect(judgeRound(fresh, { mode: 'signals', right: 70, count: 100, answered: 100 }, NOW).good).toBe(true)
    expect(judgeRound(fresh, { mode: 'signals', right: 69, count: 100, answered: 100 }, NOW).good).toBe(false)
  })
  it('asks on the third finished practice round, if it went reasonably well', () => {
    expect(run([practice(10), practice(10), practice(8)])).toEqual([false, false, true])
    expect(run([practice(10), practice(10), practice(3), practice(9)])).toEqual([false, false, false, true])
    // Mistakes rounds are practice too
    expect(run([practice(5), practice(5, { mode: 'mistakes' }), practice(6)])).toEqual([false, false, true])
  })
  it('does not count rounds left early or free rounds', () => {
    expect(run([practice(5, { answered: 5 }), practice(10), practice(10)])).toEqual([false, false, false])
    expect(run([practice(10, { trial: true }), practice(10), practice(10)])).toEqual([false, false, false])
    expect(judgeRound(fresh, { mode: 'exam', right: 10, count: 10, answered: 10, trial: true }, NOW).good).toBe(false)
  })
  it(`waits ${PAUSE_DAYS} days after asking`, () => {
    const asked: ReviewState = { practices: 5, lastAsked: NOW }
    const exam: Round = { mode: 'exam', right: 10, count: 10, answered: 10 }
    expect(judgeRound(asked, exam, NOW + 30 * DAY).good).toBe(false)
    expect(judgeRound(asked, exam, NOW + (PAUSE_DAYS - 1) * DAY).good).toBe(false)
    expect(judgeRound(asked, exam, NOW + PAUSE_DAYS * DAY).good).toBe(true)
    // Practice rounds are still counted while waiting
    expect(judgeRound(asked, practice(10), NOW + DAY).state.practices).toBe(6)
  })
  it('opens ReviewActivity in the Lanterna app', () => {
    expect(REVIEW_LINK).toBe('intent://review#Intent;scheme=lanterna;package=se.lanternakonsult.lanterna;end')
  })
})
