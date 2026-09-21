import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { API_PREFIX } from '../../utils/blogApi';
import { getBlogSlug } from '../../utils/getBlogSlug';

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);
  const s = location.search;

  const [post, setPost] = useState<any>(null);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      fetch(`${API_PREFIX}/posts/${slug}`).then(r => r.ok ? r.json() : null),
      fetch(`${API_PREFIX}/posts?blog=${blogSlug}`).then(r => r.ok ? r.json() : [])
    ])
      .then(([postData, postsList]) => {
        if (postData && !postData.error) {
          setPost(postData);
        } else {
          setPost(null);
        }
        if (Array.isArray(postsList)) {
          setAllPosts(postsList);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPost(null);
        setLoading(false);
      });
  }, [slug, blogSlug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Chargement de l'article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-red-500 dark:text-red-400 mb-4">Cet article n'existe pas ou a été supprimé.</p>
        <Link to={`/${s}`} className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
          &larr; Retour aux articles
        </Link>
      </div>
    );
  }

  // Calcul du temps de lecture estimé (200 mots par minute)
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  // Trouver les articles précédent et suivant
  const currentIndex = allPosts.findIndex(p => p.slug === slug || p._id === post._id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Barre supérieure : Retour & Partage */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link 
          to={`/${s}`} 
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition duration-200"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span> Retour aux articles
        </Link>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-gray-700 dark:text-gray-200 border border-black/[0.06] dark:border-white/[0.06] transition active:scale-95 shadow-sm"
          title="Copier le lien direct de l'article"
        >
          <span>{copied ? '✓' : '🔗'}</span>
          <span>{copied ? 'Lien copié !' : 'Partager'}</span>
        </button>
      </div>
      
      {/* Contenu principal de l'article */}
      <article className="bg-white dark:bg-slate-900/40 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm">
        <header className="border-b border-black/[0.06] dark:border-white/[0.06] pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            <time dateTime={post.createdAt}>
              📅 {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              ⏱️ {readingTime} min de lecture
            </span>
          </div>
        </header>
        
        <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed sm:text-lg">
          <MarkdownRenderer className="prose">
            {post.content ? post.content.replace(/https?:\/\/(www\.)?jac-photo\.fr(\/uploads)/g, '$2') : ''}
          </MarkdownRenderer>
        </div>

        {/* Pied d'article : Bouton de partage */}
        <div className="mt-12 pt-6 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-light">
            Publié dans le journal de <strong>{(blogSlug || 'jac').toUpperCase()}</strong>
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition active:scale-95"
          >
            <span>{copied ? '✓' : '🔗'}</span>
            <span>{copied ? 'Lien de l\'article copié !' : 'Partager cet article'}</span>
          </button>
        </div>
      </article>

      {/* Navigation Article Suivant / Article Précédent */}
      {(prevPost || nextPost) && (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <Link
              to={`/post/${prevPost.slug}${s}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-black/[0.06] dark:border-white/[0.06] hover:border-amber-500/40 hover:-translate-y-0.5 transition-all shadow-sm group flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                  &larr; Article Plus Récent
                </span>
                <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {prevPost.title}
                </h4>
              </div>
              <span className="text-[11px] text-gray-400 mt-3 block">
                {new Date(prevPost.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextPost && (
            <Link
              to={`/post/${nextPost.slug}${s}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-black/[0.06] dark:border-white/[0.06] hover:border-amber-500/40 hover:-translate-y-0.5 transition-all shadow-sm group flex flex-col justify-between sm:text-right"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                  Article Précédent &rarr;
                </span>
                <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {nextPost.title}
                </h4>
              </div>
              <span className="text-[11px] text-gray-400 mt-3 block">
                {new Date(nextPost.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Bouton Flottant Retour en Haut */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center border border-white/20"
          aria-label="Retour en haut"
          title="Retour en haut de page"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default PostDetail;
