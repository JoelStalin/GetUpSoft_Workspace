import type { Database } from "../storage/Database.ts";
import { TaskRepository } from "../storage/repositories/TaskRepository.ts";
import type { Task, TaskStep } from "../storage/entities.ts";

const TODO_PATTERNS = [
  /(?:TODO|task|need to|should|must|have to)[:\s]+(.+)/gi,
  /[-*]\s+\[[ x]\]\s+(.+)/g,
];

export class TaskExtractionService {
  private repo: TaskRepository;

  constructor(db: Database) {
    this.repo = new TaskRepository(db);
  }

  extractFromText(workspaceId: string, epic: string, text: string): Task[] {
    const tasks: Task[] = [];
    for (const pattern of TODO_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const title = match[1].trim().slice(0, 200);
        if (title) {
          tasks.push(this.repo.create(workspaceId, epic, title));
        }
      }
    }
    return tasks;
  }

  create(workspaceId: string, epic: string, title: string, weight = 1): Task {
    return this.repo.create(workspaceId, epic, title, weight);
  }

  addStep(taskId: string, title: string): TaskStep {
    return this.repo.addStep(taskId, title);
  }

  completeStep(stepId: string): void {
    this.repo.completeStep(stepId);
  }

  complete(taskId: string): void {
    this.repo.updateStatus(taskId, "done");
  }

  findByEpic(workspaceId: string, epic?: string): Task[] {
    return this.repo.findByWorkspace(workspaceId, epic);
  }

  findSteps(taskId: string): TaskStep[] {
    return this.repo.findSteps(taskId);
  }
}
