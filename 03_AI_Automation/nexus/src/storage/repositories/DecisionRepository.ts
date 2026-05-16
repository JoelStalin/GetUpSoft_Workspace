import type { Database } from "../Database.ts";
import type { Decision } from "../entities.ts";
import { randomUUID } from "node:crypto";

export class DecisionRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByWorkspace(workspaceId: string): Decision[] {
    return this.db
      .prepare("SELECT * FROM decisions WHERE workspaceId = ? ORDER BY createdAt DESC")
      .all(workspaceId) as Decision[];
  }

  findById(id: string): Decision | undefined {
    return this.db
      .prepare("SELECT * FROM decisions WHERE id = ?")
      .get(id) as Decision | undefined;
  }

  create(
    workspaceId: string,
    title: string,
    rationale: string,
    status = "open",
    relatedConversationId?: string,
    relatedTaskId?: string
  ): Decision {
    const now = new Date().toISOString();
    const decision: Decision = {
      id: randomUUID(),
      workspaceId,
      title,
      rationale,
      status,
      relatedConversationId: relatedConversationId ?? null,
      relatedTaskId: relatedTaskId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.db
      .prepare(
        "INSERT INTO decisions (id, workspaceId, title, rationale, status, relatedConversationId, relatedTaskId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        decision.id,
        decision.workspaceId,
        decision.title,
        decision.rationale,
        decision.status,
        decision.relatedConversationId,
        decision.relatedTaskId,
        decision.createdAt,
        decision.updatedAt
      );
    return decision;
  }

  updateStatus(id: string, status: string): void {
    this.db.prepare("UPDATE decisions SET status = ?, updatedAt = ? WHERE id = ?").run(status, new Date().toISOString(), id);
  }
}
