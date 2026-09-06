import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useComments } from '../context/CommentsContext';
import { getAppUrl, getVitrineUrl } from '../utils/urls';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useComments();

  const isCommentsRoute = location.pathname === '/comments';

  // Zone connectée large (albums, galeries, pages, blog, etc.)
  const isAuthenticatedArea = [
    '/dashboard',
    '/galleries',
    '/comments',
    '/manage-blog',
    '/dashboard/pages',
    '/dashboard/about',
    '/dashboard/help',
    '/edit-profile',
    '/tools',
  ].some(
    path =>
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
  );

  const showBackgroundImage = theme === 'dark' && isAuthenticatedArea;

  const isEmbedRoute = location.pathname.startsWith('/embed/');
  const searchParams = new URLSearchParams(location.search);
  const isViewer = searchParams.get('mode') === 'viewer';

  if (isEmbedRoute || isViewer) {
    return <>{children}</>;
  }

  const isPortfolioTheme = user?.blogTheme === 'portfolio';

  return (
    <div
      className={`relative min-h-screen w-full overflow-x-hidden ${
        theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      {/* Fond global partie connectée */}
      {showBackgroundImage && (
        <>
          <div
            className="fixed inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/uploads/monfond_1.jpg')" }}
          />
          <div className="fixed inset-0 z-0 bg-black/60" />
        </>
      )}

      {!showBackgroundImage && (
        <div
          className={`fixed inset-0 z-0 ${
            theme === 'dark' ? 'bg-gray-950' : 'bg-gray-100'
          }`}
        />
      )}

      {/* Rendu conditionnel selon le thème utilisateur (Classic ou Artfolio) */}
      {isPortfolioTheme && user ? (
        // --- THEME ARTFOLIO (SIDEBAR FIXE SOMBRE) ---
        <div className="relative z-10 min-h-screen flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside
            className={`w-full md:w-64 md:fixed md:inset-y-0 md:left-0 md:z-20 border-b md:border-b-0 md:border-r p-6 flex flex-col justify-between backdrop-blur-md shadow-2xl transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-950/80 border-white/[0.06] shadow-black/40'
                : 'bg-white/90 border-gray-200/50 shadow-gray-200/20'
            }`}
          >
            <div className="space-y-8">
              {/* Logo / Espace */}
              <div className="flex flex-col">
                <Link
                  to="/dashboard"
                  className="text-2xl font-extrabold text-yellow-500 tracking-wide hover:text-yellow-400 hover:scale-[1.01] transition-all duration-200"
                >
                  Lumina Studio
                </Link>
                {user && (
                  <span
                    className={`text-xs mt-1 tracking-wider ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Espace de :{' '}
                    <span className="font-semibold text-yellow-600">
                      {user?.name}
                    </span>
                  </span>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                    location.pathname === '/dashboard'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                  }`}
                >
                  <span>📁</span> Albums
                </Link>

                <Link
                  to="/galleries"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                    location.pathname === '/galleries'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                  }`}
                >
                  <span>🗂️</span> Galeries
                </Link>

                <Link
                  to="/dashboard/pages"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                    location.pathname.startsWith('/dashboard/pages')
                      ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/25'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                  }`}
                >
                  <span>📄</span> Pages
                </Link>

                {user?.hasBlog && (
                  <Link
                    to="/manage-blog"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                      location.pathname === '/manage-blog'
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
                        : theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                    }`}
                  >
                    <span>📝</span> Blog
                  </Link>
                )}

                {user?.hasCarnet && (
                  <Link
                    to="/dashboard/carnet-routes"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                      location.pathname.startsWith('/dashboard/carnet-routes')
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                        : theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                    }`}
                  >
                    <span>🎞️</span> Chambre Noire
                  </Link>
                )}
              </nav>

              <hr className={theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-200'} />

              {/* Liens externes / Actions */}
              <div className="flex flex-col gap-2">
                <Link
                  to="/comments"
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                    isCommentsRoute
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>💬</span> Commentaires
                  </div>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <a
                  href={getVitrineUrl(user)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                    theme === 'dark'
                      ? 'text-amber-400 hover:text-amber-300 hover:bg-white/[0.04]'
                      : 'text-amber-600 hover:text-amber-700 hover:bg-black/[0.04]'
                  }`}
                >
                  <span>🌍</span> Voir ma vitrine
                </a>
                {user?.hasBlog && (
                  <a
                    href={getAppUrl('blog', user.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                      theme === 'dark'
                        ? 'text-indigo-400 hover:text-indigo-300 hover:bg-white/[0.04]'
                        : 'text-indigo-600 hover:text-indigo-700 hover:bg-black/[0.04]'
                    }`}
                  >
                    <span>✍️</span> Voir mon blog
                  </a>
                )}
                {user?.hasCarnet && (
                  <a
                    href={getAppUrl('carnet', user.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                      theme === 'dark'
                        ? 'text-teal-400 hover:text-teal-300 hover:bg-white/[0.04]'
                        : 'text-teal-600 hover:text-teal-700 hover:bg-black/[0.04]'
                    }`}
                  >
                    <span>🎞️</span> Voir ma Chambre Noire
                  </a>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4">
              <Link
                to="/create-album"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                + Créer
              </Link>

              <div
                className={`flex items-center justify-around gap-1 rounded-2xl p-1 border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border-white/[0.06]'
                    : 'bg-gray-100 border-gray-200'
                }`}
              >
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin/users')}
                    className={`p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                      theme === 'dark'
                        ? 'hover:bg-white/[0.06] text-gray-300 hover:text-white'
                        : 'hover:bg-black/[0.06] text-gray-600 hover:text-black'
                    }`}
                    title="Utilisateurs"
                  >
                    🛡️
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className="p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    title="Signalements"
                  >
                    🚩
                  </button>
                )}
                <button
                  onClick={() => navigate('/tools')}
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                    theme === 'dark'
                      ? 'hover:bg-white/[0.06] text-gray-300 hover:text-white'
                      : 'hover:bg-black/[0.06] text-gray-600 hover:text-black'
                  }`}
                  title="Outils"
                >
                  🛠️
                </button>
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition text-lg ${
                    theme === 'dark' ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.06]'
                  }`}
                  title="Changer le thème"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <Link
                  to="/dashboard/about"
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                    theme === 'dark'
                      ? 'hover:bg-white/[0.06] text-gray-300 hover:text-white'
                      : 'hover:bg-black/[0.06] text-gray-600 hover:text-black'
                  }`}
                  title="À propos"
                >
                  ℹ️
                </Link>
                <Link
                  to="/dashboard/help"
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                    theme === 'dark'
                      ? 'hover:bg-white/[0.06] text-gray-300 hover:text-white'
                      : 'hover:bg-black/[0.06] text-gray-600 hover:text-black'
                  }`}
                  title="Aide"
                >
                  ❓
                </Link>
                <button
                  onClick={() => navigate('/edit-profile')}
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                    theme === 'dark'
                      ? 'hover:bg-white/[0.06] text-gray-300 hover:text-white'
                      : 'hover:bg-black/[0.06] text-gray-600 hover:text-black'
                  }`}
                  title="Profil"
                >
                  👤
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Sortir"
                >
                  ⏻
                </button>
              </div>
            </div>
          </aside>

          {/* Main content wrapper */}
          <div className="flex-1 md:ml-64 min-h-screen flex flex-col relative z-10">
            <main className="relative flex-1 p-6 sm:p-8">{children}</main>
          </div>
        </div>
      ) : (
        // --- THEME CLASSIC (NAVBAR HORIZONTALE COMPACTE) ---
        <div className="relative z-10 min-h-screen pb-16 flex flex-col">
          {/* Header compact h-14 */}
          <header
            className={`sticky top-0 z-30 h-14 border-b px-3 sm:px-4 backdrop-blur-md flex items-center justify-between gap-2 shadow-sm transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-950/85 border-white/[0.08] shadow-black/20'
                : 'bg-white/90 border-gray-200/70 shadow-gray-200/10'
            }`}
          >
            {/* Logo / Espace */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to="/dashboard"
                className="text-base sm:text-lg font-extrabold text-yellow-500 tracking-tight hover:text-yellow-400 transition"
              >
                Lumina Studio
              </Link>
              {user && (
                <span className="hidden md:inline-block text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 font-semibold border border-yellow-500/20">
                  {user.name}
                </span>
              )}
            </div>

            {user ? (
              <>
                {/* Navigation centrale */}
                <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <div
                    className={`flex items-center gap-0.5 p-0.5 rounded-xl border transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-black/40 border-white/[0.08]'
                        : 'bg-gray-100/90 border-gray-200'
                    }`}
                  >
                    <Link
                      to="/dashboard"
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        location.pathname === '/dashboard'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-white/5'
                          : 'text-gray-700 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      📁 Albums
                    </Link>

                    <Link
                      to="/galleries"
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        location.pathname === '/galleries'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-white/5'
                          : 'text-gray-700 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      🗂️ Galeries
                    </Link>

                    <Link
                      to="/dashboard/pages"
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        location.pathname.startsWith('/dashboard/pages')
                          ? 'bg-yellow-500 text-black shadow-sm'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-white/5'
                          : 'text-gray-700 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      📄 Pages
                    </Link>

                    {user?.hasBlog && (
                      <Link
                        to="/manage-blog"
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          location.pathname === '/manage-blog'
                            ? 'bg-orange-600 text-white shadow-sm'
                            : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-white/5'
                            : 'text-gray-700 hover:text-black hover:bg-black/5'
                        }`}
                      >
                        📝 Blog
                      </Link>
                    )}

                    {user?.hasCarnet && (
                      <Link
                        to="/dashboard/carnet-routes"
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          location.pathname.startsWith('/dashboard/carnet-routes')
                            ? 'bg-amber-600 text-white shadow-sm'
                            : theme === 'dark'
                            ? 'text-gray-300 hover:text-white hover:bg-white/5'
                            : 'text-gray-700 hover:text-black hover:bg-black/5'
                        }`}
                      >
                        🎞️ Chambre Noire
                      </Link>
                    )}
                  </div>

                  <Link
                    to="/comments"
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      isCommentsRoute
                        ? 'bg-blue-600 text-white'
                        : theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-white/5'
                        : 'text-gray-700 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    <span>💬</span>
                    <span className="hidden xl:inline">Commentaires</span>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[1.1rem] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </nav>

                {/* Actions et Outils à droite */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {/* Liens externes compacts */}
                  <div className="hidden lg:flex items-center gap-1 text-xs">
                    <a
                      href={getVitrineUrl(user)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-2 py-1 rounded-lg font-medium transition ${
                        theme === 'dark'
                          ? 'text-amber-400 hover:bg-white/5'
                          : 'text-amber-600 hover:bg-black/5'
                      }`}
                      title="Voir ma vitrine"
                    >
                      🌍 Vitrine
                    </a>
                    {user?.hasBlog && (
                      <a
                        href={getAppUrl('blog', user.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-2 py-1 rounded-lg font-medium transition ${
                          theme === 'dark'
                            ? 'text-indigo-400 hover:bg-white/5'
                            : 'text-indigo-600 hover:bg-black/5'
                        }`}
                        title="Voir mon blog"
                      >
                        ✍️ Blog
                      </a>
                    )}
                    {user?.hasCarnet && (
                      <a
                        href={getAppUrl('carnet', user.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-2 py-1 rounded-lg font-medium transition ${
                          theme === 'dark'
                            ? 'text-teal-400 hover:bg-white/5'
                            : 'text-teal-600 hover:bg-black/5'
                        }`}
                        title="Voir ma Chambre Noire"
                      >
                        🎞️ Carnet
                      </a>
                    )}
                  </div>

                  {/* Bouton créer compact */}
                  <Link
                    to="/create-album"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    + Créer
                  </Link>

                  {/* Actions utilitaires compactes */}
                  <div
                    className={`flex items-center gap-0.5 rounded-lg p-0.5 border ${
                      theme === 'dark'
                        ? 'bg-black/40 border-white/[0.08]'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    {isAdmin && (
                      <button
                        onClick={() => navigate('/admin/users')}
                        className="p-1 rounded hover:bg-white/10 text-xs"
                        title="Admin Users"
                      >
                        🛡️
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => navigate('/admin/reports')}
                        className="p-1 rounded hover:bg-red-500/10 text-xs text-red-400"
                        title="Signalements"
                      >
                        🚩
                      </button>
                    )}

                    <button
                      onClick={() => navigate('/tools')}
                      className="p-1 rounded hover:bg-white/10 text-xs"
                      title="Outils"
                    >
                      🛠️
                    </button>

                    <button
                      onClick={toggleTheme}
                      className="p-1 rounded hover:bg-white/10 text-xs"
                      title="Changer le thème"
                    >
                      {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <Link
                      to="/dashboard/about"
                      className="p-1 rounded hover:bg-white/10 text-xs"
                      title="À propos"
                    >
                      ℹ️
                    </Link>
                    <Link
                      to="/dashboard/help"
                      className="p-1 rounded hover:bg-white/10 text-xs"
                      title="Aide"
                    >
                      ❓
                    </Link>

                    <button
                      onClick={() => navigate('/edit-profile')}
                      className="p-1 rounded hover:bg-white/10 text-xs"
                      title="Profil"
                    >
                      👤
                    </button>
                    <button
                      onClick={logout}
                      className="p-1 rounded hover:bg-red-500/10 text-xs text-red-400"
                      title="Sortir"
                    >
                      ⏻
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-3 py-1 text-xs rounded-lg ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  Connexion
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-1 rounded text-sm"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </div>
            )}
          </header>

          {/* Contenu page */}
          <main className="relative flex-1">{children}</main>
        </div>
      )}
    </div>
  );
};

export default Layout;
