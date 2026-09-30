import React from 'react';
import { motion } from 'framer-motion';
import type { UserProfile, Album } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import { pageVariants, containerVariants, itemVariants } from './variants';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

interface HomeViewProps {
  profile: UserProfile | null;
  albums: Album[];
  navigateTo: (page: 'home' | 'galleries' | 'album' | 'about' | 'contact' | 'page', albumId?: string | null) => void;
}

const formatName = (name?: string): string => {
  if (!name) return 'Jac';
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Jac';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const HomeView: React.FC<HomeViewProps> = ({ profile, albums, navigateTo }) => {
  const featuredAlbums = albums.filter((album) => album.isFeatured);

  const getHomeImage = () => {
    if (profile?.bannerImage) return `/uploads/${profile.bannerImage}`;
    if (albums.length > 0 && albums[0].coverImage) return `/uploads/${albums[0].coverImage}`;
    return null;
  };

  const homeImage = getHomeImage();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      key="home"
      className="home-view-container space-y-10"
    >
      {/* Photo de couverture / Hero Banner */}
      <div className="home-photo-container relative group">
        {homeImage ? (
          <img 
            src={homeImage} 
            alt={formatName(profile?.name)} 
            className="home-photo"
            fetchPriority="high"
            decoding="async"
            width={1200}
            height={675}
          />
        ) : (
          <div className="flex h-72 items-center justify-center bg-stone-900 text-stone-500 font-medium">
            <span>Aucun visuel d'accueil configuré</span>
          </div>
        )}
      </div>

      {/* Citation / Tagline du photographe */}
      {profile?.tagline && (
        <div className="flex justify-center">
          <div className="home-tagline-card flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <MarkdownRenderer>{profile.tagline}</MarkdownRenderer>
          </div>
        </div>
      )}

      {/* Texte de présentation du portfolio */}
      <div className="home-text">
        <MarkdownRenderer>{profile?.portfolioIntro || "Bienvenue sur mon site, avec les photos que j'aime partager !"}</MarkdownRenderer>
      </div>

      {/* SECTION NOUVEAUTÉS - LES GALERIES DU PHOTOGRAPHE */}
      {featuredAlbums.length > 0 && (
        <div className="home-news-section mt-12">
          <h2 className="section-title mb-6">Nouveautés</h2>

          <motion.div 
            className="grid-gallery"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {featuredAlbums.map((album) => (
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
        </div>
      )}
    </motion.div>
  );
};

export default HomeView;
