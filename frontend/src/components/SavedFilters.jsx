import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './SavedFilters.css'

const STORAGE_KEY = 'tp-saved-filters'

/**
 * 💾 Sauvegarde de paquets de filtres personnalisés (localStorage).
 * Au clic sur l'emoji, ouvre un popup : un champ pour nommer le paquet
 * courant + bouton Enregistrer, et en dessous la liste des paquets
 * enregistrés (cliquables pour appliquer, bouton supprimer).
 */
export default function SavedFilters({ filters, onApply }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saved, setSaved] = useState([])
  const wrapRef = useRef(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setSaved(raw ? JSON.parse(raw) : [])
    } catch {
      setSaved([])
    }
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const persist = (list) => {
    setSaved(list)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      /* ignore */
    }
  }

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const entry = { id: Date.now(), name: trimmed, filters: { ...filters } }
    persist([entry, ...saved])
    setName('')
  }

  const remove = (id) => persist(saved.filter((s) => s.id !== id))

  const apply = (entry) => {
    onApply({ ...entry.filters, page: 1 })
    setOpen(false)
  }

  return (
    <div className="saved-filters" ref={wrapRef}>
      <button
        className={`toolbar-icon-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title={t('save.title')}
      >
        <span className="toolbar-emoji">💾</span>
      </button>
      {open && (
        <div className="saved-filters-popup">
          <div className="saved-filters-title">{t('save.title')}</div>
          <div className="saved-filters-input-row">
            <input
              type="text"
              placeholder={t('save.placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              autoFocus
            />
            <button className="saved-filters-save-btn" onClick={save} disabled={!name.trim()}>
              {t('save.save')}
            </button>
          </div>
          <div className="saved-filters-list">
            {saved.length === 0 ? (
              <div className="saved-filters-empty">{t('save.empty')}</div>
            ) : (
              saved.map((entry) => (
                <div key={entry.id} className="saved-filters-item">
                  <button
                    className="saved-filters-item-name"
                    onClick={() => apply(entry)}
                    title={entry.name}
                  >
                    {entry.name}
                  </button>
                  <button
                    className="saved-filters-item-delete"
                    onClick={() => remove(entry.id)}
                    title={t('save.delete')}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
