import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Check, Copy, Send, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, profile }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Extraction dynamique de l'email de l'utilisateur actif (multi-utilisateur LuminaView)
  const email = profile?.email;

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          {/* Header de la Modale Contact */}
          <div className="grimoire-about-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontFamily: 'var(--font-heading)', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.95rem' }}>
              <Mail size={16} />
              <span>Contact — {profile?.name || 'Photographe'}</span>
            </div>

            <button className="grimoire-drawer-close" onClick={onClose} aria-label="Fermer">
              <X size={20} />
            </button>
          </div>

          <div className="grimoire-about-body">
            <h2 className="grimoire-about-title">Me Contacter</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', marginBottom: '1.4rem', marginTop: '4px' }}>
              Pour toute demande de tirage, exposition ou collaboration photographique.
            </p>

            {email ? (
              <>
                <div className="grimoire-contact-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="grimoire-contact-icon">
                      <Mail size={18} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Adresse Email
                      </div>
                      <a href={`mailto:${email}`} className="grimoire-contact-email">
                        {email}
                      </a>
                    </div>
                  </div>

                  <button className="grimoire-copy-btn" onClick={handleCopyEmail} title="Copier l'adresse email">
                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copied ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <a
                    href={`mailto:${email}?subject=Prise%20de%20contact%20Portfolio`}
                    className="grimoire-back-btn"
                    style={{ width: '100%', justifyContent: 'center', background: '#ffffff', color: '#000000', borderColor: '#ffffff', fontWeight: 500, padding: '12px 16px', margin: 0 }}
                  >
                    <Send size={15} />
                    <span>Envoyer un message direct</span>
                  </a>
                </div>
              </>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <AlertCircle size={28} style={{ marginBottom: '0.5rem', opacity: 0.7 }} />
                <div>Aucune adresse email n'a été renseignée sur ce profil.</div>
              </div>
            )}
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

export default ContactModal;
