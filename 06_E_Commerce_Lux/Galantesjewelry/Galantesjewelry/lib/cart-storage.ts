import type { CartItem } from '@/context/shop/CartContext';

export const CART_STORAGE_KEY = 'galantes_cart';
export const CART_COOKIE_KEY = 'galantes_cart_shared';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeOptionalProductId(value: unknown): string | number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return undefined;
}

export function parseCartItems(raw: string | null | undefined): CartItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isPlainObject).map((item) => ({
      id: String(item.id ?? ''),
      product_id: normalizeOptionalProductId(item.product_id),
      slug: String(item.slug ?? ''),
      name: String(item.name ?? ''),
      price: Number(item.price ?? 0),
      quantity: Number(item.quantity ?? 1),
      image_url: typeof item.image_url === 'string' ? item.image_url : undefined,
    })).filter((item) => Boolean(item.id) && Boolean(item.slug) && Boolean(item.name) && Number.isFinite(item.price) && Number.isFinite(item.quantity));
  } catch {
    return [];
  }
}

export function serializeCartItems(items: CartItem[]): string {
  return JSON.stringify(items);
}

export function readCartCookie(cookieSource: string): string | null {
  const match = cookieSource.match(new RegExp(`(?:^|;\\s*)${CART_COOKIE_KEY}=([^;]*)`));
  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function buildCartCookieValue(items: CartItem[]): string {
  return encodeURIComponent(serializeCartItems(items));
}

export function buildCartCookieAttributes(): string {
  const attrs = ['path=/', 'max-age=2592000', 'samesite=lax'];

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname === 'galantesjewelry.com' || hostname.endsWith('.galantesjewelry.com')) {
      attrs.unshift('domain=.galantesjewelry.com');
    }
  }

  return attrs.join('; ');
}
