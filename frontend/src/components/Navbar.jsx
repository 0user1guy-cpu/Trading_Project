import CurrencySelector from './CurrencySelector'
import LanguageSelector from './LanguageSelector'
import { useLanguage } from '../contexts/LanguageContext'
import './Navbar.css'

const NAV_LINKS = [
  { key: 'home', page: 'home', tKey: 'nav.home' },
  { key: 'analytics', page: 'analytics', tKey: 'nav.analytics' },
  { key: 'market', page: 'market', tKey: 'nav.market' },
  { key: 'data-market', page: 'data-market', tKey: 'nav.dataMarket' },
]

export default function Navbar({ currentPage, onNavigate }) {
  const { t } = useLanguage()
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => onNavigate('home')}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 4 L26 10 V22 L16 28 L6 22 V10 Z" fill="none" stroke="#58a6ff" strokeWidth="2" />
            <circle cx="16" cy="16" r="3.5" fill="#58a6ff" />
          </svg>
          <span className="navbar-logo-text">Trading<span className="navbar-logo-accent">Project</span></span>
        </div>
        <div className="navbar-links">
          {NAV_LINKS.map((link) => (
            <button
              key={link.key}
              className={`navbar-link ${currentPage === link.page ? 'active' : ''}`}
              onClick={() => onNavigate(link.page)}
            >
              {t(link.tKey)}
            </button>
          ))}
        </div>
      </div>
      <div className="navbar-right">
        <CurrencySelector />
        <LanguageSelector />
        <button className="navbar-login-btn">{t('nav.signIn')}</button>
      </div>
    </nav>
  )
}
