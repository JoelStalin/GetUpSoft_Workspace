export type CapturedConversation = {
  sourceAgent: "copilot" | "cursor" | "chatgpt" | "manual_import" | "claude-code";
  title?: string;
  summary?: string;
  recentContext?: string;
  relatedFiles?: string[];
  linkedAgents?: string[];
  messages: CapturedMessage[];
};

export type CapturedMessage = {
  role: string;
  content: string;
  summary?: string;
  attachments?: string[];
  relatedFiles?: string[];
  relatedTaskIds?: string[];
  toolUseMetadata?: Record<string, unknown>;
  toolResultReference?: string;
  compactionStrategy?: string;
};

export type AgentAdapterDescription = {
  adapterType: string;
  supportsCrossAgentContinuity: boolean;
  captureMode: "manual" | "snapshot";
};

export interface AgentAdapter {
  capture(): Promise<CapturedConversation>;
  describe(): AgentAdapterDescription;
}

export class StubAgentAdapter implements AgentAdapter {
  private sourceAgent: CapturedConversation["sourceAgent"];

  constructor(sourceAgent: CapturedConversation["sourceAgent"]) {
    this.sourceAgent = sourceAgent;
  }

  async capture(): Promise<CapturedConversation> {
    return {
      sourceAgent: this.sourceAgent,
      title: "stub-capture",
      messages: [],
    };
  }

  describe(): AgentAdapterDescription {
    return {
      adapterType: this.sourceAgent,
      supportsCrossAgentContinuity: true,
      captureMode: "manual",
    };
  }
}

export class ManualImportAdapter implements AgentAdapter {
  private readonly captured: CapturedConversation;
  private readonly adapterType: string;

  constructor(captured: CapturedConversation, adapterType = "manual_import") {
    this.captured = captured;
    this.adapterType = adapterType;
  }

  async capture(): Promise<CapturedConversation> {
    return this.captured;
  }

  describe(): AgentAdapterDescription {
    return {
      adapterType: this.adapterType,
      supportsCrossAgentContinuity: true,
      captureMode: "manual",
    };
  }
}
