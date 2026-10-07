import { between, pick } from '../study/util'

// Rule 19 – conduct of vessels in restricted visibility.
// The other vessel is detected by radar alone, her bearing is steady and the
// range is closing, so a close-quarters situation is developing.
//
// Rule 19(d) says which alterations of course to AVOID:
//  (i)  an alteration to port for a vessel forward of the beam,
//       other than for a vessel being overtaken;
//  (ii) an alteration towards a vessel abeam or abaft the beam.
//
// The sectors below stay clear of the borderline just forward of the beam,
// and never put a vessel you are overtaking ahead, so only one alteration
// complies.

export type FogSector = 'ahead' | 'stbdBow' | 'portBow' | 'stbdBeam' | 'portBeam' | 'stbdQuarter' | 'portQuarter'

export const FOG_SECTORS: FogSector[] = ['ahead', 'stbdBow', 'portBow', 'stbdBeam', 'portBeam', 'stbdQuarter', 'portQuarter']

export const FOG_SECTOR_LABEL: Record<FogSector, string> = {
  ahead: 'Radar target ahead',
  stbdBow: 'Radar target on the starboard bow',
  portBow: 'Radar target on the port bow',
  stbdBeam: 'Radar target abeam to starboard',
  portBeam: 'Radar target abeam to port',
  stbdQuarter: 'Radar target abaft the starboard beam',
  portQuarter: 'Radar target abaft the port beam',
}

/** Relative bearings for each sector, + is starboard */
const RANGES: Record<FogSector, [number, number]> = {
  ahead: [-8, 8],
  stbdBow: [15, 60],
  portBow: [-60, -15],
  stbdBeam: [90, 90],
  portBeam: [-90, -90],
  stbdQuarter: [110, 160],
  portQuarter: [-160, -110],
}

export type FogAction = 'starboard' | 'port' | 'standOn' | 'signalOnly' | 'shortBlast'

export const FOG_ACTION_TEXT: Record<FogAction, string> = {
  starboard: 'Alter course to starboard in ample time',
  port: 'Alter course to port in ample time',
  standOn: 'Keep course and speed – she is the give-way vessel',
  signalOnly: 'Keep course and speed and just keep sounding your fog signal',
  shortBlast: 'Sound one short blast and alter course to starboard',
}

/** The only alteration that Rule 19(d) allows for a vessel on this bearing */
export function fogAction(bearing: number): 'starboard' | 'port' {
  // A vessel abeam or abaft the beam on the starboard side: do not turn towards her
  if (bearing >= 90) return 'port'
  // Forward of the beam (either side): do not turn to port.
  // Abeam or abaft the beam on the port side: do not turn towards her (to port).
  return 'starboard'
}

export interface FogScenario {
  sector: FogSector
  bearing: number
  /** Range in nautical miles */
  range: number
  /** Visibility in nautical miles */
  visibility: number
  action: 'starboard' | 'port'
}

export function makeFogScenario(sector: FogSector = pick(FOG_SECTORS)): FogScenario {
  const [lo, hi] = RANGES[sector]
  const bearing = Math.round(between(lo, hi))
  return {
    sector,
    bearing,
    range: Math.round(between(2.5, 5) * 10) / 10,
    visibility: pick([0.2, 0.3, 0.5, 0.5, 1]),
    action: fogAction(bearing),
  }
}

export function fogWhy(s: FogScenario): string {
  const ahead = Math.abs(s.bearing) < 90
  const rule = ahead
    ? 'Rule 19(d)(i): avoid an alteration of course to port for a vessel forward of the beam (other than one being overtaken).'
    : 'Rule 19(d)(ii): avoid an alteration of course towards a vessel abeam or abaft the beam.'
  return `${rule} In restricted visibility there is no stand-on or give-way vessel – both must take avoiding action in ample time, and the manoeuvring signals of Rule 34(a) are only for vessels in sight of one another. Reducing speed is always an option too.`
}

/** Wrong answers next to the right one */
export function fogDistractors(action: 'starboard' | 'port'): FogAction[] {
  return action === 'starboard' ? ['port', 'standOn', 'signalOnly'] : ['starboard', 'standOn', 'shortBlast']
}
