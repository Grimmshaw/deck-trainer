// Sends a problem report from the beta to Netlify Forms (the form "report"
// is declared in index.html so Netlify can find it). If that fails – for
// example offline – the phone's e-mail app opens with the report filled in.

export const APP_VERSION = '0.2.0'
const MAIL = 'robin_rantala@lanternakonsult.se'

export interface Report {
  kind: 'question' | 'bug'
  reason: string
  message: string
  category?: string
  key?: string
  question?: string
  answer?: string
  chosen?: string
}

function fields(r: Report): Record<string, string> {
  return {
    'form-name': 'report',
    kind: r.kind,
    reason: r.reason,
    message: r.message,
    category: r.category ?? '',
    key: r.key ?? '',
    question: r.question ?? '',
    answer: r.answer ?? '',
    chosen: r.chosen ?? '',
    version: APP_VERSION,
  }
}

/** true = sent to Netlify, false = the e-mail fallback was opened */
export async function sendReport(r: Report): Promise<boolean> {
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields(r)).toString(),
    })
    if (res.ok) return true
  } catch {
    /* offline or blocked – use e-mail instead */
  }
  const f = fields(r)
  const body = Object.entries(f)
    .filter(([k, v]) => k !== 'form-name' && v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  window.location.href = `mailto:${MAIL}?subject=${encodeURIComponent(`Lanterna report (${r.kind})`)}&body=${encodeURIComponent(body)}`
  return false
}
