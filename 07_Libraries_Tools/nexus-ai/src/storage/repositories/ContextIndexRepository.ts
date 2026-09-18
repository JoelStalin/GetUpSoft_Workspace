import { randomUUID } from "node:crypto";
import type { Database } from "../Database.ts";
import type { ContextIndexEntry } from "../entities.ts";

export class ContextIndexRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  upsert(input: {
    workspaceId: string;
    sourceType: string;
    sourceId: string;
    title: string;
    body: string;
    tags: string[];
  }): ContextIndexEntry {
    const existing = this.db.prepare(`
      SELECT * FROM context_index_entries
      WHERE workspaceId = ? AND sourceType = ? AND sourceId = ?
    `).get(input.workspaceId, input.sourceType, input.sourceId) as ContextIndexEntry | undefined;
    const now = new Date().toISOString();
    const tagsJson = JSON.stringify(input.tags);
    const searchableText = [input.title, input.body, ...input.tags].join(" ").toLowerCase();

    if (existing) {
      this.db.prepare(`
        UPDATE context_index_entries
        SET title = ?, body = ?, tagsJson = ?, searchableText = ?, updatedAt = ?
        WHERE id = ?
      `).run(input.title, input.body, tagsJson, searchableText, now, existing.id);
      return this.findById(existing.id)!;
    }

    const entry: ContextIndexEntry = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      title: input.title,
      body: input.body,
      tagsJson,
      searchableText,
      createdAt: now,
      updatedAt: now,
    };

    this.db.prepare(`
      INSERT INTO context_index_entries (
        id, workspaceId, sourceType, sourceId, title, body, tagsJson,
        searchableText, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id,
      entry.workspaceId,
      entry.sourceType,
      entry.sourceId,
      entry.title,
      entry.body,
      entry.tagsJson,
      entry.searchableText,
      entry.createdAt,
      entry.updatedAt,
    );

    return entry;
  }

  findById(id: string): ContextIndexEntry | undefined {
    return this.db.prepare(
      "SELECT * FROM context_index_entries WHERE id = ?",
    ).get(id) as ContextIndexEntry | undefined;
  }

  listByWorkspace(workspaceId: string): ContextIndexEntry[] {
    return this.db.prepare(`
      SELECT * FROM context_index_entries
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId) as ContextIndexEntry[];
  }

  search(workspaceId: string, query: string, limit = 20): ContextIndexEntry[] {
    const like = `%${query.toLowerCase()}%`;
    return this.db.prepare(`
      SELECT * FROM context_index_entries
      WHERE workspaceId = ? AND searchableText LIKE ?
      ORDER BY updatedAt DESC
      LIMIT ?
    `).all(workspaceId, like, limit) as ContextIndexEntry[];
  }
}
