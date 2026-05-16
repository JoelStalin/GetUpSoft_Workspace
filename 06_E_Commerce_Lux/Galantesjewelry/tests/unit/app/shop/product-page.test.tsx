/**
 * @vitest-environment node
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getProductBySlug: vi.fn(),
  getRelatedProducts: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('next/navigation', () => ({
  notFound: mocks.notFound,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/lib/odoo/client', () => ({
  getOdooClient: () => ({
    getProductBySlug: mocks.getProductBySlug,
    getRelatedProducts: mocks.getRelatedProducts,
  }),
}));

vi.mock('@/components/shop/ProductGallery', () => ({
  ProductGallery: () => <div data-testid="gallery-mock" />,
}));

vi.mock('@/components/shop/ProductCTA', () => ({
  ProductCTA: () => <button>Mock CTA</button>,
}));

vi.mock('@/components/shop/ProductGrid', () => ({
  ProductGrid: () => <div data-testid="grid-mock" />,
}));

describe('shipping demo product page', () => {
  it('shows a shipping calculation confirmation note for the demo product', async () => {
    mocks.getProductBySlug.mockResolvedValue({
      id: 11,
      slug: 'shipping-calculation-demo-pendant',
      name: 'Shipping Calculation Demo Pendant',
      tagline: 'Ready-to-ship pendant for previewing live shipping rates',
      shortDescription: 'Add this pendant to the cart to preview live shipping calculations.',
      longDescription: 'Demo product for shipping validation.',
      productDetails: 'Metal: 14K Yellow Gold',
      careAndShipping: 'Designed as a storefront demo item for customer portal testing.',
      price: 1250,
      currency: 'USD',
      availability: 'in_stock',
      imageUrl: '/api/products/image?id=11',
      gallery: [],
      sku: 'GJ-DEMO-001',
      category: 'Ready to Ship',
      material: 'gold_14k',
      isFeatured: true,
    });
    mocks.getRelatedProducts.mockResolvedValue([]);

    const { default: ProductPage } = await import('@/app/shop/[slug]/page');
    const element = await ProductPage({
      params: Promise.resolve({ slug: 'shipping-calculation-demo-pendant' }),
    } as never);

    const html = renderToStaticMarkup(element as React.ReactElement);

    expect(html).toContain('Shipping Check');
    expect(html).toContain('FedEx, UPS, USPS, and boutique pickup');
    expect(html).toContain('Mock CTA');
  });
});
