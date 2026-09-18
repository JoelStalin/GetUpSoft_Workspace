/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAdminSessionFromRequest: vi.fn(),
  listAppointmentRecords: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getAdminSessionFromRequest: mocks.getAdminSessionFromRequest,
}));

vi.mock('@/lib/appointments', () => ({
  listAppointmentRecords: mocks.listAppointmentRecords,
}));

describe('/api/admin/appointments', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.getAdminSessionFromRequest.mockReset();
    mocks.listAppointmentRecords.mockReset();
    mocks.getAdminSessionFromRequest.mockResolvedValue({ username: 'admin' });
    mocks.listAppointmentRecords.mockResolvedValue([]);
  });

  it('passes valid Odoo sync filters to appointment storage', async () => {
    const { GET } = await import('@/app/api/admin/appointments/route');

    const response = await GET(new Request('https://galantesjewelry.com/api/admin/appointments?limit=500&odooSyncStatus=failed'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.listAppointmentRecords).toHaveBeenCalledWith({ limit: 250, odooSyncStatus: 'failed' });
    expect(body.appliedFilters).toEqual({ odooSyncStatus: 'failed' });
  });

  it('ignores invalid Odoo sync filters', async () => {
    const { GET } = await import('@/app/api/admin/appointments/route');

    const response = await GET(new Request('https://galantesjewelry.com/api/admin/appointments?limit=10&odooSyncStatus=../../bad'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.listAppointmentRecords).toHaveBeenCalledWith({ limit: 10, odooSyncStatus: undefined });
    expect(body.appliedFilters).toEqual({ odooSyncStatus: 'all' });
  });

  it('requires an admin session', async () => {
    mocks.getAdminSessionFromRequest.mockResolvedValue(null);
    const { GET } = await import('@/app/api/admin/appointments/route');

    const response = await GET(new Request('https://galantesjewelry.com/api/admin/appointments'));

    expect(response.status).toBe(401);
    expect(mocks.listAppointmentRecords).not.toHaveBeenCalled();
  });
});
