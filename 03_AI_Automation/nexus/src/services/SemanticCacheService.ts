import type { Database } from "../storage/Database.ts";
import type { SemanticCacheEntry } from "../storage/entities.ts";
import { SemanticCacheRepository } from "../storage/repositories/PointerMemoryRepository.ts";
import { normalizeText, termCodeFor } from "../shared/pointerUtils.ts";
import { EmbeddingIndexService } from "./EmbeddingIndexService.ts";

export class SemanticCacheService {
  private repo: SemanticCacheRepository;
  private embeddings: EmbeddingIndexService;

  constructor(db: Database) {
    this.repo = new SemanticCacheRepository(db);
    this.embeddings = new EmbeddingIndexService(db);
  }

  remember(
    workspaceId: string,
    query: string,
    resultPointerUri: string,
    sourceKind: string,
    confidence = 0.9,
  ): SemanticCacheEntry {
    const normalizedQuery = normalizeText(query);
    const embedding = this.embeddings.upsertText(
      workspaceId,
      "semantic-cache",
      resultPointerUri,
      normalizedQuery,
      { compressionScheme: "turboquant-inspired", quantized: true },
    );

    return this.repo.create({
      workspaceId,
      semanticGroupId: termCodeFor(normalizedQuery),
      normalizedQuery,
      embeddingId: embedding.id,
      resultPointerUri,
      confidence,
      sourceKind,
      ttlSeconds: 60 * 60 * 6,
    });
  }

  findSimilar(workspaceId: string, query: string, threshold = 0.85): SemanticCacheEntry | undefined {
    const normalizedQuery = normalizeText(query);
    const candidates = this.repo.listByWorkspace(workspaceId);
    const matches = this.embeddings.searchSimilar(workspaceId, "semantic-cache", normalizedQuery, 10);
    const best = matches.find((candidate) => candidate.score >= threshold);
    if (best) {
      const entry = candidates.find((candidate) => candidate.embeddingId === best.entry.id);
      if (entry) {
        this.repo.markHit(entry.id);
        return entry;
      }
    }

    const fallback = candidates.find((candidate) =>
      lexicalSimilarity(candidate.normalizedQuery, normalizedQuery) >= 0.5,
    );
    if (!fallback) return undefined;
    this.repo.markHit(fallback.id);
    return fallback;
  }
}

function lexicalSimilarity(left: string, right: string): number {
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1;
  }

  return intersection / Math.max(leftTokens.size, rightTokens.size);
}
