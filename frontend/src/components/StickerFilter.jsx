import { usePopup, FilterTrigger } from './FilterSection'
import { useLanguage } from '../contexts/LanguageContext'
import './StickerFilter.css'

const SLOTS = [1, 2, 3, 4, 5]

/**
 * Filtre par sticker : 5 lignes, chacune permet de choisir
 * "N'importe quel emplacement" (any) ou "Emplacement N".
 * `value` = tableau de 5 valeurs: 'any' | 1..5.
 */
export default function StickerFilter({ value, onChange }) {
  const { t } = useLanguage()
  const { open, setOpen, ref } = usePopup()

  const updateSlot = (i, val) => {
    const next = [...(value || ['any', 'any', 'any', 'any', 'any'])]
    next[i] = val
    onChange(next)
  }

  const all = value || ['any', 'any', 'any', 'any', 'any']
  const activeCount = all.filter((v) => v !== 'any').length

  return (
    <div className="sticker-filter-wrap" ref={ref}>
      <FilterTrigger
        label={t('filter.stickers')}
        value={activeCount ? `${activeCount} ${t('sticker.slotLabel')}${activeCount > 1 ? 's' : ''}` : t('filter.anySlot')}
        onClick={() => setOpen((o) => !o)}
        open={open}
      />
      {open && (
        <div className="sticker-filter-popup">
          <div className="sticker-filter-head">5 {t('filter.stickers')}</div>
          {SLOTS.map((slot, i) => (
            <div key={i} className="sticker-row">
              <select
                className="sticker-select"
                value={all[i] || 'any'}
                onChange={(e) => updateSlot(i, e.target.value === 'any' ? 'any' : parseInt(e.target.value))}
              >
                <option value="any">{t('sticker.anySlotLabel')}</option>
                <option value={slot}>{t('sticker.slotLabel')} {slot}</option>
              </select>
              <input
                type="text"
                className="sticker-name-input"
                placeholder={t('sticker.placeholder')}
              />
            </div>
          ))}
          <div className="sticker-filter-hint">
            {t('sticker.hint')}
          </div>
        </div>
      )}
    </div>
  )
}
