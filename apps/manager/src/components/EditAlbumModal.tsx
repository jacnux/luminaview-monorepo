// ============================================================
// LUMINAVIEW — EditAlbumModal.tsx
// Refonte ergonomique en 2 colonnes :
// À GAUCHE : Saisie (Titre, Description, Mode Virtuel & Tags)
// À DROITE : Choix d'ordre de tri & Photo de couverture
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';

interface EditAlbumModalProps {
  album: any;
  onClose: () => void;
  onSave: (id: string, data: any) => void;
}

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
    label: 'Ordre personnalisé (Manuel)',
    sublabel: 'Séquence définie par l’Index / Manuel (#)',
    icon: '🔢 #',
  },
];

const EditAlbumModal: React.FC<EditAlbumModalProps> = ({ album, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'manual'>('date_desc');
  const [coverImage, setCoverImage] = useState('');

  // Gestion des tags
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [includedTags, setIncludedTags] = useState<string[]>([]);
  const [excludedTags, setExcludedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // Photos pour la couverture
  const [photos, setPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // 1. Initialisation
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const resTags = await api.get('/photos/tags');
        if (Array.isArray(resTags.data)) {
          setAvailableTags(resTags.data);
        }
      } catch (err) {
        console.error('Erreur chargement tags', err);
      }
    };
    fetchTags();

    if (album) {
      setTitle(album.title || '');
      setDescription(album.description || '');
      setIsVirtual(Boolean(album.isVirtual));
      setSortOrder(album.sortOrder || 'date_desc');
      setCoverImage(album.coverImage || '');

      if (album.filterValue) {
        const rawTags = album.filterValue
          .split(',')
          .map((t: string) => t.trim())
          .filter((t: string) => t);
        const included = rawTags.filter((t: string) => !t.startsWith('-'));
        const excluded = rawTags.filter((t: string) => t.startsWith('-')).map((t: string) => t.substring(1));
        setIncludedTags(included);
        setExcludedTags(excluded);
      } else {
        setIncludedTags([]);
        setExcludedTags([]);
      }
    }
  }, [album]);

  // 2. Photos pour choix de couverture
  useEffect(() => {
    if (album?._id) {
      setLoadingPhotos(true);
      api
        .get(`/albums/photos/${album._id}`)
        .then(res => setPhotos(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error(err))
        .finally(() => setLoadingPhotos(false));
    }
  }, [album]);

  // 3. Gestion ergonomique des tags
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

  // 4. Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isVirtual && includedTags.length === 0) {
      alert('Une galerie virtuelle doit avoir au moins un tag inclus pour filtrer les photos.');
      return;
    }

    const excludedWithDash = excludedTags.map(t => `-${t}`);
    const filterValue = [...includedTags, ...excludedWithDash].join(',');

    onSave(album._id, {
      title,
      description,
      isVirtual,
      sortOrder,
      virtualFilter: isVirtual ? 'tag' : null,
      filterValue: isVirtual ? filterValue : '',
      coverImage,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 animate-fade-in">
      <div className="bg-gray-900 border border-white/15 rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[92vh] overflow-hidden text-white">
        
        {/* EN-TÊTE FIXE (Sticky Header) */}
        <div className="px-6 py-4 border-b border-white/10 bg-gray-900/90 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-md shadow-purple-500/20">
              {isVirtual ? '✨' : '📁'}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {isVirtual ? 'Modifier la galerie virtuelle' : "Modifier l'album"}
              </h3>
              <p className="text-xs text-gray-400">Paramètres généraux, filtres, ordre de tri et couverture</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-lg transition"
            title="Fermer"
          >
            ✕
          </button>
        </div>

        {/* CORPS DU FORMULAIRE EN 2 COLONNES (Scrollable) */}
        <form onSubmit={handleSubmit} id="edit-album-form" className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* ============================================================ */}
            {/* COLONNE GAUCHE : Saisie (Titre, Description, Mode & Tags)    */}
            {/* ============================================================ */}
            <div className="space-y-6">
              
              {/* Informations Générales */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/90 flex items-center gap-2">
                  <span>📝</span> Informations générales
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Titre de la galerie / album *</label>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex : Horizons, Portraits, Nuances..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Description (facultative)</label>
                  <textarea
                    className="w-full bg-black/40 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition h-20 resize-none"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Présentation de la série ou note curatoriale..."
                  />
                </div>
              </div>

              {/* Type d'Album & Filtres Tags */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400/90 flex items-center gap-2">
                    <span>✨</span> Type de galerie
                  </h4>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                    isVirtual ? 'bg-purple-500/20 text-purple-200 border-purple-400/30' : 'bg-blue-500/20 text-blue-200 border-blue-400/30'
                  }`}>
                    {isVirtual ? 'Galerie Virtuelle dynamique' : 'Album Standard'}
                  </span>
                </div>

                <label className="flex items-start gap-3.5 p-3.5 bg-black/30 rounded-xl border border-white/10 cursor-pointer hover:bg-black/40 transition">
                  <input
                    type="checkbox"
                    checked={isVirtual}
                    onChange={e => setIsVirtual(e.target.checked)}
                    className="w-5 h-5 rounded mt-0.5 accent-purple-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-white font-medium text-sm">Activer le mode Galerie Virtuelle</span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Agrège automatiquement toutes vos photos qui contiennent les tags sélectionnés ci-dessous.
                    </p>
                  </div>
                </label>

                {isVirtual && (
                  <div className="pt-3 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-sm font-semibold text-gray-200">Filtres de tags</label>
                      <span className="text-xs text-gray-400">
                        {includedTags.length} inclus · {excludedTags.length} exclu{excludedTags.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Tags Inclus & Exclus Actifs */}
                    <div className="space-y-2">
                      {includedTags.length > 0 && (
                        <div className="p-3 bg-green-950/30 border border-green-500/30 rounded-xl">
                          <div className="text-[11px] uppercase tracking-wider text-green-400 font-bold mb-1.5">
                            ✓ Tags Inclus (Photos affichées) :
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
                                  title="Retirer ce tag"
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
                            − Tags Exclus (Photos masquées) :
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
                                  title="Retirer cette exclusion"
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
                          ⚠️ Veuillez ajouter au moins un tag ci-dessous en cliquant sur <strong>« + »</strong> pour alimenter la galerie.
                        </div>
                      )}
                    </div>

                    {/* Recherche & Tags Disponibles */}
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Rechercher un tag parmi votre bibliothèque..."
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
            </div>

            {/* ============================================================ */}
            {/* COLONNE DROITE : Ordre d'affichage & Photo de couverture     */}
            {/* ============================================================ */}
            <div className="space-y-6">
              
              {/* Séquence & Ordre d'affichage */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400/90 flex items-center gap-2">
                  <span>↕️</span> Séquence & Ordre d'affichage
                </h4>
                <p className="text-xs text-gray-400">
                  Définissez comment les images seront ordonnées dans cette galerie et sur vos pages web associées.
                </p>

                <div className="space-y-2 pt-1">
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
                          <div className="flex items-center gap-2 font-semibold text-sm">
                            <span className="text-base">{opt.icon}</span>
                            <span>{opt.label}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{opt.sublabel}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Photo de Couverture */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90 flex items-center gap-2">
                    <span>🖼️</span> Photo de couverture
                  </h4>
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="text-xs text-red-400 hover:text-red-300 underline font-medium"
                    >
                      Réinitialiser (Auto)
                    </button>
                  )}
                </div>

                {/* Prévisualisation de la couverture actuelle */}
                {coverImage ? (
                  <div className="flex items-center gap-4 p-3 bg-black/40 rounded-xl border border-white/10">
                    <img
                      src={`/uploads/${coverImage}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-yellow-400/50 shadow-md flex-shrink-0"
                      alt="Couverture"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Couverture sélectionnée</div>
                      <p className="text-sm font-mono text-gray-300 truncate mt-0.5">{coverImage}</p>
                      <p className="text-xs text-gray-500 mt-1">Affichée en vignette sur votre portfolio public.</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                    Aucune image personnalisée : la première photo de la galerie sera utilisée automatiquement.
                  </p>
                )}

                {/* Grille de sélection des photos */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Choisir parmi les photos de l'album ({photos.length}) :
                  </label>

                  {loadingPhotos ? (
                    <p className="text-gray-400 text-xs italic py-2">Chargement des photos...</p>
                  ) : photos.length === 0 ? (
                    <p className="text-gray-500 text-xs italic bg-black/20 p-3 rounded-lg border border-white/5">
                      Aucune photo disponible pour cet album.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto p-2 bg-black/40 rounded-xl border border-white/10">
                      {photos.map((p: any) => {
                        const isSelected = coverImage === p.filename;
                        return (
                          <div
                            key={p._id}
                            onClick={() => setCoverImage(p.filename)}
                            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition relative aspect-square group ${
                              isSelected
                                ? 'border-yellow-400 scale-105 shadow-lg shadow-yellow-500/20 ring-2 ring-yellow-400/60 z-10'
                                : 'border-transparent opacity-70 hover:opacity-100 hover:border-white/40'
                            }`}
                            title={p.title || p.filename}
                          >
                            <img
                              src={`/uploads/thumb-${p.filename}`}
                              onError={(e: any) => {
                                e.currentTarget.src = `/uploads/${p.filename}`;
                              }}
                              alt={p.title || 'Aperçu'}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-yellow-400 text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow">
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </form>

        {/* PIED DE PAGE FIXE (Sticky Footer) */}
        <div className="px-6 py-4 border-t border-white/10 bg-gray-900/90 backdrop-blur-md flex items-center justify-end gap-3 flex-shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-medium transition border border-white/10"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="edit-album-form"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-purple-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Enregistrer les modifications
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditAlbumModal;
