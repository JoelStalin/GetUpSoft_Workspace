import type { Database } from "../Database.ts";
import type { ToolResultBlob } from "../entities.ts";
import { randomUUID } from "node:crypto";

export class ToolResultBlobRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByHash(contentHash: string): ToolResultBlob | undefined {
    return this.db
      .prepare("SELECT * FROM tool_result_blobs WHERE contentHash = ?")
      .get(contentHash) as ToolResultBlob | undefined;
  }

  store(workspaceId: string, contentHash: string, bytes: number, preview: string, messageId?: string): ToolResultBlob {
    const existing = this.findByHash(contentHash);
    if (existing) return existing;

    const blob: ToolResultBlob = {
      id: randomUUID(),
      messageId: messageId ?? null,
      workspaceId,
      contentHash,
      bytes,
      preview,
      storedAt: new Date().toISOString(),
    };
    this.db
      .prepare(
        "INSERT INTO tool_result_blobs (id, messageId, workspaceId, contentHash, bytes, preview, storedAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(blob.id, blob.messageId, blob.workspaceId, blob.contentHash, blob.bytes, blob.preview, blob.storedAt);
    return blob;
  }
}
