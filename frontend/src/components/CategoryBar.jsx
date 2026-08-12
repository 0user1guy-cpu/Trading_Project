import { useEffect, useState, useRef } from 'react'
import { fetchCategories } from '../api'
import './CategoryBar.css'

/**
 * Barre de catégories en haut de la page Market, façon CSFloat.
 * Un bouton déroulant (popup) affiche toutes les catégories avec leur
 * compteur. La catégorie active est mise en évidence.
 */
export default function CategoryBar({ filters, onFilterChange }) {
  const [categories, setCategories] = useState([])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories([{ category: 'Tous', count: null }, ...cats]))
      .catch((e) => console.error('Failed to load categories:', e))
  }, [])

  // Ferme le popup si on clique en dehors
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const active = filters.category || 'Tous'
  const activeCat = categories.find((c) => c.category === active)
  const filtered = categories.filter((c) =>
    c.category.toLowerCase().includes(query.toLowerCase())
  )

  const select = (cat) => {
    onFilterChange({ ...filters, category: cat === 'Tous' ? null : cat, page: 1 })
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="category-bar" ref={wrapRef}>
      <button
        className={`category-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="category-trigger-label">Category</span>
        <span className="category-trigger-value">{active}</span>
        {activeCat && activeCat.count != null && (
          <span className="category-trigger-count">{activeCat.count.toLocaleString()}</span>
        )}
        <svg className={`category-trigger-chevron ${open ? 'rotated' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div className="category-popup">
          <div className="category-popup-search">
            <input
              type="text"
              placeholder="Filter categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="category-popup-list">
            {filtered.map((cat) => (
              <button
                key={cat.category}
                className={`category-popup-item ${active === cat.category ? 'active' : ''}`}
                onClick={() => select(cat.category)}
              >
                <span className="category-popup-dot" />
                <span className="category-popup-name">{cat.category}</span>
                {cat.count != null && (
                  <span className="category-popup-count">{cat.count.toLocaleString()}</span>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="category-popup-empty">No matching category</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
