import type { TheoryItem } from '../study/generators/theory'

// Morse code rules and procedure signals (International Code of Signals). The first option is the correct one.
// Added 8 Oct 2026 – waiting for Robin's review.

export const MORSE_THEORY: (TheoryItem & { id: string })[] = [
  {
    id: 'M1',
    q: 'How is SOS sent in Morse?',
    options: [
      'As one signal: · · · – – – · · · without spaces between the letters',
      'As three separate letters with normal spaces',
      'As S, O and S with a long pause after each',
      'As O S O',
    ],
    why: 'SOS is sent as a single signal (···–––···), not as three separate letters.',
    source: 'COLREG Annex IV 1(d), ICS',
  },
  {
    id: 'M2',
    q: 'How long is a dash compared with a dot?',
    options: ['Three dots', 'Two dots', 'Five dots', 'The same length'],
    why: 'In Morse code a dash is equal to three dots.',
    source: 'ICS – Morse signalling',
  },
  {
    id: 'M3',
    q: 'How long is the space between two words?',
    options: ['Seven dots', 'Three dots', 'One dot', 'Five dots'],
    why: 'The space between the parts of one letter is one dot, between two letters three dots, and between two words seven dots.',
    source: 'ICS – Morse signalling',
  },
  {
    id: 'M4',
    q: 'Which procedure signal is the general call, or the call for an unknown station?',
    options: ['AA AA AA …', 'AR', 'AS', 'EEEEE …'],
    why: 'AA AA AA etc. is the call for an unknown station or general call. The station answers with TTTT.',
    source: 'ICS – procedure signals',
  },
  {
    id: 'M5',
    q: 'What does the procedure signal AR mean?',
    options: ['Ending signal – end of transmission', 'Wait', 'Erase – error', 'Word received'],
    why: 'AR is the ending signal, sent as one signal at the end of a transmission.',
    source: 'ICS – procedure signals',
  },
  {
    id: 'M6',
    q: 'When receiving a message by flashing light, what do you send after each word you have received?',
    options: ['T', 'K', 'R', 'AR'],
    why: 'The receiving station answers each word with T ("word received"). R is "received" for the whole message.',
    source: 'ICS – procedure signals',
  },
  {
    id: 'M7',
    q: 'You make a mistake while sending. Which signal do you send?',
    options: ['The erase signal: a series of E', 'AS', 'AR', 'K'],
    why: 'EEEEE … is the erase signal. The receiving station answers with the same, and you send the last word again.',
    source: 'ICS – procedure signals',
  },
  {
    id: 'M8',
    q: 'What does the procedure signal AS mean?',
    options: ['Waiting signal', 'End of transmission', 'Call for unknown station', 'Erase signal'],
    why: 'AS is the waiting signal or period: "wait".',
    source: 'ICS – procedure signals',
  },
  {
    id: 'M9',
    q: 'Which Morse light signals does STCW require an officer in charge of a navigational watch to send and receive?',
    options: [
      'SOS and the single-letter signals of the International Code',
      'All two-letter signals',
      'Only SOS',
      'None – Morse light is no longer required',
    ],
    why: 'STCW Table A-II/1: ability to transmit and receive, by Morse light, the distress signal SOS and the single-letter signals in the International Code of Signals.',
    source: 'STCW A-II/1',
  },
]
