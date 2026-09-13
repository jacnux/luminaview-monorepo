import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBlogSlug } from '../../utils/getBlogSlug';
import { API_PREFIX } from '../../utils/blogApi';

const extractFirstImage = (content?: string, coverImage?: string): string | null => {
  if (coverImage) {
    let url = coverImage.replace(/https?:\/\/(www\.)?jac-photo\.fr(\/uploads)/g, '$2');
    if (url.includes('#')) url = url.split('#')[0];
    return url;
  }
  if (!content) return null;
  const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (mdMatch) {
    let url = mdMatch[1];
    if (url.includes('#')) url = url.split('#')[0];
    return url.replace(/https?:\/\/(www\.)?jac-photo\.fr(\/uploads)/g, '$2');
  }
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch) {
    let url = htmlMatch[1];
    if (url.includes('#')) url = url.split('#')[0];
    return url.replace(/https?:\/\/(www\.)?jac-photo\.fr(\/uploads)/g, '$2');
  }
  return null;
};

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);
  const s = location.search;

  useEffect(() => {
    fetch(`${API_PREFIX}/posts?blog=${blogSlug}`)
      .then(res => res.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [blogSlug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
        <div className="mb-12 rounded-2xl bg-gray-200 dark:bg-slate-800/80 h-[360px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="rounded-xl bg-gray-200 dark:bg-slate-800/80 h-72 w-full" />
          <div className="rounded-xl bg-gray-200 dark:bg-slate-800/80 h-72 w-full" />
          <div className="rounded-xl bg-gray-200 dark:bg-slate-800/80 h-72 w-full" />
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-500 dark:text-gray-400">Aucun article publié pour le moment.</p>
      </div>
    );
  }

  const [latest, ...others] = posts;
  const latestImg = extractFirstImage(latest.content, latest.coverImage);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Article mis en avant (Featured) */}
      <Link to={`/post/${latest.slug}${s}`} className="group block mb-12 transition-all duration-300">
        <article className="bg-white dark:bg-slate-900/60 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row min-h-[360px]">
          {latestImg && (
            <div className="md:w-1/2 overflow-hidden relative min-h-[280px] bg-slate-950/5 dark:bg-slate-950/40 flex items-center justify-center p-3 border-b md:border-b-0 md:border-r border-black/[0.04] dark:border-white/[0.04]">
              {/* Arrière-plan flouté pour habiller le fond sans tronquer l'image principale */}
              <div 
                className="absolute inset-0 bg-cover bg-center blur-xl opacity-20 dark:opacity-30 scale-110"
                style={{ backgroundImage: `url(${latestImg})` }}
              />
              <img
                src={latestImg}
                alt={latest.title}
                className="relative max-h-[320px] w-auto max-w-full object-contain rounded-lg shadow-sm transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
            </div>
          )}
          <div className={`md:w-1/2 p-8 md:p-12 flex flex-col justify-center ${!latestImg ? 'md:w-full' : ''}`}>
            <span className="text-xs font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-3">Article Récent</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-950 dark:text-white mb-4 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
              {latest.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base line-clamp-3 mb-6 font-light">
              {latest.content.replace(/[#*`!\[\]()]/g, '').substring(0, 220)}...
            </p>
            <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
              <span>{new Date(latest.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </article>
      </Link>

      {/* Titre de section si d'autres articles existent */}
      {others.length > 0 && (
        <div className="mb-8 border-b border-black/[0.06] dark:border-white/[0.06] pb-4">
          <h2 className="text-lg font-bold tracking-wider uppercase text-gray-900 dark:text-white">Publications Précédentes</h2>
        </div>
      )}

      {/* Grille des autres articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {others.map(post => {
          const img = extractFirstImage(post.content, post.coverImage);
          return (
            <Link to={`/post/${post.slug}${s}`} key={post._id} className="group block h-full">
              <article className="bg-white dark:bg-slate-900/60 border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                {img ? (
                  <div className="h-52 overflow-hidden relative bg-slate-950/5 dark:bg-slate-950/40 flex items-center justify-center p-2.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                    {/* Fond flouté pour un rendu harmonieux sans recadrage */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-lg opacity-20 dark:opacity-25 scale-110"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                    <img 
                      src={img} 
                      alt="" 
                      className="relative max-h-full w-auto max-w-full object-contain rounded shadow-sm transition-transform duration-500 ease-out group-hover:scale-[1.03]" 
                    />
                  </div>
                ) : (
                  <div className="h-52 bg-gradient-to-br from-amber-500/5 to-amber-600/5 dark:from-amber-950/10 dark:to-amber-950/5 flex items-center justify-center border-b border-black/[0.04] dark:border-white/[0.04]">
                    <span className="text-amber-600 dark:text-amber-500/70 text-xs font-semibold uppercase tracking-wider">Hélioscope</span>
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mt-2 mb-3 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm line-clamp-3 mb-4 font-light">
                      {post.content.replace(/[#*`!\[\]()]/g, '').substring(0, 120)}...
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PostList;
