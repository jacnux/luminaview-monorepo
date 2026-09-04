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
 * Analyse une chaîne de durée de développement (ex: "7m 30s", "8min", "45s") en minutes et secondes
 */
export const parseDevTime = (timeStr: string | null | undefined): { min: number; sec: number } => {
  let min = 0;
  let sec = 0;
  if (timeStr) {
    const minMatch = timeStr.match(/(\d+)\s*(m|min|mn)/i);
    const secMatch = timeStr.match(/(\d+)\s*(s|sec)/i);
    if (minMatch) min = parseInt(minMatch[1], 10);
    if (secMatch) sec = parseInt(secMatch[1], 10);
    if (!minMatch && !secMatch && /^\d+$/.test(timeStr.trim())) {
      min = parseInt(timeStr.trim(), 10);
    }
  }
  return { min, sec };
};

/**
 * Nettoie une chaîne de texte
 */
export const cleanText = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.trim();
};
