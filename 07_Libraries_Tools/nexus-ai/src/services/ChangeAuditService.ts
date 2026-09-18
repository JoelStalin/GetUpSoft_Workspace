import type { Database } from "../storage/Database.ts";
import { ChangeLogRepository, type NewChangeLogEntry } from "../storage/repositories/ChangeLogRepository.ts";
import type { ChangeLogEntry } from "../storage/entities.ts";

export type ChangeQuery = {
  agentId?: string;
  changeType?: string;
  taskId?: string;
  conversationId?: string;
  limit?: number;
};

export type AuditSummary = {
  totalChanges: number;
  byAgent: Record<string, number>;
  byType: Record<string, number>;
  recentTitles: string[];
};

export class ChangeAuditService {
  private repo: ChangeLogRepository;

  constructor(db: Database) {
    this.repo = new ChangeLogRepository(db);
  }

  record(input: NewChangeLogEntry): ChangeLogEntry {
    return this.repo.record(input);
  }

  findByWorkspace(workspaceId: string, limit = 100): ChangeLogEntry[] {
    return this.repo.findByWorkspace(workspaceId, limit);
  }

  filesAffectedBy(entryId: string): string[] {
    return this.repo.findFilesForEntry(entryId).map((f) => `${f.action}:${f.filePath}`);
  }

  summarize(workspaceId: string, limit = 10): string[] {
    return this.repo
      .findByWorkspace(workspaceId, limit)
      .map((e) => `[${e.changeType}] ${e.title}`);
  }

  query(workspaceId: string, filter: ChangeQuery): ChangeLogEntry[] {
    const all = this.repo.findByWorkspace(workspaceId, filter.limit ?? 200);
    return all.filter((e) => {
      if (filter.agentId && e.agentId !== filter.agentId) return false;
      if (filter.changeType && e.changeType !== filter.changeType) return false;
      if (filter.taskId && e.relatedTaskId !== filter.taskId) return false;
      if (filter.conversationId && e.relatedConversationId !== filter.conversationId) return false;
      return true;
    });
  }

  queryByAgent(workspaceId: string, agentId: string, limit = 50): ChangeLogEntry[] {
    return this.query(workspaceId, { agentId, limit });
  }

  queryByTask(workspaceId: string, taskId: string): ChangeLogEntry[] {
    return this.query(workspaceId, { taskId });
  }

  queryByConversation(workspaceId: string, conversationId: string): ChangeLogEntry[] {
    return this.query(workspaceId, { conversationId });
  }

  auditSummary(workspaceId: string, limit = 200): AuditSummary {
    const entries = this.repo.findByWorkspace(workspaceId, limit);
    const byAgent: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const e of entries) {
      byAgent[e.agentId] = (byAgent[e.agentId] ?? 0) + 1;
      byType[e.changeType] = (byType[e.changeType] ?? 0) + 1;
    }

    return {
      totalChanges: entries.length,
      byAgent,
      byType,
      recentTitles: entries.slice(0, 5).map((e) => e.title),
    };
  }

  recordBatch(inputs: NewChangeLogEntry[]): ChangeLogEntry[] {
    return inputs.map((i) => this.record(i));
  }

  linkToPrecedent(workspaceId: string, entryId: string, precedentId: string): void {
    this.repo.record({
      workspaceId,
      agentId: "system",
      changeType: "link",
      title: `Linked change ${entryId} to precedent ${precedentId}`,
      reason: "Automatic precedent link",
      relatedPrecedentId: precedentId,
      filesAffected: [],
    });
  }

  answerWho(workspaceId: string, changeId: string): string {
    const entries = this.repo.findByWorkspace(workspaceId, 1000);
    const entry = entries.find((e) => e.id === changeId);
    return entry?.agentId ?? "unknown";
  }

  answerWhy(workspaceId: string, changeId: string): string {
    const entries = this.repo.findByWorkspace(workspaceId, 1000);
    const entry = entries.find((e) => e.id === changeId);
    return entry?.reason ?? "no reason recorded";
  }

  answerWhat(workspaceId: string, changeId: string): string {
    const files = this.filesAffectedBy(changeId);
    const entries = this.repo.findByWorkspace(workspaceId, 1000);
    const entry = entries.find((e) => e.id === changeId);
    return `[${entry?.changeType}] ${entry?.title ?? "unknown"} — files: ${files.join(", ")}`;
  }
}
