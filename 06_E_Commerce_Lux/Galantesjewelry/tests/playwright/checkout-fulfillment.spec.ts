import { test, expect } from '@playwright/test';

test.describe('Checkout fulfillment options', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/account/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          authenticated: true,
          profile: {
            name: 'Ana Buyer',
            email: 'ana@example.com',
            phone: '3055550100',
            street: '123 Ocean Dr',
            street2: 'Suite 7',
            city: 'Miami',
            zip: '33139',
            state_id: 10,
            country_id: 233,
            state_name: 'Florida',
            country_name: 'United States',
          },
        },
      });
    });

    await page.route('**/api/account/addresses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: [
          {
            id: 501,
            name: 'Office',
            type: 'delivery',
            phone: '3055550199',
            street: '456 Coral Way',
            street2: '',
            city: 'Miami',
            zip: '33145',
            state_id: [10, 'Florida'],
            country_id: [233, 'United States'],
          },
        ],
      });
    });

    await page.route('**/api/shipping/rates', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          success: true,
          rates: [
            {
              carrier: 'pickup',
              serviceName: 'In-Store Pick-up (Islamorada)',
              price: 0,
              currency: 'USD',
              estimatedDays: 0,
              insuranceIncluded: true,
              insuranceValue: 1250,
            },
            {
              carrier: 'ups',
              serviceName: 'UPS Next Day Air (Secure)',
              price: 73.75,
              currency: 'USD',
              estimatedDays: 1,
              insuranceIncluded: true,
              insuranceValue: 1250,
            },
          ],
        },
      });
    });

  });

  test('prefills signed-in checkout data, lets customers choose saved addresses, and supports pickup', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem(
        'galantes_cart',
        JSON.stringify([
          {
            id: '24',
            product_id: '24',
            slug: 'the-islamorada-solitaire',
            name: 'The Islamorada Solitaire',
            price: 1250,
            quantity: 1,
            image_url: '/api/products/image?id=24',
          },
        ]),
      );
    });

    await page.goto('/checkout');

    await expect(page.getByTestId('checkout-name')).toHaveValue('Ana Buyer');
    await expect(page.getByTestId('checkout-email')).toHaveValue('ana@example.com');
    await expect(page.getByTestId('checkout-street')).toHaveValue('123 Ocean Dr');
    await expect(page.getByTestId('checkout-address-501')).toBeVisible();

    await page.getByTestId('checkout-address-501').click();
    await expect(page.getByTestId('checkout-street')).toHaveValue('456 Coral Way');
    await expect(page.getByTestId('checkout-state')).toHaveValue('10');
    await expect(page.getByTestId('checkout-city')).toHaveValue('Miami');
    await expect(page.getByTestId('shipping-rate-ups')).toBeVisible();
    await expect(page.getByTestId('checkout-shipping-total')).toHaveText('$73.75');

    await page.getByRole('button', { name: /use a new address/i }).click();
    await expect(page.getByTestId('checkout-street')).toHaveValue('');
    await expect(page.getByTestId('checkout-city')).toHaveValue('');
    await expect(page.getByTestId('checkout-zip')).toHaveValue('');

    await page.getByTestId('checkout-address-501').click();
    await expect(page.getByTestId('checkout-street')).toHaveValue('456 Coral Way');

    await page.getByTestId('delivery-method-pickup').click();
    await expect(page.getByRole('heading', { name: 'Boutique Pickup' })).toBeVisible();
    await expect(page.getByTestId('checkout-shipping-total')).toHaveText('FREE');
    await expect(page.getByTestId('checkout-continue')).toBeEnabled();
    await expect(page.getByTestId('checkout-street')).toHaveCount(0);
  });

  test('persists a USA shipping address before starting Stripe checkout', async ({ page }) => {
    let profilePatchBody: Record<string, unknown> | null = null;
    let stripeRequestBody: Record<string, unknown> | null = null;

    await page.unroute('**/api/account/profile');
    await page.route('**/api/account/profile', async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: {
            authenticated: true,
            profile: {
              name: 'Ana Buyer',
              email: 'ana@example.com',
              phone: '3055550100',
              street: '123 Ocean Dr',
              street2: 'Suite 7',
              city: 'Miami',
              zip: '33139',
              state_id: 10,
              country_id: 233,
              state_name: 'Florida',
              country_name: 'United States',
            },
          },
        });
        return;
      }

      if (method === 'PATCH') {
        profilePatchBody = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: { success: true },
        });
        return;
      }

      await route.continue();
    });

    await page.route('**/api/checkout/stripe', async (route) => {
      stripeRequestBody = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          clientSecret: 'pi_123456789_secret_abcdef123456',
        },
      });
    });

    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem(
        'galantes_cart',
        JSON.stringify([
          {
            id: '24',
            product_id: '24',
            slug: 'the-islamorada-solitaire',
            name: 'The Islamorada Solitaire',
            price: 1250,
            quantity: 1,
          },
        ]),
      );
    });

    await page.goto('/checkout');
    await expect(page.getByTestId('checkout-product-image-24')).toHaveAttribute('src', /\/api\/products\/image\?id=24/);

    await page.getByRole('button', { name: /use a new address/i }).click();
    await page.getByTestId('checkout-street').fill('789 Coral Ridge Way');
    await page.getByTestId('checkout-state').selectOption('10');
    await page.getByTestId('checkout-city').selectOption('Miami');
    await page.getByTestId('checkout-zip').fill('33139');

    await page.getByTestId('shipping-rate-ups').click();
    await expect(page.getByTestId('checkout-continue')).toBeEnabled();

    const profilePatchResponse = page.waitForResponse(
      (response) => response.url().includes('/api/account/profile') && response.request().method() === 'PATCH',
    );
    const stripeResponse = page.waitForResponse(
      (response) => response.url().includes('/api/checkout/stripe') && response.request().method() === 'POST',
    );

    await page.getByTestId('checkout-continue').click();
    await profilePatchResponse;
    await stripeResponse;

    await expect.poll(() => profilePatchBody).not.toBeNull();
    expect(profilePatchBody).toMatchObject({
      street: '789 Coral Ridge Way',
      city: 'Miami',
      zip: '33139',
      state_id: 10,
      country_id: 233,
    });

    await expect.poll(() => stripeRequestBody).not.toBeNull();
    expect(stripeRequestBody).toMatchObject({
      customerData: expect.objectContaining({
        city: 'Miami',
        state_id: 10,
        country_id: 233,
      }),
    });
  });
});
