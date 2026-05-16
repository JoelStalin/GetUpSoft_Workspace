import { randomUUID } from "node:crypto";
import type { Database } from "../Database.ts";
import type { WorkerComplianceReport } from "../entities.ts";

export class WorkerComplianceRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  create(input: {
    workspaceId: string;
    auditedJobId: string;
    auditedAgentType: string;
    auditedJobType: string;
    complianceJobId?: string | null;
    compliant: boolean;
    status: string;
    issues: string[];
    expectedSignals: string[];
  }): WorkerComplianceReport {
    const now = new Date().toISOString();
    const report: WorkerComplianceReport = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      auditedJobId: input.auditedJobId,
      auditedAgentType: input.auditedAgentType,
      auditedJobType: input.auditedJobType,
      complianceJobId: input.complianceJobId ?? null,
      compliant: input.compliant ? 1 : 0,
      status: input.status,
      issuesJson: JSON.stringify(input.issues),
      expectedSignalsJson: JSON.stringify(input.expectedSignals),
      createdAt: now,
      updatedAt: now,
    };

    this.db.prepare(`
      INSERT INTO worker_compliance_reports (
        id, workspaceId, auditedJobId, auditedAgentType, auditedJobType, complianceJobId,
        compliant, status, issuesJson, expectedSignalsJson, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      report.id,
      report.workspaceId,
      report.auditedJobId,
      report.auditedAgentType,
      report.auditedJobType,
      report.complianceJobId,
      report.compliant,
      report.status,
      report.issuesJson,
      report.expectedSignalsJson,
      report.createdAt,
      report.updatedAt,
    );

    return report;
  }

  attachComplianceJob(reportId: string, complianceJobId: string): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE worker_compliance_reports
      SET complianceJobId = ?, updatedAt = ?
      WHERE id = ?
    `).run(complianceJobId, now, reportId);
  }

  listByWorkspace(workspaceId: string): WorkerComplianceReport[] {
    return this.db.prepare(`
      SELECT * FROM worker_compliance_reports
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId) as WorkerComplianceReport[];
  }
}
