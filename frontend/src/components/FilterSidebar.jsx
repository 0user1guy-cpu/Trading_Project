import { useEffect, useState } from 'react'
import { fetchCategories } from '../api'
import RangeSlider from './RangeSlider'
import WearPopup from './WearPopup'
import CollectionPopup from './CollectionPopup'
import StickerFilter from './StickerFilter'
import PatternsFilter from './PatternsFilter'
import SpecialFilter from './SpecialFilter'
import ListingFilter from './ListingFilter'
import './FilterSidebar.css'

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'float_asc', label: 'Float: Low to High' },
  { value: 'float_desc', label: 'Float: High to Low' },
]

const PRICE_RANGES = [
  { label: '< $10', min: 0, max: 10 },
  { label: '$10 - $50', min: 10, max: 50 },
  { label: '$50 - $250', min: 50, max: 250 },
  { label: '> $250', min: 250, max: null },
]

const MAX_PRICE = 5000

export default function FilterSidebar({ filters, onFilterChange }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories([{ category: 'Tous', count: null }, ...cats]))
      .catch((e) => console.error('Failed to load categories:', e))
  }, [])

  const update = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 })
  }

  // Convertit la valeur du slider prix (0..MAX_PRICE) vers les filtres API.
  // Si low=0 et high=MAX_PRICE, on ne filtre pas le prix (null).
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
        <div className="filter-section-title">Search</div>
        <input
          type="text"
          className="filter-search-input"
          placeholder="Search for items..."
          value={filters.q || ''}
          onChange={(e) => update('q', e.target.value)}
        />
      </div>

      {/* Prix — slider style CSFloat avec flèches + inputs */}
      <div className="filter-section">
        <div className="filter-section-title">Price</div>
        <RangeSlider
          variant="price"
          min={0}
          max={MAX_PRICE}
          value={priceSliderValue}
          onChange={onPriceSlider}
          formatValue={(v) => `$${Math.round(v)}`}
        />
        <div className="filter-price-inputs">
          <input
            type="number"
            className="filter-price-input"
            placeholder="0"
            value={filters.price_min ?? ''}
            onChange={(e) => update('price_min', e.target.value || null)}
          />
          <span className="filter-price-separator">—</span>
          <input
            type="number"
            className="filter-price-input"
            placeholder="∞"
            value={filters.price_max ?? ''}
            onChange={(e) => update('price_max', e.target.value || null)}
          />
        </div>
        <div className="filter-price-presets">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              className="filter-price-preset"
              onClick={() => onFilterChange({
                ...filters,
                price_min: range.min,
                price_max: range.max,
                page: 1,
              })}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Float — section séparée avec dégradé couleur + flèches */}
      <div className="filter-section">
        <div className="filter-section-title">Float</div>
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
        <div className="filter-section-title">Wear</div>
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
        <div className="filter-section-title">Sort By</div>
        <select
          className="filter-sort-select"
          value={filters.sort || 'price_asc'}
          onChange={(e) => update('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </aside>
  )
}
