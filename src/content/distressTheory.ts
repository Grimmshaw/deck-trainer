import type { TheoryItem } from '../study/generators/theory'

// Distress and GMDSS basics. The first option is the correct one.
// Added 8 Oct 2026 – waiting for Robin's review.

export const DISTRESS_THEORY: (TheoryItem & { id: string })[] = [
  {
    id: 'D1',
    q: 'Under Annex IV, the use of a distress signal for any other purpose than indicating distress and need of assistance is:',
    options: ['Prohibited', 'Allowed for training at sea', 'Allowed if you call the coast station first', 'Allowed in harbour'],
    why: 'Annex IV 2: the use or exhibition of any of the foregoing signals except for the purpose of indicating distress and need of assistance and the use of other signals which may be confused with them is prohibited.',
    source: 'COLREG Annex IV 2',
  },
  {
    id: 'D2',
    q: 'A piece of orange canvas with a black square and circle is used:',
    options: ['For identification from the air', 'To mark a wreck', 'As a quarantine signal', 'To show that a diver is down'],
    why: 'Annex IV 3(a): a piece of orange-coloured canvas with either a black square and circle or other appropriate symbol, for identification from the air.',
    source: 'COLREG Annex IV 3',
  },
  {
    id: 'D3',
    q: 'Which word starts a spoken distress call on the radio?',
    options: ['MAYDAY', 'PAN-PAN', 'SÉCURITÉ', 'SOS'],
    why: 'A distress call starts with MAYDAY spoken three times. PAN-PAN is the urgency signal and SÉCURITÉ the safety signal. Annex IV 1(e): the spoken word MAYDAY by radiotelephony.',
    source: 'COLREG Annex IV, Radio Regulations',
  },
  {
    id: 'D4',
    q: 'Which signal is used for an urgent message that is NOT distress, for example a person seriously ill on board?',
    options: ['PAN-PAN', 'MAYDAY', 'SÉCURITÉ', 'SEELONCE'],
    why: 'PAN-PAN (spoken three times) is the urgency signal: a very urgent message about the safety of a ship, aircraft or person, but no grave and imminent danger.',
    source: 'Radio Regulations',
  },
  {
    id: 'D5',
    q: 'On which VHF channel is a DSC distress alert sent?',
    options: ['Channel 70', 'Channel 16', 'Channel 13', 'Channel 6'],
    why: 'VHF DSC uses channel 70. The voice distress traffic that follows is on channel 16.',
    source: 'GMDSS',
  },
  {
    id: 'D6',
    q: 'On which MF frequency is a DSC distress alert sent?',
    options: ['2187.5 kHz', '2182 kHz', '518 kHz', '8414.5 kHz'],
    why: 'MF DSC distress alerting is on 2187.5 kHz; the voice distress traffic follows on 2182 kHz. 518 kHz is NAVTEX.',
    source: 'GMDSS',
  },
  {
    id: 'D7',
    q: 'On which frequency does a satellite EPIRB send its distress alert?',
    options: ['406 MHz', '121.5 MHz', '156.8 MHz', '9 GHz'],
    why: 'Cospas-Sarsat EPIRBs transmit on 406 MHz. Many also have a 121.5 MHz homing signal.',
    source: 'GMDSS',
  },
  {
    id: 'D8',
    q: 'How does an activated radar SART appear on a ship\'s X-band radar?',
    options: [
      'As a line of 12 dots outwards from the SART position',
      'As a single bright echo',
      'As a flashing Morse "D"',
      'It does not show on radar',
    ],
    why: 'A radar SART answers 9 GHz (X-band) radar pulses. On the screen it shows as a line of 12 dots extending outwards from its position; the dot closest to own ship marks the SART.',
    source: 'GMDSS',
  },
  {
    id: 'D9',
    q: 'Rule 37 says that a vessel in distress and requiring assistance shall:',
    options: [
      'Use or exhibit the signals described in Annex IV',
      'Only call on VHF channel 16',
      'Fly flag O',
      'Sound five short blasts',
    ],
    why: 'Rule 37: when a vessel is in distress and requires assistance she shall use or exhibit the signals described in Annex IV to these Regulations.',
    source: 'Rule 37',
  },
]
