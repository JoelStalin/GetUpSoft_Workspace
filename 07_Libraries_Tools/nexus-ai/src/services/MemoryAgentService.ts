import type { Database } from "../storage/Database.ts";
import type { Job } from "../storage/entities.ts";
import { JobQueueService } from "./JobQueueService.ts";
import { ProjectMemoryService } from "./ProjectMemoryService.ts";
import { WorkerLearningService } from "./WorkerLearningService.ts";
import { MemoryPointerResolverService } from "./MemoryPointerResolverService.ts";
import { TermRegistryService } from "./TermRegistryService.ts";

const IGNORED_MEMORY_AGENTS = new Set(["memory-agent", "worker-compliance"]);

export class MemoryAgentService {
  private queueService: JobQueueService;
  private projectMemoryService: ProjectMemoryService;
  private learningService: WorkerLearningService;
  private pointerResolver: MemoryPointerResolverService;
  private termRegistryService: TermRegistryService;

  constructor(db: Database) {
    this.queueService = new JobQueueService(db);
    this.projectMemoryService = new ProjectMemoryService(db);
    this.learningService = new WorkerLearningService(db);
    this.pointerResolver = new MemoryPointerResolverService(db);
    this.termRegistryService = new TermRegistryService(db);
  }

  enqueueCapture(job: Job, result: Record<string, unknown>): Job | undefined {
    if (IGNORED_MEMORY_AGENTS.has(job.agentType)) return undefined;

    return this.queueService.enqueue({
      workspaceId: job.workspaceId,
      agentType: "memory-agent",
      jobType: "capture_worker_memory",
      priority: 6,
      maxRetries: 2,
      payload: {
        sourceJobId: job.id,
        sourceAgentType: job.agentType,
        sourceJobType: job.jobType,
        originalPayload: JSON.parse(job.payloadJson),
        result,
      },
    });
  }

  handleCompletion(job: Job, result: Record<string, unknown>): void {
    if (job.agentType !== "memory-agent") return;

    const payload = JSON.parse(job.payloadJson) as {
      sourceJobId?: string;
      sourceAgentType?: string;
      sourceJobType?: string;
      originalPayload?: object;
    };
    if (!payload.sourceAgentType || !payload.sourceJobType || !payload.sourceJobId) return;

    const facts = Array.isArray(result.facts) ? result.facts.map((item) => String(item)) : [];
    for (const fact of facts) {
      const memory = this.projectMemoryService.learn(job.workspaceId, "worker-memory", fact, 0.9);
      this.pointerResolver.ensurePointer({
        workspaceId: job.workspaceId,
        pointerType: "memory",
        targetTable: "project_memories",
        targetId: memory.id,
        preferredUri: `mem://ws/${job.workspaceId}/project-memory/${memory.id}`,
        contentForHash: fact,
      });
      this.termRegistryService.registerTerm(job.workspaceId, fact, {
        language: "neutral",
        description: `Captured worker memory from ${payload.sourceAgentType}.`,
      });
    }

    const learnedSolution =
      result.learnedSolution && typeof result.learnedSolution === "object"
        ? (result.learnedSolution as Record<string, unknown>)
        : undefined;
    if (learnedSolution) {
      const sourceJob: Job = {
        ...job,
        id: payload.sourceJobId,
        agentType: payload.sourceAgentType,
        jobType: payload.sourceJobType,
        payloadJson: JSON.stringify(
          (result.signaturePayload as object | undefined) ?? payload.originalPayload ?? {},
        ),
      };
      this.learningService.learn(sourceJob, learnedSolution);
    }
  }
}
