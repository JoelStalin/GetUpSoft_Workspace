import { randomUUID } from "node:crypto";
import type { Database } from "../Database.ts";
import type { WorkerAuditCase } from "../entities.ts";

export class WorkerAuditRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  recordFailure(input: {
    workspaceId: string;
    auditedAgentType: string;
    lastError: string;
    lastJobId?: string | null;
    lastWorkerId?: string | null;
  }): WorkerAuditCase {
    const existing = this.findOpenByAgent(input.workspaceId, input.auditedAgentType);
    const now = new Date().toISOString();

    if (existing) {
      this.db.prepare(`
        UPDATE worker_audit_cases
        SET failureCount = failureCount + 1,
            lastFailureAt = ?,
            lastError = ?,
            lastJobId = ?,
            lastWorkerId = ?,
            updatedAt = ?
        WHERE id = ?
      `).run(
        now,
        input.lastError,
        input.lastJobId ?? null,
        input.lastWorkerId ?? null,
        now,
        existing.id,
      );
      return this.findById(existing.id)!;
    }

    const auditCase: WorkerAuditCase = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      auditedAgentType: input.auditedAgentType,
      status: "open",
      failureCount: 1,
      firstFailureAt: now,
      lastFailureAt: now,
      lastError: input.lastError,
      lastJobId: input.lastJobId ?? null,
      lastWorkerId: input.lastWorkerId ?? null,
      auditorJobId: null,
      policeJobId: null,
      researchJobId: null,
      judgeJobId: null,
      recruiterJobId: null,
      rebuildJobId: null,
      decision: null,
      resolutionNotes: null,
      createdAt: now,
      updatedAt: now,
      closedAt: null,
    };

    this.db.prepare(`
      INSERT INTO worker_audit_cases (
        id, workspaceId, auditedAgentType, status, failureCount, firstFailureAt,
        lastFailureAt, lastError, lastJobId, lastWorkerId, auditorJobId, policeJobId,
        researchJobId, judgeJobId, recruiterJobId, rebuildJobId, decision,
        resolutionNotes, createdAt, updatedAt, closedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      auditCase.id,
      auditCase.workspaceId,
      auditCase.auditedAgentType,
      auditCase.status,
      auditCase.failureCount,
      auditCase.firstFailureAt,
      auditCase.lastFailureAt,
      auditCase.lastError,
      auditCase.lastJobId,
      auditCase.lastWorkerId,
      auditCase.auditorJobId,
      auditCase.policeJobId,
      auditCase.researchJobId,
      auditCase.judgeJobId,
      auditCase.recruiterJobId,
      auditCase.rebuildJobId,
      auditCase.decision,
      auditCase.resolutionNotes,
      auditCase.createdAt,
      auditCase.updatedAt,
      auditCase.closedAt,
    );

    return auditCase;
  }

  findById(id: string): WorkerAuditCase | undefined {
    return this.db.prepare(
      "SELECT * FROM worker_audit_cases WHERE id = ?",
    ).get(id) as WorkerAuditCase | undefined;
  }

  findOpenByAgent(workspaceId: string, auditedAgentType: string): WorkerAuditCase | undefined {
    return this.db.prepare(`
      SELECT * FROM worker_audit_cases
      WHERE workspaceId = ? AND auditedAgentType = ? AND closedAt IS NULL
      ORDER BY updatedAt DESC
      LIMIT 1
    `).get(workspaceId, auditedAgentType) as WorkerAuditCase | undefined;
  }

  topFailingAgents(workspaceId: string, limit = 5): WorkerAuditCase[] {
    return this.db.prepare(`
      SELECT * FROM worker_audit_cases
      WHERE workspaceId = ?
      ORDER BY failureCount DESC, updatedAt DESC
      LIMIT ?
    `).all(workspaceId, limit) as WorkerAuditCase[];
  }

  listByWorkspace(workspaceId: string): WorkerAuditCase[] {
    return this.db.prepare(`
      SELECT * FROM worker_audit_cases
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId) as WorkerAuditCase[];
  }

  attachJob(caseId: string, field: "auditorJobId" | "policeJobId" | "researchJobId" | "judgeJobId" | "recruiterJobId" | "rebuildJobId", jobId: string, status: string): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE worker_audit_cases
      SET ${field} = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `).run(jobId, status, now, caseId);
  }

  setStatus(caseId: string, status: string, notes?: string): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE worker_audit_cases
      SET status = ?, resolutionNotes = COALESCE(?, resolutionNotes), updatedAt = ?
      WHERE id = ?
    `).run(status, notes ?? null, now, caseId);
  }

  resolve(caseId: string, decision: string, resolutionNotes: string): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE worker_audit_cases
      SET status = 'resolved',
          decision = ?,
          resolutionNotes = ?,
          updatedAt = ?,
          closedAt = ?
      WHERE id = ?
    `).run(decision, resolutionNotes, now, now, caseId);
  }
}
