import { googleCalendarService, CalendarEvent } from './googleCalendarService';
import { odooSyncService, OdooAppointment } from './odooSyncService';
import { ledgerService } from './ledgerService';

export class OrchestratorService {
  async processAppointment(email: string, name: string, startTime: string, endTime: string) {
    await ledgerService.logExecution(`Starting orchestration for appointment: ${name} (${email})`);

    try {
      // 1. Buscar o crear partner en Odoo
      const partners = await odooSyncService.getPartners(email);
      let partnerId: number;

      if (partners.length > 0) {
        partnerId = partners[0].id;
        await ledgerService.logExecution(`Partner found in Odoo: ${partnerId}`);
      } else {
        // En un flujo real, crearíamos el partner. Por ahora asumimos que existe o fallamos.
        throw new Error(`Partner with email ${email} not found in Odoo.`);
      }

      // 2. Crear evento en Google Calendar
      const calendarEvent: CalendarEvent = {
        summary: `Cita Joyería: ${name}`,
        description: `Cita técnica para revisión de piezas para ${name}`,
        start: { dateTime: startTime, timeZone: 'America/Santo_Domingo' },
        end: { dateTime: endTime, timeZone: 'America/Santo_Domingo' },
        attendees: [{ email }],
      };

      const googleEventId = await googleCalendarService.createEvent(calendarEvent);
      await ledgerService.logExecution(`Google Event Created: ${googleEventId}`);

      // 3. Sincronizar en Odoo
      const odooAppointment: OdooAppointment = {
        name: `Cita: ${name} (Google ID: ${googleEventId})`,
        partner_id: partnerId,
        start_date: startTime,
        end_date: endTime,
        state: 'confirmed',
      };

      const odooId = await odooSyncService.syncAppointment(odooAppointment);
      await ledgerService.logExecution(`Odoo Appointment Created: ${odooId}`);

      await ledgerService.logExecution(`Orchestration completed successfully for ${name}`);
      return { googleEventId, odooId };
    } catch (error: any) {
      await ledgerService.logExecution(`Orchestration failed: ${error.message}`);
      throw error;
    }
  }
}

export const orchestratorService = new OrchestratorService();
