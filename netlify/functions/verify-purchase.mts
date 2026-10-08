import { createSign } from 'node:crypto'

// Checks a Google Play purchase and acknowledges it (otherwise Google refunds
// it after three days). Called by the app after "Unlock all" and on start.
//
// Needs two environment variables in Netlify (Project configuration → Environment variables):
//   GOOGLE_SERVICE_ACCOUNT – the whole JSON key file of a Google Cloud service account
//                            that has access to the app in Play Console
//   PLAY_PACKAGE_NAME      – se.lanternakonsult.lanterna

const SKUS = ['lanterna_full']

function base64url(s: string | Buffer): string {
  return Buffer.from(s).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function accessToken(): Promise<string> {
  const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT ?? '{}') as { client_email: string; private_key: string }
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(
    JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  )
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  const jwt = `${header}.${claims}.${base64url(signer.sign(key.private_key))}`
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  })
  if (!res.ok) throw new Error(`Google token error ${res.status}`)
  return ((await res.json()) as { access_token: string }).access_token
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  try {
    const { token, sku } = (await req.json()) as { token?: string; sku?: string }
    if (!token || !sku || !SKUS.includes(sku)) return Response.json({ valid: false }, { status: 400 })

    const pkg = process.env.PLAY_PACKAGE_NAME
    const auth = { Authorization: `Bearer ${await accessToken()}` }
    const base = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}/purchases/products/${sku}/tokens/${encodeURIComponent(token)}`

    const res = await fetch(base, { headers: auth })
    if (!res.ok) return Response.json({ valid: false }, { status: 200 })
    const purchase = (await res.json()) as { purchaseState?: number; acknowledgementState?: number }
    // purchaseState 0 = purchased (1 = cancelled, 2 = pending)
    if (purchase.purchaseState !== 0) return Response.json({ valid: false })

    if (purchase.acknowledgementState === 0) {
      await fetch(`${base}:acknowledge`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: '{}' })
    }
    return Response.json({ valid: true })
  } catch {
    return Response.json({ valid: false }, { status: 500 })
  }
}
