import type { Database } from "../storage/Database.ts";
import type { ModelRecommendation } from "../storage/entities.ts";
import {
  ModelRecommendationRepository,
  type NewModelRecommendation,
} from "../storage/repositories/ModelRecommendationRepository.ts";

export type RoutingLookup = {
  agentType?: string;
  jobType?: string;
  capabilities?: string[];
};

export type RoutingDecision = {
  provider: string;
  model: string;
  rationale: string;
  confidence: number;
};

type ResearchAssignment = {
  agentType?: string;
  capability?: string;
  jobType?: string;
  provider: string;
  model: string;
  rationale: string;
  confidence?: number;
  sources?: Array<{ title?: string; url?: string }>;
};

const DEFAULT_RECOMMENDATIONS: Array<
  Omit<NewModelRecommendation, "workspaceId" | "sourceJobId" | "observedAt" | "expiresAt">
> = [
  {
    agentType: "code-reviewer",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Strong fit for code review, refactors, and implementation-heavy reasoning.",
    confidence: 0.92,
    sourceAgentType: "system-default",
  },
  {
    agentType: "architect-advisor",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Reliable for long-form technical reasoning and architecture trade-offs.",
    confidence: 0.9,
    sourceAgentType: "system-default",
  },
  {
    capability: "coding",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Default coding route for implementation, refactoring, tests, and DevOps YAML.",
    confidence: 0.9,
    sourceAgentType: "system-default",
  },
  {
    capability: "graphic_design",
    provider: "Google",
    model: "Gemini 2.5 Pro",
    rationale: "Preferred multimodal route for design-heavy and visual tasks.",
    confidence: 0.88,
    sourceAgentType: "system-default",
  },
  {
    capability: "financial_reporting",
    provider: "OpenAI",
    model: "GPT-4.1",
    rationale: "Good administrative and reporting default with structured text output.",
    confidence: 0.87,
    sourceAgentType: "system-default",
  },
  {
    capability: "administrative_reporting",
    provider: "OpenAI",
    model: "GPT-4.1",
    rationale: "Default route for summaries, reporting, and policy-heavy administrative work.",
    confidence: 0.86,
    sourceAgentType: "system-default",
  },
  {
    capability: "deep_research",
    provider: "Google",
    model: "Gemini 2.5 Pro",
    rationale: "Good default for large-context research synthesis and multimodal source review.",
    confidence: 0.84,
    sourceAgentType: "system-default",
  },
  {
    capability: "workflow_automation",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Strong default for multi-step workflow logic, YAML, and orchestration reasoning.",
    confidence: 0.89,
    sourceAgentType: "system-default",
  },
  {
    capability: "api_integration",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Reliable default for integration contracts, API mapping, and implementation detail work.",
    confidence: 0.9,
    sourceAgentType: "system-default",
  },
  {
    capability: "linguistic_review",
    provider: "OpenAI",
    model: "GPT-4.1",
    rationale: "Strong editorial and text-quality route for multilingual and language-heavy tasks.",
    confidence: 0.87,
    sourceAgentType: "system-default",
  },
  {
    capability: "security_governance",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Preferred default for security reasoning with policy, code, and architecture context.",
    confidence: 0.88,
    sourceAgentType: "system-default",
  },
];

export class ModelRoutingService {
  private repo: ModelRecommendationRepository;

  constructor(db: Database) {
    this.repo = new ModelRecommendationRepository(db);
  }

  ensureDefaults(workspaceId: string): ModelRecommendation[] {
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    return DEFAULT_RECOMMENDATIONS.map((recommendation) =>
      this.repo.upsert({
        workspaceId,
        ...recommendation,
        observedAt: now,
        expiresAt,
      }),
    );
  }

  applyResearchResult(
    workspaceId: string,
    sourceAgentType: string,
    sourceJobId: string,
    result: Record<string, unknown>,
  ): ModelRecommendation[] {
    const assignments = this.extractAssignments(result);
    const expiresAt = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString();
    return assignments.map((assignment) =>
      this.repo.upsert({
        workspaceId,
        agentType: assignment.agentType ?? null,
        capability: assignment.capability ?? null,
        jobType: assignment.jobType ?? null,
        provider: assignment.provider,
        model: assignment.model,
        rationale: assignment.rationale,
        confidence: assignment.confidence ?? 0.75,
        sourceAgentType,
        sourceJobId,
        sourcesJson: JSON.stringify(assignment.sources ?? []),
        expiresAt,
      }),
    );
  }

  recommendForAgent(workspaceId: string, lookup: RoutingLookup): RoutingDecision | undefined {
    const now = Date.now();
    const active = this.repo.findByWorkspace(workspaceId).filter((recommendation) => {
      if (!recommendation.expiresAt) return true;
      return new Date(recommendation.expiresAt).getTime() >= now;
    });

    const candidates = active
      .map((recommendation) => ({
        recommendation,
        score: this.scoreRecommendation(recommendation, lookup),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const timeDiff =
          new Date(b.recommendation.observedAt).getTime() -
          new Date(a.recommendation.observedAt).getTime();
        if (timeDiff !== 0) return timeDiff;
        return b.recommendation.confidence - a.recommendation.confidence;
      });

    const winner = candidates[0]?.recommendation;
    if (!winner) return undefined;
    return {
      provider: winner.provider,
      model: winner.model,
      rationale: winner.rationale,
      confidence: winner.confidence,
    };
  }

  list(workspaceId: string): ModelRecommendation[] {
    return this.repo.findByWorkspace(workspaceId);
  }

  private scoreRecommendation(recommendation: ModelRecommendation, lookup: RoutingLookup): number {
    let score = 0;

    if (lookup.agentType && recommendation.agentType === lookup.agentType) score += 100;
    if (lookup.jobType && recommendation.jobType === lookup.jobType) score += 55;

    if (lookup.capabilities?.length && recommendation.capability) {
      if (lookup.capabilities.includes(recommendation.capability)) score += 70;
    }

    if (!recommendation.agentType && !recommendation.jobType && !recommendation.capability) score += 1;
    return score;
  }

  private extractAssignments(result: Record<string, unknown>): ResearchAssignment[] {
    const rawAssignments = Array.isArray(result.assignments)
      ? result.assignments
      : Array.isArray(result.recommendations)
        ? result.recommendations
        : [];

    return rawAssignments
      .filter((assignment): assignment is ResearchAssignment =>
        typeof assignment === "object" &&
        assignment !== null &&
        typeof (assignment as ResearchAssignment).provider === "string" &&
        typeof (assignment as ResearchAssignment).model === "string" &&
        typeof (assignment as ResearchAssignment).rationale === "string",
      );
  }
}
