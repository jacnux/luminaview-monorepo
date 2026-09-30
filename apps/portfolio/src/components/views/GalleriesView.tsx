import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Album } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import { pageVariants, containerVariants, itemVariants } from './variants';
import { Search, X, Image as ImageIcon } from 'lucide-react';

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
      className="galleries-view-container space-y-8"
    >
      <div className="galleries-header-bar flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title mb-1">Mes Galeries</h2>
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
          <div className="gallery-search-box relative flex items-center">
            <Search size={16} className="search-icon absolute left-3 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher une galerie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gallery-search-input pl-9 pr-8 py-2 rounded-full text-xs bg-stone-900/60 border border-stone-700/60 text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500/60 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="search-clear-btn absolute right-2.5 text-stone-400 hover:text-stone-200 cursor-pointer"
                title="Effacer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {albums.length === 0 ? (
        <p className="text-center text-stone-400 py-12">Aucune galerie publique disponible pour le moment.</p>
      ) : filteredAlbums.length === 0 ? (
        <div className="gallery-empty-state text-center py-16 space-y-4">
          <Search size={32} className="mx-auto text-amber-500/60" />
          <h3 className="text-lg font-medium text-stone-200">Aucune galerie trouvée</h3>
          <p className="text-sm text-stone-400">Aucun résultat ne correspond à « <strong>{searchQuery}</strong> »</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="empty-reset-btn px-4 py-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full text-xs font-medium hover:bg-amber-500/25 transition-all cursor-pointer"
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
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-500">
                    <ImageIcon size={28} />
                  </div>
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
