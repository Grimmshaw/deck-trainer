import { setSilent, useSilent } from './soundMode'

/** Switch between hearing the signals and seeing them as bars */
export default function SoundModeToggle({ compact = false }: { compact?: boolean }) {
  const silent = useSilent()
  return (
    <button
      className={`sound-toggle ${compact ? 'compact' : ''}`}
      onClick={() => setSilent(!silent)}
      aria-pressed={silent}
      aria-label={silent ? 'Silent mode is on – tap to play sounds' : 'Sound is on – tap for silent mode'}
    >
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
        <path d="M5 13 H10 L16 8 V24 L10 19 H5 Z" fill="currentColor" />
        {silent ? (
          <path d="M20 12 L28 20 M28 12 L20 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        ) : (
          <path d="M20 12 q3 4 0 8 M23.5 9 q6 7 0 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
      </svg>
      {!compact && <span>{silent ? 'Silent – signals shown as pictures' : 'Sound on'}</span>}
    </button>
  )
}
