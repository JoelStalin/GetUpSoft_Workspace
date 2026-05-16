import type { Database } from "../Database.ts";
import type { Skill, SkillBinding } from "../entities.ts";
import { randomUUID } from "node:crypto";

export type NewSkill = {
  workspaceId: string;
  name: string;
  description?: string | null;
  skillKey: string;
  scope?: string;
  stack?: string | null;
  framework?: string | null;
  skillBody: string;
  tagsJson?: string;
  sourceKind?: string;
};

export class SkillRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findAll(): Skill[] {
    return this.db.prepare("SELECT * FROM skills ORDER BY createdAt DESC").all() as Skill[];
  }

  findApplicable(scope: string[], workspaceId?: string): Skill[] {
    if (workspaceId) {
      return this.db
        .prepare(
          `SELECT DISTINCT s.* FROM skills s
           LEFT JOIN skill_bindings sb ON sb.skillId = s.id
           WHERE s.scope IN (${scope.map(() => "?").join(", ")})
             AND (s.workspaceId = '' OR s.workspaceId = ?)
             AND (sb.workspaceId IS NULL OR sb.workspaceId = ?)
           ORDER BY s.createdAt DESC`
        )
        .all(...scope, workspaceId, workspaceId) as Skill[];
    }
    return this.db
      .prepare(`SELECT * FROM skills WHERE scope IN (${scope.map(() => "?").join(", ")}) ORDER BY createdAt DESC`)
      .all(...scope) as Skill[];
  }

  upsert(input: NewSkill): Skill {
    const existing = this.db
      .prepare("SELECT * FROM skills WHERE skillKey = ?")
      .get(input.skillKey) as Skill | undefined;

    if (existing) {
      this.db
        .prepare(
          "UPDATE skills SET workspaceId = ?, name = ?, description = ?, scope = ?, stack = ?, framework = ?, skillBody = ?, tagsJson = ?, sourceKind = ?, updatedAt = ? WHERE id = ?"
        )
        .run(
          input.workspaceId,
          input.name,
          input.description ?? null,
          input.scope ?? "workspace",
          input.stack ?? null,
          input.framework ?? null,
          input.skillBody,
          input.tagsJson ?? "[]",
          input.sourceKind ?? "manual",
          new Date().toISOString(),
          existing.id
        );
      return (this.db.prepare("SELECT * FROM skills WHERE id = ?").get(existing.id) as Skill) ?? existing;
    }

    const created: Skill = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description ?? null,
      skillKey: input.skillKey,
      scope: input.scope ?? "workspace",
      stack: input.stack ?? null,
      framework: input.framework ?? null,
      skillBody: input.skillBody,
      tagsJson: input.tagsJson ?? "[]",
      sourceKind: input.sourceKind ?? "manual",
      createdAt: new Date().toISOString(),
    };

    this.db
      .prepare(
        "INSERT INTO skills (id, workspaceId, name, description, skillKey, scope, stack, framework, skillBody, tagsJson, sourceKind, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        created.id,
        created.workspaceId,
        created.name,
        created.description,
        created.skillKey,
        created.scope,
        created.stack,
        created.framework,
        created.skillBody,
        created.tagsJson,
        created.sourceKind,
        created.createdAt,
        created.createdAt
      );

    return created;
  }

  bind(skillId: string, agentId: string, workspaceId?: string, bindingContext?: string): SkillBinding {
    const existing = this.db
      .prepare("SELECT * FROM skill_bindings WHERE skillId = ? AND agentId = ?")
      .get(skillId, agentId) as SkillBinding | undefined;
    if (existing) {
      this.db
        .prepare("UPDATE skill_bindings SET workspaceId = ?, bindingContext = ? WHERE id = ?")
        .run(workspaceId ?? null, bindingContext ?? null, existing.id);
      return (this.db.prepare("SELECT * FROM skill_bindings WHERE id = ?").get(existing.id) as SkillBinding) ?? existing;
    }

    const binding: SkillBinding = {
      id: randomUUID(),
      skillId,
      agentId,
      enabledAt: new Date().toISOString(),
      workspaceId: workspaceId ?? null,
      bindingContext: bindingContext ?? null,
    };
    this.db
      .prepare(
        "INSERT INTO skill_bindings (id, skillId, agentId, enabledAt, workspaceId, bindingContext) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(
        binding.id,
        binding.skillId,
        binding.agentId,
        binding.enabledAt,
        binding.workspaceId,
        binding.bindingContext
      );
    return binding;
  }
}
