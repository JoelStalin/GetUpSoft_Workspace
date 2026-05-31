import type { Database } from "../Database.ts";
import type { Message } from "../entities.ts";
import { randomUUID } from "node:crypto";

export type NewMessage = {
  conversationId: string;
  workspaceId: string;
  agentId?: string | null;
  role: string;
  content: string;
  normalizedSearchText?: string | null;
  summary?: string | null;
  attachmentsJson?: string;
  relatedFilesJson?: string;
  relatedTaskIdsJson?: string;
  toolUseMetadataJson?: string | null;
  toolResultReference?: string | null;
  tokenEstimate?: number;
  isCompacted?: boolean;
  compactionStrategy?: string | null;
};

export class MessageRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByConversation(conversationId: string): Message[] {
    return this.db
      .prepare(
        "SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt"
      )
      .all(conversationId) as Message[];
  }

  findUncompactedByWorkspace(workspaceId: string, limit = 200): Message[] {
    return this.db
      .prepare(
        "SELECT * FROM messages WHERE workspaceId = ? AND isCompacted = 0 ORDER BY createdAt LIMIT ?"
      )
      .all(workspaceId, limit) as Message[];
  }

  insert(
    input: string | NewMessage,
    workspaceId?: string,
    role?: string,
    content?: string,
    tokenEstimate = 0
  ): Message {
    const params: NewMessage =
      typeof input === "string"
        ? {
            conversationId: input,
            workspaceId: workspaceId ?? "",
            role: role ?? "user",
            content: content ?? "",
            tokenEstimate,
          }
        : input;
    const now = new Date().toISOString();
    const msg: Message = {
      id: randomUUID(),
      conversationId: params.conversationId,
      workspaceId: params.workspaceId,
      agentId: params.agentId ?? null,
      role: params.role,
      content: params.content,
      normalizedSearchText: params.normalizedSearchText ?? null,
      summary: params.summary ?? null,
      attachmentsJson: params.attachmentsJson ?? "[]",
      relatedFilesJson: params.relatedFilesJson ?? "[]",
      relatedTaskIdsJson: params.relatedTaskIdsJson ?? "[]",
      toolUseMetadataJson: params.toolUseMetadataJson ?? null,
      toolResultReference: params.toolResultReference ?? null,
      tokenEstimate: params.tokenEstimate ?? 0,
      isCompacted: params.isCompacted ? 1 : 0,
      compactionStrategy: params.compactionStrategy ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.db
      .prepare(
        "INSERT INTO messages (id, conversationId, workspaceId, agentId, role, content, normalizedSearchText, summary, attachmentsJson, relatedFilesJson, relatedTaskIdsJson, toolUseMetadataJson, toolResultReference, tokenEstimate, isCompacted, compactionStrategy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        msg.id,
        msg.conversationId,
        msg.workspaceId,
        msg.agentId,
        msg.role,
        msg.content,
        msg.normalizedSearchText,
        msg.summary,
        msg.attachmentsJson,
        msg.relatedFilesJson,
        msg.relatedTaskIdsJson,
        msg.toolUseMetadataJson,
        msg.toolResultReference,
        msg.tokenEstimate,
        msg.isCompacted,
        msg.compactionStrategy,
        msg.createdAt,
        msg.updatedAt
      );
    return msg;
  }

  markCompacted(ids: string[]): void {
    const stmt = this.db.prepare("UPDATE messages SET isCompacted = 1, updatedAt = ? WHERE id = ?");
    const tx = this.db.transaction((idList: string[]) => {
      const now = new Date().toISOString();
      for (const id of idList) stmt.run(now, id);
    });
    tx(ids);
  }
}
