import type { Database } from "../Database.ts";
import type { PromptRequirementCoverage } from "../entities.ts";
import { randomUUID } from "node:crypto";

export type NewPromptRequirementCoverage = {
  workspaceId: string;
  requirementKey: string;
  epic: string;
  title: string;
  status: string;
  evidence?: string | null;
  reason?: string | null;
};

export class PromptRequirementCoverageRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByWorkspace(workspaceId: string): PromptRequirementCoverage[] {
    return this.db
      .prepare(
        "SELECT * FROM prompt_requirement_coverage WHERE workspaceId = ? ORDER BY epic, requirementKey"
      )
      .all(workspaceId) as PromptRequirementCoverage[];
  }

  upsert(input: NewPromptRequirementCoverage): PromptRequirementCoverage {
    const existing = this.db
      .prepare(
        "SELECT * FROM prompt_requirement_coverage WHERE workspaceId = ? AND requirementKey = ?"
      )
      .get(input.workspaceId, input.requirementKey) as PromptRequirementCoverage | undefined;
    const updatedAt = new Date().toISOString();

    if (existing) {
      this.db
        .prepare(
          "UPDATE prompt_requirement_coverage SET epic = ?, title = ?, status = ?, evidence = ?, reason = ?, updatedAt = ? WHERE id = ?"
        )
        .run(
          input.epic,
          input.title,
          input.status,
          input.evidence ?? null,
          input.reason ?? null,
          updatedAt,
          existing.id
        );
      return (this.db.prepare("SELECT * FROM prompt_requirement_coverage WHERE id = ?").get(existing.id) as PromptRequirementCoverage) ?? existing;
    }

    const record: PromptRequirementCoverage = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      requirementKey: input.requirementKey,
      epic: input.epic,
      title: input.title,
      status: input.status,
      evidence: input.evidence ?? null,
      reason: input.reason ?? null,
      updatedAt,
    };

    this.db
      .prepare(
        "INSERT INTO prompt_requirement_coverage (id, workspaceId, requirementKey, epic, title, status, evidence, reason, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        record.id,
        record.workspaceId,
        record.requirementKey,
        record.epic,
        record.title,
        record.status,
        record.evidence,
        record.reason,
        record.updatedAt
      );

    return record;
  }
}
