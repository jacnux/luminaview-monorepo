import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const LandingPage = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [presentationVideo, setPresentationVideo] = useState<string>('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/users/public/profile').then(res => {
      if (res.data?.presentationVideo) {
        setPresentationVideo(res.data.presentationVideo);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT COLUMN: Brand Showcase & The 4 Spaces of Refonte-Gemini */}
      <div className="lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-between z-10 bg-gradient-to-br from-black/80 via-black/40 to-transparent border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto">
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 mb-10 sm:mb-14">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
                <span className="text-xl">☀️</span>
              </div>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
                Lumina Studio
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-amber-500/80">
                Écosystème Photographique 2.0
              </span>
            </div>
          </div>

          {/* Main Hook Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Donnez une dimension <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">éditoriale & technique</span> à vos créations.
          </h1>

          <p className="text-gray-300 text-base sm:text-lg font-light leading-relaxed mb-4">
            LuminaView est la plateforme tout-en-un pensée pour les photographes. Un studio privé centralisé, votre portfolio autonome, vos galeries virtuelles Grimoire, votre carnet de laboratoire et votre journal de création.
          </p>

          <blockquote className="text-xs sm:text-sm text-amber-300/80 italic font-serif mb-10 pl-4 border-l-2 border-amber-500/40">
            « La photographie est un secret sur un secret. Plus elle vous en dit, moins vous en savez. » — Diane Arbus
          </blockquote>

          {/* Grid of the 5 Decoupled Spaces */}
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Space 1: Studio Manager */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition duration-300 backdrop-blur-md group">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">🎛️</div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  luminaview.fr
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition">
                Lumina Studio
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Tableau de bord privé pour administrer vos albums, galeries virtuelles par tags et interrupteurs On/Off.
              </p>
            </div>

            {/* Space 2: Portfolio Artfolio */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition duration-300 backdrop-blur-md group">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">🖼️</div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                  [nom].helioscope.fr
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition">
                Portfolio Artfolio
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Vitrine publique autonome avec thèmes visuels (Classic & Artfolio) pour exposer vos séries et biographie.
              </p>
            </div>

            {/* Space 3: Grimoire & Galeries Virtuelles */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition duration-300 backdrop-blur-md group">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">📜</div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  [nom]-grimoire.helioscope.fr
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition">
                Grimoire & Galeries Virtuelles
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Version épurée du portfolio exposant vos albums virtuels (filtres par tags) avec le thème visuel Grimoire.
              </p>
            </div>

            {/* Space 4: Chambre Noire */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition duration-300 backdrop-blur-md group">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">🎞️</div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  [nom]-carnet.helioscope.fr
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition">
                Chambre Noire & Carnet
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Mémoire technique de terrain, fiches chimies (135/120/4x5), planches-contacts et intégration iframe.
              </p>
            </div>

            {/* Space 5: Blog Hélioscope */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition duration-300 backdrop-blur-md group sm:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">✍️</div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  [nom]-blog.helioscope.fr
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition">
                Blog Hélioscope
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Journal de création avec éditeur Notebook épuré, récits de prises de vue et commentaires publics.
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

      {/* RIGHT COLUMN: Glassmorphic Access & Action Card (Exact Layout of Login.tsx) */}
      <div className="lg:w-5/12 p-6 sm:p-12 flex items-center justify-center z-10">
        <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 relative">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              <span>Écosystème Photographique 2.0</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bienvenue dans Studio
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
              Accédez à votre espace ou rejoignez la plateforme
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {token ? (
              <Link
                to="/dashboard"
                className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-amber-500/20 text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition transform hover:scale-[1.02]"
              >
                <span>Accéder à mon Tableau de bord</span>
                <span>&rarr;</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-amber-500/20 text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition transform hover:scale-[1.02]"
                >
                  <span>Connexion Membre</span>
                  <span>&rarr;</span>
                </Link>

                <Link
                  to="/register"
                  className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-amber-400/50 py-4 px-6 rounded-2xl transition duration-200 text-white font-bold text-sm uppercase tracking-wider backdrop-blur-md flex items-center justify-center gap-3"
                >
                  <span>Créer un Studio Gratuit</span>
                </Link>
              </>
            )}

            {presentationVideo && (
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 py-3.5 px-6 rounded-2xl transition duration-200 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>▶️ Présentation Visuelle LuminaView</span>
              </button>
            )}
          </div>

          {/* Key Features Bullet Points */}
          <div className="space-y-3 pt-6 border-t border-white/10 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">✓</span>
              <span>Sous-domaines & SSL Automatique Caddy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">✓</span>
              <span>Intégration Iframe d'exportation sans barre</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">✓</span>
              <span>Modules On/Off sur-mesure (hasBlog, hasCarnet)</span>
            </div>
          </div>

          <div className="mt-8 text-center border-t border-white/5 pt-4">
            <Link to="/legal" className="text-[11px] text-gray-500 hover:text-gray-300 transition">
              Mentions Légales & Confidentialité
            </Link>
          </div>
        </div>
      </div>

      {/* Video Presentation Modal */}
      {videoModalOpen && presentationVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onClick={() => setVideoModalOpen(false)}>
          <div className="max-w-4xl w-full bg-gray-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6 bg-gray-950 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2">
                  🎬 Présentation Visuelle LuminaView
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Découvrez les 5 espaces de l'écosystème en vidéo officielle</p>
              </div>
              <button onClick={() => setVideoModalOpen(false)} className="text-gray-400 hover:text-white text-3xl font-bold px-2">&times;</button>
            </div>
            <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center bg-black">
              <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10 bg-black flex items-center justify-center">
                <video
                  controls
                  preload="metadata"
                  className="w-full h-full object-contain"
                  poster="/uploads/luminaview.png"
                >
                  <source src={`/uploads/${presentationVideo}`} type="video/mp4" />
                  Votre navigateur ne prend pas en charge la lecture vidéo.
                </video>
              </div>
            </div>
            <div className="p-4 bg-gray-950 border-t border-gray-800 flex flex-wrap justify-between items-center gap-3 text-xs text-gray-400">
              
              <button onClick={() => setVideoModalOpen(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;




