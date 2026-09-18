import type { Database } from "../Database.ts";
import type { ProjectMemory } from "../entities.ts";
import { randomUUID } from "node:crypto";

export class ProjectMemoryRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByWorkspace(workspaceId: string, category?: string): ProjectMemory[] {
    if (category) {
      return this.db
        .prepare(
          "SELECT * FROM project_memories WHERE workspaceId = ? AND category = ? ORDER BY confidence DESC"
        )
        .all(workspaceId, category) as ProjectMemory[];
    }
    return this.db
      .prepare(
        "SELECT * FROM project_memories WHERE workspaceId = ? ORDER BY confidence DESC"
      )
      .all(workspaceId) as ProjectMemory[];
  }

  upsert(
    workspaceId: string,
    category: string,
    fact: string,
    confidence = 1.0,
    memoryType = category,
    sourceConversationId?: string
  ): ProjectMemory {
    const existing = this.db
      .prepare(
        "SELECT * FROM project_memories WHERE workspaceId = ? AND category = ? AND fact = ?"
      )
      .get(workspaceId, category, fact) as ProjectMemory | undefined;

    if (existing) {
      this.db
        .prepare("UPDATE project_memories SET confidence = ?, memoryType = ?, sourceConversationId = COALESCE(?, sourceConversationId), lastUsedAt = ? WHERE id = ?")
        .run(confidence, memoryType, sourceConversationId ?? null, new Date().toISOString(), existing.id);
      return {
        ...existing,
        confidence,
        memoryType,
        sourceConversationId: sourceConversationId ?? existing.sourceConversationId,
        lastUsedAt: new Date().toISOString(),
      };
    }

    const now = new Date().toISOString();
    const memory: ProjectMemory = {
      id: randomUUID(),
      workspaceId,
      category,
      memoryType,
      fact,
      confidence,
      sourceConversationId: sourceConversationId ?? null,
      createdAt: now,
      lastUsedAt: now,
    };
    this.db
      .prepare(
        "INSERT INTO project_memories (id, workspaceId, category, memoryType, fact, confidence, sourceConversationId, createdAt, lastUsedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        memory.id,
        memory.workspaceId,
        memory.category,
        memory.memoryType,
        memory.fact,
        memory.confidence,
        memory.sourceConversationId,
        memory.createdAt,
        memory.lastUsedAt
      );
    return memory;
  }

  delete(id: string): void {
    this.db.prepare("DELETE FROM project_memories WHERE id = ?").run(id);
  }
}
