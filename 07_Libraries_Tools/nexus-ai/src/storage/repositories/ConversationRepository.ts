import type { Database } from "../Database.ts";
import type { Conversation } from "../entities.ts";
import { randomUUID } from "node:crypto";

export type NewConversation = {
  workspaceId: string;
  sourceAgent: string;
  agentId?: string | null;
  title?: string;
  sourceAdapter?: string | null;
  linkedAgentsJson?: string;
  status?: string;
  summary?: string | null;
  recentContext?: string | null;
  sessionMemoryId?: string | null;
  relatedFilesJson?: string;
  relatedTaskIdsJson?: string;
  relatedDecisionIdsJson?: string;
};

export class ConversationRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findById(id: string): Conversation | undefined {
    return this.db
      .prepare("SELECT * FROM conversations WHERE id = ?")
      .get(id) as Conversation | undefined;
  }

  findByWorkspace(workspaceId: string, limit = 50): Conversation[] {
    return this.db
      .prepare(
        "SELECT * FROM conversations WHERE workspaceId = ? ORDER BY updatedAt DESC LIMIT ?"
      )
      .all(workspaceId, limit) as Conversation[];
  }

  create(input: string | NewConversation, sourceAgent?: string, title?: string): Conversation {
    const now = new Date().toISOString();
    const params: NewConversation =
      typeof input === "string"
        ? { workspaceId: input, sourceAgent: sourceAgent ?? "manual", title }
        : input;
    const conv: Conversation = {
      id: randomUUID(),
      workspaceId: params.workspaceId,
      sourceAgent: params.sourceAgent,
      agentId: params.agentId ?? null,
      title: params.title ?? null,
      sourceAdapter: params.sourceAdapter ?? null,
      linkedAgentsJson: params.linkedAgentsJson ?? "[]",
      status: params.status ?? "active",
      summary: params.summary ?? null,
      recentContext: params.recentContext ?? null,
      sessionMemoryId: params.sessionMemoryId ?? null,
      relatedFilesJson: params.relatedFilesJson ?? "[]",
      relatedTaskIdsJson: params.relatedTaskIdsJson ?? "[]",
      relatedDecisionIdsJson: params.relatedDecisionIdsJson ?? "[]",
      createdAt: now,
      updatedAt: now,
    };
    this.db
      .prepare(
        "INSERT INTO conversations (id, workspaceId, sourceAgent, agentId, title, sourceAdapter, linkedAgentsJson, status, summary, recentContext, sessionMemoryId, relatedFilesJson, relatedTaskIdsJson, relatedDecisionIdsJson, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        conv.id,
        conv.workspaceId,
        conv.sourceAgent,
        conv.agentId,
        conv.title,
        conv.sourceAdapter,
        conv.linkedAgentsJson,
        conv.status,
        conv.summary,
        conv.recentContext,
        conv.sessionMemoryId,
        conv.relatedFilesJson,
        conv.relatedTaskIdsJson,
        conv.relatedDecisionIdsJson,
        conv.createdAt,
        conv.updatedAt
      );
    return conv;
  }

  touch(id: string): void {
    this.db
      .prepare("UPDATE conversations SET updatedAt = ? WHERE id = ?")
      .run(new Date().toISOString(), id);
  }
}
