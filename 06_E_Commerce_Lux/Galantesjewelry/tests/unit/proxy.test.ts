/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: URL) => ({ kind: 'redirect', url: url.toString() })),
  rewrite: vi.fn((url: URL) => ({ kind: 'rewrite', url: url.toString() })),
  next: vi.fn(() => ({ kind: 'next' })),
  verifyToken: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: mocks.redirect,
    rewrite: mocks.rewrite,
    next: mocks.next,
  },
}));

vi.mock('@/lib/auth', () => ({
  ADMIN_COOKIE_NAME: 'admin_session',
  getExpiredAdminCookieOptions: vi.fn(),
  verifyToken: mocks.verifyToken,
}));

describe('proxy', () => {
  beforeEach(() => {
    mocks.redirect.mockClear();
    mocks.rewrite.mockClear();
    mocks.next.mockClear();
    mocks.verifyToken.mockClear();
  });

  it('redirects www requests to the apex domain', async () => {
    const { default: proxy } = await import('@/proxy');
    const response = await proxy({
      url: 'https://www.galantesjewelry.com/shop?ref=home',
      nextUrl: {
        clone: () => new URL('https://www.galantesjewelry.com/shop?ref=home'),
      },
      headers: new Headers({ host: 'www.galantesjewelry.com' }),
      cookies: {
        get: vi.fn(),
      },
    } as never);

    expect(mocks.redirect).toHaveBeenCalledTimes(1);
    expect(mocks.redirect.mock.calls[0][0].toString()).toBe('https://galantesjewelry.com/shop?ref=home');
    expect(response).toEqual({
      kind: 'redirect',
      url: 'https://galantesjewelry.com/shop?ref=home',
    });
  });

  it('strips any forwarded port from www redirects', async () => {
    const { default: proxy } = await import('@/proxy');
    const response = await proxy({
      url: 'https://www.galantesjewelry.com:3000/collections?utm_source=test',
      nextUrl: {
        clone: () => new URL('https://www.galantesjewelry.com:3000/collections?utm_source=test'),
      },
      headers: new Headers({ host: 'www.galantesjewelry.com:3000' }),
      cookies: {
        get: vi.fn(),
      },
    } as never);

    expect(mocks.redirect).toHaveBeenCalledTimes(1);
    expect(mocks.redirect.mock.calls[0][0].toString()).toBe('https://galantesjewelry.com/collections?utm_source=test');
    expect(response).toEqual({
      kind: 'redirect',
      url: 'https://galantesjewelry.com/collections?utm_source=test',
    });
  });
});
