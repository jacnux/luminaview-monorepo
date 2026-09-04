import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Lightbox } from '../Lightbox';

describe('Lightbox Component', () => {
  const mockPhotos: any[] = [
    { _id: '1', title: 'Photo 1', filename: 'photo1.webp', description: 'Belle photo 1' },
    { _id: '2', title: 'Photo 2', filename: 'photo2.webp', description: 'Belle photo 2' }
  ];

  it('renders correctly with current photo', () => {
    const handleClose = vi.fn();
    render(
      <Lightbox
        photos={mockPhotos}
        initialIndex={0}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('1 / 2')).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Lightbox
        photos={mockPhotos}
        initialIndex={0}
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByTitle('Fermer (Échap)');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
