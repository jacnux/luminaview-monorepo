import React from 'react';
import { motion } from 'framer-motion';
import { Album, Photo } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import { pageVariants, containerVariants, itemVariants } from './variants';

interface AlbumViewProps {
  selectedAlbumId: string | null;
  albums: Album[];
  photos: Photo[];
  loadingPhotos: boolean;
  onPhotoClick: (index: number) => void;
  navigateTo?: (page: 'home' | 'galleries' | 'album' | 'about' | 'contact' | 'page' | 'series' | 'exhibitions', albumId?: string | null) => void;
}

const AlbumView: React.FC<AlbumViewProps> = ({
  selectedAlbumId,
  albums,
  photos,
  loadingPhotos,
  onPhotoClick,
  navigateTo,
}) => {
  const currentAlbum = albums.find(a => a._id === selectedAlbumId);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      key="album"
    >
      {/* Fil d'Ariane (Breadcrumb) */}
      {navigateTo && (
        <nav className="portfolio-breadcrumb" aria-label="Fil d'Ariane">
          <button 
            type="button" 
            onClick={() => navigateTo('home')} 
            className="breadcrumb-link"
          >
            Accueil
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">
            {currentAlbum ? currentAlbum.title : 'Galerie'}
          </span>
        </nav>
      )}

      <div className="album-header-flex">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          {currentAlbum ? currentAlbum.title : 'Galerie'}
        </h2>
        {photos.length > 0 && (
          <span className="album-count-badge">
            {photos.length} {photos.length > 1 ? 'photos' : 'photo'}
          </span>
        )}
      </div>

      {currentAlbum?.description && (
        <div style={{ color: '#666', marginTop: '15px', marginBottom: '25px' }}>
          <MarkdownRenderer>{currentAlbum.description}</MarkdownRenderer>
        </div>
      )}

      {loadingPhotos ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Chargement des photos...</p>
        </div>
      ) : photos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', margin: '40px 0' }}>Cette galerie ne contient aucune photo.</p>
      ) : (
        <motion.div 
          className="masonry-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {photos.map((photo, idx) => (
            <motion.div 
              key={photo._id} 
              className="masonry-item" 
              onClick={() => onPhotoClick(idx)}
              variants={itemVariants}
            >
              <img 
                src={`/uploads/thumb-${photo.filename}`} 
                alt={photo.title} 
                className="masonry-img" 
                loading="lazy"
                decoding="async"
              />
              <div className="masonry-overlay">
                <h4>{photo.title || 'Sans titre'}</h4>
                {photo.description && <MarkdownRenderer>{photo.description}</MarkdownRenderer>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AlbumView;
