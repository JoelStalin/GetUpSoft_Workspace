import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductGallery } from '@/components/shop/ProductGallery';

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: Record<string, unknown>) => <img alt={String(alt || '')} {...props} />,
}));

describe('ProductGallery', () => {
  it('renders navigation controls when multiple images exist', () => {
    render(
      <ProductGallery
        mainImage="/api/products/image?id=1&v=2"
        galleryImages={[
          { id: 10, url: '/api/products/gallery-image?id=10&v=2', altText: 'Detail one', sequence: 10 },
          { id: 11, url: '/api/products/gallery-image?id=11&v=2', altText: 'Detail two', sequence: 20 },
        ]}
        productName="Test Pendant"
      />,
    );

    expect(screen.getByRole('button', { name: /previous image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next image/i })).toBeInTheDocument();
    expect(screen.getByText(/image 1 of 3/i)).toBeInTheDocument();
  });

  it('opens zoom dialog and navigates to the next image', () => {
    render(
      <ProductGallery
        mainImage="/api/products/image?id=1&v=2"
        galleryImages={[
          { id: 10, url: '/api/products/gallery-image?id=10&v=2', altText: 'Detail one', sequence: 10 },
          { id: 11, url: '/api/products/gallery-image?id=11&v=2', altText: 'Detail two', sequence: 20 },
        ]}
        productName="Test Pendant"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /zoom image/i }));
    expect(screen.getByRole('dialog', { name: /product image zoom/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next image in zoom/i }));
    expect(screen.getAllByText(/image 2 of 3/i).length).toBeGreaterThan(0);
  });

  it('shows a hover magnifier on the main image', () => {
    render(
      <ProductGallery
        mainImage="/api/products/image?id=1&v=2"
        galleryImages={[
          { id: 10, url: '/api/products/gallery-image?id=10&v=2', altText: 'Detail one', sequence: 10 },
        ]}
        productName="Test Pendant"
      />,
    );

    const stage = screen.getByTestId('product-gallery-main-image');
    fireEvent.mouseEnter(stage);
    fireEvent.mouseMove(stage, { clientX: 180, clientY: 180 });

    const magnifier = screen.getByTestId('product-image-magnifier');
    expect(magnifier).toBeInTheDocument();
    expect(magnifier).toHaveStyle({
      backgroundRepeat: 'no-repeat',
    });
    expect(magnifier.style.backgroundImage).toContain('/api/products/image?id=1&v=2');
  });
});
