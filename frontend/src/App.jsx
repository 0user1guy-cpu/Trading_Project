import { useState, useCallback } from 'react'
import { CurrencyProvider } from './contexts/CurrencyContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Navbar from './components/Navbar'
import CategoryBar from './components/CategoryBar'
import FilterSidebar from './components/FilterSidebar'
import MarketGrid from './components/MarketGrid'
import SavedFilters from './components/SavedFilters'
import MarketToolbar from './components/MarketToolbar'
import './App.css'

const DEFAULT_FILTERS = {
  q: '',
  category: null,
  float_min: 0.0,
  float_max: 1.0,
  price_min: null,
  price_max: null,
  wear: null,
  stattrak: null,
  souvenir: null,
  collection: null,
  pattern: null,
  listing: 'all',
  special: null,
  stickers: null,
  sort: 'price_asc',
  page: 1,
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('market')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [view, setView] = useState('all')
  const [refreshTick, setRefreshTick] = useState(0)

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const handleRefresh = useCallback(() => {
    setRefreshTick((n) => n + 1)
  }, [])

  return (
    <LanguageProvider>
      <CurrencyProvider>
        <div className="app">
          <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
          <div className="app-body">
            {currentPage === 'market' ? (
              <>
                <FilterSidebar filters={filters} onFilterChange={setFilters} />
                <div className="market-main">
                  <div className="market-toolbar">
                    <CategoryBar filters={filters} onFilterChange={setFilters} />
                  </div>
                  <div className="market-toolbar-row-wrap">
                    <SavedFilters filters={filters} onApply={setFilters} />
                    <MarketToolbar
                      onRefresh={handleRefresh}
                      view={view}
                      onViewChange={setView}
                      sort={filters.sort}
                      onSortChange={(s) => setFilters({ ...filters, sort: s, page: 1 })}
                    />
                  </div>
                  <MarketGrid
                    key={refreshTick}
                    filters={filters}
                    setFilters={setFilters}
                  />
                </div>
              </>
            ) : (
              <div className="app-placeholder">
                <h1>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
                <p>This page is part of the Streamlit app. Switch to Market to see the new interface.</p>
              </div>
            )}
          </div>
        </div>
      </CurrencyProvider>
    </LanguageProvider>
  )
}
