import type { Database } from "../storage/Database.ts";
import { ProjectMemoryService } from "./ProjectMemoryService.ts";
import { TaskExtractionService } from "./TaskExtractionService.ts";
import { ChangeAuditService } from "./ChangeAuditService.ts";
import { ImplementationPrecedentService, type ChangeIntent } from "./ImplementationPrecedentService.ts";
import { TranscriptService } from "./TranscriptService.ts";
import { ConversationRepository } from "../storage/repositories/ConversationRepository.ts";
import { DecisionRepository } from "../storage/repositories/DecisionRepository.ts";
import { WorkspaceResolverService } from "./WorkspaceResolverService.ts";

export type ResumeContext = {
  workspaceId: string;
  projectSummary: string[];
  memoryFacts: string[];
  pendingTasks: string[];
  recentDecisions: string[];
  recentChanges: string[];
  skillsHints: string[];
  repositoryConstraints: string[];
  suggestedNextSteps: string[];
  precedentHints: string[];
  conversationDelta: string[];
  relatedWorkspaces: string[];
};

export class ResumeContextService {
  private memoryService: ProjectMemoryService;
  private taskService: TaskExtractionService;
  private auditService: ChangeAuditService;
  private precedentService: ImplementationPrecedentService;
  private transcriptService: TranscriptService;
  private convRepo: ConversationRepository;
  private decisionRepo: DecisionRepository;
  private workspaceService: WorkspaceResolverService;

  constructor(db: Database) {
    this.memoryService = new ProjectMemoryService(db);
    this.taskService = new TaskExtractionService(db);
    this.auditService = new ChangeAuditService(db);
    this.precedentService = new ImplementationPrecedentService(db);
    this.transcriptService = new TranscriptService(db);
    this.convRepo = new ConversationRepository(db);
    this.decisionRepo = new DecisionRepository(db);
    this.workspaceService = new WorkspaceResolverService(db);
  }

  build(
    workspaceId: string,
    currentIntent?: ChangeIntent,
    options: { skillsHints?: string[]; repositoryConstraints?: string[] } = {}
  ): ResumeContext {
    const workspace = this.workspaceService.findById(workspaceId);
    const memoryFacts = this.memoryService.summarize(workspaceId, 10);
    const projectSummary = [
      workspace?.name ? `Workspace: ${workspace.name}` : "Workspace registered",
      workspace?.rootPath ? `Path: ${workspace.rootPath}` : "Path unknown",
      workspace?.repoRootPath ? `Repo root: ${workspace.repoRootPath}` : "Repo root not captured",
    ];

    const allTasks = this.taskService.findByEpic(workspaceId);
    const pendingTasks = allTasks
      .filter((t) => t.status !== "done")
      .slice(0, 10)
      .map((t) => `[${t.epic}] ${t.title} (${t.status})`);

    const recentDecisions = this.decisionRepo
      .findByWorkspace(workspaceId)
      .slice(0, 8)
      .map((decision) => `[${decision.status}] ${decision.title}`);

    const recentChanges = this.auditService.summarize(workspaceId, 5);

    let precedentHints: string[] = [];
    if (currentIntent) {
      const lookup = this.precedentService.resolve(currentIntent);
      precedentHints = lookup.similar.map(
        (precedent) => `Similar change found in ${precedent.sourceProject}: ${precedent.intent}`
      );
    }

    const recentConvs = this.convRepo.findByWorkspace(workspaceId, 3);
    const conversationDelta: string[] = [];
    for (const conv of recentConvs) {
      const lines = this.transcriptService.getTranscript(conv.id).slice(-5);
      for (const line of lines) {
        conversationDelta.push(`[${line.role}] ${line.content.slice(0, 200)}`);
      }
    }

    const relatedWorkspaces = this.workspaceService
      .related(workspaceId, 5)
      .map((related) => `${related.name} (${related.rootPath})`);

    return {
      workspaceId,
      projectSummary,
      memoryFacts,
      pendingTasks,
      recentDecisions,
      recentChanges,
      skillsHints: options.skillsHints ?? [],
      repositoryConstraints: options.repositoryConstraints ?? [],
      suggestedNextSteps: pendingTasks.slice(0, 3).map((task) => `Continue: ${task}`),
      precedentHints,
      conversationDelta,
      relatedWorkspaces,
    };
  }
}
