import './Navbar.css'

const NAV_LINKS = [
  { label: 'Home', page: 'home' },
  { label: 'Analytics', page: 'analytics' },
  { label: 'Market', page: 'market' },
  { label: 'Data Market', page: 'data-market' },
]

export default function Navbar({ currentPage, onNavigate }) {
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
              key={link.label}
              className={`navbar-link ${currentPage === link.page ? 'active' : ''}`}
              onClick={() => onNavigate(link.page)}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
      <div className="navbar-right">
        <div className="navbar-selector">
          <span className="navbar-selector-value">USD</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
        <div className="navbar-selector">
          <span className="navbar-selector-value">FR</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
        <button className="navbar-login-btn">Sign In</button>
      </div>
    </nav>
  )
}
