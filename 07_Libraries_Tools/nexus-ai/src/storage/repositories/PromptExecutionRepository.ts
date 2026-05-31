import type { Database } from "../Database.ts";
import type { PromptExecution, PromptExecutionStep } from "../entities.ts";
import { randomUUID } from "node:crypto";

export class PromptExecutionRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByWorkspace(workspaceId: string, epic?: string): PromptExecution[] {
    if (epic) {
      return this.db
        .prepare(
          "SELECT * FROM prompt_executions WHERE workspaceId = ? AND epic = ? ORDER BY createdAt"
        )
        .all(workspaceId, epic) as PromptExecution[];
    }
    return this.db
      .prepare(
        "SELECT * FROM prompt_executions WHERE workspaceId = ? ORDER BY epic, createdAt"
      )
      .all(workspaceId) as PromptExecution[];
  }

  create(workspaceId: string, epic: string, title: string, technicalWeight = 1): PromptExecution {
    const now = new Date().toISOString();
    const exec: PromptExecution = {
      id: randomUUID(),
      workspaceId,
      epic,
      title,
      technicalWeight,
      status: "pending",
      completionPercent: 0,
      startedAt: null,
      completedAt: null,
      createdAt: now,
    };
    this.db
      .prepare(
        "INSERT INTO prompt_executions (id, workspaceId, epic, title, technicalWeight, status, completionPercent, startedAt, completedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        exec.id,
        exec.workspaceId,
        exec.epic,
        exec.title,
        exec.technicalWeight,
        exec.status,
        exec.completionPercent,
        exec.startedAt,
        exec.completedAt,
        exec.createdAt
      );
    return exec;
  }

  start(id: string): void {
    this.db
      .prepare("UPDATE prompt_executions SET status = 'in_progress', startedAt = ? WHERE id = ?")
      .run(new Date().toISOString(), id);
  }

  complete(id: string): void {
    this.db
      .prepare("UPDATE prompt_executions SET status = 'done', completedAt = ? WHERE id = ?")
      .run(new Date().toISOString(), id);
  }

  addStep(executionId: string, title: string): PromptExecutionStep {
    const step: PromptExecutionStep = {
      id: randomUUID(),
      executionId,
      title,
      done: 0,
      notes: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.db
      .prepare(
        "INSERT INTO prompt_execution_steps (id, executionId, title, done, notes, completedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(step.id, step.executionId, step.title, step.done, step.notes, step.completedAt, step.createdAt);
    return step;
  }

  completeStep(stepId: string): void {
    this.db
      .prepare(
        "UPDATE prompt_execution_steps SET done = 1, completedAt = ? WHERE id = ?"
      )
      .run(new Date().toISOString(), stepId);
  }

  findSteps(executionId: string): PromptExecutionStep[] {
    return this.db
      .prepare(
        "SELECT * FROM prompt_execution_steps WHERE executionId = ? ORDER BY createdAt"
      )
      .all(executionId) as PromptExecutionStep[];
  }
}
