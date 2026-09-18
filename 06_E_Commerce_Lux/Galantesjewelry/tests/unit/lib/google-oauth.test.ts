/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDecryptedGoogleIntegration, getGoogleIntegrationForEnvironment } from '@/lib/integrations';
import { getGoogleOAuthRuntimeConfig } from '@/lib/google-oauth';

vi.mock('@/lib/integrations', () => ({
  getDecryptedGoogleIntegration: vi.fn(async () => ({
    provider: 'google',
    environment: 'production',
    enabled: true,
    googleClientId: 'stored-client-id',
    redirectUri: 'https://galantesjewelry.com/auth/google/callback',
    javascriptOrigin: 'https://galantesjewelry.com',
    scopes: ['openid', 'email', 'profile'],
    connectedGoogleEmail: 'ceo@galantesjewelry.com',
    oauthConnectedAt: null,
    updatedAt: null,
    updatedBy: null,
    encryptedSecrets: {},
    secrets: {
      googleClientSecret: 'stored-client-secret',
      refreshToken: 'stored-refresh-token',
      accessToken: 'stored-access-token',
      apiKey: '',
    },
  })),
  getGoogleIntegrationForEnvironment: vi.fn(async () => ({
    provider: 'google',
    environment: 'production',
    enabled: true,
    googleClientId: 'stored-client-id',
    redirectUri: 'https://galantesjewelry.com/auth/google/callback',
    javascriptOrigin: 'https://galantesjewelry.com',
    scopes: ['openid', 'email', 'profile'],
    connectedGoogleEmail: 'ceo@galantesjewelry.com',
    oauthConnectedAt: null,
    updatedAt: null,
    updatedBy: null,
    encryptedSecrets: {},
  })),
}));

describe('getGoogleOAuthRuntimeConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('falls back to environment secrets when stored Google OAuth secrets cannot be decrypted', async () => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'env-client-secret');
    vi.stubEnv('GOOGLE_OAUTH_REFRESH_TOKEN', 'env-refresh-token');

    vi.mocked(getDecryptedGoogleIntegration).mockRejectedValueOnce(
      new Error('Unsupported state or unable to authenticate data'),
    );

    const config = await getGoogleOAuthRuntimeConfig('production');

    expect(vi.mocked(getGoogleIntegrationForEnvironment)).toHaveBeenCalledWith('production');
    expect(config.clientId).toBe('stored-client-id');
    expect(config.clientSecret).toBe('env-client-secret');
    expect(config.refreshToken).toBe('env-refresh-token');
    expect(config.connectedGoogleEmail).toBe('ceo@galantesjewelry.com');
  });
});
