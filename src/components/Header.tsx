import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-title">
            {import.meta.env.VITE_APP_TITLE || 'Church Member Management'}
          </h1>
          
          <nav className="header-nav">
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
          </nav>
        </div>

        <div className="header-right">
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
        </div>
      </div>
    </header>
  );
};

export default Header;