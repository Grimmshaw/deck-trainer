// Free-text answers ("type the answer"), graded offline without AI.
//
// A question may carry a `typed` block that says which answers are right.
// gradeTyped() compares what the user wrote with it:
//   1. Whole answer: the text matches one of `accept` (case, spaces, punctuation
//      and a leading a/an/the do not matter).
//   2. Spelling: a small spelling mistake is allowed in longer words
//      ("starbord" → "starboard"), unless `exact` is set or the text is just as
//      close to one of the wrong options ("west" is never a typo for "east").
//   3. Keywords: for sentence answers, every keyword must be in the text
//      (checked before spelling, so a full sentence is "right", not "typo").
//      Some but not all → partly right. A word in `reject` makes it wrong.
//
// Limit: keyword grading does not understand meaning, so "not to port" still
// contains "port". `reject` catches the most likely wrong words.

export interface TypedAnswer {
  /** Whole answers that are right. The first one is shown as the correct answer. */
  accept: string[]
  /**
   * Words or phrases that must all be in a sentence answer.
   * A list inside the list means any one of them will do: [['sphere', 'ball'], 'two'].
   */
  keywords?: (string | string[])[]
  /** Words that make the answer wrong if they are in it, for example 'starboard' when the answer is port */
  reject?: string[]
  /** No spelling allowance. Use for codes like Fl(2+1), where one character changes the meaning. */
  exact?: boolean
  /** Short help under the text field, for example 'One word' or 'e.g. Fl(3)' */
  hint?: string
  /** The answer to show after checking. Left out = the right option's text. */
  answer?: string
}

export type TypedVerdict = 'right' | 'typo' | 'partial' | 'wrong'

export interface TypedResult {
  /** 'typo' counts as right, but the app shows the correct spelling */
  verdict: TypedVerdict
  /** The correct answer to show */
  answer: string
  /** Keywords that were missing (for 'partial' and 'wrong') */
  missing: string[]
}

/** Lower case, no accents, letters and digits split ("fl2" → "fl 2"), punctuation except + as space */
export function normalize(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, ' ')
    .replace(/([a-z])(?=\d)|(\d)(?=[a-z])/g, '$1$2 ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(a|an|the) /, '')
}

const compact = (s: string) => normalize(s).replace(/ /g, '')

/** How many letters may be wrong in a word of this length: none up to 4 letters, 1 up to 8, then 2 */
export function allowedTypos(length: number): number {
  return length <= 4 ? 0 : length <= 8 ? 1 : 2
}

/** Edit distance: how many letters to add, remove, change or swap ("gravle" → "gravel" is 1) to get from a to b */
export function distance(a: string, b: string): number {
  if (a === b) return 0
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length]
}

/** Is the phrase in the text as whole words, allowing small spelling mistakes per word? */
function hasPhrase(words: string[], phrase: string, exact: boolean): boolean {
  const want = normalize(phrase).split(' ').filter(Boolean)
  if (!want.length) return false
  for (let i = 0; i + want.length <= words.length; i++) {
    const ok = want.every((w, k) => {
      const got = words[i + k]
      return got === w || (!exact && distance(got, w) <= allowedTypos(w.length))
    })
    if (ok) return true
  }
  return false
}

/**
 * Grades a typed answer.
 * @param wrong The wrong options of the multiple-choice version, so that a
 *   "typo" that is really another option is never accepted.
 */
export function gradeTyped(input: string, spec: TypedAnswer, wrong: string[] = []): TypedResult {
  const answer = spec.accept[0]
  const text = compact(input)
  const words = normalize(input).split(' ').filter(Boolean)
  const keywords = spec.keywords ?? []
  const label = (k: string | string[]) => (Array.isArray(k) ? k[0] : k)
  const result = (verdict: TypedVerdict, missing: string[] = []): TypedResult => ({ verdict, answer, missing })

  if (!text) return result('wrong', keywords.map(label))
  if (spec.reject?.some((r) => hasPhrase(words, r, true))) return result('wrong')

  // 1. Whole answer
  if (spec.accept.some((a) => compact(a) === text)) return result('right')

  // 2. Every keyword is there
  const missing = keywords.filter((k) => !(Array.isArray(k) ? k : [k]).some((p) => hasPhrase(words, p, !!spec.exact)))
  if (keywords.length && !missing.length) return result('right')

  // 3. Whole answer with a spelling mistake, if it is not closer to a wrong option
  if (!spec.exact) {
    const best = Math.min(...spec.accept.map((a) => distance(compact(a), text)))
    const nearWrong = Math.min(Infinity, ...wrong.map((w) => distance(compact(w), text)))
    const maxLen = Math.max(...spec.accept.map((a) => compact(a).length))
    if (best > 0 && best <= allowedTypos(Math.min(maxLen, text.length)) && best < nearWrong) return result('typo')
  }

  // 4. Some keywords
  if (keywords.length) return result(missing.length < keywords.length ? 'partial' : 'wrong', missing.map(label))
  return result('wrong')
}
