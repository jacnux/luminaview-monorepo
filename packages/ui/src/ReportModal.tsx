import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Photo } from '@luminaview/types';

export interface ReportModalProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  submitting: boolean;
  success: string | null;
  error: string | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  photo,
  isOpen,
  onClose,
  onSubmit,
  submitting,
  success,
  error,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason).then(() => {
      if (!error) {
        setReason('');
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontFamily: 'var(--font-heading)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
              <Flag size={16} />
              <span>Signaler l'image — {photo.title || 'Photographie'}</span>
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
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, textAlign: 'left' }}>
                Veuillez indiquer la raison pour laquelle vous estimez cette photographie inappropriée ou litigieuse.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Motif du signalement *</label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Ex: Contenu inapproprié, non respect du droit d'auteur..."
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
                  style={{ background: '#ef4444', color: '#ffffff', borderColor: '#ef4444', fontWeight: 500, margin: 0 }}
                >
                  <AlertCircle size={14} />
                  <span>{submitting ? 'Envoi...' : 'Signaler'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
