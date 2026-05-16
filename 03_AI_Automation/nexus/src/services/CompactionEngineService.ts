import type { Database } from "../storage/Database.ts";
import { CompactionEngine } from "../compaction/compactionEngine.ts";
import { MessageRepository } from "../storage/repositories/MessageRepository.ts";
import { ToolResultBlobRepository } from "../storage/repositories/ToolResultBlobRepository.ts";
import type { ToolResultBlob } from "../storage/entities.ts";

export type CompactionResult = {
  kept: string[];
  compactedCount: number;
  markedIds: string[];
};

export class CompactionEngineService {
  private engine: CompactionEngine;
  private msgRepo: MessageRepository;
  private blobRepo: ToolResultBlobRepository;

  constructor(db: Database, previewChars = 280) {
    this.engine = new CompactionEngine(previewChars);
    this.msgRepo = new MessageRepository(db);
    this.blobRepo = new ToolResultBlobRepository(db);
  }

  compactWorkspace(workspaceId: string, maxItems: number): CompactionResult {
    const messages = this.msgRepo.findUncompactedByWorkspace(workspaceId, maxItems * 2);
    const contents = messages.map((m) => m.content);
    const kept = this.engine.microcompact(contents, maxItems);
    const compactedCount = messages.length - kept.length;

    const markedIds = messages.slice(0, compactedCount).map((m) => m.id);
    if (markedIds.length > 0) {
      this.msgRepo.markCompacted(markedIds);
    }

    return { kept, compactedCount, markedIds };
  }

  offloadToolOutput(workspaceId: string, rawOutput: string, messageId?: string): ToolResultBlob {
    const result = this.engine.offloadToolOutput(rawOutput);
    return this.blobRepo.store(workspaceId, result.contentHash, result.bytes, result.preview, messageId);
  }
}
