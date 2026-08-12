import { useEffect, useState } from 'react'
import { fetchCategories } from '../api'
import './FilterSidebar.css'

const WEAR_OPTIONS = [
  { code: 'FN', label: 'Factory New', range: '0.00 - 0.07' },
  { code: 'MW', label: 'Minimal Wear', range: '0.07 - 0.15' },
  { code: 'FT', label: 'Field-Tested', range: '0.15 - 0.38' },
  { code: 'WW', label: 'Well-Worn', range: '0.38 - 0.45' },
  { code: 'BS', label: 'Battle-Scarred', range: '0.45 - 1.00' },
]

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

  const toggleWear = (code) => {
    onFilterChange({ ...filters, wear: filters.wear === code ? null : code, page: 1 })
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

      {/* Catégories */}
      <div className="filter-section">
        <div className="filter-section-title">Category</div>
        <div className="filter-category-list">
          <button
            className={`filter-category-item ${(!filters.category || filters.category === 'Tous') ? 'active' : ''}`}
            onClick={() => update('category', null)}
          >
            <span>Tous</span>
          </button>
          {categories.filter(c => c.category !== 'Tous').map((cat) => (
            <button
              key={cat.category}
              className={`filter-category-item ${filters.category === cat.category ? 'active' : ''}`}
              onClick={() => update('category', cat.category)}
            >
              <span>{cat.category}</span>
              {cat.count && <span className="filter-category-count">{cat.count.toLocaleString()}</span>}
            </button>
          ))}
        </div>
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

      {/* Float / Wear */}
      <div className="filter-section">
        <div className="filter-section-title">Wear / Float</div>
        <div className="filter-wear-list">
          {WEAR_OPTIONS.map((wear) => (
            <button
              key={wear.code}
              className={`filter-wear-item ${filters.wear === wear.code ? 'active' : ''}`}
              onClick={() => toggleWear(wear.code)}
            >
              <span className="filter-wear-code">{wear.code}</span>
              <span className="filter-wear-label">{wear.label}</span>
            </button>
          ))}
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
