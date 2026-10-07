import { useSyncExternalStore } from 'react'
import { load, save } from '../storage'

// "Silent mode": sound signals are shown as pictures (bars) instead of being played.
// Saved on the device and shared by every screen.

const KEY = 'deck.sound'
let silent = load(KEY, { silent: false }).silent
const listeners = new Set<() => void>()

export function isSilent(): boolean {
  return silent
}

export function setSilent(value: boolean): void {
  silent = value
  save(KEY, { silent })
  listeners.forEach((l) => l())
}

export function useSilent(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => silent,
  )
}
