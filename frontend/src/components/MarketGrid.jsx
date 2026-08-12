import { useEffect, useState, useCallback } from 'react'
import { fetchItems } from '../api'
import { useLanguage } from '../contexts/LanguageContext'
import SkinCard from './SkinCard'
import ItemModal from './ItemModal'
import './MarketGrid.css'

export default function MarketGrid({ filters, setFilters }) {
  const { t } = useLanguage()
  const [data, setData] = useState({ items: [], total: 0, total_pages: 0, page: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  // Debounce sur la recherche texte
  const [debouncedQ, setDebouncedQ] = useState(filters.q)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 350)
    return () => clearTimeout(t)
  }, [filters.q])

  const loadItems = useCallback(() => {
    setLoading(true)
    setError(null)
    // Transforme les filtres structurés en paramètres API plats.
    const params = {
      q: debouncedQ,
      category: filters.category,
      float_min: filters.float_min,
      float_max: filters.float_max,
      price_min: filters.price_min,
      price_max: filters.price_max,
      wear: filters.wear,
      sort: filters.sort,
      page: filters.page,
      page_size: 60,
      collection: filters.collection,
      listing: filters.listing,
    }
    // Special : StatTrak / Souvenir / Normal
    if (filters.special) {
      params.stattrak = filters.special.stattrak ?? null
      params.souvenir = filters.special.souvenir ?? null
      // Si "Normal" seul (sans StatTrak/Souvenir), on exige ni l'un ni l'autre.
      if (filters.special.normal && !filters.special.stattrak && !filters.special.souvenir) {
        params.stattrak = false
        params.souvenir = false
      }
    }
    // Pattern : garde le chip sélectionné comme chaîne.
    if (filters.pattern && filters.pattern.chip) {
      params.pattern = filters.pattern.chip.toLowerCase().replace(/\s+/g, '_')
    }
    fetchItems(params)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters, debouncedQ])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="market-grid-container">
      <div className="market-grid-header">
        <div className="market-results-count">
          {loading ? t('grid.loading') : `${data.total.toLocaleString()} ${t('grid.items')}`}
        </div>
      </div>

      {error && <div className="market-error">{t('grid.error')} {error}</div>}

      {loading && data.items.length === 0 ? (
        <div className="market-grid">
          {Array.from({ length: 18 }).map((_, i) => (
            <div className="skin-card-skeleton" key={i} />
          ))}
        </div>
      ) : (
        <div className="market-grid">
          {data.items.map((item) => (
            <SkinCard key={item.id} item={item} onClick={setSelectedItem} />
          ))}
        </div>
      )}

      {!loading && data.items.length === 0 && !error && (
        <div className="market-empty">
          <span className="market-empty-icon">🔍</span>
          <p>{t('grid.noResults')}</p>
        </div>
      )}

      {/* Pagination */}
      {data.total_pages > 1 && (
        <div className="market-pagination">
          <button
            className="market-page-btn"
            disabled={data.page <= 1}
            onClick={() => handlePageChange(data.page - 1)}
          >
            {t('grid.prev')}
          </button>
          <span className="market-page-info">
            {t('grid.page')} {data.page} / {data.total_pages}
          </span>
          <button
            className="market-page-btn"
            disabled={data.page >= data.total_pages}
            onClick={() => handlePageChange(data.page + 1)}
          >
            {t('grid.next')}
          </button>
        </div>
      )}

      {/* Modal de détail */}
      {selectedItem && (
        <ItemModal itemId={selectedItem.id} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
