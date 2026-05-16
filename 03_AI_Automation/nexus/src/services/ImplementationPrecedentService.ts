import { createHash } from "node:crypto";
import type { Database } from "../storage/Database.ts";
import { ImplementationPrecedentRepository } from "../storage/repositories/ImplementationPrecedentRepository.ts";
import type { ImplementationPrecedent } from "../storage/entities.ts";

export type ChangeIntent = {
  intent: string;
  stack: string;
  filesAffected: string[];
  workspaceId?: string;
  repoId?: string;
  projectLabel?: string;
  agentId?: string;
  outcome?: string;
  rationale?: string;
  resultNotes?: string;
  patchReference?: string;
  variantSummary?: string;
};

export type PrecedentLookup = {
  fingerprint: string;
  precedent?: ImplementationPrecedent;
  similar: ImplementationPrecedent[];
};

export class ImplementationPrecedentService {
  private repo: ImplementationPrecedentRepository;

  constructor(db: Database) {
    this.repo = new ImplementationPrecedentRepository(db);
  }

  fingerprint(change: ChangeIntent): string {
    const stableFiles = [...change.filesAffected].sort().join("|");
    const seed = `${change.intent}::${change.stack}::${stableFiles}`;
    return createHash("sha256").update(seed).digest("hex");
  }

  register(
    sourceProject: string,
    change: ChangeIntent,
    rationale?: string,
    workspaceId?: string
  ): ImplementationPrecedent {
    const fp = this.fingerprint(change);
    return this.repo.upsert({
      workspaceId: workspaceId ?? null,
      sourceProject,
      repoId: change.repoId ?? null,
      projectLabel: change.projectLabel ?? null,
      agentId: change.agentId ?? null,
      fingerprint: fp,
      intent: change.intent,
      stack: change.stack,
      filesAffected: JSON.stringify(change.filesAffected),
      rationale: rationale ?? change.rationale ?? null,
      outcome: change.outcome ?? "success",
      resultNotes: change.resultNotes ?? null,
      patchReference: change.patchReference ?? null,
      variantSummary: change.variantSummary ?? null,
    });
  }

  resolve(change: ChangeIntent): PrecedentLookup {
    const fingerprint = this.fingerprint(change);
    const exact = this.repo.findByFingerprint(fingerprint);
    return {
      fingerprint,
      precedent: exact,
      similar: exact ? [exact] : this.findSimilarImplementations(change),
    };
  }

  findByWorkspace(workspaceId: string): ImplementationPrecedent[] {
    return this.repo.findByWorkspace(workspaceId);
  }

  findSimilarImplementations(change: ChangeIntent, limit = 5): ImplementationPrecedent[] {
    const pool = change.repoId ? this.repo.findByRepo(change.repoId, 100) : this.repo.findByWorkspace(change.workspaceId ?? "");
    return pool
      .map((precedent) => ({
        precedent,
        score: this.scoreConsistencyAgainstPrecedents(change, precedent),
      }))
      .filter((entry) => entry.score > 0.25)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => entry.precedent);
  }

  buildPrecedentPacket(change: ChangeIntent): string[] {
    return this.findSimilarImplementations(change).map((precedent) => {
      const files = JSON.parse(precedent.filesAffected || "[]") as string[];
      return `${precedent.sourceProject}: ${precedent.intent} [${files.join(", ")}] -> ${precedent.outcome}`;
    });
  }

  scoreConsistencyAgainstPrecedents(change: ChangeIntent, precedent: ImplementationPrecedent): number {
    let score = 0;
    if (precedent.stack === change.stack) {
      score += 0.4;
    }
    if (precedent.intent.toLowerCase() === change.intent.toLowerCase()) {
      score += 0.4;
    }
    const precedentFiles = new Set<string>(JSON.parse(precedent.filesAffected || "[]") as string[]);
    const overlap = change.filesAffected.filter((file) => precedentFiles.has(file)).length;
    if (precedentFiles.size > 0) {
      score += Math.min(0.2, overlap / precedentFiles.size);
    }
    return Math.min(1, score);
  }
}
