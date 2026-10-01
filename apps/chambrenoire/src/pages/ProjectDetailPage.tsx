// ============================================================
// CHAMBRE NOIRE — ProjectDetailPage.tsx
// Sprint 3 Ergonomie v3.0 (Breadcrumbs, Recherche interne, Lightbox Filmstrip, BackToTop)
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Breadcrumb from '../components/Breadcrumb';
import BackToTop from '../components/BackToTop';
import Lightbox from '../components/Lightbox';
import { getUserSlug } from '../utils/domain';

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<any | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [photoIdeas, setPhotoIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    const userSlug = getUserSlug();
    
    // Intercepter un éventuel token de prévisualisation (preview_token) de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const previewToken = urlParams.get('preview_token');
    
    const headers: HeadersInit = {};
    if (previewToken) {
      headers['Authorization'] = `Bearer ${previewToken}`;
    }

    fetch(`/api/projects/public/project/${slug}?user=${userSlug}`, { headers })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || 'Impossible de charger ce projet');
        }
        return res.json();
      })
      .then(data => {
        setProject(data.project);
        setPhotos(data.photos || []);
        setPhotoIdeas(data.photoIdeas || []);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Une erreur est survenue');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const userSlug = getUserSlug();
  const searchParams = new URLSearchParams(window.location.search);
  const fromManager = searchParams.get('from') === 'manager' || searchParams.get('from') === 'dashboard';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const dashboardProjectsUrl = isLocal
    ? 'http://localhost:7080/dashboard/carnet-routes?tab=projects'
    : 'https://luminaview.fr/dashboard/carnet-routes?tab=projects';
  const dashboardIdeasUrl = isLocal
    ? 'http://localhost:7080/dashboard/carnet-routes?tab=ideas'
    : 'https://luminaview.fr/dashboard/carnet-routes?tab=ideas';

  // Filtrage des photos du projet
  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return photos;
    const q = searchQuery.toLowerCase().trim();
    return photos.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.shootingIntent || '').toLowerCase().includes(q) ||
      (p.location || '').toLowerCase().includes(q) ||
      (p.gearCameraId?.brand || '').toLowerCase().includes(q) ||
      (p.gearCameraId?.model || '').toLowerCase().includes(q) ||
      (p.filmId?.brand || '').toLowerCase().includes(q) ||
      (p.filmId?.filmType || '').toLowerCase().includes(q)
    );
  }, [photos, searchQuery]);

  const renderBackLink = (className: string) => {
    if (fromManager) {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={dashboardProjectsUrl}
            className={className}
            title="Retourner aux Projets de prise de vue dans le Dashboard"
          >
            &larr; Projets de prise de vue
          </a>
          <span className="text-gray-600 text-xs">•</span>
          <a
            href={dashboardIdeasUrl}
            className="text-xs text-amber-400/90 hover:text-amber-300 font-medium transition"
            title="Retourner aux Idées en préparation dans le Dashboard"
          >
            💡 Idées en préparation
          </a>
          <span className="text-gray-600 text-xs">•</span>
          <Link
            to={userSlug ? `/?user=${userSlug}` : '/'}
            className="text-xs text-gray-400 hover:text-amber-400 transition"
          >
            🌐 Chambre Noire publique
          </Link>
        </div>
      );
    }
    return (
      <Link to={userSlug ? `/?user=${userSlug}` : '/'} className={className}>
        &larr; Retour Carnet de Routes
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Chargement des détails du projet...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <p className="text-red-400 font-medium">{error || 'Projet introuvable'}</p>
        <div className="flex justify-center">
          {renderBackLink("inline-block text-amber-500 font-semibold hover:underline")}
        </div>
      </div>
    );
  }

  const isEmbedded = window.location.pathname.startsWith('/embed/');


  const renderPhotoCard = (photo: any, globalIdx: number) => (
          <div
            key={photo._id || globalIdx}
            className="bg-gray-900/70 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm"
          >
            {/* LIGNE 1 : Photo & Fiche Technique */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Colonne Photo */}
              <div className="lg:col-span-7 space-y-4">
                <div
                  className="bg-black/60 rounded-2xl overflow-hidden shadow-md relative group border border-white/10 flex items-center justify-center cursor-pointer"
                  onClick={() => setLightboxIndex(globalIdx)}
                >
                  <img
                    src={`/uploads/${photo.filename}`}
                    alt={photo.title || `Photo ${globalIdx + 1}`}
                    className="w-full h-auto max-h-[75vh] object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3.5 py-1.5 rounded-full bg-black/70 text-amber-400 text-xs font-bold border border-amber-400/40 backdrop-blur-md">
                      🔍 Agrandir (Lightbox)
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md">
                    {globalIdx + 1} / {filteredPhotos.length}
                  </span>
                </div>

                {/* Titre & Infos */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {photo.title || `Photo #${globalIdx + 1}`}
                    </h3>

                    {/* Badge si rattachée à une idée photo */}
                    {(() => {
                      const pIdeaId = typeof photo.ideaId === 'object' && photo.ideaId?._id ? photo.ideaId._id : photo.ideaId;
                      const matchedIdea = photoIdeas.find(pi => String(pi._id) === String(pIdeaId));
                      if (!matchedIdea) return null;
                      return (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
                          <span>💡 Idée :</span>
                          <strong className="text-white">{matchedIdea.name}</strong>
                        </span>
                      );
                    })()}
                  </div>

                  {(photo.location || photo.captureDate) && (
                    <p className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5 flex-wrap">
                      {photo.location && <span>📍 {photo.location}</span>}
                      {photo.location && photo.captureDate && <span className="text-gray-500">•</span>}
                      {photo.captureDate && <span>📅 {new Date(photo.captureDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                    </p>
                  )}

                  {photo.shootingIntent && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-1.5 mt-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-2">
                        💬 Note & Intention artistique
                      </span>
                      <div className="prose prose-sm dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-li:text-gray-200 text-gray-200 max-w-none leading-relaxed">
                        <MarkdownRenderer>{photo.shootingIntent}</MarkdownRenderer>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne Fiche Technique */}
              <div className="lg:col-span-5 bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-5 text-sm shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 px-2.5 py-1 rounded-full">
                    {photo.isAnalog || photo.filmId ? '🎞️ Fiche Argentique' : '⚡ Fiche Numérique'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Données Exif & Labo
                  </span>
                </div>

                {/* Prise de vue */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📷</span> Prise de vue
                  </h4>
                  <table className="w-full text-xs text-white">
                    <tbody>
                      {photo.gearCameraId && (
                        <tr className="border-b border-white/[0.08]">
                          <td className="py-1.5 font-light text-gray-300">Boîtier</td>
                          <td className="py-1.5 text-right font-medium text-white">{photo.gearCameraId.brand} {photo.gearCameraId.model}</td>
                        </tr>
                      )}
                      {photo.gearLensId && (
                        <tr className="border-b border-white/[0.08]">
                          <td className="py-1.5 font-light text-gray-300">Objectif</td>
                          <td className="py-1.5 text-right font-medium text-white">{photo.gearLensId.brand} {photo.gearLensId.model}</td>
                        </tr>
                      )}
                      {photo.exposureSettings?.aperture && (
                        <tr className="border-b border-white/[0.08]">
                          <td className="py-1.5 font-light text-gray-300">Ouverture</td>
                          <td className="py-1.5 text-right font-medium text-white">{photo.exposureSettings.aperture}</td>
                        </tr>
                      )}
                      {photo.exposureSettings?.shutterSpeed && (
                        <tr className="border-b border-white/[0.08]">
                          <td className="py-1.5 font-light text-gray-300">Vitesse d'obturation</td>
                          <td className="py-1.5 text-right font-medium text-white">{photo.exposureSettings.shutterSpeed}</td>
                        </tr>
                      )}
                      {(photo.exposureSettings?.iso || photo.filmId?.isoUsed || photo.filmId?.iso) && (
                        <tr className="border-b border-white/[0.08]">
                          <td className="py-1.5 font-light text-gray-300">Sensibilité</td>
                          <td className="py-1.5 text-right font-medium text-white">
                            {photo.exposureSettings?.iso || photo.filmId?.isoUsed || photo.filmId?.iso} ISO
                          </td>
                        </tr>
                      )}
                      {photo.exposureSettings?.focalLength && (
                        <tr className="border-b border-white/[0.08]">
                          <td className="py-1.5 font-light text-gray-300">Focale</td>
                          <td className="py-1.5 text-right font-medium text-white">{photo.exposureSettings.focalLength}</td>
                        </tr>
                      )}
                      {photo.exposureSettings?.filter && photo.exposureSettings.filter !== 'Aucun' && (
                        <tr className="border-b border-white/[0.08]">
                          <td className="py-1.5 font-light text-gray-300">Filtre</td>
                          <td className="py-1.5 text-right font-medium text-white">{photo.exposureSettings.filter}</td>
                        </tr>
                      )}
                      {photo.exposureSettings?.ndFilter && photo.exposureSettings.ndFilter !== 'Aucun' && (
                        <tr className="border-b border-white/[0.08]">
                          <td className="py-1.5 font-light text-gray-300">Filtre ND</td>
                          <td className="py-1.5 text-right font-medium text-white">{photo.exposureSettings.ndFilter}</td>
                        </tr>
                      )}
                      {photo.exposureSettings?.lensHood && (
                        <tr className="border-b border-white/[0.08]">
                          <td className="py-1.5 font-light text-gray-300">Parasoleil</td>
                          <td className="py-1.5 text-right font-medium text-white">Oui</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Éclairage */}
                {(photo.exposureSettings?.light || photo.exposureSettings?.lightingBrand || photo.exposureSettings?.lightingModel || photo.exposureSettings?.lightingType || photo.exposureSettings?.lightingPower) && (
                  <div className="space-y-2.5 pt-2 border-t border-white/10">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>💡</span> Éclairage & Lumière
                    </h4>
                    <table className="w-full text-xs text-white">
                      <tbody>
                        {photo.exposureSettings?.light && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Ambiance</td>
                            <td className="py-1.5 text-right font-medium text-white">{photo.exposureSettings.light}</td>
                          </tr>
                        )}
                        {photo.exposureSettings?.lightingType && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Type de source</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {photo.exposureSettings.lightingType === 'flash' ? '⚡ Flash' : photo.exposureSettings.lightingType === 'continuous' ? '☀️ Lumière continue' : photo.exposureSettings.lightingType}
                            </td>
                          </tr>
                        )}
                        {(photo.exposureSettings?.lightingBrand || photo.exposureSettings?.lightingModel) && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Matériel éclairage</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {`${photo.exposureSettings.lightingBrand || ''} ${photo.exposureSettings.lightingModel || ''}`.trim()}
                            </td>
                          </tr>
                        )}
                        {photo.exposureSettings?.lightingPower && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Puissance réglée</td>
                            <td className="py-1.5 text-right font-medium text-white">{photo.exposureSettings.lightingPower}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Chimie & Labo si argentique */}
                {(photo.isAnalog || photo.filmId || photo.developmentSettings?.developer) && (
                  <div className="space-y-2.5 pt-2 border-t border-white/10">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🧪</span> Chimie & Labo
                    </h4>
                    <table className="w-full text-xs text-white">
                      <tbody>
                        {photo.filmId && (
                          <>
                            <tr className="border-b border-white/[0.08]">
                              <td className="py-1.5 font-light text-gray-300">Pellicule</td>
                              <td className="py-1.5 text-right font-medium text-white">
                                {(() => {
                                  const brand = (photo.filmId.brand || '').trim();
                                  const type = (photo.filmId.filmType || '').trim();
                                  const cleanBrand = brand.split(/\s+/)[0] || '';
                                  if (type && cleanBrand && type.toLowerCase().includes(cleanBrand.toLowerCase())) {
                                    return type;
                                  }
                                  return `${brand} ${type}`.trim();
                                })()} (Nominale : {photo.filmId.iso} ISO)
                              </td>
                            </tr>
                            <tr className="border-b border-white/[0.08]">
                              <td className="py-1.5 font-light text-gray-300">Type / Format</td>
                              <td className="py-1.5 text-right font-medium text-white">
                                {photo.filmId.type === 'BW' ? 'Noir & Blanc' : photo.filmId.type === 'color' ? 'Couleur Négatif' : 'Couleur Diapo'} • Format {photo.filmId.format}
                              </td>
                            </tr>
                          </>
                        )}
                        {(photo.developmentSettings?.developer || photo.filmId?.developmentSettings?.developer) && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Révélateur</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {photo.developmentSettings?.developer || photo.filmId?.developmentSettings?.developer}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.dilution || photo.filmId?.developmentSettings?.dilution) && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Dilution</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {photo.developmentSettings?.dilution || photo.filmId?.developmentSettings?.dilution}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.time || photo.filmId?.developmentSettings?.time) && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Temps dév.</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {photo.developmentSettings?.time || photo.filmId?.developmentSettings?.time}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.temperature || photo.filmId?.developmentSettings?.temperature) && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Température</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {photo.developmentSettings?.temperature || photo.filmId?.developmentSettings?.temperature}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.agitation || photo.filmId?.developmentSettings?.agitation) && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Agitation</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {photo.developmentSettings?.agitation || photo.filmId?.developmentSettings?.agitation}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.pushPull || photo.filmId?.developmentSettings?.pushPull) && 
                          (photo.developmentSettings?.pushPull !== 'Aucun' && photo.filmId?.developmentSettings?.pushPull !== 'Aucun') && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Push/Pull</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {photo.developmentSettings?.pushPull || photo.filmId?.developmentSettings?.pushPull}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.fixerBrand || photo.filmId?.developmentSettings?.fixerBrand) && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Fixateur</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {photo.developmentSettings?.fixerBrand || photo.filmId?.developmentSettings?.fixerBrand}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.fixerDilution || photo.filmId?.developmentSettings?.fixerDilution) && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Dilution fixateur</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {photo.developmentSettings?.fixerDilution || photo.filmId?.developmentSettings?.fixerDilution}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.fixerTime || photo.filmId?.developmentSettings?.fixerTime) && (
                          <tr className="border-b border-white/[0.08]">
                            <td className="py-1.5 font-light text-gray-300">Temps fixage</td>
                            <td className="py-1.5 text-right font-medium text-white">
                              {photo.developmentSettings?.fixerTime || photo.filmId?.developmentSettings?.fixerTime}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Secret de fabrication */}
            {photo.makingOf && (
              <div className="w-full bg-gradient-to-r from-amber-500/[0.06] to-transparent border border-amber-500/20 rounded-2xl p-6 space-y-3 mt-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <span className="text-base">🎬</span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Secret de fabrication & Coulisses de prise de vue
                  </span>
                </div>
                <div className="prose prose-sm dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-li:text-gray-200 text-gray-200 max-w-none leading-relaxed">
                  <MarkdownRenderer>{photo.makingOf}</MarkdownRenderer>
                </div>
              </div>
            )}
          </div>
  );

  return (
    <>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 animate-fade-in text-white">
      {/* Fil d'Ariane & Navigation */}
      {!isEmbedded && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Breadcrumb
            items={[
              { label: 'Carnet de Routes', to: '/' },
              { label: project.name, isCurrent: true },
            ]}
            className="mb-0"
          />
          {renderBackLink("inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-sm")}
        </div>
      )}

      {/* En-tête du Projet */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {project.medium && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md ${
              project.medium === 'DIGITAL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : project.medium === 'ANALOG'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}>
              {project.medium === 'DIGITAL' ? '⚡ Projet Numérique' : project.medium === 'ANALOG' ? '🎞️ Projet Argentique' : '🔀 Projet Hybride'}
            </span>
          )}

          {project.status && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              project.status === 'PREPARATION'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                : project.status === 'IN_PROGRESS'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : project.status === 'COMPLETED'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            }`}>
              {project.status === 'PREPARATION' ? '📋 En préparation' : project.status === 'IN_PROGRESS' ? '📸 Prises de vue actives' : project.status === 'COMPLETED' ? '✨ Projet abouti' : '📦 Archivé'}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
          {project.name}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span>
            Publié le {new Date(project.createdAt).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          {project.targetDate && (
            <span>
              • 📅 Échéance : {new Date(project.targetDate).toLocaleDateString('fr-FR')}
            </span>
          )}
          {Array.isArray(project.tags) && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.map((t: string, i: number) => (
                <span key={i} className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-[10px]">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {project.coverImage && (
          <div className="rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 bg-black/40 flex items-center justify-center">
            <img
              src={`/uploads/${project.coverImage}`}
              alt={project.name}
              className="w-full h-auto max-h-[600px] object-contain rounded-3xl"
            />
          </div>
        )}

        {project.description && (
          <div className="prose dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-li:text-gray-200 text-gray-200 max-w-none leading-relaxed font-light text-lg">
            <MarkdownRenderer>{project.description}</MarkdownRenderer>
          </div>
        )}

        {project.notesMarkdown && (
          <div className="bg-white/[0.04] border border-white/15 rounded-2xl p-6 space-y-3 shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              💡 Notes, intentions & inspirations
            </span>
            <div className="prose prose-sm dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-li:text-gray-200 text-gray-200 max-w-none leading-relaxed">
              <MarkdownRenderer>{project.notesMarkdown}</MarkdownRenderer>
            </div>
          </div>
        )}

        {project.makingOf && (
          <div className="bg-white/[0.04] border border-white/15 rounded-2xl p-6 space-y-3 shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              🎬 Secret de fabrication & Démarche artistique
            </span>
            <div className="prose prose-sm dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-li:text-gray-200 text-gray-200 max-w-none leading-relaxed">
              <MarkdownRenderer>{project.makingOf}</MarkdownRenderer>
            </div>
          </div>
        )}
      </div>

        {/* NOUVEAU FLUX UNIFIÉ : IDÉES & PHOTOS */}
        <div className="space-y-16">
          {(() => {
            const orphanPhotos = filteredPhotos.filter(photo => {
              const pIdeaId = typeof photo.ideaId === 'object' && photo.ideaId?._id ? photo.ideaId._id : photo.ideaId;
              return !photoIdeas.some((idea: any) => String(idea._id) === String(pIdeaId));
            });

            return (
              <>
                {photoIdeas.map((idea: any) => {
                  const ideaPhotos = filteredPhotos.filter(p => {
                    const pIdeaId = typeof p.ideaId === 'object' && p.ideaId?._id ? p.ideaId._id : p.ideaId;
                    return String(pIdeaId) === String(idea._id);
                  });

                  return (
                    <div key={idea._id} className="space-y-6 pb-12 border-b border-white/[0.05] last:border-0 mb-8">
                      {/* Encart de l'idée */}
                      <div className="bg-gradient-to-br from-purple-950/20 via-black/40 to-black/60 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-lg">
                        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                💡 Idée Photo
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">{idea.name}</h3>
                          </div>
                          {idea.targetDate && (
                            <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full whitespace-nowrap">
                              📅 {new Date(idea.targetDate).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                          {idea.description && (
                            <div className="space-y-1.5">
                              <h4 className="text-amber-400/90 font-bold uppercase tracking-wider text-[10px]">Description</h4>
                              <p className="text-gray-200 leading-relaxed">{idea.description}</p>
                            </div>
                          )}
                          {idea.notesMarkdown && (
                            <div className="space-y-1.5">
                              <h4 className="text-amber-400/90 font-bold uppercase tracking-wider text-[10px]">Notes & Démarche</h4>
                              <div className="prose prose-invert prose-xs text-gray-200"><MarkdownRenderer>{idea.notesMarkdown}</MarkdownRenderer></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Photos concrétisant cette idée */}
                      {ideaPhotos.length > 0 ? (
                        <div className="space-y-8 pl-0 lg:pl-8 border-l-2 border-purple-500/20">
                          {ideaPhotos.map((photo) => {
                            const globalIdx = filteredPhotos.findIndex(p => String(p._id) === String(photo._id));
                            return renderPhotoCard(photo, globalIdx);
                          })}
                        </div>
                      ) : (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center italic text-gray-400 text-sm ml-0 lg:ml-8">
                          ⏳ Cette idée n'a pas encore été concrétisée.
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Photos orphelines */}
                {orphanPhotos.length > 0 && (
                  <div className="space-y-8 pt-12">
                    <h3 className="text-xl font-bold text-white mb-6">📷 Autres photographies du projet</h3>
                    {orphanPhotos.map((photo) => {
                      const globalIdx = filteredPhotos.findIndex(p => String(p._id) === String(photo._id));
                      return renderPhotoCard(photo, globalIdx);
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>


      {/* Bouton Back to Top */}
      <BackToTop />
    </div>

    {/* ── LIGHTBOX POUR LE PROJET ── */}
    {lightboxIndex !== null && filteredPhotos.length > 0 && (
      <Lightbox
        photos={filteredPhotos}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        albumTitle={project.name}
      />
    )}
    </>
  );
};

export default ProjectDetailPage;
