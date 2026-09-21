// ============================================================
// LUMINAVIEW — CreateAlbum.tsx
// Refonte ergonomique : création album & galerie virtuelle
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SORT_OPTIONS: Array<{
  value: 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'manual';
  label: string;
  sublabel: string;
  icon: string;
}> = [
  {
    value: 'date_desc',
    label: 'Plus récentes d’abord',
    sublabel: 'Date d’ajout décroissante (Défaut)',
    icon: '📅 ↓',
  },
  {
    value: 'date_asc',
    label: 'Chronologique',
    sublabel: 'Plus anciennes d’abord',
    icon: '⏳ ↑',
  },
  {
    value: 'title_asc',
    label: 'Alphabétique (A → Z)',
    sublabel: 'Tri par titre ou nom de fichier',
    icon: '🔤 A-Z',
  },
  {
    value: 'title_desc',
    label: 'Alphabétique (Z → A)',
    sublabel: 'Tri alphabétique inverse',
    icon: '🔤 Z-A',
  },
  {
    value: 'manual',
    label: 'Ordre personnalisé',
    sublabel: 'Séquence définie par l’Index / Manuel (#)',
    icon: '🔢 #',
  },
];

const CreateAlbum = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isVirtual, setIsVirtual] = useState(false);
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'manual'>('date_desc');

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [includedTags, setIncludedTags] = useState<string[]>([]);
  const [excludedTags, setExcludedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/photos/tags');
        if (Array.isArray(res.data)) {
          setAvailableTags(res.data);
        }
      } catch (err) {
        console.error('Erreur chargement tags', err);
      }
    };
    fetchTags();
  }, []);

  const handleIncludeTag = (tag: string) => {
    setExcludedTags(prev => prev.filter(t => t !== tag));
    if (!includedTags.includes(tag)) {
      setIncludedTags(prev => [...prev, tag]);
    }
  };

  const handleExcludeTag = (tag: string) => {
    setIncludedTags(prev => prev.filter(t => t !== tag));
    if (!excludedTags.includes(tag)) {
      setExcludedTags(prev => [...prev, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setIncludedTags(prev => prev.filter(t => t !== tag));
    setExcludedTags(prev => prev.filter(t => t !== tag));
  };

  const filteredAvailableTags = useMemo(() => {
    const q = tagSearchQuery.toLowerCase().trim();
    return availableTags
      .filter(t => !includedTags.includes(t) && !excludedTags.includes(t))
      .filter(t => !q || t.toLowerCase().includes(q))
      .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  }, [availableTags, includedTags, excludedTags, tagSearchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isVirtual && includedTags.length === 0) {
      alert('Une galerie virtuelle doit avoir au moins un tag inclus (en vert) pour agréger des photos.');
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        title,
        description,
        isPublic,
        isVirtual: isVirtual === true,
        sortOrder,
        virtualFilter: null,
        filterValue: null,
      };

      if (isVirtual) {
        const excludedWithDash = excludedTags.map(t => `-${t}`);
        const filterValue = [...includedTags, ...excludedWithDash]
          .map(t => t.toLowerCase().trim())
          .join(',');

        data.virtualFilter = 'tag';
        data.filterValue = filterValue;
      }

      const res = await api.post('/albums', data);
      navigate(`/album/${res.data._id}`);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la création de la galerie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* En-tête de page */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1 mb-2"
            >
              ← Retour
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 tracking-tight">
              {isVirtual ? '✨ Nouvelle Galerie Virtuelle' : '📁 Nouvel Album'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1 : Infos Générales */}
          <div className="bg-gray-900 border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/90 flex items-center gap-2">
              <span>📝</span> Informations générales
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Titre *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                placeholder="Ex : Horizons, Best of 2026..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-black/40 border border-white/15 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 h-20 resize-none"
                placeholder="Description facultative..."
              />
            </div>
          </div>

          {/* Section 2 : Visibilité & Mode Galerie */}
          <div className="bg-gray-900 border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400/90 flex items-center gap-2">
              <span>✨</span> Mode & Visibilité
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3.5 bg-black/30 rounded-xl border border-white/10 cursor-pointer hover:bg-black/40 transition">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="w-5 h-5 rounded accent-green-500 cursor-pointer"
                />
                <div>
                  <span className="text-white font-medium text-sm">Album Public</span>
                  <p className="text-xs text-gray-400">Accessible sur votre portfolio public.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-black/30 rounded-xl border border-white/10 cursor-pointer hover:bg-black/40 transition">
                <input
                  type="checkbox"
                  checked={isVirtual}
                  onChange={e => {
                    setIsVirtual(e.target.checked);
                    if (!e.target.checked) {
                      setIncludedTags([]);
                      setExcludedTags([]);
                    }
                  }}
                  className="w-5 h-5 rounded accent-purple-500 cursor-pointer"
                />
                <div>
                  <span className="text-white font-medium text-sm">Galerie Virtuelle</span>
                  <p className="text-xs text-gray-400">Remplissage dynamique par tags.</p>
                </div>
              </label>
            </div>

            {isVirtual && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-sm font-semibold text-gray-200">Filtres de tags</label>
                  <span className="text-xs text-gray-400">
                    {includedTags.length} inclus · {excludedTags.length} exclu{excludedTags.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Tags Inclus / Exclus */}
                <div className="space-y-2">
                  {includedTags.length > 0 && (
                    <div className="p-3 bg-green-950/30 border border-green-500/30 rounded-xl">
                      <div className="text-[11px] uppercase tracking-wider text-green-400 font-bold mb-1.5">
                        ✓ Tags Inclus :
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {includedTags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-green-600 text-white shadow-sm"
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-200 text-sm font-bold leading-none ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {excludedTags.length > 0 && (
                    <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl">
                      <div className="text-[11px] uppercase tracking-wider text-red-400 font-bold mb-1.5">
                        − Tags Exclus :
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {excludedTags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white shadow-sm"
                          >
                            <span>− #{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-200 text-sm font-bold leading-none ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {includedTags.length === 0 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-xs">
                      ⚠️ Sélectionnez au moins un tag ci-dessous avec le bouton <strong>« + »</strong> pour filtrer les photos.
                    </div>
                  )}
                </div>

                {/* Recherche & Tags Disponibles */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher un tag..."
                      value={tagSearchQuery}
                      onChange={e => setTagSearchQuery(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 text-white rounded-xl px-4 py-2 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-gray-500">🔍</span>
                    {tagSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTagSearchQuery('')}
                        className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="p-3 bg-black/40 border border-white/10 rounded-xl max-h-44 overflow-y-auto space-y-2">
                    <div className="text-[11px] text-gray-400">
                      Tags disponibles ({filteredAvailableTags.length}) :
                    </div>
                    {filteredAvailableTags.length === 0 ? (
                      <p className="text-gray-500 text-xs italic py-2">
                        {availableTags.length === 0 ? 'Aucun tag trouvé dans vos photos.' : 'Aucun autre tag correspondant.'}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {filteredAvailableTags.map(tag => (
                          <div
                            key={tag}
                            className="inline-flex items-center bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-lg text-xs overflow-hidden transition"
                          >
                            <span className="px-2.5 py-1 text-gray-300 font-medium">#{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleIncludeTag(tag)}
                              className="px-2 py-1 bg-green-700/60 hover:bg-green-600 text-green-100 font-bold border-l border-white/10 transition"
                              title="Inclure ce tag"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExcludeTag(tag)}
                              className="px-2 py-1 bg-red-700/60 hover:bg-red-600 text-red-100 font-bold border-l border-white/10 transition"
                              title="Exclure ce tag"
                            >
                              −
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3 : Séquence & Ordre d'affichage */}
          <div className="bg-gray-900 border border-white/10 p-5 sm:p-6 rounded-2xl space-y-3 shadow-xl">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400/90 flex items-center gap-2">
              <span>↕️</span> Séquence & Ordre d'affichage
            </h2>
            <p className="text-xs text-gray-400">
              Définissez comment les images seront ordonnées dans cette galerie.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {SORT_OPTIONS.map(opt => {
                const isSelected = sortOrder === opt.value;
                return (
                  <label
                    key={opt.value}
                    onClick={() => setSortOrder(opt.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-400 text-white shadow-md shadow-blue-500/10 ring-1 ring-blue-400/40'
                        : 'bg-black/30 border-white/10 text-gray-300 hover:bg-black/50 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sortOrder"
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => setSortOrder(opt.value)}
                      className="mt-0.5 accent-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-sm">
                        <span>{opt.label}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{opt.sublabel}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bouton Créer */}
          <button
            type="submit"
            disabled={loading || (isVirtual && includedTags.length === 0)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? 'Création en cours...' : isVirtual ? '✨ Créer la galerie virtuelle' : '📁 Créer l’album'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAlbum;
