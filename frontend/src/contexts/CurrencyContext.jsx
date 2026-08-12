import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

/**
 * Contexte de devise.
 *
 * Fournit une devise active + un formatage de prix qui convertit depuis l'USD
 * (devise de base de la DB) vers la devise choisie par l'utilisateur.
 *
 * Indépendant de la source des items : tant qu'un item expose un champ `price`
 * exprimé en USD, `formatPrice(item.price)` renvoie la valeur convertie et
 * formatée dans la devise active. Changer de source de données (openskin,
 * CSFloat API, etc.) ne casse pas la conversion.
 *
 * Taux de change récupérés depuis une API publique sans clé
 * (open.er-api.com /v6/latest/USD), avec repli sur des taux figés.
 */

// Les ~10 monnaies les plus utilisées au monde (par volume de transactions / usage).
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', locale: 'en-AU' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', locale: 'de-CH' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR' },
]

// Taux figés de repli (USD = 1) si l'API de taux est indisponible.
const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 157.0,
  CNY: 7.24,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.88,
  INR: 83.5,
  BRL: 5.05,
}

const STORAGE_KEY = 'tp-currency'

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'USD'
    } catch {
      return 'USD'
    }
  })
  const [rates, setRates] = useState(FALLBACK_RATES)
  const [loading, setLoading] = useState(true)

  // Récupère les taux de change depuis l'API publique (sans clé).
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data && data.rates) {
          // On ne garde que les devises gérées, + USD implicite.
          const filtered = { USD: 1 }
          for (const c of CURRENCIES) {
            if (c.code !== 'USD' && data.rates[c.code]) {
              filtered[c.code] = data.rates[c.code]
            }
          }
          setRates(filtered)
        }
      })
      .catch(() => {
        // On garde les taux figés en cas d'échec réseau.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Persiste le choix de devise.
  const changeCurrency = useCallback((code) => {
    setCurrency(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      /* ignore */
    }
  }, [])

  // Devise courante (objet meta).
  const current = useMemo(
    () => CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0],
    [currency],
  )

  // Convertit un prix USD vers la devise active.
  const convert = useCallback(
    (usdPrice) => {
      if (usdPrice === null || usdPrice === undefined) return 0
      const rate = rates[currency] ?? 1
      return usdPrice * rate
    },
    [rates, currency],
  )

  // Formate un prix USD dans la devise active ( Intl ).
  const formatPrice = useCallback(
    (usdPrice) => {
      const value = convert(usdPrice)
      // Le JPY n'utilise pas de décimales.
      const minDigits = currency === 'JPY' ? 0 : 2
      const maxDigits = currency === 'JPY' ? 0 : 2
      try {
        return new Intl.NumberFormat(current.locale, {
          style: 'currency',
          currency: current.code,
          minimumFractionDigits: minDigits,
          maximumFractionDigits: maxDigits,
        }).format(value)
      } catch {
        return `${current.symbol}${value.toFixed(maxDigits)}`
      }
    },
    [convert, currency, current],
  )

  const value = useMemo(
    () => ({
      currency,
      current,
      rates,
      loading,
      currencies: CURRENCIES,
      changeCurrency,
      convert,
      formatPrice,
    }),
    [currency, current, rates, loading, changeCurrency, convert, formatPrice],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency doit être utilisé dans <CurrencyProvider>')
  }
  return ctx
}
