import React from 'react';

interface SkeletonGridProps {
  count?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 6 }) => {
  return (
    <div className="masonry-grid" aria-label="Chargement du contenu">
      {Array.from({ length: count }).map((_, idx) => {
        // Diversifier la hauteur simulée pour imiter une grille Masonry
        const heightStyles = ['220px', '320px', '260px', '300px', '240px', '280px'];
        const height = heightStyles[idx % heightStyles.length];

        return (
          <div
            key={idx}
            className="glass-card animate-shimmer"
            style={{
              height,
              borderRadius: 'var(--radius-lg, 14px)',
              marginBottom: '1.5rem',
              overflow: 'hidden',
            }}
          />
        );
      })}
    </div>
  );
};

export default SkeletonGrid;
