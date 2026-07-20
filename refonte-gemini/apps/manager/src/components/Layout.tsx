import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useComments } from '../context/CommentsContext';
import { getAppUrl } from '../utils/urls';

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

  if (isEmbedRoute) {
    return <>{children}</>;
  }

  const isPortfolioTheme = user?.blogTheme === 'portfolio';

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden ${
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
                  <span>📓</span> Carnets
                </Link>
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
                  href={getAppUrl('portfolio', user.name, { edit: true })}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:translate-x-1 ${
                    theme === 'dark'
                      ? 'text-amber-400 hover:text-amber-300 hover:bg-white/[0.04]'
                      : 'text-amber-600 hover:text-amber-700 hover:bg-black/[0.04]'
                  }`}
                >
                  <span>🌍</span> Voir ma vitrine
                </a>
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
        // --- THEME CLASSIC (NAVBAR HORIZONTALE) ---
        <div className="relative z-10 min-h-screen pb-20 flex flex-col">
          {/* Header sticky */}
          <div
            className={`sticky top-0 z-20 border-b p-3 sm:p-4 backdrop-blur-md flex justify-between items-center gap-2 shadow-xl transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-950/70 border-white/[0.06] shadow-black/20'
                : 'bg-white/85 border-gray-200/50 shadow-gray-200/10'
            }`}
          >
            <div className="flex-shrink-0 flex flex-col justify-center">
              <Link
                to="/dashboard"
                className="text-xl sm:text-2xl font-extrabold text-yellow-500 tracking-wide hover:text-yellow-400 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 drop-shadow-[0_2px_8px_rgba(234,179,8,0.15)]"
              >
                Lumina Studio
              </Link>
              {user && (
                <span
                  className={`text-[10px] sm:text-xs ml-1 mt-0.5 tracking-wider ${
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

            <div className="flex items-center gap-1 sm:gap-3">
              {user ? (
                <>
                  {/* Tabs principaux */}
                  <div
                    className={`flex gap-1 p-1 rounded-full border transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-white/[0.06]'
                        : 'bg-gray-100/80 border-gray-200'
                    }`}
                  >
                    <Link
                      to="/dashboard"
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        location.pathname === '/dashboard'
                          ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                          : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                      }`}
                    >
                      📁 Albums
                    </Link>

                    <Link
                      to="/galleries"
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        location.pathname === '/galleries'
                          ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                          : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                      }`}
                    >
                      🗂️ Galeries
                    </Link>

                    <Link
                      to="/manage-blog"
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1 ${
                        location.pathname === '/manage-blog'
                          ? 'bg-orange-600 text-white shadow-[0_4px_12px_rgba(234,88,12,0.3)]'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                          : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                      }`}
                    >
                      <span>📝</span> Blog
                    </Link>

                    <Link
                      to="/dashboard/pages"
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1 ${
                        location.pathname.startsWith('/dashboard/pages')
                          ? 'bg-yellow-500 text-black shadow-[0_4px_12px_rgba(234,179,8,0.25)]'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                          : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                      }`}
                    >
                      <span>📄</span> Pages
                    </Link>

                    <Link
                      to="/dashboard/carnet-routes"
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        location.pathname.startsWith('/dashboard/carnet-routes')
                          ? 'bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.3)]'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                          : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                      }`}
                    >
                      <span>📓</span> Carnets
                    </Link>
                  </div>

                  <Link
                    to="/comments"
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 ${
                      isCommentsRoute
                        ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                        : theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        : 'text-gray-600 hover:text-black hover:bg-black/[0.04]'
                    }`}
                  >
                    <span>💬</span>
                    <span>Commentaires</span>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  <a
                    href={getAppUrl('portfolio', user.name, { edit: true })}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1 ${
                      theme === 'dark'
                        ? 'text-amber-400 hover:text-amber-300 hover:bg-white/[0.04]'
                        : 'text-amber-600 hover:text-amber-700 hover:bg-black/[0.04]'
                    }`}
                  >
                    <span>🌍</span> Voir ma vitrine
                  </a>

                  {/* Bouton créer */}
                  <Link
                    to="/create-album"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shadow-md shadow-green-950/20 hover:shadow-green-900/30 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    + Créer
                  </Link>

                  {/* Actions à droite */}
                  <div
                    className={`flex items-center gap-1 rounded-full p-1 border transition-all duration-300 ${
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
                        title="Admin Users"
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
                      className={`p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 text-lg ${
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
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`px-4 py-2 text-sm ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Connexion
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full transition text-xl ${
                      theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                    }`}
                  >
                    {theme === 'light' ? '🌙' : '☀️'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Contenu page */}
          <main className="relative flex-1">{children}</main>
        </div>
      )}
    </div>
  );
};

export default Layout;
