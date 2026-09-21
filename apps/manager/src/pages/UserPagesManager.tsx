// ===========================================
// luminaview
//         UserPagesManager
//
//     Mai 2026 v2.5.0
// ===========================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { getPageUrl } from '../utils/urls';

type PageSortMode = 'az' | 'za' | null;

type MenuGroup = 'none' | 'series' | 'exhibitions' | 'blog' | 'about';

const MENU_GROUP_LABELS: Record<MenuGroup, string> = {
  none: 'Aucune',
  series: 'Séries',
  exhibitions: 'Expositions',
  blog: 'Blog',
  about: 'À propos',
};

const UserPagesManager = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSortAZ, setPageSortAZ] = useState<PageSortMode>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageToDelete, setPageToDelete] = useState<{ id: string; title: string } | null>(null);
  const { theme } = useTheme();
  const { showToast } = useToast();

  const userStorage = localStorage.getItem('user');
  const userObject = userStorage ? JSON.parse(userStorage) : null;
  const username = userObject?.name || 'inconnu';

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await api.get('/user-pages/my/list');
      setPages(res.data);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du chargement des pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;
    try {
      await api.delete(`/user-pages/my/${pageToDelete.id}`);
      setPages(prev => prev.filter(p => p._id !== pageToDelete.id));
      showToast(`Page "${pageToDelete.title}" supprimée.`, 'success');
    } catch (err) {
      showToast('Erreur lors de la suppression de la page', 'error');
    } finally {
      setPageToDelete(null);
    }
  };

  const copyLink = (slug: string) => {
    const url = getPageUrl(username, slug);
    navigator.clipboard.writeText(url).then(() => {
      showToast('Lien de la page copié dans le presse-papier !', 'success');
    });
  };

  const getParentInfo = (page: any) => {
    if (!page.parentPageId) return null;
    if (typeof page.parentPageId === 'object' && page.parentPageId.title) {
      return { id: String(page.parentPageId._id), title: page.parentPageId.title };
    }
    const pid = typeof page.parentPageId === 'object' ? page.parentPageId._id : page.parentPageId;
    const parent = pages.find((p: any) => String(p._id) === String(pid));
    if (parent) return { id: String(parent._id), title: (parent as any).title };
    return null;
  };

  const filteredAndSortedPages = useMemo(() => {
    let result = pages;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(page =>
        (page.title || '').toLowerCase().includes(term)
      );
      return result.map(p => {
        const parent = getParentInfo(p);
        return { ...p, level: parent ? 1 : 0, isChild: Boolean(parent), parentTitle: parent?.title };
      });
    }

    if (pageSortAZ) {
      const copy = [...result];
      const sorted = pageSortAZ === 'az'
        ? copy.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'fr', { sensitivity: 'base' }))
        : copy.sort((a, b) => (b.title || '').localeCompare(a.title || '', 'fr', { sensitivity: 'base' }));
      return sorted.map(p => {
        const parent = getParentInfo(p);
        return { ...p, level: parent ? 1 : 0, isChild: Boolean(parent), parentTitle: parent?.title };
      });
    }

    // Arborescence récursive multi-niveaux complète (roots -> enfants -> sous-enfants)
    const pageMap = new Map<string, any>();
    result.forEach(p => pageMap.set(String(p._id), p));

    const childrenMap = new Map<string, any[]>();
    const roots: any[] = [];

    result.forEach(p => {
      const parentInfo = getParentInfo(p);
      if (parentInfo && pageMap.has(parentInfo.id)) {
        if (!childrenMap.has(parentInfo.id)) {
          childrenMap.set(parentInfo.id, []);
        }
        childrenMap.get(parentInfo.id)!.push(p);
      } else {
        roots.push(p);
      }
    });

    const sortByOrder = (a: any, b: any) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0);
    roots.sort(sortByOrder);
    childrenMap.forEach(list => list.sort(sortByOrder));

    const hierarchicalList: any[] = [];
    const visited = new Set<string>();

    const traverse = (page: any, depth: number, parentTitle?: string) => {
      visited.add(String(page._id));
      hierarchicalList.push({
        ...page,
        level: depth,
        isChild: depth > 0,
        parentTitle: parentTitle || getParentInfo(page)?.title
      });

      const children = childrenMap.get(String(page._id)) || [];
      children.forEach(child => traverse(child, depth + 1, page.title));
    };

    roots.forEach(root => traverse(root, 0));

    // Inclure d'éventuelles pages orphelines
    result.forEach(p => {
      if (!visited.has(String(p._id))) {
        const parentInfo = getParentInfo(p);
        hierarchicalList.push({
          ...p,
          level: parentInfo ? 1 : 0,
          isChild: Boolean(parentInfo),
          parentTitle: parentInfo?.title
        });
      }
    });

    return hierarchicalList;
  }, [pages, searchTerm, pageSortAZ]);

  const shellTextClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const emptyTextClass = 'text-gray-500';
  const cardClass = theme === 'dark'
    ? 'bg-gray-800/70 border border-gray-700 backdrop-blur-xl'
    : 'bg-white/90 border border-gray-200 backdrop-blur-xl shadow-sm';
  const shareButtonClass = theme === 'dark'
    ? 'bg-gray-700 hover:bg-gray-600 text-white'
    : 'bg-gray-200 hover:bg-gray-300 text-gray-900';
  const sortButtonClass = pageSortAZ
    ? 'bg-green-600 hover:bg-green-500 text-white'
    : theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700';

  const neutralBadgeClass = theme === 'dark'
    ? 'bg-gray-700 text-gray-300'
    : 'bg-gray-200 text-gray-700';

  const getMenuGroupLabel = (group?: string) => {
    const key = (group || 'none') as MenuGroup;
    return MENU_GROUP_LABELS[key] || 'Aucune';
  };

  if (loading) {
    return <div className={`p-8 ${shellTextClass}`}>Chargement...</div>;
  }

  const rootPagesCount = useMemo(() => pages.filter(p => !getParentInfo(p)).length, [pages]);
  const subPagesCount = useMemo(() => pages.filter(p => getParentInfo(p)).length, [pages]);

  return (
    <div className={`w-full ${shellTextClass}`}>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-extrabold tracking-tight text-yellow-500">Mes Pages</h1>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                Arborescence : {rootPagesCount} principale{rootPagesCount > 1 ? 's' : ''} · {subPagesCount} sous-page{subPagesCount > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Structure de vos pages : les sous-pages sont regroupées et indentées directement sous leur page parente.
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <button
              type="button"
              onClick={() => setPageSortAZ(v => {
                if (v === null) return 'az';
                if (v === 'az') return 'za';
                return null;
              })}
              className={`text-sm px-3 py-2 rounded font-medium transition ${sortButtonClass}`}
              title={
                pageSortAZ === 'az'
                  ? 'Basculer Z→A'
                  : pageSortAZ === 'za'
                    ? 'Retour ordre par défaut'
                    : 'Trier A→Z'
              }
            >
              {pageSortAZ === 'az' ? '🔤 Z→A' : pageSortAZ === 'za' ? '↺ Défaut' : '🔤 A→Z'}
            </button>
            <Link
              to="/dashboard/pages/new"
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold transition"
            >
              + Nouvelle Page
            </Link>
          </div>
        </div>

        {/* Barre de recherche */}
        {pages.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une page par son nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-10 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-500'
                }`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {pages.length === 0 ? (
          <div className="mt-12 max-w-md mx-auto p-8 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-3xl">
              📝
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Aucune page éditoriale créée
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Créez des pages d'exposition, de présentation ou d'articles de blog enrichies de galeries photos interactives.
            </p>
            <Link
              to="/dashboard/pages/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-green-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>+</span>
              <span>Créer ma première page</span>
            </Link>
          </div>
        ) : filteredAndSortedPages.length === 0 ? (
          <div className="mt-12 max-w-md mx-auto p-8 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-3xl border border-white/10">
              🔍
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Aucune page trouvée
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Aucune page ne correspond à « <span className="text-yellow-400 font-medium">{searchTerm}</span> ».
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition"
            >
              Effacer la recherche
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedPages.map(page => {
              const isChild = Boolean((page as any).isChild);
              const parentTitle = (page as any).parentTitle;
              const level = (page as any).level || (isChild ? 1 : 0);

              const indentClass = level === 1
                ? 'ml-4 sm:ml-12 border-l-4 border-l-amber-500 bg-amber-500/[0.04]'
                : level >= 2
                ? 'ml-8 sm:ml-24 border-l-4 border-l-yellow-400 bg-yellow-500/[0.06]'
                : 'border-l-4 border-l-blue-500/50';

              return (
                <div
                  key={page._id}
                  className={`p-4 sm:p-5 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-all duration-200 ${cardClass} ${indentClass} shadow-lg`}
                >
                  <div className="flex-1 min-w-0 w-full">
                    {/* Badge d'identification arborescente */}
                    {isChild ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-sm">
                        <span className="text-base font-black leading-none select-none">↳</span>
                        <span>Sous-page {level > 1 ? `(niveau ${level}) ` : ''}rattachée à : <strong className="text-white underline decoration-amber-400/60">{parentTitle}</strong></span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-2 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[11px] font-bold uppercase tracking-wider">
                        <span>📁</span>
                        <span>Page Principale</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-extrabold truncate text-white">{page.title}</h2>
                        <p className={`text-sm ${mutedTextClass}`}>/{page.slug}</p>
                      </div>
                      <div className="text-sm text-right">
                        <p className={mutedTextClass}>Ordre menu : <span className="font-semibold text-white">{page.menuOrder ?? 0}</span></p>
                      </div>
                    </div>

                    <div className={`flex gap-2 mt-3 flex-wrap ${isChild ? 'pl-5' : ''}`}>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${page.isPublished ? 'bg-green-700/80 text-green-100' : neutralBadgeClass}`}>
                        {page.isPublished ? '✓ Portfolio' : '✕ Portfolio'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${page.showOnBlog ? 'bg-blue-700/80 text-blue-100' : neutralBadgeClass}`}>
                        {page.showOnBlog ? '✓ Blog' : '✕ Blog'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${page.showInMenu ? 'bg-yellow-700/80 text-yellow-100' : neutralBadgeClass}`}>
                        {page.showInMenu ? '✓ Menu' : '✕ Menu'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${neutralBadgeClass}`}>
                        Section : {getMenuGroupLabel(page.menuGroup)}
                      </span>
                    </div>
                  </div>

                <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-end w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <button
                    type="button"
                    onClick={() => copyLink(page.slug)}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-100 text-xs sm:text-sm font-medium transition flex items-center gap-1 active:scale-95"
                    title="Copier le lien public"
                  >
                    <span>🔗</span>
                    <span className="hidden sm:inline">Partager</span>
                  </button>
                  <a
                    href={getPageUrl(username, page.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-100 text-xs sm:text-sm font-medium transition flex items-center gap-1 active:scale-95"
                    title="Voir la page publique"
                  >
                    <span>👁️</span>
                    <span className="hidden sm:inline">Voir</span>
                  </a>
                  <Link
                    to={`/dashboard/pages/edit/${page._id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 hover:text-yellow-100 text-xs sm:text-sm font-bold transition flex items-center gap-1 active:scale-95"
                    title="Modifier la page"
                  >
                    <span>✏️</span>
                    <span>Modifier</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPageToDelete({ id: page._id, title: page.title })}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 text-xs sm:text-sm font-medium transition flex items-center gap-1 active:scale-95"
                    title="Supprimer la page"
                  >
                    <span>🗑️</span>
                    <span className="hidden sm:inline">Supprimer</span>
                    <span className="sm:hidden">Suppr.</span>
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(pageToDelete)}
        title="Supprimer la page"
        message={`Êtes-vous sûr de vouloir supprimer définitivement la page "${pageToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setPageToDelete(null)}
      />
    </div>
  );
};

export default UserPagesManager;
