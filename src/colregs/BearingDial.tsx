// A small relative-bearing dial: your own ship in the middle pointing up,
// and a dot where the other vessel is. It does not show her heading –
// working that out from her lights is the point of the question.

export default function BearingDial({ bearing, size = 120 }: { bearing: number; size?: number }) {
  const r = 46
  const t = (bearing * Math.PI) / 180
  const x = 60 + Math.sin(t) * r
  const y = 60 - Math.cos(t) * r
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label="Relative bearing of the other vessel" className="bearing-dial">
      <circle cx="60" cy="60" r="56" fill="#0b1a2e" stroke="#2b5185" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="#2b5185" strokeDasharray="3 4" />
      {/* Beam line and 22.5° abaft the beam marks */}
      <line x1="8" y1="60" x2="112" y2="60" stroke="#24456f" />
      {[112.5, -112.5].map((d) => {
        const a = (d * Math.PI) / 180
        return <line key={d} x1="60" y1="60" x2={60 + Math.sin(a) * 56} y2={60 - Math.cos(a) * 56} stroke="#24456f" strokeDasharray="2 3" />
      })}
      {/* Own ship */}
      <path d="M60 44 L66 56 L66 74 L54 74 L54 56 Z" fill="#f4f6fa" />
      <line x1="60" y1="40" x2="60" y2="20" stroke="#f4f6fa" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Other vessel */}
      <line x1="60" y1="60" x2={x} y2={y} stroke="#ffc83d" strokeWidth="1.2" strokeDasharray="3 2" />
      <circle cx={x} cy={y} r="6" fill="#ffc83d" />
      <text x="60" y="13" textAnchor="middle" fontSize="8" fill="#9db2cf">
        AHEAD
      </text>
    </svg>
  )
}
