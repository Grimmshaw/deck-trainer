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
  // ---- Added 9 Oct 2026 (NEW 9 OCT) – waiting for Robin's review ----
  {
    id: 'ED',
    q: 'What does "ED" next to a charted danger mean?',
    options: ['Existence doubtful', 'Extreme danger', 'Exact depth', 'Eastern direction'],
    why: 'ED = existence doubtful: the danger has been reported but its existence has not been confirmed. Treat it as real.',
    source: 'INT 1 I1',
  },
  {
    id: 'SD',
    q: 'What does "SD" next to a sounding mean?',
    options: ['Sounding doubtful', 'Shallow depth', 'Safe depth', 'Swept depth'],
    why: 'SD = sounding doubtful: the depth may be less than charted.',
    source: 'INT 1 I2',
  },
  {
    id: 'PA',
    q: 'What does "PA" next to a charted danger mean?',
    options: ['Position approximate', 'Prohibited area', 'Pilot advised', 'Permanent anchorage'],
    why: 'PA = position approximate: the position has not been accurately determined or does not stay fixed.',
    source: 'INT 1 B7',
  },
  {
    id: 'PD',
    q: 'What does "PD" next to a charted danger mean?',
    options: ['Position doubtful', 'Prohibited depth', 'Pilot district', 'Port of departure'],
    why: 'PD = position doubtful: the danger has been reported in various positions and the position is not definitely determined.',
    source: 'INT 1 B8',
  },
  {
    id: 'Rep',
    q: 'What does "Rep" next to a charted danger mean?',
    options: ['Reported, but not confirmed by survey', 'Repaired', 'Repeated sounding', 'Representative depth'],
    why: 'Rep = reported (but not confirmed) – often with the year of the report, for example Rep (2019).',
    source: 'INT 1 I3',
  },
  {
    id: 'conspic',
    q: 'What does "conspic" next to a landmark mean?',
    options: ['Conspicuous – easy to see from seaward', 'Concealed', 'Conspicuous only by night', 'Under construction'],
    why: 'Conspic = conspicuous: the object is easily identified from seaward and good for position fixing. On paper charts conspicuous landmarks are written in capitals.',
    source: 'INT 1 E2',
  },
  {
    id: 'Iso',
    q: 'A light is charted as "Iso 4s". What does "Iso" mean?',
    options: [
      'Isophase – light and darkness of equal duration',
      'Isolated danger',
      'A light with one short flash',
      'An intermittent light shown only in fog',
    ],
    why: 'Iso = isophase: all durations of light and darkness are equal. Iso 4s = 2 s light, 2 s dark.',
    source: 'INT 1 P10',
  },
  {
    id: 'Oc',
    q: 'What does "Oc" mean in a light description?',
    options: [
      'Occulting – the light is on longer than it is off',
      'Ocean light',
      'A light that is off longer than it is on',
      'Obscured sector',
    ],
    why: 'Oc = occulting: the total duration of light in a period is longer than the total duration of darkness.',
    source: 'INT 1 P10',
  },
  {
    id: 'LFl',
    q: 'What does "LFl" mean in a light description?',
    options: ['Long-flashing – a flash of at least 2 seconds', 'Low-flashing – a weak light', 'Leading light', 'Light float'],
    why: 'LFl = long-flashing: a light whose flash is of not less than 2 seconds\' duration.',
    source: 'INT 1 P10',
  },
  {
    id: 'Al',
    q: 'A light is charted as "Al.WR". What does it mean?',
    options: [
      'Alternating – it shows white and red alternately',
      'White and red sectors',
      'All-round white light with a red topmark',
      'Aero light, white and red',
    ],
    why: 'Al = alternating: a light that shows different colours alternately, here white and red.',
    source: 'INT 1 P10',
  },
  {
    id: 'Dir',
    q: 'What does "Dir" mean in a light description?',
    options: [
      'Direction light – a narrow sector marking a direction to follow',
      'Directly ahead',
      'A light with a dimmer at night',
      'The light is disused',
    ],
    why: 'Dir = direction light: a light showing a narrow sector (often flanked by sectors of other colour or character) to mark a track to follow.',
    source: 'INT 1 P30',
  },
]
