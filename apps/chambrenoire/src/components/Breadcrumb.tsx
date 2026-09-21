import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserSlug } from '../utils/domain';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const location = useLocation();
  const userSlug = getUserSlug();
  const searchParams = new URLSearchParams(location.search);
  const fromBlog = searchParams.get('from') === 'blog';

  const formatUrl = (to?: string) => {
    if (!to) return '#';
    const params = new URLSearchParams();
    if (userSlug) params.set('user', userSlug);
    if (fromBlog) params.set('from', 'blog');
    const queryString = params.toString();
    return queryString ? `${to}${to.includes('?') ? '&' : '?'}${queryString}` : to;
  };

  return (
    <nav aria-label="Fil d'Ariane" className={`flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-gray-400 mb-6 ${className}`}>
      <Link
        to={formatUrl('/')}
        className="flex items-center gap-1 text-gray-400 hover:text-amber-400 transition-colors font-medium"
      >
        <span className="text-amber-500/90 text-sm">🏛️</span>
        <span>Chambre Noire</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1 || item.isCurrent;
        return (
          <React.Fragment key={idx}>
            <span className="text-gray-600 select-none font-bold">/</span>
            {isLast || !item.to ? (
              <span className="text-amber-400 font-semibold truncate max-w-[200px] sm:max-w-[320px]" title={item.label}>
                {item.label}
              </span>
            ) : (
              <Link
                to={formatUrl(item.to)}
                className="text-gray-300 hover:text-amber-400 transition-colors font-medium truncate max-w-[150px] sm:max-w-[240px]"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
