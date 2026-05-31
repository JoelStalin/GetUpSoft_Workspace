import type { Database } from "../storage/Database.ts";
import { PromptRequirementCoverageRepository } from "../storage/repositories/PromptRequirementCoverageRepository.ts";
import type { PromptRequirementCoverage } from "../storage/entities.ts";

export type CoverageStatus = "missing" | "partial" | "implemented";

export type CoverageSeed = {
  requirementKey: string;
  epic: string;
  title: string;
  status: CoverageStatus;
  evidence?: string;
  reason?: string;
};

export type CoverageSummary = {
  overallPercent: number;
  byEpic: Record<string, number>;
  items: PromptRequirementCoverage[];
};

export class PromptCoverageService {
  private repo: PromptRequirementCoverageRepository;

  constructor(db: Database) {
    this.repo = new PromptRequirementCoverageRepository(db);
  }

  record(workspaceId: string, item: CoverageSeed): PromptRequirementCoverage {
    return this.repo.upsert({ workspaceId, ...item });
  }

  seed(workspaceId: string, items: CoverageSeed[]): PromptRequirementCoverage[] {
    return items.map((item) => this.record(workspaceId, item));
  }

  summarize(workspaceId: string): CoverageSummary {
    const items = this.repo.findByWorkspace(workspaceId);
    const grouped = new Map<string, PromptRequirementCoverage[]>();
    for (const item of items) {
      if (!grouped.has(item.epic)) grouped.set(item.epic, []);
      grouped.get(item.epic)!.push(item);
    }

    const byEpic: Record<string, number> = {};
    for (const [epic, epicItems] of grouped.entries()) {
      byEpic[epic] = this.percent(epicItems);
    }

    return {
      overallPercent: this.percent(items),
      byEpic,
      items,
    };
  }

  private percent(items: Array<{ status: string }>): number {
    if (items.length === 0) return 0;
    const total = items.reduce((sum, item) => sum + this.statusWeight(item.status), 0);
    return Number(((total / items.length) * 100).toFixed(2));
  }

  ensureDefaultCoverage(workspaceId: string): void {
    const existing = this.repo.findByWorkspace(workspaceId);
    if (existing.length > 0) return;

    const defaults: CoverageSeed[] = [
      { requirementKey: "workspace-memory", epic: "persistence", title: "Workspace memory isolation", status: "implemented", evidence: "WorkspaceResolverService" },
      { requirementKey: "conversation-capture", epic: "capture", title: "Conversation capture and storage", status: "implemented", evidence: "ConversationCaptureService" },
      { requirementKey: "task-extraction", epic: "tasks", title: "Task extraction from conversations", status: "implemented", evidence: "TaskExtractionService" },
      { requirementKey: "context-packet", epic: "context", title: "Context packet builder with budgets", status: "implemented", evidence: "ContextPacketBuilderService" },
      { requirementKey: "compaction", epic: "compaction", title: "Compaction engine and offloading", status: "implemented", evidence: "CompactionEngineService" },
      { requirementKey: "audit-log", epic: "audit", title: "Auditable change log by agent", status: "implemented", evidence: "ChangeAuditService" },
      { requirementKey: "precedents", epic: "precedents", title: "Implementation precedent registry", status: "implemented", evidence: "ImplementationPrecedentService" },
      { requirementKey: "skills-engine", epic: "skills", title: "Skills engine by workspace and stack", status: "implemented", evidence: "SkillsEngineService" },
      { requirementKey: "metrics", epic: "metrics", title: "Token reduction metrics and instrumentation", status: "implemented", evidence: "MetricsInstrumentationService" },
      { requirementKey: "vscode-extension", epic: "ui", title: "VS Code extension manifest and sidebar", status: "implemented", evidence: "package.json contributes + extension.ts" },
      { requirementKey: "adapter-registry", epic: "adapters", title: "Adapter registry with stubs", status: "partial", evidence: "AdapterRegistry with StubAgentAdapter" },
      { requirementKey: "cross-project-precedents", epic: "precedents", title: "Cross-project precedent lookup", status: "partial", evidence: "ImplementationPrecedentService.findSimilar" },
      { requirementKey: "semantic-search", epic: "search", title: "Semantic search index", status: "missing", evidence: "" },
      { requirementKey: "real-agent-integration", epic: "adapters", title: "Real integration with Copilot/Cursor/ChatGPT", status: "missing", evidence: "No public API available" },
    ];

    this.seed(workspaceId, defaults);
  }

  private statusWeight(status: string): number {
    switch (status) {
      case "implemented":
        return 1;
      case "partial":
        return 0.5;
      default:
        return 0;
    }
  }
}
