import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = 'dark';

  // Zone connectée large (albums, galeries, carnet-routes, etc.)
  const isAuthenticatedArea = [
    '/dashboard',
    '/dashboard/carnet-routes',
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
    return (
      <div
        className={`relative min-h-screen w-full overflow-hidden ${
          theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        <main className="w-full relative z-10">{children}</main>
      </div>
    );
  }

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

      {/* Contenu */}
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
              to="/"
              className="flex items-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
            >
              <img
                src="/logo.svg"
                alt="Chambre Noire"
                className="h-8 w-auto drop-shadow-[0_2px_8px_rgba(232,176,75,0.25)]"
              />
              <span className="text-xl sm:text-2xl font-extrabold text-yellow-500 tracking-wide drop-shadow-[0_2px_8px_rgba(234,179,8,0.15)]">
                Chambre Noire
              </span>
            </Link>
          </div>

        </div>

        {/* Contenu page */}
        <main className="relative flex-1">{children}</main>

        {/* FOOTER */}
        <footer className="relative z-10 py-6 text-center text-muted text-sm border-t border-line bg-surface-2">
          <img
            src="/brand-logo.svg"
            alt="Chambre Noire"
            className="h-14 w-auto mx-auto mb-3 drop-shadow-[0_2px_10px_rgba(232,176,75,0.25)]"
          />
          <p>© 2026 Chambre Noire. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
