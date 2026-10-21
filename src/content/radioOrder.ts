// The order of a spoken distress (MAYDAY) and urgency (PAN-PAN) message on VHF,
// sent after the DSC alert. Questions show four parts in a row, mixed up, and
// ask for the right order. Added 15 Oct 2026 – waiting for Robin's review.

export interface RadioPart {
  short: string
}

export interface RadioMessage {
  id: 'mayday' | 'panpan' | 'ack' | 'securite'
  title: string
  parts: string[]
  why: string
}

export const RADIO_MESSAGES: RadioMessage[] = [
  {
    id: 'mayday',
    title: 'MAYDAY (distress)',
    parts: [
      'MAYDAY, MAYDAY, MAYDAY',
      'THIS IS + name three times, call sign, MMSI',
      'MAYDAY + name, call sign, MMSI',
      'Position',
      'Nature of distress',
      'Assistance required',
      'Persons on board, other information',
      'OVER',
    ],
    why: 'The distress call (MAYDAY ×3, THIS IS + name ×3, call sign, MMSI) is followed by the distress message: MAYDAY, name, call sign and MMSI, position, nature of distress, assistance required, persons on board and any other useful information – then OVER.',
  },
  {
    id: 'panpan',
    title: 'PAN-PAN (urgency)',
    parts: [
      'PAN-PAN, PAN-PAN, PAN-PAN',
      'ALL STATIONS, ALL STATIONS, ALL STATIONS',
      'THIS IS + name three times, call sign, MMSI',
      'Position',
      'Nature of the urgency',
      'Assistance required',
      'OVER',
    ],
    why: 'An urgency message: PAN-PAN ×3, ALL STATIONS ×3 (or the station called), THIS IS + name ×3, call sign and MMSI, then position, the nature of the urgency, the assistance required and any other information – then OVER.',
  },
  {
    id: 'ack',
    title: 'acknowledgement of a MAYDAY',
    parts: ['MAYDAY', 'Name or call sign of the vessel in distress, three times', 'THIS IS + own name or call sign, three times', 'RECEIVED MAYDAY'],
    why: 'A ship that receives a distress message and can help acknowledges it by voice: MAYDAY, the name of the ship in distress ×3, THIS IS, own name ×3, RECEIVED MAYDAY – normally after a short wait, so that a coast station can answer first.',
  },
  {
    id: 'securite',
    title: 'SÉCURITÉ (safety)',
    parts: ['SÉCURITÉ, SÉCURITÉ, SÉCURITÉ', 'ALL STATIONS, ALL STATIONS, ALL STATIONS', 'THIS IS + name three times, call sign, MMSI', 'The warning', 'OUT'],
    why: 'A safety message: SÉCURITÉ ×3, ALL STATIONS ×3, THIS IS + name ×3, call sign and MMSI, then the navigational or meteorological warning, ending with OUT (no answer expected). A long message is often announced on channel 16 and sent on a working channel.',
  },
]

/** One item per window of four parts in a row: "mayday:0" … */
export const RADIO_ORDER_SETS = RADIO_MESSAGES.flatMap((m) => Array.from({ length: m.parts.length - 3 }, (_, i) => `${m.id}:${i}`))

export function radioWindow(set: string): { message: RadioMessage; parts: string[] } {
  const [id, start] = set.split(':')
  const message = RADIO_MESSAGES.find((m) => m.id === id)!
  return { message, parts: message.parts.slice(Number(start), Number(start) + 4) }
}

/** Three wrong orders of the four parts: neighbours swapped, or reversed */
export function wrongOrders(right: string[]): string[][] {
  const key = (o: string[]) => o.join('|')
  const seen = new Set([key(right)])
  const moves: string[][] = []
  for (let i = 0; i < right.length - 1; i++) {
    const o = [...right]
    ;[o[i], o[i + 1]] = [o[i + 1], o[i]]
    moves.push(o)
  }
  moves.push([...right].reverse(), [right[1], right[0], right[3], right[2]])
  const out: string[][] = []
  for (const o of moves.sort(() => Math.random() - 0.5)) {
    if (out.length === 3) break
    if (seen.has(key(o))) continue
    seen.add(key(o))
    out.push(o)
  }
  return out
}
