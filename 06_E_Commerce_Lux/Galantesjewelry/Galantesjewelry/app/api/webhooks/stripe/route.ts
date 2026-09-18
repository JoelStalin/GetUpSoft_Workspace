import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe secret key is not configured.');
  }

  return new Stripe(secretKey);
}

async function buildStripePaymentSyncPayload(stripe: Stripe, paymentIntent: Stripe.PaymentIntent) {
  const latestChargeId = typeof paymentIntent.latest_charge === 'string'
    ? paymentIntent.latest_charge
    : paymentIntent.latest_charge?.id || null;

  let receiptUrl: string | null = null;
  if (latestChargeId) {
    try {
      const charge = await stripe.charges.retrieve(latestChargeId);
      receiptUrl = charge.receipt_url || null;
    } catch (error) {
      console.warn('Could not retrieve Stripe charge receipt URL for webhook sync:', error);
    }
  }

  return {
    paymentIntentId: paymentIntent.id,
    chargeId: latestChargeId,
    receiptUrl,
    amount: paymentIntent.amount_received || paymentIntent.amount,
    currency: paymentIntent.currency,
    customerEmail: paymentIntent.receipt_email || paymentIntent.metadata?.customer_email || null,
    paymentStatus: paymentIntent.status,
  };
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get('stripe-signature');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    return NextResponse.json({ error: 'Stripe webhook is not configured.' }, { status: 503 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook signature verification failed.';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const partnerId = Number.parseInt(paymentIntent.metadata?.odoo_partner_id || '', 10);
    const orderId = Number.parseInt(paymentIntent.metadata?.odoo_order_id || '', 10);

    if (!Number.isFinite(partnerId) || !Number.isFinite(orderId) || orderId <= 0) {
      console.warn('Skipping Odoo billing automation for Stripe webhook with invalid metadata:', {
        partnerId: paymentIntent.metadata?.odoo_partner_id,
        orderId: paymentIntent.metadata?.odoo_order_id,
      });
      return NextResponse.json({ received: true });
    }

    console.log(`Payment successful for partner ${partnerId}, Order ${orderId}. Automating Odoo Billing...`);

    try {
      const { OdooService } = await import('@/lib/odoo/services');
      const stripe = getStripeClient();
      const stripePayment = await buildStripePaymentSyncPayload(stripe, paymentIntent);
      const result = await OdooService.automateBillingFlow(orderId, stripePayment);
      console.log(`Odoo billing automation complete: Order ${result.orderId}, Invoice ${result.invoiceId}`);
    } catch (error) {
      console.error('Failed to automate billing flow in Odoo:', error);
      // We return 200 anyway to Stripe to avoid retries, but we should have alerted here
    }
  }

  return NextResponse.json({ received: true });
}
