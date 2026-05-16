import type { Database } from "../storage/Database.ts";
import { ResearchReferenceRepository, type NewResearchReference } from "../storage/repositories/ResearchReferenceRepository.ts";
import type { ResearchReference } from "../storage/entities.ts";

const DEFAULT_REFERENCES: NewResearchReference[] = [
  {
    title: "VS Code Extension API",
    kind: "documentation",
    url: "https://code.visualstudio.com/api",
    notes: "Base reference for turning the hub runtime into a real extension surface.",
    tagsJson: JSON.stringify(["vscode", "extension"]),
  },
  {
    title: "Repository pattern with SQLite in TypeScript",
    kind: "architecture",
    url: "https://martinfowler.com/eaaCatalog/repository.html",
    notes: "Reference for local-first persistence and repository boundaries.",
    tagsJson: JSON.stringify(["sqlite", "repository", "typescript"]),
  },
  {
    title: "Adapter pattern",
    kind: "architecture",
    url: "https://refactoring.guru/design-patterns/adapter",
    notes: "Useful when extending capture adapters and capability negotiation.",
    tagsJson: JSON.stringify(["adapter", "integration"]),
  },
];

export class ResearchBibliographyService {
  private repo: ResearchReferenceRepository;

  constructor(db: Database) {
    this.repo = new ResearchReferenceRepository(db);
  }

  ensureDefaults(workspaceId?: string): ResearchReference[] {
    return DEFAULT_REFERENCES.map((reference) =>
      this.repo.upsert({ ...reference, workspaceId: workspaceId ?? null })
    );
  }

  add(input: NewResearchReference): ResearchReference {
    return this.repo.upsert(input);
  }

  list(workspaceId?: string): ResearchReference[] {
    return this.repo.findByWorkspace(workspaceId);
  }

  summarize(workspaceId?: string, limit = 5): string[] {
    return this.list(workspaceId)
      .slice(0, limit)
      .map((reference) => `${reference.kind}: ${reference.title} -> ${reference.url}`);
  }
}
