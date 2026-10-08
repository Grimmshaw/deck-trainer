import { useState } from 'react'
import { sendReport, type Report } from './report'

const QUESTION_REASONS = ['Wrong answer', 'Unclear question', 'Picture looks wrong', 'Typo', 'Other']
const BUG_REASONS = ['Something does not work', 'Looks wrong', 'Idea or wish', 'Other']

interface Props {
  /** Everything about the report except what the user picks and writes */
  base: Omit<Report, 'reason' | 'message'>
  onClose: () => void
}

/** A small sheet for reporting a problem with a question or with the app */
export default function ReportDialog({ base, onClose }: Props) {
  const reasons = base.kind === 'question' ? QUESTION_REASONS : BUG_REASONS
  const [reason, setReason] = useState(reasons[0])
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'edit' | 'sending' | 'sent' | 'mail'>('edit')

  const send = async () => {
    setState('sending')
    const ok = await sendReport({ ...base, reason, message: message.trim() })
    setState(ok ? 'sent' : 'mail')
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Report a problem" onClick={(e) => e.stopPropagation()}>
        {state === 'sent' || state === 'mail' ? (
          <>
            <h2>Thank you!</h2>
            <p className="muted">
              {state === 'sent'
                ? 'Your report has been sent. It helps make the questions right.'
                : 'Your e-mail app opened with the report filled in – just press send.'}
            </p>
            <button className="primary big" onClick={onClose}>
              Close
            </button>
          </>
        ) : (
          <>
            <h2>{base.kind === 'question' ? 'Report this question' : 'Report a problem'}</h2>
            <div className="reason-row">
              {reasons.map((r) => (
                <button key={r} className={`chip ${reason === r ? 'selected' : ''}`} onClick={() => setReason(r)}>
                  {r}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={base.kind === 'question' ? 'What is wrong? (optional)' : 'What happened? (optional)'}
              rows={4}
              maxLength={2000}
            />
            <p className="muted small">
              {base.kind === 'question' ? 'The question and your answer are sent with the report. ' : ''}No personal data is sent.
            </p>
            <div className="sheet-actions">
              <button className="secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="primary" onClick={send} disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
