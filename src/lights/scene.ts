import { randomBackdrop, rng, type Backdrop } from '../art/scenery'

// Everything around the vessel that can vary without changing the answer:
// distance, position, sky and islands. The aspect (which side you see)
// is chosen by the quiz, because it changes which lights are visible.

export interface ShipScene extends Backdrop {
  /** Relative bearing of the observer from the vessel's bow */
  aspect: number
  /** 1 = close, 0.55 = far away */
  scale: number
  /** Horizontal position of the vessel (viewBox units, 0–300) */
  x: number
}

export function plainShipScene(aspect: number): ShipScene {
  return { aspect, scale: 1, x: 150, horizon: 110, sky: 'clear', islands: [] }
}

export function randomShipScene(aspect: number, seed: number): ShipScene {
  const r = rng(seed)
  const scale = 0.55 + r() * 0.45
  const spread = 10 + 70 * (1 - scale)
  return {
    ...randomBackdrop(r, 300, [92, 122]),
    aspect,
    scale,
    x: 150 + (r() * 2 - 1) * spread,
  }
}
