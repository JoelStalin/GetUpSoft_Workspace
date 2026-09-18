/**
 * @vitest-environment node
 */
import Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSettings: vi.fn(),
  findOrCreateCustomer: vi.fn(),
  createOrder: vi.fn(),
  getProductVariantIdByDefaultCode: vi.fn(),
  automateBillingFlow: vi.fn(),
  getOrderWithInvoices: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getSettings: mocks.getSettings,
}));

vi.mock('@/lib/odoo/services', () => ({
  OdooService: {
    findOrCreateCustomer: mocks.findOrCreateCustomer,
    createOrder: mocks.createOrder,
    getProductVariantIdByDefaultCode: mocks.getProductVariantIdByDefaultCode,
    automateBillingFlow: mocks.automateBillingFlow,
    getOrderWithInvoices: mocks.getOrderWithInvoices,
  },
}));

import { POST as checkoutPOST } from '@/app/api/checkout/stripe/route';
import { GET as checkoutStatusGET } from '@/app/api/checkout/status/route';
import { ShippingEngine } from '@/lib/shipping/engine';

const liveEnabled = Boolean(
  process.env.STRIPE_SECRET_KEY &&
  process.env.FEDEX_CLIENT_ID &&
  process.env.FEDEX_CLIENT_SECRET &&
  process.env.FEDEX_ACCOUNT_NUMBER,
);

const testSuite = liveEnabled ? describe : describe.skip;

function uniqueEmail() {
  return `codex.purchase.${Date.now()}@example.com`;
}

testSuite('live checkout purchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getSettings.mockResolvedValue({
      shipping_cities: ['Miami'],
      restricted_shipping_cities: [],
    });
    mocks.findOrCreateCustomer.mockResolvedValue(44);
    mocks.createOrder.mockResolvedValue(55);
    mocks.getProductVariantIdByDefaultCode.mockResolvedValue(9001);
    mocks.automateBillingFlow.mockResolvedValue({
      success: true,
      orderId: 55,
      invoiceId: 77,
      pickingIds: [],
      steps: ['confirmed', 'finalized'],
    });
    mocks.getOrderWithInvoices.mockResolvedValue({
      id: 55,
      name: 'SO055',
      date_order: '2026-05-03T00:00:00Z',
      state: 'sale',
      amount_untaxed: 1250,
      amount_tax: 0,
      amount_total: 1270.75,
      invoice_status: 'invoiced',
      display_status: 'Completed & Invoiced',
      portal_url: 'https://odoo.example.com/my/orders/55',
      metadata: {
        shipping_carrier: 'fedex',
      },
      invoices: [
        {
          id: 77,
          name: 'INV/2026/00077',
          invoice_date: '2026-05-03',
          amount_total: 1270.75,
          display_status: 'Paid',
          pdf_url: 'https://odoo.example.com/invoice.pdf',
          portal_url: 'https://odoo.example.com/invoice',
        },
      ],
    });
  });

  it('creates an order, confirms the Stripe payment, and resolves checkout status', async () => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
    const stripe = new Stripe(stripeSecretKey);

    const subtotal = 1250;
    const email = uniqueEmail();
    const address = {
      street: '82681 Overseas Highway',
      city: 'Miami',
      state: 'FL',
      zip: '33139',
      country: 'United States',
    };

    const rates = await ShippingEngine.getRates(address, {
      weightLbs: 1,
      value: subtotal,
    });
    const fedexRate = rates.find((rate) => rate.carrier === 'fedex');
    expect(fedexRate).toBeTruthy();

    const checkoutResponse = await checkoutPOST(new Request('http://localhost/api/checkout/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            id: '24',
            product_id: '24',
            name: 'The Islamorada Solitaire',
            price: subtotal,
            quantity: 1,
          },
        ],
        customerData: {
          name: 'Codex Test Buyer',
          email,
          phone: '3055550199',
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
        },
        deliveryMethod: 'ship',
        shippingRate: {
          carrier: fedexRate?.carrier || 'fedex',
          serviceName: fedexRate?.serviceName || 'FedEx Priority Overnight (Estimated)',
        },
      }),
    }));

    expect(checkoutResponse.status).toBe(200);
    const checkoutData = await checkoutResponse.json();
    expect(checkoutData.clientSecret).toBeTruthy();
    expect(checkoutData.orderId).toBe(55);
    expect(checkoutData.shippingRate?.carrier).toBe('fedex');
    expect(mocks.findOrCreateCustomer).toHaveBeenCalledWith(expect.objectContaining({
      email,
      street: address.street,
      city: address.city,
      zip: address.zip,
    }));

    const clientSecret = String(checkoutData.clientSecret);
    const paymentIntentId = clientSecret.split('_secret_')[0];
    expect(paymentIntentId).toMatch(/^pi_/);

    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: 'pm_card_visa',
    });
    expect(confirmedIntent.status).toBe('succeeded');

    const statusResponse = await checkoutStatusGET(new Request(
      `http://localhost/api/checkout/status?payment_intent=${encodeURIComponent(paymentIntentId)}&payment_intent_client_secret=${encodeURIComponent(clientSecret)}`,
      { method: 'GET' },
    ));

    expect(statusResponse.status).toBe(200);
    const statusData = await statusResponse.json();

    expect(statusData.success).toBe(true);
    expect(statusData.paymentStatus).toBe('succeeded');
    expect(statusData.order?.id).toBe(55);
    expect(statusData.order?.metadata?.shipping_carrier).toBe('fedex');
    expect(statusData.invoice?.display_status).toBe('Paid');
    expect(mocks.automateBillingFlow).toHaveBeenCalledWith(55, expect.objectContaining({
      paymentIntentId,
      paymentStatus: 'succeeded',
    }));
  }, 240000);
});
