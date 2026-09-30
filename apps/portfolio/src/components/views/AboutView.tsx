import React from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Mail } from 'lucide-react';
import type { UserProfile } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import { pageVariants } from './variants';

interface AboutViewProps {
  profile: UserProfile | null;
  navigateTo?: (page: 'home' | 'galleries' | 'album' | 'about' | 'contact' | 'page' | 'series' | 'exhibitions', albumId?: string | null) => void;
}

const formatName = (name?: string): string => {
  if (!name) return 'Jac';
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Jac';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const AboutView: React.FC<AboutViewProps> = ({ profile, navigateTo }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      key="about"
      className="about-view-container"
    >
      <h2 className="section-title">À propos</h2>
      <div className="about-section glass-card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <div 
            className="about-avatar-container"
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-glow), 0 8px 24px rgba(0,0,0,0.25)',
              border: '2px solid var(--color-accent)'
            }}
          >
            {profile?.avatar ? (
              <img src={`/uploads/${profile.avatar}`} alt="Avatar" className="about-avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-accent)', fontSize: '2.5rem' }}>
                <User size={48} />
              </div>
            )}
          </div>

          {profile?.tagline && (
            <div className="about-tagline-card glass-panel" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <MarkdownRenderer>{profile.tagline}</MarkdownRenderer>
            </div>
          )}
        </div>

        <div className="about-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Camera size={20} style={{ color: 'var(--color-accent)' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-accent)', margin: 0, fontFamily: 'var(--font-title)' }}>
              {formatName(profile?.name)} — Photographies
            </h3>
          </div>
          <div className="about-bio" style={{ lineHeight: '1.7', color: 'var(--color-text)' }}>
            <MarkdownRenderer>{profile?.bio || "Bonjour à tous les amoureux de photographie et aux curieux qui passent par ici ! Bienvenue sur mon site, avec les photos que j'aime partager !"}</MarkdownRenderer>
          </div>

          {navigateTo && (
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigateTo('contact')}
                className="btn-submit"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Mail size={16} />
                Me contacter
              </button>
              <button
                type="button"
                onClick={() => navigateTo('galleries')}
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontWeight: 500
                }}
              >
                Explorez mes galeries
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AboutView;

