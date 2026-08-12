import './WearPopup.css'

const WEAR_OPTIONS = [
  { code: 'FN', label: 'Factory New' },
  { code: 'MW', label: 'Minimal Wear' },
  { code: 'FT', label: 'Field-Tested' },
  { code: 'WW', label: 'Well-Worn' },
  { code: 'BS', label: 'Battle-Scarred' },
]

/**
 * Popup de wear avec initiales (FN/MW/FT/WW/BS) et tooltip au survol.
 * Aligné sous la section Float (style CSFloat).
 */
export default function WearPopup({ value, onChange }) {
  return (
    <div className="wear-popup">
      {WEAR_OPTIONS.map((w) => (
        <button
          key={w.code}
          className={`wear-chip ${value === w.code ? 'active' : ''}`}
          onClick={() => onChange(value === w.code ? null : w.code)}
          title={w.label}
        >
          <span className="wear-chip-code">{w.code}</span>
          <span className="wear-chip-tooltip">{w.label}</span>
        </button>
      ))}
    </div>
  )
}
