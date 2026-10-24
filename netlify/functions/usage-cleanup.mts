import { getStore } from '@netlify/blobs'
import { deviceCutoff, withoutDevice } from '../lib/usageKeys'

// Runs once a day (Netlify scheduled function). Removes the random "device of
// the day" number from usage events older than 30 days, so it can only be used
// for the recent "top 5 today" and "latest activity" on the statistics page.
// The event itself stays, without the number, for the long-term statistics.

export const config = { schedule: '@daily' }

export default async (): Promise<Response> => {
  const store = getStore('usage')
  const cutoff = deviceCutoff(new Date())
  // The three months before the cutoff are enough when this runs every day
  const months = [0, 1, 2].map((i) => {
    const d = new Date(`${cutoff.slice(0, 7)}-15T00:00:00Z`)
    d.setUTCMonth(d.getUTCMonth() - i)
    return d.toISOString().slice(0, 7)
  })
  let changed = 0
  for (const month of months) {
    const { blobs } = await store.list({ prefix: `e3/${month}` })
    for (const b of blobs) {
      const next = withoutDevice(b.key, cutoff)
      if (!next) continue
      await store.set(next, '')
      await store.delete(b.key)
      changed++
    }
  }
  console.log(`usage-cleanup: removed the device number from ${changed} events before ${cutoff}`)
  return new Response(null, { status: 204 })
}
