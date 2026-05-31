import { CompactionEngine } from "../compaction/compactionEngine.ts";

export type BudgetConfig = {
  pendingTasks: number;
  memoryFacts: number;
  precedentHints: number;
  conversationDelta: number;
  projectSummary?: number;
  recentDecisions?: number;
  recentChanges?: number;
  skillsHints?: number;
  repositoryConstraints?: number;
  suggestedNextSteps?: number;
};

export type ContextInput = {
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
};

export type ContextPacket = {
  blocks: ContextInput;
  itemBudgetTotal: number;
  itemBudgetUsed: number;
};

export class ContextPacketBuilder {
  private readonly budget: BudgetConfig;
  private readonly compactionEngine: CompactionEngine;

  constructor(
    budget: BudgetConfig,
    compactionEngine: CompactionEngine = new CompactionEngine(),
  ) {
    this.budget = budget;
    this.compactionEngine = compactionEngine;
  }

  build(input: ContextInput): ContextPacket {
    const blocks: ContextInput = {
      pendingTasks: this.fit(input.pendingTasks, this.budget.pendingTasks),
      memoryFacts: this.fit(input.memoryFacts, this.budget.memoryFacts),
      precedentHints: this.fit(input.precedentHints, this.budget.precedentHints),
      conversationDelta: this.fit(
        input.conversationDelta,
        this.budget.conversationDelta,
      ),
      projectSummary: this.fit(input.projectSummary ?? [], this.budget.projectSummary ?? 0),
      recentDecisions: this.fit(input.recentDecisions ?? [], this.budget.recentDecisions ?? 0),
      recentChanges: this.fit(input.recentChanges ?? [], this.budget.recentChanges ?? 0),
      skillsHints: this.fit(input.skillsHints ?? [], this.budget.skillsHints ?? 0),
      repositoryConstraints: this.fit(input.repositoryConstraints ?? [], this.budget.repositoryConstraints ?? 0),
      suggestedNextSteps: this.fit(input.suggestedNextSteps ?? [], this.budget.suggestedNextSteps ?? 0),
    };

    const itemBudgetUsed =
      blocks.pendingTasks.length +
      blocks.memoryFacts.length +
      blocks.precedentHints.length +
      blocks.conversationDelta.length +
      (blocks.projectSummary?.length ?? 0) +
      (blocks.recentDecisions?.length ?? 0) +
      (blocks.recentChanges?.length ?? 0) +
      (blocks.skillsHints?.length ?? 0) +
      (blocks.repositoryConstraints?.length ?? 0) +
      (blocks.suggestedNextSteps?.length ?? 0);

    return {
      blocks,
      itemBudgetTotal:
        this.budget.pendingTasks +
        this.budget.memoryFacts +
        this.budget.precedentHints +
        this.budget.conversationDelta +
        (this.budget.projectSummary ?? 0) +
        (this.budget.recentDecisions ?? 0) +
        (this.budget.recentChanges ?? 0) +
        (this.budget.skillsHints ?? 0) +
        (this.budget.repositoryConstraints ?? 0) +
        (this.budget.suggestedNextSteps ?? 0),
      itemBudgetUsed,
    };
  }

  private fit(items: string[], limit: number): string[] {
    if (items.length <= limit) {
      return items;
    }
    return this.compactionEngine.microcompact(items, limit);
  }
}
