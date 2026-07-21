import React, { useState, useEffect } from 'react';
import api from '../utils/api';

interface EditAlbumModalProps {
  album: any;
  onClose: () => void;
  onSave: (id: string, data: any) => void;
}

const EditAlbumModal: React.FC<EditAlbumModalProps> = ({ album, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [coverImage, setCoverImage] = useState(''); // État pour la couverture

  // Gestion des tags
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [includedTags, setIncludedTags] = useState<string[]>([]);
  const [excludedTags, setExcludedTags] = useState<string[]>([]);

  // Gestion des photos (pour la couverture)
  const [photos, setPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // 1. Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Chargement des tags
        const resTags = await api.get('/photos/tags');
        setAvailableTags(resTags.data);
      } catch (err) {
        console.error("Erreur chargement tags", err);
      }
    };
    fetchData();

    if (album) {
      setTitle(album.title || '');
      setDescription(album.description || '');
      setIsVirtual(album.isVirtual || false);
      setCoverImage(album.coverImage || '');

      // Parsing des tags existants
      if (album.filterValue) {
        const rawTags = album.filterValue.split(',').map((t: string) => t.trim()).filter((t: string) => t);
        const included = rawTags.filter((t: string) => !t.startsWith('-'));
        const excluded = rawTags.filter((t: string) => t.startsWith('-')).map((t: string) => t.substring(1));
        setIncludedTags(included);
        setExcludedTags(excluded);
      }
    }
  }, [album]);

  // 2. Charger les photos si album non virtuel (pour choix couverture)
  useEffect(() => {
    if (album && !album.isVirtual) {
      setLoadingPhotos(true);
      api.get(`/albums/photos/${album._id}`)
        .then(res => setPhotos(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoadingPhotos(false));
    }
  }, [album]);

  // 3. Gestion des tags
  const handleTagClick = (tag: string) => {
    const isIncluded = includedTags.includes(tag);
    const isExcluded = excludedTags.includes(tag);

    if (!isIncluded && !isExcluded) {
      setIncludedTags([...includedTags, tag]);
    } else if (isIncluded) {
      setIncludedTags(includedTags.filter(t => t !== tag));
      setExcludedTags([...excludedTags, tag]);
    } else {
      setExcludedTags(excludedTags.filter(t => t !== tag));
    }
  };

  // 4. Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const excludedWithDash = excludedTags.map(t => `-${t}`);
    const filterValue = [...includedTags, ...excludedWithDash].join(',');

    onSave(album._id, {
      title,
      description,
      isVirtual,
      virtualFilter: isVirtual ? 'tag' : null,
      filterValue: isVirtual ? filterValue : '',
      coverImage // On envoie la couverture sélectionnée
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white font-bold text-xl">✕</button>

        <h3 className="text-xl font-bold mb-6 text-white drop-shadow-lg">
          Modifier l'Album
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
            <input
              type="text"
              className="w-full bg-white/20 border border-white/30 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full bg-white/20 border border-white/30 text-white rounded-lg px-4 py-3 focus:outline-none h-20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Photo de couverture (Uniquement pour albums classiques) */}
          {!isVirtual && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Photo de couverture
              </label>
              {loadingPhotos ? (
                <p className="text-gray-400 text-sm">Chargement des photos...</p>
              ) : (
                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 bg-black/20 rounded-lg">
                  {photos.map((p: any) => (
                    <div
                      key={p._id}
                      onClick={() => setCoverImage(p.filename)}
                      className={`cursor-pointer rounded overflow-hidden border-2 transition ${coverImage === p.filename ? 'border-yellow-400 scale-105 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={`/uploads/${p.filename}`} alt="Thumb" className="w-full h-12 object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {coverImage && <p className="text-xs text-gray-500 mt-1">Sélectionnée : {coverImage}</p>}
            </div>
          )}

          {/* Type d'Album */}
          <div className="bg-black/20 p-4 rounded-lg border border-white/10">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isVirtual}
                onChange={(e) => setIsVirtual(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <div>
                <span className="text-white font-medium">Galerie Virtuelle</span>
                <p className="text-xs text-gray-400">Remplit automatiquement l'album selon les tags.</p>
              </div>
            </label>
          </div>

          {/* Sélection des Tags */}
          {isVirtual && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sélection des tags
              </label>
              <div className="flex gap-4 mb-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-600"></span> Neutre</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> Inclus</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> Exclu</span>
              </div>

              <div className="flex flex-wrap gap-2 p-3 bg-black/20 rounded-lg max-h-40 overflow-y-auto">
                {availableTags.length === 0 && (
                  <p className="text-gray-500 text-sm italic">Aucun tag trouvé.</p>
                )}
                {availableTags.map(tag => {
                  const isIncluded = includedTags.includes(tag);
                  const isExcluded = excludedTags.includes(tag);

                  let classes = "px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition border ";
                  if (isIncluded) {
                    classes += "bg-green-500 border-green-400 text-white";
                  } else if (isExcluded) {
                    classes += "bg-red-500 border-red-400 text-white";
                  } else {
                    classes += "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600";
                  }

                  return (
                    <button type="button" key={tag} onClick={() => handleTagClick(tag)} className={classes}>
                      {isExcluded && '− '}{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-full transition font-medium border border-white/10"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-full font-bold shadow-lg transition"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAlbumModal;
