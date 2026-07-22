export const API_PREFIX = '/api/blog';

export const getMainAppUrl = (): string => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') return 'http://localhost';
  return `https://${hostname.replace(/^(blog\.|.*?-blog\.)/, '')}`;
};

export const getPortfolioGalleryUrl = (blogSlug: string, pageSlug: string): string => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    return `http://localhost:7090/?user=${blogSlug}&page=${pageSlug}&embed=true`;
  }
  return `https://${hostname.replace(/^(blog\.|.*?-blog\.)/, '')}/?page=${pageSlug}&embed=true`;
};
