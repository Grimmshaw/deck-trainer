// Shared background art: sky, sea, islands and waves.
// Used by both the buoyage and the navigation lights pictures.

export type Sky = 'clear' | 'hazy' | 'overcast' | 'evening'

export interface Island {
  x: number
  width: number
  height: number
  /** Relative heights along the island, 0–1 */
  profile: number[]
  far: boolean
}

export interface Backdrop {
  horizon: number
  sky: Sky
  islands: Island[]
}

export interface Palette {
  top: string
  bottom: string
  sea: string
  seaFar: string
  wave: string
  land: string
  landFar: string
}

export const SKY: Record<Sky | 'night', Palette> = {
  clear: { top: '#7fb6e6', bottom: '#dbeefa', sea: '#21618f', seaFar: '#4b8fbd', wave: '#7fbde3', land: '#5b7a5a', landFar: '#8fa6a4' },
  hazy: { top: '#b9cad6', bottom: '#eef2f4', sea: '#3e7390', seaFar: '#7ea2b6', wave: '#a9c9da', land: '#7f908a', landFar: '#b4c1c2' },
  overcast: { top: '#7f8d99', bottom: '#c3ccd3', sea: '#3b5262', seaFar: '#617a8a', wave: '#90a7b5', land: '#4f5d58', landFar: '#7d8b8d' },
  evening: { top: '#5c7fb0', bottom: '#f6c48e', sea: '#2b5272', seaFar: '#6f7f8f', wave: '#e8b98a', land: '#3f4a4d', landFar: '#7d7372' },
  night: { top: '#01040a', bottom: '#0b1728', sea: '#04101d', seaFar: '#081a2c', wave: '#0f2a47', land: '#03070d', landFar: '#060d18' },
}

/** Small seeded random number generator (mulberry32). Same seed = same numbers. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

/** Random sky and 0–3 islands. `width` is the picture width. */
export function randomBackdrop(r: () => number, width: number, horizonRange: [number, number]): Backdrop {
  const between = (min: number, max: number) => min + r() * (max - min)
  const skies: Sky[] = ['clear', 'clear', 'hazy', 'overcast', 'evening']
  const horizon = Math.round(between(horizonRange[0], horizonRange[1]))
  const sky = skies[Math.floor(r() * skies.length)]

  const islands: Island[] = []
  const count = Math.floor(between(0, 3.99))
  for (let i = 0; i < count; i++) {
    const w = between(0.2, 0.65) * width
    const points = 4 + Math.floor(r() * 4)
    islands.push({
      x: between(-0.15 * width, width - w / 2),
      width: w,
      height: between(6, 26),
      profile: Array.from({ length: points }, () => between(0.35, 1)),
      far: r() < 0.5,
    })
  }
  // Far islands are drawn first
  islands.sort((a, b) => Number(b.far) - Number(a.far))
  return { horizon, sky, islands }
}

export function islandPath(isl: Island, horizon: number): string {
  const step = isl.width / (isl.profile.length + 1)
  let d = `M${isl.x} ${horizon + 1} `
  let prevX = isl.x
  let prevY = horizon
  isl.profile.forEach((p, i) => {
    const x = isl.x + step * (i + 1)
    const y = horizon - p * isl.height
    d += `Q${prevX + step / 2} ${Math.min(prevY, y) - 2} ${x} ${y} `
    prevX = x
    prevY = y
  })
  d += `Q${prevX + step / 2} ${prevY} ${isl.x + isl.width} ${horizon + 1} Z`
  return d
}

export function wavePath(y: number, scale: number, width: number): string {
  const len = 16 + 14 * scale
  const amp = 2 + 3 * scale
  let d = `M${-len} ${y} `
  for (let x = -len; x < width + len; x += len) d += `q${len / 2} ${-amp} ${len} 0 `
  return d
}
