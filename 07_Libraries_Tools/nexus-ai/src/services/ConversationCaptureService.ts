import type { Database } from "../storage/Database.ts";
import { ConversationRepository } from "../storage/repositories/ConversationRepository.ts";
import { MessageRepository } from "../storage/repositories/MessageRepository.ts";
import type { AgentAdapter } from "../adapters/agentAdapter.ts";
import type { Conversation } from "../storage/entities.ts";
import type { CapturedConversation, CapturedMessage } from "../adapters/agentAdapter.ts";

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function normalizeSearchText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export type CaptureConversationInput = {
  workspaceId: string;
  sourceAgent: string;
  agentId?: string;
  sourceAdapter?: string;
  title?: string;
  summary?: string;
  recentContext?: string;
  relatedFiles?: string[];
  linkedAgents?: string[];
  messages: CapturedMessage[];
};

export class ConversationCaptureService {
  private convRepo: ConversationRepository;
  private msgRepo: MessageRepository;

  constructor(db: Database) {
    this.convRepo = new ConversationRepository(db);
    this.msgRepo = new MessageRepository(db);
  }

  async captureFromAdapter(workspaceId: string, adapter: AgentAdapter): Promise<Conversation> {
    const captured = await adapter.capture();
    return this.captureConversation({
      workspaceId,
      sourceAgent: captured.sourceAgent,
      sourceAdapter: adapter.describe().adapterType,
      title: captured.title,
      summary: captured.summary,
      recentContext: captured.recentContext,
      relatedFiles: captured.relatedFiles,
      linkedAgents: captured.linkedAgents,
      messages: captured.messages,
    });
  }

  appendMessage(conversationId: string, workspaceId: string, role: string, content: string): void {
    this.msgRepo.insert({
      conversationId,
      workspaceId,
      role,
      content,
      normalizedSearchText: normalizeSearchText(content),
      tokenEstimate: estimateTokens(content),
    });
    this.convRepo.touch(conversationId);
  }

  findRecent(workspaceId: string, limit = 20): Conversation[] {
    return this.convRepo.findByWorkspace(workspaceId, limit);
  }

  captureConversation(input: CaptureConversationInput): Conversation {
    const conv = this.convRepo.create({
      workspaceId: input.workspaceId,
      sourceAgent: input.sourceAgent,
      agentId: input.agentId ?? null,
      title: input.title,
      sourceAdapter: input.sourceAdapter ?? null,
      summary: input.summary ?? null,
      recentContext: input.recentContext ?? null,
      linkedAgentsJson: JSON.stringify(input.linkedAgents ?? []),
      relatedFilesJson: JSON.stringify(input.relatedFiles ?? []),
    });

    for (const msg of input.messages) {
      this.msgRepo.insert({
        conversationId: conv.id,
        workspaceId: input.workspaceId,
        agentId: input.agentId ?? null,
        role: msg.role,
        content: msg.content,
        summary: msg.summary ?? null,
        attachmentsJson: JSON.stringify(msg.attachments ?? []),
        relatedFilesJson: JSON.stringify(msg.relatedFiles ?? input.relatedFiles ?? []),
        relatedTaskIdsJson: JSON.stringify(msg.relatedTaskIds ?? []),
        toolUseMetadataJson: msg.toolUseMetadata ? JSON.stringify(msg.toolUseMetadata) : null,
        toolResultReference: msg.toolResultReference ?? null,
        normalizedSearchText: normalizeSearchText(msg.content),
        tokenEstimate: estimateTokens(msg.content),
        compactionStrategy: msg.compactionStrategy ?? null,
      });
    }

    return conv;
  }
}
