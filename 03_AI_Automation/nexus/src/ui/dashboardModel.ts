import { PromptTracker, type PromptEpic } from "../core/promptTracker.ts";

export type DashboardState = {
  overallProgress: number;
  tokenSavingsRatio: number;
  pendingTaskCount?: number;
  recentChangesCount?: number;
  skillsCount?: number;
  coverageByEpic?: Record<string, number>;
  recentWorkspaces?: string[];
};

export type DashboardContextInput = {
  overallProgress: number;
  tokensBaseline: number;
  tokensOptimized: number;
  pendingTaskCount: number;
  recentChangesCount: number;
  skillsCount: number;
  coverageByEpic: Record<string, number>;
  recentWorkspaces: string[];
};

export class DashboardModel {
  private readonly tracker: PromptTracker;

  constructor(tracker: PromptTracker = new PromptTracker()) {
    this.tracker = tracker;
  }

  build(epics: PromptEpic[], tokensBaseline: number, tokensOptimized: number): DashboardState {
    const overallProgress = this.tracker.progress(epics);
    const rawSavings = tokensBaseline > 0 ? 1 - tokensOptimized / tokensBaseline : 0;
    const clampedSavings = Math.min(1, Math.max(0, rawSavings));
    const tokenSavingsRatio = Number(clampedSavings.toFixed(4));

    return {
      overallProgress,
      tokenSavingsRatio,
    };
  }

  buildWithContext(input: DashboardContextInput): DashboardState {
    const rawSavings = input.tokensBaseline > 0 ? 1 - input.tokensOptimized / input.tokensBaseline : 0;
    const clampedSavings = Math.min(1, Math.max(0, rawSavings));
    return {
      overallProgress: Number(input.overallProgress.toFixed(2)),
      tokenSavingsRatio: Number(clampedSavings.toFixed(4)),
      pendingTaskCount: input.pendingTaskCount,
      recentChangesCount: input.recentChangesCount,
      skillsCount: input.skillsCount,
      coverageByEpic: input.coverageByEpic,
      recentWorkspaces: input.recentWorkspaces,
    };
  }
}
