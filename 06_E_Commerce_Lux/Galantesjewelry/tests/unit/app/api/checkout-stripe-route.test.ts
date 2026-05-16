/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findOrCreateCustomer: vi.fn(),
  createOrder: vi.fn(),
  getOrderDetails: vi.fn(),
  getProductVariantIdByDefaultCode: vi.fn(),
  shippingGetRates: vi.fn(),
  getSettings: vi.fn(),
  paymentIntentCreate: vi.fn(),
}));

vi.mock('@/lib/odoo/services', () => ({
  OdooService: {
    findOrCreateCustomer: mocks.findOrCreateCustomer,
    createOrder: mocks.createOrder,
    getOrderDetails: mocks.getOrderDetails,
    getProductVariantIdByDefaultCode: mocks.getProductVariantIdByDefaultCode,
  },
}));

vi.mock('@/lib/shipping/engine', () => ({
  ShippingEngine: {
    getRates: mocks.shippingGetRates,
  },
}));

vi.mock('@/lib/db', () => ({
  getSettings: mocks.getSettings,
}));

vi.mock('stripe', () => {
  class Stripe {
    paymentIntents = {
      create: mocks.paymentIntentCreate,
    };
  }

  return { default: Stripe };
});

describe('POST /api/checkout/stripe', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    mocks.getSettings.mockResolvedValue({
      shipping_cities: ['Miami'],
      restricted_shipping_cities: [],
    });
    mocks.getOrderDetails.mockResolvedValue({
      id: 0,
      amount_total: 1250,
    });
    mocks.shippingGetRates.mockResolvedValue([
      {
        carrier: 'pickup',
        serviceName: 'In-Store Pick-up (Islamorada)',
        price: 0,
        currency: 'USD',
        estimatedDays: 0,
        insuranceIncluded: true,
        insuranceValue: 2500,
      },
      {
        carrier: 'ups',
        serviceName: 'UPS Next Day Air (Secure)',
        price: 62.5,
        currency: 'USD',
        estimatedDays: 1,
        insuranceIncluded: true,
        insuranceValue: 2500,
      },
    ]);
    mocks.getProductVariantIdByDefaultCode.mockResolvedValue(9001);
  });

  it('creates an Odoo order and Stripe payment intent from valid cart data with insured shipping', async () => {
    mocks.findOrCreateCustomer.mockResolvedValue(44);
    mocks.createOrder.mockResolvedValue(55);
    mocks.getOrderDetails.mockResolvedValue({ id: 55, amount_total: 2875 });
    mocks.paymentIntentCreate.mockResolvedValue({ client_secret: 'pi_test_secret' });

    const { POST } = await import('@/app/api/checkout/stripe/route');

    const response = await POST(new Request('http://localhost/api/checkout/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            id: '12',
            product_id: '12',
            name: 'The Islamorada Solitaire',
            price: 1250,
            quantity: 2,
          },
        ],
        customerData: {
          name: 'Ana Buyer',
          email: 'ana@example.com',
          phone: '3055550100',
          street: '123 Ocean Dr',
          city: 'Miami',
          state: 'FL',
          zip: '33139',
          country: 'United States',
        },
        shippingRate: {
          carrier: 'ups',
          serviceName: 'UPS Next Day Air (Secure)',
        },
      }),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      clientSecret: 'pi_test_secret',
      orderId: 55,
      orderTotal: 2875,
      shippingRate: expect.objectContaining({
        carrier: 'ups',
        serviceName: 'UPS Next Day Air (Secure)',
        price: 62.5,
      }),
    }));

    expect(mocks.findOrCreateCustomer).toHaveBeenCalledWith({
      name: 'Ana Buyer',
      email: 'ana@example.com',
      phone: '3055550100',
      street: '123 Ocean Dr',
      city: 'Miami',
      zip: '33139',
      country: 'United States',
      state: 'FL',
    });
    expect(mocks.getProductVariantIdByDefaultCode).toHaveBeenCalledWith('GJ-SHP-001');
    expect(mocks.getOrderDetails).toHaveBeenCalledWith(55);
    expect(mocks.createOrder).toHaveBeenCalledWith(44, [
      {
        product_id: 12,
        product_uom_qty: 2,
        price_unit: 1250,
      },
      {
        product_id: 9001,
        product_uom_qty: 1,
        price_unit: 62.5,
        name: 'UPS Next Day Air (Secure)',
      },
    ]);
    expect(mocks.paymentIntentCreate).toHaveBeenCalledWith(expect.objectContaining({
      amount: 287500,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: expect.objectContaining({
        odoo_partner_id: '44',
        odoo_order_id: '55',
        customer_email: 'ana@example.com',
        shipping_carrier: 'ups',
        shipping_service_name: 'UPS Next Day Air (Secure)',
        shipping_amount: '62.50',
        tax_amount: '312.50',
        estimated_total: '2875.00',
      }),
    }));
  }, 15000);

  it('rejects cart items without a valid Odoo product id', async () => {
    const { POST } = await import('@/app/api/checkout/stripe/route');

    const response = await POST(new Request('http://localhost/api/checkout/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            id: 'fallback-item',
            name: 'Broken Product',
            price: 99,
            quantity: 1,
          },
        ],
        customerData: {
          name: 'Ana Buyer',
          email: 'ana@example.com',
          city: 'Miami',
          street: '123 Ocean Dr',
          zip: '33139',
        },
      }),
    }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'Cart item 1 is missing a valid Odoo product ID. Re-open the product from the live catalog and add it again.',
    });
    expect(mocks.createOrder).not.toHaveBeenCalled();
    expect(mocks.paymentIntentCreate).not.toHaveBeenCalled();
  }, 15000);

  it('allows boutique pickup without a shipping address', async () => {
    mocks.findOrCreateCustomer.mockResolvedValue(44);
    mocks.createOrder.mockResolvedValue(56);
    mocks.getOrderDetails.mockResolvedValue({ id: 56, amount_total: 1250 });
    mocks.paymentIntentCreate.mockResolvedValue({ client_secret: 'pi_pickup_secret' });

    const { POST } = await import('@/app/api/checkout/stripe/route');

    const response = await POST(new Request('http://localhost/api/checkout/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            id: '12',
            product_id: '12',
            name: 'The Islamorada Solitaire',
            price: 1250,
            quantity: 1,
          },
        ],
        customerData: {
          name: 'Ana Buyer',
          email: 'ana@example.com',
          phone: '3055550100',
        },
        deliveryMethod: 'pickup',
        shippingRate: {
          carrier: 'pickup',
          serviceName: 'Boutique Pick-up (Islamorada)',
        },
      }),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      clientSecret: 'pi_pickup_secret',
      orderId: 56,
      orderTotal: 1250,
      shippingRate: expect.objectContaining({
        carrier: 'pickup',
        price: 0,
      }),
    }));

    expect(mocks.shippingGetRates).not.toHaveBeenCalled();
    expect(mocks.findOrCreateCustomer).toHaveBeenCalledWith({
      name: 'Ana Buyer',
      email: 'ana@example.com',
      phone: '3055550100',
      street: undefined,
      city: undefined,
      zip: undefined,
      country: 'United States',
      state: '',
    });
    expect(mocks.createOrder).toHaveBeenCalledWith(44, [
      {
        product_id: 12,
        product_uom_qty: 1,
        price_unit: 1250,
      },
      {
        product_id: 9001,
        product_uom_qty: 1,
        price_unit: 0,
        name: 'Boutique Pick-up (Islamorada)',
      },
    ]);
    expect(mocks.paymentIntentCreate).toHaveBeenCalledWith(expect.objectContaining({
      amount: 125000,
      metadata: expect.objectContaining({
        shipping_carrier: 'pickup',
        delivery_method: 'pickup',
      }),
    }));
  }, 15000);

  it('rejects pickup rates when fulfillment method is shipping', async () => {
    const { POST } = await import('@/app/api/checkout/stripe/route');

    const response = await POST(new Request('http://localhost/api/checkout/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            id: '12',
            product_id: '12',
            price: 1250,
            quantity: 1,
          },
        ],
        customerData: {
          name: 'Ana Buyer',
          email: 'ana@example.com',
          street: '123 Ocean Dr',
          city: 'Miami',
          zip: '33139',
        },
        deliveryMethod: 'ship',
        shippingRate: {
          carrier: 'pickup',
          serviceName: 'Boutique Pick-up (Islamorada)',
        },
      }),
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Pickup must be selected as the fulfillment method.',
    });
    expect(mocks.shippingGetRates).not.toHaveBeenCalled();
    expect(mocks.createOrder).not.toHaveBeenCalled();
    expect(mocks.paymentIntentCreate).not.toHaveBeenCalled();
  }, 15000);

  it('falls back to a configured shipping variant id when Odoo lookup returns null', async () => {
    vi.stubEnv('ODOO_SHIPPING_PRODUCT_VARIANT_ID', '26');
    mocks.getProductVariantIdByDefaultCode.mockResolvedValue(null);
    mocks.findOrCreateCustomer.mockResolvedValue(44);
    mocks.createOrder.mockResolvedValue(57);
    mocks.getOrderDetails.mockResolvedValue({ id: 57, amount_total: 1312.5 });
    mocks.paymentIntentCreate.mockResolvedValue({ client_secret: 'pi_fallback_secret' });

    const { POST } = await import('@/app/api/checkout/stripe/route');

    const response = await POST(new Request('http://localhost/api/checkout/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            id: '12',
            product_id: '12',
            price: 1250,
            quantity: 1,
          },
        ],
        customerData: {
          name: 'Ana Buyer',
          email: 'ana@example.com',
          street: '123 Ocean Dr',
          city: 'Miami',
          zip: '33139',
        },
        shippingRate: {
          carrier: 'ups',
          serviceName: 'UPS Next Day Air (Secure)',
        },
      }),
    }));

    expect(response.status).toBe(200);
    expect(mocks.createOrder).toHaveBeenCalledWith(44, expect.arrayContaining([
      expect.objectContaining({ product_id: 26, price_unit: 62.5, name: 'UPS Next Day Air (Secure)' }),
    ]));
  }, 15000);
});
