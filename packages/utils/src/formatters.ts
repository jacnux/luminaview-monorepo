// ============================================================
// @luminaview/utils — formatters.ts
// Fonctions de formatage partagées
// ============================================================

/**
 * Formate une date au format français standard (ex: "4 septembre 2026")
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formate une date courte (ex: "04/09/2026")
 */
export const formatDateShort = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR');
};

/**
 * Nettoie une chaîne de texte
 */
export const cleanText = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.trim();
};
