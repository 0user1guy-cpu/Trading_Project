import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './MarketToolbar.css'

/**
 * Barre d'outils sous la barre de catégories, façon CSFloat.
 * De gauche à droite :
 *  - 🔄 Actualiser (refetch sans reset les filtres)
 *  - toggle Tous les skins / Combos de stickers (pause) / Objets uniques
 *  - dropdown de tri (icône "chapeau numérique" ▾) : 10 options CSFloat,
 *    4 actives et 6 en pause (grisées, non supprimées).
 *
 * `onRefresh` : callback pour recharger les items (sans toucher aux filtres).
 * `view` / `onViewChange` : mode de vue (all/combos/unique).
 * `sort` / `onSortChange` : tri actif.
 */
const SORT_OPTIONS = [
  { key: 'bestDeals', value: null, paused: true },
  { key: 'highestDiscount', value: null, paused: true },
  { key: 'mostRecent', value: null, paused: true },
  { key: 'priceLow', value: 'price_asc', paused: false },
  { key: 'priceHigh', value: 'price_desc', paused: false },
  { key: 'floatLow', value: 'float_asc', paused: false },
  { key: 'floatHigh', value: 'float_desc', paused: false },
  { key: 'floatRank', value: null, paused: true },
  { key: 'expiringSoon', value: null, paused: true },
  { key: 'numBids', value: null, paused: true },
]

const VIEW_OPTIONS = [
  { key: 'all', paused: false },
  { key: 'combos', paused: true },
  { key: 'unique', paused: false },
]

export default function MarketToolbar({ onRefresh, view, onViewChange, sort, onSortChange }) {
  const { t } = useLanguage()
  const [sortOpen, setSortOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const sortRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const activeSortOption = SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[3]

  const handleRefresh = () => {
    setRefreshing(true)
    onRefresh()
    setTimeout(() => setRefreshing(false), 700)
  }

  const selectSort = (opt) => {
    if (opt.paused) return
    onSortChange(opt.value)
    setSortOpen(false)
  }

  return (
    <div className="market-toolbar-row">
      {/* 🔄 Actualiser */}
      <button
        className={`toolbar-icon-btn ${refreshing ? 'spinning' : ''}`}
        onClick={handleRefresh}
        title={t('refresh.tooltip')}
      >
        <span className="toolbar-emoji">🔄</span>
      </button>

      {/* Toggle de vue : Tous les skins / Combos / Objets uniques */}
      <div className="view-toggle">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`view-toggle-btn ${view === opt.key ? 'active' : ''} ${opt.paused ? 'paused' : ''}`}
            onClick={() => !opt.paused && onViewChange(opt.key)}
            title={opt.paused ? t('toolbar.paused') : ''}
            disabled={opt.paused}
          >
            {t(`view.${opt.key}`)}
          </button>
        ))}
      </div>

      {/* Dropdown de tri (chapeau numérique ▾) */}
      <div className="sort-dropdown" ref={sortRef}>
        <button
          className={`sort-dropdown-trigger ${sortOpen ? 'open' : ''}`}
          onClick={() => setSortOpen((o) => !o)}
          title={t('sort.label')}
        >
          <svg className="sort-hat-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7l9-4 9 4-9 4-9-4z" />
            <path d="M7 10v5c0 1 2 3 5 3s5-2 5-3v-5" />
          </svg>
          <span className="sort-dropdown-label">{t(`sort.${activeSortOption.key}`)}</span>
          <svg className={`sort-dropdown-chevron ${sortOpen ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
        {sortOpen && (
          <div className="sort-dropdown-menu">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`sort-dropdown-item ${sort === opt.value && !opt.paused ? 'active' : ''} ${opt.paused ? 'paused' : ''}`}
                onClick={() => selectSort(opt)}
                title={opt.paused ? t('toolbar.paused') : ''}
                disabled={opt.paused}
              >
                <span className="sort-dropdown-item-name">{t(`sort.${opt.key}`)}</span>
                {opt.paused && <span className="sort-dropdown-item-badge" title={t('toolbar.paused')}>⏸</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
