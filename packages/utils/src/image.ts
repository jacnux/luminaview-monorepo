// ============================================================
// @luminaview/utils — image.ts
// Fonctions de traitement des URLs d'images et miniatures
// ============================================================

/**
 * Résout l'URL complète d'une photo originale ou couverture
 */
export const getPhotoUrl = (filename: string | null | undefined): string => {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/uploads/')) {
    return filename;
  }
  return `/uploads/${filename}`;
};

/**
 * Résout l'URL d'une miniature optimisée (800px)
 */
export const getThumbUrl = (filename: string | null | undefined): string => {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  const cleanName = filename.replace(/^\/uploads\//, '');
  if (cleanName.startsWith('thumb-')) {
    return `/uploads/${cleanName}`;
  }
  return `/uploads/thumb-${cleanName}`;
};
