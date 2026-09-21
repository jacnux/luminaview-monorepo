// ============================================================
// CHAMBRE NOIRE — AlbumView.tsx
// Sprint 3 Ergonomie v3.0 (Breadcrumbs, Recherche interne, Tri, Lightbox Filmstrip, BackToTop)
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { getSubdomain } from '../utils/domain';
import Lightbox from '../components/Lightbox';
import PhotoInfoModal from '../components/PhotoInfoModal';
import Breadcrumb from '../components/Breadcrumb';
import BackToTop from '../components/BackToTop';

// ============================================================
// SOUS-COMPOSANT — Formulaire Commentaire
// ============================================================
const CommentForm = ({ photoId, onDone }: { photoId: string; onDone?: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post(`/comments/${photoId}`, { authorName: name, authorEmail: email, message });
      setStatus('ok');
      setName('');
      setEmail('');
      setMessage('');
      if (onDone) setTimeout(onDone, 1500);
    } catch {
      setStatus('error');
    }
  };

  if (status === 'ok') {
    return <p className="text-green-400 text-sm py-4 text-center font-bold">✅ Merci pour votre commentaire !</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        required
        placeholder="Votre nom *"
        value={name}
        onChange={e => setName(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400"
      />
      <input
        type="email"
        placeholder="Votre email (facultatif)"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-amber-400"
      />
      <textarea
        required
        rows={3}
        placeholder="Votre commentaire *"
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-400 text-sm resize-none focus:outline-none focus:border-amber-400"
      />
      {status === 'error' && <p className="text-red-400 text-xs font-semibold">Une erreur est survenue, réessayez.</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm py-2 rounded-xl transition disabled:opacity-50"
      >
        {status === 'sending' ? 'Envoi...' : '💬 Envoyer'}
      </button>
    </form>
  );
};

// ============================================================
// SOUS-COMPOSANT — Modale Commentaire
// ============================================================
const CommentModal = ({ photo, onClose }: { photo: any; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
    <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">💬 Commenter la photo</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <img
          src={`/uploads/thumb-${photo.filename}`}
          alt={photo.title}
          className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-white/5 border border-white/10"
        />
        <div className="min-w-0">
          <p className="font-bold truncate text-white">{photo.title || 'Sans titre'}</p>
          <p className="text-gray-400 text-xs truncate">{photo.description || 'Pas de description'}</p>
        </div>
      </div>
      <CommentForm photoId={photo._id} onDone={onClose} />
    </div>
  </div>
);

// ============================================================
// SOUS-COMPOSANT — Modale d'intégration (Embed)
// ============================================================
const EmbedModal = ({ albumId, isPublic, onClose }: { albumId: string; isPublic: boolean; onClose: () => void }) => {
  const embedUrl = `${window.location.origin}/embed/album/${albumId}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600" style="border:0; border-radius:12px; overflow:hidden;" allowfullscreen></iframe>`;
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-xl p-6 text-white animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            🔌 Intégrer cette galerie
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        
        <div className="space-y-5 overflow-y-auto max-h-[70vh] pr-1">
          {!isPublic && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-xs">
              ⚠️ <strong>Attention :</strong> Cette galerie est actuellement <strong>privée</strong>. Pour que l'intégration fonctionne publiquement, assurez-vous de la publier.
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Code d'intégration Iframe</h4>
            <div className="relative">
              <pre className="bg-black/50 p-3 rounded-xl text-xs font-mono overflow-x-auto border border-white/10 pr-20 select-all whitespace-pre-wrap break-all text-gray-300">
                {iframeCode}
              </pre>
              <button
                onClick={() => copyToClipboard(iframeCode, setCopiedIframe)}
                className="absolute right-2 top-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs px-3 py-1 rounded-lg transition"
              >
                {copiedIframe ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Lien direct de partage</h4>
            <div className="relative">
              <pre className="bg-black/50 p-3 rounded-xl text-xs font-mono overflow-x-auto border border-white/10 pr-20 select-all break-all text-gray-300">
                {embedUrl}
              </pre>
              <button
                onClick={() => copyToClipboard(embedUrl, setCopiedUrl)}
                className="absolute right-2 top-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs px-3 py-1 rounded-lg transition"
              >
                {copiedUrl ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-xl transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const AlbumView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [album, setAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [infoPhoto, setInfoPhoto] = useState<any>(null);
  const [commentPhoto, setCommentPhoto] = useState<any>(null);
  const [pendingFiles, setPendingFiles] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [photoSearchQuery, setPhotoSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'datedesc' | 'dateasc' | 'index' | 'alpha-asc' | 'alpha-desc'>('datedesc');

  const isViewer = searchParams.get('mode') === 'viewer';
  const isSlideshow = searchParams.get('mode') === 'slideshow';
  const isPublicContext = isViewer || album?.isPublic;

  useEffect(() => {
    if (!id) return;
    api.get(`/albums/${id}`).then(res => setAlbum(res.data)).catch(console.error);
    api.get(`/albums/photos/${id}`).then(res => setPhotos(res.data)).catch(console.error);
    api.get('/photos/tags').then(res => setSuggestedTags(res.data)).catch(() => {});
  }, [id]);

  // Filtrage et Tri des photos
  const filteredAndSortedPhotos = useMemo(() => {
    if (!photos.length) return [];
    let result = [...photos];

    // Recherche instantanée
    if (photoSearchQuery.trim()) {
      const q = photoSearchQuery.toLowerCase().trim();
      result = result.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q))) ||
        (p.camera || '').toLowerCase().includes(q) ||
        (p.filmStock || '').toLowerCase().includes(q)
      );
    }

    // Tri
    if (sortMode === 'datedesc')
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortMode === 'dateasc')
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortMode === 'index')
      result.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    else if (sortMode === 'alpha-asc')
      result.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'fr', { sensitivity: 'base' }));
    else if (sortMode === 'alpha-desc')
      result.sort((a, b) => (b.title || '').localeCompare(a.title || '', 'fr', { sensitivity: 'base' }));

    return result;
  }, [photos, photoSearchQuery, sortMode]);

  const hasPhotos = filteredAndSortedPhotos.length > 0;
  const canAddPhotos = !isViewer;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f, i) => ({
        file: f,
        previewUrl: URL.createObjectURL(f),
        title: f.name,
        description: '',
        index: pendingFiles.length + i + 1,
        isCover: false,
        tag: '',
        applyWatermark: false,
        watermarkText: '',
      }));
      setPendingFiles([...pendingFiles, ...newFiles]);
    }
  };

  const handleSetCover = (indexToSet: number) => {
    setPendingFiles(pendingFiles.map((pf, i) => ({ ...pf, isCover: i === indexToSet })));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const formData = new FormData();
    pendingFiles.forEach(pf => formData.append('photos', pf.file));
    formData.append('albumId', id);
    formData.append('metadata', JSON.stringify(
      pendingFiles.map(pf => ({
        index: pf.index,
        title: pf.title,
        description: pf.description,
        isCover: pf.isCover,
        originalName: pf.file.name,
        tag: pf.tag,
        applyWatermark: pf.applyWatermark,
        watermarkText: pf.watermarkText,
      }))
    ));
    try {
      setUploadProgress(1);
      await api.post('/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: progressEvent => {
          if (progressEvent.total)
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });
      setUploadProgress(100);
      setTimeout(() => { setPendingFiles([]); setUploadProgress(0); }, 1000);
      const response = await api.get(`/albums/photos/${id}`);
      setPhotos(response.data);
    } catch (err: any) {
      setUploadProgress(0);
      alert('Erreur upload: ' + (err.response?.data?.error || err.message));
    }
  };

  const removePendingFile = (indexToRemove: number) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== indexToRemove));
  };

  const handleShare = (photo: any) => {
    const webpFilename = photo.filename ? photo.filename.replace(/\.(jpg|jpeg|png)$/i, '.webp') : '';
    const shareUrl = `${window.location.origin}/uploads/${webpFilename}`;
    if (navigator.share) {
      navigator.share({ title: photo.title || 'Photo', url: shareUrl }).catch(console.error);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => alert('Lien photo copié !'));
    } else {
      alert('Lien : ' + shareUrl);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Supprimer cette photo ?')) return;
    await api.delete(`/photos/${photoId}`);
    setPhotos(photos.filter(p => p._id !== photoId));
  };

  if (isSlideshow && photos.length > 0) {
    return (
      <div className="w-full h-screen bg-black">
        <Lightbox
          photos={filteredAndSortedPhotos}
          initialIndex={0}
          onClose={() => navigate(`/album/${id}?mode=viewer`, { state: location.state })}
          albumTitle={album?.title}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gray-950 text-white animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Fil d'Ariane */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Breadcrumb
            items={[
              { label: 'Carnet de Routes', to: '/' },
              { label: album?.title || 'Album', isCurrent: true },
            ]}
            className="mb-0"
          />

          {!isViewer && (
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full transition"
            >
              ⚙️ Tableau de bord
            </Link>
          )}
        </div>

        {/* En-tête de l'Album */}
        <div className="border rounded-2xl bg-gray-900/70 border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">
                  {album ? album.title : 'Chargement...'}
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                  {photos.length} photo{photos.length > 1 ? 's' : ''}
                </span>
                {album?.isPublic && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-bold">
                    Public
                  </span>
                )}
              </div>
              {album?.description && (
                <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
                  {album.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => setShowEmbedModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition border border-white/10 flex items-center gap-1.5"
              >
                <span>🔌</span>
                <span>Intégrer</span>
              </button>

              {photos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <span>▶</span>
                  <span>Diaporama</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Zone Upload si mode admin */}
        {canAddPhotos && pendingFiles.length > 0 && (
          <div className="bg-gray-900 border border-white/15 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-white">Photos à envoyer ({pendingFiles.length})</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              {pendingFiles.map((pf, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start border-b border-white/10 pb-4">
                  <div className="w-full sm:w-auto flex justify-center relative">
                    <img src={pf.previewUrl} className="w-24 h-24 object-cover bg-white/5 rounded-xl border border-white/10" alt="Aperçu" />
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      className={`absolute top-0 right-0 w-6 h-6 flex items-center justify-center rounded-full text-sm shadow transition ${
                        pf.isCover ? 'bg-amber-400 text-black scale-110 font-bold' : 'bg-black/60 text-white hover:bg-black'
                      }`}
                      title="Définir couverture"
                    >
                      ★
                    </button>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="#"
                        value={pf.index}
                        onChange={e => { const n = [...pendingFiles]; n[idx].index = parseInt(e.target.value); setPendingFiles(n); }}
                        className="bg-white/5 border border-white/10 p-2 w-16 text-center text-sm text-white rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Titre"
                        value={pf.title}
                        onChange={e => { const n = [...pendingFiles]; n[idx].title = e.target.value; setPendingFiles(n); }}
                        className="bg-white/5 border border-white/10 p-2 w-full text-sm text-white rounded-xl placeholder-gray-500"
                      />
                    </div>
                    <input
                      list="tag-suggestions"
                      type="text"
                      placeholder="Tags (ex: portrait, paysage)"
                      value={pf.tag}
                      onChange={e => { const n = [...pendingFiles]; n[idx].tag = e.target.value; setPendingFiles(n); }}
                      className="bg-white/5 border border-white/10 p-2 w-full text-sm text-white rounded-xl placeholder-gray-500"
                    />
                    <datalist id="tag-suggestions">
                      {suggestedTags.map((tag, i) => <option key={i} value={tag} />)}
                    </datalist>
                    <input
                      type="text"
                      placeholder="Description"
                      value={pf.description}
                      onChange={e => { const n = [...pendingFiles]; n[idx].description = e.target.value; setPendingFiles(n); }}
                      className="bg-white/5 border border-white/10 p-2 w-full text-sm text-white rounded-xl placeholder-gray-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingFile(idx)}
                    className="text-red-400 hover:text-red-300 font-bold text-2xl px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              {uploadProgress > 0 && (
                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden border border-white/10">
                  <div
                    className="bg-amber-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <button type="submit" className="w-full bg-amber-500 text-gray-950 py-3 rounded-xl hover:bg-amber-400 font-bold transition">
                Valider l'envoi
              </button>
            </form>
          </div>
        )}

        {/* ── BARRE D'ACTIONS, RECHERCHE ET TRI ── */}
        {photos.length > 0 && (
          <div className="border rounded-2xl bg-gray-900/90 border-white/10 p-3 sm:p-4 backdrop-blur-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-3">
            {/* Recherche interne */}
            <div className="relative w-full md:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Rechercher une photo..."
                value={photoSearchQuery}
                onChange={(e) => setPhotoSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 transition"
              />
              {photoSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPhotoSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Outils et Modes d'affichage */}
            <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end w-full md:w-auto">
              {canAddPhotos && (
                <label className="bg-green-600/80 hover:bg-green-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition flex items-center gap-1">
                  <span>+</span>
                  <span>Ajouter</span>
                  <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                </label>
              )}

              {/* Mode d'affichage Grille / Liste */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grille"
                >
                  Grille
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                    viewMode === 'list' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Liste"
                >
                  Liste
                </button>
              </div>

              {/* Tri A→Z / Z→A */}
              <button
                type="button"
                onClick={() => setSortMode(prev => (prev === 'alpha-asc' ? 'alpha-desc' : 'alpha-asc'))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  sortMode === 'alpha-asc' || sortMode === 'alpha-desc'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-gray-400 hover:text-white border-white/10'
                }`}
                title={sortMode === 'alpha-asc' ? 'Basculer Z→A' : 'Trier A→Z'}
              >
                {sortMode === 'alpha-asc' ? '🔤 Z→A' : '🔤 A→Z'}
              </button>
            </div>
          </div>
        )}

        {/* État vide si recherche infructueuse */}
        {photoSearchQuery && !hasPhotos && (
          <div className="text-center py-16 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6">
            <p className="text-gray-400 text-sm">
              Aucune photo ne correspond à « <strong className="text-amber-400">{photoSearchQuery}</strong> ».
            </p>
            <button
              type="button"
              onClick={() => setPhotoSearchQuery('')}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition"
            >
              Effacer la recherche
            </button>
          </div>
        )}

        {/* Grille / Liste Photos */}
        {hasPhotos && (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'
            : 'space-y-3'
          }>
            {filteredAndSortedPhotos.map((photo, idx) =>
              viewMode === 'grid' ? (
                <div
                  key={photo._id || idx}
                  className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-amber-500/40 transition-all duration-300 shadow-md"
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img
                    src={`/uploads/thumb-${photo.filename}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={photo.title || 'Photo'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
                    <span className="text-white text-xs sm:text-sm font-bold truncate drop-shadow-md">{photo.title || 'Sans titre'}</span>
                    {Array.isArray(photo.tags) && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {photo.tags.slice(0, 2).map((tag: string, tIdx: number) => (
                          <span key={tIdx} className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setCommentPhoto(photo); }}
                      className="w-7 h-7 bg-black/70 hover:bg-amber-500 hover:text-black rounded-full text-white flex items-center justify-center text-xs border border-white/15 backdrop-blur-md transition"
                      title="Commenter"
                    >
                      💬
                    </button>
                    {!isViewer && (
                      <>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setInfoPhoto(photo); }}
                          className="w-7 h-7 bg-black/70 hover:bg-white/30 rounded-full text-white flex items-center justify-center text-xs border border-white/15 backdrop-blur-md transition"
                          title="Détails"
                        >
                          i
                        </button>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); handleShare(photo); }}
                          className="w-7 h-7 bg-black/70 hover:bg-white/30 rounded-full text-white flex items-center justify-center text-xs border border-white/15 backdrop-blur-md transition"
                          title="Partager"
                        >
                          🔗
                        </button>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); handleDeletePhoto(photo._id); }}
                          className="w-7 h-7 bg-black/70 hover:bg-red-500 rounded-full text-white flex items-center justify-center text-xs border border-white/15 backdrop-blur-md transition"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={photo._id || idx}
                  className="bg-gray-900 border border-white/10 rounded-xl p-3 flex items-center gap-4 hover:border-amber-500/30 transition group"
                >
                  <div
                    className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 cursor-pointer border border-white/10"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img src={`/uploads/thumb-${photo.filename}`} loading="lazy" decoding="async" alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setLightboxIndex(idx)}>
                    <h3 className="font-bold text-white text-sm truncate">{photo.title || 'Sans titre'}</h3>
                    <p className="text-xs text-gray-400 truncate">{photo.description || 'Pas de description'}</p>
                    {Array.isArray(photo.tags) && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {photo.tags.map((tag: string, tIdx: number) => (
                          <span key={tIdx} className="text-amber-400/80 text-[10px]">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCommentPhoto(photo)}
                      className="text-xs text-gray-400 hover:text-amber-400 transition"
                      title="Commenter"
                    >
                      💬
                    </button>
                    {!isViewer && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo._id)}
                        className="text-xs text-red-400 hover:text-red-300 transition"
                      >
                        Suppr.
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* MODALES & LIGHTBOX */}
        {infoPhoto && <PhotoInfoModal photo={infoPhoto} onClose={() => setInfoPhoto(null)} />}
        {lightboxIndex !== null && (
          <Lightbox
            photos={filteredAndSortedPhotos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            albumTitle={album?.title}
          />
        )}
        {commentPhoto && <CommentModal photo={commentPhoto} onClose={() => setCommentPhoto(null)} />}
        {showEmbedModal && id && <EmbedModal albumId={id} isPublic={album?.isPublic} onClose={() => setShowEmbedModal(false)} />}
      </div>

      {/* Bouton BackToTop */}
      <BackToTop />
    </div>
  );
};

export default AlbumView;
