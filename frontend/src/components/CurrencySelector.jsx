import { useState, useRef, useEffect } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import './CurrencySelector.css'

export default function CurrencySelector() {
  const { currency, current, currencies, changeCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Ferme la dropdown au clic extérieur.
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="currency-selector" ref={ref}>
      <button
        className="currency-selector-button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Choisir la devise"
      >
        <span className="currency-selector-code">{currency}</span>
        <svg
          className={`currency-selector-chevron ${open ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div className="currency-dropdown" role="listbox">
          {currencies.map((c) => (
            <button
              key={c.code}
              className={`currency-option ${c.code === currency ? 'active' : ''}`}
              onClick={() => {
                changeCurrency(c.code)
                setOpen(false)
              }}
              role="option"
              aria-selected={c.code === currency}
            >
              <span className="currency-option-code">{c.code}</span>
              <span className="currency-option-name">{c.name}</span>
              <span className="currency-option-symbol">{c.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
