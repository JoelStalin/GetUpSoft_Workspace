import { randomUUID } from "node:crypto";
import type { Database } from "../Database.ts";
import type { ModelRecommendation } from "../entities.ts";

export type NewModelRecommendation = {
  workspaceId: string;
  agentType?: string | null;
  capability?: string | null;
  jobType?: string | null;
  provider: string;
  model: string;
  rationale: string;
  confidence: number;
  sourceAgentType: string;
  sourceJobId?: string | null;
  sourcesJson?: string;
  observedAt?: string;
  expiresAt?: string | null;
};

export class ModelRecommendationRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  upsert(input: NewModelRecommendation): ModelRecommendation {
    const existing = this.db.prepare(`
      SELECT * FROM model_recommendations
      WHERE workspaceId = ?
        AND COALESCE(agentType, '') = COALESCE(?, '')
        AND COALESCE(capability, '') = COALESCE(?, '')
        AND COALESCE(jobType, '') = COALESCE(?, '')
        AND provider = ?
        AND model = ?
    `).get(
      input.workspaceId,
      input.agentType ?? null,
      input.capability ?? null,
      input.jobType ?? null,
      input.provider,
      input.model,
    ) as ModelRecommendation | undefined;

    const now = new Date().toISOString();
    const observedAt = input.observedAt ?? now;

    if (existing) {
      this.db.prepare(`
        UPDATE model_recommendations
        SET rationale = ?, confidence = ?, sourceAgentType = ?, sourceJobId = ?,
            sourcesJson = ?, observedAt = ?, expiresAt = ?, updatedAt = ?
        WHERE id = ?
      `).run(
        input.rationale,
        input.confidence,
        input.sourceAgentType,
        input.sourceJobId ?? null,
        input.sourcesJson ?? "[]",
        observedAt,
        input.expiresAt ?? null,
        now,
        existing.id,
      );
      return this.db.prepare("SELECT * FROM model_recommendations WHERE id = ?").get(existing.id) as ModelRecommendation;
    }

    const recommendation: ModelRecommendation = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      agentType: input.agentType ?? null,
      capability: input.capability ?? null,
      jobType: input.jobType ?? null,
      provider: input.provider,
      model: input.model,
      rationale: input.rationale,
      confidence: input.confidence,
      sourceAgentType: input.sourceAgentType,
      sourceJobId: input.sourceJobId ?? null,
      sourcesJson: input.sourcesJson ?? "[]",
      observedAt,
      expiresAt: input.expiresAt ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.db.prepare(`
      INSERT INTO model_recommendations (
        id, workspaceId, agentType, capability, jobType, provider, model, rationale,
        confidence, sourceAgentType, sourceJobId, sourcesJson, observedAt, expiresAt,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      recommendation.id,
      recommendation.workspaceId,
      recommendation.agentType,
      recommendation.capability,
      recommendation.jobType,
      recommendation.provider,
      recommendation.model,
      recommendation.rationale,
      recommendation.confidence,
      recommendation.sourceAgentType,
      recommendation.sourceJobId,
      recommendation.sourcesJson,
      recommendation.observedAt,
      recommendation.expiresAt,
      recommendation.createdAt,
      recommendation.updatedAt,
    );

    return recommendation;
  }

  findByWorkspace(workspaceId: string): ModelRecommendation[] {
    return this.db.prepare(`
      SELECT * FROM model_recommendations
      WHERE workspaceId = ?
      ORDER BY observedAt DESC, confidence DESC
    `).all(workspaceId) as ModelRecommendation[];
  }
}
