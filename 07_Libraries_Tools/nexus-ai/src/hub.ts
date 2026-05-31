import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { CompactionEngine } from "./compaction/compactionEngine.ts";
import { ContextPacketBuilder, type BudgetConfig } from "./core/contextPacketBuilder.ts";
import { PromptTracker } from "./core/promptTracker.ts";
import { ConsistencyHintService } from "./precedents/consistencyHintService.ts";
import { openDatabase, type Database } from "./storage/Database.ts";
import { ContextPacketBuilderService } from "./services/ContextPacketBuilderService.ts";
import { MetricsInstrumentationService } from "./services/MetricsInstrumentationService.ts";
import { PromptCoverageService } from "./services/PromptCoverageService.ts";
import { AgentContinuityHubService } from "./services/AgentContinuityHubService.ts";

export type HubServices = {
  db: Database;
  continuityHub: AgentContinuityHubService;
  contextPacketService: ContextPacketBuilderService;
  metricsService: MetricsInstrumentationService;
  promptCoverageService: PromptCoverageService;
  contextPacketBuilder: ContextPacketBuilder;
  compactionEngine: CompactionEngine;
  promptTracker: PromptTracker;
  consistencyHintService: ConsistencyHintService;
};

export const DEFAULT_BUDGET: BudgetConfig = {
  pendingTasks: 500,
  memoryFacts: 300,
  precedentHints: 300,
  conversationDelta: 900,
  projectSummary: 50,
  recentDecisions: 120,
  recentChanges: 120,
  skillsHints: 120,
  repositoryConstraints: 80,
  suggestedNextSteps: 80,
};

export function createHub(dbPath?: string): HubServices {
  const compactionEngine = new CompactionEngine();
  const resolvedPath = dbPath ?? join(process.cwd(), ".aihub", "continuity.sqlite");
  mkdirSync(dirname(resolvedPath), { recursive: true });
  const db = openDatabase(resolvedPath);

  return {
    db,
    continuityHub: new AgentContinuityHubService(db),
    contextPacketService: new ContextPacketBuilderService(db, DEFAULT_BUDGET),
    metricsService: new MetricsInstrumentationService(db),
    promptCoverageService: new PromptCoverageService(db),
    contextPacketBuilder: new ContextPacketBuilder(DEFAULT_BUDGET, compactionEngine),
    compactionEngine,
    promptTracker: new PromptTracker(),
    consistencyHintService: new ConsistencyHintService(),
  };
}

export { AgentContinuityHubService } from "./services/AgentContinuityHubService.ts";
export { ContextPacketBuilderService } from "./services/ContextPacketBuilderService.ts";
export { MetricsInstrumentationService } from "./services/MetricsInstrumentationService.ts";
export { PromptCoverageService } from "./services/PromptCoverageService.ts";
