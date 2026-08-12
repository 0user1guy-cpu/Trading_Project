import FilterSection from './FilterSection'
import './ListingFilter.css'

/**
 * Filtre type d'annonce façon CSFloat: All / Buy Now / Auction.
 * Note: openskin est un catalogue de prix (pas d'annonces), donc ce filtre
 * est cosmétique (tous les items sont "Buy Now" par défaut).
 */
const OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'buynow', label: 'Buy Now' },
  { key: 'auction', label: 'Auction' },
]

export default function ListingFilter({ value, onChange }) {
  return (
    <FilterSection title="Listing">
      <div className="listing-toggle">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            className={`listing-btn ${(value || 'all') === o.key ? 'active' : ''}`}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </FilterSection>
  )
}
