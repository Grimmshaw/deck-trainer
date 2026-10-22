// Link scanners and crawlers that open the app like a browser and would
// otherwise be counted as devices. Facebook checks every link in a new post
// (even posts still waiting for an admin) from its own servers, so a post
// in ten groups gave "ten new devices in the USA" within minutes.

/** User agents that are never a person */
const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|meta-externalagent|headlesschrome|lighthouse|preview|scanner|python|curl|wget/i

/** Meta's (Facebook's) own networks, AS32934 */
const META_V4 = [
  '31.13.24.0/21', '31.13.64.0/18', '45.64.40.0/22', '57.141.0.0/16', '57.144.0.0/14',
  '66.220.144.0/20', '69.63.176.0/20', '69.171.224.0/19', '74.119.76.0/22',
  '102.132.96.0/20', '103.4.96.0/22', '129.134.0.0/16', '147.75.208.0/20',
  '157.240.0.0/16', '163.70.128.0/17', '173.252.64.0/18', '179.60.192.0/22',
  '185.60.216.0/22', '185.89.216.0/22', '204.15.20.0/22',
]
const META_V6 = ['2a03:2880:', '2620:0:1c', '2620:10d:c0']

function v4ToInt(ip: string): number | null {
  const p = ip.split('.')
  if (p.length !== 4) return null
  let n = 0
  for (const x of p) {
    const v = Number(x)
    if (!Number.isInteger(v) || v < 0 || v > 255) return null
    n = n * 256 + v
  }
  return n
}

function inCidr(ip: number, cidr: string): boolean {
  const [base, bits] = cidr.split('/')
  const b = v4ToInt(base)
  if (b === null) return false
  const size = 2 ** (32 - Number(bits))
  return Math.floor(ip / size) === Math.floor(b / size)
}

export function isMetaIp(ip: string | undefined): boolean {
  if (!ip) return false
  const a = ip.trim().toLowerCase()
  if (a.includes(':')) return META_V6.some((p) => a.startsWith(p))
  const n = v4ToInt(a)
  return n !== null && META_V4.some((c) => inCidr(n, c))
}

export function isBot(userAgent: string | null | undefined, ip: string | undefined): boolean {
  if (!userAgent || BOT_UA.test(userAgent)) return true
  return isMetaIp(ip)
}
