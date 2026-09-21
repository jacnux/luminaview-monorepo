import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Album } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import { pageVariants, containerVariants, itemVariants } from './variants';

interface GalleriesViewProps {
  albums: Album[];
  navigateTo: (page: 'home' | 'galleries' | 'album' | 'about' | 'contact' | 'page', albumId?: string | null) => void;
}

const GalleriesView: React.FC<GalleriesViewProps> = ({ albums, navigateTo }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlbums = useMemo(() => {
    if (!searchQuery.trim()) return albums;
    const q = searchQuery.toLowerCase().trim();
    return albums.filter(album => 
      album.title?.toLowerCase().includes(q) ||
      album.description?.toLowerCase().includes(q)
    );
  }, [albums, searchQuery]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      key="galleries"
    >
      <div className="galleries-header-bar">
        <div>
          <h2 className="section-title" style={{ marginBottom: '4px' }}>Mes Galeries</h2>
          <p className="section-subtitle-text">
            {albums.length > 0 ? (
              searchQuery.trim() ? (
                `${filteredAlbums.length} sur ${albums.length} ${albums.length > 1 ? 'galeries' : 'galerie'}`
              ) : (
                `${albums.length} ${albums.length > 1 ? 'galeries photographiques' : 'galerie photographique'}`
              )
            ) : null}
          </p>
        </div>

        {albums.length > 2 && (
          <div className="gallery-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher une galerie..."
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

      {albums.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', margin: '40px 0' }}>Aucune galerie publique disponible pour le moment.</p>
      ) : filteredAlbums.length === 0 ? (
        <div className="gallery-empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Aucune galerie trouvée</h3>
          <p>Aucun résultat ne correspond à « <strong>{searchQuery}</strong> »</p>
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
          {filteredAlbums.map((album) => (
            <motion.a 
              key={album._id} 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigateTo('album', album._id); }}
              className="gallery-card"
              variants={itemVariants}
            >
              <div className="gallery-cover-container">
                {album.coverImage ? (
                  <img 
                    src={`/uploads/thumb-${album.coverImage}`} 
                    alt={album.title} 
                    loading="lazy"
                    decoding="async"
                    className="gallery-cover" 
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb', color: '#9ca3af' }}>📷</div>
                )}
              </div>
              <div className="gallery-info">
                <h3>{album.title}</h3>
                {album.description && <MarkdownRenderer>{album.description}</MarkdownRenderer>}
              </div>
            </motion.a>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default GalleriesView;
