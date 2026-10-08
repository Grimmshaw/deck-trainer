import { setTheme, useTheme, type ThemeChoice } from './theme'

const OPTIONS: { id: ThemeChoice; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

/** Auto (follows the phone), light or dark */
export default function ThemePicker() {
  const theme = useTheme()
  return (
    <div className="theme-picker" role="group" aria-label="Appearance">
      <span className="muted small">Appearance</span>
      <div className="segmented small-seg">
        {OPTIONS.map((o) => (
          <button key={o.id} className={theme === o.id ? 'selected' : ''} onClick={() => setTheme(o.id)} aria-pressed={theme === o.id}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
