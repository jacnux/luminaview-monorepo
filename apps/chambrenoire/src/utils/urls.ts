import { getUserSlug } from './domain';

export const getPortfolioUrl = (username?: string, blogTheme?: string): string => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const name = (username || getUserSlug() || 'jac').toLowerCase();

  if (blogTheme === 'grimoire') {
    return isLocal
      ? `http://localhost:7091/?user=${name}`
      : `https://${name}-grimoire.helioscope.fr`;
  }

  return isLocal
    ? `http://localhost:7090/?user=${name}`
    : `https://${name}.helioscope.fr`;
};

export const getBlogUrl = (username?: string): string => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const name = (username || getUserSlug() || 'jac').toLowerCase();
  return isLocal
    ? `http://localhost:7081/?user=${name}`
    : `https://${name}-blog.helioscope.fr`;
};

export const getManagerUrl = (path: string = ''): string => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return isLocal ? `http://localhost:7080${cleanPath}` : `https://luminaview.fr${cleanPath}`;
};
