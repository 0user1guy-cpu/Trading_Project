import { useCurrency } from '../contexts/CurrencyContext'
import { useLanguage } from '../contexts/LanguageContext'
import RangeSlider from './RangeSlider'
import WearPopup from './WearPopup'
import CollectionPopup from './CollectionPopup'
import StickerFilter from './StickerFilter'
import PatternsFilter from './PatternsFilter'
import SpecialFilter from './SpecialFilter'
import ListingFilter from './ListingFilter'
import './FilterSidebar.css'

const SORT_KEYS = [
  { value: 'price_asc', tKey: 'sort.priceAsc' },
  { value: 'price_desc', tKey: 'sort.priceDesc' },
  { value: 'name_asc', tKey: 'sort.nameAsc' },
  { value: 'name_desc', tKey: 'sort.nameDesc' },
  { value: 'float_asc', tKey: 'sort.floatAsc' },
  { value: 'float_desc', tKey: 'sort.floatDesc' },
]

// Bornes des presets en USD (devise de base de la DB).
const PRICE_RANGES_USD = [
  { min: 0, max: 10 },
  { min: 10, max: 50 },
  { min: 50, max: 250 },
  { min: 250, max: null },
]

const MAX_PRICE = 5000

export default function FilterSidebar({ filters, onFilterChange }) {
  const { convert, formatPrice, currency } = useCurrency()
  const { t } = useLanguage()

  const update = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 })
  }

  // Convertit une valeur saisie dans la devise active vers l'USD (pour la DB).
  const toUsd = (v) => {
    const n = parseFloat(v)
    if (!isFinite(n) || n <= 0) return null
    // invert convert : usd = value / rate = value * (1/rate). On utilise le taux USD->devise.
    return Number((n / convert(1)).toFixed(2))
  }

  // Affiche une borne USD convertie dans la devise active (sans devise, juste le montant formaté court).
  const fmtRangeBound = (usd) => {
    if (usd === null || usd === undefined) return '∞'
    const v = convert(usd)
    const digits = currency === 'JPY' ? 0 : 0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(v)
  }

  // Convertit la valeur du slider prix (0..MAX_PRICE, espace USD) vers les filtres API.
  const priceSliderValue = [
    filters.price_min ?? 0,
    filters.price_max ?? MAX_PRICE,
  ]
  const onPriceSlider = ([low, high]) => {
    onFilterChange({
      ...filters,
      price_min: low > 0 ? low : null,
      price_max: high < MAX_PRICE ? high : null,
      page: 1,
    })
  }

  return (
    <aside className="filter-sidebar">
      {/* Recherche */}
      <div className="filter-section">
        <div className="filter-section-title">{t('filter.search')}</div>
        <input
          type="text"
          className="filter-search-input"
          placeholder={t('filter.searchPlaceholder')}
          value={filters.q || ''}
          onChange={(e) => update('q', e.target.value)}
        />
      </div>

      {/* Prix — slider style CSFloat avec flèches + inputs */}
      <div className="filter-section">
        <div className="filter-section-title">{t('filter.price')}</div>
        <RangeSlider
          variant="price"
          min={0}
          max={MAX_PRICE}
          value={priceSliderValue}
          onChange={onPriceSlider}
          formatValue={(v) => fmtRangeBound(v)}
        />
        <div className="filter-price-inputs">
          <input
            type="number"
            className="filter-price-input"
            placeholder="0"
            value={filters.price_min !== null && filters.price_min !== undefined ? Math.round(convert(filters.price_min)) : ''}
            onChange={(e) => update('price_min', toUsd(e.target.value))}
          />
          <span className="filter-price-separator">—</span>
          <input
            type="number"
            className="filter-price-input"
            placeholder="∞"
            value={filters.price_max !== null && filters.price_max !== undefined && filters.price_max < MAX_PRICE ? Math.round(convert(filters.price_max)) : ''}
            onChange={(e) => update('price_max', toUsd(e.target.value))}
          />
        </div>
        <div className="filter-price-presets">
          {PRICE_RANGES_USD.map((range, i) => {
            const label = range.max === null
              ? `> ${fmtRangeBound(range.min)}`
              : `${fmtRangeBound(range.min)} - ${fmtRangeBound(range.max)}`
            return (
              <button
                key={i}
                className="filter-price-preset"
                onClick={() => onFilterChange({
                  ...filters,
                  price_min: range.min,
                  price_max: range.max,
                  page: 1,
                })}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Float — section séparée avec dégradé couleur + flèches */}
      <div className="filter-section">
        <div className="filter-section-title">{t('filter.float')}</div>
        <RangeSlider
          variant="float"
          min={0}
          max={1}
          value={[filters.float_min ?? 0, filters.float_max ?? 1]}
          onChange={([low, high]) => onFilterChange({ ...filters, float_min: low, float_max: high, page: 1 })}
          formatValue={(v) => v.toFixed(2)}
        />
        <div className="filter-price-inputs">
          <input
            type="number"
            step="0.01"
            className="filter-price-input"
            placeholder="0.00"
            value={filters.float_min ?? ''}
            onChange={(e) => update('float_min', e.target.value || null)}
          />
          <span className="filter-price-separator">—</span>
          <input
            type="number"
            step="0.01"
            className="filter-price-input"
            placeholder="1.00"
            value={filters.float_max ?? ''}
            onChange={(e) => update('float_max', e.target.value || null)}
          />
        </div>
      </div>

      {/* Wear — popup initiales aligné sous Float, avec tooltip */}
      <div className="filter-section">
        <div className="filter-section-title">{t('filter.wear')}</div>
        <WearPopup
          value={filters.wear}
          onChange={(w) => update('wear', w)}
        />
      </div>

      {/* Listing — All / Buy Now / Auction */}
      <div className="filter-section">
        <ListingFilter
          value={filters.listing || 'all'}
          onChange={(v) => update('listing', v)}
        />
      </div>

      {/* Special — StatTrak / Souvenir / Highlight / Normal */}
      <div className="filter-section">
        <SpecialFilter
          value={filters.special}
          onChange={(v) => update('special', v)}
        />
      </div>

      {/* Collection — popup */}
      <div className="filter-section">
        <CollectionPopup
          value={filters.collection}
          onChange={(c) => update('collection', c)}
        />
      </div>

      {/* Stickers — 5 emplacements */}
      <div className="filter-section">
        <StickerFilter
          value={filters.stickers}
          onChange={(s) => update('stickers', s)}
        />
      </div>

      {/* Patterns — Motif + Fade/Blue */}
      <div className="filter-section">
        <PatternsFilter
          value={filters.pattern}
          onChange={(p) => update('pattern', p)}
        />
      </div>

      {/* Tri */}
      <div className="filter-section">
        <div className="filter-section-title">{t('filter.sortBy')}</div>
        <select
          className="filter-sort-select"
          value={filters.sort || 'price_asc'}
          onChange={(e) => update('sort', e.target.value)}
        >
          {SORT_KEYS.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(opt.tKey)}</option>
          ))}
        </select>
      </div>
    </aside>
  )
}
