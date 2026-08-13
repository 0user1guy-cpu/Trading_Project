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
          <svg className="navbar-logo-icon" width="40" height="22" viewBox="0 0 130 70" fill="none" aria-hidden="true">
            <g stroke="#e8b339" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M14 24 L40 24 L46 20 L52 20 L56 24 L118 24 L122 22 L126 26 L122 28 L96 28 L90 33 L84 33 C 84 44 84 52 80 58 C 76 61 71 60 70 55 C 69 49 71 40 74 33 L64 33 C 64 41 62 50 58 54 C 55 57 52 55 53 50 C 54 43 56 38 58 33 L52 33 L46 28 L40 28 L24 34 L14 32 C 11 30 11 26 14 24 Z" />
              <path d="M70 33 C 68 37 68 40 71 41 C 76 41 78 39 78 35" />
              <path d="M58 28 L58 33 M74 28 L74 33" />
              <path d="M84 24 L84 20 L88 20 L88 24" />
            </g>
          </svg>
          <span className="navbar-logo-text">Afather<span className="navbar-logo-accent">Dream</span></span>
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
