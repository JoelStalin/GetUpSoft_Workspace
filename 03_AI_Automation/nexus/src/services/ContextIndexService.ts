import type { Database } from "../storage/Database.ts";
import type { ContextIndexEntry } from "../storage/entities.ts";
import { ContextIndexRepository } from "../storage/repositories/ContextIndexRepository.ts";

type SourceRow = {
  id: string;
  title?: string | null;
  body?: string | null;
  tag?: string | null;
};

export class ContextIndexService {
  private db: Database;
  private repo: ContextIndexRepository;

  constructor(db: Database) {
    this.db = db;
    this.repo = new ContextIndexRepository(db);
  }

  syncWorkspace(workspaceId: string): ContextIndexEntry[] {
    const entries: ContextIndexEntry[] = [];

    for (const conversation of this.fetchRows(
      "SELECT id, title, COALESCE(summary, recentContext, '') AS body, sourceAgent AS tag FROM conversations WHERE workspaceId = ?",
      workspaceId,
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "conversation",
          sourceId: conversation.id,
          title: conversation.title ?? "Conversation",
          body: conversation.body ?? "",
          tags: ["conversation", conversation.tag ?? "agent-chat"],
        }),
      );
    }

    for (const task of this.fetchRows(
      "SELECT id, title, COALESCE(description, '') AS body, epic AS tag FROM tasks WHERE workspaceId = ?",
      workspaceId,
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "task",
          sourceId: task.id,
          title: task.title ?? "Task",
          body: task.body ?? "",
          tags: ["task", task.tag ?? "general"],
        }),
      );
    }

    for (const decision of this.fetchRows(
      "SELECT id, title, COALESCE(rationale, '') AS body, status AS tag FROM decisions WHERE workspaceId = ?",
      workspaceId,
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "decision",
          sourceId: decision.id,
          title: decision.title ?? "Decision",
          body: decision.body ?? "",
          tags: ["decision", decision.tag ?? "unknown"],
        }),
      );
    }

    for (const memory of this.fetchRows(
      "SELECT id, category AS title, fact AS body, category AS tag FROM project_memories WHERE workspaceId = ?",
      workspaceId,
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "project-memory",
          sourceId: memory.id,
          title: memory.title ?? "Project Memory",
          body: memory.body ?? "",
          tags: ["memory", memory.tag ?? "general"],
        }),
      );
    }

    for (const research of this.fetchRows(
      "SELECT id, title, COALESCE(notes, '') AS body, kind AS tag FROM research_references WHERE workspaceId = ? OR workspaceId IS NULL",
      workspaceId,
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "research",
          sourceId: research.id,
          title: research.title ?? "Research",
          body: research.body ?? "",
          tags: ["research", research.tag ?? "reference"],
        }),
      );
    }

    for (const term of this.fetchRows(
      "SELECT id, canonicalTerm AS title, COALESCE(description, normalizedTerm, '') AS body, termCode AS tag FROM term_registry WHERE workspaceId = ?",
      workspaceId,
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "term",
          sourceId: term.id,
          title: term.title ?? "Term",
          body: term.body ?? "",
          tags: ["term", term.tag ?? "semantic-code"],
        }),
      );
    }

    for (const artifact of this.fetchRows(
      "SELECT id, title, substr(COALESCE(content, ''), 1, 4000) AS body, artifactType AS tag FROM artifact_store WHERE workspaceId = ?",
      workspaceId,
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "artifact",
          sourceId: artifact.id,
          title: artifact.title ?? "Artifact",
          body: artifact.body ?? "",
          tags: ["artifact", artifact.tag ?? "result"],
        }),
      );
    }

    return entries;
  }

  listByWorkspace(workspaceId: string): ContextIndexEntry[] {
    return this.repo.listByWorkspace(workspaceId);
  }

  search(workspaceId: string, query: string, limit = 20): ContextIndexEntry[] {
    return this.repo.search(workspaceId, query, limit);
  }

  private fetchRows(sql: string, workspaceId: string): SourceRow[] {
    return this.db.prepare(sql).all(workspaceId) as SourceRow[];
  }
}
