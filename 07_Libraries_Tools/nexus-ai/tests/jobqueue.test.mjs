import test from "node:test";
import assert from "node:assert/strict";

import { openDatabase } from "../src/storage/Database.ts";
import { WorkspaceResolverService } from "../src/services/WorkspaceResolverService.ts";
import { JobQueueService } from "../src/services/JobQueueService.ts";
import {
  JobRepository,
  JobScheduleRepository,
  WorkerRegistryRepository,
} from "../src/storage/repositories/JobRepository.ts";
import { AgentRosterService, SOFTWARE_DEV_DEVOPS_ROSTER } from "../src/services/AgentRosterService.ts";
import { ModelRoutingService } from "../src/services/ModelRoutingService.ts";
import { DailyResearchSchedulerService } from "../src/services/DailyResearchSchedulerService.ts";
import { WorkerAuditService } from "../src/services/WorkerAuditService.ts";
import { ContextIndexService } from "../src/services/ContextIndexService.ts";
import { WorkerComplianceService } from "../src/services/WorkerComplianceService.ts";
import { WorkerLearningService } from "../src/services/WorkerLearningService.ts";
import { ProjectTimelineService } from "../src/services/ProjectTimelineService.ts";
import {
  WorkerPoolService,
  sanitizeWorkerExecArgv,
} from "../src/services/WorkerPoolService.ts";
import { MemoryPointerResolverService } from "../src/services/MemoryPointerResolverService.ts";
import { ArtifactStoreService } from "../src/services/ArtifactStoreService.ts";
import { ContextCacheService } from "../src/services/ContextCacheService.ts";
import { TermRegistryService } from "../src/services/TermRegistryService.ts";
import { EmbeddingIndexService } from "../src/services/EmbeddingIndexService.ts";
import { SemanticCacheService } from "../src/services/SemanticCacheService.ts";
import { PointerEnvelopeService } from "../src/services/PointerEnvelopeService.ts";
import { ProjectMemoryService } from "../src/services/ProjectMemoryService.ts";
import {
  detectPromptLanguage,
  correctPromptText,
  buildWorkerTaskPrompts,
} from "../src/workers/agentWorker.ts";

function makeDb() {
  return openDatabase(":memory:");
}

function makeWs(db) {
  return new WorkspaceResolverService(db).resolve("/test/project", "MyProject");
}

// ─── JobQueueService ──────────────────────────────────────────────────────────

test("JobQueueService: enqueue creates a pending job", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new JobQueueService(db);

  const job = svc.enqueue({
    workspaceId: ws.id,
    agentType: "code-reviewer",
    jobType: "pr_review",
    payload: { files: ["src/main.ts"], diff: "+" },
    priority: 7,
  });

  assert.equal(job.status, "pending");
  assert.equal(job.agentType, "code-reviewer");
  assert.equal(job.jobType, "pr_review");
  assert.equal(job.priority, 7);
  assert.equal(job.retryCount, 0);
});

test("JobQueueService: enqueue records an enqueued event", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new JobQueueService(db);

  const job = svc.enqueue({
    workspaceId: ws.id,
    agentType: "code-reviewer",
    jobType: "pr_review",
    payload: {},
  });

  const events = svc.eventsForJob(job.id);
  assert.ok(events.length >= 1);
  assert.equal(events[0].event, "enqueued");
});

test("JobQueueService: claimNext atomically claims and starts one job", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new JobQueueService(db);

  svc.enqueue({ workspaceId: ws.id, agentType: "bug-analyzer", jobType: "analysis", payload: {} });
  const claimed = svc.claimNext("bug-analyzer", "worker-1");

  assert.ok(claimed, "should claim a job");
  assert.equal(claimed.status, "processing");
  assert.equal(claimed.agentType, "bug-analyzer");
});

test("JobQueueService: claimNext returns undefined when queue is empty", () => {
  const db = makeDb();
  const svc = new JobQueueService(db);
  const result = svc.claimNext("code-reviewer", "worker-1");
  assert.equal(result, undefined);
});

test("JobQueueService: two claimNext calls return different jobs (no double-claim)", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new JobQueueService(db);

  svc.enqueue({ workspaceId: ws.id, agentType: "test-generator", jobType: "gen", payload: { a: 1 } });
  svc.enqueue({ workspaceId: ws.id, agentType: "test-generator", jobType: "gen", payload: { b: 2 } });

  const j1 = svc.claimNext("test-generator", "worker-1");
  const j2 = svc.claimNext("test-generator", "worker-2");

  assert.ok(j1, "first claim should succeed");
  assert.ok(j2, "second claim should succeed");
  assert.notEqual(j1.id, j2.id, "each worker must get a different job");
});

test("JobQueueService: complete marks job done and stores result", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new JobQueueService(db);

  const job = svc.enqueue({ workspaceId: ws.id, agentType: "doc-writer", jobType: "readme", payload: {} });
  svc.claimNext("doc-writer", "w1");
  const done = svc.complete(job.id, { markdown: "# Hello" }, "w1");

  assert.equal(done.status, "completed");
  assert.ok(done.completedAt);
  const result = JSON.parse(done.resultJson ?? "{}");
  assert.equal(result.markdown, "# Hello");
});

test("JobQueueService: fail retries with exponential backoff", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new JobQueueService(db);

  const job = svc.enqueue({
    workspaceId: ws.id,
    agentType: "security-scanner",
    jobType: "scan",
    payload: {},
    maxRetries: 3,
  });
  svc.claimNext("security-scanner", "w1");
  const retried = svc.fail(job.id, "timeout", "w1");

  assert.equal(retried.status, "pending");
  assert.equal(retried.retryCount, 1);
  assert.ok(retried.scheduledAt, "should have a future scheduledAt for backoff");
  assert.ok(new Date(retried.scheduledAt).getTime() > Date.now() - 100);
});

test("JobQueueService: fail dead-letters after maxRetries exhausted", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const repo = new JobRepository(db);
  const svc = new JobQueueService(db);

  // Insert a job that's already at maxRetries
  const job = repo.enqueue({
    workspaceId: ws.id,
    agentType: "cicd-orchestrator",
    jobType: "run_pipeline",
    payload: {},
    maxRetries: 0, // will dead-letter on first failure
  });

  // Manually mark as processing so fail() can run
  repo.setProcessing(job.id);
  const dead = svc.fail(job.id, "pipeline error", "w1");

  assert.equal(dead.status, "dead");
  assert.ok(dead.error?.includes("pipeline error"));
});

test("JobQueueService: statsForAgent aggregates correctly", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new JobQueueService(db);

  svc.enqueue({ workspaceId: ws.id, agentType: "refactor-advisor", jobType: "r", payload: {} });
  svc.enqueue({ workspaceId: ws.id, agentType: "refactor-advisor", jobType: "r", payload: {} });
  const j3 = svc.enqueue({ workspaceId: ws.id, agentType: "refactor-advisor", jobType: "r", payload: {} });
  svc.claimNext("refactor-advisor", "w1");
  svc.complete(j3.id, {}, "w1"); // j3 won't be claimed yet, but let's complete another way

  const stats = svc.statsForAgent("refactor-advisor");
  assert.equal(stats.agentType, "refactor-advisor");
  assert.ok(stats.pending + stats.processing + stats.completed >= 3);
});

test("JobQueueService: priority ordering — higher priority job claimed first", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new JobQueueService(db);

  svc.enqueue({ workspaceId: ws.id, agentType: "incident-responder", jobType: "ir", payload: {}, priority: 3 });
  svc.enqueue({ workspaceId: ws.id, agentType: "incident-responder", jobType: "ir", payload: {}, priority: 9 });
  svc.enqueue({ workspaceId: ws.id, agentType: "incident-responder", jobType: "ir", payload: {}, priority: 1 });

  const first = svc.claimNext("incident-responder", "w1");
  assert.ok(first);
  assert.equal(first.priority, 9, "highest priority should be claimed first");
});

test("JobQueueService: allQueueDepths returns active agent types", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new JobQueueService(db);

  svc.enqueue({ workspaceId: ws.id, agentType: "deploy-manager", jobType: "deploy", payload: {} });
  svc.enqueue({ workspaceId: ws.id, agentType: "monitoring-agent", jobType: "alert", payload: {} });
  svc.enqueue({ workspaceId: ws.id, agentType: "monitoring-agent", jobType: "alert", payload: {} });

  const depths = svc.allQueueDepths();
  const types = depths.map((d) => d.agentType);
  assert.ok(types.includes("deploy-manager"));
  assert.ok(types.includes("monitoring-agent"));

  const monDepth = depths.find((d) => d.agentType === "monitoring-agent");
  assert.equal(monDepth?.count, 2);
});

// ─── WorkerRegistryRepository ─────────────────────────────────────────────────

test("WorkerRegistryRepository: register, heartbeat, stop lifecycle", () => {
  const db = makeDb();
  const registry = new WorkerRegistryRepository(db);

  const entry = registry.register("architect-advisor");
  assert.equal(entry.status, "idle");
  assert.equal(entry.agentType, "architect-advisor");

  registry.heartbeat(entry.id, "busy", "job-123");
  const after = registry.byAgentType("architect-advisor");
  assert.equal(after[0].status, "busy");
  assert.equal(after[0].currentJobId, "job-123");

  registry.stop(entry.id);
  const stopped = registry.byAgentType("architect-advisor");
  assert.equal(stopped[0].status, "stopped");
});

test("WorkerRegistryRepository: incrementProcessed counts correctly", () => {
  const db = makeDb();
  const registry = new WorkerRegistryRepository(db);
  const entry = registry.register("test-generator");

  registry.incrementProcessed(entry.id);
  registry.incrementProcessed(entry.id);
  registry.incrementProcessed(entry.id);

  const all = registry.all();
  const worker = all.find((w) => w.id === entry.id);
  assert.equal(worker?.jobsProcessed, 3);
});

// ─── AgentRosterService ───────────────────────────────────────────────────────

test("AgentRosterService: ensureRoster seeds all roster agents including research recruiters", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new AgentRosterService(db);

  const agents = svc.ensureRoster(ws.id);
  assert.equal(agents.length, SOFTWARE_DEV_DEVOPS_ROSTER.length);
  assert.equal(agents.length, 38);
});

test("AgentRosterService: ensureRoster is idempotent", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new AgentRosterService(db);

  svc.ensureRoster(ws.id);
  const second = svc.ensureRoster(ws.id);
  assert.equal(second.length, 38, "second call must not duplicate agents");
});

test("AgentRosterService: all agents have valid config with required fields", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new AgentRosterService(db);

  svc.ensureRoster(ws.id);
  const roster = svc.rosterWithConfig(ws.id);

  for (const { agent, config } of roster) {
    assert.ok(agent.name, `agent should have a name`);
    assert.ok(config.role, `${agent.name} missing role`);
    assert.ok(Array.isArray(config.capabilities), `${agent.name} capabilities must be array`);
    assert.ok(config.queueName.startsWith("q."), `${agent.name} queueName must start with q.`);
    assert.ok(config.systemPromptTemplate.length > 20, `${agent.name} system prompt too short`);
    assert.ok(config.maxConcurrent >= 1, `${agent.name} maxConcurrent must be >= 1`);
    assert.ok(config.retryLimit >= 1, `${agent.name} retryLimit must be >= 1`);
  }
});

test("AgentRosterService: findByAgentType returns correct agent", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new AgentRosterService(db);
  svc.ensureRoster(ws.id);

  const agent = svc.findByAgentType(ws.id, "security-scanner");
  assert.ok(agent);
  assert.equal(agent.name, "security-scanner");
  assert.equal(agent.adapterType, "roster");
});

test("AgentRosterService: covers all dev + devops domains", () => {
  const names = SOFTWARE_DEV_DEVOPS_ROSTER.map((a) => a.name);

  // Development
  assert.ok(names.includes("code-reviewer"));
  assert.ok(names.includes("architect-advisor"));
  assert.ok(names.includes("test-generator"));
  assert.ok(names.includes("security-scanner"));
  assert.ok(names.includes("performance-analyzer"));

  // DevOps
  assert.ok(names.includes("cicd-orchestrator"));
  assert.ok(names.includes("infra-advisor"));
  assert.ok(names.includes("deploy-manager"));
  assert.ok(names.includes("monitoring-agent"));
  assert.ok(names.includes("incident-responder"));

  // Project / Knowledge
  assert.ok(names.includes("task-planner"));
  assert.ok(names.includes("compliance-checker"));
  assert.ok(names.includes("tech-debt-tracker"));
  assert.ok(names.includes("worker-auditor"));
  assert.ok(names.includes("worker-police"));
  assert.ok(names.includes("worker-judge"));
  assert.ok(names.includes("memory-agent"));
  assert.ok(names.includes("web-researcher"));
  assert.ok(names.includes("agent-recruiter"));
  assert.ok(names.includes("context-storage-worker"));
  assert.ok(names.includes("data-miner"));
  assert.ok(names.includes("translator-worker"));
  assert.ok(names.includes("token-vault-worker"));
  assert.ok(names.includes("accounts-worker"));
  assert.ok(names.includes("worker-compliance"));
  assert.ok(names.includes("workflow-automation-worker"));
  assert.ok(names.includes("integration-engineer"));
  assert.ok(names.includes("security-governor"));
  assert.ok(names.includes("linguistic-qa"));
  assert.ok(names.includes("review-orchestrator"));
  assert.ok(names.includes("capture-orchestrator"));
});

test("ModelRoutingService: defaults cover coding, reporting, and design", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new ModelRoutingService(db);

  svc.ensureDefaults(ws.id);

  const coding = svc.recommendForAgent(ws.id, { capabilities: ["coding"] });
  const reporting = svc.recommendForAgent(ws.id, { capabilities: ["financial_reporting"] });
  const design = svc.recommendForAgent(ws.id, { capabilities: ["graphic_design"] });

  assert.equal(coding?.provider, "Anthropic");
  assert.equal(reporting?.provider, "OpenAI");
  assert.equal(design?.provider, "Google");
});

test("DailyResearchSchedulerService: creates daily schedules for researcher and recruiter", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const scheduler = new DailyResearchSchedulerService(db);

  const roster = rosterSvc.ensureRoster(ws.id);
  const schedules = scheduler.ensureDailySchedules(
    ws.id,
    rosterSvc.rosterWithConfig(ws.id).map(({ agent, config }) => ({
      agentType: agent.name,
      role: config.role,
      capabilities: config.capabilities,
      config,
    })),
  );

  assert.equal(schedules.length, 4);
  const repo = new JobScheduleRepository(db);
  const all = repo.findByWorkspace(ws.id);
  assert.equal(all.length, 4);
  assert.ok(roster.some((agent) => agent.name === "worker-auditor"));
  assert.ok(roster.some((agent) => agent.name === "context-storage-worker"));
  assert.ok(roster.some((agent) => agent.name === "web-researcher"));
  assert.ok(roster.some((agent) => agent.name === "agent-recruiter"));
});

test("DailyResearchSchedulerService: due schedules enqueue daily research jobs once", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const scheduler = new DailyResearchSchedulerService(db);

  rosterSvc.ensureRoster(ws.id);
  scheduler.ensureDailySchedules(
    ws.id,
    rosterSvc.rosterWithConfig(ws.id).map(({ agent, config }) => ({
      agentType: agent.name,
      role: config.role,
      capabilities: config.capabilities,
      config,
    })),
  );

  const jobs = scheduler.enqueueDueSchedules(new Date("2099-04-18T12:00:00.000Z"));
  assert.equal(jobs.length, 4);
  assert.ok(jobs.every((job) => job.priority === 8));

  const secondRun = scheduler.enqueueDueSchedules(new Date("2099-04-18T12:05:00.000Z"));
  assert.equal(secondRun.length, 0, "should not enqueue duplicates while scheduled jobs are active");
});

test("ContextIndexService: indexes core workspace artifacts for fast lookup", () => {
  const db = makeDb();
  const ws = makeWs(db);

  db.prepare(`
    INSERT INTO conversations (
      id, workspaceId, sourceAgent, agentId, title, sourceAdapter, linkedAgentsJson, status,
      summary, recentContext, sessionMemoryId, relatedFilesJson, relatedTaskIdsJson,
      relatedDecisionIdsJson, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "conv-1",
    ws.id,
    "claude-code",
    null,
    "Conversation A",
    null,
    "[]",
    "active",
    "Discussed storage indexing",
    "Recent context",
    null,
    "[]",
    "[]",
    "[]",
    new Date().toISOString(),
    new Date().toISOString(),
  );
  db.prepare(`
    INSERT INTO tasks (
      id, workspaceId, epic, title, status, technicalWeight, createdAt, updatedAt,
      sourceConversationId, sourceMessageId, description, priority, tagsJson,
      relatedFilesJson, dependsOnJson, acceptanceCriteriaJson, completionPercent, kind
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "task-1",
    ws.id,
    "core",
    "Index context",
    "pending",
    5,
    new Date().toISOString(),
    new Date().toISOString(),
    null,
    null,
    "Create a fast local index",
    "high",
    "[]",
    "[]",
    "[]",
    "[]",
    0,
    "task",
  );

  const svc = new ContextIndexService(db);
  const entries = svc.syncWorkspace(ws.id);

  assert.ok(entries.length >= 2);
  const results = svc.search(ws.id, "storage indexing");
  assert.ok(results.some((entry) => entry.sourceType === "conversation"));
});

test("TermRegistryService: stores canonical terms with term codes and hex representation", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new TermRegistryService(db);

  const term = svc.registerTerm(ws.id, "SQL Migration", { aliases: ["db migration"] });

  assert.equal(term.termCode, "sql.migration");
  assert.equal(term.normalizedTerm, "sql migration");
  assert.ok(term.hexRepresentation);
  assert.ok(JSON.parse(term.aliasesJson).includes("db migration"));
});

test("ArtifactStoreService and MemoryPointerResolverService: store result artifact and resolve pointer", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const queueSvc = new JobQueueService(db);
  const artifactSvc = new ArtifactStoreService(db);
  const pointerSvc = new MemoryPointerResolverService(db);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "code-reviewer",
    jobType: "pr_review",
    payload: { files: ["src/a.ts"] },
  });

  const artifact = artifactSvc.storeJobResult(job, { summary: "Reviewed", findings: [] });
  const pointer = pointerSvc.ensurePointer({
    workspaceId: ws.id,
    pointerType: "result",
    targetTable: "artifact_store",
    targetId: artifact.id,
    preferredUri: artifact.artifactUri,
    contentForHash: { summary: "Reviewed", findings: [] },
  });
  const resolved = pointerSvc.resolve(pointer.pointerUri);

  assert.equal(pointer.pointerUri, `result://job/${job.id}/output`);
  assert.ok(resolved);
  assert.equal(resolved.title, `${job.agentType} ${job.jobType} result`);
});

test("ContextCacheService: warms and reuses exact cache entries for a job", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const queueSvc = new JobQueueService(db);
  const cacheSvc = new ContextCacheService(db);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "translator-worker",
    jobType: "translate_worker_tasks",
    payload: { prompt: "Normalize prompt" },
  });

  const key = cacheSvc.cacheKeyForJob(job);
  cacheSvc.warmForJob(
    job,
    JSON.stringify({ summary: "cached" }),
    { taskPointerUri: "task://mission/1/step/1", memoryPointers: [], artifactPointers: [] },
    120,
  );
  const hit = cacheSvc.lookup(ws.id, key);

  assert.ok(hit);
  assert.equal(hit.cacheKey, key);
  assert.equal(hit.tokenCostSaved, 120);
});

test("SemanticCacheService: stores similar query results backed by embeddings", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const semanticSvc = new SemanticCacheService(db);
  const artifactSvc = new ArtifactStoreService(db);
  const embeddingSvc = new EmbeddingIndexService(db);

  const artifact = artifactSvc.store(
    ws.id,
    "result",
    "SQL review result",
    JSON.stringify({ summary: "Use an index" }),
    { artifactUri: "result://job/demo/output" },
  );
  semanticSvc.remember(ws.id, "review sql migration indexes", artifact.artifactUri, "sql-worker");
  const similar = semanticSvc.findSimilar(ws.id, "sql migration review indexes");
  const embedding = embeddingSvc.upsertText(ws.id, "query", "demo", "sql migration review indexes");

  assert.ok(similar);
  assert.equal(similar.resultPointerUri, artifact.artifactUri);
  assert.equal(embedding.ownerType, "query");
});

test("PointerEnvelopeService: creates compact worker envelopes with pointers and term codes", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new PointerEnvelopeService(db);

  const envelope = svc.create({
    workspaceId: ws.id,
    senderAgent: "orchestrator",
    receiverAgent: "sql-worker",
    taskPointerUri: "task://mission/demo/step/1",
    memoryPointers: ["mem://ws/demo/project-memory/1"],
    artifactPointers: ["artifact://file/src/db/schema.sql"],
    termCodes: ["sql.migration", "sql.index"],
    cacheKeys: ["ctx://sql/review/demo"],
  });

  assert.equal(envelope.senderAgent, "orchestrator");
  assert.equal(envelope.receiverAgent, "sql-worker");
  assert.ok(JSON.parse(envelope.memoryPointersJson).includes("mem://ws/demo/project-memory/1"));
});

test("WorkerPoolService: sanitizeWorkerExecArgv removes --input-type=value flags", () => {
  const sanitized = sanitizeWorkerExecArgv([
    "--experimental-strip-types",
    "--input-type=module",
    "--trace-warnings",
  ]);

  assert.deepEqual(sanitized, ["--experimental-strip-types", "--trace-warnings"]);
});

test("WorkerPoolService: sanitizeWorkerExecArgv removes split --input-type flags", () => {
  const sanitized = sanitizeWorkerExecArgv([
    "--experimental-strip-types",
    "--input-type",
    "module",
    "--trace-warnings",
  ]);

  assert.deepEqual(sanitized, ["--experimental-strip-types", "--trace-warnings"]);
});

test("WorkerComplianceService: non-compliant output is escalated to audit", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const queueSvc = new JobQueueService(db);
  const auditSvc = new WorkerAuditService(db);
  const complianceSvc = new WorkerComplianceService(db);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "review-orchestrator",
    jobType: "release_review",
    payload: {},
  });

  const complianceJob = complianceSvc.queueReviewForJob(job, { summary: "Only summary present." });
  assert.ok(complianceJob);

  queueSvc.complete(
    complianceJob.id,
    {
      compliant: false,
      issues: ["Missing required signal: findings"],
      expectedSignals: ["summary", "findings"],
      summary: "Compliance failed.",
    },
    "worker-compliance-1",
  );
  complianceSvc.handleReviewCompletion(complianceJob, {
    compliant: false,
    issues: ["Missing required signal: findings"],
    expectedSignals: ["summary", "findings"],
    summary: "Compliance failed.",
  });

  const cases = auditSvc.listByWorkspace(ws.id);
  assert.equal(cases.length, 1);
  assert.ok(cases[0].lastError.includes("Compliance failure"));
});

test("WorkerComplianceService: data miner jobs require dataframe and memory deliverables", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const queueSvc = new JobQueueService(db);
  const complianceSvc = new WorkerComplianceService(db);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "data-miner",
    jobType: "data_mining_pipeline",
    payload: { sources: ["crm", "events"] },
  });

  const complianceJob = complianceSvc.queueReviewForJob(job, { summary: "Only summary." });
  assert.ok(complianceJob);

  const payload = JSON.parse(complianceJob.payloadJson);
  assert.deepEqual(payload.expectedSignals, [
    "summary",
    "classifications",
    "dataframePlan",
    "mlReadyDatasets",
    "memoryLinks",
  ]);
});

test("WorkerComplianceService: translator jobs require recruiter handoff artifacts", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const queueSvc = new JobQueueService(db);
  const complianceSvc = new WorkerComplianceService(db);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "translator-worker",
    jobType: "translate_worker_tasks",
    payload: { prompt: "Analiza este prompt" },
  });

  const complianceJob = complianceSvc.queueReviewForJob(job, { summary: "Only summary." });
  assert.ok(complianceJob);

  const payload = JSON.parse(complianceJob.payloadJson);
  assert.deepEqual(payload.expectedSignals, [
    "summary",
    "detectedLanguage",
    "correctedPrompt",
    "promptUnderstanding",
    "workerTaskPrompts",
    "recruiterPayload",
  ]);
});

test("WorkerComplianceService: token vault jobs require token balance governance artifacts", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const queueSvc = new JobQueueService(db);
  const complianceSvc = new WorkerComplianceService(db);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "token-vault-worker",
    jobType: "token_budget_review",
    payload: {},
  });

  const complianceJob = complianceSvc.queueReviewForJob(job, { summary: "Only summary." });
  assert.ok(complianceJob);

  const payload = JSON.parse(complianceJob.payloadJson);
  assert.deepEqual(payload.expectedSignals, [
    "summary",
    "workerBalances",
    "providerBalances",
    "wasteFindings",
    "guardrails",
  ]);
});

test("WorkerComplianceService: accounts jobs require provider connection governance artifacts", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const queueSvc = new JobQueueService(db);
  const complianceSvc = new WorkerComplianceService(db);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "accounts-worker",
    jobType: "provider_connection_governance",
    payload: {},
  });

  const complianceJob = complianceSvc.queueReviewForJob(job, { summary: "Only summary." });
  assert.ok(complianceJob);

  const payload = JSON.parse(complianceJob.payloadJson);
  assert.deepEqual(payload.expectedSignals, [
    "summary",
    "accountRegistry",
    "connectionStatuses",
    "routingPoliciesApplied",
  ]);
});

test("Translator helpers: detect language, normalize prompt, and build recruiter-ready task prompts", () => {
  const prompt =
    "agrega el traductor  que debe  primero idetificar  el lenguaje del  prompt corregir  los errores ortograficos y gramticos";
  const detectedLanguage = detectPromptLanguage(` ${prompt} `);
  const correctedPrompt = correctPromptText(prompt);
  const workerTaskPrompts = buildWorkerTaskPrompts(
    [
      { worker: "data-miner", task: "prepare ml dataset", context: "Use project memory." },
      { worker: "agent-recruiter", task: "assign workers" },
    ],
    correctedPrompt,
    `Interpretacion inicial: ${correctedPrompt}`,
    "en",
  );

  assert.equal(detectedLanguage, "es");
  assert.ok(correctedPrompt.includes("identificar"));
  assert.ok(correctedPrompt.includes("gramaticales"));
  assert.equal(workerTaskPrompts.length, 2);
  assert.equal(workerTaskPrompts[0].worker, "data-miner");
  assert.ok(workerTaskPrompts[0].prompt.includes("Objective:"));
});

test("WorkerLearningService: learned pattern is reusable for matching job payload", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const queueSvc = new JobQueueService(db);
  const learningSvc = new WorkerLearningService(db);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "integration-engineer",
    jobType: "api_mapping",
    payload: { systems: ["crm", "erp"], auth: "oauth2" },
  });

  learningSvc.learn(job, { integrationPlan: "Reuse CRM->ERP mapping", summary: "learned" }, "low");
  const reusable = learningSvc.reusableFor(job);

  assert.ok(reusable);
  assert.equal(JSON.parse(reusable.solutionJson).integrationPlan, "Reuse CRM->ERP mapping");
});

test("ProjectTimelineService: records project events and summarizes recent timeline", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const queueSvc = new JobQueueService(db);
  const timelineSvc = new ProjectTimelineService(db);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "workflow-automation-worker",
    jobType: "workflow_design",
    payload: { platform: "n8n" },
  });

  timelineSvc.recordJobStarted(job);
  timelineSvc.recordJobCompleted(job, "Workflow designed.");
  const recent = timelineSvc.recentSummary(ws.id, 5);

  assert.equal(recent.length, 2);
  assert.ok(recent.some((entry) => entry.includes("job_completed")));
});

test("WorkerPoolService: uses local mode for simple tasks and learned mode when memory exists", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);
  const learningSvc = new WorkerLearningService(db);
  const pool = new WorkerPoolService(db, { pollIntervalMs: 10, workerScriptPath: "C:\\temp\\noop.js" });

  rosterSvc.ensureRoster(ws.id);

  const simpleJob = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "review-orchestrator",
    jobType: "release_review",
    payload: { scope: "v1" },
  });
  const simplePlan = pool.planExecution(simpleJob);
  assert.equal(simplePlan.mode, "local");
  assert.equal(simplePlan.selectedModel, null);

  learningSvc.learn(simpleJob, { summary: "previously solved", findings: [] }, "low");
  const learnedPlan = pool.planExecution(simpleJob);
  assert.equal(learnedPlan.mode, "learned");
  assert.ok(learnedPlan.learnedSolution);

  pool.stop();
});

test("WorkerPoolService: prepareDispatchContext creates pointers, cache entry, and envelope", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);
  const memorySvc = new ProjectMemoryService(db);
  const pointerSvc = new MemoryPointerResolverService(db);
  const cacheSvc = new ContextCacheService(db);
  const pool = new WorkerPoolService(db, { pollIntervalMs: 10, workerScriptPath: "C:\\temp\\noop.js" });

  rosterSvc.ensureRoster(ws.id);
  memorySvc.learn(ws.id, "architecture", "Use SQL migration pointers.", 0.9);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "translator-worker",
    jobType: "translate_worker_tasks",
    payload: { prompt: "normalize this task" },
  });

  const dispatch = pool.prepareDispatchContext(job);
  const cacheHit = cacheSvc.lookup(ws.id, cacheSvc.cacheKeyForJob(job));
  const taskPointer = pointerSvc.resolve(dispatch.taskPointerUri);

  assert.ok(dispatch.pointerEnvelopeId);
  assert.ok(dispatch.memoryPointers.length >= 1);
  assert.ok(dispatch.termCodes.includes("translator.worker") || dispatch.termCodes.includes("translate.worker.tasks"));
  assert.ok(cacheHit);
  assert.ok(taskPointer);

  pool.stop();
});

test("WorkerPoolService: prepareDispatchContext reuses cached context and semantic result pointers", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);
  const cacheSvc = new ContextCacheService(db);
  const semanticSvc = new SemanticCacheService(db);
  const artifactSvc = new ArtifactStoreService(db);
  const pool = new WorkerPoolService(db, { pollIntervalMs: 10, workerScriptPath: "C:\\temp\\noop.js" });

  rosterSvc.ensureRoster(ws.id);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "translator-worker",
    jobType: "translate_worker_tasks",
    payload: { prompt: "normalize this task", workerTasks: [{ worker: "agent-recruiter" }] },
  });

  cacheSvc.warmForJob(
    job,
    JSON.stringify({ summary: "cached compact context" }),
    {
      taskPointerUri: "task://mission/demo/1",
      memoryPointers: ["mem://ws/demo/project-memory/1"],
      artifactPointers: ["result://job/cached/output"],
    },
    250,
  );

  const artifact = artifactSvc.store(
    ws.id,
    "result",
    "Similar translator result",
    JSON.stringify({ summary: "Use the translated task prompt cache." }),
    { artifactUri: "result://job/similar/output" },
  );
  semanticSvc.remember(
    ws.id,
    `translator-worker translate_worker_tasks ${JSON.stringify({ prompt: "normalize this task", workerTasks: [{ worker: "agent-recruiter" }] })}`,
    artifact.artifactUri,
    "translator-worker",
  );

  const dispatch = pool.prepareDispatchContext(job);

  assert.ok(dispatch.memoryPointers.includes("mem://ws/demo/project-memory/1"));
  assert.ok(dispatch.artifactPointers.includes("result://job/cached/output"));
  assert.ok(dispatch.artifactPointers.includes("result://job/similar/output"));
  assert.ok(dispatch.cacheKeys.some((key) => key.startsWith("semantic://")));
  assert.ok(dispatch.compactContext.includes("cached compact context"));
  assert.ok(dispatch.compactContext.includes("result://job/similar/output"));

  pool.stop();
});

test("WorkerPoolService: data miner stays local for structured dataset preparation", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);
  const pool = new WorkerPoolService(db, { pollIntervalMs: 10, workerScriptPath: "C:\\temp\\noop.js" });

  rosterSvc.ensureRoster(ws.id);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "data-miner",
    jobType: "dataset_classification",
    payload: {
      objective: "Prepare a training slice",
      sources: ["crm"],
      datasets: [{ name: "leads", rows: 5000, columns: ["source", "score", "owner"] }],
    },
  });

  const plan = pool.planExecution(job);
  assert.equal(plan.mode, "local");
  assert.equal(plan.selectedModel, null);

  pool.stop();
});

test("WorkerPoolService: translator stays local for prompt normalization and recruiter handoff", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);
  const pool = new WorkerPoolService(db, { pollIntervalMs: 10, workerScriptPath: "C:\\temp\\noop.js" });

  rosterSvc.ensureRoster(ws.id);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "translator-worker",
    jobType: "translate_worker_tasks",
    payload: {
      prompt: "agrega el traductor  que debe  primero idetificar  el lenguaje",
      workerTasks: [{ worker: "agent-recruiter", task: "route translated tasks" }],
    },
  });

  const plan = pool.planExecution(job);
  assert.equal(plan.mode, "local");
  assert.equal(plan.selectedModel, null);

  pool.stop();
});

test("WorkerPoolService: token vault stays local for token budget governance", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);
  const pool = new WorkerPoolService(db, { pollIntervalMs: 10, workerScriptPath: "C:\\temp\\noop.js" });

  rosterSvc.ensureRoster(ws.id);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "token-vault-worker",
    jobType: "token_budget_review",
    payload: {
      providerBudgets: [{ provider: "Anthropic", totalTokens: 100000, usedTokens: 20000 }],
      workerUsage: [{ worker: "code-reviewer", provider: "Anthropic", usedTokens: 4000 }],
    },
  });

  const plan = pool.planExecution(job);
  assert.equal(plan.mode, "local");
  assert.equal(plan.selectedModel, null);

  pool.stop();
});

test("WorkerPoolService: accounts worker stays local for provider account governance", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);
  const pool = new WorkerPoolService(db, { pollIntervalMs: 10, workerScriptPath: "C:\\temp\\noop.js" });

  rosterSvc.ensureRoster(ws.id);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "accounts-worker",
    jobType: "provider_connection_governance",
    payload: {
      providers: [
        { provider: "Anthropic", accountName: "claude-prod", status: "connected" },
        { provider: "Google", accountName: "gemini-ops", status: "connected" },
        { provider: "OpenAI", accountName: "chatgpt-admin", status: "connected" },
      ],
      routingPolicies: ["Prefer local-first workers", "Fallback by provider health"],
      connectionTargets: ["agent-routing", "daily-research"],
    },
  });

  const plan = pool.planExecution(job);
  assert.equal(plan.mode, "local");
  assert.equal(plan.selectedModel, null);

  pool.stop();
});

test("WorkerPoolService: only uses model routing for complex tasks", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);
  const routingSvc = new ModelRoutingService(db);
  const pool = new WorkerPoolService(db, { pollIntervalMs: 10, workerScriptPath: "C:\\temp\\noop.js" });

  rosterSvc.ensureRoster(ws.id);
  routingSvc.ensureDefaults(ws.id);

  const complexJob = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "architect-advisor",
    jobType: "system_architecture_review",
    payload: {
      description: "Design a multi-region event-driven SaaS platform with tenant isolation, DR, zero-downtime deploys, auditability, and strict compliance boundaries.",
      stack: "typescript,node,postgres,redis,kafka,terraform,kubernetes,github-actions,azure",
      constraints: ["soc2", "multi-region", "low-latency", "zero-downtime", "tenant-isolation"],
      artifacts: ["diagram", "adr", "migration-plan", "failure-mode-analysis", "cost-model"],
      context: "x".repeat(2000),
    },
  });

  const plan = pool.planExecution(complexJob);
  assert.equal(plan.mode, "ai-assisted");
  assert.ok(plan.selectedModel);

  pool.stop();
});

test("WorkerAuditService: repeated failures open an auditor escalation case", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const queueSvc = new JobQueueService(db);
  const auditSvc = new WorkerAuditService(db);

  const job = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "code-reviewer",
    jobType: "pr_review",
    payload: {},
  });

  auditSvc.recordFailure(job, "worker-a", "timeout");
  auditSvc.recordFailure(job, "worker-b", "timeout");
  const auditCase = auditSvc.recordFailure(job, "worker-c", "timeout");

  assert.equal(auditCase.failureCount, 3);
  assert.ok(auditCase.auditorJobId, "threshold breach should enqueue worker-auditor");

  const queuedAuditor = queueSvc
    .allFor(ws.id)
    .find((queuedJob) => queuedJob.agentType === "worker-auditor" && queuedJob.jobType === "failure_audit");
  assert.ok(queuedAuditor);
});

test("WorkerAuditService: judge can route to recruiter and resolve the case", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);
  const auditSvc = new WorkerAuditService(db);

  rosterSvc.ensureRoster(ws.id);

  const failingJob = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "code-reviewer",
    jobType: "pr_review",
    payload: {},
  });

  auditSvc.recordFailure(failingJob, "worker-a", "provider timeout");
  auditSvc.recordFailure(failingJob, "worker-b", "provider timeout");
  const auditCase = auditSvc.recordFailure(failingJob, "worker-c", "provider timeout");

  const auditorJob = queueSvc.allFor(ws.id).find((job) => job.id === auditCase.auditorJobId);
  auditSvc.handleJobCompletion(
    queueSvc.complete(auditorJob.id, { summary: "Repeated provider failures detected." }, "worker-auditor-1"),
    { summary: "Repeated provider failures detected." },
  );

  const afterAudit = auditSvc.listByWorkspace(ws.id)[0];
  const policeJob = queueSvc.allFor(ws.id).find((job) => job.id === afterAudit.policeJobId);
  auditSvc.handleJobCompletion(
    queueSvc.complete(policeJob.id, { summary: "Need external research." }, "worker-police-1"),
    { summary: "Need external research." },
  );

  const afterPolice = auditSvc.listByWorkspace(ws.id)[0];
  const researchJob = queueSvc.allFor(ws.id).find((job) => job.id === afterPolice.researchJobId);
  auditSvc.handleJobCompletion(
    queueSvc.complete(
      researchJob.id,
      {
        summary: "Research suggests a safer provider/model choice.",
        recommendations: [{ provider: "OpenAI", model: "GPT-4.1", rationale: "More stable" }],
      },
      "web-researcher-1",
    ),
    {
      summary: "Research suggests a safer provider/model choice.",
      recommendations: [{ provider: "OpenAI", model: "GPT-4.1", rationale: "More stable" }],
    },
  );

  const afterResearch = auditSvc.listByWorkspace(ws.id)[0];
  const judgeJob = queueSvc.allFor(ws.id).find((job) => job.id === afterResearch.judgeJobId);
  auditSvc.handleJobCompletion(
    queueSvc.complete(judgeJob.id, { decision: "reassign_model", summary: "Reroute the model." }, "worker-judge-1"),
    { decision: "reassign_model", summary: "Reroute the model." },
  );

  const afterJudge = auditSvc.listByWorkspace(ws.id)[0];
  const recruiterJob = queueSvc.allFor(ws.id).find((job) => job.id === afterJudge.recruiterJobId);
  const resolved = auditSvc.handleJobCompletion(
    queueSvc.complete(recruiterJob.id, { summary: "Recruiter assigned a safer model." }, "agent-recruiter-1"),
    { summary: "Recruiter assigned a safer model." },
  );

  assert.equal(resolved?.status, "resolved");
  assert.equal(resolved?.decision, "reassign_model");
});

test("WorkerAuditService: judge can order worker rebuild and close after rebuild plan", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);
  const auditSvc = new WorkerAuditService(db);

  rosterSvc.ensureRoster(ws.id);

  const failingJob = queueSvc.enqueue({
    workspaceId: ws.id,
    agentType: "cicd-orchestrator",
    jobType: "pipeline_run",
    payload: {},
  });

  auditSvc.recordFailure(failingJob, "worker-a", "unsupported schema");
  auditSvc.recordFailure(failingJob, "worker-b", "unsupported schema");
  const auditCase = auditSvc.recordFailure(failingJob, "worker-c", "unsupported schema");

  const auditorJob = queueSvc.allFor(ws.id).find((job) => job.id === auditCase.auditorJobId);
  auditSvc.handleJobCompletion(
    queueSvc.complete(auditorJob.id, { summary: "Critical schema faults." }, "worker-auditor-1"),
    { summary: "Critical schema faults." },
  );

  const policeJob = queueSvc.allFor(ws.id).find((job) => job.agentType === "worker-police");
  auditSvc.handleJobCompletion(
    queueSvc.complete(policeJob.id, { summary: "Systemic worker fault." }, "worker-police-1"),
    { summary: "Systemic worker fault." },
  );

  const researchJob = queueSvc.allFor(ws.id).find((job) => job.jobType === "worker_failure_research");
  auditSvc.handleJobCompletion(
    queueSvc.complete(researchJob.id, { summary: "No safer model found.", recommendations: [] }, "web-researcher-1"),
    { summary: "No safer model found.", recommendations: [] },
  );

  const judgeJob = queueSvc.allFor(ws.id).find((job) => job.agentType === "worker-judge");
  auditSvc.handleJobCompletion(
    queueSvc.complete(judgeJob.id, { decision: "rebuild_worker", summary: "Rebuild this worker." }, "worker-judge-1"),
    { decision: "rebuild_worker", summary: "Rebuild this worker." },
  );

  const rebuildJob = queueSvc.allFor(ws.id).find((job) => job.jobType === "rebuild_worker_profile");
  const resolved = auditSvc.handleJobCompletion(
    queueSvc.complete(rebuildJob.id, { summary: "Rebuild plan prepared." }, "worker-auditor-2"),
    { summary: "Rebuild plan prepared." },
  );

  assert.equal(resolved?.status, "resolved");
  assert.equal(resolved?.decision, "rebuild_worker");
});

// ─── Integration: enqueue → claim → complete flow ─────────────────────────────

test("Integration: full job lifecycle enqueue→claim→complete", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const svc = new JobQueueService(db);

  const job = svc.enqueue({
    workspaceId: ws.id,
    agentType: "code-reviewer",
    jobType: "pr_review",
    payload: { files: ["api.ts"], diff: "+export function foo() {}" },
    priority: 8,
  });

  assert.equal(job.status, "pending");

  const claimed = svc.claimNext("code-reviewer", "worker-pool-1");
  assert.ok(claimed);
  assert.equal(claimed.id, job.id);
  assert.equal(claimed.status, "processing");

  const done = svc.complete(claimed.id, {
    findings: [],
    suggestions: ["Add JSDoc"],
    approved: true,
  }, "worker-pool-1");

  assert.equal(done.status, "completed");
  const result = JSON.parse(done.resultJson ?? "{}");
  assert.equal(result.approved, true);

  const events = svc.eventsForJob(job.id);
  const eventNames = events.map((e) => e.event);
  assert.ok(eventNames.includes("enqueued"));
  assert.ok(eventNames.includes("claimed"));
  assert.ok(eventNames.includes("started"));
  assert.ok(eventNames.includes("completed"));
});

test("Integration: retry + dead letter full flow", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const repo = new JobRepository(db);
  const svc = new JobQueueService(db);

  const job = svc.enqueue({
    workspaceId: ws.id,
    agentType: "deploy-manager",
    jobType: "deploy",
    payload: { service: "api", env: "staging" },
    maxRetries: 2,
  });

  // Simulate 3 failures → should dead-letter after maxRetries=2
  for (let attempt = 0; attempt <= 2; attempt++) {
    // Reset scheduledAt so it's claimable immediately
    db.prepare("UPDATE jobs SET scheduledAt = NULL WHERE id = ?").run(job.id);
    const claimed = svc.claimNext("deploy-manager", `worker-${attempt}`);
    if (!claimed) break;
    svc.fail(claimed.id, `attempt ${attempt} failed`, `worker-${attempt}`);
  }

  const final = svc.findById(job.id);
  assert.equal(final?.status, "dead");

  const events = svc.eventsForJob(job.id);
  const deadEvent = events.find((e) => e.event === "dead_lettered");
  assert.ok(deadEvent, "should have a dead_lettered event");
});

test("Integration: roster agent enqueues job for each domain", () => {
  const db = makeDb();
  const ws = makeWs(db);
  const rosterSvc = new AgentRosterService(db);
  const queueSvc = new JobQueueService(db);

  rosterSvc.ensureRoster(ws.id);

  const jobs = [
    { agentType: "code-reviewer", jobType: "pr_review", payload: { files: ["x.ts"] } },
    { agentType: "cicd-orchestrator", jobType: "pipeline_run", payload: { branch: "main" } },
    { agentType: "incident-responder", jobType: "incident", payload: { severity: "P1" } },
    { agentType: "compliance-checker", jobType: "gap_analysis", payload: { framework: "SOC2" } },
  ];

  for (const j of jobs) {
    const job = queueSvc.enqueue({ workspaceId: ws.id, ...j });
    assert.equal(job.status, "pending");
  }

  const depths = queueSvc.allQueueDepths();
  assert.ok(depths.length >= 4);
});
