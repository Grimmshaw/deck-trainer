import type { TheoryItem } from '../study/generators/theory'

// Sound and light signal theory (COLREG Part D). The first option is the correct one.
// Added 8 Oct 2026 – waiting for Robin's review.

export const SOUND_THEORY: (TheoryItem & { id: string })[] = [
  {
    id: 'S32b',
    q: 'How long is a "short blast"?',
    options: ['About 1 second', 'About 3 seconds', '4 to 6 seconds', 'Half a second'],
    why: 'Rule 32(b): the word "short blast" means a blast of about one second\'s duration.',
    source: 'Rule 32(b)',
  },
  {
    id: 'S32c',
    q: 'How long is a "prolonged blast"?',
    options: ['From 4 to 6 seconds', 'About 1 second', 'At least 10 seconds', '2 to 3 seconds'],
    why: 'Rule 32(c): the term "prolonged blast" means a blast of from four to six seconds\' duration.',
    source: 'Rule 32(c)',
  },
  {
    id: 'S33a',
    q: 'A vessel of 100 m or more shall be provided with:',
    options: ['A whistle, a bell and a gong', 'A whistle and a bell', 'A whistle only', 'A bell and a gong'],
    why: 'Rule 33(a): a vessel of 12 m or more shall have a whistle, of 20 m or more also a bell, and of 100 m or more also a gong whose tone cannot be confused with that of the bell.',
    source: 'Rule 33(a)',
  },
  {
    id: 'S33b',
    q: 'A vessel of less than 12 m:',
    options: [
      'Need not carry the sound appliances of Rule 33(a), but shall have some other means of making an efficient sound signal',
      'Must carry a whistle and a bell',
      'Never needs to make sound signals',
      'Must carry a gong',
    ],
    why: 'Rule 33(b): a vessel of less than 12 m is not obliged to carry the sound signalling appliances in 33(a), but if she does not, she shall be provided with some other means of making an efficient sound signal.',
    source: 'Rule 33(b)',
  },
  {
    id: 'S34a',
    q: 'When does a power-driven vessel give the manoeuvring signals of Rule 34(a) (for example one short blast)?',
    options: [
      'When vessels are in sight of one another and she is manoeuvring as authorised or required by the Rules',
      'Whenever she alters course, also in fog',
      'Only in narrow channels',
      'Only when the other vessel asks on VHF',
    ],
    why: 'Rule 34(a): when vessels are in sight of one another, a power-driven vessel underway, when manoeuvring as authorised or required by these Rules, shall indicate that manoeuvre by signals on her whistle.',
    source: 'Rule 34(a)',
  },
  {
    id: 'S34b',
    q: 'The light that may supplement the whistle signals of Rule 34(a): what is the minimum interval between successive signals?',
    options: ['10 seconds', '1 second', '2 minutes', '30 seconds'],
    why: 'Rule 34(b): flashes of about one second, the interval between flashes about one second, and the interval between successive signals not less than ten seconds. The light is an all-round white light visible at least 5 miles.',
    source: 'Rule 34(b)',
  },
  {
    id: 'S35a',
    q: 'In restricted visibility, how often shall a power-driven vessel making way sound her fog signal?',
    options: ['At intervals of not more than 2 minutes', 'Every 5 minutes', 'Every 30 seconds', 'Only when she hears another vessel'],
    why: 'Rule 35(a): a power-driven vessel making way through the water shall sound at intervals of not more than 2 minutes one prolonged blast.',
    source: 'Rule 35(a)',
  },
  {
    id: 'S35g',
    q: 'A vessel at anchor in fog wants to warn an approaching vessel. Which signal may she give in addition to the bell?',
    options: ['One short, one prolonged and one short blast', 'Five short blasts', 'One prolonged and two short blasts', 'Three short blasts'],
    why: 'Rule 35(g): a vessel at anchor may in addition sound three blasts in succession, namely one short, one prolonged and one short blast, to give warning of her position and of the possibility of collision.',
    source: 'Rule 35(g)',
  },
  {
    id: 'S35j',
    q: 'In restricted visibility, a vessel of less than 12 m:',
    options: [
      'Need not give the Rule 35 signals, but if she does not, shall make some other efficient sound signal at intervals of not more than 2 minutes',
      'Must give exactly the same signals as a large vessel',
      'Needs to make no sound signals at all',
      'Shall ring a bell every minute',
    ],
    why: 'Rule 35(j): a vessel of less than 12 m is not obliged to give the signals in Rule 35, but if she does not, she shall make some other efficient sound signal at intervals of not more than 2 minutes.',
    source: 'Rule 35(j)',
  },
  {
    id: 'S35k',
    q: 'In restricted visibility, a pilot vessel on duty may add an identity signal of:',
    options: ['Four short blasts', 'Two prolonged blasts', 'One short, one prolonged, one short', 'Five short blasts'],
    why: 'Rule 35(k): a pilot vessel when engaged on pilotage duty may, in addition to the signals in 35(a), (b) or (g), sound an identity signal consisting of four short blasts.',
    source: 'Rule 35(k)',
  },
  {
    id: 'S35e',
    q: 'In fog, the last vessel of a tow (if manned) sounds one prolonged and three short blasts. When?',
    options: [
      'Immediately after the signal made by the towing vessel, if practicable',
      'At the same time as the towing vessel',
      'Only when another vessel is heard',
      'Every minute, independently of the tug',
    ],
    why: 'Rule 35(e): a vessel towed, or if more than one the last vessel of the tow, if manned, shall at intervals of not more than 2 minutes sound four blasts – one prolonged followed by three short – when practicable immediately after the signal made by the towing vessel.',
    source: 'Rule 35(e)',
  },
]
