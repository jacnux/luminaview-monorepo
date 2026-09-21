import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBlogSlug } from '../../utils/getBlogSlug';
import { getMainAppUrl } from '../../utils/blogApi';
import DarkModeToggle from './DarkModeToggle';

interface NavbarProps {
  themeClass?: string;
  chambreNoireUrl?: string;
  hasCarnet?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ themeClass, chambreNoireUrl = '', hasCarnet = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const blogName = getBlogSlug(location.search);
  const s = location.search; // raccourci pour les query strings
  const isPortfolio = themeClass === 'theme-portfolio';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `nav-link px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
      isActive 
        ? 'nav-link-active text-amber-600 dark:text-amber-400 font-semibold border-b-2 border-amber-600 dark:border-amber-400 rounded-none bg-amber-500/[0.04] dark:bg-amber-500/[0.06]' 
        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
    }`;
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30'
        : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
    }`;
  };

  const getPortfolioUrl = () => {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) return `http://localhost:7090/?user=${blogName}`;
    return `https://${blogName}.helioscope.fr`;
  };

  const getCarnetUrl = () => {
    if (chambreNoireUrl && !chambreNoireUrl.includes('808') && !chambreNoireUrl.includes('/embed/')) {
      return chambreNoireUrl;
    }
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) return `http://localhost:7082/?user=${blogName}`;
    return `https://${blogName}.helioscope.fr/carnet`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/85 dark:bg-gray-950/85 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.06] shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3.5">
        <Link to={`/${s}`} className="blog-logo text-base sm:text-lg font-bold tracking-wider text-black dark:text-white hover:opacity-85 transition duration-200 truncate mr-2">
          HELIOSCOPE <span style={{ color: 'var(--primary)' }} className="text-amber-600 dark:text-amber-500 font-medium">/ {blogName.toUpperCase()}</span>
        </Link>

        {/* Navigation Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link to={`/${s}`} className={getLinkClass('/')}>Articles</Link>
          <Link to={`/nouveautes${s}`} className={getLinkClass('/nouveautes')}>Nouveautés</Link>
          <Link to={`/gallery${s}`} className={getLinkClass('/gallery')}>Galeries</Link>
          {hasCarnet && (
            <a href={getCarnetUrl()} className={getLinkClass('/carnet')}>Carnet de route</a>
          )}
          <a href={getPortfolioUrl()} className="nav-link px-3.5 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition duration-200">Portfolio</a>
          <Link to={`/contact${s}`} className={getLinkClass('/contact')}>Contact</Link>
          {!isPortfolio && (
            <div className="ml-2 pl-2 border-l border-black/[0.08] dark:border-white/[0.08] flex items-center theme-toggle-container">
              <DarkModeToggle />
            </div>
          )}
        </div>

        {/* Bouton Hamburger Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          {!isPortfolio && (
            <div className="flex items-center mr-1">
              <DarkModeToggle />
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition"
            aria-label="Menu principal"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu Drawer Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/[0.06] dark:border-white/[0.06] bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl px-4 py-3 space-y-1 shadow-2xl transition-all animate-fadeIn">
          <Link to={`/${s}`} className={getMobileLinkClass('/')}>
            📝 Articles
          </Link>
          <Link to={`/nouveautes${s}`} className={getMobileLinkClass('/nouveautes')}>
            ⭐ Nouveautés
          </Link>
          <Link to={`/gallery${s}`} className={getMobileLinkClass('/gallery')}>
            🗂️ Galeries
          </Link>
          {hasCarnet && (
            <a href={getCarnetUrl()} className={getMobileLinkClass('/carnet')}>
              🎞️ Carnet de route
            </a>
          )}
          <a href={getPortfolioUrl()} className={getMobileLinkClass('/portfolio')}>
            🌍 Portfolio
          </a>
          <Link to={`/contact${s}`} className={getMobileLinkClass('/contact')}>
            ✉️ Contact
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
