const API_BASE = 'http://localhost:8000/api'

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function fetchItems(params = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      query.append(key, value)
    }
  }
  return fetchJSON(`${API_BASE}/items?${query.toString()}`)
}

export async function fetchItemDetail(id) {
  return fetchJSON(`${API_BASE}/items/${id}`)
}

export async function fetchCategories() {
  return fetchJSON(`${API_BASE}/categories`)
}

export async function fetchStats() {
  return fetchJSON(`${API_BASE}/stats`)
}

export function formatPrice(price) {
  if (price === null || price === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

export function formatFloat(f) {
  if (f === null || f === undefined) return '0.0000'
  return f.toFixed(4)
}

export function floatToPercent(f) {
  return `${(f * 100).toFixed(2)}%`
}

// Couleurs de la barre de float (comme CSFloat)
export const FLOAT_COLORS = [
  '#4b69ff', // 0.00-0.10 (FN)
  '#4b69ff',
  '#8847ff', // 0.10-0.20
  '#8847ff',
  '#d32ce6', // 0.20-0.30
  '#d32ce6',
  '#ffd700', // 0.30-0.40
  '#ffd700',
  '#ff4500', // 0.40-0.50
  '#ff4500',
]
