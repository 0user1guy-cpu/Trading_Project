import { useLanguage } from '../contexts/LanguageContext'
import './WearPopup.css'

const WEAR_OPTIONS = [
  { code: 'FN', tKey: 'wear.fn' },
  { code: 'MW', tKey: 'wear.mw' },
  { code: 'FT', tKey: 'wear.ft' },
  { code: 'WW', tKey: 'wear.ww' },
  { code: 'BS', tKey: 'wear.bs' },
]

/**
 * Popup de wear avec initiales (FN/MW/FT/WW/BS) et tooltip au survol.
 * Aligné sous la section Float (style CSFloat).
 * Note: les libellés de wear (Factory New...) ne sont PAS traduits dans les
 * cartes/modal (convention marketplaces CS2) — seuls les tooltips ici le sont.
 */
export default function WearPopup({ value, onChange }) {
  const { t } = useLanguage()
  return (
    <div className="wear-popup">
      {WEAR_OPTIONS.map((w) => (
        <button
          key={w.code}
          className={`wear-chip ${value === w.code ? 'active' : ''}`}
          onClick={() => onChange(value === w.code ? null : w.code)}
          title={t(w.tKey)}
        >
          <span className="wear-chip-code">{w.code}</span>
          <span className="wear-chip-tooltip">{t(w.tKey)}</span>
        </button>
      ))}
    </div>
  )
}
