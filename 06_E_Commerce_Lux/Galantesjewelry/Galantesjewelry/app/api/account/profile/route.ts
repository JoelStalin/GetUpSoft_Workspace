import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthenticatedCustomerFromCookies } from '@/lib/customer-auth';
import { OdooService } from '@/lib/odoo/services';

export async function GET() {
  const cookieStore = await cookies();
  const user = await getAuthenticatedCustomerFromCookies(cookieStore);
  if (!user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const baseProfile = {
    name: user.name || user.username || '',
    email: user.email,
    phone: '',
    street: '',
    street2: '',
    city: '',
    zip: '',
    state_id: undefined as number | undefined,
    country_id: undefined as number | undefined,
    state_name: '',
    country_name: '',
  };

  try {
    const partnerId = await OdooService.getPartnerByEmail(user.email);
    if (!partnerId) {
      return NextResponse.json({ authenticated: true, profile: baseProfile });
    }

    const profile = await OdooService.getPartnerProfile(partnerId);
    return NextResponse.json({
      authenticated: true,
      profile: {
        ...baseProfile,
        name: profile?.name || baseProfile.name,
        phone: profile?.phone || '',
        street: profile?.street || '',
        street2: profile?.street2 || '',
        city: profile?.city || '',
        zip: profile?.zip || '',
        state_id: profile?.state_id?.[0],
        country_id: profile?.country_id?.[0],
        state_name: profile?.state_id?.[1] || '',
        country_name: profile?.country_id?.[1] || '',
      },
    });
  } catch (error) {
    console.error('API Profile Fetch Error:', error);
    return NextResponse.json({ authenticated: true, profile: baseProfile });
  }
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const user = await getAuthenticatedCustomerFromCookies(cookieStore);
  if (!user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Whitelist — email is auth-managed, cannot change here
  const allowed = ['name', 'phone', 'street', 'street2', 'city', 'zip', 'state_id', 'country_id'] as const;
  type ProfileUpdate = {
    name?: string;
    phone?: string;
    street?: string;
    street2?: string;
    city?: string;
    zip?: string;
    state_id?: number;
    country_id?: number;
  };
  const update: ProfileUpdate = {};
  for (const key of allowed) {
    const value = body[key];
    if (key === 'state_id' || key === 'country_id') {
      if (typeof value === 'number') {
        update[key] = value;
      }
      continue;
    }

    if (typeof value === 'string') {
      update[key] = value;
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  const partnerId = await OdooService.getPartnerByEmail(user.email)
    || await OdooService.findOrCreateCustomer({
      name: user.name || user.username || user.email,
      email: user.email,
    });
  if (!partnerId) {
    return NextResponse.json({ error: 'Partner not found in Odoo' }, { status: 404 });
  }

  const result = await OdooService.updatePartnerProfile(partnerId, update);
  if (!result.success) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
