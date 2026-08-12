import FilterSection from './FilterSection'
import { useLanguage } from '../contexts/LanguageContext'
import './SpecialFilter.css'

/**
 * Filtre Spécial (coches multiples) façon CSFloat.
 * StatTrak, Souvenir, Highlight, Normal.
 * Chaque catégorie a sa couleur (style CSFloat) :
 *  - StatTrak™  : orange (#cf6a32) + suffixe ™
 *  - Souvenir   : jaune (#ffd700)
 *  - Highlight   : vert (#3fb950)
 *  - Normal      : gris
 * `value` = objet { stattrak, souvenir, highlight, normal } (booléens).
 *
 * Note: Highlight n'a pas de donnée réelle dans openskin ; StatTrak/Souvenir
 * sont filtrables réellement via le nom côté backend.
 */
const SPECIALS = [
  { key: 'stattrak', tKey: 'special.stattrak', color: '#cf6a32', tm: true },
  { key: 'souvenir', tKey: 'special.souvenir', color: '#ffd700' },
  { key: 'highlight', tKey: 'special.highlight', color: '#3fb950' },
  { key: 'normal', tKey: 'special.normal', color: '#6e7681' },
]

export function getSpecialMeta(item) {
  if (!item || !item.name) return null
  const name = item.name
  if (name.startsWith('StatTrak') || name.startsWith('★ StatTrak')) {
    return { key: 'stattrak', tKey: 'special.stattrak', color: '#cf6a32', tm: true }
  }
  if (name.startsWith('Souvenir') || name.includes('| Souvenir')) {
    return { key: 'souvenir', tKey: 'special.souvenir', color: '#ffd700' }
  }
  return null
}

export default function SpecialFilter({ value, onChange }) {
  const { t } = useLanguage()
  const v = value || {}

  const toggle = (key) => {
    onChange({ ...v, [key]: !v[key] })
  }

  return (
    <FilterSection title={t('filter.special')}>
      <div className="special-grid">
        {SPECIALS.map((s) => (
          <label
            key={s.key}
            className={`special-item ${v[s.key] ? 'checked' : ''}`}
            style={v[s.key] ? { color: s.color } : undefined}
          >
            <input
              type="checkbox"
              checked={!!v[s.key]}
              onChange={() => toggle(s.key)}
            />
            <span
              className="special-checkbox"
              style={v[s.key] ? { backgroundColor: s.color, borderColor: s.color, boxShadow: `0 0 8px ${s.color}80` } : undefined}
            />
            <span className="special-label">
              {t(s.tKey)}
              {s.tm ? <sup className="special-tm">™</sup> : null}
            </span>
          </label>
        ))}
      </div>
    </FilterSection>
  )
}
