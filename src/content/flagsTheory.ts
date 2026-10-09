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
  // ---- Added 9 Oct 2026 (NEW 9 OCT) – waiting for Robin's review ----
  {
    id: 'F7',
    q: 'In the International Code of Signals, two-letter signals belong to:',
    options: ['The general section', 'The medical section', 'The distress section only', 'Signals between warships'],
    why: 'The Code has single-letter signals for very urgent, important or common messages, two-letter signals for the general section, and three-letter signals beginning with M for the medical section.',
    source: 'International Code of Signals',
  },
  {
    id: 'F8',
    q: 'How is a flag hoist read?',
    options: ['From the top downwards', 'From the bottom upwards', 'From the outside inwards', 'In any order'],
    why: 'A hoist is read from the top downwards. That is why a substitute repeats the flag counted from the top of the hoist.',
    source: 'International Code of Signals',
  },
  {
    id: 'F9',
    q: 'How many substitutes are there in a set of International Code flags?',
    options: ['Three', 'Two', 'Four', 'Ten'],
    why: 'A set has 26 alphabetical flags, 10 numeral pennants, 3 substitutes and the answering pennant.',
    source: 'International Code of Signals',
  },
  {
    id: 'F10',
    q: 'How are numbers signalled with flags in the International Code?',
    options: ['With the numeral pennants 0–9', 'With the letter flags A–J', 'By hoisting the flag several times', 'With the substitutes'],
    why: 'The International Code has ten numeral pennants, 0 to 9.',
    source: 'International Code of Signals',
  },
  {
    id: 'F11',
    q: 'What does the two-letter signal UW mean?',
    options: [
      'Thank you for your co-operation. I wish you a pleasant voyage',
      'I am abandoning my vessel',
      'I require a pilot',
      'Stop carrying out your intentions',
    ],
    why: 'UW: "Thank you very much for your co-operation. I wish you a pleasant voyage." A common courtesy signal, for example when a pilot leaves.',
    source: 'International Code of Signals',
  },
  {
    id: 'F12',
    q: 'What does the two-letter signal AC mean?',
    options: ['I am abandoning my vessel', 'I need a doctor', 'Man overboard', 'I require immediate assistance'],
    why: 'AC: "I am abandoning my vessel."',
    source: 'International Code of Signals',
  },
  {
    id: 'F13',
    q: 'What does the two-letter signal AN mean?',
    options: ['I need a doctor', 'I am abandoning my vessel', 'I am on fire', 'I require a tug'],
    why: 'AN: "I need a doctor." Detailed medical signals are three-letter groups beginning with M.',
    source: 'International Code of Signals',
  },
  {
    id: 'F14',
    q: 'What does the two-letter signal CB mean?',
    options: ['I require immediate assistance', 'I am abandoning my vessel', 'I need a doctor', 'I am dragging my anchor'],
    why: 'CB: "I require immediate assistance."',
    source: 'International Code of Signals',
  },
  {
    id: 'F15',
    q: 'Which two-letter signal means "Man overboard. Please take action to pick him up"?',
    options: ['GW', 'AC', 'NC', 'UW'],
    why: 'GW: "Man overboard. Please take action to pick him up (position to be indicated if necessary)." Flag O alone also means "Man overboard".',
    source: 'International Code of Signals',
  },
  {
    id: 'F16',
    q: 'Where is the courtesy flag of the country you are visiting normally flown?',
    options: ['At the starboard yardarm or spreader', 'At the stern, instead of the ensign', 'At the port yardarm', 'At the bow'],
    why: 'The courtesy flag (the visited country\'s flag) is flown at the starboard yardarm or starboard spreader, the position of honour.',
    source: 'Flag etiquette',
  },
]
