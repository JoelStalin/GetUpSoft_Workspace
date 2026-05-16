import type { ShippingAddress } from '@/lib/shipping/types';

export type TaxDestination = Pick<ShippingAddress, 'country' | 'state' | 'city' | 'zip'> & {
  street?: string;
};

export type TaxBreakdown = {
  taxRate: number;
  taxTotal: number;
  total: number;
};

type TaxInput = {
  subtotal: number;
  shippingTotal?: number;
  destination?: Partial<TaxDestination> | null;
};

function normalize(value?: string | null) {
  return (value || '').trim().toLowerCase();
}

function normalizeState(value?: string | null) {
  return (value || '').trim().toLowerCase();
}

function isDominicanRepublic(country: string) {
  return [
    'dominican republic',
    'republica dominicana',
    'república dominicana',
    'rd',
    'do',
  ].includes(country);
}

function isUnitedStates(country: string) {
  return [
    'united states',
    'united states of america',
    'usa',
    'us',
    'u.s.',
    'u.s.a.',
  ].includes(country);
}

export function calculateTaxBreakdown({ subtotal, shippingTotal = 0, destination }: TaxInput): TaxBreakdown {
  const country = normalize(destination?.country);
  const state = normalizeState(destination?.state);
  const taxableAmount = subtotal + shippingTotal;

  let taxRate = 0;

  if (isDominicanRepublic(country)) {
    taxRate = 0.18;
  } else if (isUnitedStates(country) && (state === 'fl' || state === 'florida')) {
    taxRate = 0.07;
  }

  const taxTotal = Math.round(taxableAmount * taxRate * 100) / 100;
  const total = Math.round((taxableAmount + taxTotal) * 100) / 100;

  return {
    taxRate,
    taxTotal,
    total,
  };
}
