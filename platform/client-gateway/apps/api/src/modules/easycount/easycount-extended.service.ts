import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EasyCountOdooTransmitDto } from './dto/easycount-extended.dto';

@Injectable()
export class EasyCountExtendedService {
  private readonly tours = new Map<number, Array<Record<string, unknown>>>();
  private readonly tenantApiInvoices = new Map<number, Array<Record<string, unknown>>>();
  private readonly operations = new Map<string, Record<string, unknown>>();

  requireAnyBearer(authorization?: string) {
    if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Authorization invalido');
    }
    return authorization.split(' ', 2)[1] ?? '';
  }

  requireTenantApi(authorization?: string, requiredScope: 'read' | 'write' = 'read') {
    const token = this.requireAnyBearer(authorization);
    const readOk = token.startsWith('ec_tapi_r_') || token.startsWith('ec_tapi_rw_');
    const writeOk = token.startsWith('ec_tapi_rw_');
    if (!readOk || (requiredScope === 'write' && !writeOk)) {
      throw new UnauthorizedException('Token API tenant invalido');
    }
    return { tenant_id: 1 };
  }

  requirePartner(authorization?: string) {
    this.requireAnyBearer(authorization);
    return { user_id: 1, role: 'partner_reseller' };
  }

  requirePlatform(authorization?: string) {
    this.requireAnyBearer(authorization);
    return { user_id: 1, role: 'platform_admin' };
  }

  listMyTours(userId: number) {
    return this.tours.get(userId) ?? [];
  }

  upsertTour(userId: number, viewKey: string, tourVersion: number, status: string, lastStep?: number) {
    const list = this.tours.get(userId) ?? [];
    let item = list.find((row) => String(row.viewKey) === viewKey);
    if (!item) {
      item = { viewKey, tourVersion, status, lastStep: lastStep ?? 0, completedAt: null };
      list.push(item);
    } else {
      item.tourVersion = tourVersion;
      item.status = status;
      item.lastStep = lastStep ?? null;
      item.completedAt = status === 'completed' ? new Date().toISOString() : null;
    }
    this.tours.set(userId, list);
    return item;
  }

  resetTour(userId: number, viewKey: string) {
    const existing = (this.tours.get(userId) ?? []).find((row) => String(row.viewKey) === viewKey);
    return this.upsertTour(userId, viewKey, Number(existing?.tourVersion ?? 1), 'pending', 0);
  }

  listTenantApiInvoices(tenantId: number, page: number, size: number) {
    const list = this.tenantApiInvoices.get(tenantId) ?? [];
    const start = (page - 1) * size;
    return { total: list.length, page, size, items: list.slice(start, start + size) };
  }

  getTenantApiInvoice(tenantId: number, invoiceId: number) {
    return (this.tenantApiInvoices.get(tenantId) ?? []).find((i) => Number(i.id) === invoiceId) ?? null;
  }

  createTenantApiInvoice(tenantId: number, customerName: string, amountTotal: number) {
    const list = this.tenantApiInvoices.get(tenantId) ?? [];
    const row = {
      id: list.length + 1,
      encf: `E31${String(list.length + 1).padStart(9, '0')}`,
      customer_name: customerName,
      amount_total: amountTotal,
      status: 'ISSUED',
      issued_at: new Date().toISOString(),
    };
    list.unshift(row);
    this.tenantApiInvoices.set(tenantId, list);
    return row;
  }

  partnerProfile(userId: number) {
    return { id: userId, full_name: 'Partner Demo', email: 'partner@getupsoft.com', role: 'partner_reseller' };
  }
  partnerDashboard(userId: number) {
    return { user_id: userId, tenants: 2, invoices_issued: 12, mrr: 45000 };
  }
  partnerTenants() {
    return [
      { id: 1, name: 'Tenant Demo', status: 'active' },
      { id: 2, name: 'Tenant Plus', status: 'active' },
    ];
  }
  partnerTenantOverview(tenantId: number) {
    return { tenant_id: tenantId, invoices_month: 5, revenue_month: 12000, status: 'active' };
  }
  partnerInvoices(page: number, size: number) {
    const items = Array.from({ length: Math.min(size, 3) }).map((_, idx) => ({
      id: idx + 1 + (page - 1) * size,
      tenant_id: 1,
      encf: `E31${String(idx + 1).padStart(9, '0')}`,
      total: 500 + idx * 100,
    }));
    return { total: 3, page, size, items };
  }
  partnerEmitInvoice(tenantId: number, amountTotal: number) {
    return {
      status: 'RECEIVED',
      tenant_id: tenantId,
      amount_total: amountTotal,
      track_id: `PARTNER-${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`,
    };
  }

  listOperations(limit: number) {
    const all = Array.from(this.operations.values());
    return { total: all.length, items: all.slice(0, limit) };
  }
  getOperation(operationId: string) {
    return this.operations.get(operationId) ?? { operation_id: operationId, state: 'PENDING', retry_count: 0 };
  }
  getOperationEvents(operationId: string) {
    return [
      { timestamp: new Date().toISOString(), level: 'info', message: `operation ${operationId} opened` },
      { timestamp: new Date().toISOString(), level: 'info', message: `operation ${operationId} in progress` },
    ];
  }
  retryOperation(operationId: string) {
    const current = this.getOperation(operationId);
    const next = { ...current, state: 'RETRIED', retry_count: Number(current.retry_count ?? 0) + 1 };
    this.operations.set(operationId, next);
    return next;
  }

  odooSearchRnc(term: string, limit: number) {
    return Array.from({ length: Math.min(limit, 5) }).map((_, idx) => ({
      rnc: `10${idx + 1}010101`,
      vat: `10${idx + 1}010101`,
      name: `${term} Empresa ${idx + 1}`,
      label: `${term} Empresa ${idx + 1}`,
      commercial_name: `${term} Co ${idx + 1}`,
      status: 'ACTIVE',
      category: 'LOCAL',
      comment: '',
      company_type: 'company',
      is_company: true,
      source: 'mock-local',
    }));
  }

  odooLookupRnc(fiscalId: string) {
    return {
      rnc: fiscalId,
      vat: fiscalId,
      name: `Empresa ${fiscalId}`,
      label: `Empresa ${fiscalId}`,
      commercial_name: `Empresa ${fiscalId}`,
      status: 'ACTIVE',
      category: 'LOCAL',
      comment: '',
      company_type: 'company',
      is_company: true,
      source: 'mock-local',
    };
  }

  odooTransmitInvoice(payload: EasyCountOdooTransmitDto) {
    return {
      status: 'RECEIVED',
      certia_track_id: `MOCK-${payload.odooInvoiceId}-${Date.now()}`,
      operation_id: null,
      correlation_id: randomUUID(),
      message: `Factura Odoo #${payload.odooInvoiceId} recibida.`,
    };
  }
}
