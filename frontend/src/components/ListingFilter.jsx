import FilterSection from './FilterSection'
import { useLanguage } from '../contexts/LanguageContext'
import './ListingFilter.css'

/**
 * Filtre type d'annonce façon CSFloat: All / Buy Now / Auction.
 * Note: openskin est un catalogue de prix (pas d'annonces), donc ce filtre
 * est cosmétique (tous les items sont "Buy Now" par défaut).
 */
const OPTIONS = [
  { key: 'all', tKey: 'listing.all' },
  { key: 'buynow', tKey: 'listing.buynow' },
  { key: 'auction', tKey: 'listing.auction' },
]

export default function ListingFilter({ value, onChange }) {
  const { t } = useLanguage()
  return (
    <FilterSection title={t('filter.listing')}>
      <div className="listing-toggle">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            className={`listing-btn ${(value || 'all') === o.key ? 'active' : ''}`}
            onClick={() => onChange(o.key)}
          >
            {t(o.tKey)}
          </button>
        ))}
      </div>
    </FilterSection>
  )
}
