import { useEffect, useRef, useState } from 'react'
import './FilterSection.css'

/**
 * Section de filtre repliable avec une zone dépliable (children).
 * `summary` = contenu affiché à droite du titre quand replié (optionnel).
 */
export default function FilterSection({ title, summary, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`filter-section ${open ? 'open' : ''}`}>
      <button className="filter-section-header" onClick={() => setOpen((o) => !o)}>
        <svg className={`filter-section-chevron ${open ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24">
          <path d="M9 6l6 6-6 6V6z" fill="currentColor" />
        </svg>
        <span className="filter-section-title">{title}</span>
        {summary && !open && <span className="filter-section-summary">{summary}</span>}
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  )
}

/**
 * Bouton déclencheur de popup (style CSFloat). `label` = petite étiquette
 * au-dessus, `value` = valeur sélectionnée.
 */
export function FilterTrigger({ label, value, onClick, open }) {
  return (
    <button className={`filter-trigger ${open ? 'open' : ''}`} onClick={onClick}>
      {label && <span className="filter-trigger-label">{label}</span>}
      <span className="filter-trigger-value">{value}</span>
      <svg className={`filter-trigger-chevron ${open ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24">
        <path d="M7 10l5 5 5-5z" fill="currentColor" />
      </svg>
    </button>
  )
}

/**
 * Popup générique qui se ferme au clic extérieur. Doit être wrappé dans un
 * parent position:relative.
 */
export function usePopup() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])
  return { open, setOpen, ref }
}
