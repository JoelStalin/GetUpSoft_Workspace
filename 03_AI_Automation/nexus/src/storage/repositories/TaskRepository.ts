import type { Database } from "../Database.ts";
import type { Task, TaskStep } from "../entities.ts";
import { randomUUID } from "node:crypto";

export type NewTask = {
  workspaceId: string;
  epic: string;
  title: string;
  description?: string | null;
  sourceConversationId?: string | null;
  sourceMessageId?: string | null;
  status?: string;
  priority?: string;
  tagsJson?: string;
  relatedFilesJson?: string;
  dependsOnJson?: string;
  acceptanceCriteriaJson?: string;
  completionPercent?: number;
  kind?: string;
  technicalWeight?: number;
};

export class TaskRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByWorkspace(workspaceId: string, epic?: string): Task[] {
    if (epic) {
      return this.db
        .prepare(
          "SELECT * FROM tasks WHERE workspaceId = ? AND epic = ? ORDER BY createdAt"
        )
        .all(workspaceId, epic) as Task[];
    }
    return this.db
      .prepare("SELECT * FROM tasks WHERE workspaceId = ? ORDER BY epic, createdAt")
      .all(workspaceId) as Task[];
  }

  findById(id: string): Task | undefined {
    return this.db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined;
  }

  create(
    input: string | NewTask,
    epic?: string,
    title?: string,
    technicalWeight = 1
  ): Task {
    const now = new Date().toISOString();
    const params: NewTask =
      typeof input === "string"
        ? {
            workspaceId: input,
            epic: epic ?? "general",
            title: title ?? "Untitled task",
            technicalWeight,
          }
        : input;
    const task: Task = {
      id: randomUUID(),
      workspaceId: params.workspaceId,
      epic: params.epic,
      title: params.title,
      description: params.description ?? null,
      status: params.status ?? "pending",
      priority: params.priority ?? "medium",
      tagsJson: params.tagsJson ?? "[]",
      relatedFilesJson: params.relatedFilesJson ?? "[]",
      dependsOnJson: params.dependsOnJson ?? "[]",
      acceptanceCriteriaJson: params.acceptanceCriteriaJson ?? "[]",
      completionPercent: params.completionPercent ?? 0,
      kind: params.kind ?? "task",
      sourceConversationId: params.sourceConversationId ?? null,
      sourceMessageId: params.sourceMessageId ?? null,
      technicalWeight: params.technicalWeight ?? technicalWeight,
      createdAt: now,
      updatedAt: now,
    };
    this.db
      .prepare(
        "INSERT INTO tasks (id, workspaceId, epic, title, description, status, priority, tagsJson, relatedFilesJson, dependsOnJson, acceptanceCriteriaJson, completionPercent, kind, sourceConversationId, sourceMessageId, technicalWeight, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        task.id,
        task.workspaceId,
        task.epic,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.tagsJson,
        task.relatedFilesJson,
        task.dependsOnJson,
        task.acceptanceCriteriaJson,
        task.completionPercent,
        task.kind,
        task.sourceConversationId,
        task.sourceMessageId,
        task.technicalWeight,
        task.createdAt,
        task.updatedAt
      );
    return task;
  }

  updateStatus(id: string, status: string): void {
    this.db
      .prepare("UPDATE tasks SET status = ?, updatedAt = ? WHERE id = ?")
      .run(status, new Date().toISOString(), id);
  }

  updateCompletion(id: string, completionPercent: number): void {
    this.db
      .prepare("UPDATE tasks SET completionPercent = ?, updatedAt = ? WHERE id = ?")
      .run(Math.max(0, Math.min(100, completionPercent)), new Date().toISOString(), id);
  }

  addStep(taskId: string, title: string): TaskStep {
    const step: TaskStep = {
      id: randomUUID(),
      taskId,
      title,
      done: 0,
      createdAt: new Date().toISOString(),
    };
    this.db
      .prepare(
        "INSERT INTO task_steps (id, taskId, title, done, createdAt) VALUES (?, ?, ?, ?, ?)"
      )
      .run(step.id, step.taskId, step.title, step.done, step.createdAt);
    return step;
  }

  pendingByWorkspace(workspaceId: string, limit = 25): Task[] {
    return this.db
      .prepare(
        "SELECT * FROM tasks WHERE workspaceId = ? AND status != 'done' ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, updatedAt DESC LIMIT ?"
      )
      .all(workspaceId, limit) as Task[];
  }

  findSteps(taskId: string): TaskStep[] {
    return this.db
      .prepare("SELECT * FROM task_steps WHERE taskId = ? ORDER BY createdAt")
      .all(taskId) as TaskStep[];
  }

  completeStep(stepId: string): void {
    this.db.prepare("UPDATE task_steps SET done = 1 WHERE id = ?").run(stepId);
  }
}
