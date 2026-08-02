import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Camera } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserProfile } from '../types';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

const resolveImageUrl = (img?: string): string | null => {
  if (!img) return null;
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/uploads/')) {
    return img;
  }
  return `/uploads/${img}`;
};

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  const displayName = profile?.name || 'Jac';
  const bio = profile?.bio || profile?.portfolioIntro || 'Bienvenue sur mon portfolio de photographies et séries d\'exposition.';
  const avatarUrl = resolveImageUrl(profile?.avatar || profile?.avatarUrl || profile?.bannerImage);

  return (
    <AnimatePresence>
      <motion.div
        className="grimoire-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="grimoire-modal-card grimoire-about-card"
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header de la Modale À propos */}
          <div className="grimoire-about-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontFamily: 'var(--font-heading)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.95rem' }}>
              <User size={16} />
              <span>À propos</span>
            </div>

            <button className="grimoire-drawer-close" onClick={onClose} aria-label="Fermer">
              <X size={20} />
            </button>
          </div>

          <div className="grimoire-about-body">
            {/* Photo de profil (Avatar) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  style={{
                    width: '95px',
                    height: '95px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '95px',
                    height: '95px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Camera size={38} />
                </div>
              )}
            </div>

            <h2 className="grimoire-about-title">{displayName}</h2>
            <div className="grimoire-about-subtitle">portfolio</div>

            {profile?.tagline && (
              <blockquote className="grimoire-about-quote">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{profile.tagline}</ReactMarkdown>
              </blockquote>
            )}

            <div className="grimoire-about-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{bio}</ReactMarkdown>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              className="grimoire-back-btn"
              style={{ width: '100%', justifyContent: 'center', marginBottom: 0 }}
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutModal;
