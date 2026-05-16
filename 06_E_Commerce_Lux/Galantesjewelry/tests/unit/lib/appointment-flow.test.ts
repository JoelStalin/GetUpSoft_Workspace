/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  addAppointmentRecord: vi.fn(),
  buildAppointmentInterval: vi.fn(),
  createCalendarEvent: vi.fn(),
  getCalendarRuntimeConfig: vi.fn(),
  getMailRuntimeConfig: vi.fn(),
  isCalendarSlotAvailable: vi.fn(),
  resolveGoogleEnvironmentFromHost: vi.fn(),
  sendAppointmentNotification: vi.fn(),
  syncAppointmentToOdoo: vi.fn(),
  updateAppointmentRecord: vi.fn(),
}));

vi.mock('@/lib/appointments', () => ({
  addAppointmentRecord: mocks.addAppointmentRecord,
  buildAppointmentInterval: mocks.buildAppointmentInterval,
  sanitizeErrorMessage: (error: unknown) => error instanceof Error ? error.message : 'Unknown error',
  updateAppointmentRecord: mocks.updateAppointmentRecord,
}));

vi.mock('@/lib/google-calendar', () => ({
  createCalendarEvent: mocks.createCalendarEvent,
  getCalendarRuntimeConfig: mocks.getCalendarRuntimeConfig,
  isCalendarSlotAvailable: mocks.isCalendarSlotAvailable,
}));

vi.mock('@/lib/google-login', () => ({
  resolveGoogleEnvironmentFromHost: mocks.resolveGoogleEnvironmentFromHost,
}));

vi.mock('@/lib/mailer', () => ({
  getMailRuntimeConfig: mocks.getMailRuntimeConfig,
  sendAppointmentNotification: mocks.sendAppointmentNotification,
}));

vi.mock('@/lib/odoo-sync', () => ({
  syncAppointmentToOdoo: mocks.syncAppointmentToOdoo,
}));

describe('processAppointmentSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveGoogleEnvironmentFromHost.mockReturnValue('production');
    mocks.getCalendarRuntimeConfig.mockResolvedValue({
      timezone: 'America/New_York',
      durationMinutes: 60,
    });
    mocks.getMailRuntimeConfig.mockResolvedValue({ enabled: false });
    mocks.buildAppointmentInterval.mockReturnValue({
      start: new Date('2026-04-20T14:00:00.000Z'),
      end: new Date('2026-04-20T15:00:00.000Z'),
    });
    mocks.isCalendarSlotAvailable.mockResolvedValue(true);
    mocks.addAppointmentRecord.mockResolvedValue({
      id: 'appt_123',
      createdAt: '2026-04-20T12:00:00.000Z',
      updatedAt: '2026-04-20T12:00:00.000Z',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+13055550199',
      inquiryType: 'Bridal',
      message: 'Private consultation request',
      appointmentDate: '2026-04-20',
      appointmentTime: '10:00',
      timezone: 'America/New_York',
      durationMinutes: 60,
      status: 'received',
      googleEventId: '',
      googleEventLink: '',
      odooSyncStatus: 'not_attempted',
      odooPartnerId: '',
      odooAppointmentId: '',
      odooErrorMessage: '',
      emailDeliveryStatus: 'not_sent',
      errorMessage: '',
      clientIp: 'local',
      userAgent: 'vitest',
    });
    mocks.createCalendarEvent.mockResolvedValue({
      id: 'calendar-event-1',
      htmlLink: 'https://calendar.google.com/event?id=1',
    });
    mocks.updateAppointmentRecord.mockResolvedValue({});
    mocks.sendAppointmentNotification.mockResolvedValue(undefined);
    mocks.syncAppointmentToOdoo.mockResolvedValue({
      status: 'failed',
      partnerId: '',
      appointmentId: '',
      errorMessage: 'Odoo unavailable',
    });
  });

  it('logs structured diagnostics when Odoo sync fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const { processAppointmentSubmission } = await import('@/lib/appointment-flow');

    const result = await processAppointmentSubmission({
      submission: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+13055550199',
        inquiryType: 'Bridal',
        message: 'Private consultation request',
        appointmentDate: '2026-04-20',
        appointmentTime: '10:00',
        honeypot: '',
      },
      host: 'galantesjewelry.com',
      clientIp: '127.0.0.1',
      userAgent: 'vitest',
      logPrefix: 'APPOINTMENTS_TEST',
    });

    expect(result.statusCode).toBe(200);
    expect(result.body.success).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[APPOINTMENTS_TEST] Odoo sync failed',
      expect.objectContaining({
        appointmentId: 'appt_123',
        appointmentName: 'Jane Doe',
        appointmentEmail: 'jane@example.com',
        odooStatus: 'failed',
        odooErrorMessage: 'Odoo unavailable',
      }),
    );
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Odoo sync succeeded'), expect.anything());
  });
});
