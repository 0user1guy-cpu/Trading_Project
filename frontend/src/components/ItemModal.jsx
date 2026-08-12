import { useEffect, useState } from 'react'
import { fetchItemDetail, formatFloat } from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getSpecialMeta } from './SpecialFilter'
import './ItemModal.css'

export default function ItemModal({ itemId, onClose }) {
  const { formatPrice } = useCurrency()
  const { t } = useLanguage()
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
          '--rarity-color': item.rarity_color || '#b0c3d9',
        } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        {loading && <div className="modal-loading">{t('grid.loading')}</div>}
        {error && <div className="modal-error">{error}</div>}
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
                    <span className="modal-stat-label">{t('modal.float')}</span>
                    <span className="modal-stat-value">{formatFloat(item.float)}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="modal-stat-label">{t('modal.wear')}</span>
                    <span className="modal-stat-value">{item.wear}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="modal-stat-label">{t('modal.rarity')}</span>
                    <span className="modal-stat-value">{item.rarity}</span>
                  </div>
                  <div className="modal-stat">
                    <span className="modal-stat-label">{t('modal.platform')}</span>
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
                  <h2
                    className="modal-title"
                    style={
                      getSpecialMeta(item)
                        ? {
                            color: getSpecialMeta(item).color,
                            textShadow: `0 0 10px ${getSpecialMeta(item).color}, 0 0 18px ${getSpecialMeta(item).color}80`,
                          }
                        : undefined
                    }
                  >
                    {item.name}
                  </h2>
                  <div className="modal-badges">
                    {getSpecialMeta(item) && (
                      <span
                        className="modal-special-badge"
                        style={{
                          color: getSpecialMeta(item).color,
                          boxShadow: `0 0 8px ${getSpecialMeta(item).color}80`,
                          borderColor: getSpecialMeta(item).color,
                        }}
                      >
                        {t(getSpecialMeta(item).tKey)}
                        {getSpecialMeta(item).tm ? <sup className="modal-special-tm">™</sup> : null}
                      </span>
                    )}
                    <span className={`modal-wear-badge ${item.wear.toLowerCase().replace(/\s/g, '-')}`}>
                      {item.wear}
                    </span>
                    <span className={`modal-rarity-badge ${item.rarity_badge}`}>
                      {item.rarity}
                    </span>
                  </div>
                </div>

                <div className="modal-price-section">
                  <span className="modal-price-label">{t('modal.price')}</span>
                  <span className="modal-price">{formatPrice(item.price)}</span>
                </div>

                {/* Graphique d'historique de prix */}
                <div className="modal-chart-section">
                  <div className="modal-chart-title">{t('modal.priceHistory')}</div>
                  <PriceChart data={item.price_history} currentPrice={item.price} formatPrice={formatPrice} t={t} />
                </div>

                {/* Boutons d'action */}
                <div className="modal-actions">
                  <button className="modal-buy-btn">{t('modal.buyNow')} · {formatPrice(item.price)}</button>
                  <button className="modal-secondary-btn">{t('modal.addToCart')}</button>
                </div>

                {/* Métadonnées */}
                <div className="modal-metadata">
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">{t('modal.category')}</span>
                    <span className="modal-meta-value">{item.category}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">{t('modal.volume')}</span>
                    <span className="modal-meta-value">{item.volume}</span>
                  </div>
                  <div className="modal-meta-row">
                    <span className="modal-meta-label">{t('modal.lastUpdated')}</span>
                    <span className="modal-meta-value">{item.updated_at || t('common.na')}</span>
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

function PriceChart({ data, currentPrice, formatPrice, t }) {
  if (!data || data.length === 0) return <div className="modal-chart-empty">{t ? t('modal.noData') : 'No data'}</div>

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
