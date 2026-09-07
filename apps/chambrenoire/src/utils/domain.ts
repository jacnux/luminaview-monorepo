// frontend/src/utils/domain.ts

// Adapter ceci selon ton environnement
// En prod: helioscope.fr
// En dev: local.luminaview (si utilisé dans /etc/hosts)

const MAIN_DOMAIN = 'helioscope.fr';

export const getUserSlug = (): string => {
  // 1. Priorité absolue aux paramètres d'URL (?user=xxx ou ?u=xxx)
  const params = new URLSearchParams(window.location.search);
  const queryUser = params.get('u') || params.get('user');
  if (queryUser) {
    const slug = queryUser.trim().toLowerCase();
    try {
      sessionStorage.setItem('chambrenoire_current_user', slug);
    } catch (e) {}
    return slug;
  }

  // 2. Vérifier si un utilisateur était actif dans la session courante (pour navigation localhost)
  try {
    const stored = sessionStorage.getItem('chambrenoire_current_user');
    if (stored) return stored;
  } catch (e) {}

  const hostname = window.location.hostname;

  // 3. Cas Localhost simple (repli sur jac si aucune session trouvée)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'jac';
  }

  // 4. Cas Production / DNS (*.helioscope.fr ou *.luminaview.fr)
  if (hostname.endsWith(`.${MAIN_DOMAIN}`) || hostname.endsWith('.luminaview.fr')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      if (subdomain.endsWith('-carnet')) {
        return subdomain.replace('-carnet', '').toLowerCase();
      }
      return subdomain.toLowerCase();
    }
  }

  // 5. Cas particulier pour le dev local avec /etc/hosts
  if (hostname.endsWith('.local.luminaview')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) return parts[0].toLowerCase();
  }

  return 'jac';
};

export const getSubdomain = (): string | null => {
  return getUserSlug();
};
