import { usePopup, FilterTrigger } from './FilterSection'
import './StickerFilter.css'

const SLOTS = [1, 2, 3, 4, 5]

/**
 * Filtre par sticker : 5 lignes, chacune permet de choisir
 * "N'importe quel emplacement" (any) ou "Emplacement N".
 * `value` = tableau de 5 valeurs: 'any' | 1..5.
 */
export default function StickerFilter({ value, onChange }) {
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
        label="Stickers"
        value={activeCount ? `${activeCount} slot${activeCount > 1 ? 's' : ''}` : 'Any Slot'}
        onClick={() => setOpen((o) => !o)}
        open={open}
      />
      {open && (
        <div className="sticker-filter-popup">
          <div className="sticker-filter-head">5 emplacements de stickers</div>
          {SLOTS.map((slot, i) => (
            <div key={i} className="sticker-row">
              <select
                className="sticker-select"
                value={all[i] || 'any'}
                onChange={(e) => updateSlot(i, e.target.value === 'any' ? 'any' : parseInt(e.target.value))}
              >
                <option value="any">N'importe quel emplacement</option>
                <option value={slot}>Emplacement {slot}</option>
              </select>
              <input
                type="text"
                className="sticker-name-input"
                placeholder="Sticker"
              />
            </div>
          ))}
          <div className="sticker-filter-hint">
            « N'importe quel emplacement » = avec ou sans sticker
          </div>
        </div>
      )}
    </div>
  )
}
