import type { Database } from "../storage/Database.ts";
import type { TermRegistryEntry } from "../storage/entities.ts";
import { TermRegistryRepository } from "../storage/repositories/PointerMemoryRepository.ts";
import { hexEncode, normalizeText, termCodeFor } from "../shared/pointerUtils.ts";

export class TermRegistryService {
  private repo: TermRegistryRepository;

  constructor(db: Database) {
    this.repo = new TermRegistryRepository(db);
  }

  registerTerm(
    workspaceId: string,
    term: string,
    options: {
      language?: string;
      aliases?: string[];
      description?: string | null;
      semanticGroupId?: string | null;
    } = {},
  ): TermRegistryEntry {
    const normalized = normalizeText(term);
    const termCode = termCodeFor(term);
    return this.repo.upsert({
      workspaceId,
      termCode,
      canonicalTerm: term.trim(),
      normalizedTerm: normalized,
      language: options.language ?? "neutral",
      hexRepresentation: hexEncode(term.trim()),
      semanticGroupId: options.semanticGroupId ?? termCode,
      aliases: options.aliases ?? [],
      description: options.description ?? null,
    });
  }

  registerTerms(workspaceId: string, values: string[]): TermRegistryEntry[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))].map((value) =>
      this.registerTerm(workspaceId, value),
    );
  }

  findByCode(workspaceId: string, termCode: string): TermRegistryEntry | undefined {
    return this.repo.findByCode(workspaceId, termCode);
  }

  listByWorkspace(workspaceId: string): TermRegistryEntry[] {
    return this.repo.listByWorkspace(workspaceId);
  }
}
