import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from './variants';
import { UserProfile } from '../../types';
import axios from 'axios';

interface ContactViewProps {
  profile: UserProfile | null;
}

const ContactView: React.FC<ContactViewProps> = ({ profile }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setStatus('loading');
    try {
      await axios.post('/api/blog/contact', {
        name,
        email,
        message,
        toUser: profile.email
      });
      setStatus('success');
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" key="contact">
      <h2 className="section-title">Me Contacter</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        {status === 'success' && <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">Votre message a été envoyé avec succès.</div>}
        {status === 'error' && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">Une erreur est survenue lors de l'envoi du message.</div>}
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
