import FilterSection from './FilterSection'
import './SpecialFilter.css'

/**
 * Filtre Spécial (coches multiples) façon CSFloat.
 * StatTrak, Souvenir, Highlight, Normal.
 * `value` = objet { stattrak, souvenir, highlight, normal } (booléens).
 *
 * Note: Highlight n'a pas de donnée réelle dans openskin ; StatTrak/Souvenir
 * sont filtrables réellement via le nom côté backend.
 */
const SPECIALS = [
  { key: 'stattrak', label: 'StatTrak™' },
  { key: 'souvenir', label: 'Souvenir' },
  { key: 'highlight', label: 'Highlight' },
  { key: 'normal', label: 'Normal' },
]

export default function SpecialFilter({ value, onChange }) {
  const v = value || {}

  const toggle = (key) => {
    onChange({ ...v, [key]: !v[key] })
  }

  return (
    <FilterSection title="Special">
      <div className="special-grid">
        {SPECIALS.map((s) => (
          <label key={s.key} className={`special-item ${v[s.key] ? 'checked' : ''}`}>
            <input
              type="checkbox"
              checked={!!v[s.key]}
              onChange={() => toggle(s.key)}
            />
            <span className="special-checkbox" />
            <span className="special-label">{s.label}</span>
          </label>
        ))}
      </div>
    </FilterSection>
  )
}
