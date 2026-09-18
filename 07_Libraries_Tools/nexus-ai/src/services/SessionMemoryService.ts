import type { Database } from "../storage/Database.ts";
import { createHash, randomUUID } from "node:crypto";
import { MessageRepository } from "../storage/repositories/MessageRepository.ts";
import type { SessionMemory } from "../storage/entities.ts";

export class SessionMemoryService {
  private db: Database;
  private msgRepo: MessageRepository;

  constructor(db: Database) {
    this.db = db;
    this.msgRepo = new MessageRepository(db);
  }

  record(conversationId: string, workspaceId: string, category: string, fact: string, confidence = 1.0): SessionMemory {
    const memory: SessionMemory = {
      id: randomUUID(),
      conversationId,
      workspaceId,
      category,
      fact,
      confidence,
      createdAt: new Date().toISOString(),
    };
    this.db
      .prepare(
        "INSERT INTO session_memories (id, conversationId, workspaceId, category, fact, confidence, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(memory.id, memory.conversationId, memory.workspaceId, memory.category, memory.fact, memory.confidence, memory.createdAt);
    return memory;
  }

  findByConversation(conversationId: string): SessionMemory[] {
    return this.db
      .prepare(
        "SELECT * FROM session_memories WHERE conversationId = ? ORDER BY confidence DESC"
      )
      .all(conversationId) as SessionMemory[];
  }

  summarize(conversationId: string): string[] {
    return this.findByConversation(conversationId).map((m) => `[${m.category}] ${m.fact}`);
  }

  estimateMessageTokens(content: string): number {
    return Math.ceil(content.length / 4);
  }

  evaluateTimeBasedTrigger(lastExtractionAt: string | null, cooldownMinutes = 15): boolean {
    if (!lastExtractionAt) {
      return true;
    }
    return Date.now() - Date.parse(lastExtractionAt) >= cooldownMinutes * 60_000;
  }

  shouldExtractMemory(conversationId: string, threshold = 8): boolean {
    return this.getToolCallsBetweenUpdates(conversationId) >= threshold;
  }

  hasMetInitializationThreshold(conversationId: string, messageThreshold = 6): boolean {
    return this.msgRepo.findByConversation(conversationId).length >= messageThreshold;
  }

  hasMetUpdateThreshold(conversationId: string, messageThreshold = 4): boolean {
    const memories = this.findByConversation(conversationId);
    if (memories.length === 0) {
      return this.hasMetInitializationThreshold(conversationId, messageThreshold);
    }
    const latestMemoryAt = memories[0]?.createdAt ?? null;
    const newerMessages = this.msgRepo
      .findByConversation(conversationId)
      .filter((message) => !latestMemoryAt || Date.parse(message.createdAt) > Date.parse(latestMemoryAt));
    return newerMessages.length >= messageThreshold;
  }

  getToolCallsBetweenUpdates(conversationId: string): number {
    return this.msgRepo
      .findByConversation(conversationId)
      .filter((message) => message.toolUseMetadataJson)
      .length;
  }

  getSessionMemoryContent(conversationId: string): string {
    return this.summarize(conversationId).join("\n");
  }

  recordExtractionTokenCount(conversationId: string, workspaceId: string): SessionMemory {
    const content = this.getSessionMemoryContent(conversationId);
    return this.record(
      conversationId,
      workspaceId,
      "memoryExtraction",
      `Extracted ${this.estimateMessageTokens(content)} tokens from session memory`,
      1
    );
  }

  setLastSummarizedMessageId(conversationId: string, workspaceId: string, messageId: string): SessionMemory {
    return this.record(conversationId, workspaceId, "lastSummarizedMessageId", messageId, 1);
  }

  waitForSessionMemoryExtraction(): Promise<void> {
    return Promise.resolve();
  }

  contentHash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }
}
