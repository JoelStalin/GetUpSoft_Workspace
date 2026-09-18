import type { Database } from "../Database.ts";
import type { ImplementationPrecedent } from "../entities.ts";
import { randomUUID } from "node:crypto";

export class ImplementationPrecedentRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByFingerprint(fingerprint: string): ImplementationPrecedent | undefined {
    return this.db
      .prepare("SELECT * FROM implementation_precedents WHERE fingerprint = ?")
      .get(fingerprint) as ImplementationPrecedent | undefined;
  }

  findByWorkspace(workspaceId: string): ImplementationPrecedent[] {
    return this.db
      .prepare(
        "SELECT * FROM implementation_precedents WHERE workspaceId = ? OR workspaceId IS NULL ORDER BY createdAt DESC"
      )
      .all(workspaceId) as ImplementationPrecedent[];
  }

  findByRepo(repoId: string, limit = 50): ImplementationPrecedent[] {
    return this.db
      .prepare(
        "SELECT * FROM implementation_precedents WHERE repoId = ? ORDER BY createdAt DESC LIMIT ?"
      )
      .all(repoId, limit) as ImplementationPrecedent[];
  }

  upsert(input: Omit<ImplementationPrecedent, "id" | "createdAt">): ImplementationPrecedent {
    const existing = this.findByFingerprint(input.fingerprint);
    if (existing) return existing;

    const record: ImplementationPrecedent = {
      id: randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    this.db
      .prepare(
        "INSERT INTO implementation_precedents (id, workspaceId, sourceProject, repoId, projectLabel, agentId, fingerprint, intent, stack, filesAffected, rationale, outcome, resultNotes, patchReference, variantSummary, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        record.id,
        record.workspaceId,
        record.sourceProject,
        record.repoId,
        record.projectLabel,
        record.agentId,
        record.fingerprint,
        record.intent,
        record.stack,
        record.filesAffected,
        record.rationale,
        record.outcome,
        record.resultNotes,
        record.patchReference,
        record.variantSummary,
        record.createdAt
      );
    return record;
  }
}
