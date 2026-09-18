import { NextResponse } from 'next/server';
import {
  CUSTOMER_SESSION_COOKIE,
  authenticateCustomerAccount,
  getCustomerSessionCookieOptions,
  signCustomerSession,
} from '@/lib/customer-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const CUSTOMER_LOGIN_RATE_LIMIT = 10;
const CUSTOMER_LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = String(body.username || body.email || body.identifier || '').trim();
    const password = String(body.password || '');
    const rateLimitKey = `customer-login:${getClientIp(request)}:${identifier.toLowerCase()}`;

    if (!checkRateLimit({
      key: rateLimitKey,
      limit: CUSTOMER_LOGIN_RATE_LIMIT,
      windowMs: CUSTOMER_LOGIN_RATE_LIMIT_WINDOW_MS,
    })) {
      return NextResponse.json({ error: 'Too many sign-in attempts. Please try again later.' }, { status: 429 });
    }

    const customer = await authenticateCustomerAccount(identifier, password);
    const token = await signCustomerSession(customer);

    const response = NextResponse.json({
      success: true,
      user: customer,
    });

    response.cookies.set({
      ...getCustomerSessionCookieOptions(request),
      name: CUSTOMER_SESSION_COOKIE,
      value: token,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign in.';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

