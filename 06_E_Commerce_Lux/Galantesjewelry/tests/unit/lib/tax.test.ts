import { describe, expect, it } from 'vitest';
import { calculateTaxBreakdown } from '@/lib/tax';

describe('calculateTaxBreakdown', () => {
  it('applies Florida tax based on the shipping destination', () => {
    const tax = calculateTaxBreakdown({
      subtotal: 100,
      shippingTotal: 25,
      destination: {
        country: 'United States',
        state: 'Florida',
        city: 'Miami',
        zip: '33139',
      },
    });

    expect(tax.taxRate).toBe(0.07);
    expect(tax.taxTotal).toBe(8.75);
    expect(tax.total).toBe(133.75);
  });

  it('applies Dominican Republic tax for DR destinations', () => {
    const tax = calculateTaxBreakdown({
      subtotal: 200,
      shippingTotal: 0,
      destination: {
        country: 'República Dominicana',
        state: 'Santo Domingo',
        city: 'Santo Domingo',
        zip: '10101',
      },
    });

    expect(tax.taxRate).toBe(0.18);
    expect(tax.taxTotal).toBe(36);
    expect(tax.total).toBe(236);
  });

  it('returns no tax for other destinations', () => {
    const tax = calculateTaxBreakdown({
      subtotal: 200,
      shippingTotal: 10,
      destination: {
        country: 'Canada',
        state: 'ON',
        city: 'Toronto',
        zip: 'M5V 2T6',
      },
    });

    expect(tax.taxRate).toBe(0);
    expect(tax.taxTotal).toBe(0);
    expect(tax.total).toBe(210);
  });
});
