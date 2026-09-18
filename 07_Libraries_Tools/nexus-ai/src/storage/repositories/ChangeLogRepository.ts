import type { Database } from "../Database.ts";
import type { ChangeLogEntry, ChangeFileLink } from "../entities.ts";
import { randomUUID } from "node:crypto";

export type NewChangeLogEntry = {
  workspaceId: string;
  agentId: string;
  adapterId?: string | null;
  actorType?: string;
  changeType: string;
  title: string;
  reason?: string;
  affectedEntityType?: string | null;
  affectedEntityId?: string | null;
  beforeStateRef?: string | null;
  afterStateRef?: string | null;
  evidenceRef?: string | null;
  relatedConversationId?: string | null;
  relatedTaskId?: string | null;
  relatedDecisionId?: string | null;
  relatedPrecedentId?: string | null;
  diffSummary?: string;
  filesAffected?: Array<{ filePath: string; action: string }>;
};

export class ChangeLogRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByWorkspace(workspaceId: string, limit = 100): ChangeLogEntry[] {
    return this.db
      .prepare(
        "SELECT * FROM change_log_entries WHERE workspaceId = ? ORDER BY createdAt DESC LIMIT ?"
      )
      .all(workspaceId, limit) as ChangeLogEntry[];
  }

  findFilesForEntry(entryId: string): ChangeFileLink[] {
    return this.db
      .prepare("SELECT * FROM change_file_links WHERE changeLogEntryId = ?")
      .all(entryId) as ChangeFileLink[];
  }

  record(input: NewChangeLogEntry): ChangeLogEntry {
    const entry: ChangeLogEntry = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      agentId: input.agentId,
      adapterId: input.adapterId ?? null,
      actorType: input.actorType ?? "agent",
      changeType: input.changeType,
      title: input.title,
      reason: input.reason ?? null,
      affectedEntityType: input.affectedEntityType ?? null,
      affectedEntityId: input.affectedEntityId ?? null,
      beforeStateRef: input.beforeStateRef ?? null,
      afterStateRef: input.afterStateRef ?? null,
      evidenceRef: input.evidenceRef ?? null,
      relatedConversationId: input.relatedConversationId ?? null,
      relatedTaskId: input.relatedTaskId ?? null,
      relatedDecisionId: input.relatedDecisionId ?? null,
      relatedPrecedentId: input.relatedPrecedentId ?? null,
      diffSummary: input.diffSummary ?? null,
      createdAt: new Date().toISOString(),
    };

    const tx = this.db.transaction(() => {
      this.db
        .prepare(
          "INSERT INTO change_log_entries (id, workspaceId, agentId, adapterId, actorType, changeType, title, reason, affectedEntityType, affectedEntityId, beforeStateRef, afterStateRef, evidenceRef, relatedConversationId, relatedTaskId, relatedDecisionId, relatedPrecedentId, diffSummary, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .run(
          entry.id,
          entry.workspaceId,
          entry.agentId,
          entry.adapterId,
          entry.actorType,
          entry.changeType,
          entry.title,
          entry.reason,
          entry.affectedEntityType,
          entry.affectedEntityId,
          entry.beforeStateRef,
          entry.afterStateRef,
          entry.evidenceRef,
          entry.relatedConversationId,
          entry.relatedTaskId,
          entry.relatedDecisionId,
          entry.relatedPrecedentId,
          entry.diffSummary,
          entry.createdAt
        );

      if (input.filesAffected) {
        const linkStmt = this.db.prepare(
          "INSERT INTO change_file_links (id, changeLogEntryId, filePath, action) VALUES (?, ?, ?, ?)"
        );
        for (const f of input.filesAffected) {
          linkStmt.run(randomUUID(), entry.id, f.filePath, f.action);
        }
      }
    });

    tx();
    return entry;
  }
}
