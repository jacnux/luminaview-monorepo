// frontend/src/utils/domain.ts

// Adapter ceci selon ton environnement
// En prod: helioscope.fr
// En dev: local.luminaview (si utilisé dans /etc/hosts)

const MAIN_DOMAIN = 'helioscope.fr';

export const getUserSlug = (): string => {
  // 1. Priorité absolue aux paramètres d'URL (?user=xxx ou ?u=xxx)
  const params = new URLSearchParams(window.location.search);
  const queryUser = params.get('u') || params.get('user');
  if (queryUser) return queryUser.trim().toLowerCase();

  const hostname = window.location.hostname;

  // 2. Cas Localhost simple
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'jac';
  }

  // 3. Cas Production / DNS (*.helioscope.fr ou *.luminaview.fr)
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

  // 4. Cas particulier pour le dev local avec /etc/hosts
  if (hostname.endsWith('.local.luminaview')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) return parts[0].toLowerCase();
  }

  return 'jac';
};

export const getSubdomain = (): string | null => {
  return getUserSlug();
};
