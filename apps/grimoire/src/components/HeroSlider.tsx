import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Album, UserProfile } from '../types';

interface HeroSliderProps {
  albums: Album[];
  profile: UserProfile | null;
  onSelectAlbum: (albumId: string) => void;
}

const ITEMS_PER_SLIDE = 5;

const resolveImageUrl = (img?: string): string | null => {
  if (!img) return null;
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/uploads/')) {
    return img;
  }
  return `/uploads/${img}`;
};

const HeroSlider: React.FC<HeroSliderProps> = ({ albums, profile, onSelectAlbum }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hoveredAlbumId, setHoveredAlbumId] = useState<string | null>(null);

  const totalSlides = Math.ceil(albums.length / ITEMS_PER_SLIDE) || 1;
  const currentAlbums = albums.slice(
    currentSlideIndex * ITEMS_PER_SLIDE,
    (currentSlideIndex + 1) * ITEMS_PER_SLIDE
  );

  // Trouver la première image hero active pour le fond HD
  const getActiveImageUrl = (): string => {
    // 1. Si un album est survolé
    if (hoveredAlbumId) {
      const targetAlbum = albums.find((a) => a._id === hoveredAlbumId);
      const url = resolveImageUrl(targetAlbum?.coverImage);
      if (url) return url;
    }
    // 2. Première image de la série active sur le slide actuel
    if (currentAlbums.length > 0) {
      const firstAlbumCover = resolveImageUrl(currentAlbums[0].coverImage);
      if (firstAlbumCover) return firstAlbumCover;
    }
    // 3. Premier album du portfolio global
    if (albums.length > 0) {
      const globalFirstCover = resolveImageUrl(albums[0].coverImage);
      if (globalFirstCover) return globalFirstCover;
    }
    // 4. Image de bannière du profil utilisateur
    const banner = resolveImageUrl(profile?.bannerImage);
    if (banner) return banner;

    // 5. Fallback HD
    return 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2000&q=80';
  };

  const handleNext = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="grimoire-hero">
      {/* ARRIÈRE-PLAN PHOTO IMMERSIF FULLSCREEN AVEC HOVER REVEAL */}
      <div className="grimoire-bg-container">
        <AnimatePresence mode="wait">
          <motion.img
            key={getActiveImageUrl()}
            src={getActiveImageUrl()}
            alt="Hero Exposition"
            className="grimoire-bg-image"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </AnimatePresence>
        <div className="grimoire-bg-overlay" />
      </div>

      {/* OVERLAY TITRES DE PROJETS EN UNE SEULE LIGNE HORIZONTALE AVEC FLÈCHES À GAUCHE ET À DROITE (STYLE FELIPE DANA) */}
      <div className="grimoire-hero-content">
        <div className="grimoire-slider-row-wrapper">
          {totalSlides > 1 && (
            <button
              className="grimoire-arrow-btn side-arrow"
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              aria-label="Projets précédents"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              className="grimoire-project-horizontal-row"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              {currentAlbums.map((album) => {
                const isHovered = hoveredAlbumId === album._id;
                return (
                  <a
                    key={album._id}
                    href={`#${album._id}`}
                    className={`grimoire-project-link ${isHovered ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredAlbumId(album._id)}
                    onMouseLeave={() => setHoveredAlbumId(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectAlbum(album._id);
                    }}
                  >
                    {album.title}
                  </a>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {totalSlides > 1 && (
            <button
              className="grimoire-arrow-btn side-arrow"
              onClick={handleNext}
              disabled={currentSlideIndex === totalSlides - 1}
              aria-label="Projets suivants"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {totalSlides > 1 && (
          <div className="grimoire-slider-indicators" style={{ marginTop: '2.5rem' }}>
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <span
                key={idx}
                className={`grimoire-indicator-dot ${idx === currentSlideIndex ? 'active' : ''}`}
                onClick={() => setCurrentSlideIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* VUE MOBILE EN VIGNETTES / CARTE VERTICALE */}
      <div className="grimoire-mobile-grid">
        {albums.map((album) => {
          const coverUrl = resolveImageUrl(album.coverImage) || getActiveImageUrl();
          return (
            <a
              key={album._id}
              href={`#album-${album._id}`}
              className="grimoire-mobile-card"
              onClick={(e) => {
                e.preventDefault();
                onSelectAlbum(album._id);
              }}
            >
              <div className="grimoire-mobile-thumb-wrapper">
                <img
                  src={coverUrl}
                  alt={album.title}
                  className="grimoire-mobile-thumb"
                  loading="lazy"
                />
              </div>
              <div className="grimoire-mobile-card-title">{album.title}</div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default HeroSlider;
