// ============================================================
// CHAMBRE NOIRE — PhotoDetailPage.tsx
// ============================================================

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Breadcrumb from '../components/Breadcrumb';
import Lightbox from '../components/Lightbox';
import { getPortfolioUrl, getBlogUrl } from '../utils/urls';
import { getSubdomain } from '../utils/domain';

const PhotoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/photos/public/${id}`).then(res => {
        if (!res.ok) throw new Error('Photo introuvable');
        return res.json();
      }),
      fetch(`/api/users/public/profile?user=${getSubdomain() || 'jac'}`).then(res => res.json()).catch(() => null)
    ])
      .then(([photoData, userData]) => {
        setPhoto(photoData);
        setUserProfile(userData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-8">
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-slate-800/80 w-full" />
        <div className="h-40 rounded-3xl bg-gray-200 dark:bg-slate-800/80 w-full" />
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Photo introuvable</h2>
        <p className="text-gray-400 mb-8">{error || "La photo demandée n'existe pas ou n'est plus disponible."}</p>
        <Link to="/" className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition">
          Retour au Carnet
        </Link>
      </div>
    );
  }

  const isEmbedded = window.location.pathname.startsWith('/embed/');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fade-in text-white">
      {/* Fil d'Ariane */}
      {!isEmbedded && (
        <div className="flex justify-between items-center">
          <Breadcrumb 
            items={[
              { label: 'Carnet de Routes', to: '/' },
              { label: photo.title || 'Photo', isCurrent: true }
            ]} 
            className="mb-0" 
          />
        </div>
      )}

      {/* Header Photo */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">
          {photo.title || 'Sans titre'}
        </h1>
        {photo.location || photo.captureDate ? (
          <p className="text-amber-400 font-medium">
            {photo.location && <span>📍 {photo.location}</span>}
            {photo.location && photo.captureDate && <span className="mx-2 text-gray-500">•</span>}
            {photo.captureDate && <span>📅 {new Date(photo.captureDate).toLocaleDateString('fr-FR')}</span>}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Colonne de gauche : Image */}
        <div className="lg:col-span-8 space-y-8">
          <div 
            className="rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl relative group cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img 
              src={`/uploads/${photo.filename}`} 
              alt={photo.title}
              className="w-full h-auto object-contain max-h-[80vh] transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white font-bold px-4 py-2 rounded-full border border-white/20 backdrop-blur-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Agrandir
              </span>
            </div>
            
            {/* Badge analogique / numérique */}
            <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider bg-black/75 text-white px-3 py-1 rounded-full border border-white/10 shadow-md backdrop-blur-sm">
              {photo.isAnalog ? '🎞️ Argentique' : '⚡ Numérique'}
            </span>
          </div>

          {/* Description & Intentions (si présents) */}
          {(photo.description || photo.shootingIntent) && (
            <div className="bg-gray-900 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              {photo.description && (
                <div>
                  <h3 className="text-xl font-bold text-amber-400 mb-3 border-b border-white/10 pb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed text-lg font-light">
                    {photo.description}
                  </p>
                </div>
              )}
              {photo.shootingIntent && (
                <div>
                  <h3 className="text-xl font-bold text-amber-400 mb-3 border-b border-white/10 pb-2">Intentions de prise de vue</h3>
                  <blockquote className="border-l-4 border-amber-500 pl-4 py-1 my-4 bg-white/5 rounded-r-xl p-4 italic text-gray-300 text-lg">
                    "{photo.shootingIntent}"
                  </blockquote>
                </div>
              )}
            </div>
          )}

          {/* Secret de fabrication */}
          {photo.makingOf && (
            <div className="bg-gray-900 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-amber-400 border-b border-white/10 pb-2 flex items-center gap-2">
                <span>🎬</span> Secret de fabrication & Démarche
              </h3>
              <div className="prose prose-invert prose-amber max-w-none">
                <MarkdownRenderer>{photo.makingOf}</MarkdownRenderer>
              </div>
            </div>
          )}
        </div>

        {/* Colonne de droite : Métadonnées / Fiche technique */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl sticky top-24">
            <h3 className="text-lg font-bold text-amber-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Fiche Technique
            </h3>
            
            <div className="space-y-4">
              {/* Matériel */}
              <div className="space-y-3">
                <h4 className="text-sm text-gray-500 font-bold uppercase tracking-wider">Matériel</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  {photo.gearCameraId && (
                    <li className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                      <span className="text-gray-400">Boîtier</span>
                      <span className="font-semibold text-white">
                        {photo.gearCameraId.brand} {photo.gearCameraId.model}
                      </span>
                    </li>
                  )}
                  {photo.gearLensId && (
                    <li className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                      <span className="text-gray-400">Objectif</span>
                      <span className="font-semibold text-white">
                        {photo.gearLensId.brand} {photo.gearLensId.model}
                      </span>
                    </li>
                  )}
                  {photo.filmId && (
                    <li className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                      <span className="text-gray-400">Pellicule</span>
                      <span className="font-semibold text-amber-400">
                        {photo.filmId.brand} {photo.filmId.model}
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Paramètres de prise de vue */}
              {photo.exposureSettings && Object.keys(photo.exposureSettings).some(k => photo.exposureSettings[k] && photo.exposureSettings[k] !== 'Aucun') && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="text-sm text-gray-500 font-bold uppercase tracking-wider">Prise de vue</h4>
                  <ul className="space-y-2 text-sm text-gray-300 grid grid-cols-2 gap-2">
                    {photo.exposureSettings.focalLength && (
                      <li className="bg-white/5 p-2 rounded-lg text-center">
                        <span className="block text-gray-400 text-xs mb-1">Focale</span>
                        <span className="font-semibold text-white">{photo.exposureSettings.focalLength}</span>
                      </li>
                    )}
                    {photo.exposureSettings.aperture && (
                      <li className="bg-white/5 p-2 rounded-lg text-center">
                        <span className="block text-gray-400 text-xs mb-1">Ouverture</span>
                        <span className="font-semibold text-white">{photo.exposureSettings.aperture}</span>
                      </li>
                    )}
                    {photo.exposureSettings.shutterSpeed && (
                      <li className="bg-white/5 p-2 rounded-lg text-center">
                        <span className="block text-gray-400 text-xs mb-1">Vitesse</span>
                        <span className="font-semibold text-white">{photo.exposureSettings.shutterSpeed}</span>
                      </li>
                    )}
                    {photo.exposureSettings.iso && (
                      <li className="bg-white/5 p-2 rounded-lg text-center">
                        <span className="block text-gray-400 text-xs mb-1">ISO</span>
                        <span className="font-semibold text-white">{photo.exposureSettings.iso}</span>
                      </li>
                    )}
                  </ul>
                  {photo.exposureSettings.filter && photo.exposureSettings.filter !== 'Aucun' && (
                    <div className="bg-white/5 p-2 rounded-lg text-sm flex justify-between">
                      <span className="text-gray-400">Filtre optique</span>
                      <span className="font-semibold text-white">{photo.exposureSettings.filter}</span>
                    </div>
                  )}
                  {photo.exposureSettings.ndFilter && photo.exposureSettings.ndFilter !== 'Aucun' && (
                    <div className="bg-white/5 p-2 rounded-lg text-sm flex justify-between">
                      <span className="text-gray-400">Filtre ND</span>
                      <span className="font-semibold text-white">ND{photo.exposureSettings.ndFilter}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Paramètres de développement */}
              {photo.isAnalog && photo.developmentSettings && Object.keys(photo.developmentSettings).some(k => photo.developmentSettings[k]) && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="text-sm text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Développement
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {photo.developmentSettings.developer && (
                      <li className="flex justify-between items-center bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        <span className="text-amber-200/60">Révélateur</span>
                        <span className="font-semibold text-amber-300">{photo.developmentSettings.developer}</span>
                      </li>
                    )}
                    {photo.developmentSettings.dilution && (
                      <li className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                        <span className="text-gray-400">Dilution</span>
                        <span className="font-semibold text-white">{photo.developmentSettings.dilution}</span>
                      </li>
                    )}
                    {photo.developmentSettings.time && (
                      <li className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                        <span className="text-gray-400">Temps</span>
                        <span className="font-semibold text-white">{photo.developmentSettings.time}</span>
                      </li>
                    )}
                    {photo.developmentSettings.temperature && (
                      <li className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                        <span className="text-gray-400">Température</span>
                        <span className="font-semibold text-white">{photo.developmentSettings.temperature}</span>
                      </li>
                    )}
                    {photo.developmentSettings.agitation && (
                      <li className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                        <span className="text-gray-400">Agitation</span>
                        <span className="font-semibold text-white text-right w-1/2 line-clamp-2" title={photo.developmentSettings.agitation}>{photo.developmentSettings.agitation}</span>
                      </li>
                    )}
                    {photo.developmentSettings.pushPull && (
                      <li className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                        <span className="text-gray-400">Poussé/Retenu</span>
                        <span className="font-semibold text-white">{photo.developmentSettings.pushPull}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLightboxOpen && (
        <Lightbox
          photos={[photo]}
          initialIndex={0}
          onClose={() => setIsLightboxOpen(false)}
          albumTitle="Fiche Technique"
        />
      )}
    </div>
  );
};

export default PhotoDetailPage;
