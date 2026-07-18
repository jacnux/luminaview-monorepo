export const getAppUrl = (app: 'blog' | 'portfolio' | 'carnet', username: string) => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const name = username.toLowerCase();

  if (isLocal) {
    if (app === 'blog') return `http://localhost:8081/?user=${name}`;
    if (app === 'portfolio') return `http://localhost:8090/?user=${name}`;
    if (app === 'carnet') return `http://localhost:8082/?user=${name}`;
  }

  // En production
  if (app === 'portfolio') {
    return `https://helioscope.fr/portfolio/${name}`;
  }
  return `https://${name}-${app}.helioscope.fr`;
};
