import { createOdooClient } from '../config/odooClient.js';
import { ledgerService } from './ledgerService';

export interface OdooAppointment {
  id?: number;
  name: string;
  partner_id: number;
  start_date: string;
  end_date: string;
  state: 'draft' | 'confirmed' | 'cancelled';
}

export class OdooSyncService {
  private client: any;

  constructor() {
    this.client = createOdooClient();
  }

  async syncAppointment(appointment: OdooAppointment): Promise<number> {
    try {
      console.log(`[OdooSync] Syncing appointment: ${appointment.name}`);
      const result = await this.client.create('galante.appointment', {
        name: appointment.name,
        partner_id: appointment.partner_id,
        start_date: appointment.start_date,
        end_date: appointment.end_date,
        state: appointment.state,
      });

      await ledgerService.logExecution(`Sync successful for appointment ${appointment.name}. Odoo ID: ${result}`);
      return result;
    } catch (error: any) {
      console.error('[OdooSync] Error syncing appointment:', error);
      await ledgerService.logExecution(`Sync failed for appointment ${appointment.name}: ${error.message}`);
      throw error;
    }
  }

  async getPartners(email?: string): Promise<any[]> {
    const domain = email ? [['email', '=', email]] : [];
    return this.client.searchRead('res.partner', {
      domain,
      fields: ['id', 'name', 'email'],
    });
  }
}

export const odooSyncService = new OdooSyncService();
