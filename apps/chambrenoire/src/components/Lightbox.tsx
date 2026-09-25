// ============================================================
// CHAMBRE NOIRE — Lightbox.tsx (Sprint 3 Ergonomie v3.0)
// Visionneuse photo avancée avec ruban de miniatures (filmstrip),
// plein écran, zoom interactif, métadonnées EXIF et partage
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PhotoItem {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  filename: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string | number;
  filmStock?: string;
  isAnalog?: boolean;
  location?: string;
  captureDate?: string;
  tags?: string[];
  [key: string]: any;
}

interface LightboxProps {
  photos: PhotoItem[];
  initialIndex: number;
  onClose: () => void;
  albumTitle?: string;
}

const Lightbox: React.FC<LightboxProps> = ({ photos, initialIndex, onClose, albumTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const [showFilmstrip, setShowFilmstrip] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const currentPhoto = photos[currentIndex];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.3, 5));
  const zoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.3, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'i':
        case 'I':
          setShowInfo(prev => !prev);
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
        case '_':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev, toggleFullscreen, resetZoom]);

  // Synchronisation du mode plein écran natif
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Réinitialisation du zoom et centrage à chaque changement de photo
  useEffect(() => {
    resetZoom();
  }, [currentIndex, resetZoom]);

  // Auto-scroll de la miniature active dans le ruban
  useEffect(() => {
    if (!thumbnailsRef.current) return;
    const activeThumb = thumbnailsRef.current.children[currentIndex] as HTMLElement | undefined;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  if (!currentPhoto) return null;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom(prev => {
      const next = Math.min(Math.max(prev + delta, 0.5), 5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
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

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('🔗 Lien de la photo copié dans le presse-papier !');
      });
    } else {
      showToast('Lien disponible dans la barre d’adresse');
    }
  };

  const photoTitle = currentPhoto.title || `Photo ${currentIndex + 1}`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black/95 text-white flex flex-col select-none overflow-hidden backdrop-blur-xl animate-fade-in"
      onWheel={handleWheel}
    >
      {/* Notification Toast */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-gray-950 px-4 py-2 rounded-full font-bold text-xs shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* ── BARRE SUPÉRIEURE (HEADER & OUTILS) ── */}
      <header className="relative z-30 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Titre & Album */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-amber-400 flex items-center gap-1.5 shrink-0">
            <span>📷</span>
            <span>{currentIndex + 1} / {photos.length}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white truncate drop-shadow-md">
              {photoTitle}
            </h3>
            {albumTitle && (
              <p className="text-xs text-gray-400 truncate hidden sm:block">
                {albumTitle}
              </p>
            )}
          </div>
        </div>

        {/* Outils & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-white/10 border border-white/10 rounded-full px-1 py-0.5 backdrop-blur-md">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= 0.5}
              className="p-1.5 text-gray-300 hover:text-white disabled:opacity-30 transition rounded-full hover:bg-white/10"
              title="Zoom arrière (-)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="px-2 text-xs font-medium text-amber-400 hover:text-amber-300 transition"
              title="Réinitialiser zoom (0)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= 5}
              className="p-1.5 text-gray-300 hover:text-white disabled:opacity-30 transition rounded-full hover:bg-white/10"
              title="Zoom avant (+)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Bouton Ruban / Filmstrip Toggle */}
          <button
            type="button"
            onClick={() => setShowFilmstrip(prev => !prev)}
            className={`p-2 rounded-full border transition ${
              showFilmstrip
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-white/10 border-white/10 text-gray-300 hover:text-white'
            }`}
            title="Afficher/Masquer les miniatures"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Bouton Partager */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300 hover:text-amber-400 transition"
            title="Partager / Copier le lien"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {/* Bouton Infos Techniques / EXIF */}
          <button
            type="button"
            onClick={() => setShowInfo(prev => !prev)}
            className={`p-2 rounded-full border transition ${
              showInfo
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-white/10 border-white/10 text-gray-300 hover:text-white'
            }`}
            title="Informations & Métadonnées (I)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Bouton Plein Écran */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300 hover:text-white transition hidden sm:flex"
            title={isFullscreen ? "Quitter le plein écran (F)" : "Plein écran (F)"}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          {/* Bouton Fermer */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-white/10 hover:bg-red-500/30 text-gray-300 hover:text-red-400 border border-white/10 rounded-full flex items-center justify-center transition ml-1"
            title="Fermer (Échap)"
          >
            ✕
          </button>
        </div>
      </header>

      {/* ── ZONE CENTRALE (IMAGE & NAVIGATION) ── */}
      <div 
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden min-h-0 p-2 sm:p-6"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={resetZoom}
      >
        {/* Flèche Précédent */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          disabled={photos.length <= 1}
          className="absolute left-3 sm:left-6 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-10 transition backdrop-blur-md shadow-2xl cursor-pointer"
          title="Photo précédente (←)"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <img
          src={`/uploads/${currentPhoto.filename}`}
          alt={photoTitle}
          className="w-full h-full object-contain transition-transform duration-100 select-none shadow-2xl rounded-sm"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          draggable={false}
        />

        {/* Flèche Suivant */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          disabled={photos.length <= 1}
          className="absolute right-3 sm:right-6 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-10 transition backdrop-blur-md shadow-2xl cursor-pointer"
          title="Photo suivante (→)"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Panneau / Tiroir Métadonnées & EXIF (overlay latéral) */}
        {showInfo && (
          <aside className="absolute top-4 right-4 bottom-4 w-80 max-w-[calc(100%-2rem)] z-30 bg-gray-950/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 overflow-y-auto shadow-2xl flex flex-col justify-between animate-slide-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Détails & Métadonnées
                </h4>
                <button
                  type="button"
                  onClick={() => setShowInfo(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Titre & Description */}
              <div>
                <h5 className="font-bold text-white text-base">{photoTitle}</h5>
                {currentPhoto.description && (
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                    {currentPhoto.description}
                  </p>
                )}
              </div>

              {/* Type : Argentique / Numérique */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  currentPhoto.isAnalog
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                }`}>
                  <span>{currentPhoto.isAnalog ? '🎞️ Argentique' : '⚡ Numérique'}</span>
                </span>
              </div>

              {/* Fiche Technique */}
              <div className="bg-white/5 rounded-xl p-3.5 space-y-2 border border-white/5 text-xs">
                {currentPhoto.camera && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Boîtier :</span>
                    <span className="font-semibold text-white">{currentPhoto.camera}</span>
                  </div>
                )}
                {currentPhoto.lens && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Objectif :</span>
                    <span className="font-semibold text-white">{currentPhoto.lens}</span>
                  </div>
                )}
                {currentPhoto.focalLength && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Focale :</span>
                    <span className="font-semibold text-white">{currentPhoto.focalLength}</span>
                  </div>
                )}
                {currentPhoto.aperture && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ouverture :</span>
                    <span className="font-semibold text-white">{currentPhoto.aperture}</span>
                  </div>
                )}
                {currentPhoto.shutterSpeed && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vitesse :</span>
                    <span className="font-semibold text-white">{currentPhoto.shutterSpeed}</span>
                  </div>
                )}
                {currentPhoto.iso && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sensibilité :</span>
                    <span className="font-semibold text-white">ISO {currentPhoto.iso}</span>
                  </div>
                )}
                {(currentPhoto.filmId || currentPhoto.filmStock) && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pellicule :</span>
                    <span className="font-semibold text-amber-400">
                      {currentPhoto.filmId 
                        ? `${currentPhoto.filmId.brand || ''} ${currentPhoto.filmId.filmType || ''} ${currentPhoto.filmId.format ? `(${currentPhoto.filmId.format})` : ''}`.trim() 
                        : currentPhoto.filmStock}
                    </span>
                  </div>
                )}
                {currentPhoto.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lieu :</span>
                    <span className="font-semibold text-white">📍 {currentPhoto.location}</span>
                  </div>
                )}
                {currentPhoto.captureDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date :</span>
                    <span className="font-semibold text-white">
                      📅 {new Date(currentPhoto.captureDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-gray-500 text-center">
              Raccourcis : <kbd className="px-1 py-0.5 bg-white/10 rounded">←</kbd> <kbd className="px-1 py-0.5 bg-white/10 rounded">→</kbd> Naviguer · <kbd className="px-1 py-0.5 bg-white/10 rounded">Échap</kbd> Fermer
            </div>
          </aside>
        )}
      </div>

      {/* ── RUBAN DE MINIATURES (FILMSTRIP) ── */}
      {showFilmstrip && photos.length > 1 && (
        <div className="relative z-30 p-2 sm:p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent border-t border-white/10">
          <div
            ref={thumbnailsRef}
            className="flex items-center gap-2 overflow-x-auto py-1 px-4 scrollbar-thin scrollbar-thumb-amber-500/50 scrollbar-track-transparent max-w-5xl mx-auto"
            style={{ scrollbarWidth: 'thin' }}
          >
            {photos.map((photo, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={photo._id || photo.id || index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 h-14 sm:h-16 w-14 sm:w-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-amber-400 scale-105 shadow-lg shadow-amber-400/30 opacity-100 ring-2 ring-amber-400/30'
                      : 'border-white/10 opacity-50 hover:opacity-90 hover:scale-100'
                  }`}
                  title={photo.title || `Photo ${index + 1}`}
                >
                  <img
                    src={`/uploads/${photo.filename}`}
                    alt={photo.title || `Miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lightbox;
