/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  getAuthenticatedCustomerFromCookies: vi.fn(),
  getPartnerByEmail: vi.fn(),
  getPartnerProfile: vi.fn(),
  updatePartnerProfile: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
}));

vi.mock('@/lib/customer-auth', () => ({
  getAuthenticatedCustomerFromCookies: mocks.getAuthenticatedCustomerFromCookies,
}));

vi.mock('@/lib/odoo/services', () => ({
  OdooService: {
    getPartnerByEmail: mocks.getPartnerByEmail,
    getPartnerProfile: mocks.getPartnerProfile,
    updatePartnerProfile: mocks.updatePartnerProfile,
  },
}));

describe('GET /api/account/profile', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.cookies.mockReset();
    mocks.getAuthenticatedCustomerFromCookies.mockReset();
    mocks.getPartnerByEmail.mockReset();
    mocks.getPartnerProfile.mockReset();
    mocks.updatePartnerProfile.mockReset();
    mocks.cookies.mockResolvedValue({ get: vi.fn() });
  });

  it('returns 401 when the customer is not authenticated', async () => {
    mocks.getAuthenticatedCustomerFromCookies.mockResolvedValue(null);

    const { GET } = await import('@/app/api/account/profile/route');
    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid session' });
    expect(mocks.getPartnerByEmail).not.toHaveBeenCalled();
  });

  it('returns safe account and Odoo profile data for authenticated customers', async () => {
    mocks.getAuthenticatedCustomerFromCookies.mockResolvedValue({
      email: 'ana@example.com',
      name: 'Ana Buyer',
      username: 'ana',
      authMethod: 'password',
    });
    mocks.getPartnerByEmail.mockResolvedValue(44);
    mocks.getPartnerProfile.mockResolvedValue({
      name: 'Ana Buyer',
      phone: '3055550100',
      street: '123 Ocean Dr',
      street2: 'Suite 7',
      city: 'Miami',
      zip: '33139',
      state_id: [10, 'Florida'],
      country_id: [233, 'United States'],
    });

    const { GET } = await import('@/app/api/account/profile/route');
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
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
    });
  });

  it('persists a profile shipping address update for authenticated customers', async () => {
    mocks.getAuthenticatedCustomerFromCookies.mockResolvedValue({
      email: 'ana@example.com',
      name: 'Ana Buyer',
      username: 'ana',
      authMethod: 'password',
    });
    mocks.getPartnerByEmail.mockResolvedValue(44);
    mocks.updatePartnerProfile.mockResolvedValue({ success: true });

    const { PATCH } = await import('@/app/api/account/profile/route');
    const response = await PATCH(new Request('http://localhost/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        street: '123 Ocean Dr',
        street2: 'Suite 7',
        city: 'Miami',
        zip: '33139',
        state_id: 10,
        country_id: 233,
      }),
    }) as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(mocks.updatePartnerProfile).toHaveBeenCalledWith(44, expect.objectContaining({
      street: '123 Ocean Dr',
      street2: 'Suite 7',
      city: 'Miami',
      zip: '33139',
      state_id: 10,
      country_id: 233,
    }));
  });
});
