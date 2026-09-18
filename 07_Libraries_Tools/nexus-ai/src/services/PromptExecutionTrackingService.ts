import type { Database } from "../storage/Database.ts";
import { PromptExecutionRepository } from "../storage/repositories/PromptExecutionRepository.ts";
import type { PromptExecution, PromptExecutionStep } from "../storage/entities.ts";
import type { PromptEpic } from "../core/promptTracker.ts";
import { PromptTracker } from "../core/promptTracker.ts";

export class PromptExecutionTrackingService {
  private repo: PromptExecutionRepository;
  private tracker: PromptTracker;

  constructor(db: Database) {
    this.repo = new PromptExecutionRepository(db);
    this.tracker = new PromptTracker();
  }

  create(workspaceId: string, epic: string, title: string, weight = 1): PromptExecution {
    return this.repo.create(workspaceId, epic, title, weight);
  }

  start(id: string): void {
    this.repo.start(id);
  }

  complete(id: string): void {
    this.repo.complete(id);
  }

  addStep(executionId: string, title: string): PromptExecutionStep {
    return this.repo.addStep(executionId, title);
  }

  completeStep(stepId: string): void {
    this.repo.completeStep(stepId);
  }

  progressForWorkspace(workspaceId: string): number {
    const executions = this.repo.findByWorkspace(workspaceId);
    const epicMap = new Map<string, PromptEpic>();

    for (const exec of executions) {
      const steps = this.repo.findSteps(exec.id);
      if (!epicMap.has(exec.epic)) {
        epicMap.set(exec.epic, { tasks: [] });
      }
      epicMap.get(exec.epic)!.tasks.push({
        technicalWeight: exec.technicalWeight,
        steps: steps.map((s) => ({ done: s.done === 1 })),
      });
    }

    return this.tracker.progress(Array.from(epicMap.values()));
  }

  findByWorkspace(workspaceId: string): PromptExecution[] {
    return this.repo.findByWorkspace(workspaceId);
  }
}
