import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSettings } from '@/lib/db';
import { getAuthenticatedCustomerFromCookies } from '@/lib/customer-auth';
import { OdooService } from '@/lib/odoo/services';
import { ShippingEngine } from '@/lib/shipping/engine';
import { validateShippingCity } from '@/lib/shipping-settings';
import type { ShippingAddress, ShippingRate } from '@/lib/shipping/types';
import { calculateTaxBreakdown } from '@/lib/tax';

export const runtime = 'nodejs';

const cartSummarySchema = z.object({
  subtotal: z.number().nonnegative(),
  itemCount: z.number().int().nonnegative().optional(),
  destination: z.object({
    street: z.string().optional().default(''),
    city: z.string().optional().default(''),
    state: z.string().optional().default(''),
    zip: z.string().optional().default(''),
    country: z.string().optional().default('United States'),
  }).optional(),
});

type CartSummaryResponse = {
  success: true;
  subtotal: number;
  shippingAvailable: boolean;
  shippingRate: ShippingRate | null;
  shippingTotal: number;
  taxRate: number;
  taxTotal: number;
  total: number;
  destination: ShippingAddress;
  source: 'customer-address' | 'store-default';
  message?: string;
};

type OdooAddressRecord = {
  type?: string | null;
  street?: string | null;
  street2?: string | null;
  city?: string | null;
  zip?: string | null;
  state_id?: [number, string] | string | null;
  country_id?: [number, string] | string | null;
};

const DEFAULT_ADDRESS: ShippingAddress = {
  street: '82681 Overseas Highway',
  city: 'Islamorada',
  state: 'FL',
  zip: '33036',
  country: 'United States',
};

function valueFromRelation(value: OdooAddressRecord['state_id'] | OdooAddressRecord['country_id']) {
  if (Array.isArray(value)) {
    return value[1] || '';
  }

  return typeof value === 'string' ? value : '';
}

function parseDefaultAddress(value?: string | null): ShippingAddress {
  if (!value) {
    return DEFAULT_ADDRESS;
  }

  const parts = value.split(',').map((chunk) => chunk.trim()).filter(Boolean);
  if (parts.length < 2) {
    return DEFAULT_ADDRESS;
  }

  const street = parts[0] || DEFAULT_ADDRESS.street;
  const cityPart = parts[1] || '';
  const stateZipMatch = cityPart.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/i);

  if (!stateZipMatch) {
    return DEFAULT_ADDRESS;
  }

  return {
    street,
    city: stateZipMatch[1].trim() || DEFAULT_ADDRESS.city,
    state: stateZipMatch[2].toUpperCase(),
    zip: stateZipMatch[3],
    country: parts[2] || DEFAULT_ADDRESS.country,
  };
}

function toShippingAddress(record: OdooAddressRecord): ShippingAddress | null {
  const street = [record.street, record.street2].filter(Boolean).join(', ').trim();
  const city = (record.city || '').trim();
  const zip = (record.zip || '').trim();
  const state = valueFromRelation(record.state_id).trim();
  const country = valueFromRelation(record.country_id).trim() || DEFAULT_ADDRESS.country;

  if (!city || !zip) {
    return null;
  }

  return {
    street: street || DEFAULT_ADDRESS.street,
    city,
    state: state || DEFAULT_ADDRESS.state,
    zip,
    country,
  };
}

async function resolveDestinationAddress(): Promise<{ address: ShippingAddress; source: CartSummaryResponse['source'] }> {
  const cookieStore = await cookies();
  const user = await getAuthenticatedCustomerFromCookies(cookieStore);
  if (user) {
    const partnerId = await OdooService.getPartnerByEmail(user.email);
    if (partnerId) {
      const addresses = (await OdooService.getPartnerAddresses(partnerId)) as OdooAddressRecord[];
      const selected = addresses.find((address) => address.type === 'delivery') || addresses[0];
      const shippingAddress = selected ? toShippingAddress(selected) : null;
      if (shippingAddress) {
        return { address: shippingAddress, source: 'customer-address' };
      }
    }
  }

  const settings = await getSettings();
  return {
    address: parseDefaultAddress(settings.contact_address),
    source: 'store-default',
  };
}

export async function POST(request: Request) {
  try {
    const payload = cartSummarySchema.parse(await request.json());
    const { subtotal } = payload;
    const settings = await getSettings();
    const { address: destination, source } = payload.destination
      ? { address: payload.destination as ShippingAddress, source: 'customer-address' as const }
      : await resolveDestinationAddress();

    const cityCheck = validateShippingCity(settings, destination.city);
    if (!cityCheck.valid) {
      return NextResponse.json({
        success: true,
        subtotal,
        shippingAvailable: false,
        shippingRate: null,
        shippingTotal: 0,
        taxRate: 0,
        taxTotal: 0,
        total: subtotal,
        destination,
        source,
        message: cityCheck.message || 'Shipping is not available for the selected city.',
      } satisfies CartSummaryResponse);
    }

    const rates = await ShippingEngine.getRates(destination, {
      weightLbs: 1,
      value: subtotal,
    });
    const shippingRate = rates.find((rate) => rate.carrier !== 'pickup') || rates[0] || null;
    const shippingTotal = shippingRate?.price || 0;
    const tax = calculateTaxBreakdown({
      subtotal,
      shippingTotal,
      destination,
    });

    return NextResponse.json({
      success: true,
      subtotal,
      shippingAvailable: true,
      shippingRate,
      shippingTotal,
      taxRate: tax.taxRate,
      taxTotal: tax.taxTotal,
      total: tax.total,
      destination,
      source,
    } satisfies CartSummaryResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid cart summary payload' }, { status: 400 });
    }

    console.error('Cart Summary API Error:', error);
    return NextResponse.json({ error: 'Failed to calculate cart summary' }, { status: 500 });
  }
}
