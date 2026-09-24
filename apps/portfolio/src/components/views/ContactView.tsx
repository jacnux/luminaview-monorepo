import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from './variants';
import { UserProfile } from '../../types';
import axios from 'axios';

interface ContactViewProps {
  profile: UserProfile | null;
  navigateTo?: (page: 'home' | 'galleries' | 'album' | 'about' | 'contact' | 'page' | 'series' | 'exhibitions', albumId?: string | null) => void;
}

const ContactView: React.FC<ContactViewProps> = ({ profile, navigateTo }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?._id) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      await axios.post('/api/users/contact', {
        fromName: name,
        fromEmail: email,
        message,
        toUserId: profile._id
      });
      setStatus('success');
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        key="contact-success"
        style={{
          maxWidth: '540px',
          margin: '3rem auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '2rem'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}
        >
          ✓
        </div>
        <h2 className="section-title" style={{ marginBottom: '0.25rem', textAlign: 'center' }}>
          Message envoyé avec succès !
        </h2>
        <p style={{ color: 'var(--color-text-muted, #9ca3af)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
        </p>
        {navigateTo && (
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="btn-submit"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            ← Retour à l'accueil
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" key="contact">
      <h2 className="section-title">Me Contacter</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        {status === 'error' && (
          <div className="p-4 mb-4 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 rounded text-sm">
            Une erreur est survenue lors de l'envoi du message. Veuillez vérifier les informations et réessayer.
          </div>
        )}
        <div>
          <label>Nom complet :</label>
          <input type="text" className="form-input" required placeholder="Votre nom" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label>Adresse e-mail :</label>
          <input type="email" className="form-input" required placeholder="Votre email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Message :</label>
          <textarea rows={6} className="form-textarea" required placeholder="Votre message..." value={message} onChange={e => setMessage(e.target.value)}></textarea>
        </div>
        <button type="submit" className="btn-submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Envoi en cours...' : 'Envoyer'}
        </button>
      </form>
    </motion.div>
  );
};

export default ContactView;
