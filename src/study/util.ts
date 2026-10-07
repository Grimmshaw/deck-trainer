export function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Up to n random items from the list (no repeats) */
export function sample<T>(list: T[], n: number): T[] {
  return shuffle(list).slice(0, n)
}

export function between(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
