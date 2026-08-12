import { formatFloat } from '../api'
import { useCurrency } from '../contexts/CurrencyContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getSpecialMeta } from './SpecialFilter'
import './SkinCard.css'

/**
 * Carte d'un skin (style CSFloat).
 *
 * Layout (style CSFloat) :
 *  - Zone image (agrandie +20%) avec en haut-gauche le NOM de l'arme,
 *    juste en dessous le SPÉCIAL (StatTrak™/Souvenir) avec sa couleur + glow,
 *    et à droite du spécial l'ÉTAT de wear (Factory New...).
 *  - Zone infos (réduite -20%) : float bar, prix, rareté, bouton Buy Now.
 *
 * Conventions marketplaces CS2 : les noms d'items/wear/rareté restent en
 * anglais. Seul le bouton « Buy Now » est traduit.
 */
export default function SkinCard({ item, onClick }) {
  const { formatPrice } = useCurrency()
  const { t } = useLanguage()
  const special = getSpecialMeta(item)

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
        {/* Nom + spécial + état déplacés en haut-gauche de la zone image */}
        <div className="skin-card-overlay-top">
          <div className="skin-card-overlay-name" title={item.name}>
            {item.name}
          </div>
          <div className="skin-card-overlay-sub">
            {special && (
              <span
                className="skin-card-special"
                style={{
                  color: special.color,
                  textShadow: `0 0 8px ${special.color}, 0 0 14px ${special.color}80`,
                }}
              >
                {t(special.tKey)}
                {special.tm ? <sup className="skin-card-special-tm">™</sup> : null}
              </span>
            )}
            {item.wear && (
              <span className="skin-card-overlay-wear">{item.wear}</span>
            )}
          </div>
        </div>

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
        <div className="skin-card-float-bar">
          <div className="skin-card-float-bar-track">
            <div className="skin-card-float-bar-fill" style={{ width: `${item.float * 100}%` }} />
            <div className="skin-card-float-bar-marker" style={{ left: `${item.float * 100}%` }} />
          </div>
        </div>
        <div className="skin-card-float-label">{formatFloat(item.float)}</div>
        <div className="skin-card-footer">
          <span className="skin-card-price">{formatPrice(item.price)}</span>
          <span className={`skin-card-rarity-badge ${item.rarity_badge}`}>
            {item.rarity}
          </span>
        </div>
        <button className="skin-card-buy-btn">{t('modal.buyNow')}</button>
      </div>
    </div>
  )
}
