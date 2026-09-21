import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPage } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import { pageVariants, containerVariants, itemVariants } from './variants';

interface GroupOverviewViewProps {
  title: string;
  subtitle?: string;
  pages: UserPage[];
  allPages?: UserPage[];
  navigateToPage: (slug: string) => void;
  navigateTo: (page: 'home' | 'galleries' | 'album' | 'about' | 'contact' | 'page' | 'series' | 'exhibitions', albumId?: string | null) => void;
  initialSearchQuery?: string;
}

const GroupOverviewView: React.FC<GroupOverviewViewProps> = ({
  title,
  subtitle,
  pages,
  allPages = [],
  navigateToPage,
  navigateTo,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    const q = searchQuery.toLowerCase().trim();
    return pages.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.editorialSummary?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q)
    );
  }, [pages, searchQuery]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      key={title}
    >
      {/* Fil d'Ariane */}
      <nav className="portfolio-breadcrumb" aria-label="Fil d'Ariane">
        <button 
          type="button" 
          onClick={() => navigateTo('home')} 
          className="breadcrumb-link"
        >
          Accueil
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{title}</span>
      </nav>

      <div className="galleries-header-bar">
        <div>
          <h2 className="section-title" style={{ marginBottom: '4px' }}>{title}</h2>
          <p className="section-subtitle-text">
            {pages.length > 0 ? (
              searchQuery.trim() ? (
                `${filteredPages.length} sur ${pages.length} ${pages.length > 1 ? title.toLowerCase() : title.toLowerCase().slice(0, -1)}`
              ) : (
                subtitle || `${pages.length} ${pages.length > 1 ? `${title.toLowerCase()} photographiques` : `${title.toLowerCase().slice(0, -1)} photographique`}`
              )
            ) : null}
          </p>
        </div>

        {pages.length > 1 && (
          <div className="gallery-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={`Rechercher dans ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gallery-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="search-clear-btn"
                title="Effacer"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {pages.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', margin: '40px 0' }}>
          Aucune publication disponible dans cette rubrique pour le moment.
        </p>
      ) : filteredPages.length === 0 ? (
        <div className="gallery-empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Aucun résultat trouvé</h3>
          <p>Aucun élément ne correspond à « <strong>{searchQuery}</strong> » dans {title.toLowerCase()}</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="empty-reset-btn"
          >
            Réinitialiser la recherche
          </button>
        </div>
      ) : (
        <motion.div 
          className="grid-gallery"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredPages.map((page) => {
            const childCount = allPages.filter(p => 
              typeof p.parentPageId === 'object' 
                ? (p.parentPageId as any)?._id === page._id 
                : p.parentPageId === page._id
            ).length;

            return (
              <motion.a 
                key={page._id} 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigateToPage(page.slug); }}
                className="gallery-card"
                variants={itemVariants}
              >
                <div className="gallery-cover-container">
                  {page.coverImage ? (
                    <img 
                      src={`/uploads/thumb-${page.coverImage}`} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `/uploads/${page.coverImage}`;
                      }}
                      alt={page.title} 
                      loading="lazy"
                      decoding="async"
                      className="gallery-cover" 
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb', color: '#9ca3af' }}>📷</div>
                  )}

                  {childCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(6px)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      📁 {childCount} {childCount > 1 ? 'séries' : 'série'}
                    </span>
                  )}
                </div>
                <div className="gallery-info">
                  <h3>{page.title}</h3>
                  {page.editorialSummary && <MarkdownRenderer>{page.editorialSummary}</MarkdownRenderer>}
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default GroupOverviewView;
