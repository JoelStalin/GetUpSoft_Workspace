import type { Database } from "../storage/Database.ts";
import { MessageRepository } from "../storage/repositories/MessageRepository.ts";
import { ConversationRepository } from "../storage/repositories/ConversationRepository.ts";
import type { Message } from "../storage/entities.ts";

export type TranscriptLine = {
  role: string;
  content: string;
  tokenEstimate: number;
  isCompacted: boolean;
};

export class TranscriptService {
  private convRepo: ConversationRepository;
  private msgRepo: MessageRepository;

  constructor(db: Database) {
    this.convRepo = new ConversationRepository(db);
    this.msgRepo = new MessageRepository(db);
  }

  getTranscript(conversationId: string): TranscriptLine[] {
    return this.msgRepo.findByConversation(conversationId).map(toLine);
  }

  getActiveMessages(workspaceId: string, limit = 200): TranscriptLine[] {
    return this.msgRepo.findUncompactedByWorkspace(workspaceId, limit).map(toLine);
  }

  totalTokens(conversationId: string): number {
    return this.msgRepo
      .findByConversation(conversationId)
      .reduce((sum, m) => sum + m.tokenEstimate, 0);
  }

  renderableSearchText(content: string): string {
    return content.toLowerCase().replace(/\s+/g, " ").trim();
  }

  toolUseSearchText(toolUseMetadataJson: string | null): string {
    return this.renderableSearchText(toolUseMetadataJson ?? "");
  }

  toolResultSearchText(reference: string | null): string {
    return this.renderableSearchText(reference ?? "");
  }
}

function toLine(m: Message): TranscriptLine {
  return {
    role: m.role,
    content: m.content,
    tokenEstimate: m.tokenEstimate,
    isCompacted: m.isCompacted === 1,
  };
}
