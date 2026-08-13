import { useEffect, useState, useRef } from 'react'
import { fetchCategories } from '../api'
import { useLanguage } from '../contexts/LanguageContext'
import './CategoryBar.css'

/**
 * Barre de catégories façon CSFloat : une rangée horizontale de chips
 * détachée (bords arrondis, fond propre), scrollable si déborde, avec des
 * flèches prev/next qui apparaissent selon la position de scroll.
 */
export default function CategoryBar({ filters, onFilterChange }) {
  const { t } = useLanguage()
  const ALL = '__all__'
  const [categories, setCategories] = useState([])
  const scrollRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories([{ category: ALL, count: null }, ...cats]))
      .catch((e) => console.error('Failed to load categories:', e))
  }, [])

  const active = filters.category || ALL

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateArrows()
  }, [categories])

  const scrollBy = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: 'smooth' })
  }

  const select = (cat) => {
    onFilterChange({ ...filters, category: cat === ALL ? null : cat, page: 1 })
  }

  const display = (cat) => (cat === ALL ? t('category.all') : cat)

  return (
    <div className="category-bar">
      {canLeft && (
        <button
          className="category-arrow category-arrow-left"
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6l-6 6 6 6V6z" />
          </svg>
        </button>
      )}
      <div
        className="category-scroll"
        ref={scrollRef}
        onScroll={updateArrows}
      >
        {categories.map((cat) => (
          <button
            key={cat.category}
            className={`category-chip ${active === cat.category ? 'active' : ''}`}
            onClick={() => select(cat.category)}
          >
            <span className="category-chip-name">{display(cat.category)}</span>
            {cat.count != null && (
              <span className="category-chip-count">{cat.count.toLocaleString()}</span>
            )}
          </button>
        ))}
      </div>
      {canRight && (
        <button
          className="category-arrow category-arrow-right"
          onClick={() => scrollBy(1)}
          aria-label="Next"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 6l6 6-6 6V6z" />
          </svg>
        </button>
      )}
    </div>
  )
}
