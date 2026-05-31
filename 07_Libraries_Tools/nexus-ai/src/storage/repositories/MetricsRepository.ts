import type { Database } from "../Database.ts";
import type { MetricsSnapshot, TokenMetric } from "../entities.ts";
import { randomUUID } from "node:crypto";

export class MetricsRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  recordSnapshot(
    workspaceId: string,
    tokensBaseline: number,
    tokensOptimized: number
  ): MetricsSnapshot {
    const savingsRatio =
      tokensBaseline > 0
        ? Math.max(0, Math.min(1, 1 - tokensOptimized / tokensBaseline))
        : 0;

    const snapshot: MetricsSnapshot = {
      id: randomUUID(),
      workspaceId,
      tokensBaseline,
      tokensOptimized,
      savingsRatio,
      createdAt: new Date().toISOString(),
    };
    this.db
      .prepare(
        "INSERT INTO metrics_snapshots (id, workspaceId, tokensBaseline, tokensOptimized, savingsRatio, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(
        snapshot.id,
        snapshot.workspaceId,
        snapshot.tokensBaseline,
        snapshot.tokensOptimized,
        snapshot.savingsRatio,
        snapshot.createdAt
      );
    return snapshot;
  }

  recordTokenMetric(input: Omit<TokenMetric, "id">): TokenMetric {
    const metric: TokenMetric = { id: randomUUID(), ...input };
    this.db
      .prepare(
        "INSERT INTO token_metrics (id, workspaceId, conversationId, rawContextChars, rawContextTokens, compressedContextChars, compactedTokens, reductionPercent, cacheReusePercent, reusedContextBlocks, summarizedContextBlocks, offloadedPayloadCount, toolResultCompactions, memoryExtractions, similarImplementationHits, precedentReusePercent, duplicateReinventionAvoidedCount, crossProjectConsistencyMatches, compactionStrategy, measuredAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        metric.id,
        metric.workspaceId,
        metric.conversationId,
        metric.rawContextChars,
        metric.rawContextTokens,
        metric.compressedContextChars,
        metric.compactedTokens,
        metric.reductionPercent,
        metric.cacheReusePercent,
        metric.reusedContextBlocks,
        metric.summarizedContextBlocks,
        metric.offloadedPayloadCount,
        metric.toolResultCompactions,
        metric.memoryExtractions,
        metric.similarImplementationHits,
        metric.precedentReusePercent,
        metric.duplicateReinventionAvoidedCount,
        metric.crossProjectConsistencyMatches,
        metric.compactionStrategy,
        metric.measuredAt
      );
    return metric;
  }

  latestSnapshot(workspaceId: string): MetricsSnapshot | undefined {
    return this.db
      .prepare(
        "SELECT * FROM metrics_snapshots WHERE workspaceId = ? ORDER BY createdAt DESC LIMIT 1"
      )
      .get(workspaceId) as MetricsSnapshot | undefined;
  }

  averageSavings(workspaceId: string, days = 30): number {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const row = this.db
      .prepare(
        "SELECT AVG(savingsRatio) as avg FROM metrics_snapshots WHERE workspaceId = ? AND createdAt >= ?"
      )
      .get(workspaceId, since) as { avg: number | null };
    return row?.avg ?? 0;
  }
}
