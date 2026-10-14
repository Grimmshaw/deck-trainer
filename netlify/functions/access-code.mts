// Access codes for the web version (e.g. testers with iPhone, who cannot buy
// in the Google Play app). The codes live only on the server, in the Netlify
// environment variable ACCESS_CODES, separated by commas:
//
//   ACCESS_CODES = KALMAR-BRYGGA-7, STENA-DECK-42
//
// Remove a code from the list and the devices that used it are locked again
// the next time they open the app with a connection.

export const config = { path: '/api/access-code' }

function codes(): string[] {
  return (process.env.ACCESS_CODES ?? '')
    .split(',')
    .map((c) => normalise(c))
    .filter((c) => c.length >= 6)
}

function normalise(c: string): string {
  return c.trim().toUpperCase().replace(/\s+/g, '')
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  try {
    const { code } = (await req.json()) as { code?: string }
    // A short pause makes guessing codes slow
    await new Promise((r) => setTimeout(r, 600))
    const valid = typeof code === 'string' && codes().includes(normalise(code))
    return Response.json({ valid })
  } catch {
    return Response.json({ valid: false }, { status: 400 })
  }
}
