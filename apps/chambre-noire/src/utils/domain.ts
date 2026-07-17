// frontend/src/utils/domain.ts

// Adapter ceci selon ton environnement
// En prod: helioscope.fr
// En dev: local.luminaview (si utilisé dans /etc/hosts)

const MAIN_DOMAIN = 'helioscope.fr';

export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;

  // 1. Cas Localhost simple (on ignore, mode dashboard)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }

  // 2. Cas Production / Simu DNS
  // On cherche si le hostname finit par .helioscope.fr (ou ton domaine)
  if (hostname.endsWith(`.${MAIN_DOMAIN}`)) {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      if (subdomain.endsWith('-carnet')) {
        return subdomain.replace('-carnet', '');
      }
      return subdomain;
    }
  }

  // 3. Cas particulier pour le dev local avec /etc/hosts
  // Ex: jac.local.luminaview -> On extrait 'jac'
  if (hostname.endsWith('.local.luminaview')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) return parts[0];
  }

  return null;
};
