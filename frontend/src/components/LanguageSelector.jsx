import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './LanguageSelector.css'

export default function LanguageSelector() {
  const { language, languages, changeLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = languages.find((l) => l.code === language) || languages[0]

  return (
    <div className="language-selector" ref={ref}>
      <button
        className="language-selector-button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="language-selector-code">{current.flag} {language}</span>
        <svg
          className={`language-selector-chevron ${open ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div className="language-dropdown" role="listbox">
          {languages.map((l) => (
            <button
              key={l.code}
              className={`language-option ${l.code === language ? 'active' : ''}`}
              onClick={() => {
                changeLanguage(l.code)
                setOpen(false)
              }}
              role="option"
              aria-selected={l.code === language}
            >
              <span className="language-option-flag">{l.flag}</span>
              <span className="language-option-code">{l.code}</span>
              <span className="language-option-name">{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
