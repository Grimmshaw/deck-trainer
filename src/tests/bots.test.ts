import { describe, expect, it } from 'vitest'
import { isBot, isMetaIp } from '../../netlify/lib/bots'

const CHROME_ANDROID = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36'

describe('link scanners are not devices', () => {
  it('knows Meta networks (seen 22 Oct)', () => {
    expect(isMetaIp('2a03:2880:30ff:73::')).toBe(true)
    expect(isMetaIp('2a03:2880:11ff:72::')).toBe(true)
    expect(isMetaIp('173.252.87.1')).toBe(true)
    expect(isMetaIp('31.13.115.2')).toBe(true)
  })
  it('lets ordinary networks through', () => {
    expect(isMetaIp('112.198.10.20')).toBe(false) // Philippines
    expect(isMetaIp('49.36.1.1')).toBe(false) // India
    expect(isMetaIp('2001:db8::1')).toBe(false)
    expect(isMetaIp(undefined)).toBe(false)
  })
  it('stops crawler user agents and Meta IPs, keeps a phone', () => {
    expect(isBot('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', '1.2.3.4')).toBe(true)
    expect(isBot('Mozilla/5.0 HeadlessChrome/131', '1.2.3.4')).toBe(true)
    expect(isBot('', '1.2.3.4')).toBe(true)
    expect(isBot(CHROME_ANDROID, '2a03:2880:ff:43::')).toBe(true)
    expect(isBot(CHROME_ANDROID, '112.198.10.20')).toBe(false)
  })
})
