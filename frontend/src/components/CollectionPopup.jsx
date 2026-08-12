import { useEffect, useState } from 'react'
import { fetchCollections } from '../api'
import { usePopup, FilterTrigger } from './FilterSection'
import { useLanguage } from '../contexts/LanguageContext'
import './CollectionPopup.css'

export default function CollectionPopup({ value, onChange }) {
  const { t } = useLanguage()
  const { open, setOpen, ref } = usePopup()
  const [collections, setCollections] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchCollections()
      .then((cs) => setCollections(cs.map((c) => c.name)))
      .catch((e) => console.error('Failed to load collections:', e))
  }, [])

  const filtered = collections.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="collection-popup-wrap" ref={ref}>
      <FilterTrigger
        label={t('filter.collection')}
        value={value || t('filter.any')}
        onClick={() => setOpen((o) => !o)}
        open={open}
      />
      {open && (
        <div className="collection-popup">
          <div className="collection-popup-search">
            <input
              type="text"
              placeholder={t('collection.filterPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="collection-popup-list">
            <button
              className={`collection-popup-item ${!value ? 'active' : ''}`}
              onClick={() => { onChange(null); setOpen(false); setQuery('') }}
            >
              <span className="collection-popup-dot" />
              <span className="collection-popup-name">{t('filter.any')}</span>
            </button>
            {filtered.map((c) => (
              <button
                key={c}
                className={`collection-popup-item ${value === c ? 'active' : ''}`}
                onClick={() => { onChange(c); setOpen(false); setQuery('') }}
              >
                <span className="collection-popup-dot" />
                <span className="collection-popup-name">{c}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="collection-popup-empty">{t('collection.noMatch')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
