import type { AgentAdapter, CapturedConversation } from "./agentAdapter.ts";
import { StubAgentAdapter, ManualImportAdapter } from "./agentAdapter.ts";

export type AdapterCapability = "capture" | "inject" | "import" | "normalize";

export interface RegisteredAdapter {
  key: string;
  displayName: string;
  capabilities: AdapterCapability[];
  isStub: boolean;
  adapter: AgentAdapter;
}

export class AdapterRegistry {
  private adapters = new Map<string, RegisteredAdapter>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    const stubs: Array<{ key: string; name: string }> = [
      { key: "copilot", name: "GitHub Copilot" },
      { key: "cursor", name: "Cursor AI" },
      { key: "chatgpt", name: "ChatGPT" },
      { key: "claude-code", name: "Claude Code" },
    ];

    for (const { key, name } of stubs) {
      this.register({
        key,
        displayName: name,
        capabilities: ["capture", "import"],
        isStub: true,
        adapter: new StubAgentAdapter(key as CapturedConversation["sourceAgent"]),
      });
    }

    this.register({
      key: "manual_import",
      displayName: "Manual Import",
      capabilities: ["import", "normalize"],
      isStub: false,
      adapter: new ManualImportAdapter({ sourceAgent: "manual_import", messages: [] }),
    });
  }

  register(entry: RegisteredAdapter): void {
    this.adapters.set(entry.key, entry);
  }

  get(key: string): RegisteredAdapter | undefined {
    return this.adapters.get(key);
  }

  list(): RegisteredAdapter[] {
    return Array.from(this.adapters.values());
  }

  getAdapter(key: string): AgentAdapter | undefined {
    return this.adapters.get(key)?.adapter;
  }

  withCapability(cap: AdapterCapability): RegisteredAdapter[] {
    return this.list().filter((a) => a.capabilities.includes(cap));
  }

  createManualImport(captured: CapturedConversation): AgentAdapter {
    return new ManualImportAdapter(captured, "manual_import");
  }
}

export const defaultRegistry = new AdapterRegistry();
