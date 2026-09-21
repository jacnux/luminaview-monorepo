import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface LightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
  onComment: (index: number) => void;
  onReport: (index: number) => void;
}

const lightboxVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const imageVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
};

const Lightbox: React.FC<LightboxProps> = ({
  photos,
  initialIndex,
  onClose,
  onComment,
  onReport,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lightboxBgColor, setLightboxBgColor] = useState<'black' | 'gray' | 'white'>('black');
  const [showDescription, setShowDescription] = useState(false);
  const [showFilmstrip, setShowFilmstrip] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Touch Swipe State
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const lastTapRef = useRef<number>(0);

  // Filmstrip active thumbnail ref
  const filmstripRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Écouter le changement de mode plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore si on est dans un input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape') {
        onClose();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error("Erreur exit fullscreen:", err));
        }
      } else if ((e.key === 'ArrowRight' || e.key === ' ') && photos.length > 1) {
        e.preventDefault();
        setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        e.preventDefault();
        setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
      } else if (e.key === 'Home') {
        setCurrentIndex(0);
      } else if (e.key === 'End') {
        setCurrentIndex(photos.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'i' || e.key === 'I') {
        setShowDescription(prev => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        setShowFilmstrip(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, photos.length]);

  // Réinitialiser le zoom/position/description au changement de photo
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setShowDescription(false);

    // Auto-scroll le filmstrip vers la miniature active
    if (thumbnailRefs.current[currentIndex]) {
      thumbnailRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Erreur d'entrée en plein écran:", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error("Erreur de sortie du plein écran:", err));
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Gestion du double clic / double tap pour zoomer
  const handleDoubleTap = () => {
    if (zoom > 1) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(2.2);
    }
  };

  // Touch handlers pour swipe & double tap
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      touchDeltaX.current = 0;

      // Détecter double tap
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        handleDoubleTap();
      }
      lastTapRef.current = now;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (zoom > 1) return; // Laisser le scroll / pan si zoomé
    if (touchStartX.current !== null && e.touches.length === 1) {
      touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    }
  };

  const handleTouchEnd = () => {
    if (zoom === 1 && touchStartX.current !== null && Math.abs(touchDeltaX.current) > 45) {
      if (touchDeltaX.current < 0 && photos.length > 1) {
        // Glissement vers la gauche -> Photo suivante
        setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
      } else if (touchDeltaX.current > 0 && photos.length > 1) {
        // Glissement vers la droite -> Photo précédente
        setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchDeltaX.current = 0;
  };

  const currentPhoto = photos[currentIndex];
  if (!currentPhoto) return null;

  return (
    <motion.div 
      className={`lightbox-overlay bg-${lightboxBgColor}`}
      variants={lightboxVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onWheel={handleWheel}
    >
      {/* Header */}
      <div className="lightbox-header">
        <span className="lightbox-title">
          {currentPhoto.title || 'Sans titre'}
        </span>

        <div className="lightbox-bg-selector">
          <button 
            className={`bg-dot black ${lightboxBgColor === 'black' ? 'active' : ''}`}
            onClick={() => setLightboxBgColor('black')}
            title="Fond Noir"
          />
          <button 
            className={`bg-dot gray ${lightboxBgColor === 'gray' ? 'active' : ''}`}
            onClick={() => setLightboxBgColor('gray')}
            title="Fond Gris"
          />
          <button 
            className={`bg-dot white ${lightboxBgColor === 'white' ? 'active' : ''}`}
            onClick={() => setLightboxBgColor('white')}
            title="Fond Blanc"
          />
        </div>
        <button className="lightbox-close" onClick={() => {
          onClose();
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error("Erreur exit fullscreen:", err));
          }
        }}>
          ×
        </button>
      </div>

      {/* Corps avec l'image zoomée & support swipe tactile */}
      <div 
        className="lightbox-body"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTap}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {photos.length > 1 && (
          <button 
            className="lightbox-nav-btn prev"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
            }}
            title="Photo précédente (←)"
            aria-label="Photo précédente"
          >
            ‹
          </button>
        )}

        <motion.img 
          key={currentIndex}
          src={`/uploads/${currentPhoto.filename}`} 
          alt={currentPhoto.title || "Photo zoomée"} 
          className="lightbox-img" 
          variants={imageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          draggable={false}
        />

        {photos.length > 1 && (
          <button 
            className="lightbox-nav-btn next"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
            }}
            title="Photo suivante (→)"
            aria-label="Photo suivante"
          >
            ›
          </button>
        )}
      </div>

      {/* Ruban de Miniatures (Filmstrip) */}
      {photos.length > 1 && showFilmstrip && (
        <div className="lightbox-filmstrip-wrapper" ref={filmstripRef}>
          <div className="lightbox-filmstrip">
            {photos.map((photo, idx) => (
              <button
                key={photo._id || idx}
                ref={el => { thumbnailRefs.current[idx] = el; }}
                onClick={() => setCurrentIndex(idx)}
                className={`filmstrip-thumb-btn ${idx === currentIndex ? 'active' : ''}`}
                title={photo.title || `Photo ${idx + 1}`}
                aria-label={photo.title || `Photo ${idx + 1}`}
              >
                <img
                  src={`/uploads/thumb-${photo.filename}`}
                  onError={(e) => {
                    // Fallback to original image if thumb is missing
                    (e.target as HTMLImageElement).src = `/uploads/${photo.filename}`;
                  }}
                  alt={photo.title || `Miniature ${idx + 1}`}
                  className="filmstrip-thumb-img"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer descriptif & Actions */}
      <div className="lightbox-footer-container">
        {showDescription && currentPhoto.description && (
          <div className="lightbox-desc-container">
            <div className="lightbox-desc">
              <MarkdownRenderer>{currentPhoto.description}</MarkdownRenderer>
            </div>
          </div>
        )}

        <div className="lightbox-footer-bar">
          <div className="lightbox-counter">
            <span>{currentIndex + 1} / {photos.length}</span>
          </div>

          <div className="lightbox-actions">
            {photos.length > 1 && (
              <button 
                className={`lightbox-action-btn filmstrip-toggle-btn ${showFilmstrip ? 'active' : ''}`}
                onClick={() => setShowFilmstrip(!showFilmstrip)}
                title={showFilmstrip ? "Masquer le ruban de miniatures (T)" : "Afficher le ruban de miniatures (T)"}
                aria-label="Ruban de miniatures"
              >
                🎞️
              </button>
            )}
            {currentPhoto.description && (
              <button 
                className={`lightbox-action-btn desc-toggle-btn ${showDescription ? 'active' : ''}`}
                onClick={() => setShowDescription(!showDescription)}
                title={showDescription ? "Masquer la description (I)" : "Afficher la description (I)"}
                aria-label="Description"
              >
                ℹ️
              </button>
            )}
            <button 
              className="lightbox-action-btn fullscreen-btn" 
              onClick={toggleFullscreen}
              title={isFullscreen ? "Quitter le plein écran (F)" : "Plein écran (F)"}
              aria-label="Plein écran"
            >
              {isFullscreen ? "🗗" : "⛶"}
            </button>
            <button 
              className="lightbox-action-btn comment-btn" 
              onClick={() => onComment(currentIndex)}
              title="Ajouter un commentaire"
              aria-label="Ajouter un commentaire"
            >
              💬
            </button>
            <button 
              className="lightbox-action-btn report-btn" 
              onClick={() => onReport(currentIndex)}
              title="Signaler l'image"
              aria-label="Signaler l'image"
            >
              🚩
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Lightbox;
