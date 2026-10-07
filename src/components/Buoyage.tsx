import { useMemo, useState } from 'react'
import BuoySvg from '../buoyage/BuoySvg'
import { allMarks, type Region } from '../buoyage/marks'
import { newSeed } from '../art/scenery'
import { randomScene } from '../buoyage/scene'

interface Props {
  /** The buoyage region from the user's chosen study region */
  region: Region
  onBack: () => void
}

export default function Buoyage({ region: startRegion, onBack }: Props) {
  // Starts in the user's region; the toggle lets you compare with the other one
  const [region, setRegion] = useState<Region>(startRegion)
  const [night, setNight] = useState(false)
  /** null = plain pictures, a number = random scenery made from that seed */
  const [sceneSeed, setSceneSeed] = useState<number | null>(null)
  const marks = useMemo(() => allMarks(region), [region])
  const scenes = useMemo(
    () => (sceneSeed === null ? null : marks.map((m, i) => randomScene(m, sceneSeed + i * 7919))),
    [marks, sceneSeed],
  )

  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">
          Buoyage (IALA)
          <small>All marks</small>
        </div>
        <span className="topbar-spacer" />
      </header>

      <div className="toggle-row">
        <div className="segmented small-seg">
          {(['A', 'B'] as Region[]).map((r) => (
            <button key={r} className={region === r ? 'selected' : ''} onClick={() => setRegion(r)}>
              Region {r}
            </button>
          ))}
        </div>
        <div className="segmented small-seg">
          <button className={!night ? 'selected' : ''} onClick={() => setNight(false)}>
            Day
          </button>
          <button className={night ? 'selected' : ''} onClick={() => setNight(true)}>
            Night
          </button>
        </div>
      </div>
      <div className="segmented small-seg">
        <button className={sceneSeed === null ? 'selected' : ''} onClick={() => setSceneSeed(null)}>
          Plain
        </button>
        <button className={sceneSeed !== null ? 'selected' : ''} onClick={() => setSceneSeed(newSeed())}>
          Scenery
        </button>
      </div>
      {sceneSeed !== null && (
        <button className="secondary" onClick={() => setSceneSeed(newSeed())}>
          New scenes
        </button>
      )}
      <div className="buoy-grid">
        {marks.map((m, i) => (
          <div key={m.id} className="buoy-card">
            <BuoySvg mark={m} night={night} scene={scenes?.[i]} size={130} />
            <strong>{m.name}</strong>
            <span className="muted small">{m.lights.map((l) => l.label).join(' · ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
