import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      .then(res => {
        if (!res.ok) throw new Error('Impossible de charger ce projet');
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
        <Link to="/" className="inline-block text-amber-500 font-semibold hover:underline">
          &larr; Retour au carnet de routes
        </Link>
      </div>
    );
  }

  const isEmbedded = window.location.pathname.startsWith('/embed/');

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
      {/* Back link */}
      {!isEmbedded && (
        <div>
          <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-amber-500 transition-colors">
            &larr; Retour au carnet de routes
          </Link>
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
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {project.status === 'PREPARATION' ? '📋 En préparation' : project.status === 'IN_PROGRESS' ? '📸 Prises de vue actives' : project.status === 'COMPLETED' ? '✨ Projet abouti' : '📦 Archivé'}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl">
          {project.name}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
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

        {project.description && (
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-light text-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
          </div>
        )}

        {project.makingOf && (
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              🎬 Secret de fabrication & Démarche artistique
            </span>
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-300 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.makingOf}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>


      {/* Photos flow (Carnet de voyage style) */}
      <div className="space-y-24">
        {photos.map((photo, idx) => (
          <div key={photo._id} className="space-y-6 border-b border-black/[0.06] dark:border-white/[0.06] pb-16 last:border-b-0 last:pb-0">
            {/* Visual */}
            <div className="bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden shadow-lg aspect-[3/2] relative group">
              <img
                src={`/uploads/${photo.filename}`}
                alt={photo.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white px-2 py-0.5 rounded-full">
                {idx + 1} / {photos.length}
              </span>
            </div>

            {/* Context & Technical card */}
            <div className="grid md:grid-cols-12 gap-8 items-start">
              {/* Artistic side */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-xl font-bold text-gray-100">{photo.title}</h3>
                {photo.location && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    📍 {photo.location}
                    {photo.captureDate && ` • 📅 ${new Date(photo.captureDate).toLocaleDateString('fr-FR')}`}
                  </p>
                )}
                {photo.shootingIntent && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Note artistique</span>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                      "{photo.shootingIntent}"
                    </p>
                  </div>
                )}
                {photo.makingOf && (
                  <div className="space-y-1 pt-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Secret de fabrication</span>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{photo.makingOf}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical side */}
              <div className="md:col-span-5 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-5 space-y-5 text-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                    {photo.isAnalog || photo.filmId ? '🎞️ Fiche Argentique' : '⚡ Fiche Numérique'}
                  </span>
                </div>

                {/* Exif block */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Réglages prise de vue</h4>
                  <table className="w-full text-xs text-gray-600 dark:text-gray-400">
                    <tbody>
                      {photo.gearCameraId && (
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <td className="py-1.5 font-light">Boîtier</td>
                          <td className="py-1.5 text-right font-medium text-gray-100">{photo.gearCameraId.brand} {photo.gearCameraId.model}</td>
                        </tr>
                      )}
                      {photo.gearLensId && (
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <td className="py-1.5 font-light">Objectif</td>
                          <td className="py-1.5 text-right font-medium text-gray-100">{photo.gearLensId.brand} {photo.gearLensId.model}</td>
                        </tr>
                      )}
                      {photo.exposureSettings?.aperture && (
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <td className="py-1.5 font-light">Ouverture</td>
                          <td className="py-1.5 text-right font-medium text-gray-100">{photo.exposureSettings.aperture}</td>
                        </tr>
                      )}
                      {photo.exposureSettings?.shutterSpeed && (
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <td className="py-1.5 font-light">Vitesse d'obturation</td>
                          <td className="py-1.5 text-right font-medium text-gray-100">{photo.exposureSettings.shutterSpeed}</td>
                        </tr>
                      )}
                      {(photo.exposureSettings?.iso || photo.filmId?.isoUsed || photo.filmId?.iso) && (
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <td className="py-1.5 font-light">Sensibilité</td>
                          <td className="py-1.5 text-right font-medium text-gray-100">
                            {photo.exposureSettings?.iso || photo.filmId?.isoUsed || photo.filmId?.iso} ISO
                          </td>
                        </tr>
                      )}
                      {photo.exposureSettings?.focalLength && (
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <td className="py-1.5 font-light">Focale</td>
                          <td className="py-1.5 text-right font-medium text-gray-100">{photo.exposureSettings.focalLength}</td>
                        </tr>
                      )}
                      {photo.exposureSettings?.light && (
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <td className="py-1.5 font-light">Lumière</td>
                          <td className="py-1.5 text-right font-medium text-gray-100">
                            {photo.exposureSettings.light}
                            {(photo.exposureSettings.lightingBrand || photo.exposureSettings.lightingModel || photo.exposureSettings.lightingType || photo.exposureSettings.lightingPower) && (
                              <span className="block text-[11px] text-yellow-400 font-normal">
                                {photo.exposureSettings.lightingType === 'flash' ? '⚡ Flash' : photo.exposureSettings.lightingType === 'continuous' ? '☀️ Continue' : ''}
                                {(photo.exposureSettings.lightingBrand || photo.exposureSettings.lightingModel) && ` ${photo.exposureSettings.lightingBrand} ${photo.exposureSettings.lightingModel}`.trim()}
                                {photo.exposureSettings.lightingPower && ` @ ${photo.exposureSettings.lightingPower}`}
                              </span>
                            )}
                          </td>
                        </tr>
                      )}
                      {photo.exposureSettings?.filter && photo.exposureSettings.filter !== 'Aucun' && (
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <td className="py-1.5 font-light">Filtre</td>
                          <td className="py-1.5 text-right font-medium text-gray-100">{photo.exposureSettings.filter}</td>
                        </tr>
                      )}
                      {photo.exposureSettings?.ndFilter && photo.exposureSettings.ndFilter !== 'Aucun' && (
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <td className="py-1.5 font-light">Filtre ND</td>
                          <td className="py-1.5 text-right font-medium text-gray-100">{photo.exposureSettings.ndFilter}</td>
                        </tr>
                      )}
                      {photo.exposureSettings?.lensHood && (
                        <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                          <td className="py-1.5 font-light">Parasoleil</td>
                          <td className="py-1.5 text-right font-medium text-gray-100">Oui</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Development block for Analog / Film */}
                {(photo.isAnalog || photo.filmId || photo.developmentSettings?.developer) && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-black/[0.06] dark:border-white/[0.06] pt-3">Chimie & Labo</h4>
                    <table className="w-full text-xs text-gray-600 dark:text-gray-400">
                      <tbody>
                        {photo.filmId && (
                          <>
                            <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                              <td className="py-1.5 font-light">Pellicule</td>
                              <td className="py-1.5 text-right font-medium text-gray-100">
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
                            <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                              <td className="py-1.5 font-light">Type / Format</td>
                              <td className="py-1.5 text-right font-medium text-gray-100">
                                {photo.filmId.type === 'BW' ? 'Noir & Blanc' : photo.filmId.type === 'color' ? 'Couleur Négatif' : 'Couleur Diapo'} • Format {photo.filmId.format}
                              </td>
                            </tr>
                          </>
                        )}
                        {(photo.developmentSettings?.developer || photo.filmId?.developmentSettings?.developer) && (
                          <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                            <td className="py-1.5 font-light">Révélateur</td>
                            <td className="py-1.5 text-right font-medium text-gray-100">
                              {photo.developmentSettings?.developer || photo.filmId?.developmentSettings?.developer}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.dilution || photo.filmId?.developmentSettings?.dilution) && (
                          <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                            <td className="py-1.5 font-light">Dilution</td>
                            <td className="py-1.5 text-right font-medium text-gray-100">
                              {photo.developmentSettings?.dilution || photo.filmId?.developmentSettings?.dilution}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.time || photo.filmId?.developmentSettings?.time) && (
                          <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                            <td className="py-1.5 font-light">Temps dév.</td>
                            <td className="py-1.5 text-right font-medium text-gray-100">
                              {photo.developmentSettings?.time || photo.filmId?.developmentSettings?.time}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.temperature || photo.filmId?.developmentSettings?.temperature) && (
                          <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                            <td className="py-1.5 font-light">Température</td>
                            <td className="py-1.5 text-right font-medium text-gray-100">
                              {photo.developmentSettings?.temperature || photo.filmId?.developmentSettings?.temperature}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.agitation || photo.filmId?.developmentSettings?.agitation) && (
                          <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                            <td className="py-1.5 font-light">Agitation</td>
                            <td className="py-1.5 text-right font-medium text-gray-100">
                              {photo.developmentSettings?.agitation || photo.filmId?.developmentSettings?.agitation}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.pushPull || photo.filmId?.developmentSettings?.pushPull) && 
                         (photo.developmentSettings?.pushPull !== 'Aucun' && photo.filmId?.developmentSettings?.pushPull !== 'Aucun') && (
                          <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                            <td className="py-1.5 font-light">Push/Pull</td>
                            <td className="py-1.5 text-right font-medium text-gray-100">
                              {photo.developmentSettings?.pushPull || photo.filmId?.developmentSettings?.pushPull}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.fixerBrand || photo.filmId?.developmentSettings?.fixerBrand) && (
                          <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                            <td className="py-1.5 font-light">Fixateur</td>
                            <td className="py-1.5 text-right font-medium text-gray-100">
                              {photo.developmentSettings?.fixerBrand || photo.filmId?.developmentSettings?.fixerBrand}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.fixerDilution || photo.filmId?.developmentSettings?.fixerDilution) && (
                          <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                            <td className="py-1.5 font-light">Dilution fixateur</td>
                            <td className="py-1.5 text-right font-medium text-gray-100">
                              {photo.developmentSettings?.fixerDilution || photo.filmId?.developmentSettings?.fixerDilution}
                            </td>
                          </tr>
                        )}
                        {(photo.developmentSettings?.fixerTime || photo.filmId?.developmentSettings?.fixerTime) && (
                          <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                            <td className="py-1.5 font-light">Temps fixage</td>
                            <td className="py-1.5 text-right font-medium text-gray-100">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
