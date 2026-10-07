import type { TheoryItem } from '../study/generators/theory'

// International Code of Signals – how flag signalling works. The first option is the correct one.
// Added 8 Oct 2026 – waiting for Robin's review.

export const FLAGS_THEORY: (TheoryItem & { id: string })[] = [
  {
    id: 'F1',
    q: 'What are single-letter signals in the International Code used for?',
    options: [
      'Very urgent, important or very common messages',
      'Only for messages between warships',
      'Only for medical questions',
      'Only in harbour',
    ],
    why: 'In the International Code of Signals the single-letter signals are allocated to messages that are very urgent, important or of very common use.',
    source: 'International Code of Signals',
  },
  {
    id: 'F2',
    q: 'Three-letter signals beginning with M belong to:',
    options: ['The medical section', 'The distress section', 'The manoeuvring section', 'The weather section'],
    why: 'The International Code has a medical section, where the signals are three-letter groups beginning with M.',
    source: 'International Code of Signals',
  },
  {
    id: 'F3',
    q: 'You want to hoist "AAB" but you only have one set of flags. What do you use for the second A?',
    options: ['The first substitute', 'The second substitute', 'The answering pennant', 'Flag A upside down'],
    why: 'A substitute repeats the flag in its position counted from the top of the hoist: the first substitute repeats the uppermost signal flag of that class, so A + 1st substitute + B = AAB.',
    source: 'International Code of Signals',
  },
  {
    id: 'F4',
    q: 'The receiving station hoists the answering pennant at the dip. What does that mean?',
    options: ['The signal has been seen', 'The signal has been understood', 'The signal is not understood', 'End of the conversation'],
    why: 'The answering pennant is hoisted at the dip when a hoist is seen, and close up when it is understood.',
    source: 'International Code of Signals',
  },
  {
    id: 'F5',
    q: 'Which two-flag signal is a distress signal under Annex IV of COLREG?',
    options: ['N over C', 'A over B', 'U over W', 'O over K'],
    why: 'Annex IV 1(f): the International Code signal of distress indicated by N.C. ("I am in distress and require immediate assistance").',
    source: 'COLREG Annex IV, ICS',
  },
  {
    id: 'F6',
    q: 'Which flag signals does STCW require an officer in charge of a navigational watch to know?',
    options: [
      'The single-letter signals of the International Code',
      'All two-letter and three-letter signals by heart',
      'Only flag A and flag B',
      'Only national flags',
    ],
    why: 'STCW Table A-II/1: the officer shall be able to use the International Code of Signals, and to transmit and receive by Morse light the distress signal SOS and the single-letter signals.',
    source: 'STCW A-II/1',
  },
]
