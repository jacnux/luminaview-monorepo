import React from 'react';

const PhotoInfoModal = ({ photo, onClose }: { photo: any, onClose: () => void }) => {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/20 rounded-xl max-w-md w-full p-6 relative text-white" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl">&times;</button>

        <h3 className="text-xl font-bold mb-4">Infos Photo</h3>
        <img src={`/uploads/${photo.filename}`} alt="" className="w-full h-48 object-cover rounded-lg mb-4 bg-black"/>

        <div className="space-y-2 text-sm max-h-[60vh] overflow-y-auto pr-1">
          <p><strong>Titre:</strong> {photo.title || 'N/A'}</p>
          {photo.description && <p><strong>Description:</strong> {photo.description}</p>}
          <p><strong>Tags:</strong> {photo.tags?.length ? photo.tags.join(', ') : 'Aucun'}</p>
          <p><strong>Type:</strong> <span className={photo.isAnalog ? "text-amber-400 font-semibold" : "text-blue-400 font-semibold"}>{photo.isAnalog ? '🎞️ Argentique' : '⚡ Numérique'}</span></p>

          {(photo.exposureSettings?.aperture || photo.exposureSettings?.shutterSpeed || photo.exposureSettings?.iso || photo.exposureSettings?.focalLength) && (
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 my-2 space-y-1 text-xs">
              <span className="font-bold text-yellow-500 block mb-1">📸 Paramètres EXIF / Prise de vue :</span>
              {photo.exposureSettings?.aperture && <p>• Ouverture : {photo.exposureSettings.aperture}</p>}
              {photo.exposureSettings?.shutterSpeed && <p>• Vitesse : {photo.exposureSettings.shutterSpeed}</p>}
              {photo.exposureSettings?.iso && <p>• ISO : {photo.exposureSettings.iso}</p>}
              {photo.exposureSettings?.focalLength && <p>• Focale : {photo.exposureSettings.focalLength}</p>}
            </div>
          )}

          {photo.location && <p><strong>Lieu :</strong> {photo.location}</p>}
          {photo.captureDate && <p><strong>Prise de vue :</strong> {new Date(photo.captureDate).toLocaleDateString()}</p>}
          <p className="text-gray-400 text-xs pt-1"><strong>Ajoutée le :</strong> {new Date(photo.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoInfoModal;
