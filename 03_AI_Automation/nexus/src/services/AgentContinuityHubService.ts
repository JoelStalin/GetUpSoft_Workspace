import type { Database } from "../storage/Database.ts";
import type { AgentAdapter, CapturedConversation } from "../adapters/agentAdapter.ts";
import type { Agent, Conversation, ContextPacket, PromptRequirementCoverage, ResearchReference, Skill, Task, Workspace } from "../storage/entities.ts";
import { AgentRepository } from "../storage/repositories/AgentRepository.ts";
import { WorkspaceResolverService, type WorkspaceResolveInput } from "./WorkspaceResolverService.ts";
import { ConversationCaptureService } from "./ConversationCaptureService.ts";
import { ProjectMemoryService } from "./ProjectMemoryService.ts";
import { SessionMemoryService } from "./SessionMemoryService.ts";
import { TaskExtractionService } from "./TaskExtractionService.ts";
import { ChangeAuditService } from "./ChangeAuditService.ts";
import { ResumeContextService } from "./ResumeContextService.ts";
import { ContextPacketBuilderService } from "./ContextPacketBuilderService.ts";
import { ImplementationPrecedentService, type ChangeIntent } from "./ImplementationPrecedentService.ts";
import { SkillsEngineService } from "./SkillsEngineService.ts";
import { ResearchBibliographyService } from "./ResearchBibliographyService.ts";
import { PromptCoverageService, type CoverageSeed } from "./PromptCoverageService.ts";
import { MetricsInstrumentationService } from "./MetricsInstrumentationService.ts";
import { DashboardModel, type DashboardContextInput } from "../ui/dashboardModel.ts";

export type IngestConversationInput = {
  workspaceId: string;
  adapter?: AgentAdapter;
  captured?: CapturedConversation;
  agentId?: string;
  epic?: string;
};

export type ContinuitySnapshot = {
  workspace: Workspace;
  packet: ContextPacket;
  pendingTasks: Task[];
  skills: Skill[];
  researchReferences: ResearchReference[];
  coverage: ReturnType<PromptCoverageService["summarize"]>;
  dashboard: ReturnType<DashboardModel["buildWithContext"]>;
};

export class AgentContinuityHubService {
  private workspaceService: WorkspaceResolverService;
  private conversationService: ConversationCaptureService;
  private agentRepo: AgentRepository;
  private memoryService: ProjectMemoryService;
  private sessionMemoryService: SessionMemoryService;
  private taskService: TaskExtractionService;
  private changeAuditService: ChangeAuditService;
  private resumeContextService: ResumeContextService;
  private packetBuilderService: ContextPacketBuilderService;
  private precedentService: ImplementationPrecedentService;
  private skillsService: SkillsEngineService;
  private researchService: ResearchBibliographyService;
  private coverageService: PromptCoverageService;
  private metricsService: MetricsInstrumentationService;
  private dashboardModel: DashboardModel;

  constructor(db: Database) {
    this.workspaceService = new WorkspaceResolverService(db);
    this.conversationService = new ConversationCaptureService(db);
    this.agentRepo = new AgentRepository(db);
    this.memoryService = new ProjectMemoryService(db);
    this.sessionMemoryService = new SessionMemoryService(db);
    this.taskService = new TaskExtractionService(db);
    this.changeAuditService = new ChangeAuditService(db);
    this.resumeContextService = new ResumeContextService(db);
    this.packetBuilderService = new ContextPacketBuilderService(db);
    this.precedentService = new ImplementationPrecedentService(db);
    this.skillsService = new SkillsEngineService(db);
    this.researchService = new ResearchBibliographyService(db);
    this.coverageService = new PromptCoverageService(db);
    this.metricsService = new MetricsInstrumentationService(db);
    this.dashboardModel = new DashboardModel();
  }

  bootstrapWorkspace(input: WorkspaceResolveInput): Workspace {
    const workspace = this.workspaceService.resolveWorkspace(input);
    this.researchService.ensureDefaults(workspace.id);
    return workspace;
  }

  registerAgent(workspaceId: string, name: string, adapterType: string, config: object = {}): Agent {
    return this.agentRepo.create(workspaceId, name, adapterType, config);
  }

  registerSkill(input: Parameters<SkillsEngineService["register"]>[0]): Skill {
    return this.skillsService.register(input);
  }

  bindSkill(skillId: string, agentId: string, workspaceId?: string, bindingContext?: string) {
    return this.skillsService.bind(skillId, agentId, workspaceId, bindingContext);
  }

  addResearchReference(input: Parameters<ResearchBibliographyService["add"]>[0]): ResearchReference {
    return this.researchService.add(input);
  }

  ingestConversation(input: IngestConversationInput): Promise<Conversation> | Conversation {
    if (input.adapter) {
      return input.adapter.capture().then((captured) =>
        this.ingestCapturedConversation(input.workspaceId, captured, input.agentId, input.epic)
      );
    }
    if (!input.captured) {
      throw new Error("Either adapter or captured conversation must be provided.");
    }
    return this.ingestCapturedConversation(input.workspaceId, input.captured, input.agentId, input.epic);
  }

  remember(workspaceId: string, category: string, fact: string, confidence = 1): void {
    this.memoryService.learn(workspaceId, category, fact, confidence);
  }

  recordCoverage(workspaceId: string, items: CoverageSeed[]): PromptRequirementCoverage[] {
    return this.coverageService.seed(workspaceId, items);
  }

  buildContinuitySnapshot(
    workspaceId: string,
    options: { agentId?: string; stack?: string; framework?: string; intent?: ChangeIntent } = {}
  ): ContinuitySnapshot {
    const workspace = this.workspaceService.findById(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} was not found.`);
    }

    const agent = options.agentId ? this.agentRepo.findById(options.agentId) : undefined;
    const researchReferences = this.researchService.list(workspaceId);
    const skills = this.skillsService.suggest({
      workspaceId,
      agent,
      stack: options.stack,
      framework: options.framework,
      recentContext: researchReferences.map((reference) => reference.title),
    });

    const resume = this.resumeContextService.build(workspaceId, options.intent, {
      skillsHints: skills.map((skill) => skill.name),
      repositoryConstraints: [
        "Prefer persistent compacted context over replaying full history.",
        "Keep continuity isolated by workspace/worktree unless precedent reuse is explicitly allowed.",
      ],
    });

    const packet = this.packetBuilderService.build({
      workspaceId,
      pendingTasks: resume.pendingTasks,
      memoryFacts: resume.memoryFacts,
      precedentHints: resume.precedentHints,
      conversationDelta: resume.conversationDelta,
      projectSummary: resume.projectSummary,
      recentDecisions: resume.recentDecisions,
      recentChanges: resume.recentChanges,
      skillsHints: resume.skillsHints,
      repositoryConstraints: resume.repositoryConstraints,
      suggestedNextSteps: resume.suggestedNextSteps,
      deltaOnly: true,
      mode: "automatic",
    });

    const rawContextTokens =
      resume.pendingTasks.length * 25 +
      resume.memoryFacts.length * 25 +
      resume.precedentHints.length * 25 +
      resume.conversationDelta.length * 30 +
      resume.recentChanges.length * 25;
    const compactedTokens = Math.ceil(packet.budgetUsed * 18);
    this.metricsService.record(workspaceId, {
      rawContextTokens,
      compactedTokens,
      rawContextChars: rawContextTokens * 4,
      compressedContextChars: compactedTokens * 4,
      strategy: "continuity-packet",
      conversationId: null,
      summarizedContextBlocks: 3,
      reusedContextBlocks: Math.max(0, resume.relatedWorkspaces.length),
      offloadedPayloadCount: 0,
      toolResultCompactions: 0,
      memoryExtractions: resume.memoryFacts.length,
      similarImplementationHits: resume.precedentHints.length,
      precedentReusePercent: resume.precedentHints.length > 0 ? 100 : 0,
      crossProjectConsistencyMatches: resume.relatedWorkspaces.length,
    });

    const coverage = this.coverageService.summarize(workspaceId);
    const dashboard = this.dashboardModel.buildWithContext({
      overallProgress: coverage.overallPercent,
      tokensBaseline: rawContextTokens,
      tokensOptimized: compactedTokens,
      pendingTaskCount: resume.pendingTasks.length,
      recentChangesCount: resume.recentChanges.length,
      skillsCount: skills.length,
      coverageByEpic: coverage.byEpic,
      recentWorkspaces: resume.relatedWorkspaces,
    });

    return {
      workspace,
      packet,
      pendingTasks: this.taskService.findByEpic(workspaceId).filter((task) => task.status !== "done"),
      skills,
      researchReferences,
      coverage,
      dashboard,
    };
  }

  private ingestCapturedConversation(
    workspaceId: string,
    captured: CapturedConversation,
    agentId?: string,
    epic = "conversation-ingest"
  ): Conversation {
    const conversation = this.conversationService.captureConversation({
      workspaceId,
      sourceAgent: captured.sourceAgent,
      sourceAdapter: captured.sourceAgent,
      title: captured.title,
      summary: captured.summary,
      recentContext: captured.recentContext,
      relatedFiles: captured.relatedFiles,
      linkedAgents: captured.linkedAgents,
      agentId,
      messages: captured.messages,
    });

    for (const message of captured.messages) {
      if (this.sessionMemoryService.shouldExtractMemory(conversation.id, 0)) {
        this.sessionMemoryService.record(
          conversation.id,
          workspaceId,
          "recentContext",
          message.summary ?? message.content.slice(0, 240),
          0.8
        );
      }

      const tasks = this.taskService.extractFromText(workspaceId, epic, message.content);
      for (const task of tasks) {
        this.changeAuditService.record({
          workspaceId,
          agentId: agentId ?? "unknown",
          adapterId: captured.sourceAgent,
          changeType: "task-extracted",
          title: `Extracted task: ${task.title}`,
          relatedConversationId: conversation.id,
          relatedTaskId: task.id,
          affectedEntityType: "task",
          affectedEntityId: task.id,
        });
      }
    }

    this.memoryService.learn(
      workspaceId,
      "recentContext",
      captured.summary ?? `Conversation ${conversation.id} captured from ${captured.sourceAgent}`,
      0.8
    );

    return conversation;
  }
}
