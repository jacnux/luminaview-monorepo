// ============================================================
// CHAMBRE NOIRE — CarnetDeRoutesPage.tsx
// Sprint 3 Ergonomie v3.0 (Breadcrumbs, Recherche, Filtres, BackToTop)
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Breadcrumb from '../components/Breadcrumb';
import BackToTop from '../components/BackToTop';
import Lightbox from '../components/Lightbox';
import { getSubdomain } from '../utils/domain';
import { getPortfolioUrl, getBlogUrl } from '../utils/urls';

const CarnetDeRoutesPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [standalonePhotos, setStandalonePhotos] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [shareItem, setShareItem] = useState<{ type: 'project' | 'photo'; title: string; url: string; embedUrl: string } | null>(null);
  const [projectTab, setProjectTab] = useState<'active' | 'archived' | 'all'>('active');
  const [mediumFilter, setMediumFilter] = useState<'all' | 'ANALOG' | 'DIGITAL'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`/api/projects/public/all?user=${getSubdomain() || 'jac'}`).then(r => r.json()),
      fetch(`/api/photos/public/standalone?user=${getSubdomain() || 'jac'}`).then(r => r.json()),
      fetch(`/api/users/public/profile?user=${getSubdomain() || 'jac'}`).then(r => r.json()).catch(() => null),
    ])
      .then(([projData, photoData, userData]) => {
        const projs = Array.isArray(projData) ? projData : [];
        const photos = Array.isArray(photoData) ? photoData : [];
        setProjects(projs);
        setStandalonePhotos(photos);
        setUserProfile(userData);

        // Récupérer le paramètre photo si présent dans l'URL
        const params = new URLSearchParams(window.location.search);
        const photoId = params.get('photo');
        if (photoId) {
          const foundIdx = photos.findIndex((p: any) => p._id === photoId);
          if (foundIdx !== -1) {
            setLightboxIndex(foundIdx);
          }
        }
      })
      .catch(err => console.error('Error fetching carnet de routes:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeProjects = useMemo(() => projects.filter(p => p.status !== 'ARCHIVED'), [projects]);
  const archivedProjects = useMemo(() => projects.filter(p => p.status === 'ARCHIVED'), [projects]);

  const baseProjects = useMemo(() => {
    if (projectTab === 'active') return activeProjects;
    if (projectTab === 'archived') return archivedProjects;
    return [...activeProjects, ...archivedProjects];
  }, [projectTab, activeProjects, archivedProjects]);

  // Filtrage par médium & recherche
  const filteredProjects = useMemo(() => {
    let list = baseProjects;
    if (mediumFilter === 'ANALOG') {
      list = list.filter(p => p.medium === 'ANALOG' || p.medium === 'HYBRID');
    } else if (mediumFilter === 'DIGITAL') {
      list = list.filter(p => p.medium === 'DIGITAL' || p.medium === 'HYBRID');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [baseProjects, mediumFilter, searchQuery]);

  const basePhotos = useMemo(() => {
    return projectTab === 'archived' ? [] : standalonePhotos;
  }, [projectTab, standalonePhotos]);

  const filteredPhotos = useMemo(() => {
    let list = basePhotos;
    if (mediumFilter === 'ANALOG') {
      list = list.filter(p => p.isAnalog);
    } else if (mediumFilter === 'DIGITAL') {
      list = list.filter(p => !p.isAnalog);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.shootingIntent || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.gearCameraId?.brand || '').toLowerCase().includes(q) ||
        (p.gearCameraId?.model || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [basePhotos, mediumFilter, searchQuery]);

  const totalResults = filteredProjects.length + filteredPhotos.length;
  const isEmbedded = window.location.pathname.startsWith('/embed/');

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 animate-pulse space-y-8">
        <div className="h-40 rounded-2xl bg-gray-200 dark:bg-slate-800/80 w-full" />
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-slate-800/80 w-full" />
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-slate-800/80 w-full" />
      </div>
    );
  }

  const searchParams = new URLSearchParams(window.location.search);
  const fromBlog = searchParams.get('from') === 'blog';
  const userSlug = userProfile?.name || getSubdomain() || 'jac';
  const backUrl = fromBlog ? getBlogUrl(userSlug) : getPortfolioUrl(userSlug, userProfile?.blogTheme);
  const backLabel = fromBlog ? 'Retour au Blog' : `Retour au Portfolio ${userProfile?.name ? `(${userProfile.name})` : ''}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fade-in">
      {/* Fil d'Ariane & Navigation */}
      {!isEmbedded && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Breadcrumb items={[{ label: 'Carnet de Routes', isCurrent: true }]} className="mb-0" />
        </div>
      )}

      {/* Intro Header */}
      {!isEmbedded && (
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl drop-shadow-md">
            📓 Carnet de Routes
          </h1>
          <div className="text-white prose-p:text-white prose-headings:text-white prose-strong:text-white prose-a:text-amber-400 font-normal leading-relaxed prose dark:prose-invert max-w-none text-center">
            <MarkdownRenderer>
              {userProfile?.carnetIntro || "Découvrez la mémoire artistique et technique de mes sorties photo. Pour chaque projet, retrouvez l'intention initiale, les boîtiers, objectifs et pellicules utilisés, ainsi que les paramètres de prise de vue et de développement."}
            </MarkdownRenderer>
          </div>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mt-4" />
        </div>
      )}

      {/* ── BARRE DE RECHERCHE & FILTRES ERGONOMIQUES ── */}
      <div className="space-y-4">
        {/* Barre de Recherche Instantanée */}
        <div className="max-w-2xl mx-auto relative">
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-gray-400 text-sm pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un projet, une photo, un boîtier, un lieu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 text-sm pl-10 pr-10 py-3 rounded-2xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-gray-400 hover:text-white text-xs bg-white/10 hover:bg-white/20 rounded-full w-5 h-5 flex items-center justify-center transition"
                title="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Barre d'onglets & Pilules de filtrage */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          {/* Onglets Projets */}
          <div className="inline-flex flex-wrap justify-center items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-xl">
            <button
              onClick={() => setProjectTab('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                projectTab === 'active'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📸 En cours</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                projectTab === 'active' ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'
              }`}>
                {activeProjects.length}
              </span>
            </button>
            <button
              onClick={() => setProjectTab('archived')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                projectTab === 'archived'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📦 Archivés</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                projectTab === 'archived' ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'
              }`}>
                {archivedProjects.length}
              </span>
            </button>
            <button
              onClick={() => setProjectTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                projectTab === 'all'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🗂️ Tous</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                projectTab === 'all' ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'
              }`}>
                {projects.length}
              </span>
            </button>
          </div>

          {/* Filtres Médium (Argentique / Numérique) */}
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setMediumFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                mediumFilter === 'all'
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tous formats
            </button>
            <button
              onClick={() => setMediumFilter('ANALOG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                mediumFilter === 'ANALOG'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-gray-400 hover:text-amber-300'
              }`}
            >
              <span>🎞️</span>
              <span>Argentique</span>
            </button>
            <button
              onClick={() => setMediumFilter('DIGITAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                mediumFilter === 'DIGITAL'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-gray-400 hover:text-cyan-300'
              }`}
            >
              <span>⚡</span>
              <span>Numérique</span>
            </button>
          </div>
        </div>

        {/* Compteur de résultats dynamique */}
        {(searchQuery || mediumFilter !== 'all') && (
          <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <span>
              Affichage de <strong className="text-amber-400">{filteredProjects.length}</strong> projet{filteredProjects.length > 1 ? 's' : ''}
              {filteredPhotos.length > 0 ? ` et ${filteredPhotos.length} photo${filteredPhotos.length > 1 ? 's' : ''}` : ''}
            </span>
            {(searchQuery || mediumFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setMediumFilter('all');
                }}
                className="text-amber-400 hover:underline ml-1"
              >
                (Réinitialiser les filtres)
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── GRILLE DES PROJETS ET PHOTOS ── */}
      {totalResults === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 space-y-4">
          <div className="text-4xl opacity-50">🔍</div>
          <p className="text-gray-400 text-sm">
            {searchQuery 
              ? `Aucun résultat ne correspond à « ${searchQuery} »`
              : projectTab === 'archived'
              ? 'Aucun projet archivé pour le moment.'
              : 'Aucun carnet de route publié pour le moment.'}
          </p>
          {(searchQuery || mediumFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setMediumFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
            >
              Réinitialiser la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Cartes Projets */}
          {filteredProjects.map((project, pIdx) => (
            <div
              key={`proj-${project._id}`}
              className="relative group bg-gray-900 border border-white/[0.08] rounded-2xl shadow-md hover:shadow-2xl hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <Link
                to={`/project/${project.slug}`}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  {/* Image de Couverture */}
                  <div className="aspect-[4/3] w-full bg-white/5 relative overflow-hidden">
                    {project.coverImage ? (
                      <img
                        src={`/uploads/thumb-${project.coverImage}`}
                        alt={project.name}
                        loading={pIdx === 0 ? "eager" : "lazy"}
                        fetchPriority={pIdx === 0 ? "high" : "auto"}
                        decoding="async"
                        width={800}
                        height={600}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-40 group-hover:scale-110 transition-transform duration-500">
                        📷
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Badge médium & statut */}
                    <div className="absolute top-3 left-3 flex gap-1 items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md ${
                        project.medium === 'DIGITAL'
                          ? 'bg-cyan-500 text-black'
                          : project.medium === 'ANALOG'
                          ? 'bg-amber-500 text-black'
                          : 'bg-purple-500 text-white'
                      }`}>
                        {project.medium === 'DIGITAL' ? '⚡ Numérique' : project.medium === 'ANALOG' ? '🎞️ Argentique' : project.medium === 'HYBRID' ? '🔀 Hybride' : 'Projet'}
                      </span>
                      {project.status === 'ARCHIVED' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-900/90 text-purple-200 border border-purple-500/40">
                          📦 Archivé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Détails du Projet */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {project.name}
                    </h3>
                    {Array.isArray(project.tags) && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((t: string, i: number) => (
                          <span key={i} className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-400">
                      Publié le {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed font-light">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <span className="inline-flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                    Ouvrir le carnet de route &rarr;
                  </span>
                </div>
              </Link>

              {/* Bouton Partager */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const projectUrl = `${window.location.origin}/project/${project.slug}`;
                  const embedUrl = `${window.location.origin}/embed/project/${project.slug}`;
                  setShareItem({
                    type: 'project',
                    title: project.name,
                    url: projectUrl,
                    embedUrl: embedUrl
                  });
                }}
                className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black text-white hover:text-amber-400 p-2 rounded-full transition text-xs border border-white/10 backdrop-blur-md"
                title="Partager / Intégrer"
              >
                🔗
              </button>
            </div>
          ))}

          {/* Cartes Photos Isolées */}
          {filteredPhotos.map((photo, sIdx) => (
            <Link
              key={`photo-${photo._id}`}
              to={`/photo/${photo._id}`}
              className="relative group bg-gray-900 border border-white/[0.08] rounded-2xl shadow-md hover:shadow-2xl hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Conteneur photo */}
                <div className="aspect-[4/3] w-full bg-white/5 relative overflow-hidden">
                  <img
                    src={`/uploads/thumb-${photo.filename}`}
                    alt={photo.title}
                    loading={sIdx === 0 && filteredProjects.length === 0 ? "eager" : "lazy"}
                    fetchPriority={sIdx === 0 && filteredProjects.length === 0 ? "high" : "auto"}
                    decoding="async"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Badge analogique / numérique */}
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white px-2 py-0.5 rounded-full border border-white/10 shadow-md">
                    {photo.isAnalog ? '🎞️ Argentique' : '⚡ Numérique'}
                  </span>

                  {/* Bouton Partager */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const photoUrl = `${window.location.origin}/?photo=${photo._id}`;
                      const embedUrl = `${window.location.origin}/embed/carnet-de-routes?photo=${photo._id}`;
                      setShareItem({
                        type: 'photo',
                        title: photo.title || 'Sans titre',
                        url: photoUrl,
                        embedUrl: embedUrl
                      });
                    }}
                    className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black text-white hover:text-amber-400 p-2 rounded-full transition text-xs border border-white/10 backdrop-blur-md"
                    title="Partager / Intégrer"
                  >
                    🔗
                  </button>
                </div>

                {/* Détails Photo */}
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {photo.location ? `📍 ${photo.location}` : ''}
                    {photo.captureDate ? ` • 📅 ${new Date(photo.captureDate).toLocaleDateString('fr-FR')}` : ''}
                  </p>
                  {photo.shootingIntent && (
                    <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed italic">
                      "{photo.shootingIntent}"
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0">
                <span className="inline-flex items-center text-xs font-semibold text-amber-400">
                  Afficher la fiche technique &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── LIGHTBOX NOUVELLE GÉNÉRATION AVEC RUBAN DE MINIATURES ── */}
      {lightboxIndex !== null && filteredPhotos.length > 0 && (
        <Lightbox
          photos={filteredPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          albumTitle="Photos du Carnet de Routes"
        />
      )}

      {/* ── MODALE DE PARTAGE / CODE INTÉGRATION ── */}
      {shareItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 relative text-white">
            <button
              type="button"
              onClick={() => setShareItem(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2">Partager la fiche technique</h3>
            <p className="text-xs text-gray-400 mb-4">{shareItem.title}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Lien de partage public</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareItem.url}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-white text-xs select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(shareItem.url);
                      alert('Lien copié dans le presse-papiers !');
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    Copier
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Code d'intégration HTML (Iframe)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`<iframe src="${shareItem.embedUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-white text-xs select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const code = `<iframe src="${shareItem.embedUrl}" width="100%" height="600" frameborder="0"></iframe>`;
                      navigator.clipboard.writeText(code);
                      alert("Code d'intégration copié !");
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-3 py-1.5 rounded-lg text-xs transition"
                  >
                    Copier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton Back to Top */}
      <BackToTop />
    </div>
  );
};

export default CarnetDeRoutesPage;
