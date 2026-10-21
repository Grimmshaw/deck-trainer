// "Which signal do you use?" and "Which DSC category?" – distress, urgency and
// safety situations (Radio Regulations, GMDSS). Added 15 Oct 2026 – waiting for
// Robin's review.

export type Priority = 'mayday' | 'panpan' | 'securite' | 'relay'
export type DscCategory = 'distress' | 'urgency' | 'safety' | 'routine'

export const PRIORITY_TEXT: Record<Priority, string> = {
  mayday: 'MAYDAY – distress',
  panpan: 'PAN-PAN – urgency',
  securite: 'SÉCURITÉ – safety',
  relay: 'MAYDAY RELAY',
}

export const DSC_TEXT: Record<DscCategory, string> = {
  distress: 'Distress',
  urgency: 'Urgency',
  safety: 'Safety',
  routine: 'Routine',
}

export interface RadioSituation {
  id: string
  text: string
  priority: Priority
  /** The DSC category for the alert or announcement, if it is also asked that way */
  dsc?: DscCategory
  why: string
}

const WHY = {
  mayday: 'MAYDAY is used when the ship or a person is in grave and imminent danger and needs immediate assistance.',
  panpan: 'PAN-PAN is used for a very urgent message about the safety of a ship or a person, when there is no grave and imminent danger.',
  securite: 'SÉCURITÉ is used for an important navigational or meteorological warning.',
  relay: 'MAYDAY RELAY is sent for another vessel in distress that cannot send the alert herself, or when her distress call has not been answered and you cannot help.',
}

export const RADIO_SITUATIONS: RadioSituation[] = [
  { id: 'fire', text: 'A fire in the engine room is out of control and you are preparing to abandon ship.', priority: 'mayday', dsc: 'distress', why: WHY.mayday },
  { id: 'sinking', text: 'Your ship is taking in water faster than the pumps can handle and is sinking.', priority: 'mayday', dsc: 'distress', why: WHY.mayday },
  { id: 'rocks', text: 'Your yacht has lost her mast, the engine will not start and she is drifting onto rocks 1 nm away.', priority: 'mayday', why: WHY.mayday },
  { id: 'medical', text: 'A crew member is seriously ill and needs medical advice and maybe evacuation. The ship is not in danger.', priority: 'panpan', dsc: 'urgency', why: WHY.panpan },
  { id: 'drifting', text: 'Your engine has failed far from land in good weather. You are drifting slowly, there is no immediate danger, but you need a tow.', priority: 'panpan', why: WHY.panpan },
  { id: 'container', text: 'You see a large floating container that is a danger to other ships, and want to warn them.', priority: 'securite', dsc: 'safety', why: WHY.securite },
  { id: 'gale', text: 'A coast station is about to broadcast a gale warning. Which signal does the broadcast start with?', priority: 'securite', why: WHY.securite },
  { id: 'unanswered', text: 'You hear a MAYDAY from a ship far away. No coast station answers and you cannot reach her in time to help.', priority: 'relay', why: WHY.relay },
  { id: 'seenFire', text: 'You see a fishing boat on fire nearby. Her crew do not seem to have called for help, and she cannot be reached on the radio.', priority: 'relay', why: WHY.relay },
  { id: 'berth', text: 'You call the port by DSC to ask about your berth.', priority: 'panpan', dsc: 'routine', why: 'An ordinary call is sent as a routine call – it has no priority signal.' },
]

/** Situations asked as "Which DSC category?" */
export const DSC_SITUATIONS = RADIO_SITUATIONS.filter((x) => x.dsc)
/** Situations asked as "Which signal do you use?" (not the routine call) */
export const PRIORITY_SITUATIONS = RADIO_SITUATIONS.filter((x) => x.dsc !== 'routine')
