export const getAppUrl = (app: 'blog' | 'portfolio' | 'grimoire' | 'carnet', username: string) => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const name = username ? username.toLowerCase() : 'jac';

  if (isLocal) {
    if (app === 'blog') return `http://localhost:7081/?user=${name}`;
    if (app === 'portfolio') return `http://localhost:7090/?user=${name}`;
    if (app === 'grimoire') return `http://localhost:7091/?user=${name}`;
    if (app === 'carnet') return `http://localhost:7082/?user=${name}`;
  }

  // En production
  if (app === 'blog') return `https://${name}-blog.helioscope.fr`;
  if (app === 'grimoire') return `https://${name}-grimoire.helioscope.fr`;
  if (app === 'carnet') return `https://${name}-carnet.helioscope.fr`;
  return `https://${name}.helioscope.fr`;
};

export const getVitrineUrl = (user: { blogTheme?: string; name?: string; username?: string }) => {
  const name = user.name || user.username || 'jac';
  if (user.blogTheme === 'grimoire') {
    return getAppUrl('grimoire', name);
  }
  return getAppUrl('portfolio', name);
};
