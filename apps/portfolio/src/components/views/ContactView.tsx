import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { pageVariants } from './variants';
import type { UserProfile } from '../../types';
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
        className="glass-card"
        style={{
          maxWidth: '560px',
          margin: '3rem auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)'
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h2 className="section-title" style={{ marginBottom: '0.25rem', textAlign: 'center' }}>
          Message envoyé avec succès !
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Merci pour votre message. Je vous répondrai dans les plus brefs délais.
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
    <motion.div variants={pageVariants} initial="initial" animate="animate" key="contact" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h2 className="section-title">Me Contacter</h2>
      
      <form 
        className="contact-form glass-card" 
        onSubmit={handleSubmit}
        style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        {status === 'error' && (
          <div 
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={18} />
            <span>Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.</span>
          </div>
        )}

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: 'var(--color-text)' }}>
            <User size={16} style={{ color: 'var(--color-accent)' }} />
            <span>Nom complet :</span>
          </label>
          <input 
            type="text" 
            className="form-input" 
            required 
            placeholder="Votre nom" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: 'var(--color-text)' }}>
            <Mail size={16} style={{ color: 'var(--color-accent)' }} />
            <span>Adresse e-mail :</span>
          </label>
          <input 
            type="email" 
            className="form-input" 
            required 
            placeholder="Votre email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: 'var(--color-text)' }}>
            <MessageSquare size={16} style={{ color: 'var(--color-accent)' }} />
            <span>Message :</span>
          </label>
          <textarea 
            rows={5} 
            className="form-textarea" 
            required 
            placeholder="Votre message..." 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            style={{ width: '100%' }}
          ></textarea>
        </div>

        <button 
          type="submit" 
          className="btn-submit" 
          disabled={status === 'loading'}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', alignSelf: 'flex-start' }}
        >
          <Send size={16} />
          {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
        </button>
      </form>
    </motion.div>
  );
};

export default ContactView;

