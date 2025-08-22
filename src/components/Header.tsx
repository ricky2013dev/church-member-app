import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = user?.group_code === 'ADM';
  const isTeamMember = user?.group_code === 'NOR';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-main">
          <div className="header-left">
            <h1 className="header-title hidden-mobile">
              {import.meta.env.VITE_APP_TITLE || 'New Member'}
            </h1>

            <nav className="header-nav desktop-nav">
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                {t('dashboard')}
              </Link>
              <Link
                to="/search"
                className={`nav-link ${isActive('/search') ? 'active' : ''}`}
              >
                {t('searchMember')}
              </Link>
              <Link
                to="/add"
                className={`nav-link ${isActive('/add') ? 'active' : ''}`}
              >
                {t('addNew')}
              </Link>
              <Link
                to="/supporters"
                className={`nav-link ${isActive('/supporters') ? 'active' : ''}`}
              >
                Supporters
              </Link>
              {isAdmin && (
                <Link
                  to="/events"
                  className={`nav-link ${isActive('/events') ? 'active' : ''}`}
                >
                  Events
                </Link>
              )}
              {isTeamMember && (
                <Link
                  to="/event-response"
                  className={`nav-link ${isActive('/event-response') ? 'active' : ''}`}
                >
                  Events
                </Link>
              )}
            </nav>
          </div>

          <div className="header-right">
            <div
              className="user-info"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginRight: '0.5rem',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {user?.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt={user.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                    }}
                  >
                    {user?.gender === 'male' ? '👨' : '👩'}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '0.9rem',
                    paddingRight: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: '800', color: '#79899fff' }}>
                    {user?.name}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>

            <div className="language-toggle">
              <button
                onClick={() => setLanguage('ko')}
                className={`language-btn ${language === 'ko' ? 'active' : ''}`}
              >
                KR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`language-btn ${language === 'en' ? 'active' : ''}`}
              >
                EN
              </button>
            </div>

            <button
              className="mobile-menu-btn"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              <span className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>

        <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            {t('dashboard')}
          </Link>
          <Link
            to="/search"
            className={`mobile-nav-link ${isActive('/search') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            {t('searchMember')}
          </Link>
          <Link
            to="/add"
            className={`mobile-nav-link ${isActive('/add') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            {t('addNew')}
          </Link>
          <Link
            to="/supporters"
            className={`mobile-nav-link ${isActive('/supporters') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Supporters
          </Link>
          {isAdmin && (
            <Link
              to="/events"
              className={`mobile-nav-link ${isActive('/events') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Events
            </Link>
          )}
          {isTeamMember && (
            <Link
              to="/event-response"
              className={`mobile-nav-link ${isActive('/event-response') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Events
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
