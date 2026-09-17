import React, { useState } from 'react';
import axios from 'axios';
import GrimoireHeader from './GrimoireHeader';
import HeroSlider from './HeroSlider';
import ProjectDetailView from './ProjectDetailView';
import CopyrightModal from './CopyrightModal';
import AboutModal from './AboutModal';
import ContactModal from './ContactModal';
import { UserProfile, Album, Photo } from '../../types';

interface GrimoireViewProps {
  profile: UserProfile | null;
  albums: Album[];
}

const GrimoireView: React.FC<GrimoireViewProps> = ({ profile, albums }) => {
  const [viewState, setViewState] = useState<'home' | 'project'>('home');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Modales distinctes
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Sélectionner un album et charger l'intégralité des photos
  const handleSelectAlbum = async (albumId: string) => {
    const targetAlbum = albums.find((a) => a._id === albumId);
    if (!targetAlbum) return;

    setSelectedAlbum(targetAlbum);
    setViewState('project');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      setLoadingPhotos(true);
      const res = await axios.get(`/api/albums/photos/${albumId}`);
      if (res.data && Array.isArray(res.data)) {
        setSelectedPhotos(res.data);
      } else {
        setSelectedPhotos(targetAlbum.photos || []);
      }
    } catch (err) {
      console.warn('Utilisation des photos en cache de l\'album:', err);
      setSelectedPhotos(targetAlbum.photos || []);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleGoHome = () => {
    setViewState('home');
    setSelectedAlbum(null);
    setSelectedPhotos([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="grimoire-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark, #070709)', color: 'var(--text-main, #f5f5f7)' }}>
      <GrimoireHeader
        profile={profile}
        albums={albums}
        onSelectAlbum={handleSelectAlbum}
        onGoHome={handleGoHome}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenContact={() => setShowContactModal(true)}
      />

      <main style={{ flex: 1, position: 'relative' }}>
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

export default GrimoireView;
