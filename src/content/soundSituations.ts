// "Which signal do you give?" – sound signals in situations (COLREG Rules 34–35).
// Each situation has one right signal from SOUND_SIGNALS. Added 15 Oct 2026 –
// waiting for Robin's review.

export interface SoundSituation {
  id: string
  /** What is happening; the question ends with "Which signal do you give?" (or `ask`) */
  text: string
  /** Id of the right signal in SOUND_SIGNALS */
  answer: string
  /** Asked differently, for example "What do you hear?" */
  ask?: string
  why?: string
}

export const SOUND_SITUATIONS: SoundSituation[] = [
  // In sight of one another (Rule 34)
  { id: 'altStbd', text: 'You are a power-driven vessel underway. Another vessel is in sight, and you alter course to starboard as the Rules require.', answer: 'stbd' },
  { id: 'altPort', text: 'You are a power-driven vessel underway, in sight of another vessel, and you alter course to port as the Rules allow.', answer: 'port' },
  { id: 'goAstern', text: 'You are a power-driven vessel in sight of another vessel and you put your engines astern to avoid her.', answer: 'astern' },
  { id: 'overStbd', text: 'In a narrow channel you want to overtake the vessel ahead, passing on HER starboard side. She has to act to let you pass.', answer: 'overtakeStbd' },
  { id: 'overPort', text: 'In a narrow channel you want to overtake the vessel ahead, passing on HER port side. She has to act to let you pass.', answer: 'overtakePort' },
  { id: 'agreeOver', text: 'In a narrow channel the vessel astern signals that she intends to overtake you. You agree.', answer: 'agree' },
  { id: 'doubtful', text: 'Another vessel is approaching and you cannot understand what she intends to do, or you doubt she is doing enough to avoid a collision.', answer: 'doubt' },
  { id: 'bendNear', text: 'You are nearing a bend in a channel where a hill hides vessels coming the other way.', answer: 'bend' },
  {
    id: 'bendAnswer',
    text: 'You are approaching a bend from the other side and hear one prolonged blast from behind the bend.',
    answer: 'bend',
    ask: 'How do you answer?',
    why: 'Rule 34(e): a vessel approaching the bend answers with one prolonged blast.',
  },
  // Restricted visibility (Rule 35)
  { id: 'fogMaking', text: 'Fog. You are a power-driven vessel making way through the water.', answer: 'fogPowerWay' },
  { id: 'fogStopped', text: 'Fog. You are a power-driven vessel underway, but you have stopped your engines and have no way through the water.', answer: 'fogPowerStopped' },
  { id: 'fogSail', text: 'Fog. You are a sailing vessel underway.', answer: 'fogLss' },
  { id: 'fogNuc', text: 'Fog. Your engine has broken down and you are not under command.', answer: 'fogLss' },
  { id: 'fogCbd', text: 'Fog. You are a deep-draught vessel constrained by your draught.', answer: 'fogLss' },
  { id: 'fogTowing', text: 'Fog. You are a tug towing a barge astern.', answer: 'fogLss' },
  { id: 'fogTowManned', text: 'Fog. You are on the last vessel of a tow, and she is manned.', answer: 'fogTowed' },
  { id: 'fogFishAnchor', text: 'Fog. You are a vessel engaged in fishing, at anchor.', answer: 'fogLss', why: 'Rule 35(d): a vessel engaged in fishing at anchor gives the same signal as when underway – not the anchor bell.' },
  { id: 'fogRamAnchor', text: 'Fog. You are a vessel restricted in your ability to manoeuvre, carrying out your work at anchor.', answer: 'fogLss', why: 'Rule 35(d): a RAM vessel at anchor gives one prolonged and two short blasts, not the anchor bell.' },
  { id: 'fogAnchorSmall', text: 'Fog. You are at anchor in a 60 m vessel.', answer: 'fogAnchor' },
  { id: 'fogAnchorBig', text: 'Fog. You are at anchor in a 180 m vessel.', answer: 'fogAnchorLarge' },
  { id: 'fogAgroundShip', text: 'Fog. Your 80 m vessel has run aground.', answer: 'fogAground' },
  { id: 'fogWarn', text: 'Fog. You are at anchor and your radar shows a vessel heading straight for you. You want to warn her of your position.', answer: 'fogAnchorWarn' },
  { id: 'fogPilotId', text: 'Fog. You are a pilot vessel on duty. Besides the signal of a power-driven vessel, you give your identity signal.', answer: 'fogPilot' },
]
