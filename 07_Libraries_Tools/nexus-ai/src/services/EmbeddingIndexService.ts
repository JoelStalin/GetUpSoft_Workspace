import type { Database } from "../storage/Database.ts";
import type { EmbeddingEntry } from "../storage/entities.ts";
import { EmbeddingRepository } from "../storage/repositories/PointerMemoryRepository.ts";
import { cosineSimilarity, vectorForText } from "../shared/pointerUtils.ts";

export class EmbeddingIndexService {
  private repo: EmbeddingRepository;

  constructor(db: Database) {
    this.repo = new EmbeddingRepository(db);
  }

  upsertText(
    workspaceId: string,
    ownerType: string,
    ownerId: string,
    text: string,
    options: { model?: string; quantized?: boolean; compressionScheme?: string } = {},
  ): EmbeddingEntry {
    return this.repo.upsert({
      workspaceId,
      ownerType,
      ownerId,
      model: options.model ?? "local-hash-embed-v1",
      vector: vectorForText(text),
      quantized: options.quantized ?? false,
      compressionScheme: options.compressionScheme ?? "none",
    });
  }

  similarity(left: EmbeddingEntry, right: EmbeddingEntry): number {
    return cosineSimilarity(
      JSON.parse(left.vectorJson) as number[],
      JSON.parse(right.vectorJson) as number[],
    );
  }

  searchSimilar(
    workspaceId: string,
    ownerType: string,
    text: string,
    limit = 5,
  ): Array<{ entry: EmbeddingEntry; score: number }> {
    const queryVector = vectorForText(text);
    return this.repo
      .listByWorkspace(workspaceId, ownerType)
      .map((entry) => ({
        entry,
        score: cosineSimilarity(queryVector, JSON.parse(entry.vectorJson) as number[]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
