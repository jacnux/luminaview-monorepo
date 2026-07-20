export const getAppUrl = (app: 'blog' | 'portfolio' | 'carnet', username: string) => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const name = username.toLowerCase();

  if (isLocal) {
    if (app === 'blog') return `http://localhost:9081/?user=${name}`;
    if (app === 'portfolio') return `http://localhost:9090/?user=${name}`;
    if (app === 'carnet') return `http://localhost:9082/?user=${name}`;
  }

  // En production
  return `https://${name}-${app}.helioscope.fr`;
};
