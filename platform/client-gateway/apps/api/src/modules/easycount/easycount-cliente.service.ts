import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EasyCountInvoiceEmitRequestDto } from './dto/easycount-cliente.dto';

export interface TenantContext {
  tenant_id: number;
  role: string;
  sub?: number;
}

@Injectable()
export class EasyCountClienteService {
  private readonly plans = [
    { id: 1, name: 'Starter', price_monthly: 0, currency: 'DOP', limits: { invoices_monthly: 50 } },
    { id: 2, name: 'Pro', price_monthly: 1500, currency: 'DOP', limits: { invoices_monthly: 500 } },
    { id: 3, name: 'Enterprise', price_monthly: 5000, currency: 'DOP', limits: { invoices_monthly: 5000 } },
  ];
  private readonly tenantPlan = new Map<number, number>();
  private readonly invoices = new Map<number, Array<Record<string, unknown>>>();
  private readonly certificates = new Map<number, Array<Record<string, unknown>>>();
  private readonly onboarding = new Map<number, Record<string, unknown>>();
  private readonly apiTokens = new Map<number, Array<Record<string, unknown>>>();
  private readonly recurring = new Map<number, Array<Record<string, unknown>>>();
  private readonly chatSessions = new Map<number, Array<Record<string, unknown>>>();
  private readonly chatMemory = new Map<number, Array<Record<string, unknown>>>();

  requireTenant(authorization?: string): TenantContext {
    if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Authorization invalido');
    }
    // Migration-phase token parser: accepts easycount auth tokens
    const token = authorization.split(' ', 2)[1];
    if (!token || !token.startsWith('ec_at_')) {
      throw new UnauthorizedException('Token invalido');
    }
    return { tenant_id: 1, role: 'tenant_user', sub: 1 };
  }

  me(context: TenantContext) {
    return { user: context };
  }

  listPlans() {
    return this.plans;
  }

  getPlan(tenantId: number) {
    const selectedPlan = this.tenantPlan.get(tenantId) ?? 1;
    const plan = this.plans.find((item) => item.id === selectedPlan) ?? this.plans[0];
    return {
      tenant_id: tenantId,
      plan_id: plan.id,
      plan_name: plan.name,
      status: 'active',
      started_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    };
  }

  requestPlanChange(tenantId: number, planId: number) {
    const exists = this.plans.some((item) => item.id === planId);
    if (!exists) throw new UnauthorizedException('Plan invalido');
    this.tenantPlan.set(tenantId, planId);
    return this.getPlan(tenantId);
  }

  usageSummary(tenantId: number, month?: string, page = 1, size = 20) {
    const tenantInvoices = this.invoices.get(tenantId) ?? [];
    const selectedMonth = month ?? new Date().toISOString().slice(0, 7);
    const filtered = tenantInvoices.filter((item) => String(item.issued_at).startsWith(selectedMonth));
    const start = (page - 1) * size;
    const items = filtered.slice(start, start + size);
    return {
      month: selectedMonth,
      total: filtered.length,
      page,
      size,
      items,
    };
  }

  listInvoices(tenantId: number, page = 1, size = 20) {
    const tenantInvoices = this.invoices.get(tenantId) ?? [];
    const total = tenantInvoices.length;
    const start = (page - 1) * size;
    return {
      total,
      page,
      size,
      items: tenantInvoices.slice(start, start + size),
    };
  }

  getInvoiceDetail(tenantId: number, invoiceId: number) {
    const invoice = (this.invoices.get(tenantId) ?? []).find((item) => Number(item.id) === invoiceId);
    if (!invoice) {
      return {
        id: invoiceId,
        encf: `E31${String(invoiceId).padStart(9, '0')}`,
        status: 'NOT_FOUND',
        amount_total: 0,
      };
    }
    return invoice;
  }

  emitInvoice(tenantId: number, payload: EasyCountInvoiceEmitRequestDto) {
    const tenantInvoices = this.invoices.get(tenantId) ?? [];
    const id = tenantInvoices.length + 1;
    const created = {
      id,
      encf: `E31${String(id).padStart(9, '0')}`,
      status: 'ISSUED',
      customer_name: payload.customer_name,
      customer_rnc: payload.customer_rnc,
      ncf_type: payload.ncf_type,
      amount_total: payload.amount_total,
      issued_at: new Date().toISOString(),
      track_id: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`,
    };
    tenantInvoices.unshift(created);
    this.invoices.set(tenantId, tenantInvoices);
    return created;
  }

  invoicePdf(tenantId: number, invoiceId: number) {
    const detail = this.getInvoiceDetail(tenantId, invoiceId);
    const content = `%PDF-1.4\n% Mock EasyCount PDF for ${String(detail.encf ?? invoiceId)}\n%%EOF`;
    return Buffer.from(content, 'utf8');
  }

  invoiceXml(tenantId: number, invoiceId: number) {
    const detail = this.getInvoiceDetail(tenantId, invoiceId);
    return Buffer.from(
      JSON.stringify(
        {
          encf: detail.encf,
          tenant_id: tenantId,
          invoice_id: invoiceId,
          exported_at: new Date().toISOString(),
        },
        null,
        2,
      ),
      'utf8',
    );
  }

  sendInvoiceEmail(tenantId: number, invoiceId: number, recipient: string) {
    return {
      status: 'SENT',
      message: `Factura ${invoiceId} enviada a ${recipient}`,
      tenant_id: tenantId,
    };
  }

  listCertificates(tenantId: number) {
    return { items: this.certificates.get(tenantId) ?? [] };
  }

  uploadCertificate(tenantId: number, alias: string, filename: string, activate = true) {
    const list = this.certificates.get(tenantId) ?? [];
    const item = {
      id: list.length + 1,
      alias,
      filename,
      active: activate,
      uploaded_at: new Date().toISOString(),
    };
    list.unshift(item);
    if (activate) {
      for (const row of list) row.active = row.id === item.id;
    }
    this.certificates.set(tenantId, list);
    return item;
  }

  signXml(tenantId: number, xmlBase64: string) {
    return {
      xmlSigned: xmlBase64,
      certificateId: (this.certificates.get(tenantId)?.[0]?.id ?? null),
      certificateAlias: (this.certificates.get(tenantId)?.[0]?.alias ?? null),
      certificateSubject: 'CN=EasyCount Tenant Cert',
      source: 'tenant-store',
    };
  }

  getOnboarding(tenantId: number) {
    return (
      this.onboarding.get(tenantId) ?? {
        completed: false,
        company_name: null,
        updated_at: null,
      }
    );
  }

  completeOnboarding(tenantId: number, companyName: string) {
    const state = {
      completed: true,
      company_name: companyName,
      updated_at: new Date().toISOString(),
    };
    this.onboarding.set(tenantId, state);
    return state;
  }

  listApiTokens(tenantId: number) {
    return this.apiTokens.get(tenantId) ?? [];
  }

  createApiToken(tenantId: number, label: string) {
    const list = this.apiTokens.get(tenantId) ?? [];
    const item = {
      id: list.length + 1,
      label,
      token_preview: `tok_${randomUUID().slice(0, 8)}...`,
      created_at: new Date().toISOString(),
      revoked: false,
    };
    list.unshift(item);
    this.apiTokens.set(tenantId, list);
    return { ...item, token: `tok_${randomUUID().replace(/-/g, '')}` };
  }

  revokeApiToken(tenantId: number, tokenId: number) {
    const list = this.apiTokens.get(tenantId) ?? [];
    const item = list.find((row) => Number(row.id) === tokenId);
    if (!item) return { id: tokenId, revoked: true };
    item.revoked = true;
    return item;
  }

  listRecurring(tenantId: number) {
    return this.recurring.get(tenantId) ?? [];
  }

  createRecurring(tenantId: number, name: string) {
    const list = this.recurring.get(tenantId) ?? [];
    const item = { id: list.length + 1, name, status: 'active', created_at: new Date().toISOString() };
    list.unshift(item);
    this.recurring.set(tenantId, list);
    return item;
  }

  updateRecurring(tenantId: number, scheduleId: number, name: string) {
    const list = this.recurring.get(tenantId) ?? [];
    const item = list.find((row) => Number(row.id) === scheduleId);
    if (!item) return { id: scheduleId, name, status: 'active' };
    item.name = name;
    item.updated_at = new Date().toISOString();
    return item;
  }

  markRecurring(tenantId: number, scheduleId: number, status: 'paused' | 'active') {
    const list = this.recurring.get(tenantId) ?? [];
    const item = list.find((row) => Number(row.id) === scheduleId);
    if (!item) return { id: scheduleId, status };
    item.status = status;
    return item;
  }

  runDueRecurring(tenantId: number) {
    const list = this.recurring.get(tenantId) ?? [];
    return { processed: list.filter((row) => row.status === 'active').length, failed: 0 };
  }

  askChat(tenantId: number, question: string) {
    const sessions = this.chatSessions.get(tenantId) ?? [];
    const session = sessions[0] ?? { id: 1, title: 'Sesion principal', created_at: new Date().toISOString() };
    if (sessions.length === 0) sessions.unshift(session);
    this.chatSessions.set(tenantId, sessions);
    return {
      answer: `Respuesta simulada para: ${question}`,
      session_id: session.id,
      confidence: 0.87,
    };
  }

  listChatSessions(tenantId: number) {
    return this.chatSessions.get(tenantId) ?? [];
  }

  deleteChatSession(tenantId: number, sessionId: number) {
    const list = this.chatSessions.get(tenantId) ?? [];
    this.chatSessions.set(
      tenantId,
      list.filter((item) => Number(item.id) !== sessionId),
    );
  }

  getChatMessages(_tenantId: number, sessionId: number) {
    return [
      { id: 1, session_id: sessionId, role: 'user', content: 'Hola', created_at: new Date().toISOString() },
      { id: 2, session_id: sessionId, role: 'assistant', content: 'Hola, en que te ayudo?', created_at: new Date().toISOString() },
    ];
  }

  listMemory(tenantId: number) {
    return this.chatMemory.get(tenantId) ?? [];
  }

  searchMemory(tenantId: number, query: string) {
    return (this.chatMemory.get(tenantId) ?? []).filter((row) => String(row.content).toLowerCase().includes(query.toLowerCase()));
  }

  createMemory(tenantId: number, content: string) {
    const list = this.chatMemory.get(tenantId) ?? [];
    const item = { id: list.length + 1, content, created_at: new Date().toISOString() };
    list.unshift(item);
    this.chatMemory.set(tenantId, list);
    return item;
  }

  updateMemory(tenantId: number, memoryId: number, content: string) {
    const list = this.chatMemory.get(tenantId) ?? [];
    const item = list.find((row) => Number(row.id) === memoryId);
    if (!item) return { id: memoryId, content, updated_at: new Date().toISOString() };
    item.content = content;
    item.updated_at = new Date().toISOString();
    return item;
  }

  deleteMemory(tenantId: number, memoryId: number) {
    const list = this.chatMemory.get(tenantId) ?? [];
    const filtered = list.filter((row) => Number(row.id) !== memoryId);
    this.chatMemory.set(tenantId, filtered);
  }

  syncOdoo(
    _tenantId: number,
    includeCustomers: boolean,
    includeVendors: boolean,
    includeProducts: boolean,
    includeInvoices: boolean,
    limit: number,
  ) {
    const base = Math.max(1, Math.min(limit, 100));
    return {
      status: 'SYNCED',
      customers: includeCustomers ? Math.min(base, 12) : 0,
      vendors: includeVendors ? Math.min(base, 8) : 0,
      products: includeProducts ? Math.min(base, 30) : 0,
      invoices: includeInvoices ? Math.min(base, 20) : 0,
      message: 'Sincronizacion Odoo completada.',
    };
  }

  listOdooPartners(kind: 'customer' | 'vendor', limit: number) {
    return Array.from({ length: Math.min(limit, 5) }).map((_, idx) => ({
      id: idx + 1,
      kind,
      name: `${kind === 'customer' ? 'Cliente' : 'Proveedor'} ${idx + 1}`,
      rnc: `10${idx + 1}010101`,
    }));
  }

  listOdooProducts(limit: number) {
    return Array.from({ length: Math.min(limit, 5) }).map((_, idx) => ({
      id: idx + 1,
      sku: `SKU-${idx + 1}`,
      name: `Producto ${idx + 1}`,
      price: 100 + idx * 10,
    }));
  }

  listOdooInvoices(limit: number) {
    return Array.from({ length: Math.min(limit, 5) }).map((_, idx) => ({
      id: idx + 1,
      encf: `E31${String(idx + 1).padStart(9, '0')}`,
      total: 1000 + idx * 100,
    }));
  }
}
