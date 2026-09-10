import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { getUserSlug } from '../utils/domain';

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<any | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    const userSlug = getUserSlug();
    fetch(`/api/projects/public/project/${slug}?user=${userSlug}`)
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
    : 'https://manager.luminaview.fr/dashboard/carnet-routes?tab=projects';
  const dashboardIdeasUrl = isLocal
    ? 'http://localhost:7080/dashboard/carnet-routes?tab=ideas'
    : 'https://manager.luminaview.fr/dashboard/carnet-routes?tab=ideas';

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
            className="text-xs text-amber-500/90 hover:text-amber-400 font-medium transition"
            title="Retourner aux Idées en préparation dans le Dashboard"
          >
            💡 Idées en préparation
          </a>
          <span className="text-gray-600 text-xs">•</span>
          <Link
            to={userSlug ? `/?user=${userSlug}` : '/'}
            className="text-xs text-gray-500 hover:text-yellow-400 transition"
          >
            🌐 Chambre Noire publique
          </Link>
        </div>
      );
    }
    return (
      <Link to={userSlug ? `/?user=${userSlug}` : '/'} className={className}>
        &larr; Retour Chambre Noire
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Chargement des détails du projet...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <p className="text-red-500 font-medium">{error || 'Projet introuvable'}</p>
        <div className="flex justify-center">
          {renderBackLink("inline-block text-amber-500 font-semibold hover:underline")}
        </div>
      </div>
    );
  }

  const isEmbedded = window.location.pathname.startsWith('/embed/');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Back link */}
      {!isEmbedded && (
        <div>
          {renderBackLink("inline-flex items-center text-sm font-semibold text-white hover:text-amber-400 transition-colors")}
        </div>
      )}

      {/* Project Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {project.medium && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
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
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              project.status === 'PREPARATION'
                ? 'bg-orange-500/20 text-orange-300'
                : project.status === 'IN_PROGRESS'
                ? 'bg-emerald-500/20 text-emerald-300'
                : project.status === 'COMPLETED'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-gray-500/20 text-gray-300'
            }`}>
              {project.status === 'PREPARATION' ? '📋 En préparation' : project.status === 'IN_PROGRESS' ? '📸 Prises de vue actives' : project.status === 'COMPLETED' ? '✨ Projet abouti' : '📦 Archivé'}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {project.name}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-white">
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
                <span key={i} className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px]">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {project.coverImage && (
          <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[21/9] max-h-96 relative border border-white/10">
            <img
              src={`/uploads/${project.coverImage}`}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {project.description && (
          <div className="prose dark:prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-li:text-white text-white max-w-none leading-relaxed font-light text-lg">
            <MarkdownRenderer>{project.description}</MarkdownRenderer>
          </div>
        )}

        {project.notesMarkdown && (
          <div className="bg-white/[0.04] border border-white/15 rounded-2xl p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              💡 Notes, intentions & inspirations
            </span>
            <div className="prose prose-sm dark:prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-li:text-white text-white max-w-none leading-relaxed">
              <MarkdownRenderer>{project.notesMarkdown}</MarkdownRenderer>
            </div>
          </div>
        )}

        {project.makingOf && (
          <div className="bg-white/[0.04] border border-white/15 rounded-2xl p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              🎬 Secret de fabrication & Démarche artistique
            </span>
            <div className="prose prose-sm dark:prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-li:text-white text-white max-w-none leading-relaxed">
              <MarkdownRenderer>{project.makingOf}</MarkdownRenderer>
            </div>
          </div>
        )}
      </div>

      {/* Photos flow (Carnet de voyage style - v1.6.0) */}
      <div className="space-y-16">
        {photos.length === 0 && (
          <div className="text-center py-16 rounded-3xl bg-black/20 border border-white/5 space-y-2">
            <span className="text-3xl">📸</span>
            <p className="text-white text-sm font-medium">Séance de prise de vue en cours de réalisation</p>
            <p className="text-white/80 text-xs">Les photographies associées à ce projet apparaîtront ici dès leur ajout.</p>
          </div>
        )}

        {photos.map((photo, idx) => (
          <div
            key={photo._id}
            className="bg-gray-900/60 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm"
          >
            {/* LIGNE 1 : Grille 2 colonnes (Gauche: Photo & Contexte / Droite: Fiche Technique) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* COLONNE GAUCHE : Photo & Contexte artistique */}
              <div className="lg:col-span-7 space-y-4">
                {/* Visual - Photo entière sans recadrage */}
                <div className="bg-black/60 rounded-2xl overflow-hidden shadow-md relative group border border-white/10 flex items-center justify-center">
                  <img
                    src={`/uploads/${photo.filename}`}
                    alt={photo.title || `Photo ${idx + 1}`}
                    className="w-full h-auto max-h-[75vh] object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md">
                    {idx + 1} / {photos.length}
                  </span>
                </div>

                {/* Titre & Infos de base */}
                <div className="space-y-2 pt-1">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {photo.title || `Photo #${idx + 1}`}
                  </h3>

                  {(photo.location || photo.captureDate) && (
                    <p className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5 flex-wrap">
                      {photo.location && <span>📍 {photo.location}</span>}
                      {photo.location && photo.captureDate && <span className="text-gray-500">•</span>}
                      {photo.captureDate && <span>📅 {new Date(photo.captureDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                    </p>
                  )}

                  {photo.shootingIntent && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-1.5 mt-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                        💬 Note & Intention artistique
                      </span>
                      <p className="text-white text-sm leading-relaxed italic">
                        « {photo.shootingIntent} »
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* COLONNE DROITE : Caractéristiques techniques (Prise de vue, Éclairage, Chimie/Labo) */}
              <div className="lg:col-span-5 bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-5 text-sm shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 px-2.5 py-1 rounded-full">
                    {photo.isAnalog || photo.filmId ? '🎞️ Fiche Argentique' : '⚡ Fiche Numérique'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Données Exif & Labo
                  </span>
                </div>

                {/* Bloc Prise de vue */}
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

                {/* Bloc Éclairage */}
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

                {/* Bloc Chimie & Labo (si argentique) */}
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

            {/* LIGNE 2 : Ligne à une seule colonne pleine largeur pour les Secrets de fabrication */}
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
        ))}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
