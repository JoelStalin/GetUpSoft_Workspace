import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';

type PortalKind = 'admin' | 'client' | 'seller';

interface EasyCountUser {
  id: string;
  email: string;
  password_hash: string;
  scope: 'PLATFORM' | 'TENANT' | 'PARTNER';
  tenant_id: string | null;
  roles: string[];
  onboarding_status: string | null;
  mfa_secret: string | null;
}

@Injectable()
export class EasyCountAuthService {
  private readonly usersByEmail = new Map<string, EasyCountUser>();
  private readonly accessToUser = new Map<string, string>();
  private readonly tickets = new Map<string, { userId: string; portal: PortalKind; returnTo: string | null }>();

  constructor() {
    const admin: EasyCountUser = {
      id: randomUUID(),
      email: 'admin@getupsoft.com',
      password_hash: this.hash('admin123'),
      scope: 'PLATFORM',
      tenant_id: null,
      roles: ['platform_admin'],
      onboarding_status: null,
      mfa_secret: null,
    };
    this.usersByEmail.set(admin.email, admin);
  }

  login(email: string, password: string, _portal?: PortalKind) {
    const user = this.usersByEmail.get(email.toLowerCase());
    if (!user || user.password_hash !== this.hash(password)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const accessToken = `ec_at_${randomUUID()}`;
    const refreshToken = `ec_rt_${randomUUID()}`;
    this.accessToUser.set(accessToken, user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        scope: user.scope,
        tenant_id: user.tenant_id,
        roles: user.roles,
        onboarding_status: user.onboarding_status,
      },
      permissions: this.permissionsFor(user),
      mfa_required: Boolean(user.mfa_secret),
      challenge_id: user.mfa_secret ? randomUUID() : null,
    };
  }

  me(accessToken?: string) {
    if (!accessToken) {
      throw new UnauthorizedException('Not authenticated');
    }
    const userId = this.accessToUser.get(accessToken);
    if (!userId) throw new UnauthorizedException('Not authenticated');
    const user = [...this.usersByEmail.values()].find((item) => item.id === userId);
    if (!user) throw new UnauthorizedException('Not authenticated');
    return {
      access_token: accessToken,
      refresh_token: `ec_rt_${randomUUID()}`,
      user: {
        id: user.id,
        email: user.email,
        scope: user.scope,
        tenant_id: user.tenant_id,
        roles: user.roles,
        onboarding_status: user.onboarding_status,
      },
      permissions: this.permissionsFor(user),
      mfa_required: false,
      challenge_id: null,
    };
  }

  listSocialProviders() {
    return [
      { provider: 'google', label: 'Google' },
      { provider: 'microsoft', label: 'Microsoft' },
    ];
  }

  startSocialLogin(provider: string, portal: PortalKind, returnTo?: string) {
    const ticket = randomUUID();
    const user = [...this.usersByEmail.values()][0];
    this.tickets.set(ticket, { userId: user.id, portal, returnTo: returnTo ?? null });
    return {
      redirect_url: `https://auth.example/${provider}/callback?ticket=${ticket}&portal=${portal}`,
    };
  }

  exchangeSocialTicket(ticket: string, portal: PortalKind) {
    const record = this.tickets.get(ticket);
    if (!record || record.portal !== portal) {
      throw new UnauthorizedException('Invalid ticket');
    }
    const user = [...this.usersByEmail.values()].find((item) => item.id === record.userId);
    if (!user) throw new UnauthorizedException('Invalid ticket');
    return {
      accessToken: `ec_at_${randomUUID()}`,
      refreshToken: `ec_rt_${randomUUID()}`,
      user: {
        id: user.id,
        email: user.email,
        scope: user.scope,
        tenantId: user.tenant_id,
        roles: user.roles,
        onboardingStatus: user.onboarding_status,
      },
      permissions: this.permissionsFor(user),
      returnTo: record.returnTo,
    };
  }

  verifyMfa(_code: string, _challengeId?: string, _email?: string) {
    return {
      accessToken: `ec_at_${randomUUID()}`,
      refreshToken: `ec_rt_${randomUUID()}`,
      user: {
        id: randomUUID(),
        email: 'admin@getupsoft.com',
        scope: 'PLATFORM',
        tenantId: null,
        roles: ['platform_admin'],
        onboardingStatus: null,
      },
      permissions: ['*'],
      returnTo: null,
    };
  }

  private hash(input: string) {
    return createHash('sha256').update(input).digest('hex');
  }

  private permissionsFor(user: EasyCountUser) {
    if (user.scope === 'PLATFORM') return ['*'];
    if (user.scope === 'TENANT') return ['tenant:read', 'tenant:write'];
    return ['partner:read'];
  }
}

