import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Instagram, Mail, Globe } from 'lucide-react';
import { UserProfile, Album } from '../types';

interface HeaderProps {
  profile: UserProfile | null;
  albums: Album[];
  onSelectAlbum: (albumId: string) => void;
  onGoHome: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

const Header: React.FC<HeaderProps> = ({
  profile,
  albums,
  onSelectAlbum,
  onGoHome,
  onOpenAbout,
  onOpenContact,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [portfolioExpanded, setPortfolioExpanded] = useState(true);

  const displayName = profile?.name || 'Jac';
  const displayProfession = profile?.profession || 'portfolio';

  return (
    <>
      <header className="grimoire-navbar">
        <div className="grimoire-brand" onClick={onGoHome}>
          <h1 className="grimoire-title">{displayName}</h1>
          <div className="grimoire-subtitle">{displayProfession}</div>
        </div>

        <div className="grimoire-nav-controls">
          <button
            className="grimoire-menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <div className="grimoire-hamburger">
              <span className="line" />
              <span className="line" />
              <span className="line" />
            </div>
            <span>Menu</span>
          </button>
        </div>
      </header>

      {/* OVERLAY DÉROULANT LATÉRAL DROIT SUR LA PAGE EN COURS */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="grimoire-drawer-right"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grimoire-drawer-right-header">
              <button
                className="grimoire-drawer-close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Fermer le menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grimoire-drawer-right-body">
              {/* LIEN PRINCIPAL : PROFOLIO / GALERIES AVEC POLICE ÉLÉGANTE ET PLUS PETITE */}
              <div className="grimoire-right-menu-block">
                <button
                  className="grimoire-right-main-link portfolio-link-title"
                  onClick={() => setPortfolioExpanded(!portfolioExpanded)}
                  onMouseEnter={() => setPortfolioExpanded(true)}
                >
                  <span>Profolio</span>
                  {portfolioExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <AnimatePresence>
                  {portfolioExpanded && (
                    <motion.div
                      className="grimoire-right-submenu-list"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {albums.map((album) => (
                        <a
                          key={album._id}
                          href={`#${album._id}`}
                          className="grimoire-right-submenu-item"
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectAlbum(album._id);
                            setDrawerOpen(false);
                          }}
                        >
                          {album.title}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* LIEN PRINCIPAL : À PROPOS */}
              <div className="grimoire-right-menu-block">
                <button
                  className="grimoire-right-main-link"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenAbout();
                  }}
                >
                  <span>À propos</span>
                </button>
              </div>

              {/* LIEN PRINCIPAL : CONTACT */}
              <div className="grimoire-right-menu-block">
                <button
                  className="grimoire-right-main-link"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenContact();
                  }}
                >
                  <span>Contact</span>
                </button>
              </div>

              {/* ICÔNES SOCIAUX EN BAS DE MENU */}
              <div className="grimoire-right-socials">
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} title="Email" className="grimoire-social-icon">
                    <Mail size={16} />
                  </a>
                )}
                {profile?.socialLinks?.instagram && (
                  <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" title="Instagram" className="grimoire-social-icon">
                    <Instagram size={16} />
                  </a>
                )}
                {profile?.socialLinks?.website && (
                  <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" title="Site Web" className="grimoire-social-icon">
                    <Globe size={16} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
