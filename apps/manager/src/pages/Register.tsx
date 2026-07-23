import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError("Vous devez accepter les Conditions Générales d'Utilisation pour continuer.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la création du compte. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 border border-amber-500/30">
            ✉️
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Inscription réussie !</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            Un email de confirmation a été envoyé à <strong className="text-amber-400 font-semibold">{email}</strong>.
            <br /><br />
            Consultez votre boîte de réception pour valider votre compte et commencer à créer votre univers photographique.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold px-8 py-3.5 rounded-xl transition text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20"
          >
            <span>Accéder à la connexion</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT COLUMN: Brand Showcase */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between z-10 bg-gradient-to-br from-black/80 via-black/40 to-transparent border-b lg:border-b-0 lg:border-r border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-10 sm:mb-16">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
                <span className="text-xl">📷</span>
              </div>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
                Lumina Studio
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-amber-500/80">
                Plateforme Éditoriale Photographique
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Créez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">studio en ligne</span> en quelques secondes.
          </h1>

          <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed mb-10">
            Rejoignez une plateforme conçue sur-mesure pour les exigences des photographes. Déployez votre portfolio autonome, votre carnet de route technique et votre blog en un seul endroit.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-2xl">🌐</span>
              <div>
                <h3 className="font-bold text-amber-400 text-sm">Vos sous-domaines personnels</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Publiez sur <code className="text-amber-300">votre-nom.helioscope.fr</code> avec certificat SSL HTTPS délivré automatiquement.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-2xl">🎛️</span>
              <div>
                <h3 className="font-bold text-amber-400 text-sm">Modules activables sur-mesure</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Activez ou désactivez les modules Blog et Carnet de route selon vos besoins depuis vos paramètres de profil.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 hidden lg:block">
          <p className="text-xs text-gray-500 italic">
            « L'œil ne voit que ce que l'esprit est prêt à comprendre. » — Henri Cartier-Bresson
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Form */}
      <div className="lg:w-1/2 p-6 sm:p-12 flex items-center justify-center z-10">
        <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 relative">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Créer un compte Studio</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Commencez à structurer votre travail photographique
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-medium text-center backdrop-blur-md flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Nom d'artiste / Identifiant
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: jac"
                required
                className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Adresse Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.fr"
                required
                className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            <div className="flex items-start gap-3 pt-2 text-xs text-gray-300">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <label htmlFor="terms" className="cursor-pointer select-none leading-relaxed text-gray-400">
                J'accepte les{' '}
                <a
                  href="/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
                >
                  Conditions Générales d'Utilisation
                </a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold py-3.5 px-6 rounded-xl transition duration-200 transform active:scale-[0.99] shadow-lg shadow-amber-500/20 text-sm tracking-wide uppercase flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Création du compte...</span>
                </>
              ) : (
                <>
                  <span>Créer mon compte Studio</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-400">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 transition">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

