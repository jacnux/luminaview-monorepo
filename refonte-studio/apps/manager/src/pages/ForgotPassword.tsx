import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Un email de réinitialisation vous a été envoyé si cette adresse existe.');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la demande');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-yellow-400">Mot de passe oublié</h1>

        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-center text-sm">{error}</p>}
        {message && <p className="bg-green-500/20 text-green-400 p-3 rounded mb-4 text-center text-sm">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/10">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
              required
            />
          </div>

          <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg transition">
            Envoyer le lien
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          <Link to="/login" className="text-yellow-400 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
