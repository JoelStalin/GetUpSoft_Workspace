import { test, expect } from '@playwright/test';

test.describe('Account and cart browser flows', () => {
  test('redirects anonymous account orders visits to login with returnTo', async ({ page }) => {
    await page.goto('/account/orders');

    await expect(page).toHaveURL(/\/auth\/login\?returnTo=%2Faccount%2Forders/);
    await expect(page.getByRole('heading', { name: /log in|sign in/i }).first()).toBeVisible();
  });

  test('renders automatic shipping, tax, and total on the cart page', async ({ page }) => {
    await page.route('**/api/cart/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          success: true,
          subtotal: 1250,
          shippingAvailable: true,
          shippingRate: {
            carrier: 'ups',
            serviceName: 'UPS Next Day Air (Secure)',
            price: 24.5,
            estimatedDays: 1,
          },
          shippingTotal: 24.5,
          taxRate: 0.07,
          taxTotal: 89.62,
          total: 1364.12,
          destination: {
            city: 'Islamorada',
            state: 'FL',
          },
          source: 'store-default',
        },
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'galantes_cart',
        JSON.stringify([
          {
            id: '24',
            slug: 'the-islamorada-solitaire',
            name: 'The Islamorada Solitaire',
            price: 1250,
            quantity: 1,
            image_url: '/api/products/image?id=24',
          },
        ]),
      );
    });

    await page.goto('/cart');

    await expect(page.getByTestId('cart-shipping-total')).toHaveText('$24.50');
    await expect(page.getByTestId('cart-tax-total')).toHaveText('89.62');
    await expect(page.getByTestId('cart-order-total')).toHaveText('$1,364.12');
    await expect(page.getByTestId('cart-destination')).toContainText('Islamorada, FL');
  });

  test('falls back to the product image route when the cart item has no stored image', async ({ page }) => {
    let imageRequested = false;

    await page.route('**/api/products/image?id=24', async (route) => {
      imageRequested = true;
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2nLnoAAAAASUVORK5CYII=', 'base64'),
      });
    });

    await page.route('**/api/cart/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          success: true,
          subtotal: 1250,
          shippingAvailable: true,
          shippingRate: null,
          shippingTotal: 0,
          taxRate: 0,
          taxTotal: 0,
          total: 1250,
          destination: {
            city: 'Islamorada',
            state: 'FL',
          },
          source: 'store-default',
        },
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'galantes_cart',
        JSON.stringify([
          {
            id: '24',
            slug: 'the-islamorada-solitaire',
            name: 'The Islamorada Solitaire',
            price: 1250,
            quantity: 1,
          },
        ]),
      );
    });

    await page.goto('/cart');

    await expect(page.getByTestId('cart-product-image-24')).toHaveAttribute('src', /\/api\/products\/image\?id=24/);
    expect(imageRequested).toBe(true);
  });

  test('hydrates the cart from the shared cookie', async ({ page }) => {
    await page.addInitScript(() => {
      document.cookie = `galantes_cart_shared=${encodeURIComponent(JSON.stringify([
        {
          id: '31',
          slug: 'watche',
          name: 'watche',
          price: 1250,
          quantity: 1,
          image_url: '/api/products/image?id=31',
        },
      ]))}; path=/`;
    });

    await page.route('**/api/cart/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          success: true,
          shippingAvailable: true,
          shippingRate: null,
          shippingTotal: 0,
          taxRate: 0,
          taxTotal: 0,
          total: 1250,
        },
      });
    });

    await page.goto('/cart');

    await expect(page.getByRole('heading', { name: 'watche' })).toBeVisible();
    await expect(page.getByTestId('cart-product-image-31')).toHaveAttribute('src', /\/api\/products\/image\?id=31/);
  });

  test('falls back to the product image proxy when a stored image URL is broken', async ({ page }) => {
    await page.route('**/broken-image.png', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'text/plain',
        body: 'missing',
      });
    });

    await page.route('**/api/products/image?id=31', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2nLnoAAAAASUVORK5CYII=', 'base64'),
      });
    });

    await page.route('**/api/cart/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          success: true,
          shippingAvailable: true,
          shippingRate: null,
          shippingTotal: 0,
          taxRate: 0,
          taxTotal: 0,
          total: 1250,
        },
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'galantes_cart',
        JSON.stringify([
          {
            id: '31',
            slug: 'watche',
            name: 'watche',
            price: 1250,
            quantity: 1,
            image_url: '/broken-image.png',
          },
        ]),
      );
    });

    await page.goto('/cart');

    await expect(page.getByTestId('cart-product-image-31')).toHaveAttribute('src', /\/api\/products\/image\?id=31/);
  });
});
