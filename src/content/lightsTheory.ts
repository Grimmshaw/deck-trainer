import type { TheoryItem } from '../study/generators/theory'

// Lights and shapes theory (COLREG Part C). The first option is the correct one.
// Added 8 Oct 2026 – waiting for Robin's review.

export const LIGHTS_THEORY: (TheoryItem & { id: string })[] = [
  {
    id: 'L21d',
    q: 'What is a "towing light"?',
    options: [
      'A yellow light with the same characteristics as the sternlight (135°)',
      'A white all-round light at the masthead',
      'A yellow all-round flashing light',
      'A red light over the sternlight',
    ],
    why: 'Rule 21(d): a towing light is a yellow light having the same characteristics as the sternlight.',
    source: 'Rule 21(d)',
  },
  {
    id: 'L21e',
    q: 'Over what arc does an all-round light show?',
    options: ['360°', '225°', '135°', '112.5°'],
    why: 'Rule 21(e): an all-round light shows an unbroken light over an arc of the horizon of 360 degrees.',
    source: 'Rule 21(e)',
  },
  {
    id: 'L21f',
    q: 'A "flashing light" in the Rules flashes at regular intervals at a frequency of:',
    options: ['120 flashes or more per minute', '60 flashes per minute', '30 flashes per minute', 'One flash every 10 seconds'],
    why: 'Rule 21(f): a flashing light is a light flashing at regular intervals at a frequency of 120 flashes or more per minute.',
    source: 'Rule 21(f)',
  },
  {
    id: 'L22b',
    q: 'Minimum range of the sidelights of a vessel of 12 m or more but less than 50 m:',
    options: ['2 nautical miles', '3 nautical miles', '1 nautical mile', '5 nautical miles'],
    why: 'Rule 22(b): masthead light 5 miles (3 miles if under 20 m), sidelights 2 miles, sternlight, towing light and all-round lights 2 miles.',
    source: 'Rule 22(b)',
  },
  {
    id: 'L23b',
    q: 'An air-cushion vessel operating in the non-displacement mode shows, in addition to the lights of a power-driven vessel:',
    options: ['An all-round flashing yellow light', 'An all-round flashing red light', 'Two all-round red lights', 'A blue flashing light'],
    why: 'Rule 23(b): an air-cushion vessel in the non-displacement mode shall, in addition to the lights in Rule 23(a), exhibit an all-round flashing yellow light.',
    source: 'Rule 23(b)',
  },
  {
    id: 'L23c',
    q: 'A WIG craft taking off, landing or in flight near the surface shows, in addition to the lights of a power-driven vessel:',
    options: ['A high-intensity all-round flashing red light', 'An all-round flashing yellow light', 'Three all-round red lights', 'Nothing extra'],
    why: 'Rule 23(c): a WIG craft only when taking off, landing and in flight near the surface shall, in addition to the lights in Rule 23(a), exhibit a high-intensity all-round flashing red light.',
    source: 'Rule 23(c)',
  },
  {
    id: 'L23d',
    q: 'Instead of masthead light and sternlight, a power-driven vessel of less than 12 m may show:',
    options: ['An all-round white light and sidelights', 'Only a red sidelight', 'A flashing yellow light', 'Nothing at all'],
    why: 'Rule 23(d)(i): a power-driven vessel of less than 12 m may, in lieu of the lights in 23(a), exhibit an all-round white light and sidelights.',
    source: 'Rule 23(d)',
  },
  {
    id: 'L24e',
    q: 'A vessel being towed shows:',
    options: [
      'Sidelights and a sternlight – and a diamond by day if the tow is longer than 200 m',
      'Masthead lights, sidelights and a sternlight',
      'A towing light above the sternlight',
      'Two all-round red lights',
    ],
    why: 'Rule 24(e): a vessel or object being towed shall exhibit sidelights and a sternlight, and when the length of the tow exceeds 200 m, a diamond shape where it can best be seen.',
    source: 'Rule 24(e)',
  },
  {
    id: 'L25c',
    q: 'Which optional lights may a sailing vessel show at or near the top of the mast?',
    options: ['All-round red over all-round green', 'All-round green over all-round red', 'All-round white over red', 'Two all-round white lights'],
    why: 'Rule 25(c): a sailing vessel underway may, in addition to sidelights and sternlight, exhibit at or near the top of the mast two all-round lights in a vertical line, the upper red and the lower green. Not together with the combined lantern of 25(b).',
    source: 'Rule 25(c)',
  },
  {
    id: 'L25d',
    q: 'A sailing vessel of less than 7 m that cannot show sidelights and sternlight shall:',
    options: [
      'Have ready an electric torch or lighted lantern showing a white light, in time to prevent collision',
      'Show a red light at the masthead',
      'Stay in harbour at night',
      'Sound one prolonged blast every 2 minutes',
    ],
    why: 'Rule 25(d)(i): if practicable she shall exhibit the lights of 25(a) or (b); if not, she shall have ready at hand an electric torch or lighted lantern showing a white light, exhibited in sufficient time to prevent collision.',
    source: 'Rule 25(d)',
  },
  {
    id: 'L26b',
    q: 'A trawler of 50 m or more shall also show:',
    options: [
      'A masthead light abaft of and higher than the all-round green light',
      'A second all-round green light',
      'A yellow towing light',
      'A flashing white light',
    ],
    why: 'Rule 26(b)(ii): a masthead light abaft of and higher than the all-round green light. A vessel of less than 50 m is not obliged to, but may.',
    source: 'Rule 26(b)',
  },
  {
    id: 'L26c',
    q: 'A vessel fishing (not trawling) with gear extending more than 150 m horizontally shows, in the direction of the gear:',
    options: ['An all-round white light, or by day a cone point up', 'An all-round red light, or by day a ball', 'Two all-round green lights', 'A yellow flashing light'],
    why: 'Rule 26(c)(ii): when there is outlying gear extending more than 150 m horizontally from the vessel, an all-round white light or a cone apex upwards in the direction of the gear.',
    source: 'Rule 26(c)',
  },
  {
    id: 'L27d',
    q: 'A dredger restricted in her ability to manoeuvre shows on the side where another vessel may pass:',
    options: ['Two all-round green lights, or two diamonds by day', 'Two all-round red lights, or two balls by day', 'One all-round white light', 'Nothing extra'],
    why: 'Rule 27(d): in addition to the RAM lights, two all-round red lights or two balls on the side where the obstruction exists, and two all-round green lights or two diamonds on the side on which another vessel may pass.',
    source: 'Rule 27(d)',
  },
  {
    id: 'L27f',
    q: 'A vessel engaged in mine clearance shows three all-round green lights or three balls. How close is it dangerous to approach her?',
    options: ['Within 1000 m', 'Within 500 m', 'Within 200 m', 'Within 2 nautical miles'],
    why: 'Rule 27(f): these lights or shapes indicate that it is dangerous for another vessel to approach within 1000 m of the mine clearance vessel.',
    source: 'Rule 27(f)',
  },
  {
    id: 'L27b',
    q: 'A vessel restricted in her ability to manoeuvre is at anchor. What does she show?',
    options: [
      'The RAM lights or shapes plus the anchor lights or ball',
      'Only the anchor lights',
      'Only the RAM lights',
      'Three all-round red lights',
    ],
    why: 'Rule 27(b)(iv): when at anchor, in addition to the RAM lights or shapes, the lights or shape prescribed in Rule 30. (A dredger or diver under 27(d) shows the 27(d) signals instead.)',
    source: 'Rule 27(b)',
  },
  {
    id: 'L30c',
    q: 'Which vessels at anchor SHALL use their working lights to illuminate their decks?',
    options: ['Vessels of 100 m or more', 'Vessels of 50 m or more', 'All vessels at anchor', 'No vessel – it is always optional'],
    why: 'Rule 30(c): a vessel at anchor may, and a vessel of 100 m or more shall, also use the available working or equivalent lights to illuminate her decks.',
    source: 'Rule 30(c)',
  },
]
