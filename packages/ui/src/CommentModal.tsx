import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { Photo } from '@luminaview/types';

export interface CommentModalProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (authorName: string, authorEmail: string, message: string) => Promise<void>;
  submitting: boolean;
  success: string | null;
  error: string | null;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  photo,
  isOpen,
  onClose,
  onSubmit,
  submitting,
  success,
  error,
}) => {
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(author, email, message).then(() => {
      if (!error) {
        setMessage('');
      }
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="grimoire-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ zIndex: 100000 }}
      >
        <motion.div
          className="grimoire-modal-card grimoire-about-card"
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grimoire-about-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontFamily: 'var(--font-heading)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
              <MessageSquare size={16} />
              <span>Commenter — {photo.title || 'Photographie'}</span>
            </div>

            <button className="grimoire-drawer-close" onClick={onClose} aria-label="Fermer">
              <X size={20} />
            </button>
          </div>

          <div className="grimoire-about-body">
            {success && (
              <div style={{ padding: '0.8rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div style={{ padding: '0.8rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Votre Nom *</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  placeholder="Ex: Marie Dupont"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#ffffff', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Email (optionnel)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#ffffff', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Message *</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Partagez vos impressions sur cette œuvre..."
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#ffffff', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.8rem' }}>
                <button type="button" className="grimoire-back-btn" onClick={onClose} style={{ margin: 0 }}>
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="grimoire-back-btn"
                  style={{ background: '#ffffff', color: '#000000', borderColor: '#ffffff', fontWeight: 500, margin: 0 }}
                >
                  <Send size={14} />
                  <span>{submitting ? 'Envoi...' : 'Envoyer'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
