import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBlogSlug } from '../../utils/getBlogSlug';
import DarkModeToggle from './DarkModeToggle';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  themeClass?: string;
  chambreNoireUrl?: string;
  hasCarnet?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ themeClass, chambreNoireUrl = '', hasCarnet = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const blogName = getBlogSlug(location.search);
  const s = location.search; // query strings
  const isPortfolio = themeClass === 'theme-portfolio';
  const { theme, toggleTheme } = useTheme();

  const formattedName = blogName ? blogName.charAt(0).toUpperCase() + blogName.slice(1) : 'Jac';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const getPortfolioUrl = () => {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) return `http://localhost:7090/?user=${blogName}`;
    return `https://${blogName}.helioscope.fr`;
  };

  const getCarnetUrl = () => {
    if (chambreNoireUrl && !chambreNoireUrl.includes('808') && !chambreNoireUrl.includes('/embed/')) {
      const sep = chambreNoireUrl.includes('?') ? '&' : '?';
      return `${chambreNoireUrl}${sep}from=blog`;
    }
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) return `http://localhost:7082/?user=${blogName}&from=blog`;
    return `https://${blogName}-carnet.helioscope.fr/?from=blog`;
  };

  // ── 1. RENDU SPÉCIFIQUE THÈME ARTFOLIO (SIDEBAR COLONNE À GAUCHE) ──
  if (isPortfolio) {
    return (
      <>
        {/* Desktop Sidebar (Colonne fixe à gauche) */}
        <aside className="blog-portfolio-sidebar hidden lg:flex">
          <div className="blog-portfolio-brand">
            <Link to={`/${s}`} className="blog-portfolio-logo">
              {formattedName}
            </Link>
            <span className="blog-portfolio-subtitle">BLOG PHOTOGRAPHIQUE</span>
          </div>

          <nav className="blog-portfolio-nav-wrapper">
            <ul className="blog-portfolio-menu">
              <li>
                <Link
                  to={`/${s}`}
                  className={`blog-portfolio-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                  Articles
                </Link>
              </li>
              <li>
                <Link
                  to={`/nouveautes${s}`}
                  className={`blog-portfolio-link ${location.pathname === '/nouveautes' ? 'active' : ''}`}
                >
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link
                  to={`/gallery${s}`}
                  className={`blog-portfolio-link ${location.pathname === '/gallery' ? 'active' : ''}`}
                >
                  Galeries
                </Link>
              </li>
              {hasCarnet && (
                <li>
                  <a
                    href={getCarnetUrl()}
                    className="blog-portfolio-link"
                  >
                    Carnet de route
                  </a>
                </li>
              )}
              <li>
                <a
                  href={getPortfolioUrl()}
                  className="blog-portfolio-link"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <Link
                  to={`/contact${s}`}
                  className={`blog-portfolio-link ${location.pathname === '/contact' ? 'active' : ''}`}
                >
                  Contact
                </Link>
              </li>

              {/* Bascule Thème Clair / Sombre dans la sidebar Artfolio */}
              <li className="blog-portfolio-theme-item">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="blog-portfolio-theme-btn"
                  title="Basculer entre le mode clair et le mode sombre"
                >
                  {theme === 'light' ? '🌙 Mode Sombre' : '☀️ Mode Clair'}
                </button>
              </li>
            </ul>
          </nav>

          <div className="blog-portfolio-sidebar-footer">
            <a
              href={getPortfolioUrl()}
              className="text-xs text-amber-500/80 hover:text-amber-400 transition font-mono"
            >
              &larr; Revenir au portfolio
            </a>
          </div>
        </aside>

        {/* Mobile Header pour Thème Artfolio (< 1024px) */}
        <div className="lg:hidden sticky top-0 z-50 bg-[var(--bg-main)]/95 border-b border-[var(--border-color)] backdrop-blur-md px-4 py-3 flex justify-between items-center transition-colors duration-200">
          <Link to={`/${s}`} className="blog-portfolio-logo text-2xl font-bold text-amber-500">
            {formattedName}
          </Link>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Drawer Mobile Thème Artfolio */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-[var(--bg-main)]/98 backdrop-blur-2xl p-6 overflow-y-auto animate-fadeIn border-t border-[var(--border-color)]">
            <ul className="space-y-4">
              <li>
                <Link
                  to={`/${s}`}
                  className={`block py-2 text-base uppercase font-semibold tracking-wider ${
                    location.pathname === '/' ? 'text-amber-500' : 'text-[var(--text-main)]'
                  }`}
                >
                  📝 Articles
                </Link>
              </li>
              <li>
                <Link
                  to={`/nouveautes${s}`}
                  className={`block py-2 text-base uppercase font-semibold tracking-wider ${
                    location.pathname === '/nouveautes' ? 'text-amber-500' : 'text-[var(--text-main)]'
                  }`}
                >
                  ⭐ Nouveautés
                </Link>
              </li>
              <li>
                <Link
                  to={`/gallery${s}`}
                  className={`block py-2 text-base uppercase font-semibold tracking-wider ${
                    location.pathname === '/gallery' ? 'text-amber-500' : 'text-[var(--text-main)]'
                  }`}
                >
                  🗂️ Galeries
                </Link>
              </li>
              {hasCarnet && (
                <li>
                  <a
                    href={getCarnetUrl()}
                    className="block py-2 text-base uppercase font-semibold tracking-wider text-[var(--text-main)]"
                  >
                    🎞️ Carnet de route
                  </a>
                </li>
              )}
              <li>
                <a
                  href={getPortfolioUrl()}
                  className="block py-2 text-base uppercase font-semibold tracking-wider text-[var(--text-main)]"
                >
                  🌍 Portfolio
                </a>
              </li>
              <li>
                <Link
                  to={`/contact${s}`}
                  className={`block py-2 text-base uppercase font-semibold tracking-wider ${
                    location.pathname === '/contact' ? 'text-amber-500' : 'text-[var(--text-main)]'
                  }`}
                >
                  ✉️ Contact
                </Link>
              </li>
              <li className="pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-2 py-2 text-sm uppercase font-semibold tracking-wider text-[var(--text-main)] opacity-90 hover:opacity-100"
                >
                  {theme === 'light' ? '🌙 Mode Sombre' : '☀️ Mode Clair'}
                </button>
              </li>
            </ul>
          </div>
        )}
      </>
    );
  }

  // ── 2. RENDU THÈME CLASSIQUE (BARRE HORIZONTALE EN HAUT) ──
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
          <div className="ml-2 pl-2 border-l border-black/[0.08] dark:border-white/[0.08] flex items-center theme-toggle-container">
            <DarkModeToggle />
          </div>
        </div>

        {/* Bouton Hamburger Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center mr-1">
            <DarkModeToggle />
          </div>
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
