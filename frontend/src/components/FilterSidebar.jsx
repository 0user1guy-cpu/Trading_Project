import { useEffect, useState } from 'react'
import { fetchCategories } from '../api'
import FloatSlider from './FloatSlider'
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

      {/* Prix */}
      <div className="filter-section">
        <div className="filter-section-title">Price</div>
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

      {/* Float / Wear — slider double curseur style CSFloat */}
      <div className="filter-section">
        <div className="filter-section-title">Wear / Float</div>
        <FloatSlider
          min={0}
          max={1}
          value={[filters.float_min ?? 0, filters.float_max ?? 1]}
          onChange={([low, high]) => onFilterChange({ ...filters, float_min: low, float_max: high, page: 1 })}
        />
        <div className="filter-wear-presets">
          <button className={`filter-wear-chip ${filters.wear === 'FN' ? 'active' : ''}`} onClick={() => update('wear', filters.wear === 'FN' ? null : 'FN')}>FN</button>
          <button className={`filter-wear-chip ${filters.wear === 'MW' ? 'active' : ''}`} onClick={() => update('wear', filters.wear === 'MW' ? null : 'MW')}>MW</button>
          <button className={`filter-wear-chip ${filters.wear === 'FT' ? 'active' : ''}`} onClick={() => update('wear', filters.wear === 'FT' ? null : 'FT')}>FT</button>
          <button className={`filter-wear-chip ${filters.wear === 'WW' ? 'active' : ''}`} onClick={() => update('wear', filters.wear === 'WW' ? null : 'WW')}>WW</button>
          <button className={`filter-wear-chip ${filters.wear === 'BS' ? 'active' : ''}`} onClick={() => update('wear', filters.wear === 'BS' ? null : 'BS')}>BS</button>
        </div>
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
