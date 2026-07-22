import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

// Types
import { UserProfile, Album, Photo, UserPage } from './types';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Lightbox from './components/Lightbox';
import CommentModal from './components/CommentModal';
import ReportModal from './components/ReportModal';

// Views
import HomeView from './components/views/HomeView';
import GalleriesView from './components/views/GalleriesView';
import AlbumView from './components/views/AlbumView';
import AboutView from './components/views/AboutView';
import ContactView from './components/views/ContactView';
import PageView from './components/views/PageView';

// Détection dynamique de l'utilisateur pour le multi-hébergement (multi-tenant)
const getUsernameFromEnvironment = (): string => {
  const params = new URLSearchParams(window.location.search);
  const queryUser = params.get('u') || params.get('user');
  if (queryUser) return queryUser.trim();

  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
    const subdomain = parts[0].trim();
    if (subdomain.endsWith('-portfolio')) {
      return subdomain.replace('-portfolio', '');
    }
    return subdomain;
  }

  return 'jac';
};

const USERNAME = getUsernameFromEnvironment();

const App: React.FC = () => {
  // Navigation
  const [currentPage, setCurrentPage] = useState<'home' | 'galleries' | 'album' | 'about' | 'contact' | 'page'>('home');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  // États de données
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pages, setPages] = useState<UserPage[]>([]);
  const [currentPageData, setCurrentPageData] = useState<UserPage | null>(null);
  const isEmbedMode = new URLSearchParams(window.location.search).get('embed') === 'true';
  
  // États UI
  const [loadingPageDetail, setLoadingPageDetail] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // États pour les formulaires de retour
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // Charger le profil, les albums vedettes et les pages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProfile(true);
        const [profileRes, pagesRes] = await Promise.all([
          axios.get(`/api/albums/portfolio/${USERNAME}`),
          axios.get(`/api/user-pages/${USERNAME}`)
        ]);
        
        setProfile(profileRes.data.user);
        setAlbums(profileRes.data.albums || []);
        setPages(pagesRes.data || []);

        // Auto-navigation si URL param ?page=xxx
        const pageSlug = new URLSearchParams(window.location.search).get('page');
        if (pageSlug) {
          // On essaie d'abord de la trouver dans le menu (pagesRes.data)
          const targetPage = pagesRes.data && pagesRes.data.find((p: any) => p.slug === pageSlug);
          if (targetPage) {
            setCurrentPageData(targetPage);
            setCurrentPage('page');
          } else {
            // Si pas dans le menu (ex: page de blog), on la fetch dynamiquement
            // On déclare une fonction async autoFetch pour l'appeler immédiatement
            const autoFetch = async () => {
              try {
                const res = await axios.get(`/api/user-pages/${USERNAME}/${pageSlug}`);
                setCurrentPageData(res.data);
                setCurrentPage('page');
              } catch (e) {
                console.error("Page introuvable:", e);
                setCurrentPage('home');
              }
            };
            autoFetch();
          }
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération du portfolio:", err);
        setProfile({
          name: "Jac",
          email: "jeanalbert.canal@gmail.com",
          bio: "Bonjour à tous les amoureux de photographie et aux curieux qui passent par ici ! Bienvenue sur mon site, avec les photos que j'aime partager !",
          portfolioIntro: "Bonjour à tous les amoureux de photographie et aux curieux qui passent par ici !"
        });
        setError("Impossible de charger les galeries depuis le serveur LuminaView. Affichage du mode hors-ligne.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchData();
  }, []);

  // Initialiser le thème en fonction du profil utilisateur
  useEffect(() => {
    if (profile?.blogTheme === 'portfolio') {
      const saved = localStorage.getItem('portfolio-theme');
      if (!saved) {
        setTheme('dark');
      }
    }
  }, [profile]);

  // Appliquer le thème sur le body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('theme-portfolio');
    } else {
      document.body.classList.remove('theme-portfolio');
    }
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Charger les photos quand un album est sélectionné
  useEffect(() => {
    if (!selectedAlbumId) return;
    const fetchPhotos = async () => {
      try {
        setLoadingPhotos(true);
        const res = await axios.get(`/api/albums/photos/${selectedAlbumId}`);
        setPhotos(res.data || []);
      } catch (err) {
        console.error("Erreur lors de la récupération des photos:", err);
        setPhotos([]);
      } finally {
        setLoadingPhotos(false);
      }
    };
    fetchPhotos();
  }, [selectedAlbumId]);

  // Réinitialiser les états de popup lors du changement de photo
  useEffect(() => {
    setCommentSuccess(null);
    setCommentError(null);
    setReportSuccess(null);
    setReportError(null);
    setShowCommentModal(false);
    setShowReportModal(false);
  }, [lightboxIndex]);

  const handleCommentSubmit = async (authorName: string, authorEmail: string, message: string) => {
    if (lightboxIndex === null || photos.length === 0) return;
    const photo = photos[lightboxIndex];
    
    try {
      setSubmittingComment(true);
      setCommentSuccess(null);
      setCommentError(null);
      
      await axios.post(`/api/comments/${photo._id}`, {
        authorName,
        authorEmail,
        message
      });
      
      setCommentSuccess("Votre commentaire a été envoyé avec succès au photographe !");
    } catch (err: any) {
      console.error("Erreur envoi commentaire:", err);
      setCommentError(err.response?.data?.error || "Impossible d'envoyer le commentaire pour le moment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSendReport = async (reason: string) => {
    let type = 'album';
    let targetId = selectedAlbumId;
    
    // Si on n'a pas d'album, on tente de récupérer depuis la page personnalisée
    if (!targetId && currentPage === 'page' && currentPageData) {
      type = 'user_page';
      targetId = currentPageData._id;
    }
    
    // Si on n'a toujours pas de cible, on tente depuis la photo elle-même
    if (!targetId && lightboxIndex !== null && photos[lightboxIndex]) {
       const photo = photos[lightboxIndex] as any;
       targetId = photo.albumId || photo.album;
       type = 'album';
    }

    if (!targetId) {
      setReportError("Impossible de signaler cette image car la source est introuvable.");
      return;
    }
    
    try {
      setSubmittingReport(true);
      setReportSuccess(null);
      setReportError(null);
      
      await axios.post('/api/reports', {
        type,
        targetId,
        reason: reason.trim()
      });
      
      setReportSuccess("Le signalement a été transmis avec succès à l'administrateur.");
      setTimeout(() => setShowReportModal(false), 2000);
    } catch (err: any) {
      console.error("Erreur envoi signalement:", err);
      setReportError(err.response?.data?.error || "Impossible d'envoyer le signalement pour le moment.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const navigateTo = (page: 'home' | 'galleries' | 'album' | 'about' | 'contact' | 'page', albumId: string | null = null) => {
    setCurrentPage(page);
    setSelectedAlbumId(albumId);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = async (slug: string) => {
    try {
      setLoadingPageDetail(true);
      setMenuOpen(false);
      const res = await axios.get(`/api/user-pages/${USERNAME}/${slug}`);
      setCurrentPageData(res.data);
      setCurrentPage('page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Erreur lors du chargement de la page:", err);
    } finally {
      setLoadingPageDetail(false);
    }
  };

  return (
    <div className={`page-container ${isEmbedMode ? 'embed-mode' : ''}`}>
      {/* Sidebar Navigation */}
      {!isEmbedMode && (
        <Header
          profile={profile}
          pages={pages}
          currentPage={currentPage}
          currentPageData={currentPageData}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          navigateTo={navigateTo}
          navigateToPage={navigateToPage}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {/* Main Content Area */}
      <main className="content-wrapper" style={isEmbedMode ? { marginLeft: 0, width: '100%', position: 'relative' } : {}}>
        {isEmbedMode && (
          <button 
            onClick={() => window.history.back()}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 50,
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au Blog
          </button>
        )}

        {loadingProfile ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Chargement du portfolio...</p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center', fontFamily: 'var(--font-title)' }}>
                ⚠️ {error}
              </div>
            )}

            {currentPage === 'home' && (
              <HomeView profile={profile} albums={albums} navigateTo={navigateTo} />
            )}

            {currentPage === 'galleries' && (
              <GalleriesView albums={albums} navigateTo={navigateTo} />
            )}

            {currentPage === 'album' && (
              <AlbumView
                selectedAlbumId={selectedAlbumId}
                albums={albums}
                photos={photos}
                loadingPhotos={loadingPhotos}
                onPhotoClick={(idx) => setLightboxIndex(idx)}
              />
            )}

            {currentPage === 'page' && (
              loadingPageDetail ? (
                <div className="loader-container">
                  <div className="spinner"></div>
                  <p>Chargement de la page...</p>
                </div>
              ) : currentPageData && (
                <PageView
                  pageData={currentPageData}
                  onPhotoClick={(albumPhotos, idx) => {
                    setPhotos(albumPhotos);
                    setLightboxIndex(idx);
                  }}
                  navigateToPage={navigateToPage}
                />
              )
            )}

            {currentPage === 'about' && (
              <AboutView profile={profile} />
            )}

            {currentPage === 'contact' && (
              <ContactView />
            )}
          </>
        )}

        {!isEmbedMode && <Footer profile={profile} />}
      </main>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && photos.length > 0 && (
          <Lightbox
            photos={photos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onComment={(idx) => {
              setLightboxIndex(idx);
              setShowCommentModal(true);
            }}
            onReport={(idx) => {
              setLightboxIndex(idx);
              setShowReportModal(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Comment Form Popup */}
      {showCommentModal && lightboxIndex !== null && photos.length > lightboxIndex && (
        <CommentModal
          photo={photos[lightboxIndex]}
          onClose={() => setShowCommentModal(false)}
          onSubmit={handleCommentSubmit}
          submitting={submittingComment}
          success={commentSuccess}
          error={commentError}
        />
      )}

      {/* Report Form Popup */}
      {showReportModal && lightboxIndex !== null && photos.length > lightboxIndex && (
        <ReportModal
          photo={photos[lightboxIndex]}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleSendReport}
          submitting={submittingReport}
          success={reportSuccess}
          error={reportError}
        />
      )}

      {/* Bottom Floating Watermark Badge */}
      <a 
        href={window.location.origin} 
        className="watermark-badge"
      >
        <span className="dot"></span>
        <span>Propulsé par <strong style={{ color: 'var(--color-accent)' }}>LuminaView</strong></span>
      </a>
    </div>
  );
};

export default App;
