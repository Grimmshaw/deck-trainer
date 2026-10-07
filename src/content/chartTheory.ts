import type { TheoryItem } from '../study/generators/theory'

// Chart abbreviations and terms (INT 1). The first option is the correct one.
// Added 8 Oct 2026 – waiting for Robin's review.

const seabed = (id: string, abbr: string, right: string, wrong: string[]): TheoryItem & { id: string } => ({
  id,
  q: `Nature of the seabed: what does "${abbr}" mean on a chart?`,
  options: [right, ...wrong],
  why: `INT 1 section J: ${abbr} = ${right.toLowerCase()}.`,
  source: 'INT 1 J',
})

export const CHART_THEORY: (TheoryItem & { id: string })[] = [
  seabed('S', 'S', 'Sand', ['Stones', 'Shells', 'Silt']),
  seabed('M', 'M', 'Mud', ['Marl', 'Mussels', 'Moorings']),
  seabed('R', 'R', 'Rock', ['Rubble', 'Reef', 'Restricted']),
  seabed('G', 'G', 'Gravel', ['Grass', 'Granite', 'Ground swell']),
  seabed('Sh', 'Sh', 'Shells', ['Shingle', 'Shoal', 'Sand and hard']),
  seabed('St', 'St', 'Stones', ['Sand', 'Steep', 'Stream']),
  seabed('Cy', 'Cy', 'Clay', ['Coral', 'Cobbles', 'Cay']),
  seabed('Co', 'Co', 'Coral', ['Cobbles', 'Clay', 'Cove']),
  seabed('Wd', 'Wd', 'Weed (including kelp)', ['Wood', 'Wreckage', 'Wide']),
  {
    id: 'datum',
    q: 'Depths (soundings) on a chart are given below:',
    options: ['Chart datum', 'Mean high water springs', 'Mean sea level', 'The keel of a typical ship'],
    why: 'Soundings and drying heights are referred to chart datum, which on modern charts is usually close to Lowest Astronomical Tide (LAT).',
    source: 'INT 1 H',
  },
  {
    id: 'lat',
    q: 'On most modern charts, chart datum is approximately:',
    options: ['Lowest Astronomical Tide (LAT)', 'Mean sea level', 'Mean high water springs', 'Highest Astronomical Tide'],
    why: 'Chart datum is chosen so that the tide will seldom fall below it; most modern charts use a level approximately at LAT.',
    source: 'INT 1 H',
  },
  {
    id: 'elev',
    q: 'A light is charted as "Fl(3) WRG 15s 21m 12M". What does "21m" mean?',
    options: [
      'The elevation of the light above the height datum (usually MHWS)',
      'The height of the tower from the ground',
      'The range of the light in metres',
      'The depth of water at the light',
    ],
    why: 'The elevation is the height of the light\'s focal plane above the height datum, usually MHWS (or MHHW). 12M is the nominal range in nautical miles and 15s the period.',
    source: 'INT 1 P',
  },
  {
    id: 'range',
    q: 'A light is charted as "Fl(3) WRG 15s 21m 12M". What does "12M" mean?',
    options: ['The nominal range is 12 nautical miles', 'The light is 12 m high', 'There are 12 flashes per minute', 'The light is 12 miles from the coast'],
    why: 'The capital M after the figure is the range in nautical miles. On international charts it is the nominal range.',
    source: 'INT 1 P',
  },
  {
    id: 'magenta',
    q: 'Which colour is used on paper charts for light flares, cables and the limits of many restricted areas?',
    options: ['Magenta', 'Green', 'Black', 'Yellow'],
    why: 'Magenta is used for lights, radio and radar aids, cables, pipelines and many limits and routeing features, so they stand out from the black and blue.',
    source: 'INT 1',
  },
]
