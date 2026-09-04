// ============================================================
// @luminaview/utils — image.ts
// Fonctions de traitement des URLs d'images et miniatures
// ============================================================

export type PhotoSource = string | {
  filename?: string;
  url?: string;
  filepath?: string;
  path?: string;
  [key: string]: any;
} | null | undefined;

/**
 * Résout l'URL complète d'une photo originale ou couverture (accepte un nom de fichier ou un objet Photo)
 */
export const getPhotoUrl = (photo: PhotoSource): string => {
  if (!photo) return '';
  const rawPath = typeof photo === 'string' ? photo : (photo.url || photo.filename || photo.filepath || photo.path || '');
  if (!rawPath) return '';
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('/uploads/')) {
    return rawPath;
  }
  return `/uploads/${rawPath}`;
};

/**
 * Résout l'URL d'une miniature optimisée (800px) (accepte un nom de fichier ou un objet Photo)
 */
export const getThumbUrl = (photo: PhotoSource): string => {
  if (!photo) return '';
  const rawPath = typeof photo === 'string' ? photo : (photo.url || photo.filename || photo.filepath || photo.path || '');
  if (!rawPath) return '';
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }
  const cleanName = rawPath.replace(/^\/uploads\//, '');
  if (cleanName.startsWith('thumb-')) {
    return `/uploads/${cleanName}`;
  }
  return `/uploads/thumb-${cleanName}`;
};
