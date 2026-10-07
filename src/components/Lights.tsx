import { useMemo, useState } from 'react'
import { newSeed } from '../art/scenery'
import { plainShipScene, randomShipScene } from '../lights/scene'
import VesselSvg from '../lights/VesselSvg'
import { ASPECTS, VESSELS } from '../lights/vessels'

interface Props {
  onBack: () => void
}

// Aspects offered in the gallery
const GALLERY_ASPECTS = ASPECTS.filter((a) => [0, 45, 90, -45, -90, 180].includes(a.deg))

export default function Lights({ onBack }: Props) {
  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">
          Lights &amp; Shapes
          <small>All vessels</small>
        </div>
        <span className="topbar-spacer" />
      </header>

      <Gallery />
    </div>
  )
}

function Gallery() {
  const [night, setNight] = useState(true)
  const [aspect, setAspect] = useState(45)
  const [sceneSeed, setSceneSeed] = useState<number | null>(null)
  const [variantIdx, setVariantIdx] = useState<Record<string, number>>({})

  const scenes = useMemo(
    () =>
      VESSELS.map((_, i) => (sceneSeed === null ? plainShipScene(aspect) : randomShipScene(aspect, sceneSeed + i * 7919))),
    [aspect, sceneSeed],
  )

  return (
    <>
      <div className="toggle-row">
        <div className="segmented small-seg">
          <button className={!night ? 'selected' : ''} onClick={() => setNight(false)}>
            Day
          </button>
          <button className={night ? 'selected' : ''} onClick={() => setNight(true)}>
            Night
          </button>
        </div>
        <div className="segmented small-seg">
          <button className={sceneSeed === null ? 'selected' : ''} onClick={() => setSceneSeed(null)}>
            Plain
          </button>
          <button className={sceneSeed !== null ? 'selected' : ''} onClick={() => setSceneSeed(newSeed())}>
            Scenery
          </button>
        </div>
      </div>

      <div className="chip-row" role="group" aria-label="Where you see the vessel from">
        {GALLERY_ASPECTS.map((a) => (
          <button key={a.deg} className={`chip ${aspect === a.deg ? 'selected' : ''}`} onClick={() => setAspect(a.deg)}>
            {a.short}
          </button>
        ))}
      </div>
      {sceneSeed !== null && (
        <button className="secondary" onClick={() => setSceneSeed(newSeed())}>
          New scenes
        </button>
      )}

      <div className="vessel-list">
        {VESSELS.map((v, i) => {
          const vi = variantIdx[v.id] ?? 0
          const variant = v.variants[vi]
          const hidden = night && v.dayOnly
          return (
            <div key={v.id} className="vessel-card">
              {hidden ? (
                <div className="vessel-placeholder muted small">
                  At night she shows the lights of a power-driven vessel.
                </div>
              ) : (
                <VesselSvg variant={variant} night={night} scene={scenes[i]} size={340} />
              )}
              <div className="vessel-info">
                <strong>{v.name}</strong>
                <span className="rule">{v.rule}</span>
                <span className="muted small">{v.description}</span>
                {v.variants.length > 1 && (
                  <div className="chip-row">
                    {v.variants.map((x, j) => (
                      <button
                        key={x.label}
                        className={`chip ${vi === j ? 'selected' : ''}`}
                        onClick={() => setVariantIdx((s) => ({ ...s, [v.id]: j }))}
                      >
                        {x.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
