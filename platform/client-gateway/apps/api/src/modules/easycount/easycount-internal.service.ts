import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Injectable()
export class EasyCountInternalService {
  private readonly cases = new Map<string, Record<string, unknown>>();
  private readonly reminders = new Map<number, Record<string, unknown>>();
  private reminderSeq = 1;
  private readonly executions = new Map<string, Record<string, unknown>>();
  private readonly tenantUsage = new Map<number, Array<Record<string, unknown>>>();

  requireInternalSecret(secret?: string) {
    if (!secret || secret.length < 6) throw new UnauthorizedException('Internal secret invalido');
  }

  signXml(xmlBase64: string) {
    return {
      xmlSigned: xmlBase64,
      certificateId: 1,
      certificateAlias: 'InternalCert',
      certificateSubject: 'CN=Internal Cert',
      source: 'internal_service',
    };
  }

  registerCertificate(tenantId: number, alias: string) {
    return {
      id: 1,
      tenant_id: tenantId,
      alias,
      active: true,
      uploaded_at: new Date().toISOString(),
    };
  }

  ecfGenerate(tenantId: number, docType: string) {
    const usage = this.tenantUsage.get(tenantId) ?? [];
    const id = usage.length + 1;
    const ncf = `E${docType}${String(id).padStart(8, '0')}`;
    const row = {
      id,
      ncf,
      doc_type: docType,
      track_id: `TRK-${ncf}`,
      fecha: new Date().toISOString(),
    };
    usage.unshift(row);
    this.tenantUsage.set(tenantId, usage);
    return {
      status: 'GENERATED',
      ncf,
      track_id: row.track_id,
      message: `e-CF ${docType} generado por Certia API.`,
      quota: { used: usage.length, max: 9999 },
      odoo_payload: { amount_total: 0, date: new Date().toISOString() },
    };
  }

  ecfSync(tenantId: number) {
    const data = (this.tenantUsage.get(tenantId) ?? []).map((r) => ({
      ncf: r.ncf,
      doc_type: r.doc_type,
      track_id: r.track_id,
      amount_total: 0,
      date: r.fecha,
      description: `e-CF ${r.doc_type} — Certia API`,
    }));
    return { status: 'ok', tenant: `Tenant ${tenantId}`, count: data.length, data };
  }

  intake(payload: Record<string, unknown>) {
    const caseId = String(payload.case_id ?? `CASE-${Date.now()}`);
    const row = {
      case_id: caseId,
      status: 'PRECHECK_OK',
      rnc: String(payload.rnc ?? '101010101'),
      events: [{ event_type: 'INTAKE_COMPLETED', created_at: new Date().toISOString() }],
    };
    this.cases.set(caseId, row);
    return { case_id: caseId, status: 'PRECHECK_OK', errors: [], warnings: [], next_actions: [], case_dir: `mock/${caseId}` };
  }

  getCase(caseId: string) {
    return this.cases.get(caseId) ?? { case_id: caseId, status: 'INTAKE_COMPLETED', events: [] };
  }

  transitionCase(caseId: string, statusValue: string) {
    const row = this.getCase(caseId);
    row.status = statusValue;
    return row;
  }

  validateCertificate(caseId: string) {
    return {
      case_id: caseId,
      validation_status: 'VALID',
      subject: 'CN=Demo',
      serial_number: '123',
      has_private_key: true,
      sha256: randomUUID().replace(/-/g, ''),
      error: null,
    };
  }

  scheduleReminder(caseId: string, title: string, hours: number) {
    const id = this.reminderSeq++;
    const dueAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    const row = { id, case_id: caseId, status: 'PENDING', title, due_at: dueAt, resolved_at: null, metadata: {} };
    this.reminders.set(id, row);
    return row;
  }

  dueReminders(limit: number) {
    return Array.from(this.reminders.values()).slice(0, limit);
  }

  resolveReminder(reminderId: number) {
    const row = this.reminders.get(reminderId) ?? { id: reminderId, case_id: 'CASE-X', title: 'Reminder', due_at: new Date().toISOString() };
    row.status = 'RESOLVED';
    row.resolved_at = new Date().toISOString();
    this.reminders.set(reminderId, row);
    return row;
  }

  dgiiCheck(caseId: string, live = false) {
    return { case_id: caseId, status: 'READY_FOR_DGII', mode: live ? 'live' : 'simulated', token_obtained: live, directory_checked: live, detail: 'OK' };
  }

  dgiiSubmit(caseId: string, live = false) {
    return { case_id: caseId, status: 'READY_FOR_DGII', mode: live ? 'live' : 'simulated', track_id: `SIM-${Date.now()}`, detail: 'Submit ejecutado' };
  }

  dgiiTrackStatus(caseId: string, trackId?: string, live = false) {
    return { case_id: caseId, status: 'READY_FOR_DGII', mode: live ? 'live' : 'simulated', track_id: trackId ?? `SIM-${Date.now()}`, dgii_status: 'EN_PROCESO', detail: 'Consulta status' };
  }

  dgiiTrackPoll(caseId: string, trackId?: string, live = false) {
    return {
      case_id: caseId,
      status: live ? 'IN_PRODUCTION_USE' : 'READY_FOR_DGII',
      mode: live ? 'live' : 'simulated',
      track_id: trackId ?? `SIM-${Date.now()}`,
      dgii_status: 'ACEPTADO',
      terminal: true,
      attempts_used: 2,
      detail: 'Polling finalizado',
    };
  }

  startExecution(caseId: string) {
    const row = {
      case_id: caseId,
      execution_id: `exec_${randomUUID()}`,
      status: 'RUNNING',
      current_step: 'INTAKE_RECEIVED',
      last_success_step: null,
      resume_token: randomUUID(),
      attempt: 1,
    };
    this.executions.set(caseId, row);
    return row;
  }

  checkpoint(caseId: string, executionId: string, step: string, result: string) {
    const row = this.executions.get(caseId) ?? this.startExecution(caseId);
    row.execution_id = executionId;
    row.current_step = step;
    if (result === 'ok') row.last_success_step = step;
    return row;
  }

  progress(caseId: string) {
    return this.executions.get(caseId) ?? { case_id: caseId, execution_id: null, status: null, current_step: null, last_success_step: null, resume_token: null, attempt: null };
  }

  resume(caseId: string) {
    const row = this.executions.get(caseId) ?? this.startExecution(caseId);
    row.attempt = Number(row.attempt ?? 1) + 1;
    row.status = 'RUNNING';
    return row;
  }
}
