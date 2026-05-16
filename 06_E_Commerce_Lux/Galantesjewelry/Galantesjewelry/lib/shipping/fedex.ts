import type { PackageDetails, ShippingAddress, ShippingRate } from './types';

type FedExMoney = {
  amount?: number | string;
  currency?: string;
};

type FedExRateDetail = {
  serviceType?: string;
  serviceName?: string;
  ratedShipmentDetails?: Array<{
    totalNetCharge?: FedExMoney;
    shipmentRateDetail?: {
      totalNetCharge?: FedExMoney;
      totalBaseCharge?: FedExMoney;
      totalFreightDiscounts?: FedExMoney;
    };
  }>;
  shipmentRateDetail?: {
    totalNetCharge?: FedExMoney;
    totalBaseCharge?: FedExMoney;
  };
  commit?: {
    transitTime?: string;
  };
};

type FedExTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

type FedExQuoteResponse = {
  output?: {
    rateReplyDetails?: FedExRateDetail[];
  };
};

type FedExClientConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  accountNumber: string;
};

const DEFAULT_FEDEX_BASE_URL = 'https://apis-sandbox.fedex.com';
const DEFAULT_TIMEOUT_MS = 6000;

const DEFAULT_ORIGIN: ShippingAddress = {
  street: '82681 Overseas Highway',
  city: 'Islamorada',
  state: 'FL',
  zip: '33036',
  country: 'United States',
};

let cachedToken: { token: string; expiresAt: number } | null = null;
let cachedTokenPromise: Promise<string> | null = null;

function getFedExConfig(): FedExClientConfig | null {
  const baseUrl = (process.env.FEDEX_BASE_URL || DEFAULT_FEDEX_BASE_URL).replace(/\/+$/, '');
  const clientId = process.env.FEDEX_CLIENT_ID || process.env.FEDEX_API_KEY || '';
  const clientSecret = process.env.FEDEX_CLIENT_SECRET || process.env.FEDEX_SECRET_KEY || '';
  const accountNumber = process.env.FEDEX_ACCOUNT_NUMBER || process.env.FEDEX_ACCOUNT_ID || '';

  if (!clientId || !clientSecret || !accountNumber) {
    return null;
  }

  return {
    baseUrl,
    clientId,
    clientSecret,
    accountNumber,
  };
}

function getCountryCode(country?: string) {
  const normalized = (country || '').trim().toLowerCase();
  if (!normalized || normalized.includes('united states') || normalized === 'us' || normalized === 'usa') {
    return 'US';
  }

  return normalized.slice(0, 2).toUpperCase() || 'US';
}

function normalizeState(state?: string) {
  return (state || '').trim().toUpperCase();
}

function normalizeZip(zip?: string) {
  return (zip || '').trim();
}

function normalizeWeight(value: number) {
  return Number.isFinite(value) && value > 0 ? Number(value.toFixed(2)) : 1;
}

function parseMoney(value: unknown): FedExMoney | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const amount = record.amount;
  if (typeof amount === 'number' || typeof amount === 'string') {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      return null;
    }

    return {
      amount: numericAmount,
      currency: typeof record.currency === 'string' && record.currency ? record.currency : 'USD',
    };
  }

  return null;
}

function findMoney(value: unknown, depth = 0): FedExMoney | null {
  if (!value || depth > 4) {
    return null;
  }

  const direct = parseMoney(value);
  if (direct) {
    return direct;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findMoney(item, depth + 1);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  for (const candidate of [
    record.totalNetCharge,
    record.totalBaseCharge,
    record.totalNetFedExCharge,
    record.totalFreightDiscounts,
    record.shipmentRateDetail,
    record.ratedShipmentDetails,
  ]) {
    const found = findMoney(candidate, depth + 1);
    if (found) {
      return found;
    }
  }

  return null;
}

function buildDimensions(pkg: PackageDetails) {
  if (!pkg.dimensions) {
    return undefined;
  }

  return {
    units: 'IN',
    length: Math.max(1, Math.round(pkg.dimensions.length)),
    width: Math.max(1, Math.round(pkg.dimensions.width)),
    height: Math.max(1, Math.round(pkg.dimensions.height)),
  };
}

function buildFedExRequestBody(address: ShippingAddress, pkg: PackageDetails, accountNumber: string) {
  return {
    accountNumber: {
      value: accountNumber,
    },
    rateRequestControlParameters: {
      returnTransitTimes: true,
    },
    requestedShipment: {
      rateRequestType: ['ACCOUNT', 'LIST'],
      shipper: {
        address: {
          streetLines: [DEFAULT_ORIGIN.street],
          city: DEFAULT_ORIGIN.city,
          stateOrProvinceCode: normalizeState(DEFAULT_ORIGIN.state),
          postalCode: normalizeZip(DEFAULT_ORIGIN.zip),
          countryCode: getCountryCode(DEFAULT_ORIGIN.country),
          residential: false,
        },
      },
      recipient: {
        address: {
          streetLines: [address.street],
          city: address.city,
          stateOrProvinceCode: normalizeState(address.state),
          postalCode: normalizeZip(address.zip),
          countryCode: getCountryCode(address.country),
          residential: true,
        },
      },
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      packagingType: 'YOUR_PACKAGING',
      requestedPackageLineItems: [
        {
          weight: {
            units: 'LB',
            value: normalizeWeight(pkg.weightLbs),
          },
          ...(buildDimensions(pkg) ? { dimensions: buildDimensions(pkg) } : {}),
        },
      ],
    },
  };
}

function humanizeServiceType(serviceType?: string, fallback = 'FedEx Shipping') {
  if (!serviceType) {
    return fallback;
  }

  const labelMap: Record<string, string> = {
    FEDEX_GROUND: 'FedEx Ground',
    GROUND_HOME_DELIVERY: 'FedEx Home Delivery',
    FEDEX_EXPRESS_SAVER: 'FedEx Express Saver',
    FEDEX_2_DAY: 'FedEx 2Day',
    FEDEX_2_DAY_AM: 'FedEx 2Day AM',
    STANDARD_OVERNIGHT: 'FedEx Standard Overnight',
    FEDEX_STANDARD_OVERNIGHT: 'FedEx Standard Overnight',
    PRIORITY_OVERNIGHT: 'FedEx Priority Overnight',
    FEDEX_PRIORITY_OVERNIGHT: 'FedEx Priority Overnight',
    FIRST_OVERNIGHT: 'FedEx First Overnight',
    INTERNATIONAL_PRIORITY: 'FedEx International Priority',
    INTERNATIONAL_ECONOMY: 'FedEx International Economy',
  };

  if (labelMap[serviceType]) {
    return labelMap[serviceType];
  }

  return serviceType
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function estimateTransitDays(serviceType?: string) {
  const transitMap: Record<string, number> = {
    FEDEX_GROUND: 4,
    GROUND_HOME_DELIVERY: 4,
    FEDEX_EXPRESS_SAVER: 3,
    FEDEX_2_DAY: 2,
    FEDEX_2_DAY_AM: 2,
    STANDARD_OVERNIGHT: 1,
    FEDEX_STANDARD_OVERNIGHT: 1,
    PRIORITY_OVERNIGHT: 1,
    FEDEX_PRIORITY_OVERNIGHT: 1,
    FIRST_OVERNIGHT: 1,
    INTERNATIONAL_PRIORITY: 3,
    INTERNATIONAL_ECONOMY: 5,
  };

  return serviceType && transitMap[serviceType] ? transitMap[serviceType] : 2;
}

function toShippingRate(detail: FedExRateDetail, pkg: PackageDetails, insurance: number): ShippingRate | null {
  const money = findMoney(detail.ratedShipmentDetails) || findMoney(detail.shipmentRateDetail);
  if (!money || typeof money.amount !== 'number') {
    return null;
  }

  const basePrice = Math.max(0, money.amount);
  return {
    carrier: 'fedex',
    serviceName: detail.serviceName || humanizeServiceType(detail.serviceType),
    price: Math.round((basePrice + insurance) * 100) / 100,
    currency: money.currency || 'USD',
    estimatedDays: estimateTransitDays(detail.serviceType),
    insuranceIncluded: true,
    insuranceValue: pkg.value,
  };
}

async function fetchJson<T>(url: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    const text = await response.text();
    const parsed = text ? (() => {
      try {
        return JSON.parse(text) as T;
      } catch {
        return null;
      }
    })() : null;

    if (!response.ok) {
      const errorMessage = typeof parsed === 'object' && parsed && 'error' in parsed
        ? JSON.stringify(parsed)
        : text || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    if (parsed === null) {
      throw new Error('FedEx returned an empty or invalid JSON response.');
    }

    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

async function getAccessToken(config: FedExClientConfig) {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

  if (cachedTokenPromise) {
    return cachedTokenPromise;
  }

  cachedTokenPromise = (async () => {
    const tokenResponse = await fetchJson<FedExTokenResponse>(`${config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }).toString(),
    });

    const token = tokenResponse.access_token;
    if (!token) {
      throw new Error('FedEx token response did not include an access token.');
    }

    const expiresInMs = Math.max(60, Number(tokenResponse.expires_in || 0)) * 1000;
    cachedToken = {
      token,
      expiresAt: Date.now() + Math.max(0, expiresInMs - 60_000),
    };

    return token;
  })();

  try {
    return await cachedTokenPromise;
  } finally {
    cachedTokenPromise = null;
  }
}

export function resetFedExCacheForTests() {
  cachedToken = null;
  cachedTokenPromise = null;
}

export async function getFedExRates(address: ShippingAddress, pkg: PackageDetails, insurance = 0): Promise<ShippingRate[]> {
  const config = getFedExConfig();
  if (!config) {
    return [
      {
        carrier: 'fedex',
        serviceName: 'FedEx Priority Overnight (Estimated)',
        price: Math.round((62 + insurance) * 100) / 100,
        currency: 'USD',
        estimatedDays: 1,
        insuranceIncluded: true,
        insuranceValue: pkg.value,
      },
    ];
  }

  try {
    const token = await getAccessToken(config);
    const response = await fetchJson<FedExQuoteResponse>(`${config.baseUrl}/rate/v1/rates/quotes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(buildFedExRequestBody(address, pkg, config.accountNumber)),
    });

    const details = response.output?.rateReplyDetails || [];
    const normalized = details
      .map((detail) => toShippingRate(detail, pkg, insurance))
      .filter((rate): rate is ShippingRate => Boolean(rate))
      .sort((left, right) => left.price - right.price);

    if (normalized.length > 0) {
      return [normalized[0]];
    }
  } catch (error) {
    console.warn('FedEx rate lookup failed, using estimated fallback rate.', error);
  }

  return [
    {
      carrier: 'fedex',
      serviceName: 'FedEx Priority Overnight (Estimated)',
      price: Math.round((62 + insurance) * 100) / 100,
      currency: 'USD',
      estimatedDays: 1,
      insuranceIncluded: true,
      insuranceValue: pkg.value,
    },
  ];
}
