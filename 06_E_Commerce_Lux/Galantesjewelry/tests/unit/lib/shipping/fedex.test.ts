/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFedExRates, resetFedExCacheForTests } from '@/lib/shipping/fedex';

function mockJsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe('FedEx shipping client', () => {
  beforeEach(() => {
    resetFedExCacheForTests();
    vi.restoreAllMocks();
    vi.stubEnv('FEDEX_BASE_URL', 'https://apis-sandbox.fedex.com');
    vi.stubEnv('FEDEX_CLIENT_ID', 'test-fedex-client-id');
    vi.stubEnv('FEDEX_CLIENT_SECRET', 'test-fedex-client-secret');
    vi.stubEnv('FEDEX_ACCOUNT_NUMBER', '123456789');
  });

  it('fetches an access token and returns the cheapest live FedEx rate', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(mockJsonResponse({
        access_token: 'fedex-token-123',
        expires_in: 3600,
      }))
      .mockResolvedValueOnce(mockJsonResponse({
        output: {
          rateReplyDetails: [
            {
              serviceType: 'FEDEX_2_DAY',
              serviceName: 'FedEx 2Day',
              ratedShipmentDetails: [
                {
                  totalNetCharge: {
                    amount: 42.35,
                    currency: 'USD',
                  },
                },
              ],
            },
            {
              serviceType: 'FEDEX_PRIORITY_OVERNIGHT',
              serviceName: 'FedEx Priority Overnight',
              ratedShipmentDetails: [
                {
                  totalNetCharge: {
                    amount: 68.1,
                    currency: 'USD',
                  },
                },
              ],
            },
          ],
        },
      }))
      .mockResolvedValueOnce(mockJsonResponse({
        output: {
          rateReplyDetails: [
            {
              serviceType: 'FEDEX_2_DAY',
              serviceName: 'FedEx 2Day',
              ratedShipmentDetails: [
                {
                  totalNetCharge: {
                    amount: 42.35,
                    currency: 'USD',
                  },
                },
              ],
            },
          ],
        },
      }));

    vi.stubGlobal('fetch', fetchMock);

    const rates = await getFedExRates(
      {
        street: '123 Ocean Dr',
        city: 'Miami',
        state: 'FL',
        zip: '33139',
        country: 'United States',
      },
      {
        weightLbs: 2.4,
        value: 1250,
      },
      18.75,
    );

    expect(rates).toHaveLength(1);
    expect(rates[0]).toMatchObject({
      carrier: 'fedex',
      serviceName: 'FedEx 2Day',
      price: 61.1,
      currency: 'USD',
      estimatedDays: 2,
      insuranceIncluded: true,
      insuranceValue: 1250,
    });

    const secondRates = await getFedExRates(
      {
        street: '123 Ocean Dr',
        city: 'Miami',
        state: 'FL',
        zip: '33139',
        country: 'United States',
      },
      {
        weightLbs: 2.4,
        value: 1250,
      },
      18.75,
    );

    expect(secondRates[0]).toMatchObject({
      carrier: 'fedex',
      serviceName: 'FedEx 2Day',
      price: 61.1,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('falls back to an estimated FedEx option when credentials are missing', async () => {
    vi.stubEnv('FEDEX_CLIENT_ID', '');
    vi.stubEnv('FEDEX_CLIENT_SECRET', '');
    vi.stubEnv('FEDEX_ACCOUNT_NUMBER', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const rates = await getFedExRates(
      {
        street: '123 Ocean Dr',
        city: 'Miami',
        state: 'FL',
        zip: '33139',
        country: 'United States',
      },
      {
        weightLbs: 2.4,
        value: 1250,
      },
      18.75,
    );

    expect(rates).toEqual([
      expect.objectContaining({
        carrier: 'fedex',
        serviceName: 'FedEx Priority Overnight (Estimated)',
        price: 80.75,
        estimatedDays: 1,
      }),
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
