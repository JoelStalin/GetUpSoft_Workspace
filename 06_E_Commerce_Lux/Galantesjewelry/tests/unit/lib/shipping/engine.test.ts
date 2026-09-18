/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getFedExRates: vi.fn(),
}));

vi.mock('@/lib/shipping/fedex', () => ({
  getFedExRates: mocks.getFedExRates,
}));

describe('ShippingEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getFedExRates.mockResolvedValue([
      {
        carrier: 'fedex',
        serviceName: 'FedEx 2Day',
        price: 48.5,
        currency: 'USD',
        estimatedDays: 2,
        insuranceIncluded: true,
        insuranceValue: 1000,
      },
    ]);
  });

  it('includes pickup, USPS, UPS, and FedEx rates in user-friendly price order', async () => {
    const { ShippingEngine } = await import('@/lib/shipping/engine');

    const rates = await ShippingEngine.getRates(
      {
        street: '123 Ocean Dr',
        city: 'Miami',
        state: 'FL',
        zip: '33139',
        country: 'United States',
      },
      {
        weightLbs: 2,
        value: 1000,
      },
    );

    expect(mocks.getFedExRates).toHaveBeenCalledWith(
      {
        street: '123 Ocean Dr',
        city: 'Miami',
        state: 'FL',
        zip: '33139',
        country: 'United States',
      },
      {
        weightLbs: 2,
        value: 1000,
      },
      15,
    );

    expect(rates.map((rate) => rate.carrier)).toEqual(['pickup', 'fedex', 'usps', 'ups']);
    expect(rates[0]).toMatchObject({
      carrier: 'pickup',
      price: 0,
    });
    expect(rates[1]).toMatchObject({
      carrier: 'fedex',
      serviceName: 'FedEx 2Day',
    });
  });
});
