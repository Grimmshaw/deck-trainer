import CategoryIcon, { type IconKind } from './CategoryIcon'

interface Props {
  title: string
  text: string
  icon: IconKind
  onBack: () => void
}

export default function ComingSoon({ title, text, icon, onBack }: Props) {
  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h1 className="topbar-title">{title}</h1>
        <span className="topbar-spacer" />
      </header>
      <div className="coming-soon">
        <span className="category-icon big-tile"><CategoryIcon kind={icon} size={64} /></span>
        <p>{text}</p>
        <p className="muted">This part is coming in a later version.</p>
        <button className="secondary" onClick={onBack}>
          Back to start
        </button>
      </div>
    </div>
  )
}
