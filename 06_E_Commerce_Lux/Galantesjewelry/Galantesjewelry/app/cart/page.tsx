'use client';

import { useEffect, useState, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/shop/CartContext';
import { getProductImageCandidates } from '@/lib/product-image';

type CartSummaryState = {
  shippingAvailable: boolean;
  shippingRate: {
    carrier: string;
    serviceName: string;
    price: number;
    estimatedDays: number;
  } | null;
  shippingTotal: number;
  taxRate: number;
  taxTotal: number;
  total: number;
  destination?: {
    city: string;
    state: string;
  };
  message?: string;
};

function CartItemImage({ item }: { item: { id: string; product_id?: string | number; image_url?: string; name: string } }) {
  const candidates = getProductImageCandidates(item);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const src = candidates[candidateIndex] || '';

  if (!src) {
    return null;
  }

  return (
    // Product images are served through a local API query string; using a plain img avoids next/image local pattern failures.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={item.name}
      className="h-full w-full object-cover"
      data-testid={`cart-product-image-${item.id}`}
      onError={(event: SyntheticEvent<HTMLImageElement>) => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((current) => current + 1);
        } else {
          event.currentTarget.style.display = 'none';
        }
      }}
    />
  );
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalCount, hasHydrated } = useCart();
  const [summary, setSummary] = useState<CartSummaryState | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingTotal = summary?.shippingTotal ?? 0;
  const taxTotal = summary?.taxTotal ?? 0;
  const orderTotal = subtotal + shippingTotal + taxTotal;

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (totalCount === 0) {
      setSummary(null);
      setSummaryLoading(false);
      setSummaryError('');
      return;
    }

    const controller = new AbortController();

    async function loadSummary() {
      setSummaryLoading(true);
      setSummaryError('');

      try {
        const response = await fetch('/api/cart/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subtotal,
            itemCount: totalCount,
          }),
          signal: controller.signal,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to calculate cart summary.');
        }

        setSummary({
          shippingAvailable: data.shippingAvailable,
          shippingRate: data.shippingRate || null,
          shippingTotal: data.shippingTotal || 0,
          taxRate: data.taxRate || 0,
          taxTotal: data.taxTotal || 0,
          total: data.total ?? subtotal,
          destination: data.destination ? {
            city: data.destination.city,
            state: data.destination.state,
          } : undefined,
          message: data.message || '',
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setSummary(null);
          setSummaryError(error instanceof Error ? error.message : 'Failed to calculate cart summary.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setSummaryLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      controller.abort();
    };
  }, [hasHydrated, subtotal, totalCount]);

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-4xl py-32 px-6 text-center">
        <h1 className="text-4xl font-serif mb-6">Loading Cart</h1>
        <p className="text-gray-600 mb-10">Restoring your saved items.</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="mx-auto max-w-4xl py-32 px-6 text-center">
        <h1 className="text-4xl font-serif mb-6">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-10">Discover our coastal collection and find your next treasure.</p>
        <Link href="/shop" className="bg-primary text-white px-8 py-4 uppercase tracking-widest text-sm font-bold hover:bg-primary-dark transition-colors">
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-20 px-6">
      <h1 className="text-5xl font-serif mb-12">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Item List */}
        <div className="lg:col-span-2 space-y-8">
          {items.map((item) => (
            <div key={item.id} className="flex gap-6 border-b border-primary/10 pb-8">
              <div className="relative h-32 w-32 flex-shrink-0 bg-gray-50 overflow-hidden rounded">
                <CartItemImage
                  key={`${item.id}:${String(item.product_id ?? '')}:${item.image_url ?? ''}`}
                  item={item}
                />
              </div>
              <div className="flex flex-grow flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-serif text-primary">{item.name}</h3>
                    <p className="text-lg font-bold">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Ref: {item.slug}</p>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center border border-primary/20 rounded">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors border-r border-primary/20"
                    >-</button>
                    <span className="px-4 py-1 text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100 transition-colors border-l border-primary/20"
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors font-bold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-primary/5 p-8 rounded-lg h-fit">
          <h2 className="text-2xl font-serif mb-6 text-primary">Order Summary</h2>
          <div className="space-y-4 text-sm border-b border-primary/10 pb-6 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({totalCount} items)</span>
              <span className="font-bold" data-testid="cart-subtotal">
                ${subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-bold" data-testid="cart-shipping-total">
                {summaryLoading
                  ? 'Calculating...'
                  : summary?.shippingAvailable
                    ? (shippingTotal === 0 ? 'FREE' : `$${shippingTotal.toFixed(2)}`)
                    : 'Unavailable'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-bold" data-testid="cart-tax-total">
                {summaryLoading
                  ? 'Calculating...'
                  : `${taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xl font-bold mb-8">
            <span>Total</span>
            <span data-testid="cart-order-total">
              ${orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {summary?.destination && (
            <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-gray-500" data-testid="cart-destination">
              Estimated for {summary.destination.city}, {summary.destination.state}
            </p>
          )}

          {summaryError ? (
            <p className="mb-4 text-xs text-red-600" data-testid="cart-summary-error">{summaryError}</p>
          ) : summary?.message ? (
            <p className="mb-4 text-xs text-amber-700" data-testid="cart-summary-message">{summary.message}</p>
          ) : null}

          <div className="space-y-4">
            <Link
              href="/checkout"
              className="w-full bg-primary text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-primary-dark transition-colors text-center block"
            >
              Checkout with Stripe
            </Link>
            <button className="w-full bg-black text-white py-4 flex items-center justify-center gap-2 rounded hover:opacity-90 transition-opacity">
              <span className="text-sm font-bold">Buy with</span>
              <span className="text-lg font-serif">Google Pay</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-500 text-center mt-6 uppercase tracking-wider leading-relaxed">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
