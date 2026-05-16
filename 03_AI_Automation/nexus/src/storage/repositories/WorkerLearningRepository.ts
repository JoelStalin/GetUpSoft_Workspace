import { createHash, randomUUID } from "node:crypto";
import type { Database } from "../Database.ts";
import type { WorkerLearningPattern } from "../entities.ts";

export class WorkerLearningRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  upsert(input: {
    workspaceId: string;
    agentType: string;
    jobType: string;
    signaturePayload: object;
    complexity: string;
    solution: object;
  }): WorkerLearningPattern {
    const signature = this.signatureFor(input.signaturePayload);
    const existing = this.findBySignature(input.workspaceId, input.agentType, input.jobType, signature);
    const now = new Date().toISOString();

    if (existing) {
      this.db.prepare(`
        UPDATE worker_learning_patterns
        SET complexity = ?, solutionJson = ?, updatedAt = ?
        WHERE id = ?
      `).run(input.complexity, JSON.stringify(input.solution), now, existing.id);
      return this.findById(existing.id)!;
    }

    const pattern: WorkerLearningPattern = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      agentType: input.agentType,
      jobType: input.jobType,
      signature,
      complexity: input.complexity,
      solutionJson: JSON.stringify(input.solution),
      usageCount: 0,
      lastUsedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    this.db.prepare(`
      INSERT INTO worker_learning_patterns (
        id, workspaceId, agentType, jobType, signature, complexity, solutionJson,
        usageCount, lastUsedAt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pattern.id,
      pattern.workspaceId,
      pattern.agentType,
      pattern.jobType,
      pattern.signature,
      pattern.complexity,
      pattern.solutionJson,
      pattern.usageCount,
      pattern.lastUsedAt,
      pattern.createdAt,
      pattern.updatedAt,
    );

    return pattern;
  }

  findReusable(workspaceId: string, agentType: string, jobType: string, signaturePayload: object): WorkerLearningPattern | undefined {
    const signature = this.signatureFor(signaturePayload);
    return this.findBySignature(workspaceId, agentType, jobType, signature);
  }

  markUsed(id: string): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE worker_learning_patterns
      SET usageCount = usageCount + 1, lastUsedAt = ?, updatedAt = ?
      WHERE id = ?
    `).run(now, now, id);
  }

  listByWorkspace(workspaceId: string): WorkerLearningPattern[] {
    return this.db.prepare(`
      SELECT * FROM worker_learning_patterns
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId) as WorkerLearningPattern[];
  }

  private findById(id: string): WorkerLearningPattern | undefined {
    return this.db.prepare(
      "SELECT * FROM worker_learning_patterns WHERE id = ?",
    ).get(id) as WorkerLearningPattern | undefined;
  }

  private findBySignature(workspaceId: string, agentType: string, jobType: string, signature: string): WorkerLearningPattern | undefined {
    return this.db.prepare(`
      SELECT * FROM worker_learning_patterns
      WHERE workspaceId = ? AND agentType = ? AND jobType = ? AND signature = ?
    `).get(workspaceId, agentType, jobType, signature) as WorkerLearningPattern | undefined;
  }

  private signatureFor(payload: object): string {
    return createHash("sha256").update(stableStringify(payload)).digest("hex");
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`).join(",")}}`;
  }

  return JSON.stringify(value);
}
