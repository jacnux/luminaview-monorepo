import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, UserPage, Album } from '../types';

interface HeaderProps {
  profile: UserProfile | null;
  pages: UserPage[];
  albums?: Album[];
  currentPage: string;
  currentPageData: UserPage | null;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  navigateTo: (page: 'home' | 'galleries' | 'album' | 'about' | 'contact' | 'page' | 'series' | 'exhibitions', albumId?: string | null) => void;
  navigateToPage: (slug: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const formatName = (name?: string): string => {
  if (!name) return 'Jac';
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Jac';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const getBlogUrl = (name?: string): string => {
  if (!name) return '#';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal
    ? `http://localhost:7081/?user=${name.toLowerCase()}`
    : `https://${name.toLowerCase()}-blog.helioscope.fr`;
};

const getCarnetUrl = (name?: string, customUrl?: string): string => {
  if (customUrl && customUrl.trim() && !customUrl.includes('808') && !customUrl.includes('/embed/')) {
    return customUrl;
  }
  if (!name) return '#';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal
    ? `http://localhost:7082/?user=${name.toLowerCase()}`
    : `https://${name.toLowerCase()}-carnet.helioscope.fr`;
};

const Header: React.FC<HeaderProps> = ({
  profile,
  pages,
  albums = [],
  currentPage,
  currentPageData,
  menuOpen,
  setMenuOpen,
  navigateTo,
  navigateToPage,
  theme,
  toggleTheme,
}) => {
  const [seriesExpanded, setSeriesExpanded] = useState(false);
  const [exhibitionsExpanded, setExhibitionsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fermer la recherche lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Résultats de recherche instantanés
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { pages: [], albums: [], total: 0 };
    const q = searchQuery.toLowerCase().trim();

    const matchedPages = pages.filter(p => 
      p.title?.toLowerCase().includes(q) ||
      p.editorialSummary?.toLowerCase().includes(q)
    );

    const matchedAlbums = albums.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
    );

    return {
      pages: matchedPages,
      albums: matchedAlbums,
      total: matchedPages.length + matchedAlbums.length,
    };
  }, [pages, albums, searchQuery]);

  // Auto-expand appropriate menu section when visiting an inner page
  useEffect(() => {
    if (currentPage === 'page' && currentPageData) {
      if (currentPageData.menuGroup === 'series') {
        setSeriesExpanded(true);
      } else if (currentPageData.menuGroup === 'exhibitions') {
        setExhibitionsExpanded(true);
      }
    }
  }, [currentPage, currentPageData]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      navigateTo('series');
      setIsSearchFocused(false);
      setMenuOpen(false);
    }
  };

  return (
    <header className="header">
      <div className="header-title">
        <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home'); }} className="logo">
          {formatName(profile?.name)}
        </a>
        <div className="header-subtitle">Photographies</div>
      </div>

      {/* Barre de Recherche Rapide dans le Menu Latéral */}
      <div className="sidebar-search-container" ref={searchContainerRef}>
        <div className="sidebar-search-input-wrapper">
          <span className="sidebar-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher une série..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setIsSearchFocused(true)}
            className="sidebar-search-input"
            aria-label="Rechercher une série"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              className="sidebar-search-clear"
              title="Effacer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Menu déroulant des résultats instantanés */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="sidebar-search-results">
            {searchResults.total === 0 ? (
              <div className="sidebar-search-empty">
                <span>Aucune série trouvée</span>
              </div>
            ) : (
              <>
                <div className="sidebar-search-results-header">
                  <span>{searchResults.total} résultat{searchResults.total > 1 ? 's' : ''}</span>
                </div>

                <div className="sidebar-search-list">
                  {searchResults.pages.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => {
                        navigateToPage(p.slug);
                        setSearchQuery('');
                        setIsSearchFocused(false);
                        setMenuOpen(false);
                      }}
                      className="sidebar-search-item"
                    >
                      <span className="item-icon">📁</span>
                      <div className="item-details">
                        <span className="item-title">{p.title}</span>
                        {p.editorialSummary && (
                          <span className="item-snippet">{p.editorialSummary.slice(0, 45)}...</span>
                        )}
                      </div>
                    </button>
                  ))}

                  {searchResults.albums.map((a) => (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => {
                        navigateTo('album', a._id);
                        setSearchQuery('');
                        setIsSearchFocused(false);
                        setMenuOpen(false);
                      }}
                      className="sidebar-search-item"
                    >
                      <span className="item-icon">🖼️</span>
                      <div className="item-details">
                        <span className="item-title">{a.title}</span>
                        {a.description && (
                          <span className="item-snippet">{a.description.slice(0, 45)}...</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bouton Hamburger Mobile */}
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {/* Barre de navigation */}
      <div className="menu-bg">
        <nav id="menu-container">
          <ul className={`menu ${menuOpen ? 'open' : ''}`}>
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
                className={currentPage === 'home' ? 'active' : ''}
              >
                Accueil
              </a>
            </li>

            {/* SECTION SÉRIES */}
            {pages.filter(p => p.menuGroup === 'series' && !p.parentPageId && p.showInMenu).length > 0 && (
              <li className="menu-group-item">
                <div className="menu-section-header">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSeriesExpanded(true);
                      navigateTo('series');
                      setMenuOpen(false);
                    }}
                    className={`menu-section-link ${currentPage === 'series' ? 'active' : ''}`}
                    title="Voir toutes les séries photographiques"
                  >
                    Séries
                  </a>
                  <button
                    type="button"
                    onClick={() => setSeriesExpanded(!seriesExpanded)}
                    className="menu-chevron-btn"
                    aria-expanded={seriesExpanded}
                    aria-label={seriesExpanded ? "Replier les séries" : "Déplier les séries"}
                  >
                    <span className={`chevron-icon ${seriesExpanded ? 'expanded' : ''}`}>▾</span>
                  </button>
                </div>
                {seriesExpanded && (
                  <ul className="submenu">
                    {pages.filter(p => p.menuGroup === 'series' && !p.parentPageId && p.showInMenu).map((page) => {
                      const children = pages.filter(p => typeof p.parentPageId === 'object' ? (p.parentPageId as any)?._id === page._id : p.parentPageId === page._id);
                      return (
                        <li key={page._id}>
                          <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); navigateToPage(page.slug); }}
                            className={currentPage === 'page' && currentPageData?.slug === page.slug ? 'active' : ''}
                          >
                            {page.title}
                          </a>
                          {children.length > 0 && (
                            <ul className="submenu-nested">
                              {children.map(child => (
                                <li key={child._id}>
                                  <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); navigateToPage(child.slug); }}
                                    className={currentPage === 'page' && currentPageData?.slug === child.slug ? 'active' : ''}
                                  >
                                    {child.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            )}

            {/* SECTION EXPOSITIONS */}
            {pages.filter(p => p.menuGroup === 'exhibitions' && !p.parentPageId && p.showInMenu).length > 0 && (
              <li className="menu-group-item">
                <div className="menu-section-header">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setExhibitionsExpanded(true);
                      navigateTo('exhibitions');
                      setMenuOpen(false);
                    }}
                    className={`menu-section-link ${currentPage === 'exhibitions' ? 'active' : ''}`}
                    title="Voir toutes les expositions"
                  >
                    Expositions
                  </a>
                  <button
                    type="button"
                    onClick={() => setExhibitionsExpanded(!exhibitionsExpanded)}
                    className="menu-chevron-btn"
                    aria-expanded={exhibitionsExpanded}
                    aria-label={exhibitionsExpanded ? "Replier les expositions" : "Déplier les expositions"}
                  >
                    <span className={`chevron-icon ${exhibitionsExpanded ? 'expanded' : ''}`}>▾</span>
                  </button>
                </div>
                {exhibitionsExpanded && (
                  <ul className="submenu">
                    {pages.filter(p => p.menuGroup === 'exhibitions' && !p.parentPageId && p.showInMenu).map((page) => {
                      const children = pages.filter(p => typeof p.parentPageId === 'object' ? (p.parentPageId as any)?._id === page._id : p.parentPageId === page._id);
                      return (
                        <li key={page._id}>
                          <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); navigateToPage(page.slug); }}
                            className={currentPage === 'page' && currentPageData?.slug === page.slug ? 'active' : ''}
                          >
                            {page.title}
                          </a>
                          {children.length > 0 && (
                            <ul className="submenu-nested">
                              {children.map(child => (
                                <li key={child._id}>
                                  <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); navigateToPage(child.slug); }}
                                    className={currentPage === 'page' && currentPageData?.slug === child.slug ? 'active' : ''}
                                  >
                                    {child.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            )}

            {/* PAGES INDÉPENDANTES (menuGroup === 'none' ou sans groupe) */}
            {pages.filter(p => (!p.menuGroup || p.menuGroup === 'none') && !p.parentPageId && p.showInMenu).map((page) => (
              <li key={page._id}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); navigateToPage(page.slug); }}
                  className={currentPage === 'page' && currentPageData?.slug === page.slug ? 'active' : ''}
                >
                  {page.title}
                </a>
              </li>
            ))}

            {profile?.hasBlog && (
              <li>
                <a 
                  href={getBlogUrl(profile?.name)}
                >
                  Actualités
                </a>
              </li>
            )}

            {profile?.hasCarnet && (
              <li>
                <a 
                  href={getCarnetUrl(profile?.name, profile?.chambreNoireUrl)}
                >
                  Carnet de route
                </a>
              </li>
            )}
            
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigateTo('about'); }}
                className={currentPage === 'about' ? 'active' : ''}
              >
                À propos
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}
                className={currentPage === 'contact' ? 'active' : ''}
              >
                Contact
              </a>
            </li>
            <li style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={toggleTheme}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-dark)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-title)',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '4px 0',
                  opacity: 0.8
                }}
                className="hover:opacity-100 transition duration-200"
              >
                {theme === 'light' ? '🌙 Mode Sombre' : '☀️ Mode Clair'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
