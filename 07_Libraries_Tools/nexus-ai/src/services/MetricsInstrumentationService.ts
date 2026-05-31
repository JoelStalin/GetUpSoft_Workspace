import type { Database } from "../storage/Database.ts";
import { MetricsRepository } from "../storage/repositories/MetricsRepository.ts";
import type { MetricsSnapshot, TokenMetric } from "../storage/entities.ts";

export type TokenMeasurement = {
  rawContextChars?: number;
  rawContextTokens: number;
  compressedContextChars?: number;
  compactedTokens: number;
  conversationId?: string;
  strategy?: string;
  cacheReusePercent?: number;
  reusedContextBlocks?: number;
  summarizedContextBlocks?: number;
  offloadedPayloadCount?: number;
  toolResultCompactions?: number;
  memoryExtractions?: number;
  similarImplementationHits?: number;
  precedentReusePercent?: number;
  duplicateReinventionAvoidedCount?: number;
  crossProjectConsistencyMatches?: number;
};

export class MetricsInstrumentationService {
  private repo: MetricsRepository;

  constructor(db: Database) {
    this.repo = new MetricsRepository(db);
  }

  record(workspaceId: string, measurement: TokenMeasurement): TokenMetric {
    const reductionPercent =
      measurement.rawContextTokens > 0
        ? Math.max(
            0,
            Math.min(
              100,
              (1 - measurement.compactedTokens / measurement.rawContextTokens) * 100
            )
          )
        : 0;

    return this.repo.recordTokenMetric({
      workspaceId,
      conversationId: measurement.conversationId ?? null,
      rawContextChars: measurement.rawContextChars ?? measurement.rawContextTokens * 4,
      rawContextTokens: measurement.rawContextTokens,
      compressedContextChars: measurement.compressedContextChars ?? measurement.compactedTokens * 4,
      compactedTokens: measurement.compactedTokens,
      reductionPercent,
      cacheReusePercent: measurement.cacheReusePercent ?? 0,
      reusedContextBlocks: measurement.reusedContextBlocks ?? 0,
      summarizedContextBlocks: measurement.summarizedContextBlocks ?? 0,
      offloadedPayloadCount: measurement.offloadedPayloadCount ?? 0,
      toolResultCompactions: measurement.toolResultCompactions ?? 0,
      memoryExtractions: measurement.memoryExtractions ?? 0,
      similarImplementationHits: measurement.similarImplementationHits ?? 0,
      precedentReusePercent: measurement.precedentReusePercent ?? 0,
      duplicateReinventionAvoidedCount: measurement.duplicateReinventionAvoidedCount ?? 0,
      crossProjectConsistencyMatches: measurement.crossProjectConsistencyMatches ?? 0,
      compactionStrategy: measurement.strategy ?? "microcompact",
      measuredAt: new Date().toISOString(),
    });
  }

  snapshot(workspaceId: string, tokensBaseline: number, tokensOptimized: number): MetricsSnapshot {
    return this.repo.recordSnapshot(workspaceId, tokensBaseline, tokensOptimized);
  }

  latestSnapshot(workspaceId: string): MetricsSnapshot | undefined {
    return this.repo.latestSnapshot(workspaceId);
  }

  averageSavings30d(workspaceId: string): number {
    return this.repo.averageSavings(workspaceId, 30);
  }
}
