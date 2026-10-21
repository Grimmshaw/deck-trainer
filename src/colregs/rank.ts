// Rule 18 (responsibilities between vessels): rank four vessels from the one
// with the most right of way to the one that keeps out of the way of all the others.
//
// The ranking only holds for vessels in sight of one another, in open water
// (no narrow channel or traffic separation scheme), and when no one is
// overtaking (Rule 13 comes first). NUC and RAM are on the same level, so they
// are never asked together. "Constrained by her draught" is not a give-way
// duty but "shall avoid impeding" (Rule 18(d)), which every vessel except NUC
// and RAM owes her.

export interface RankVessel {
  id: string
  /** Short name used in the answer options */
  short: string
  /** Full name, shown with the picture */
  name: string
  /** Id in the lights engine, for the day picture */
  vesselId: string
  level: number
}

const LEVELS: RankVessel[][] = [
  [
    { id: 'nuc', short: 'NUC', name: 'Not under command', vesselId: 'nuc', level: 0 },
    { id: 'ram', short: 'RAM', name: 'Restricted in her ability to manoeuvre', vesselId: 'ram', level: 0 },
  ],
  [{ id: 'cbd', short: 'CBD', name: 'Constrained by her draught', vesselId: 'cbd', level: 1 }],
  [
    { id: 'trawling', short: 'Trawler', name: 'Engaged in trawling', vesselId: 'trawling', level: 2 },
    { id: 'fishing', short: 'Fishing', name: 'Engaged in fishing', vesselId: 'fishing', level: 2 },
  ],
  [{ id: 'sailing', short: 'Sailing', name: 'Sailing vessel', vesselId: 'sailing', level: 3 }],
  [{ id: 'power', short: 'Power-driven', name: 'Power-driven vessel', vesselId: 'power', level: 4 }],
]

/** One item per level that is left out, so each item asks a different set of four */
export const RANK_SETS = LEVELS.map((_, i) => String(i))

export interface RankQuestion {
  /** In the right order: most right of way first */
  order: RankVessel[]
  /** Three wrong orders */
  wrong: RankVessel[][]
}

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

export function makeRankQuestion(set: string): RankQuestion {
  const skip = Number(set)
  const order = LEVELS.filter((_, i) => i !== skip).map((l) => pick(l))
  const key = (o: RankVessel[]) => o.map((v) => v.id).join()
  const seen = new Set([key(order)])
  const wrong: RankVessel[][] = []
  // Wrong orders: two neighbours swapped, or one vessel moved to another place
  const moves: RankVessel[][] = []
  for (let i = 0; i < order.length - 1; i++) {
    const o = [...order]
    ;[o[i], o[i + 1]] = [o[i + 1], o[i]]
    moves.push(o)
  }
  moves.push([...order].reverse())
  moves.push([order[1], order[0], order[3], order[2]])
  for (const o of moves.sort(() => Math.random() - 0.5)) {
    if (wrong.length === 3) break
    if (seen.has(key(o))) continue
    seen.add(key(o))
    wrong.push(o)
  }
  return { order, wrong }
}

export function rankText(o: RankVessel[]): string {
  return o.map((v) => v.short).join(' → ')
}
