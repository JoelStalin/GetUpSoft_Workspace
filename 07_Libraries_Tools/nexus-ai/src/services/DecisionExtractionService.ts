import type { Database } from "../storage/Database.ts";
import { DecisionRepository } from "../storage/repositories/DecisionRepository.ts";
import type { Decision } from "../storage/entities.ts";

const DECISION_PATTERNS = [
  /(?:decided?|decision|we(?:'ll| will) use|going with|chosen?|opted? (?:for|to))[:\s]+(.+)/i,
  /(?:agreed?|consensus)[:\s]+(.+)/i,
];

export class DecisionExtractionService {
  private repo: DecisionRepository;

  constructor(db: Database) {
    this.repo = new DecisionRepository(db);
  }

  extractFromText(workspaceId: string, text: string): Decision[] {
    const decisions: Decision[] = [];
    for (const pattern of DECISION_PATTERNS) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const title = match[1].trim().slice(0, 200);
        decisions.push(this.repo.create(workspaceId, title, text.slice(0, 500)));
      }
    }
    return decisions;
  }

  record(workspaceId: string, title: string, rationale: string, status = "open"): Decision {
    return this.repo.create(workspaceId, title, rationale, status);
  }

  findByWorkspace(workspaceId: string): Decision[] {
    return this.repo.findByWorkspace(workspaceId);
  }

  close(id: string): void {
    this.repo.updateStatus(id, "closed");
  }
}
