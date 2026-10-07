import { REGIONS, type StudyRegion } from '../regions'

interface Props {
  current: StudyRegion
  onPick: (r: StudyRegion) => void
  onBack: () => void
}

export default function RegionPicker({ current, onPick, onBack }: Props) {
  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h1 className="topbar-title">Your region</h1>
        <span className="topbar-spacer" />
      </header>

      <p className="muted center small">
        Buoyage questions follow the IALA region where you study. Language and local rules will follow your region in later
        versions.
      </p>

      <div className="region-list" role="radiogroup" aria-label="Region">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            role="radio"
            aria-checked={r.id === current.id}
            className={`region-row ${r.id === current.id ? 'selected' : ''}`}
            onClick={() => onPick(r)}
          >
            <span>
              {r.name}
              {r.note && <small>{r.note}</small>}
            </span>
            <span className={`tag ${r.buoyage === 'B' ? 'tag-b' : 'tag-a'}`}>IALA {r.buoyage}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
