import { describe, expect, it } from 'vitest';
import {
  buildCartCookieValue,
  parseCartItems,
  readCartCookie,
} from '@/lib/cart-storage';

describe('cart storage helpers', () => {
  it('parses stored cart items', () => {
    const items = parseCartItems(JSON.stringify([
      {
        id: '31',
        slug: 'watche',
        name: 'watche',
        price: 1250,
        quantity: 1,
        image_url: '/api/products/image?id=31',
      },
    ]));

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('31');
    expect(items[0].image_url).toBe('/api/products/image?id=31');
  });

  it('reads the shared cookie value', () => {
    const cookie = `foo=bar; galantes_cart_shared=${buildCartCookieValue([
      {
        id: '31',
        slug: 'watche',
        name: 'watche',
        price: 1250,
        quantity: 1,
      },
    ])}; path=/`;

    const raw = readCartCookie(cookie);
    expect(raw).not.toBeNull();
    expect(parseCartItems(raw)).toHaveLength(1);
  });
});
