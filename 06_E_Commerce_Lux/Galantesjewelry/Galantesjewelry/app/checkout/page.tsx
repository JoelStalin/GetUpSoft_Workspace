'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/context/shop/CartContext';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import Link from 'next/link';
import { ShippingSelector } from '@/components/checkout/ShippingSelector';
import type { ShippingRate } from '@/lib/shipping/types';
import { calculateTaxBreakdown } from '@/lib/tax';
import { getCityOptions, getStateById, US_COUNTRY, US_STATE_OPTIONS } from '@/lib/address-options';
import { getProductImageSrc } from '@/lib/product-image';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

type DeliveryMethod = 'ship' | 'pickup';

type CheckoutCustomerData = {
  name: string;
  email: string;
  phone: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  state_id?: number;
  country_id?: number;
};

type SavedAddress = {
  id: number | string;
  name?: string;
  type?: 'delivery' | 'invoice' | 'other';
  phone?: string;
  street?: string;
  street2?: string;
  city?: string;
  zip?: string;
  state_id?: [number, string];
  country_id?: [number, string];
  source?: 'profile' | 'address';
};

const STORE_TAX_ADDRESS = {
  street: '82681 Overseas Highway',
  city: 'Islamorada',
  state: 'FL',
  zip: '33036',
  country: 'United States',
};

const PICKUP_RATE: ShippingRate = {
  carrier: 'pickup',
  serviceName: 'Boutique Pick-up (Islamorada)',
  price: 0,
  currency: 'USD',
  estimatedDays: 0,
  insuranceIncluded: true,
  insuranceValue: 0,
};

function addressLabel(address: SavedAddress) {
  if (address.source === 'profile') return 'Default profile address';
  if (address.name) return address.name;
  if (address.type === 'delivery') return 'Shipping address';
  if (address.type === 'invoice') return 'Billing address';
  return 'Saved address';
}

export default function CheckoutPage() {
  const { items, totalCount } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isReadyForPayment, setIsReadyForPayment] = useState(false);
  const [customerData, setCustomerData] = useState<CheckoutCustomerData>({
    name: '',
    email: '',
    phone: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: US_COUNTRY.label,
    state_id: undefined,
    country_id: US_COUNTRY.id,
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('ship');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('manual');
  const [accountStatus, setAccountStatus] = useState<'loading' | 'signed-in' | 'guest'>('loading');
  const [selectedShippingRate, setSelectedShippingRate] = useState<ShippingRate | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingAddress = useMemo(() => ({
    street: customerData.street,
    city: customerData.city,
    state: customerData.state,
    zip: customerData.zip,
    country: customerData.country,
  }), [customerData.city, customerData.country, customerData.state, customerData.street, customerData.zip]);
  const cityOptions = useMemo(() => getCityOptions(customerData.state_id), [customerData.state_id]);
  const shippingTotal = selectedShippingRate?.price || 0;
  const tax = calculateTaxBreakdown({
    subtotal,
    shippingTotal,
    destination: deliveryMethod === 'pickup' ? STORE_TAX_ADDRESS : shippingAddress,
  });
  const orderTotal = tax.total;
  const hasShippingAddress = Boolean(customerData.street && customerData.city && customerData.zip);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomerCheckoutData() {
      try {
        const [profileResponse, addressesResponse] = await Promise.all([
          fetch('/api/account/profile', { cache: 'no-store' }),
          fetch('/api/account/addresses', { cache: 'no-store' }),
        ]);

        if (cancelled) return;

        if (profileResponse.status === 401 && addressesResponse.status === 401) {
          setAccountStatus('guest');
          return;
        }

        setAccountStatus('signed-in');

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const profile = profileData.profile || {};
          const loadedState = profile.state_id?.[0] ? getStateById(profile.state_id[0]) : null;
          setCustomerData((current) => ({
            ...current,
            name: current.name || profile.name || '',
            email: current.email || profile.email || '',
            phone: current.phone || profile.phone || '',
            street: current.street || profile.street || '',
            street2: current.street2 || profile.street2 || '',
            city: current.city || profile.city || '',
            state: current.state || loadedState?.label || '',
            zip: current.zip || profile.zip || '',
            country: current.country || US_COUNTRY.label,
            state_id: current.state_id || profile.state_id || undefined,
            country_id: current.country_id || profile.country_id || US_COUNTRY.id,
          }));

          if (profile.street && profile.city && profile.zip) {
            setSavedAddresses((current) => [
              {
                id: 'profile',
                source: 'profile',
                name: 'Default profile address',
                phone: profile.phone,
                street: profile.street,
                street2: profile.street2,
                city: profile.city,
                zip: profile.zip,
                state_id: profile.state_id || undefined,
                country_id: profile.country_id || undefined,
              },
              ...current.filter((address) => address.id !== 'profile'),
            ]);
            setSelectedAddressId((current) => current === 'manual' ? 'profile' : current);
          }
        }

        if (addressesResponse.ok) {
          const addresses = await addressesResponse.json();
          if (Array.isArray(addresses)) {
            setSavedAddresses((current) => {
              const profileAddress = current.find((address) => address.id === 'profile');
              const nextAddresses = addresses.filter((address) => address?.street && address?.city && address?.zip);
              return profileAddress ? [profileAddress, ...nextAddresses] : nextAddresses;
            });
          }
        }
      } catch (error) {
        console.warn('Checkout account preload failed:', error);
        if (!cancelled) setAccountStatus('guest');
      }
    }

    void loadCustomerCheckoutData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      setSelectedShippingRate({ ...PICKUP_RATE, insuranceValue: subtotal });
    } else {
      setSelectedShippingRate(null);
    }
  }, [deliveryMethod, subtotal]);

  const handleRateSelect = useCallback((rate: ShippingRate) => {
    setSelectedShippingRate(rate);
  }, []);

  const applySavedAddress = useCallback((address: SavedAddress) => {
    const loadedState = address.state_id?.[0] ? getStateById(address.state_id[0]) : null;
    setSelectedAddressId(String(address.id));
    setCustomerData((current) => ({
      ...current,
      phone: current.phone || address.phone || '',
      street: address.street || '',
      street2: address.street2 || '',
      city: address.city || '',
      state: loadedState?.label || address.state_id?.[1] || '',
      state_id: address.state_id?.[0],
      zip: address.zip || '',
      country: address.country_id?.[1] || US_COUNTRY.label,
      country_id: address.country_id?.[0],
    }));
  }, []);

  const updateDeliveryMethod = useCallback((method: DeliveryMethod) => {
    setDeliveryMethod(method);
    setIsReadyForPayment(false);
  }, []);

  const useManualAddress = useCallback(() => {
    setSelectedAddressId('manual');
      setCustomerData((current) => ({
        ...current,
        street: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
        country: US_COUNTRY.label,
        state_id: undefined,
        country_id: US_COUNTRY.id,
      }));
  }, []);

  const persistCheckoutAddress = useCallback(async () => {
    if (accountStatus !== 'signed-in' || deliveryMethod !== 'ship') {
      return;
    }

    const response = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: customerData.name,
        phone: customerData.phone,
        street: customerData.street,
        street2: customerData.street2,
        city: customerData.city,
        zip: customerData.zip,
        state_id: customerData.state_id,
        country_id: customerData.country_id || US_COUNTRY.id,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Unable to save the shipping address.');
    }
  }, [
    accountStatus,
    customerData.city,
    customerData.country_id,
    customerData.name,
    customerData.phone,
    customerData.state,
    customerData.state_id,
    customerData.street,
    customerData.street2,
    customerData.zip,
    deliveryMethod,
  ]);

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerData.email || !customerData.name) {
      alert("Please provide at least name and email.");
      return;
    }

    if (deliveryMethod === 'ship' && !hasShippingAddress) {
      alert('Please choose or enter a shipping address.');
      return;
    }

    if (!selectedShippingRate) {
      alert(deliveryMethod === 'pickup' ? 'Please choose a fulfillment option.' : 'Please choose a shipping method.');
      return;
    }

    try {
      await persistCheckoutAddress();
      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerData, deliveryMethod, shippingRate: selectedShippingRate }),
      });

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setIsReadyForPayment(true);
      } else {
        throw new Error(data.error || "Failed to initiate checkout");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initiate checkout';
      console.error(error);
      alert(message);
    }
  };

  if (totalCount === 0) {
    return (
      <div className="mx-auto max-w-4xl py-32 px-6 text-center">
        <h1 className="text-4xl font-serif mb-6">Your Cart is Empty</h1>
        <Link href="/shop" className="underline">Go back to shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] lg:gap-16">
      <div>
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">Secure Checkout</p>
          <h1 className="mt-2 text-4xl font-serif text-primary">Choose how you receive your jewelry</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Signed-in customers can reuse saved addresses. Local customers can choose boutique pickup and skip shipping details.
          </p>
        </div>

        {!isReadyForPayment ? (
          <form onSubmit={handleStartPayment} className="space-y-8 rounded-[2rem] border border-primary/10 bg-white p-6 shadow-sm md:p-8">
            <section className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-serif text-primary">Contact Information</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {accountStatus === 'signed-in'
                      ? 'We filled in what we know from your account. You can edit it for this order.'
                      : accountStatus === 'loading'
                        ? 'Checking for your saved account details...'
                        : 'Checking out as guest. Sign in to reuse saved addresses.'}
                  </p>
                </div>
                {accountStatus === 'guest' && (
                  <Link href="/auth/login?returnTo=/checkout" className="text-xs font-bold uppercase tracking-widest text-accent hover:underline">
                    Sign in
                  </Link>
                )}
              </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text" placeholder="Full Name" required
                data-testid="checkout-name"
                className="rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                value={customerData.name} onChange={e => setCustomerData({...customerData, name: e.target.value})}
              />
              <input
                type="email" placeholder="Email Address" required
                data-testid="checkout-email"
                className="rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                value={customerData.email} onChange={e => setCustomerData({...customerData, email: e.target.value})}
              />
              <input
                type="tel" placeholder="Phone Number"
                data-testid="checkout-phone"
                className="rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent md:col-span-2"
                value={customerData.phone} onChange={e => setCustomerData({...customerData, phone: e.target.value})}
              />
            </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-serif text-primary">Fulfillment</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {([
                  ['ship', 'Ship insured', 'Secure carrier delivery with insured rates.'],
                  ['pickup', 'Boutique pickup', 'Pick up in Islamorada by appointment.'],
                ] as const).map(([method, title, description]) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => updateDeliveryMethod(method)}
                    data-testid={`delivery-method-${method}`}
                    className={`rounded-2xl border p-4 text-left transition ${
                      deliveryMethod === method
                        ? 'border-accent bg-accent/[0.04] ring-1 ring-accent'
                        : 'border-primary/10 bg-primary/[0.015] hover:border-primary/25'
                    }`}
                  >
                    <span className="text-sm font-bold uppercase tracking-widest text-primary">{title}</span>
                    <span className="mt-2 block text-xs leading-5 text-muted-foreground">{description}</span>
                  </button>
                ))}
              </div>
            </section>

            {deliveryMethod === 'ship' ? (
              <section className="space-y-5">
                <div>
                  <h2 className="text-xl font-serif text-primary">Shipping Address</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Choose a saved address or enter a new one for this order.</p>
                </div>

                {savedAddresses.length > 0 && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {savedAddresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => applySavedAddress(address)}
                        data-testid={`checkout-address-${address.id}`}
                        className={`rounded-2xl border p-4 text-left transition ${
                          selectedAddressId === String(address.id)
                            ? 'border-accent bg-accent/[0.04] ring-1 ring-accent'
                            : 'border-primary/10 bg-white hover:border-primary/25'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">{addressLabel(address)}</span>
                        <span className="mt-2 block text-sm text-primary">{address.street}</span>
                        {address.street2 && <span className="block text-xs text-muted-foreground">{address.street2}</span>}
                        <span className="block text-xs text-muted-foreground">{address.city}, {address.state_id?.[1] || ''} {address.zip}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={useManualAddress}
                      className={`rounded-2xl border border-dashed p-4 text-left transition ${
                        selectedAddressId === 'manual'
                          ? 'border-accent bg-accent/[0.04] ring-1 ring-accent'
                          : 'border-primary/10 hover:border-primary/25'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">Use a new address</span>
                      <span className="mt-2 block text-xs text-muted-foreground">Enter or adjust the delivery address below.</span>
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Street Address"
                    required={deliveryMethod === 'ship'}
                    data-testid="checkout-street"
                    className="w-full rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                    value={customerData.street}
                    onChange={(e) => setCustomerData({ ...customerData, street: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Apt / Suite / Unit (optional)"
                    data-testid="checkout-street2"
                    className="w-full rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                    value={customerData.street2}
                    onChange={(e) => setCustomerData({ ...customerData, street2: e.target.value })}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground" htmlFor="checkout-state">
                        State
                      </label>
                      <select
                        id="checkout-state"
                        data-testid="checkout-state"
                        className="w-full rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                        value={customerData.state_id || ''}
                        onChange={(e) => {
                          const nextStateId = Number.parseInt(e.target.value, 10);
                          const nextState = Number.isFinite(nextStateId) ? getStateById(nextStateId) : null;
                          setCustomerData((current) => ({
                            ...current,
                            state_id: Number.isFinite(nextStateId) ? nextStateId : undefined,
                            state: nextState?.label || '',
                            city: nextState?.cities.includes(current.city) ? current.city : '',
                          }));
                        }}
                        required={deliveryMethod === 'ship'}
                      >
                        <option value="">Select State</option>
                        {US_STATE_OPTIONS.map((state) => (
                          <option key={state.id} value={state.id}>{state.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground" htmlFor="checkout-city">
                        City
                      </label>
                      <select
                        id="checkout-city"
                        data-testid="checkout-city"
                        className="w-full rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-primary/[0.02]"
                        value={customerData.city}
                        onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                        required={deliveryMethod === 'ship'}
                        disabled={!customerData.state_id}
                      >
                        <option value="">{customerData.state_id ? 'Select City' : 'Select a state first'}</option>
                        {cityOptions.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground" htmlFor="checkout-zip">
                        ZIP Code
                      </label>
                      <input
                        id="checkout-zip"
                        type="text"
                        placeholder="33036"
                        required={deliveryMethod === 'ship'}
                        data-testid="checkout-zip"
                        className="w-full rounded-xl border border-primary/10 p-3 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                        value={customerData.zip}
                        onChange={(e) => setCustomerData({ ...customerData, zip: e.target.value })}
                      />
                    </div>

                    <div className="rounded-xl border border-primary/10 bg-primary/[0.02] p-3 text-xs text-muted-foreground md:self-end">
                      Country: {US_COUNTRY.label}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <ShippingSelector
                    address={shippingAddress}
                    orderValue={subtotal}
                    onRateSelect={handleRateSelect}
                    excludePickup
                  />
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-accent/30 bg-accent/[0.035] p-5">
                <h2 className="text-xl font-serif text-primary">Boutique Pickup</h2>
                <p className="mt-2 text-sm leading-6 text-primary/70">
                  No shipping address needed. After payment, our team will prepare the piece and coordinate a secure pickup window at the Islamorada boutique.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex text-xs font-bold uppercase tracking-widest text-accent hover:underline"
                >
                  Need a specific pickup time?
                </Link>
              </section>
            )}

            <button
              type="submit"
              disabled={!selectedShippingRate}
              data-testid="checkout-continue"
              className="mt-2 w-full rounded-full bg-primary py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/40"
            >
              {!selectedShippingRate
                ? deliveryMethod === 'pickup' ? 'Choose Pickup' : 'Select Shipping Method'
                : 'Continue to Payment'}
            </button>
          </form>
        ) : clientSecret ? (
          <div className="bg-white p-8 border border-primary/10 rounded-lg shadow-sm">
            <h2 className="text-2xl font-serif mb-8 text-primary">Payment Details</h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm customerData={customerData} />
            </Elements>
            <button
              onClick={() => setIsReadyForPayment(false)}
              className="mt-6 text-sm text-gray-500 underline"
            >
              Edit shipping info
            </button>
          </div>
        ) : null}
      </div>

      {/* Summary Sidebar */}
      <div className="bg-primary/5 p-8 rounded-lg h-fit border border-primary/10">
        <h2 className="text-2xl font-serif mb-6 text-primary">Order Summary</h2>
        <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-4">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex gap-4 items-center">
                <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
                  {getProductImageSrc(item) && (
                    // Product images are served through a local API query string; next/image localPatterns intentionally block broad query optimization.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getProductImageSrc(item)}
                      alt={item.name}
                      data-testid={`checkout-product-image-${item.id}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
              </div>
              <span className="font-bold">${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-primary/10 pt-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-bold">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-bold" data-testid="checkout-shipping-total">
              {selectedShippingRate ? (shippingTotal === 0 ? 'FREE' : `$${shippingTotal.toFixed(2)}`) : 'Choose at checkout'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-bold" data-testid="checkout-tax-total">
              ${tax.taxTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t border-primary/10 pt-4">
            <span>Total (Estimated)</span>
            <span data-testid="checkout-total">${orderTotal.toLocaleString(undefined, { minimumFractionDigits: selectedShippingRate ? 2 : 0, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
