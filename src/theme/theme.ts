import { useSyncExternalStore } from 'react'
import { load, save } from '../storage'

// Light or dark look. "auto" follows the phone: light by day, dark when the
// phone switches to dark mode (for example at sunset).

export type ThemeChoice = 'auto' | 'light' | 'dark'

const KEY = 'deck.theme'
let choice: ThemeChoice = load(KEY, { choice: 'auto' as ThemeChoice }).choice
const listeners = new Set<() => void>()

const BAR = { light: '#eef2f6', dark: '#0b1d33' }

function apply() {
  const root = document.documentElement
  if (choice === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', choice)
  // Colour of the phone's status bar
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    const media = m.getAttribute('media') ?? ''
    const own = media.includes('light') ? BAR.light : BAR.dark
    m.setAttribute('content', choice === 'auto' ? own : BAR[choice])
  })
}
apply()

export function setTheme(c: ThemeChoice): void {
  choice = c
  save(KEY, { choice })
  apply()
  listeners.forEach((l) => l())
}

export function useTheme(): ThemeChoice {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => choice,
  )
}
