import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AdminLedgerEntryCreateDto,
  AdminPlanPayloadDto,
  AdminPlatformAIProviderPayloadDto,
  AdminTenantAIProviderPayloadDto,
  AdminTenantPayloadDto,
  AdminTenantPlanAssignmentDto,
  AdminTenantSettingsPayloadDto,
  AdminUserAIProviderPayloadDto,
} from './dto/easycount-admin.dto';

@Injectable()
export class EasyCountAdminService {
  private readonly tenants: Array<Record<string, unknown>> = [{ id: 1, name: 'Tenant Demo', rnc: '101010101', status: 'active' }];
  private readonly plans: Array<Record<string, unknown>> = [{ id: 1, name: 'Starter', price_monthly: 0 }];
  private readonly platformProviders: Array<Record<string, unknown>> = [{ id: 1, name: 'OpenAI', kind: 'llm' }];
  private readonly tenantProviders = new Map<number, Array<Record<string, unknown>>>();
  private readonly userProviders = new Map<number, Array<Record<string, unknown>>>();
  private readonly tenantSettings = new Map<number, Record<string, unknown>>();
  private readonly ledgerEntries = new Map<number, Array<Record<string, unknown>>>();

  requirePlatformUser(authorization?: string) {
    if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Authorization invalido');
    }
    return { role: 'platform_admin' };
  }

  listTenants() {
    return this.tenants;
  }
  createTenant(payload: AdminTenantPayloadDto) {
    const row = { id: this.tenants.length + 1, ...payload, status: 'active' };
    this.tenants.push(row);
    return row;
  }
  getTenant(id: number) {
    return this.tenants.find((t) => Number(t.id) === id) ?? { id, name: `Tenant ${id}`, status: 'active' };
  }
  updateTenant(id: number, payload: AdminTenantPayloadDto) {
    const row = this.getTenant(id);
    Object.assign(row, payload);
    return row;
  }

  dashboardKpis(month?: string) {
    return { month: month ?? new Date().toISOString().slice(0, 7), mrr: 120000, invoices: 38, tenants: this.tenants.length };
  }
  listInvoices(page: number, size: number) {
    const items = Array.from({ length: Math.min(size, 3) }).map((_, idx) => ({
      id: idx + 1 + (page - 1) * size,
      encf: `E31${String(idx + 1).padStart(9, '0')}`,
      estado_dgii: 'ACEPTADO',
      total: 1000 + idx * 100,
    }));
    return { total: 3, page, size, items };
  }
  getInvoice(id: number) {
    return { id, encf: `E31${String(id).padStart(9, '0')}`, lines: [], total: 1000 };
  }

  listPlans() {
    return this.plans;
  }
  createPlan(payload: AdminPlanPayloadDto) {
    const row = { id: this.plans.length + 1, ...payload };
    this.plans.push(row);
    return row;
  }
  updatePlan(id: number, payload: AdminPlanPayloadDto) {
    const row = this.plans.find((p) => Number(p.id) === id) ?? { id };
    Object.assign(row, payload);
    return row;
  }
  deletePlan(id: number) {
    const idx = this.plans.findIndex((p) => Number(p.id) === id);
    if (idx >= 0) this.plans.splice(idx, 1);
  }

  getAccountingSummary(tenantId: number) {
    return { tenant_id: tenantId, debit: 5000, credit: 3500, balance: 1500 };
  }
  listLedgerEntries(tenantId: number, page: number, size: number) {
    const list = this.ledgerEntries.get(tenantId) ?? [];
    const start = (page - 1) * size;
    return { total: list.length, page, size, items: list.slice(start, start + size) };
  }
  createLedgerEntry(tenantId: number, payload: AdminLedgerEntryCreateDto) {
    const list = this.ledgerEntries.get(tenantId) ?? [];
    const row = { id: list.length + 1, ...payload, created_at: new Date().toISOString() };
    list.unshift(row);
    this.ledgerEntries.set(tenantId, list);
    return row;
  }

  getTenantSettings(tenantId: number) {
    return this.tenantSettings.get(tenantId) ?? { tenant_id: tenantId, allow_manual_ncf: true, ai_enabled: true };
  }
  updateTenantSettings(tenantId: number, payload: AdminTenantSettingsPayloadDto) {
    const merged = { ...this.getTenantSettings(tenantId), ...payload, tenant_id: tenantId };
    this.tenantSettings.set(tenantId, merged);
    return merged;
  }
  assignTenantPlan(tenantId: number, payload: AdminTenantPlanAssignmentDto) {
    const plan = this.plans.find((p) => Number(p.id) === payload.plan_id);
    return { tenant_id: tenantId, plan_id: payload.plan_id, plan_name: plan?.name ?? 'Unknown', status: 'active' };
  }
  getTenantPlan(tenantId: number) {
    return { tenant_id: tenantId, plan_id: 1, plan_name: 'Starter', status: 'active' };
  }

  billingSummary(month?: string) {
    return { month: month ?? new Date().toISOString().slice(0, 7), billed: 92000, collected: 88000, pending: 4000 };
  }
  auditLogs(limit: number) {
    return Array.from({ length: Math.min(limit, 5) }).map((_, idx) => ({
      id: idx + 1,
      action: 'tenant.updated',
      actor: 'platform_admin',
      correlation_id: randomUUID(),
      created_at: new Date().toISOString(),
    }));
  }
  listUsers() {
    return [{ id: 1, email: 'admin@getupsoft.com', role: 'platform_admin' }];
  }

  listPlatformAiProviders() {
    return this.platformProviders;
  }
  createPlatformAiProvider(payload: AdminPlatformAIProviderPayloadDto) {
    const row = { id: this.platformProviders.length + 1, ...payload };
    this.platformProviders.push(row);
    return row;
  }
  updatePlatformAiProvider(providerId: number, payload: AdminPlatformAIProviderPayloadDto) {
    const row = this.platformProviders.find((p) => Number(p.id) === providerId) ?? { id: providerId };
    Object.assign(row, payload);
    return row;
  }
  deletePlatformAiProvider(providerId: number) {
    const idx = this.platformProviders.findIndex((p) => Number(p.id) === providerId);
    if (idx >= 0) this.platformProviders.splice(idx, 1);
  }

  listTenantAiProviders(tenantId: number) {
    return this.tenantProviders.get(tenantId) ?? [];
  }
  createTenantAiProvider(tenantId: number, payload: AdminTenantAIProviderPayloadDto) {
    const list = this.tenantProviders.get(tenantId) ?? [];
    const row = { id: list.length + 1, tenant_id: tenantId, ...payload };
    list.push(row);
    this.tenantProviders.set(tenantId, list);
    return row;
  }
  updateTenantAiProvider(tenantId: number, providerId: number, payload: AdminTenantAIProviderPayloadDto) {
    const list = this.tenantProviders.get(tenantId) ?? [];
    const row = list.find((p) => Number(p.id) === providerId) ?? { id: providerId, tenant_id: tenantId };
    Object.assign(row, payload);
    return row;
  }
  deleteTenantAiProvider(tenantId: number, providerId: number) {
    const list = this.tenantProviders.get(tenantId) ?? [];
    this.tenantProviders.set(
      tenantId,
      list.filter((row) => Number(row.id) !== providerId),
    );
  }

  listUserAiProviders(userId: number) {
    return this.userProviders.get(userId) ?? [];
  }
  createUserAiProvider(userId: number, payload: AdminUserAIProviderPayloadDto) {
    const list = this.userProviders.get(userId) ?? [];
    const row = { id: list.length + 1, user_id: userId, ...payload };
    list.push(row);
    this.userProviders.set(userId, list);
    return row;
  }
  updateUserAiProvider(userId: number, providerId: number, payload: AdminUserAIProviderPayloadDto) {
    const list = this.userProviders.get(userId) ?? [];
    const row = list.find((p) => Number(p.id) === providerId) ?? { id: providerId, user_id: userId };
    Object.assign(row, payload);
    return row;
  }
  deleteUserAiProvider(userId: number, providerId: number) {
    const list = this.userProviders.get(userId) ?? [];
    this.userProviders.set(
      userId,
      list.filter((row) => Number(row.id) !== providerId),
    );
  }
}
