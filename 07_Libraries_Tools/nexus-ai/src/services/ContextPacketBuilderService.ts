import type { Database } from "../storage/Database.ts";
import { ContextPacketBuilder, type BudgetConfig } from "../core/contextPacketBuilder.ts";
import { ContextPacketRepository } from "../storage/repositories/ContextPacketRepository.ts";
import type { ContextPacket } from "../storage/entities.ts";

export type PacketInput = {
  workspaceId: string;
  pendingTasks: string[];
  memoryFacts: string[];
  precedentHints: string[];
  conversationDelta: string[];
  projectSummary?: string[];
  recentDecisions?: string[];
  recentChanges?: string[];
  skillsHints?: string[];
  repositoryConstraints?: string[];
  suggestedNextSteps?: string[];
  deltaOnly?: boolean;
  mode?: string;
};

export class ContextPacketBuilderService {
  private builder: ContextPacketBuilder;
  private repo: ContextPacketRepository;

  constructor(
    db: Database,
    budgets: BudgetConfig = {
      pendingTasks: 5,
      memoryFacts: 10,
      precedentHints: 3,
      conversationDelta: 20,
      projectSummary: 3,
      recentDecisions: 5,
      recentChanges: 5,
      skillsHints: 5,
      repositoryConstraints: 5,
      suggestedNextSteps: 5,
    }
  ) {
    this.builder = new ContextPacketBuilder(budgets);
    this.repo = new ContextPacketRepository(db);
  }

  build(input: PacketInput): ContextPacket {
    const packet = this.builder.build({
        pendingTasks: input.pendingTasks,
        memoryFacts: input.memoryFacts,
        precedentHints: input.precedentHints,
        conversationDelta: input.conversationDelta,
        projectSummary: input.projectSummary,
        recentDecisions: input.recentDecisions,
        recentChanges: input.recentChanges,
        skillsHints: input.skillsHints,
        repositoryConstraints: input.repositoryConstraints,
        suggestedNextSteps: input.suggestedNextSteps,
      });

    const blocks = Object.entries(packet.blocks).flatMap(([blockType, items]) =>
      (items ?? []).map((content) => ({ blockType, content, tokenEstimate: Math.ceil(content.length / 4) }))
    );

    return this.repo.save({
      workspaceId: input.workspaceId,
      budgetTotal: packet.itemBudgetTotal,
      budgetUsed: packet.itemBudgetUsed,
      deltaOnly: input.deltaOnly ?? true,
      mode: input.mode ?? "automatic",
      projectSummary: (input.projectSummary ?? []).join("\n"),
      recentDecisionsJson: JSON.stringify(input.recentDecisions ?? []),
      recentChangesJson: JSON.stringify(input.recentChanges ?? []),
      skillsHintsJson: JSON.stringify(input.skillsHints ?? []),
      repositoryConstraintsJson: JSON.stringify(input.repositoryConstraints ?? []),
      suggestedNextStepsJson: JSON.stringify(input.suggestedNextSteps ?? []),
      blocks,
    });
  }

  latestForWorkspace(workspaceId: string): ContextPacket | undefined {
    return this.repo.findLatestByWorkspace(workspaceId);
  }
}
