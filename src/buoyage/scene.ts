import { randomBackdrop, rng, type Backdrop } from '../art/scenery'
import type { BodyShape, Mark } from './marks'

// A scene is everything around the mark that can vary without changing
// what the mark means: its shape (among those IALA allows), distance,
// position, a slight roll, the sky and islands on the horizon.
// The same seed always gives the same scene.

export interface Scene extends Backdrop {
  shape: BodyShape
  /** 1 = close, 0.5 = far away */
  scale: number
  /** Horizontal position of the mark (viewBox units, 0–200) */
  x: number
  /** Roll in degrees. Fixed beacons never roll. */
  tilt: number
}

/** The clean look used in the gallery: closest view, no islands */
export function plainScene(mark: Mark): Scene {
  return { shape: mark.shapes[0], scale: 1, x: 100, tilt: 0, horizon: 150, sky: 'clear', islands: [] }
}

export function randomScene(mark: Mark, seed: number): Scene {
  const r = rng(seed)
  const between = (min: number, max: number) => min + r() * (max - min)

  const shape = mark.shapes[Math.floor(r() * mark.shapes.length)]
  const scale = between(0.5, 1)
  // Far-away marks can sit further out to the side
  const spread = 12 + 55 * (1 - scale)
  const backdrop = randomBackdrop(r, 200, [128, 168])

  return {
    ...backdrop,
    shape,
    scale,
    x: 100 + between(-spread, spread),
    tilt: shape === 'beacon' ? 0 : between(-6, 6),
  }
}
