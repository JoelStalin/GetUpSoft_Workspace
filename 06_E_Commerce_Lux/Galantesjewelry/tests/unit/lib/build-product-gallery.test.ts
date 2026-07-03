import { describe, expect, it } from 'vitest';
import { buildProductGallery } from '@/lib/products/build-product-gallery';

describe('buildProductGallery', () => {
  it('returns only the primary image when no gallery exists', () => {
    const images = buildProductGallery({
      name: 'Solitaire Ring',
      imageUrl: '/api/products/image?id=60&v=2',
    });

    expect(images).toHaveLength(1);
    expect(images[0]).toMatchObject({
      url: '/api/products/image?id=60&v=2',
      altText: 'Solitaire Ring',
      isPrimary: true,
      sequence: 0,
    });
  });

  it('prefers galleryImages metadata and sorts by sequence', () => {
    const images = buildProductGallery({
      name: 'Coastal Pendant',
      imageUrl: '/api/products/image?id=1&v=2',
      galleryImages: [
        { id: 3, url: '/api/products/gallery-image?id=3&v=2', altText: 'Third', sequence: 30 },
        { id: 1, url: '/api/products/gallery-image?id=1&v=2', altText: 'First', sequence: 10 },
        { id: 2, url: '/api/products/gallery-image?id=2&v=2', sequence: 20 },
      ],
    });

    expect(images.map((img) => img.url)).toEqual([
      '/api/products/image?id=1&v=2',
      '/api/products/gallery-image?id=1&v=2',
      '/api/products/gallery-image?id=2&v=2',
      '/api/products/gallery-image?id=3&v=2',
    ]);
    expect(images[2].altText).toBe('Coastal Pendant');
  });

  it('deduplicates repeated URLs', () => {
    const images = buildProductGallery({
      name: 'Mariner Band',
      imageUrl: '/img/a.webp',
      gallery: ['/img/a.webp', '/img/b.webp'],
    });

    expect(images.map((img) => img.url)).toEqual(['/img/a.webp', '/img/b.webp']);
  });
});
