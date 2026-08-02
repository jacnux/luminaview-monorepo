import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types';

interface CopyrightModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

const CopyrightModal: React.FC<CopyrightModalProps> = ({ isOpen, onClose, profile }) => {
  const photographerName = profile?.name || 'Jac';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="grimoire-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="grimoire-modal-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={20} style={{ color: '#e5e7eb' }} />
                <h3>Mentions Légales & Copyright</h3>
              </div>
              <button
                className="grimoire-drawer-close"
                onClick={onClose}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <p>
              Toutes les photographies, séries visuelles et contenus éditoriaux présentés sur ce site sont la propriété exclusive de <strong>{photographerName}</strong> et/ou des publications mentionnées.
            </p>
            <p>
              Ils sont protégés par les lois internationales sur le droit d'auteur et la propriété intellectuelle. Aucune image ne peut être téléchargée, reproduite, modifiée, copiée ou utilisée sous quelque forme que ce soit sans autorisation écrite préalable.
            </p>

            <button
              className="grimoire-back-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
              onClick={onClose}
            >
              J'ai compris
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CopyrightModal;
