/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRateLimitBuckets } from '@/lib/rate-limit';

const customerMocks = vi.hoisted(() => ({
  authenticateCustomerAccount: vi.fn(),
  registerCustomerAccount: vi.fn(),
  signCustomerSession: vi.fn(),
}));

vi.mock('@/lib/customer-auth', () => ({
  CUSTOMER_SESSION_COOKIE: 'customer_session',
  authenticateCustomerAccount: customerMocks.authenticateCustomerAccount,
  registerCustomerAccount: customerMocks.registerCustomerAccount,
  signCustomerSession: customerMocks.signCustomerSession,
  getCustomerSessionCookieOptions: () => ({
    httpOnly: true,
    maxAge: 3600,
    path: '/',
    sameSite: 'lax',
    secure: false,
  }),
}));

describe('auth route rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ADMIN_USERNAME', 'admin');
    vi.stubEnv('ADMIN_PASSWORD', 'correct-password');
    vi.stubEnv('ADMIN_SECRET_KEY', 'test_admin_secret_key_32_chars_minimum');
    clearRateLimitBuckets();
  });

  it('rate limits repeated admin login failures for the same client and username', async () => {
    const { POST } = await import('@/app/api/admin/auth/route');

    for (let index = 0; index < 8; index += 1) {
      const response = await POST(new Request('http://localhost/api/admin/auth', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.10' },
        body: JSON.stringify({ username: 'admin', password: 'wrong-password' }),
      }));

      expect(response.status).toBe(401);
    }

    const blocked = await POST(new Request('http://localhost/api/admin/auth', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.10' },
      body: JSON.stringify({ username: 'admin', password: 'wrong-password' }),
    }));

    expect(blocked.status).toBe(429);
    await expect(blocked.json()).resolves.toEqual({
      error: 'Demasiados intentos. Intenta de nuevo más tarde.',
    });
  });

  it('rate limits repeated customer login failures before authentication work continues', async () => {
    customerMocks.authenticateCustomerAccount.mockRejectedValue(new Error('Invalid username/email or password.'));
    const { POST } = await import('@/app/api/auth/customer/login/route');

    for (let index = 0; index < 10; index += 1) {
      const response = await POST(new Request('http://localhost/api/auth/customer/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.11' },
        body: JSON.stringify({ identifier: 'buyer@example.com', password: 'wrong-password' }),
      }));

      expect(response.status).toBe(401);
    }

    const blocked = await POST(new Request('http://localhost/api/auth/customer/login', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.11' },
      body: JSON.stringify({ identifier: 'buyer@example.com', password: 'wrong-password' }),
    }));

    expect(blocked.status).toBe(429);
    expect(customerMocks.authenticateCustomerAccount).toHaveBeenCalledTimes(10);
  });

  it('rate limits repeated customer registration attempts for the same client and email', async () => {
    customerMocks.registerCustomerAccount.mockResolvedValue({
      authMethod: 'password',
      email: 'buyer@example.com',
      name: 'Buyer',
      username: 'buyer',
    });
    customerMocks.signCustomerSession.mockResolvedValue('customer-token');
    const { POST } = await import('@/app/api/auth/customer/register/route');

    for (let index = 0; index < 5; index += 1) {
      const response = await POST(new Request('http://localhost/api/auth/customer/register', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.12' },
        body: JSON.stringify({
          username: 'buyer',
          name: 'Buyer',
          email: 'buyer@example.com',
          password: 'Password123!',
        }),
      }));

      expect(response.status).toBe(200);
    }

    const blocked = await POST(new Request('http://localhost/api/auth/customer/register', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.12' },
      body: JSON.stringify({
        username: 'buyer',
        name: 'Buyer',
        email: 'buyer@example.com',
        password: 'Password123!',
      }),
    }));

    expect(blocked.status).toBe(429);
    expect(customerMocks.registerCustomerAccount).toHaveBeenCalledTimes(5);
  });
});
