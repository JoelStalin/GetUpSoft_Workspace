import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, getAdminCookieOptions, signToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const ADMIN_AUTH_RATE_LIMIT = 8;
const ADMIN_AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || '';

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
    }

    const clientIp = getClientIp(request);
    const rateLimitKey = `admin-auth:${clientIp}:${username.trim().toLowerCase()}`;
    if (!checkRateLimit({
      key: rateLimitKey,
      limit: ADMIN_AUTH_RATE_LIMIT,
      windowMs: ADMIN_AUTH_RATE_LIMIT_WINDOW_MS,
    })) {
      return NextResponse.json({ error: 'Demasiados intentos. Intenta de nuevo más tarde.' }, { status: 429 });
    }

    if (!adminPass) {
      console.error('ADMIN_PASSWORD is not configured.');
      return NextResponse.json({ error: 'Configuracion incompleta del servidor' }, { status: 503 });
    }

    if (safeEqual(username, adminUser) && safeEqual(password, adminPass)) {
      const token = await signToken({ user: username });

      const response = NextResponse.json({ success: true, user: username });
      response.cookies.set({
        ...getAdminCookieOptions(request),
        name: ADMIN_COOKIE_NAME,
        value: token,
      });

      return response;
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
