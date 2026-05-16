import type { Database } from "../Database.ts";
import type { ResearchReference } from "../entities.ts";
import { randomUUID } from "node:crypto";

export type NewResearchReference = {
  workspaceId?: string | null;
  title: string;
  kind: string;
  url: string;
  notes?: string | null;
  example?: string | null;
  tagsJson?: string;
};

export class ResearchReferenceRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByWorkspace(workspaceId?: string): ResearchReference[] {
    if (!workspaceId) {
      return this.db
        .prepare("SELECT * FROM research_references WHERE workspaceId IS NULL ORDER BY updatedAt DESC")
        .all() as ResearchReference[];
    }

    return this.db
      .prepare(
        "SELECT * FROM research_references WHERE workspaceId = ? OR workspaceId IS NULL ORDER BY updatedAt DESC"
      )
      .all(workspaceId) as ResearchReference[];
  }

  upsert(input: NewResearchReference): ResearchReference {
    const existing = this.db
      .prepare("SELECT * FROM research_references WHERE url = ? AND COALESCE(workspaceId, '') = COALESCE(?, '')")
      .get(input.url, input.workspaceId ?? null) as ResearchReference | undefined;
    const now = new Date().toISOString();

    if (existing) {
      this.db
        .prepare(
          "UPDATE research_references SET title = ?, kind = ?, notes = ?, example = ?, tagsJson = ?, updatedAt = ? WHERE id = ?"
        )
        .run(
          input.title,
          input.kind,
          input.notes ?? null,
          input.example ?? null,
          input.tagsJson ?? "[]",
          now,
          existing.id
        );
      return (this.db.prepare("SELECT * FROM research_references WHERE id = ?").get(existing.id) as ResearchReference) ?? existing;
    }

    const reference: ResearchReference = {
      id: randomUUID(),
      workspaceId: input.workspaceId ?? null,
      title: input.title,
      kind: input.kind,
      url: input.url,
      notes: input.notes ?? null,
      example: input.example ?? null,
      tagsJson: input.tagsJson ?? "[]",
      createdAt: now,
      updatedAt: now,
    };

    this.db
      .prepare(
        "INSERT INTO research_references (id, workspaceId, title, kind, url, notes, example, tagsJson, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        reference.id,
        reference.workspaceId,
        reference.title,
        reference.kind,
        reference.url,
        reference.notes,
        reference.example,
        reference.tagsJson,
        reference.createdAt,
        reference.updatedAt
      );

    return reference;
  }
}
