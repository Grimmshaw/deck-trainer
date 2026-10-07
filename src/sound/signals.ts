// Sound signals, COLREG Rules 32–35, as data.
// A pattern is a list of sounds in order:
//   S = short blast (about 1 s), L = prolonged blast (4–6 s),
//   B = rapid ringing of the bell (about 5 s), b = one distinct stroke of the bell,
//   G = gong (sounded aft on vessels of 100 m or more at anchor).

export type Sound = 'S' | 'L' | 'B' | 'b' | 'G'

export type SignalContext = 'sight' | 'fog'

export interface SoundSignal {
  id: string
  pattern: Sound[]
  context: SignalContext
  meaning: string
  rule: string
  /** Extra detail shown after answering */
  note?: string
  /** Short blasts given quickly (the doubt signal) */
  rapid?: boolean
  /** Two prolonged blasts with about 2 s between them */
  stoppedGap?: boolean
}

export const SOUND_SIGNALS: SoundSignal[] = [
  // Manoeuvring signals – vessels in sight of one another (Rule 34)
  { id: 'stbd', pattern: ['S'], context: 'sight', meaning: 'I am altering my course to starboard', rule: 'Rule 34(a)' },
  { id: 'port', pattern: ['S', 'S'], context: 'sight', meaning: 'I am altering my course to port', rule: 'Rule 34(a)' },
  { id: 'astern', pattern: ['S', 'S', 'S'], context: 'sight', meaning: 'I am operating astern propulsion', rule: 'Rule 34(a)' },
  {
    id: 'overtakeStbd',
    pattern: ['L', 'L', 'S'],
    context: 'sight',
    meaning: 'I intend to overtake you on your starboard side',
    rule: 'Rule 34(c)(i)',
    note: 'Used in a narrow channel or fairway.',
  },
  {
    id: 'overtakePort',
    pattern: ['L', 'L', 'S', 'S'],
    context: 'sight',
    meaning: 'I intend to overtake you on your port side',
    rule: 'Rule 34(c)(i)',
    note: 'Used in a narrow channel or fairway.',
  },
  {
    id: 'agree',
    pattern: ['L', 'S', 'L', 'S'],
    context: 'sight',
    meaning: 'Agreement: the vessel about to be overtaken agrees',
    rule: 'Rule 34(c)(ii)',
  },
  {
    id: 'doubt',
    pattern: ['S', 'S', 'S', 'S', 'S'],
    context: 'sight',
    meaning: 'I fail to understand your intentions, or doubt that you are taking enough action to avoid collision',
    rule: 'Rule 34(d)',
    note: 'At least five short and rapid blasts. It may be supplemented by at least five short and rapid flashes.',
    rapid: true,
  },
  {
    id: 'bend',
    pattern: ['L'],
    context: 'sight',
    meaning: 'Approaching a bend or an area where other vessels may be hidden by an obstruction',
    rule: 'Rule 34(e)',
    note: 'An approaching vessel on the other side of the bend answers with one prolonged blast.',
  },
  // Signals in restricted visibility (Rule 35)
  {
    id: 'fogPowerWay',
    pattern: ['L'],
    context: 'fog',
    meaning: 'Power-driven vessel making way through the water',
    rule: 'Rule 35(a)',
    note: 'At intervals of not more than 2 minutes.',
  },
  {
    id: 'fogPowerStopped',
    pattern: ['L', 'L'],
    context: 'fog',
    meaning: 'Power-driven vessel underway but stopped, making no way through the water',
    rule: 'Rule 35(b)',
    note: 'About 2 seconds between the blasts, at intervals of not more than 2 minutes.',
    stoppedGap: true,
  },
  {
    id: 'fogLss',
    pattern: ['L', 'S', 'S'],
    context: 'fog',
    meaning:
      'Vessel not under command, restricted in her ability to manoeuvre, constrained by her draught, sailing, engaged in fishing, or towing or pushing',
    rule: 'Rule 35(c)',
    note: 'At intervals of not more than 2 minutes. Also used by a vessel engaged in fishing or restricted in her ability to manoeuvre when at anchor (35(d)).',
  },
  {
    id: 'fogTowed',
    pattern: ['L', 'S', 'S', 'S'],
    context: 'fog',
    meaning: 'Vessel being towed (the last vessel of the tow, if manned)',
    rule: 'Rule 35(e)',
    note: 'Given immediately after the signal of the towing vessel, if possible.',
  },
  {
    id: 'fogAnchor',
    pattern: ['B'],
    context: 'fog',
    meaning: 'Vessel at anchor (less than 100 m)',
    rule: 'Rule 35(g)',
    note: 'Rapid ringing of the bell for about 5 seconds at intervals of not more than one minute.',
  },
  {
    id: 'fogAnchorLarge',
    pattern: ['B', 'G'],
    context: 'fog',
    meaning: 'Vessel at anchor, 100 m or more',
    rule: 'Rule 35(g)',
    note: 'The bell is rung in the forepart, followed by rapid sounding of the gong in the after part.',
  },
  {
    id: 'fogAnchorWarn',
    pattern: ['S', 'L', 'S'],
    context: 'fog',
    meaning: 'Vessel at anchor warning an approaching vessel of her position',
    rule: 'Rule 35(g)',
    note: 'One short, one prolonged and one short blast, in addition to the bell.',
  },
  {
    id: 'fogAground',
    pattern: ['b', 'b', 'b', 'B', 'b', 'b', 'b'],
    context: 'fog',
    meaning: 'Vessel aground',
    rule: 'Rule 35(h)',
    note: 'Three separate and distinct strokes on the bell, rapid ringing, then three more strokes.',
  },
  {
    id: 'fogPilot',
    pattern: ['S', 'S', 'S', 'S'],
    context: 'fog',
    meaning: 'Pilot vessel on duty (identity signal)',
    rule: 'Rule 35(k)',
    note: 'Four short blasts, in addition to the signals for a power-driven vessel or a vessel at anchor.',
  },
]

/** Text form of a pattern, e.g. "— · ·" */
export function patternText(p: Sound[]): string {
  return p
    .map((s) => ({ S: '·', L: '—', B: 'bell', b: 'ding', G: 'gong' })[s])
    .join(' ')
}
