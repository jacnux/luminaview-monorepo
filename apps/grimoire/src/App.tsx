import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import ProjectDetailView from './components/ProjectDetailView';
import CopyrightModal from './components/CopyrightModal';
import AboutModal from './components/AboutModal';
import ContactModal from './components/ContactModal';
import { UserProfile, Album, Photo } from './types';

const getUsernameFromEnvironment = (): string => {
  const params = new URLSearchParams(window.location.search);
  const queryUser = params.get('u') || params.get('user');
  if (queryUser) return queryUser.trim();

  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
    const subdomain = parts[0].trim();
    if (subdomain.endsWith('-grimoire') || subdomain.endsWith('-portfolio')) {
      return subdomain.replace(/-grimoire|-portfolio/, '');
    }
    return subdomain;
  }

  return 'jac';
};

const USERNAME = getUsernameFromEnvironment();

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'home' | 'project'>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales distinctes
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Charger les données du portfolio dynamiquement selon l'utilisateur
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/albums/portfolio/${USERNAME}?theme=grimoire`);
        setProfile(res.data.user || null);
        setAlbums(res.data.albums || []);
      } catch (err: any) {
        console.error('Erreur chargement portfolio Grimoire:', err);
        // Fallback démo sans email en dur
        setProfile({
          name: 'Jac',
          email: '',
          bio: 'Bienvenue sur mon portfolio de photographies et séries d\'exposition.',
          profession: 'portfolio',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Sélectionner un album et charger l'intégralité des photos
  const handleSelectAlbum = async (albumId: string) => {
    const targetAlbum = albums.find((a) => a._id === albumId);
    if (!targetAlbum) return;

    setSelectedAlbum(targetAlbum);
    setViewState('project');

    try {
      const res = await axios.get(`/api/albums/photos/${albumId}`);
      if (res.data && Array.isArray(res.data)) {
        setSelectedPhotos(res.data);
      } else {
        setSelectedPhotos(targetAlbum.photos || []);
      }
    } catch (err) {
      console.warn('Utilisation des photos en cache de l\'album:', err);
      setSelectedPhotos(targetAlbum.photos || []);
    }
  };

  const handleGoHome = () => {
    setViewState('home');
    setSelectedAlbum(null);
    setSelectedPhotos([]);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-dark)',
          color: 'var(--text-main)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-heading)',
        }}
      >
        <div style={{ fontSize: '1.4rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Grimoire
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
          Chargement du portfolio...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
      <Header
        profile={profile}
        albums={albums}
        onSelectAlbum={handleSelectAlbum}
        onGoHome={handleGoHome}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenContact={() => setShowContactModal(true)}
      />

      <main style={{ flex: 1 }}>
        {viewState === 'home' ? (
          <HeroSlider
            albums={albums}
            profile={profile}
            onSelectAlbum={handleSelectAlbum}
          />
        ) : (
          selectedAlbum && (
            <ProjectDetailView
              album={selectedAlbum}
              photos={selectedPhotos}
              onBack={handleGoHome}
            />
          )
        )}
      </main>

      <footer className="grimoire-footer">
        <div>
          © {new Date().getFullYear()} {profile?.name || 'Jac'}. Tous droits réservés.
        </div>
        <button
          className="grimoire-copyright-btn"
          onClick={() => setShowCopyrightModal(true)}
          title="Mentions légales & Droits d'auteur"
        >
          ©
        </button>
      </footer>

      <CopyrightModal
        isOpen={showCopyrightModal}
        onClose={() => setShowCopyrightModal(false)}
        profile={profile}
      />

      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        profile={profile}
      />

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        profile={profile}
      />
    </div>
  );
};

export default App;
