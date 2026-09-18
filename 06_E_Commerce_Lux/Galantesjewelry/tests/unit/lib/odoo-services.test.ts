/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  call: vi.fn(),
}));

vi.mock('@/src/config/odooClient', () => ({
  createOdooClient: () => ({
    call: mocks.call,
  }),
}));

describe('OdooService product lookup', () => {
  it('resolves a variant id from the product template fallback first', async () => {
    mocks.call.mockImplementation(async (model: string, method: string) => {
      if (model === 'product.template' && method === 'search_read') {
        return [
          {
            id: 26,
            product_variant_id: [26, '[GJ-SHP-001] Galantes Secure Shipping'],
          },
        ];
      }

      return [];
    });

    const { OdooService } = await import('@/lib/odoo/services');
    await expect(OdooService.getProductVariantIdByDefaultCode('GJ-SHP-001')).resolves.toBe(26);
  });

  it('falls back to product.product when the template relation is unavailable', async () => {
    mocks.call.mockImplementation(async (model: string, method: string) => {
      if (model === 'product.template' && method === 'search_read') {
        return [];
      }

      if (model === 'product.product' && method === 'search_read') {
        return [{ id: 28 }];
      }

      return [];
    });

    const { OdooService } = await import('@/lib/odoo/services');
    await expect(OdooService.getProductVariantIdByDefaultCode('GJ-TEST-001')).resolves.toBe(28);
  });
});
