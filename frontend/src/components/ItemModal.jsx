import { useEffect, useState } from 'react'
import { fetchItemDetail, formatPrice, formatFloat } from '../api'
import './ItemModal.css'

export default function ItemModal({ itemId, onClose }) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!itemId) return
    setLoading(true)
    setError(null)
    fetchItemDetail(itemId)
      .then((data) => setItem(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [itemId])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={item ? {
          '--rarity-bg': item.rarity_bg,
          '--rarity-border': item.rarity_border,
        } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        {loading && <div className="modal-loading">Loading...</div>}
        {error && <div className="modal-error">Error: {error}</div>}
        {item && (
          <>
            <button className="modal-close" onClick={onClose}>✕</button>
            <div className="modal-grid">
              {/* Colonne gauche : image + infos */}
              <div className="modal-left">
                <div className="modal-image-wrap">
                  <img
                    src={item.icon_url}
                    alt={item.name}
                    className="modal-image"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <div className="modal-quick-stats">
                  <div className="modal-stat">
                    <span className="modal-stat-label">Float</span>
                    <span className="modal-stat-value">{formatFloat(item.float)}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="modal-stat-label">Wear</span>
                    <span className="modal-stat-value">{item.wear}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="modal-stat-label">Rarity</span>
                    <span className="modal-stat-value">{item.rarity}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="modal-stat-label">Platform</span>
                    <span className="modal-stat-value">{item.platform}</span>
                  </div>
                </div>
                <div className="modal-float-bar">
                  <div className="modal-float-bar-track">
                    <div className="modal-float-bar-marker" style={{ left: `${item.float * 100}%` }} />
                  </div>
                  <div className="modal-float-bar-labels">
                    <span>0.00</span>
                    <span>1.00</span>
                  </div>
                </div>
              </div>

              {/* Colonne droite : infos + graphique */}
              <div className="modal-right">
                <div className="modal-header">
                  <h2 className="modal-title">{item.name}</h2>
                  <div className="modal-badges">
                    <span className={`modal-wear-badge ${item.wear.toLowerCase().replace(/\s/g, '-')}`}>
                      {item.wear}
                    </span>
                    <span className={`modal-rarity-badge ${item.rarity_badge}`}>
                      {item.rarity}
                    </span>
                  </div>
                </div>

                <div className="modal-price-section">
                  <span className="modal-price-label">Price</span>
                  <span className="modal-price">{formatPrice(item.price)}</span>
                </div>

                {/* Graphique d'historique de prix */}
                <div className="modal-chart-section">
                  <div className="modal-chart-title">Price History (30 days)</div>
                  <PriceChart data={item.price_history} currentPrice={item.price} />
                </div>

                {/* Boutons d'action */}
                <div className="modal-actions">
                  <button className="modal-buy-btn">Buy Now · {formatPrice(item.price)}</button>
                  <button className="modal-secondary-btn">Add to Cart</button>
                </div>

                {/* Métadonnées */}
                <div className="modal-metadata">
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">Category</span>
                    <span className="modal-meta-value">{item.category}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">Volume</span>
                    <span className="modal-meta-value">{item.volume}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">Last Updated</span>
                    <span className="modal-meta-value">{item.updated_at || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PriceChart({ data, currentPrice }) {
  if (!data || data.length === 0) return <div className="modal-chart-empty">No data</div>

  const prices = data.map((d) => d.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const range = maxP - minP || 1

  const width = 380
  const height = 140
  const padding = { top: 10, right: 10, bottom: 24, left: 50 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW
    const y = padding.top + chartH - ((d.price - minP) / range) * chartH
    return { x, y, price: d.price }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`

  return (
    <svg className="modal-chart" viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      <defs>
        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(88, 166, 255, 0.3)" />
          <stop offset="100%" stopColor="rgba(88, 166, 255, 0)" />
        </linearGradient>
      </defs>
      {/* Lignes de grille */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={padding.left}
          x2={padding.left + chartW}
          y1={padding.top + chartH * t}
          y2={padding.top + chartH * t}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
      ))}
      {/* Labels Y */}
      <text x={padding.left - 6} y={padding.top + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">
        {formatPrice(maxP)}
      </text>
      <text x={padding.left - 6} y={padding.top + chartH + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">
        {formatPrice(minP)}
      </text>
      {/* Aire */}
      <path d={areaD} fill="url(#chart-grad)" />
      {/* Ligne */}
      <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" />
      {/* Point final */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="4"
        fill="var(--accent)"
        stroke="var(--bg-primary)"
        strokeWidth="2"
      />
    </svg>
  )
}
