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

const getCleanExcerpt = (post: any, maxLength: number): string => {
  const text = post?.excerpt?.trim() || post?.content || '';
  if (!text) return '';

  const cleaned = text
    // Supprimer les images Markdown ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Supprimer les balises HTML (ex: <img>, <br>, <div>, etc.)
    .replace(/<[^>]+>/g, ' ')
    // Remplacer les liens Markdown [texte](url) par leur texte
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Supprimer les blocs de code Markdown
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
    // Supprimer la mise en forme Markdown (titres, gras, italique, citations)
    .replace(/[#*_~>`=+\-]/g, ' ')
    // Remplacer les espaces multiples et sauts de ligne par un espace unique
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + '...';
};

const getReadingTime = (content?: string): number => {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);
  const s = location.search;

  useEffect(() => {
    fetch(`${API_PREFIX}/posts?blog=${blogSlug}`)
      .then(res => res.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [blogSlug]);

  // Extraction des tags disponibles à travers les articles
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t: string) => {
          if (t && t.trim()) tagSet.add(t.trim().toLowerCase());
        });
      }
      // Extraction des hashtags éventuels dans le contenu
      const hashMatches = (p.content || '').match(/#([a-zA-Z0-9À-ÿ_-]+)/g);
      if (hashMatches) {
        hashMatches.forEach((h: string) => tagSet.add(h.replace('#', '').toLowerCase()));
      }
    });
    return Array.from(tagSet).slice(0, 10);
  }, [posts]);

  // Filtrage combiné recherche & tag
  const filteredPosts = React.useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchTerm.trim() || 
        (post.title || '').toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (post.content || '').toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesTag = !selectedTag || 
        (Array.isArray(post.tags) && post.tags.map((t: string) => t.toLowerCase()).includes(selectedTag.toLowerCase())) ||
        (post.content || '').toLowerCase().includes(`#${selectedTag.toLowerCase()}`);

      return matchesSearch && matchesTag;
    });
  }, [posts, searchTerm, selectedTag]);

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

  const isFiltering = Boolean(searchTerm.trim() || selectedTag);
  const [latest, ...others] = filteredPosts;
  const latestImg = latest ? extractFirstImage(latest.content, latest.coverImage) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Barre de Recherche et Filtres Tags */}
      <div className="mb-8 sm:mb-10 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un récit, une série, un lieu..."
              className="w-full bg-white dark:bg-slate-900/80 text-gray-900 dark:text-white text-sm rounded-full pl-10 pr-10 py-2.5 border border-black/[0.08] dark:border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition placeholder-gray-400 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                type="button"
                aria-label="Effacer la recherche"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 self-end sm:self-auto font-medium">
            <strong>{filteredPosts.length}</strong> article{filteredPosts.length > 1 ? 's' : ''} {isFiltering ? 'trouvé(s)' : 'au total'}
          </div>
        </div>

        {/* Pilules de Tags */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedTag === null
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
              }`}
            >
              Tous
            </button>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* État vide si aucun article ne correspond aux filtres */}
      {filteredPosts.length === 0 ? (
        <div className="my-16 max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-black/[0.06] dark:border-white/[0.06] text-center shadow-lg">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-2">
            Aucun article trouvé
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-light">
            Aucune publication ne correspond à vos critères de recherche.
          </p>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setSelectedTag(null); }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold transition shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          {/* Article mis en avant (Featured) si pas de filtre ou premier résultat */}
          {latest && (
            <Link to={`/post/${latest.slug}${s}`} className="group block mb-12 transition-all duration-300">
              <article className="bg-white dark:bg-slate-900/60 border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row min-h-[360px]">
                {latestImg && (
                  <div className="md:w-1/2 overflow-hidden relative min-h-[280px] bg-slate-950/5 dark:bg-slate-950/40 flex items-center justify-center p-3 border-b md:border-b-0 md:border-r border-black/[0.04] dark:border-white/[0.04]">
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
                <div className={`md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center ${!latestImg ? 'md:w-full' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                      {isFiltering ? 'Résultat' : 'Article Récent'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                      ⏱️ {getReadingTime(latest.content)} min
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-950 dark:text-white mb-3 sm:mb-4 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
                    {latest.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base line-clamp-3 mb-6 font-light">
                    {getCleanExcerpt(latest, 220)}
                  </p>
                  <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                    <span>{new Date(latest.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Titre de section si d'autres articles existent */}
          {others.length > 0 && (
            <div className="mb-6 sm:mb-8 border-b border-black/[0.06] dark:border-white/[0.06] pb-3 flex justify-between items-center">
              <h2 className="text-sm sm:text-base font-bold tracking-wider uppercase text-gray-900 dark:text-white">
                {isFiltering ? 'Autres correspondances' : 'Publications Précédentes'}
              </h2>
            </div>
          )}

          {/* Grille des autres articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {others.map(post => {
              const img = extractFirstImage(post.content, post.coverImage);
              const readTime = getReadingTime(post.content);
              return (
                <Link to={`/post/${post.slug}${s}`} key={post._id} className="group block h-full">
                  <article className="bg-white dark:bg-slate-900/60 border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    {img ? (
                      <div className="h-48 sm:h-52 overflow-hidden relative bg-slate-950/5 dark:bg-slate-950/40 flex items-center justify-center p-2.5 border-b border-black/[0.04] dark:border-white/[0.04]">
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
                      <div className="h-48 sm:h-52 bg-gradient-to-br from-amber-500/5 to-amber-600/5 dark:from-amber-950/10 dark:to-amber-950/5 flex items-center justify-center border-b border-black/[0.04] dark:border-white/[0.04]">
                        <span className="text-amber-600 dark:text-amber-500/70 text-xs font-semibold uppercase tracking-wider">Hélioscope</span>
                      </div>
                    )}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                            {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            ⏱️ {readTime} min
                          </span>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm line-clamp-3 mb-4 font-light">
                          {getCleanExcerpt(post, 140)}
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PostList;
