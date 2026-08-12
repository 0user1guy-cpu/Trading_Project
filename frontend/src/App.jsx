import { useState } from 'react'
import Navbar from './components/Navbar'
import FilterSidebar from './components/FilterSidebar'
import MarketGrid from './components/MarketGrid'
import './App.css'

const DEFAULT_FILTERS = {
  q: '',
  category: null,
  float_min: 0.0,
  float_max: 1.0,
  price_min: null,
  price_max: null,
  wear: null,
  sort: 'price_asc',
  page: 1,
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('market')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="app">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="app-body">
        {currentPage === 'market' ? (
          <>
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
            <MarketGrid filters={filters} setFilters={setFilters} />
          </>
        ) : (
          <div className="app-placeholder">
            <h1>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
            <p>This page is part of the Streamlit app. Switch to Market to see the new interface.</p>
          </div>
        )}
      </div>
    </div>
  )
}
