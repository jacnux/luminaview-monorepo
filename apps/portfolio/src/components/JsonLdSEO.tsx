import React from 'react';
import type { UserProfile, Album, Photo } from '../types';

interface JsonLdSEOProps {
  profile?: UserProfile | null;
  currentAlbum?: Album | null;
  photos?: Photo[];
}

export const JsonLdSEO: React.FC<JsonLdSEOProps> = ({
  profile,
  currentAlbum,
  photos = []
}) => {
  const authorName = profile?.name || 'LuminaView Photographe';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://luminaview.local';

  // 1. Schema.org Person (Photographe / Auteur)
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorName,
    jobTitle: 'Photographe',
    description: profile?.tagline || profile?.bio || 'Photographe d\'art et auteur d\'expositions.',
    image: profile?.avatar ? `${siteUrl}/uploads/${profile.avatar}` : undefined,
    url: siteUrl
  };

  // 2. Schema.org PhotographCollection (Galerie / Album actuel)
  const collectionSchema = currentAlbum ? {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: currentAlbum.title,
    description: currentAlbum.description || `Galerie photo : ${currentAlbum.title}`,
    author: {
      '@type': 'Person',
      name: authorName
    },
    image: photos.slice(0, 10).map(p => ({
      '@type': 'ImageObject',
      name: p.title || currentAlbum.title,
      description: p.description || '',
      contentUrl: `${siteUrl}/uploads/${p.filename}`,
      thumbnailUrl: `${siteUrl}/uploads/thumb-${p.filename}`
    }))
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}
    </>
  );
};

export default JsonLdSEO;
