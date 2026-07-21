export const getAppUrl = (app: 'blog' | 'portfolio' | 'carnet', username: string) => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const name = username.toLowerCase();

  if (isLocal) {
    if (app === 'blog') return `http://localhost:7081/?user=${name}`;
    if (app === 'portfolio') return `http://localhost:7090/?user=${name}`;
    if (app === 'carnet') return `http://localhost:7082/?user=${name}`;
  }

  // En production
  if (app === 'blog') return `https://${name}-blog.helioscope.fr`;
  if (app === 'carnet') return `https://${name}-carnet.helioscope.fr`;
  return `https://${name}.helioscope.fr`;
};
