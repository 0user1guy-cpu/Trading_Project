import { formatPrice, formatFloat } from '../api'
import './SkinCard.css'

export default function SkinCard({ item, onClick }) {
  return (
    <div
      className="skin-card"
      style={{
        '--rarity-bg': item.rarity_bg,
        '--rarity-border': item.rarity_border,
        '--rarity-color': item.rarity_color || '#b0c3d9',
      }}
      onClick={() => onClick(item)}
    >
      <div className="skin-card-image-wrap">
        <div className="skin-card-stickers">
          <div className="skin-card-sticker-slot" />
          <div className="skin-card-sticker-slot" />
          <div className="skin-card-sticker-slot" />
          <div className="skin-card-sticker-slot" />
        </div>
        <img
          src={item.icon_url}
          alt={item.name}
          className="skin-card-image"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="skin-card-hover-actions">
          <span className="skin-card-hover-icon" title="Inspect">📷</span>
        </div>
      </div>

      <div className="skin-card-info">
        <div className="skin-card-name" title={item.name}>
          {item.name}
        </div>
        <div className="skin-card-wear-row">
          <span className={`skin-card-wear-badge ${item.wear.toLowerCase().replace(/\s/g, '-')}`}>
            {item.wear}
          </span>
          <span className="skin-card-float">{formatFloat(item.float)}</span>
        </div>
        <div className="skin-card-float-bar">
          <div className="skin-card-float-bar-track">
            <div className="skin-card-float-bar-fill" style={{ width: `${item.float * 100}%` }} />
            <div className="skin-card-float-bar-marker" style={{ left: `${item.float * 100}%` }} />
          </div>
        </div>
        <div className="skin-card-footer">
          <span className="skin-card-price">{formatPrice(item.price)}</span>
          <span className={`skin-card-rarity-badge ${item.rarity_badge}`}>
            {item.rarity}
          </span>
        </div>
        <button className="skin-card-buy-btn">Buy Now</button>
      </div>
    </div>
  )
}
