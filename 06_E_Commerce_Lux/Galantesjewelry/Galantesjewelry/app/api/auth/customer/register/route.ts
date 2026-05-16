import { NextResponse } from 'next/server';
import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerSessionCookieOptions,
  registerCustomerAccount,
  signCustomerSession,
} from '@/lib/customer-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const CUSTOMER_REGISTER_RATE_LIMIT = 5;
const CUSTOMER_REGISTER_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim();
    const rateLimitKey = `customer-register:${getClientIp(request)}:${email.toLowerCase()}`;

    if (!checkRateLimit({
      key: rateLimitKey,
      limit: CUSTOMER_REGISTER_RATE_LIMIT,
      windowMs: CUSTOMER_REGISTER_RATE_LIMIT_WINDOW_MS,
    })) {
      return NextResponse.json({ error: 'Too many account creation attempts. Please try again later.' }, { status: 429 });
    }

    const customer = await registerCustomerAccount({
      username: String(body.username || '').trim(),
      name: String(body.name || '').trim(),
      email,
      password: String(body.password || ''),
    });

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
    const message = error instanceof Error ? error.message : 'Unable to create the account.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

