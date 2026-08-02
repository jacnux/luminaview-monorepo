import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Info } from 'lucide-react';
import { Photo } from '../types';

interface LightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

const lightboxVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const imageVariants = {
  initial: { scale: 0.96, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { scale: 0.96, opacity: 0, transition: { duration: 0.2 } },
};

const getPhotoUrl = (photo: any): string => {
  if (!photo) return '';
  const path = photo.url || photo.filename || photo.filepath || photo.path;
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/uploads/')) {
    return path;
  }
  return `/uploads/${path}`;
};

const Lightbox: React.FC<LightboxProps> = ({ photos, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lightboxBgColor, setLightboxBgColor] = useState<'black' | 'gray'>('black');
  const [showDescription, setShowDescription] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Raccourcis clavier (Flèches & Échap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error(err));
        }
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, photos.length]);

  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setShowDescription(false);
  }, [currentIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error(err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error(err));
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const currentPhoto = photos[currentIndex];
  if (!currentPhoto) return null;

  const photoUrl = getPhotoUrl(currentPhoto);

  return (
    <motion.div
      className="grimoire-lightbox-overlay"
      style={{
        backgroundColor: lightboxBgColor === 'black' ? 'rgba(7,7,9,0.96)' : 'rgba(28,28,34,0.96)',
      }}
      variants={lightboxVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onWheel={handleWheel}
    >
      {/* Header Lightbox */}
      <div className="grimoire-lightbox-header">
        <div className="grimoire-lightbox-title">
          {currentPhoto.title || `Photographie ${currentIndex + 1}`}
        </div>

        <div className="grimoire-lightbox-controls">
          <button
            className="grimoire-arrow-btn"
            style={{ width: '36px', height: '36px' }}
            onClick={() => setLightboxBgColor(lightboxBgColor === 'black' ? 'gray' : 'black')}
            title="Changer le fond"
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: lightboxBgColor === 'black' ? '#ffffff' : '#666' }} />
          </button>

          <button
            className="grimoire-arrow-btn"
            style={{ width: '36px', height: '36px' }}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            className="grimoire-arrow-btn"
            style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)' }}
            onClick={() => {
              onClose();
              if (document.fullscreenElement) {
                document.exitFullscreen().catch((err) => console.error(err));
              }
            }}
            title="Fermer (Échap)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Corps avec l'image zoomable & repositionnable */}
      <div
        className="grimoire-lightbox-body"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {photos.length > 1 && (
          <button
            className="grimoire-lightbox-nav prev"
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
            title="Image précédente (Flèche Gauche)"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        <motion.img
          key={currentIndex}
          src={photoUrl}
          alt={currentPhoto.title || 'Photographie Grimoire'}
          className="grimoire-lightbox-img"
          variants={imageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease',
          }}
          draggable={false}
        />

        {photos.length > 1 && (
          <button
            className="grimoire-lightbox-nav next"
            onClick={() => setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
            title="Image suivante (Flèche Droite)"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Footer & Compteur */}
      <div className="grimoire-lightbox-footer">
        <div>
          <span>{currentIndex + 1}</span> / <span>{photos.length}</span>
        </div>

        {(currentPhoto.caption || currentPhoto.description) && (
          <button
            className="grimoire-arrow-btn"
            style={{ width: '32px', height: '32px' }}
            onClick={() => setShowDescription(!showDescription)}
            title="Description"
          >
            <Info size={16} />
          </button>
        )}
      </div>

      {showDescription && (currentPhoto.caption || currentPhoto.description) && (
        <div className="grimoire-lightbox-description">
          {currentPhoto.caption || currentPhoto.description}
        </div>
      )}
    </motion.div>
  );
};

export default Lightbox;
