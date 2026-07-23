import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT COLUMN: Brand Showcase & Value Proposition */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between z-10 bg-gradient-to-br from-black/80 via-black/40 to-transparent border-b lg:border-b-0 lg:border-r border-white/10">
        <div>
          {/* Logo & Brand Header */}
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

          {/* Main Hook Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Donnez de l'ampleur & de la rigueur à vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">réalisations photographiques.</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed mb-10">
            Un espace de gestion centralisé unique pour organiser vos séries, suivre vos processus de laboratoire argentique, tenir votre journal de création et publier vos portfolios d'exposition.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition duration-300">
              <div className="text-2xl mb-2">🖼️</div>
              <h3 className="font-bold text-amber-400 text-sm mb-1">Portfolio Artfolio</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Vitrine publique épurée avec gestion dynamique des thèmes et mise en valeur de vos séries.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition duration-300">
              <div className="text-2xl mb-2">🎞️</div>
              <h3 className="font-bold text-amber-400 text-sm mb-1">Chambre Noire</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Mémoire technique, suivi des rouleaux/plans-films, temps de développement et planches-contacts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition duration-300">
              <div className="text-2xl mb-2">✍️</div>
              <h3 className="font-bold text-amber-400 text-sm mb-1">Blog Hélioscope</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Rédigez vos récits et actualités dans un éditeur type Notebook minimaliste et puissant.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition duration-300">
              <div className="text-2xl mb-2">🌐</div>
              <h3 className="font-bold text-amber-400 text-sm mb-1">Multi-Domaines SSL</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sous-domaines automatiques sécurisés en HTTPS pour chaque brique de votre écosystème.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-12 pt-6 border-t border-white/10 hidden lg:block">
          <p className="text-xs text-gray-500 italic">
            « La photographie est un secret sur un secret. Plus elle vous en dit, moins vous en savez. » — Diane Arbus
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Glassmorphic Login Form */}
      <div className="lg:w-1/2 p-6 sm:p-12 flex items-center justify-center z-10">
        <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 relative">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Connexion Studio</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Accédez à votre tableau de bord de gestion photographique
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-medium text-center backdrop-blur-md flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.fr"
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Mot de passe
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition">
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3.5 pr-12 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition text-base"
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold py-4 px-6 rounded-xl transition duration-200 transform active:scale-[0.99] shadow-lg shadow-amber-500/20 text-sm tracking-wide uppercase flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Entrer dans le Studio</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-400">
              Vous n'avez pas encore votre espace Studio ?{' '}
              <Link to="/register" className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 transition">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

