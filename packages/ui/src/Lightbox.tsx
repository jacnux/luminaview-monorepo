import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Info, MessageSquare, Flag } from 'lucide-react';
import { Photo } from '@luminaview/types';

export interface LightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
  onComment?: (index: number) => void;
  onReport?: (index: number) => void;
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

import { getPhotoUrl } from '@luminaview/utils';

export const Lightbox: React.FC<LightboxProps> = ({
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch((err) => console.error(err));
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

  const getBgStyle = () => {
    if (lightboxBgColor === 'white') return '#ffffff';
    if (lightboxBgColor === 'gray') return '#282830';
    return '#070709';
  };

  const getTextColor = () => {
    return lightboxBgColor === 'white' ? '#111827' : '#ffffff';
  };

  const getNavArrowStyle = (): React.CSSProperties => {
    if (lightboxBgColor === 'white') {
      return {
        color: '#111827',
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        borderColor: 'rgba(0, 0, 0, 0.2)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      };
    }
    return {
      color: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    };
  };

  const getBtnStyle = (customColor?: string): React.CSSProperties => {
    if (lightboxBgColor === 'white') {
      return {
        width: '36px',
        height: '36px',
        color: customColor || '#111827',
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        borderColor: customColor ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 0, 0, 0.2)',
      };
    }
    return {
      width: '36px',
      height: '36px',
      color: customColor || '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: customColor ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.2)',
    };
  };

  return (
    <motion.div
      className="grimoire-lightbox-overlay"
      style={{
        backgroundColor: getBgStyle(),
        color: getTextColor(),
      }}
      variants={lightboxVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onWheel={handleWheel}
    >
      {/* Header Lightbox */}
      <div
        className="grimoire-lightbox-header"
        style={{
          background: lightboxBgColor === 'white'
            ? 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <div className="grimoire-lightbox-title" style={{ color: getTextColor() }}>
          {currentPhoto.title || `Photographie ${currentIndex + 1}`}
        </div>

        <div className="grimoire-lightbox-controls">
          {/* Sélection de couleur de fond (Noir / Gris / Blanc) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px', background: lightboxBgColor === 'white' ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '20px' }}>
            <button
              onClick={() => setLightboxBgColor('black')}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#000000',
                border: lightboxBgColor === 'black' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}
              title="Fond Noir"
            />
            <button
              onClick={() => setLightboxBgColor('gray')}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#4b5563',
                border: lightboxBgColor === 'gray' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}
              title="Fond Gris"
            />
            <button
              onClick={() => setLightboxBgColor('white')}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#ffffff',
                border: lightboxBgColor === 'white' ? '2px solid #38bdf8' : '1px solid rgba(0,0,0,0.4)',
                cursor: 'pointer',
              }}
              title="Fond Blanc"
            />
          </div>

          <button
            className="grimoire-arrow-btn"
            style={getBtnStyle()}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            className="grimoire-arrow-btn"
            style={getBtnStyle()}
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
            style={getNavArrowStyle()}
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
            title="Image précédente (Flèche Gauche)"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        <motion.img
          key={currentIndex}
          src={photoUrl}
          alt={currentPhoto.title || 'Photographie'}
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
            style={getNavArrowStyle()}
            onClick={() => setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
            title="Image suivante (Flèche Droite)"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Footer avec compteur et actions (Commentaire, Signalement drapeau rouge, Description) */}
      <div className="grimoire-lightbox-footer">
        <div style={{ color: getTextColor(), fontWeight: 500 }}>
          <span>{currentIndex + 1}</span> / <span>{photos.length}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(currentPhoto.caption || currentPhoto.description) && (
            <button
              className="grimoire-arrow-btn"
              style={getBtnStyle()}
              onClick={() => setShowDescription(!showDescription)}
              title="Description"
            >
              <Info size={16} />
            </button>
          )}

          {onComment && (
            <button
              className="grimoire-arrow-btn"
              style={getBtnStyle()}
              onClick={() => onComment(currentIndex)}
              title="Ajouter un commentaire"
            >
              <MessageSquare size={16} />
            </button>
          )}

          {onReport && (
            <button
              className="grimoire-arrow-btn"
              style={getBtnStyle('#ef4444')}
              onClick={() => onReport(currentIndex)}
              title="Signaler l'image (Drapeau rouge)"
            >
              <Flag size={16} />
            </button>
          )}
        </div>
      </div>

      {showDescription && (currentPhoto.caption || currentPhoto.description) && (
        <div
          className="grimoire-lightbox-description"
          style={{
            color: getTextColor(),
            backgroundColor: lightboxBgColor === 'white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
          }}
        >
          {currentPhoto.caption || currentPhoto.description}
        </div>
      )}
    </motion.div>
  );
};
