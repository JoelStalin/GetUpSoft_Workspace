import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('EasyCount base migrated endpoints', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves easycount health endpoints', async () => {
    await request(app.getHttpServer()).get('/easycount/health').expect(200);
    await request(app.getHttpServer()).get('/easycount/healthz').expect(200);
    await request(app.getHttpServer()).get('/easycount/livez').expect(200);
    const ready = await request(app.getHttpServer()).get('/easycount/readyz').expect(200);
    expect(ready.body.status).toBe('ready');
    expect(ready.body.checks).toMatchObject({ database: true, redis: true });
  });

  it('supports easycount auth login and me', async () => {
    const login = await request(app.getHttpServer())
      .post('/easycount/auth/login')
      .send({ email: 'admin@getupsoft.com', password: 'admin123', portal: 'admin' })
      .expect(201);
    expect(login.body.access_token).toBeTruthy();
    expect(login.body.user.email).toBe('admin@getupsoft.com');

    await request(app.getHttpServer()).get('/easycount/me').set('Authorization', `Bearer ${login.body.access_token}`).expect(200);
  });

  it('supports easycount social auth endpoints', async () => {
    const providers = await request(app.getHttpServer()).get('/easycount/auth/oauth/providers').expect(200);
    expect(Array.isArray(providers.body)).toBe(true);

    const start = await request(app.getHttpServer())
      .get('/easycount/auth/oauth/google/start?portal=admin&return_to=%2Fdashboard')
      .expect(200);
    expect(start.body.redirect_url).toContain('ticket=');

    const url = new URL(start.body.redirect_url);
    const ticket = url.searchParams.get('ticket');
    expect(ticket).toBeTruthy();

    const exchange = await request(app.getHttpServer())
      .post('/easycount/auth/oauth/exchange')
      .send({ ticket, portal: 'admin' })
      .expect(200);
    expect(exchange.body.accessToken).toBeTruthy();
  });

  it('supports easycount dgii endpoints', async () => {
    await request(app.getHttpServer()).post('/easycount/dgii/auth/token').expect(201);
    const recepcion = await request(app.getHttpServer()).post('/easycount/dgii/recepcion/ecf').expect(202);
    expect(recepcion.body.trackId).toBeTruthy();
    await request(app.getHttpServer()).get(`/easycount/dgii/recepcion/status/${recepcion.body.trackId}`).expect(200);
    await request(app.getHttpServer()).post('/easycount/dgii/ecf/send').send({}).expect(201);
    await request(app.getHttpServer()).post('/easycount/dgii/rfce/send').send({}).expect(201);
    await request(app.getHttpServer()).post('/easycount/dgii/acecf/send').send({}).expect(201);
    await request(app.getHttpServer()).post('/easycount/dgii/arecf/send').send({}).expect(201);
    await request(app.getHttpServer()).get('/easycount/dgii/status/LOCAL-TEST-0001').expect(200);
    await request(app.getHttpServer()).post('/easycount/dgii/rfce/resumen').send({}).expect(202);
    await request(app.getHttpServer()).post('/easycount/dgii/acuse/arecef').send({}).expect(202);
    await request(app.getHttpServer()).post('/easycount/dgii/aprobacion/acecf').send({}).expect(202);
    await request(app.getHttpServer()).post('/easycount/dgii/anulacion/anecf').send({}).expect(202);
    await request(app.getHttpServer())
      .post('/easycount/dgii/certification/status')
      .send({ rnc: '101010101', password: 'secret' })
      .expect(201);
  });

  it('supports easycount receptor endpoints', async () => {
    await request(app.getHttpServer())
      .post('/easycount/receptor/arecf')
      .set('Content-Type', 'application/xml')
      .send('<ARECF></ARECF>')
      .expect(202);
    await request(app.getHttpServer())
      .post('/easycount/receptor/acecf')
      .set('Content-Type', 'application/xml')
      .send('<ACECF></ACECF>')
      .expect(202);
    await request(app.getHttpServer())
      .post('/easycount/receptor/anecf')
      .set('Content-Type', 'application/xml')
      .send('<ANECF></ANECF>')
      .expect(202);
  });

  it('supports easycount enfc endpoints', async () => {
    const recepcion = await request(app.getHttpServer())
      .post('/easycount/fe/recepcion/api/ecf')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ eNCF: 'E310000000001', rncComprador: '101010101' })
      .expect(200);
    expect(recepcion.body.trackId).toBeTruthy();

    const replay = await request(app.getHttpServer())
      .post('/easycount/fe/recepcion/api/ecf')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Idempotency-Key', 'same-key-1')
      .send({ eNCF: 'E310000000001', rncComprador: '101010101' })
      .expect(200);
    const replay2 = await request(app.getHttpServer())
      .post('/easycount/fe/recepcion/api/ecf')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Idempotency-Key', 'same-key-1')
      .send({ eNCF: 'E310000000001', rncComprador: '101010101' })
      .expect(200);
    expect(replay2.headers['idempotent-replay']).toBe('true');
    expect(replay2.body.trackId).toBe(replay.body.trackId);

    await request(app.getHttpServer())
      .post('/easycount/fe/aprobacioncomercial/api/ecf')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ eNCF: 'E310000000001', estado: 'APROBADO' })
      .expect(200);

    await request(app.getHttpServer()).get('/easycount/fe/autenticacion/api/semilla').set('Accept', 'application/json').expect(200);
    await request(app.getHttpServer())
      .post('/easycount/fe/autenticacion/api/validacioncertificado')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ semilla: 'abc' })
      .expect(200);
  });

  it('supports easycount cliente core endpoints', async () => {
    const login = await request(app.getHttpServer())
      .post('/easycount/auth/login')
      .send({ email: 'admin@getupsoft.com', password: 'admin123', portal: 'admin' })
      .expect(201);
    const token = login.body.access_token as string;

    await request(app.getHttpServer()).get('/easycount/cliente/health').expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/me').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/plans').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/plan').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer())
      .put('/easycount/cliente/plan')
      .set('Authorization', `Bearer ${token}`)
      .send({ plan_id: 2 })
      .expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/usage').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/invoices').set('Authorization', `Bearer ${token}`).expect(200);

    const issued = await request(app.getHttpServer())
      .post('/easycount/cliente/invoices/emit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customer_name: 'Cliente Demo',
        customer_rnc: '101010101',
        ncf_type: 'B01',
        amount_total: 1250,
      })
      .expect(201);
    expect(issued.body.encf).toBeTruthy();
    await request(app.getHttpServer())
      .get(`/easycount/cliente/invoices/${issued.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/easycount/cliente/invoices/${issued.body.id}/pdf`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/easycount/cliente/invoices/${issued.body.id}/xml`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/easycount/cliente/invoices/${issued.body.id}/send-email`)
      .set('Authorization', `Bearer ${token}`)
      .send({ recipient: 'cliente@demo.com' })
      .expect(201);

    await request(app.getHttpServer()).get('/easycount/cliente/certificates').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer())
      .post('/easycount/cliente/certificates?alias=MainCert&filename=cert.p12&activate=true')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    await request(app.getHttpServer())
      .post('/easycount/cliente/certificates/sign-xml')
      .set('Authorization', `Bearer ${token}`)
      .send({ xml: 'PHhtbD48L3htbD4=' })
      .expect(201);
    await request(app.getHttpServer()).get('/easycount/cliente/onboarding').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer())
      .put('/easycount/cliente/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({ company_name: 'Demo SRL' })
      .expect(200);

    await request(app.getHttpServer()).get('/easycount/cliente/api-tokens').set('Authorization', `Bearer ${token}`).expect(200);
    const apiToken = await request(app.getHttpServer())
      .post('/easycount/cliente/api-tokens')
      .set('Authorization', `Bearer ${token}`)
      .send({ label: 'integration' })
      .expect(201);
    await request(app.getHttpServer())
      .delete(`/easycount/cliente/api-tokens/${apiToken.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const recurring = await request(app.getHttpServer())
      .post('/easycount/cliente/recurring-invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mensualidad' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/easycount/cliente/recurring-invoices/${recurring.body.id}/pause`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    await request(app.getHttpServer())
      .put(`/easycount/cliente/recurring-invoices/${recurring.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mensualidad actualizada' })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/easycount/cliente/recurring-invoices/${recurring.body.id}/resume`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    await request(app.getHttpServer()).post('/easycount/cliente/recurring-invoices/run-due').set('Authorization', `Bearer ${token}`).expect(201);

    await request(app.getHttpServer())
      .post('/easycount/cliente/chat/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'Estado de mis facturas?' })
      .expect(201);
    await request(app.getHttpServer()).get('/easycount/cliente/chat/sessions').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/chat/sessions/1/messages').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).delete('/easycount/cliente/chat/sessions/1').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/chat/memory').set('Authorization', `Bearer ${token}`).expect(200);
    const memory = await request(app.getHttpServer())
      .post('/easycount/cliente/chat/memory')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Recordar preferencia de envío por correo' })
      .expect(201);
    await request(app.getHttpServer())
      .put(`/easycount/cliente/chat/memory/${memory.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Actualizar preferencia de envío' })
      .expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/chat/memory/search?q=preferencia').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).delete(`/easycount/cliente/chat/memory/${memory.body.id}`).set('Authorization', `Bearer ${token}`).expect(200);

    await request(app.getHttpServer())
      .post('/easycount/cliente/integrations/odoo/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({
        include_customers: true,
        include_vendors: true,
        include_products: true,
        include_invoices: true,
        limit: 10,
      })
      .expect(201);
    await request(app.getHttpServer()).get('/easycount/cliente/integrations/odoo/customers').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/integrations/odoo/vendors').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/integrations/odoo/products').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/easycount/cliente/integrations/odoo/invoices').set('Authorization', `Bearer ${token}`).expect(200);
  });

  it('supports easycount admin endpoints', async () => {
    const adminToken = 'ec_at_admin_contract_test';
    const auth = { Authorization: `Bearer ${adminToken}` };

    await request(app.getHttpServer()).get('/easycount/admin/tenants').set(auth).expect(200);
    const tenant = await request(app.getHttpServer())
      .post('/easycount/admin/tenants')
      .set(auth)
      .send({ name: 'Tenant QA', rnc: '131313131' })
      .expect(201);

    await request(app.getHttpServer()).get('/easycount/admin/dashboard/kpis').set(auth).expect(200);
    await request(app.getHttpServer()).get('/easycount/admin/invoices?page=1&size=5').set(auth).expect(200);
    await request(app.getHttpServer()).get('/easycount/admin/invoices/1').set(auth).expect(200);
    await request(app.getHttpServer()).get(`/easycount/admin/tenants/${tenant.body.id}`).set(auth).expect(200);
    await request(app.getHttpServer())
      .put(`/easycount/admin/tenants/${tenant.body.id}`)
      .set(auth)
      .send({ name: 'Tenant QA Updated', rnc: '131313131' })
      .expect(200);

    const plan = await request(app.getHttpServer())
      .post('/easycount/admin/plans')
      .set(auth)
      .send({ name: 'Scale', price_monthly: 2500 })
      .expect(201);
    await request(app.getHttpServer()).get('/easycount/admin/plans').set(auth).expect(200);
    await request(app.getHttpServer())
      .put(`/easycount/admin/plans/${plan.body.id}`)
      .set(auth)
      .send({ name: 'Scale+', price_monthly: 3000 })
      .expect(200);

    await request(app.getHttpServer()).get(`/easycount/admin/tenants/${tenant.body.id}/accounting/summary`).set(auth).expect(200);
    await request(app.getHttpServer())
      .post(`/easycount/admin/tenants/${tenant.body.id}/accounting/ledger`)
      .set(auth)
      .send({ description: 'Asiento QA', amount: 50 })
      .expect(201);
    await request(app.getHttpServer()).get(`/easycount/admin/tenants/${tenant.body.id}/accounting/ledger`).set(auth).expect(200);

    await request(app.getHttpServer()).get(`/easycount/admin/tenants/${tenant.body.id}/settings`).set(auth).expect(200);
    await request(app.getHttpServer())
      .put(`/easycount/admin/tenants/${tenant.body.id}/settings`)
      .set(auth)
      .send({ allow_manual_ncf: true, ai_enabled: true })
      .expect(200);
    await request(app.getHttpServer())
      .put(`/easycount/admin/tenants/${tenant.body.id}/plan`)
      .set(auth)
      .send({ plan_id: 1 })
      .expect(200);
    await request(app.getHttpServer()).get(`/easycount/admin/tenants/${tenant.body.id}/plan`).set(auth).expect(200);

    await request(app.getHttpServer()).get('/easycount/admin/billing/summary').set(auth).expect(200);
    await request(app.getHttpServer()).get('/easycount/admin/audit-logs').set(auth).expect(200);
    await request(app.getHttpServer()).get('/easycount/admin/users').set(auth).expect(200);

    const provider = await request(app.getHttpServer())
      .post('/easycount/admin/ai-providers')
      .set(auth)
      .send({ name: 'Provider QA', kind: 'llm' })
      .expect(201);
    await request(app.getHttpServer()).get('/easycount/admin/ai-providers').set(auth).expect(200);
    await request(app.getHttpServer())
      .put(`/easycount/admin/ai-providers/${provider.body.id}`)
      .set(auth)
      .send({ name: 'Provider QA v2', kind: 'llm' })
      .expect(200);

    const tenantProvider = await request(app.getHttpServer())
      .post(`/easycount/admin/tenants/${tenant.body.id}/ai-providers`)
      .set(auth)
      .send({ provider_id: 1, enabled: true })
      .expect(201);
    await request(app.getHttpServer()).get(`/easycount/admin/tenants/${tenant.body.id}/ai-providers`).set(auth).expect(200);
    await request(app.getHttpServer())
      .put(`/easycount/admin/tenants/${tenant.body.id}/ai-providers/${tenantProvider.body.id}`)
      .set(auth)
      .send({ provider_id: 1, enabled: false })
      .expect(200);

    const userProvider = await request(app.getHttpServer())
      .post('/easycount/admin/users/1/ai-providers')
      .set(auth)
      .send({ provider_id: 1, enabled: true })
      .expect(201);
    await request(app.getHttpServer()).get('/easycount/admin/users/1/ai-providers').set(auth).expect(200);
    await request(app.getHttpServer())
      .put(`/easycount/admin/users/1/ai-providers/${userProvider.body.id}`)
      .set(auth)
      .send({ provider_id: 1, enabled: false })
      .expect(200);

    await request(app.getHttpServer()).delete(`/easycount/admin/users/1/ai-providers/${userProvider.body.id}`).set(auth).expect(204);
    await request(app.getHttpServer())
      .delete(`/easycount/admin/tenants/${tenant.body.id}/ai-providers/${tenantProvider.body.id}`)
      .set(auth)
      .expect(204);
    await request(app.getHttpServer()).delete(`/easycount/admin/ai-providers/${provider.body.id}`).set(auth).expect(204);
    await request(app.getHttpServer()).delete(`/easycount/admin/plans/${plan.body.id}`).set(auth).expect(204);
  });

  it('supports easycount extended endpoints (ui tours, tenant-api, partner, operations, odoo)', async () => {
    const auth = { Authorization: 'Bearer ec_at_extended_test' };
    const tenantRead = { Authorization: 'Bearer ec_tapi_r_readtest' };
    const tenantWrite = { Authorization: 'Bearer ec_tapi_rw_writetest' };

    await request(app.getHttpServer()).get('/easycount/ui-tours/me').set(auth).expect(200);
    await request(app.getHttpServer())
      .put('/easycount/ui-tours/dashboard')
      .set(auth)
      .send({ tourVersion: 1, status: 'pending', lastStep: 1 })
      .expect(200);
    await request(app.getHttpServer()).post('/easycount/ui-tours/dashboard/reset').set(auth).expect(201);

    await request(app.getHttpServer()).get('/easycount/tenant-api/invoices').set(tenantRead).expect(200);
    const tenantInvoice = await request(app.getHttpServer())
      .post('/easycount/tenant-api/invoices')
      .set(tenantWrite)
      .send({ customer_name: 'Tenant API Client', amount_total: 2000 })
      .expect(201);
    await request(app.getHttpServer())
      .get(`/easycount/tenant-api/invoices/${tenantInvoice.body.id}`)
      .set(tenantRead)
      .expect(200);

    await request(app.getHttpServer()).get('/easycount/partner/me').set(auth).expect(200);
    await request(app.getHttpServer()).get('/easycount/partner/dashboard').set(auth).expect(200);
    await request(app.getHttpServer()).get('/easycount/partner/tenants').set(auth).expect(200);
    await request(app.getHttpServer()).get('/easycount/partner/tenants/1/overview').set(auth).expect(200);
    await request(app.getHttpServer()).get('/easycount/partner/invoices').set(auth).expect(200);
    await request(app.getHttpServer()).post('/easycount/partner/emit').set(auth).send({ tenant_id: 1, amount_total: 500 }).expect(201);

    await request(app.getHttpServer()).get('/easycount/operations').set(auth).expect(200);
    await request(app.getHttpServer()).get('/easycount/operations/op-1').set(auth).expect(200);
    await request(app.getHttpServer()).get('/easycount/operations/op-1/events').set(auth).expect(200);
    await request(app.getHttpServer()).post('/easycount/operations/op-1/retry').set(auth).expect(201);

    await request(app.getHttpServer()).get('/easycount/odoo/rnc/search?term=ACME&limit=3').expect(200);
    await request(app.getHttpServer()).get('/easycount/odoo/rnc/101010101').expect(200);
    await request(app.getHttpServer())
      .post('/easycount/odoo/invoices/transmit')
      .send({
        odooInvoiceId: 1,
        eCfType: '31',
        issueDate: '2026-05-23',
        totalAmount: 500,
        lines: [{ product_name: 'Servicio', quantity: 1, unit_price: 500 }],
      })
      .expect(202);
  });

  it('supports easycount internal/certificate-workflow/ecf endpoints', async () => {
    const internal = { 'X-Internal-Secret': 'secret123456' };

    await request(app.getHttpServer())
      .post('/easycount/internal/certificates/sign-xml')
      .set(internal)
      .send({ xml: 'PHhtbD48L3htbD4=', tenantId: 1 })
      .expect(201);
    await request(app.getHttpServer())
      .post('/easycount/internal/certificates/register?tenant_id=1&alias=Main')
      .set(internal)
      .expect(201);

    const generated = await request(app.getHttpServer())
      .post('/easycount/generate')
      .send({ certia_tenant_id: 1, l10n_latam_document_type: '31' })
      .expect(201);
    expect(generated.body.ncf).toBeTruthy();
    await request(app.getHttpServer()).get('/easycount/sync?tenant_id=1').expect(200);

    const intake = await request(app.getHttpServer())
      .post('/easycount/certificate-workflow/intake')
      .set(internal)
      .send({ case_id: 'CASE-QA-1', rnc: '101010101' })
      .expect(201);
    const caseId = intake.body.case_id as string;
    await request(app.getHttpServer()).get(`/easycount/certificate-workflow/${caseId}`).set(internal).expect(200);
    await request(app.getHttpServer()).post(`/easycount/certificate-workflow/${caseId}/validate-certificate`).set(internal).expect(201);
    await request(app.getHttpServer())
      .post(`/easycount/certificate-workflow/${caseId}/status`)
      .set(internal)
      .send({ status: 'READY_FOR_DGII' })
      .expect(201);

    const reminder = await request(app.getHttpServer())
      .post(`/easycount/certificate-workflow/${caseId}/reminders`)
      .set(internal)
      .send({ title: 'Follow up', hours: 2 })
      .expect(201);
    await request(app.getHttpServer()).get('/easycount/certificate-workflow/reminders/due').set(internal).expect(200);
    await request(app.getHttpServer())
      .post(`/easycount/certificate-workflow/reminders/${reminder.body.id}/resolve`)
      .set(internal)
      .expect(201);

    await request(app.getHttpServer()).post(`/easycount/certificate-workflow/${caseId}/store-secret`).set(internal).expect(201);
    await request(app.getHttpServer()).post(`/easycount/certificate-workflow/${caseId}/smoke-sign`).set(internal).expect(201);
    await request(app.getHttpServer()).post('/easycount/certificate-workflow/reminders/process-due').set(internal).expect(201);
    await request(app.getHttpServer()).post('/easycount/certificate-workflow/mail-intake/process').set(internal).expect(201);
    await request(app.getHttpServer()).get('/easycount/certificate-workflow/mail-intake/health').set(internal).expect(200);
    await request(app.getHttpServer())
      .post(`/easycount/certificate-workflow/${caseId}/dgii-certification-check`)
      .set(internal)
      .send({ live: false })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/easycount/certificate-workflow/${caseId}/submit-test-ecf`)
      .set(internal)
      .send({ live: false })
      .expect(201);
    await request(app.getHttpServer()).get(`/easycount/certificate-workflow/${caseId}/track-status`).set(internal).expect(200);
    await request(app.getHttpServer()).get(`/easycount/certificate-workflow/${caseId}/track-status/poll`).set(internal).expect(200);
    await request(app.getHttpServer()).post('/easycount/certificate-workflow/track-status/process-ready').set(internal).expect(201);

    const exec = await request(app.getHttpServer()).post(`/easycount/certificate-workflow/${caseId}/execution/start`).set(internal).expect(201);
    await request(app.getHttpServer())
      .post(`/easycount/certificate-workflow/${caseId}/checkpoint`)
      .set(internal)
      .send({ execution_id: exec.body.execution_id, step: 'PSC_REVIEW', action: 'checkpoint', result: 'ok' })
      .expect(201);
    await request(app.getHttpServer()).get(`/easycount/certificate-workflow/${caseId}/progress`).set(internal).expect(200);
    await request(app.getHttpServer()).post(`/easycount/certificate-workflow/${caseId}/resume`).set(internal).expect(200);
  });

  it('supports easycount legacy sign/receiver/ri/billing endpoints', async () => {
    await request(app.getHttpServer()).post('/easycount/acme/sign/xml').send({ xml: '<xml />' }).expect(201);
    await request(app.getHttpServer()).post('/easycount/sign/xml').send({ xml: '<xml />' }).expect(201);

    await request(app.getHttpServer())
      .post('/easycount/1/recv/ecf')
      .send({ encf: 'E310000000001', xml: '<ECF></ECF>' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/easycount/1/recv/ack')
      .send({ encf: 'E310000000001', estado: 0 })
      .expect(201);
    await request(app.getHttpServer())
      .post('/easycount/1/recv/approval')
      .send({ encf: 'E310000000001', estado: 1 })
      .expect(201);

    await request(app.getHttpServer()).post('/easycount/render?formato=both').send({ encf: 'E310000000001' }).expect(201);

    await request(app.getHttpServer())
      .post('/easycount/1/billing/ecf')
      .send({ encf: 'E310000000001', rnc_comprador: '101010101', total: 100 })
      .expect(201);
    await request(app.getHttpServer()).post('/easycount/1/billing/rfce').send({ encf: 'E310000000001', total: 100 }).expect(201);
    await request(app.getHttpServer())
      .post('/easycount/1/billing/arecf')
      .send({ encf: 'E310000000001', rnc_comprador: '101010101', estado: 0 })
      .expect(201);
    await request(app.getHttpServer())
      .post('/easycount/1/billing/acecf')
      .send({ encf: 'E310000000001', rnc_comprador: '101010101', estado: 0 })
      .expect(201);
    await request(app.getHttpServer())
      .post('/easycount/1/billing/anecf')
      .send({ tipo_ecf: '31', desde: 1, hasta: 2 })
      .expect(201);
  });
});
