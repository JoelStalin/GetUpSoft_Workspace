/**
 * WorkerPoolService — main-thread coordinator.
 *
 * Spawns one Worker thread per registered agent type. Runs a dispatch loop
 * (setInterval) that: claim job → send to worker → on reply write result to DB.
 * Worker threads never touch SQLite; all reads/writes happen here.
 */
import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { randomUUID } from "node:crypto";
import type { Database } from "../storage/Database.ts";
import { JobQueueService } from "./JobQueueService.ts";
import { WorkerRegistryRepository } from "../storage/repositories/JobRepository.ts";
import type { Job } from "../storage/entities.ts";
import type { WorkerResult, WorkerError } from "../workers/agentWorker.ts";
import { ResearchBibliographyService } from "./ResearchBibliographyService.ts";
import { ModelRoutingService } from "./ModelRoutingService.ts";
import { WorkerAuditService } from "./WorkerAuditService.ts";
import { ContextIndexService } from "./ContextIndexService.ts";
import { WorkerComplianceService } from "./WorkerComplianceService.ts";
import { ProjectTimelineService } from "./ProjectTimelineService.ts";
import { WorkerLearningService, type JobComplexity } from "./WorkerLearningService.ts";
import { MemoryAgentService } from "./MemoryAgentService.ts";
import { ProjectMemoryService } from "./ProjectMemoryService.ts";
import { AgentRosterService } from "./AgentRosterService.ts";
import { MemoryPointerResolverService } from "./MemoryPointerResolverService.ts";
import { ArtifactStoreService } from "./ArtifactStoreService.ts";
import { ContextCacheService } from "./ContextCacheService.ts";
import { TermRegistryService } from "./TermRegistryService.ts";
import { SemanticCacheService } from "./SemanticCacheService.ts";
import { PointerEnvelopeService } from "./PointerEnvelopeService.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function sanitizeWorkerExecArgv(execArgv: string[]): string[] {
  const sanitized: string[] = [];

  for (let i = 0; i < execArgv.length; i++) {
    const arg = execArgv[i];
    if (arg === "--input-type") {
      i += 1;
      continue;
    }
    if (arg.startsWith("--input-type=")) {
      continue;
    }
    sanitized.push(arg);
  }

  return sanitized;
}

export type WorkerPoolOptions = {
  /** How often (ms) each worker polls its queue. Default 500. */
  pollIntervalMs?: number;
  /** Path to compiled worker script. Defaults to sibling workers/agentWorker.js */
  workerScriptPath?: string;
};

export type WorkerExecutionPlan = {
  complexity: JobComplexity;
  mode: "local" | "learned" | "ai-assisted";
  selectedModel: {
    provider: string;
    model: string;
    rationale: string;
    confidence: number;
  } | null;
  learnedSolution: Record<string, unknown> | null;
  projectTimeline: string[];
  memoryFacts: string[];
};

export type PreparedDispatchContext = {
  taskPointerUri: string;
  memoryPointers: string[];
  artifactPointers: string[];
  termCodes: string[];
  cacheKeys: string[];
  pointerEnvelopeId: string;
  compactContext: string;
};

type LiveWorker = {
  workerId: string;
  agentType: string;
  worker: Worker;
  busy: boolean;
  registryId: string;
  currentJob?: Job;
};

type CachedPointerSet = {
  taskPointerUri?: string;
  memoryPointers?: string[];
  artifactPointers?: string[];
  envelopeId?: string;
};

function uniqueValues(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function parsePointerSet(pointerSetJson?: string | null): CachedPointerSet {
  if (!pointerSetJson) return {};
  try {
    const parsed = JSON.parse(pointerSetJson) as CachedPointerSet;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export class WorkerPoolService {
  private workers = new Map<string, LiveWorker[]>(); // agentType → workers
  private timers: ReturnType<typeof setInterval>[] = [];
  private queueSvc: JobQueueService;
  private registry: WorkerRegistryRepository;
  private researchService: ResearchBibliographyService;
  private routingService: ModelRoutingService;
  private auditService: WorkerAuditService;
  private contextIndexService: ContextIndexService;
  private complianceService: WorkerComplianceService;
  private timelineService: ProjectTimelineService;
  private learningService: WorkerLearningService;
  private memoryAgentService: MemoryAgentService;
  private projectMemoryService: ProjectMemoryService;
  private rosterService: AgentRosterService;
  private pointerResolver: MemoryPointerResolverService;
  private artifactStoreService: ArtifactStoreService;
  private contextCacheService: ContextCacheService;
  private termRegistryService: TermRegistryService;
  private semanticCacheService: SemanticCacheService;
  private pointerEnvelopeService: PointerEnvelopeService;
  private pollIntervalMs: number;
  private workerScriptPath: string;

  constructor(db: Database, options: WorkerPoolOptions = {}) {
    this.queueSvc = new JobQueueService(db);
    this.registry = new WorkerRegistryRepository(db);
    this.researchService = new ResearchBibliographyService(db);
    this.routingService = new ModelRoutingService(db);
    this.auditService = new WorkerAuditService(db);
    this.contextIndexService = new ContextIndexService(db);
    this.complianceService = new WorkerComplianceService(db);
    this.timelineService = new ProjectTimelineService(db);
    this.learningService = new WorkerLearningService(db);
    this.memoryAgentService = new MemoryAgentService(db);
    this.projectMemoryService = new ProjectMemoryService(db);
    this.rosterService = new AgentRosterService(db);
    this.pointerResolver = new MemoryPointerResolverService(db);
    this.artifactStoreService = new ArtifactStoreService(db);
    this.contextCacheService = new ContextCacheService(db);
    this.termRegistryService = new TermRegistryService(db);
    this.semanticCacheService = new SemanticCacheService(db);
    this.pointerEnvelopeService = new PointerEnvelopeService(db);
    this.pollIntervalMs = options.pollIntervalMs ?? 500;
    this.workerScriptPath =
      options.workerScriptPath ??
      join(__dirname, "workers/agentWorker.js"); // compiled output path
  }

  /** Start N worker threads for a given agentType and begin polling. */
  startPool(agentType: string, concurrency = 1): void {
    const pool: LiveWorker[] = [];

    for (let i = 0; i < concurrency; i++) {
      const workerId = `${agentType}-${randomUUID().slice(0, 8)}`;
      const registryEntry = this.registry.register(agentType);

      const worker = new Worker(this.workerScriptPath, {
        workerData: { agentType, workerId },
        execArgv: sanitizeWorkerExecArgv(process.execArgv),
      });

      const live: LiveWorker = {
        workerId,
        agentType,
        worker,
        busy: false,
        registryId: registryEntry.id,
        currentJob: undefined,
      };

      worker.on("message", (msg: WorkerResult | WorkerError) => {
        const job = live.currentJob;
        live.busy = false;
        live.currentJob = undefined;
        this.registry.heartbeat(live.registryId, "idle", null);
        this.registry.incrementProcessed(live.registryId);

        if (msg.ok) {
          this.queueSvc.complete(msg.jobId, msg.result, msg.workerId);
          if (job) this.timelineService.recordJobCompleted(job, String(msg.result.summary ?? ""));
          if (job) this.applyResultSideEffects(job, msg.result);
          if (job) this.auditService.handleJobCompletion(job, msg.result);
          if (job) this.complianceService.handleReviewCompletion(job, msg.result);
          if (job) this.memoryAgentService.handleCompletion(job, msg.result);
        } else {
          this.queueSvc.fail(msg.jobId, msg.error, msg.workerId);
          if (job) this.timelineService.recordJobFailed(job, msg.error);
          if (job) this.auditService.recordFailure(job, msg.workerId, msg.error);
        }
      });

      worker.on("error", (err) => {
        const job = live.currentJob;
        live.busy = false;
        live.currentJob = undefined;
        this.registry.heartbeat(live.registryId, "idle", null);
        // Worker crashed mid-job — we don't know which job, so just log.
        console.error(`[WorkerPool] worker ${workerId} error:`, err.message);
        if (job) {
          this.queueSvc.fail(job.id, `Worker thread error: ${err.message}`, live.workerId);
          this.timelineService.recordJobFailed(job, `Worker thread error: ${err.message}`);
          this.auditService.recordFailure(job, live.workerId, `Worker thread error: ${err.message}`);
        }
      });

      pool.push(live);
    }

    this.workers.set(agentType, pool);

    // Dispatch loop: find idle worker → claim job → send to worker
    const timer = setInterval(() => {
      this.dispatch(agentType);
    }, this.pollIntervalMs);

    this.timers.push(timer);
  }

  private dispatch(agentType: string): void {
    const pool = this.workers.get(agentType);
    if (!pool) return;

    const idleWorker = pool.find((w) => !w.busy);
    if (!idleWorker) return; // all busy

    const job = this.queueSvc.claimNext(agentType, idleWorker.workerId);
    if (!job) return; // queue empty

    idleWorker.busy = true;
    idleWorker.currentJob = job;
    this.registry.heartbeat(idleWorker.registryId, "busy", job.id);
    const plan = this.planExecution(job);
    const dispatchContext = this.prepareDispatchContext(job, plan);
    this.timelineService.recordJobStarted(job);

    idleWorker.worker.postMessage({
      jobId: job.id,
      agentType: job.agentType,
      jobType: job.jobType,
      payload: JSON.parse(job.payloadJson),
      workerId: idleWorker.workerId,
      selectedModel: plan.selectedModel,
      learnedSolution: plan.learnedSolution,
      executionMode: plan.mode,
      projectContext: {
        workspaceId: job.workspaceId,
        timeline: plan.projectTimeline,
        memoryFacts: plan.memoryFacts,
        taskPointer: dispatchContext.taskPointerUri,
        memoryPointers: dispatchContext.memoryPointers,
        artifactPointers: dispatchContext.artifactPointers,
        termCodes: dispatchContext.termCodes,
        cacheKeys: dispatchContext.cacheKeys,
        pointerEnvelopeId: dispatchContext.pointerEnvelopeId,
      },
    });
    this.pointerEnvelopeService.markConsumed(dispatchContext.pointerEnvelopeId, "dispatched");
  }

  /** Stop all workers and clear timers. */
  stop(): void {
    for (const timer of this.timers) clearInterval(timer);
    this.timers = [];

    for (const pool of this.workers.values()) {
      for (const live of pool) {
        this.registry.stop(live.registryId);
        live.worker.terminate();
      }
    }
    this.workers.clear();
  }

  activeAgentTypes(): string[] {
    return [...this.workers.keys()];
  }

  workerCount(agentType: string): number {
    return this.workers.get(agentType)?.length ?? 0;
  }

  planExecution(job: Job): WorkerExecutionPlan {
    const learnedPattern = this.learningService.reusableFor(job);
    const complexity = this.learningService.classify(job);
    const agentConfig = this.rosterService
      .rosterWithConfig(job.workspaceId)
      .find((entry) => entry.agent.name === job.agentType)?.config;
    const localFirst = agentConfig?.localFirst ?? true;

    let mode: WorkerExecutionPlan["mode"] = "local";
    let selectedModel: WorkerExecutionPlan["selectedModel"] = null;
    let learnedSolution: Record<string, unknown> | null = null;

    if (learnedPattern) {
      mode = "learned";
      learnedSolution = JSON.parse(learnedPattern.solutionJson) as Record<string, unknown>;
    } else if (!localFirst || complexity === "high") {
      mode = "ai-assisted";
      selectedModel =
        this.routingService.recommendForAgent(job.workspaceId, {
          agentType: job.agentType,
          jobType: job.jobType,
        }) ?? null;
      if (!selectedModel) {
        mode = "local";
      }
    }

    return {
      complexity,
      mode,
      selectedModel,
      learnedSolution,
      projectTimeline: this.timelineService.recentSummary(job.workspaceId, 8),
      memoryFacts: this.projectMemoryService.summarize(job.workspaceId, 8),
    };
  }

  prepareDispatchContext(job: Job, plan = this.planExecution(job)): PreparedDispatchContext {
    const payload = JSON.parse(job.payloadJson) as Record<string, unknown>;
    const cacheKey = this.contextCacheService.cacheKeyForJob(job);
    const exactCache = this.contextCacheService.lookup(job.workspaceId, cacheKey);
    const cachedPointerSet = parsePointerSet(exactCache?.pointerSetJson);
    const semanticMatch = this.semanticCacheService.findSimilar(
      job.workspaceId,
      `${job.agentType} ${job.jobType} ${JSON.stringify(payload)}`,
    );
    const taskPointer = this.pointerResolver.ensureJobTaskPointer(job);
    const memoryPointers = uniqueValues([
      ...this.projectMemoryService
        .recall(job.workspaceId)
        .slice(0, 8)
        .map((memory) =>
          this.pointerResolver.ensurePointer({
            workspaceId: job.workspaceId,
            pointerType: "memory",
            targetTable: "project_memories",
            targetId: memory.id,
            preferredUri: `mem://ws/${job.workspaceId}/project-memory/${memory.id}`,
            contentForHash: memory.fact,
          }).pointerUri,
        ),
      ...(cachedPointerSet.memoryPointers ?? []),
    ]);
    const artifactPointers = uniqueValues([
      ...(cachedPointerSet.artifactPointers ?? []),
      ...(semanticMatch ? [semanticMatch.resultPointerUri] : []),
    ]);
    const termCodes = this.termRegistryService
      .registerTerms(job.workspaceId, [job.agentType, job.jobType, ...Object.keys(payload)])
      .map((term) => term.termCode);
    const cacheKeys = uniqueValues([
      cacheKey,
      ...(semanticMatch ? [`semantic://${semanticMatch.id}`] : []),
    ]);
    const envelope = this.pointerEnvelopeService.create({
      workspaceId: job.workspaceId,
      senderAgent: "orchestrator",
      receiverAgent: job.agentType,
      taskPointerUri: taskPointer.pointerUri,
      memoryPointers,
      artifactPointers,
      termCodes,
      cacheKeys,
      missionId: `mission-${job.id}`,
      traceId: job.id,
    });
    const compactContext = JSON.stringify({
      timeline: plan.projectTimeline,
      memoryFacts: plan.memoryFacts,
      taskPointer: taskPointer.pointerUri,
      reusedContext: exactCache ? exactCache.compactContext : null,
      similarResultPointer: semanticMatch?.resultPointerUri ?? null,
      pointerEnvelopeId: envelope.id,
    });
    this.contextCacheService.warmForJob(
      job,
      compactContext,
      {
        taskPointerUri: taskPointer.pointerUri,
        memoryPointers,
        artifactPointers,
        envelopeId: envelope.id,
      },
      (exactCache?.tokenCostSaved ?? 0) + compactContext.length,
    );

    return {
      taskPointerUri: taskPointer.pointerUri,
      memoryPointers,
      artifactPointers,
      termCodes,
      cacheKeys,
      pointerEnvelopeId: envelope.id,
      compactContext,
    };
  }

  private applyResultSideEffects(job: Job, result: Record<string, unknown>): void {
    const resultArtifact = this.artifactStoreService.storeJobResult(job, result);
    const resultPointer = this.pointerResolver.ensurePointer({
      workspaceId: job.workspaceId,
      pointerType: "result",
      targetTable: "artifact_store",
      targetId: resultArtifact.id,
      preferredUri: resultArtifact.artifactUri,
      contentForHash: result,
    });
    this.semanticCacheService.remember(
      job.workspaceId,
      `${job.agentType} ${job.jobType} ${JSON.stringify(JSON.parse(job.payloadJson))}`,
      resultPointer.pointerUri,
      job.agentType,
    );
    this.termRegistryService.registerTerms(job.workspaceId, [
      job.agentType,
      job.jobType,
      ...Object.keys(result),
    ]);
    this.contextCacheService.warmForJob(
      job,
      JSON.stringify({
        summary: String(result.summary ?? ""),
        resultPointer: resultPointer.pointerUri,
      }),
      {
        taskPointerUri: this.pointerResolver.ensureJobTaskPointer(job).pointerUri,
        memoryPointers: [],
        artifactPointers: [resultPointer.pointerUri],
      },
      JSON.stringify(result).length,
    );

    if (job.agentType === "context-storage-worker") {
      this.contextIndexService.syncWorkspace(job.workspaceId);
    }

    if (job.agentType === "web-researcher") {
      const findings = Array.isArray(result.findings) ? result.findings : [];
      for (const finding of findings) {
        if (typeof finding !== "object" || finding === null) continue;
        const title = typeof finding.title === "string" ? finding.title : undefined;
        const url = typeof finding.url === "string" ? finding.url : undefined;
        if (!title || !url) continue;

        this.researchService.add({
          workspaceId: job.workspaceId,
          title,
          kind: "daily-model-research",
          url,
          notes: typeof finding.snippet === "string" ? finding.snippet : null,
          tagsJson: JSON.stringify(
            [job.agentType, typeof finding.capability === "string" ? finding.capability : "research"],
          ),
        });
      }
    }

    if (job.agentType === "web-researcher" || job.agentType === "agent-recruiter") {
      this.routingService.applyResearchResult(job.workspaceId, job.agentType, job.id, result);
    }

    const complianceJob = this.complianceService.queueReviewForJob(job, result);
    if (complianceJob && !this.activeAgentTypes().includes("worker-compliance")) {
      this.startPool("worker-compliance", 1);
    }

    const memoryJob = this.memoryAgentService.enqueueCapture(job, result);
    if (memoryJob && !this.activeAgentTypes().includes("memory-agent")) {
      this.startPool("memory-agent", 1);
    }
  }
}
