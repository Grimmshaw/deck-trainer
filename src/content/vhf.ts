// VHF & SMCP: the IMO Standard Marine Communication Phrases (Res. A.918(22)).
// Message markers, standard wheel and engine orders, and numbers on the radio.
// The phonetic alphabet comes from the letter flags (flags/flags.tsx).
// Added 22 Oct 2026 – waiting for Robin's review.

export type Marker = 'QUESTION' | 'ANSWER' | 'REQUEST' | 'INFORMATION' | 'INTENTION' | 'WARNING' | 'ADVICE' | 'INSTRUCTION'

export const MARKERS: Marker[] = ['QUESTION', 'ANSWER', 'REQUEST', 'INFORMATION', 'INTENTION', 'WARNING', 'ADVICE', 'INSTRUCTION']

/** What each message marker is for (SMCP, General, message markers) */
export const MARKER_USE: Record<Marker, string> = {
  QUESTION: 'asks for information',
  ANSWER: 'is the reply to a question',
  REQUEST: 'asks for action from others, or for assistance',
  INFORMATION: 'gives observed facts, situations and the like',
  INTENTION: 'tells others about navigational action you are about to take',
  WARNING: 'tells others about a danger',
  ADVICE: 'tells others what you suggest – they decide whether to follow it',
  INSTRUCTION: 'must be followed – only a station with authority (for example a VTS or a naval vessel) may use it',
}

/** The marker most easily mixed up with each one, always among the wrong options */
export const MARKER_CONFUSED: Record<Marker, Marker> = {
  QUESTION: 'REQUEST',
  ANSWER: 'INFORMATION',
  REQUEST: 'QUESTION',
  INFORMATION: 'WARNING',
  INTENTION: 'INFORMATION',
  WARNING: 'INFORMATION',
  ADVICE: 'INSTRUCTION',
  INSTRUCTION: 'ADVICE',
}

export interface MarkerSituation {
  id: string
  /** The situation */
  text: string
  /** What is said after the marker */
  says: string
  marker: Marker
}

export const MARKER_SITUATIONS: MarkerSituation[] = [
  { id: 'q-intent', text: 'You want to know what the vessel ahead of you in the narrow channel is going to do.', says: 'What are your intentions?', marker: 'QUESTION' },
  { id: 'q-pilot', text: 'You call the pilot station to find out when the pilot will board.', says: 'What is the time of pilot boarding?', marker: 'QUESTION' },
  { id: 'a-draft', text: 'The VTS has asked for your draft, and you reply.', says: 'My present maximum draft is zero-eight decimal five metres.', marker: 'ANSWER' },
  { id: 'r-tugs', text: 'You need tugs for berthing and call the port.', says: 'I require two tugs.', marker: 'REQUEST' },
  { id: 'r-overtake', text: 'You want the vessel ahead to keep to the starboard side of the fairway so that you can overtake her.', says: 'Keep to the starboard side of the fairway. I wish to overtake you on your port side.', marker: 'REQUEST' },
  { id: 'i-report', text: 'You pass a reporting point and tell the VTS, which did not ask.', says: 'I have passed buoy number five.', marker: 'INFORMATION' },
  { id: 'i-eta', text: 'You tell the port your expected time of arrival at the pilot station.', says: 'My ETA at the pilot station is zero-six-zero-zero UTC.', marker: 'INFORMATION' },
  { id: 'in-alter', text: 'You tell the ships around you that you are going to alter course to starboard to pass an anchored vessel.', says: 'I will alter course to starboard.', marker: 'INTENTION' },
  { id: 'in-anchor', text: 'You tell the VTS that you are going to anchor in the waiting anchorage.', says: 'I will anchor in anchorage Alfa.', marker: 'INTENTION' },
  { id: 'w-container', text: 'You tell other traffic that a container is drifting in the fairway.', says: 'Container adrift in the fairway, in position two cables north of buoy number three.', marker: 'WARNING' },
  { id: 'w-unlit', text: 'You tell other traffic that a buoy is not showing its light.', says: 'Buoy number three unlit.', marker: 'WARNING' },
  { id: 'adv-speed', text: 'As VTS operator you suggest to a ship that she reduces speed because of a dredger ahead. It is up to her master.', says: 'Reduce speed. Dredger working in the fairway two miles ahead of you.', marker: 'ADVICE' },
  { id: 'ins-stop', text: 'As VTS operator, with the authority to do so, you order a ship to wait outside the breakwater because the fairway is closed.', says: 'Do not enter the fairway. Wait outside the breakwater.', marker: 'INSTRUCTION' },
  { id: 'ins-navy', text: 'A naval vessel guarding a firing exercise tells you that you must not enter the area.', says: 'Do not enter the exercise area. Alter course to starboard.', marker: 'INSTRUCTION' },
]

export interface Order {
  id: string
  /** The order as spoken */
  order: string
  meaning: string
  kind: 'wheel' | 'engine'
  /** Orders that look alike are never wrong options for each other in Match pairs */
  group: string
}

// SMCP Part A2/1: standard wheel orders and engine orders
export const ORDERS: Order[] = [
  { id: 'midships', order: 'MIDSHIPS', meaning: 'Rudder amidships – zero degrees', kind: 'wheel', group: 'midships' },
  { id: 'port15', order: 'PORT FIFTEEN', meaning: 'Put the rudder 15 degrees to port', kind: 'wheel', group: 'angle' },
  { id: 'hardstbd', order: 'HARD-A-STARBOARD', meaning: 'Put the rudder hard over to starboard – full rudder', kind: 'wheel', group: 'angle' },
  { id: 'ease10', order: 'EASE TO TEN', meaning: 'Reduce the rudder angle to 10 degrees and hold it there', kind: 'wheel', group: 'ease' },
  { id: 'steady', order: 'STEADY', meaning: 'Reduce the swing of the ship as quickly as possible', kind: 'wheel', group: 'steady' },
  {
    id: 'steadyas',
    order: 'STEADY AS SHE GOES',
    meaning: 'Steer a steady course on the compass heading at the moment of the order',
    kind: 'wheel',
    group: 'steady',
  },
  { id: 'nothingport', order: 'NOTHING TO PORT', meaning: 'Do not let the ship go to port of the ordered course', kind: 'wheel', group: 'nothing' },
  { id: 'steer', order: 'STEER ONE-TWO-FIVE', meaning: 'Steer the course 125 degrees', kind: 'wheel', group: 'steer' },
  { id: 'finwheel', order: 'FINISHED WITH WHEEL', meaning: 'No more wheel orders', kind: 'wheel', group: 'finished' },
  { id: 'sbengine', order: 'STAND BY ENGINE', meaning: 'Get the engine ready for manoeuvring', kind: 'engine', group: 'engine' },
  { id: 'finengine', order: 'FINISHED WITH ENGINE', meaning: 'The engine is no longer required', kind: 'engine', group: 'finished' },
  { id: 'deadslow', order: 'DEAD SLOW AHEAD', meaning: 'The slowest ahead engine setting', kind: 'engine', group: 'engine' },
]

// ---------- Numbers on the radio ----------

const DIGITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

/** "095" → "zero-nine-five": SMCP says numbers digit by digit */
export const digitByDigit = (s: string) => [...s].map((d) => DIGITS[Number(d)]).join('-')

/** 0–99 in words: 95 → "ninety-five" */
export function words99(n: number): string {
  if (n < 10) return DIGITS[n]
  if (n < 20) return TEENS[n - 10]
  return TENS[Math.floor(n / 10)] + (n % 10 ? `-${DIGITS[n % 10]}` : '')
}

/** 0–999 in words: 230 → "two hundred and thirty" */
export function words999(n: number): string {
  const h = Math.floor(n / 100)
  const rest = n % 100
  if (!h) return words99(rest)
  return `${DIGITS[h]} hundred${rest ? ` and ${words99(rest)}` : ''}`
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export interface NumberQuestion {
  prompt: string
  right: string
  wrong: string[]
  why: string
}

/** How do you say a course on the radio? Courses are always three digits. */
export function courseQuestion(course: number): NumberQuestion {
  const s = String(course).padStart(3, '0')
  const right = cap(digitByDigit(s))
  const wrong = new Set<string>([cap(words999(course)), cap(digitByDigit(String(course)))])
  // "two-thirty" style: first digit, then the rest as a number
  if (course >= 100) wrong.add(`${cap(DIGITS[Math.floor(course / 100)])}-${words99(course % 100)}`)
  else wrong.add(`Zero ${words99(course)}`)
  wrong.add(`${cap(words99(Math.floor(course / 10)))} ${DIGITS[course % 10]}`)
  return {
    prompt: `You tell another ship that your course is ${s}°. How do you say the number?`,
    right,
    wrong: [...wrong].filter((w) => w !== right).slice(0, 3),
    why: `SMCP: numbers are spoken digit by digit, so ${s} is "${digitByDigit(s)}". Courses are always given with three digits, in 360-degree notation from north (true north unless otherwise stated).`,
  }
}

/** How do you say a time on the radio? */
export function timeQuestion(hour: number, minute: number): NumberQuestion {
  const hh = String(hour).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  const right = `${cap(digitByDigit(hh + mm))} UTC`
  const h12 = hour % 12 || 12
  return {
    prompt: `You report your ETA, ${hh}:${mm} UTC, to the VTS. How do you say it?`,
    right,
    wrong: [
      `${cap(words99(hour))} ${minute ? words99(minute) : 'hundred'} UTC`,
      `${cap(words99(h12))} ${minute ? words99(minute) : "o'clock"} ${hour < 12 ? 'a.m.' : 'p.m.'}`,
      cap(digitByDigit(hh + mm)),
    ],
    why: `SMCP: times are given in the 24-hour notation, digit by digit, and you always say whether it is UTC, zone time or local shore time: "${digitByDigit(hh + mm)} UTC".`,
  }
}

/** Old (WW2) spelling words, as believable wrong options for the phonetic alphabet */
export const OLD_ALPHABET: Record<string, string> = {
  A: 'Able',
  B: 'Baker',
  D: 'Dog',
  E: 'Easy',
  F: 'Fox',
  G: 'George',
  H: 'How',
  I: 'Item',
  J: 'Jig',
  K: 'King',
  L: 'Love',
  N: 'Nan',
  O: 'Oboe',
  P: 'Peter',
  Q: 'Queen',
  R: 'Roger',
  S: 'Sugar',
  T: 'Tare',
  U: 'Uncle',
  W: 'William',
  Y: 'Yoke',
  Z: 'Zebra',
}
