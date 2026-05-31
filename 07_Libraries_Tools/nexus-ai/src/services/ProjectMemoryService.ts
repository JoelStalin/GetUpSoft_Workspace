import type { Database } from "../storage/Database.ts";
import { ProjectMemoryRepository } from "../storage/repositories/ProjectMemoryRepository.ts";
import type { ProjectMemory } from "../storage/entities.ts";

export class ProjectMemoryService {
  private repo: ProjectMemoryRepository;

  constructor(db: Database) {
    this.repo = new ProjectMemoryRepository(db);
  }

  learn(workspaceId: string, category: string, fact: string, confidence = 1.0): ProjectMemory {
    return this.repo.upsert(workspaceId, category, fact, confidence);
  }

  recall(workspaceId: string, category?: string): ProjectMemory[] {
    return this.repo.findByWorkspace(workspaceId, category);
  }

  forget(id: string): void {
    this.repo.delete(id);
  }

  summarize(workspaceId: string, maxItems = 20): string[] {
    return this.repo
      .findByWorkspace(workspaceId)
      .slice(0, maxItems)
      .map((m) => `[${m.category}] ${m.fact}`);
  }
}
