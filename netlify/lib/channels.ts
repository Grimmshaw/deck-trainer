// Readable names for the tracking codes (?src=…) used in links.
//
// Add a line here when you use a new code in a link. A code that is not in the
// list is still shown, named after its first part (in- = India, fb- = Facebook …).
// The code itself is shown in small text under the name.

export interface Channel {
  name: string
  group: string
}

const PH_RC = 'Review center · Philippines'
const PH = 'Training center · Philippines'
const IN = 'Institute · India'
const IN_WEB = 'Website · India'
const FB = 'Facebook group'
const WA = 'WhatsApp'

export const CHANNELS: Record<string, Channel> = {
  // Philippines – review centers (mail 21 Oct)
  'rc-compman': { name: 'CompMan Inc.', group: PH_RC },
  'rc-dman': { name: 'DMAN Maritime Review Center', group: PH_RC },
  'rc-stnicholas': { name: 'Saint Nicholas Maritime', group: PH_RC },
  'rc-orbit': { name: 'Orbit Marine Manila', group: PH_RC },
  'rc-cebugems': { name: 'Cebu GEMS', group: PH_RC },
  'rc-melearner': { name: 'Maritime E-Learner', group: PH_RC },
  'rc-iceberg': { name: 'Iceberg Maritime Review Center', group: PH_RC },
  'rc-kingspoint': { name: 'Kingspoint Maritime Services', group: PH_RC },
  // Philippines – training centers (mail 21 Oct, round 2)
  'ph-astc': { name: "AMOSUP Seamen's Training Center", group: PH },
  'ph-umtc': { name: 'United Marine Training Center (Marlow)', group: PH },
  'ph-mariana': { name: 'Mariana Academy of Maritime Studies', group: PH },

  // India – round 1 (mail 21 Oct)
  'in-cmmi': { name: 'Company of Master Mariners of India', group: IN },
  'in-mti': { name: 'MTI (SCI), Powai', group: IN },
  'in-cmg': { name: 'CMG Maritime Academy', group: IN },
  'in-ari': { name: 'ARI / SHAPE', group: IN },
  'in-mmti': { name: 'Mumbai Maritime Training Institute', group: IN },
  'in-simf': { name: 'SIMF Maritime Institute', group: IN },
  'in-massa': { name: 'MASSA Maritime Academy', group: IN },
  'in-imi': { name: 'International Maritime Institute', group: IN },
  'in-mnd': { name: 'Merchant Navy Decoded', group: IN_WEB },
  'in-skillsstation': { name: 'Skills Station', group: IN_WEB },
  'in-marineinsight': { name: 'Marine Insight', group: IN_WEB },
  'in-tolani': { name: 'Tolani Maritime Institute', group: IN },
  'in-aemtc': { name: 'Anglo-Eastern Maritime Training Centre', group: IN },
  'in-aema': { name: 'Anglo-Eastern Maritime Academy', group: IN },
  'in-himt': { name: 'HIMT, Chennai', group: IN },
  'in-hoon': { name: 'Hoon Maritime Institute', group: IN },
  'in-varren': { name: 'Training Ship Varren', group: IN },
  'in-geims': { name: 'Great Eastern Institute of Maritime Studies', group: IN },
  'in-cmc': { name: 'Coimbatore Marine College', group: IN },
  // India – rounds 2 and 3 (mail 21 Oct evening)
  'in-fosma-noida': { name: 'FOSMA Noida', group: IN },
  'in-fosma-kol': { name: 'FOSMA Kolkata', group: IN },
  'in-eurotech': { name: 'Euro Tech Maritime Academy, Kochi', group: IN },
  'in-natcom': { name: 'Natcom, Gurugram', group: IN },
  'in-sensea': { name: 'Sensea Maritime Academy, Kolkata', group: IN },
  'in-amet': { name: 'AMET University, Chennai', group: IN },
  'in-imu-nm': { name: 'IMU Navi Mumbai (TS Chanakya)', group: IN },
  'in-ni': { name: 'Nautical Institute – India branches', group: IN },
  'in-manet': { name: 'MANET, Pune', group: IN },
  'in-bpma': { name: 'B P Marine Academy, Navi Mumbai', group: IN },
  'in-vels': { name: 'Vels (VISTAS), Chennai', group: IN },

  // Denmark
  'dk-studenter': { name: 'Danish maritime students', group: 'Denmark' },

  // Facebook groups (21 Oct)
  'fb-deckcadets': { name: 'Deck Cadets', group: FB },
  'fb-marinong': { name: 'MARINONG Filipino (Seaman Worldwide)', group: FB },
  'fb-fsg': { name: 'Filipino Seamans Group', group: FB },
  'fb-cebuinstr': { name: 'CEBU Maritime Instructors and Assessors', group: FB },
  'fb-marinersworld': { name: 'The Mariners World', group: FB },
  'fb-dok': { name: 'Deck Officers Knowledge', group: FB },
  'fb-mk': { name: 'Maritime Knowledge', group: FB },
  'fb-ml': { name: 'Maritime learning', group: FB },
  'fb-ph': { name: 'Facebook – Philippines', group: FB },
  'fb-page': { name: 'Lanterna Facebook page', group: FB },

  // Facebook groups, posted by the Lanterna page (22 Oct)
  'fb-marinersworld2': { name: 'The Mariners World (2nd post)', group: FB },
  'fb-marinong2': { name: 'MARINONG Filipino (2nd post)', group: FB },
  'fb-seamanph': { name: 'Seaman PH', group: FB },
  'fb-legacy': { name: 'The Maritime Legacy', group: FB },
  'fb-mk2': { name: 'Maritime Knowledge (2nd post)', group: FB },
  'fb-ml2': { name: 'Maritime learning (2nd post)', group: FB },
  'fb-dcinterview': { name: 'Deck Cadet Interview Questions and Answers', group: FB },
  'fb-cebuinstr2': { name: 'CEBU Maritime Instructors (2nd post)', group: FB },
  'fb-dok2': { name: 'Deck Officers Knowledge (2nd post)', group: FB },
  'fb-in-2mo': { name: 'Second mates orals (India)', group: FB },
  'fb-in-delhi': { name: 'Delhi MMD mates orals (India)', group: FB },

  // WhatsApp (21 Oct)
  'wa-rajput': { name: 'Capt. N. S. Rajput (FOSMA Noida)', group: WA },
  'wa-deswal': { name: 'Capt. D. S. Deswal (FOSMA Noida)', group: WA },
  'wa-fosma-noida': { name: 'FOSMA Noida', group: WA },
  'wa-fosma-kol': { name: 'FOSMA Kolkata', group: WA },
  'wa-eurotech': { name: 'Euro Tech Maritime Academy', group: WA },
  'wa-sensea': { name: 'Sensea Maritime Academy', group: WA },
  'wa-natcom': { name: 'Natcom', group: WA },
  'wa-imi': { name: 'IMI Greater Noida', group: WA },
  'wa-atlas': { name: 'ATLAS Marine Review Center', group: WA },
  'wa-oways': { name: 'Oways Online', group: WA },

  // Other
  reddit: { name: 'Reddit – r/merchantmarine', group: 'Reddit' },
}

const PREFIXES: [string, string][] = [
  ['rc-', PH_RC],
  ['ph-', 'Philippines'],
  ['in-', 'India'],
  ['dk-', 'Denmark'],
  ['fb-', FB],
  ['wa-', WA],
  ['li-', 'LinkedIn'],
  ['tt-', 'TikTok'],
]

/** The readable name and group of a tracking code */
export function channel(code: string): Channel {
  const known = CHANNELS[code]
  if (known) return known
  const prefix = PREFIXES.find(([p]) => code.startsWith(p))
  if (prefix) {
    const rest = code.slice(prefix[0].length).replace(/-/g, ' ')
    return { name: rest.charAt(0).toUpperCase() + rest.slice(1), group: prefix[1] }
  }
  return { name: code, group: 'Other link' }
}
