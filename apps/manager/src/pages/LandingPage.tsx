import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-16 text-center flex flex-col items-center">
        
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-lg shadow-amber-500/5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Lumina Studio — Écosystème Photographique 2.0</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 max-w-4xl">
          Donnez une dimension{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
            éditoriale & technique
          </span>{' '}
          à vos créations.
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-base sm:text-xl font-light leading-relaxed max-w-3xl mb-10">
          La plateforme tout-en-un pensée spécifiquement pour les photographes. Déployez votre portfolio autonome, tenez la mémoire technique de vos prises de vue & tirages de labo, et publiez votre journal de création.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {token ? (
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold py-4 px-8 rounded-2xl transition duration-200 transform hover:scale-[1.02] shadow-xl shadow-amber-500/20 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Accéder à mon Studio</span>
              <span>&rarr;</span>
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold py-4 px-8 rounded-2xl transition duration-200 transform hover:scale-[1.02] shadow-xl shadow-amber-500/20 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Créer mon Studio gratuit</span>
                <span>&rarr;</span>
              </Link>
              <Link
                to="/login"
                className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-amber-400/50 py-4 px-8 rounded-2xl transition duration-200 text-white font-bold text-sm uppercase tracking-wider backdrop-blur-md flex items-center justify-center gap-2"
              >
                <span>Connexion Membre</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* --- LES 4 ESPACES DÉCOUPLÉS --- */}
      <section className="relative z-10 py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Vos 4 Espaces de Création Autonomes
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Une architecture multi-domaines robuste organisée pour sublimer chaque facette de votre travail photographique.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Card 1: Studio Manager */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl text-amber-400">
                  🎛️
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Administration Privée
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition">
                Lumina Studio
              </h3>
              <p className="text-xs text-amber-300/80 font-mono mb-4">
                lumina.fr (Port 7080)
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                Tableau de bord centralisé pour administrer vos albums, galeries virtuelles par tags, modération des commentaires et activation instantanée des modules **Blog** et **Carnet de route** via interrupteurs On/Off.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Gestion globale & Profil</span>
              <span className="text-amber-400 group-hover:translate-x-1 transition-transform">En savoir plus &rarr;</span>
            </div>
          </div>

          {/* Card 2: Portfolio Artfolio */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-2xl text-yellow-400">
                  🖼️
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-yellow-400/80 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                  Vitrine Publique
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition">
                Portfolio Artfolio
              </h3>
              <p className="text-xs text-yellow-300/80 font-mono mb-4">
                [votre-nom].helioscope.fr (Port 7090)
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                Votre vitrine autonome personnalisable. Choix entre le thème **Hélioscope Classic** (menu horizontal) et le thème **Artfolio** (menu latéral fixe), présentation de vos séries, expositions et biographie.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Exposition & Séries</span>
              <span className="text-amber-400 group-hover:translate-x-1 transition-transform">En savoir plus &rarr;</span>
            </div>
          </div>

          {/* Card 3: Chambre Noire */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl text-purple-400">
                  🎞️
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400/80 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Mémoire Technique & Labo
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition">
                Chambre Noire & Carnet
              </h3>
              <p className="text-xs text-purple-300/80 font-mono mb-4">
                [votre-nom]-carnet.helioscope.fr (Port 7082)
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                Consignez l'intégralité de vos paramètres de prise de vue (boîtiers, objectifs, exposition) et de laboratoire (films 135/120/4x5, chimies, planches-contacts virtuelles). Intégration iframe d'exportation simplifiée.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Carnet de route & Labo</span>
              <span className="text-amber-400 group-hover:translate-x-1 transition-transform">En savoir plus &rarr;</span>
            </div>
          </div>

          {/* Card 4: Blog Hélioscope */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl text-blue-400">
                  ✍️
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400/80 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Journal Éditrice
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition">
                Blog Hélioscope
              </h3>
              <p className="text-xs text-blue-300/80 font-mono mb-4">
                [votre-nom]-blog.helioscope.fr (Port 7081)
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                Rédigez vos récits et actualités dans un éditeur type Notebook épuré avec barre d'outils Markdown interactive. Permettez à vos lecteurs de réagir via les commentaires modérés.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Actualités & Récits</span>
              <span className="text-amber-400 group-hover:translate-x-1 transition-transform">En savoir plus &rarr;</span>
            </div>
          </div>

        </div>
      </section>

      {/* --- FONCTIONNALITÉS CLÉS --- */}
      <section className="relative z-10 py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-10">
            Conçu pour l'excellence photographique
          </h2>

          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl">🌐</div>
              <h4 className="font-bold text-amber-400 text-sm">SSL Automatique Caddy</h4>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Sous-domaines sécurisés en HTTPS délivrés dynamiquement par Let's Encrypt.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl">🔗</div>
              <h4 className="font-bold text-amber-400 text-sm">Code d'Intégration Iframe</h4>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Exportez vos projets et planches-contacts sans barre de navigation sur n'importe quel site tiers.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl">🎛️</div>
              <h4 className="font-bold text-amber-400 text-sm">Modules On/Off Sur-Mesure</h4>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Activez ou désactivez les briques Blog et Carnet de route depuis votre profil en un clic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-10 text-center text-gray-500 text-xs border-t border-white/10 bg-black/40">
        <p>© 2026 LuminaView — L'écosystème photographique pro. Tous droits réservés.</p>
        <div className="mt-3 flex justify-center gap-6 text-gray-400">
          <Link to="/legal" className="hover:text-amber-400 transition">Mentions Légales</Link>
          <Link to="/login" className="hover:text-amber-400 transition">Connexion Studio</Link>
          <Link to="/register" className="hover:text-amber-400 transition">Créer un compte</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

