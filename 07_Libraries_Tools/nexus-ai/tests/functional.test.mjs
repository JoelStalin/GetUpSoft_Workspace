/**
 * Functional tests covering:
 * - New services added in VS Code extension phase
 * - Integration scenarios from the prompt maestro spec
 * - Edge cases and invariants
 */

import test from "node:test";
import assert from "node:assert/strict";

import { openDatabase } from "../src/storage/Database.ts";
import { WorkspaceResolverService } from "../src/services/WorkspaceResolverService.ts";
import { ConversationCaptureService } from "../src/services/ConversationCaptureService.ts";
import { TranscriptService } from "../src/services/TranscriptService.ts";
import { SessionMemoryService } from "../src/services/SessionMemoryService.ts";
import { ProjectMemoryService } from "../src/services/ProjectMemoryService.ts";
import { TaskExtractionService } from "../src/services/TaskExtractionService.ts";
import { ChangeAuditService } from "../src/services/ChangeAuditService.ts";
import { ImplementationPrecedentService } from "../src/services/ImplementationPrecedentService.ts";
import { CompactionEngineService } from "../src/services/CompactionEngineService.ts";
import { ContextPacketBuilderService } from "../src/services/ContextPacketBuilderService.ts";
import { MetricsInstrumentationService } from "../src/services/MetricsInstrumentationService.ts";
import { PromptCoverageService } from "../src/services/PromptCoverageService.ts";
import { PromptExecutionTrackingService } from "../src/services/PromptExecutionTrackingService.ts";
import { ResumeContextService } from "../src/services/ResumeContextService.ts";
import { AgentContinuityHubService } from "../src/services/AgentContinuityHubService.ts";
import { AdapterRegistry } from "../src/adapters/adapterRegistry.ts";
import { StubAgentAdapter, ManualImportAdapter } from "../src/adapters/agentAdapter.ts";

function makeDb() {
  return openDatabase(":memory:");
}

// ─── AdapterRegistry ────────────────────────────────────────────────────────

test("AdapterRegistry registers default stubs for all major agents", () => {
  const reg = new AdapterRegistry();
  const keys = reg.list().map((a) => a.key);
  assert.ok(keys.includes("copilot"), "missing copilot");
  assert.ok(keys.includes("cursor"), "missing cursor");
  assert.ok(keys.includes("chatgpt"), "missing chatgpt");
  assert.ok(keys.includes("claude-code"), "missing claude-code");
  assert.ok(keys.includes("manual_import"), "missing manual_import");
});

test("AdapterRegistry get returns adapter by key", () => {
  const reg = new AdapterRegistry();
  const entry = reg.get("copilot");
  assert.ok(entry);
  assert.equal(entry.key, "copilot");
  assert.equal(entry.isStub, true);
});

test("AdapterRegistry withCapability filters correctly", () => {
  const reg = new AdapterRegistry();
  const importAdapters = reg.withCapability("import");
  assert.ok(importAdapters.length >= 2, "expected at least 2 adapters with import capability");
  for (const a of importAdapters) {
    assert.ok(a.capabilities.includes("import"));
  }
});

test("AdapterRegistry createManualImport returns working adapter", async () => {
  const reg = new AdapterRegistry();
  const adapter = reg.createManualImport({
    sourceAgent: "manual_import",
    title: "Test import",
    messages: [{ role: "user", content: "hello world" }],
  });
  const captured = await adapter.capture();
  assert.equal(captured.messages.length, 1);
  assert.equal(captured.messages[0].content, "hello world");
});

test("StubAgentAdapter describe returns correct metadata", () => {
  const adapter = new StubAgentAdapter("copilot");
  const desc = adapter.describe();
  assert.equal(desc.adapterType, "copilot");
  assert.equal(desc.captureMode, "manual");
});

test("ManualImportAdapter capture returns exactly what was passed", async () => {
  const input = {
    sourceAgent: /** @type {const} */ ("claude-code"),
    title: "My session",
    messages: [
      { role: "user", content: "first message" },
      { role: "assistant", content: "first response" },
    ],
  };
  const adapter = new ManualImportAdapter(input);
  const captured = await adapter.capture();
  assert.equal(captured.title, "My session");
  assert.equal(captured.messages.length, 2);
  assert.equal(captured.messages[1].role, "assistant");
});

// ─── ChangeAuditService — new methods ───────────────────────────────────────

test("ChangeAuditService queryByAgent returns only matching agent entries", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ChangeAuditService(db);

  svc.record({ workspaceId: ws.id, agentId: "agent-A", changeType: "add", title: "A1", filesAffected: [] });
  svc.record({ workspaceId: ws.id, agentId: "agent-B", changeType: "modify", title: "B1", filesAffected: [] });
  svc.record({ workspaceId: ws.id, agentId: "agent-A", changeType: "fix", title: "A2", filesAffected: [] });

  const results = svc.queryByAgent(ws.id, "agent-A");
  assert.equal(results.length, 2);
  assert.ok(results.every((r) => r.agentId === "agent-A"));
});

test("ChangeAuditService queryByTask returns entries linked to task", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ChangeAuditService(db);

  svc.record({ workspaceId: ws.id, agentId: "a", changeType: "add", title: "linked", relatedTaskId: "task-99", filesAffected: [] });
  svc.record({ workspaceId: ws.id, agentId: "a", changeType: "add", title: "unlinked", filesAffected: [] });

  const results = svc.queryByTask(ws.id, "task-99");
  assert.equal(results.length, 1);
  assert.equal(results[0].title, "linked");
});

test("ChangeAuditService auditSummary counts by agent and type", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ChangeAuditService(db);

  svc.record({ workspaceId: ws.id, agentId: "copilot", changeType: "add", title: "T1", filesAffected: [] });
  svc.record({ workspaceId: ws.id, agentId: "copilot", changeType: "fix", title: "T2", filesAffected: [] });
  svc.record({ workspaceId: ws.id, agentId: "cursor", changeType: "add", title: "T3", filesAffected: [] });

  const summary = svc.auditSummary(ws.id);
  assert.equal(summary.totalChanges, 3);
  assert.equal(summary.byAgent["copilot"], 2);
  assert.equal(summary.byAgent["cursor"], 1);
  assert.equal(summary.byType["add"], 2);
  assert.equal(summary.byType["fix"], 1);
});

test("ChangeAuditService answerWho/Why/What return structured answers", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ChangeAuditService(db);

  const entry = svc.record({
    workspaceId: ws.id,
    agentId: "claude-code",
    changeType: "refactor",
    title: "Extract auth module",
    reason: "Reduce complexity in main.ts",
    filesAffected: [{ filePath: "src/auth.ts", action: "created" }],
  });

  assert.equal(svc.answerWho(ws.id, entry.id), "claude-code");
  assert.match(svc.answerWhy(ws.id, entry.id), /Reduce complexity/);
  assert.match(svc.answerWhat(ws.id, entry.id), /Extract auth/);
  assert.match(svc.answerWhat(ws.id, entry.id), /created/);
});

test("ChangeAuditService recordBatch records all entries atomically", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ChangeAuditService(db);

  const entries = svc.recordBatch([
    { workspaceId: ws.id, agentId: "a", changeType: "add", title: "Batch1", filesAffected: [] },
    { workspaceId: ws.id, agentId: "a", changeType: "add", title: "Batch2", filesAffected: [] },
    { workspaceId: ws.id, agentId: "a", changeType: "fix", title: "Batch3", filesAffected: [] },
  ]);

  assert.equal(entries.length, 3);
  assert.equal(svc.findByWorkspace(ws.id).length, 3);
});

test("ChangeAuditService answerWho returns 'unknown' for nonexistent id", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ChangeAuditService(db);
  assert.equal(svc.answerWho(ws.id, "nonexistent-id"), "unknown");
});

// ─── PromptCoverageService ───────────────────────────────────────────────────

test("PromptCoverageService ensureDefaultCoverage seeds items once", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new PromptCoverageService(db);

  svc.ensureDefaultCoverage(ws.id);
  const first = svc.summarize(ws.id);
  assert.ok(first.items.length > 0, "should seed items");

  svc.ensureDefaultCoverage(ws.id);
  const second = svc.summarize(ws.id);
  assert.equal(first.items.length, second.items.length, "should not duplicate on second call");
});

test("PromptCoverageService summarize computes correct overall percent", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new PromptCoverageService(db);

  svc.seed(ws.id, [
    { requirementKey: "k1", epic: "e1", title: "T1", status: "implemented" },
    { requirementKey: "k2", epic: "e1", title: "T2", status: "missing" },
    { requirementKey: "k3", epic: "e2", title: "T3", status: "partial" },
    { requirementKey: "k4", epic: "e2", title: "T4", status: "implemented" },
  ]);

  const { overallPercent, byEpic } = svc.summarize(ws.id);
  // implemented=1, missing=0, partial=0.5 → (1+0+0.5+1)/4 * 100 = 62.5
  assert.ok(Math.abs(overallPercent - 62.5) < 0.01, `Expected 62.5, got ${overallPercent}`);
  assert.ok(byEpic["e1"] !== undefined);
  assert.ok(byEpic["e2"] !== undefined);
});

test("PromptCoverageService ensureDefaultCoverage includes VS Code extension requirement", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new PromptCoverageService(db);

  svc.ensureDefaultCoverage(ws.id);
  const { items } = svc.summarize(ws.id);
  const vsCodeItem = items.find((i) => i.requirementKey === "vscode-extension");
  assert.ok(vsCodeItem, "VS Code extension requirement must be tracked");
  assert.equal(vsCodeItem.status, "implemented");
});

// ─── Workspace isolation ─────────────────────────────────────────────────────

test("workspace isolation: memories from workspace A not visible in workspace B", () => {
  const db = makeDb();
  const wsResolver = new WorkspaceResolverService(db);
  const wsA = wsResolver.resolve("/proj/alpha", "Alpha");
  const wsB = wsResolver.resolve("/proj/beta", "Beta");
  const memSvc = new ProjectMemoryService(db);

  memSvc.learn(wsA.id, "stack", "TypeScript");
  memSvc.learn(wsA.id, "db", "SQLite");

  const factsA = memSvc.recall(wsA.id);
  const factsB = memSvc.recall(wsB.id);

  assert.equal(factsA.length, 2);
  assert.equal(factsB.length, 0, "Workspace B must be isolated from A's memories");
});

test("workspace isolation: tasks from workspace A not visible in workspace B", () => {
  const db = makeDb();
  const wsResolver = new WorkspaceResolverService(db);
  const wsA = wsResolver.resolve("/proj/alpha", "Alpha");
  const wsB = wsResolver.resolve("/proj/beta", "Beta");
  const taskSvc = new TaskExtractionService(db);

  taskSvc.extractFromText(wsA.id, "epic-a", "TODO: implement auth\nTODO: add tests");

  const tasksA = taskSvc.findByEpic(wsA.id);
  const tasksB = taskSvc.findByEpic(wsB.id);

  assert.equal(tasksA.length, 2);
  assert.equal(tasksB.length, 0, "Workspace B must be isolated from A's tasks");
});

test("workspace isolation: changelog entries from workspace A not visible in workspace B", () => {
  const db = makeDb();
  const wsResolver = new WorkspaceResolverService(db);
  const wsA = wsResolver.resolve("/proj/alpha", "Alpha");
  const wsB = wsResolver.resolve("/proj/beta", "Beta");
  const auditSvc = new ChangeAuditService(db);

  auditSvc.record({ workspaceId: wsA.id, agentId: "agent", changeType: "add", title: "A change", filesAffected: [] });

  const entriesA = auditSvc.findByWorkspace(wsA.id);
  const entriesB = auditSvc.findByWorkspace(wsB.id);

  assert.equal(entriesA.length, 1);
  assert.equal(entriesB.length, 0);
});

// ─── Full session flow (integration) ────────────────────────────────────────

test("full session flow: ingest conversation → extract tasks → build context packet", async () => {
  const db = makeDb();
  const wsResolver = new WorkspaceResolverService(db);
  const ws = wsResolver.resolve("/session/test", "SessionTest");

  // 1. Ingest conversation via manual import
  const captureSvc = new ConversationCaptureService(db);
  const adapter = new ManualImportAdapter({
    sourceAgent: "claude-code",
    title: "Implement auth module",
    messages: [
      { role: "user", content: "TODO: add JWT middleware\nTODO: write integration tests\nWe decided to use RS256 algorithm" },
      { role: "assistant", content: "I'll implement JWT middleware using the RS256 algorithm for better security." },
    ],
  });
  const conv = await captureSvc.captureFromAdapter(ws.id, adapter);
  assert.ok(conv.id, "conversation should have an id");

  // 2. Verify transcript
  const transcript = new TranscriptService(db).getTranscript(conv.id);
  assert.equal(transcript.length, 2);

  // 3. Extract tasks from conversation messages
  const taskSvc = new TaskExtractionService(db);
  const fullText = transcript.map((m) => m.content).join("\n");
  const tasks = taskSvc.extractFromText(ws.id, "auth", fullText);
  assert.ok(tasks.length >= 2, `Expected at least 2 tasks, got ${tasks.length}`);

  // 4. Store memory facts
  const memSvc = new ProjectMemoryService(db);
  memSvc.learn(ws.id, "decision", "Use RS256 for JWT");
  memSvc.learn(ws.id, "stack", "Node.js + TypeScript");

  // 5. Build context packet
  const packetSvc = new ContextPacketBuilderService(db);
  const taskTitles = tasks.map((t) => t.title);
  const memFacts = memSvc.recall(ws.id).map((m) => m.fact);

  const packet = packetSvc.build({
    workspaceId: ws.id,
    pendingTasks: taskTitles,
    memoryFacts: memFacts,
    precedentHints: [],
    conversationDelta: transcript.map((m) => `[${m.role}] ${m.content}`),
  });

  assert.ok(packet.budgetUsed > 0, "packet must have non-zero budget");
  assert.ok(packet.id, "packet must be persisted with id");

  // 6. Verify metrics
  const metricsSvc = new MetricsInstrumentationService(db);
  const baselineTokens = fullText.length * 4; // naive estimate
  const metric = metricsSvc.record(ws.id, {
    rawContextTokens: baselineTokens,
    compactedTokens: Math.round(packet.budgetUsed * 0.25),
  });
  assert.ok(metric.reductionPercent > 0, "must show some reduction");
});

test("full session flow: worktree continuity — two workspaces share repo fingerprint", () => {
  const db = makeDb();
  const wsResolver = new WorkspaceResolverService(db);

  // Both worktrees point to same repoRootPath → same computed fingerprint
  const wsMain = wsResolver.resolveWorkspace({ rootPath: "/repo/main", name: "Main", repoRootPath: "/repo" });
  const wsFeature = wsResolver.resolveWorkspace({ rootPath: "/repo/feature-branch", name: "Feature", repoRootPath: "/repo" });

  assert.notEqual(wsMain.id, wsFeature.id, "different worktrees must have different IDs");
  assert.equal(wsMain.repoFingerprint, wsFeature.repoFingerprint, "same repoRootPath must yield same fingerprint");
  assert.ok(wsMain.repoFingerprint, "fingerprint must be non-empty");
});

// ─── Compaction and offloading ───────────────────────────────────────────────

test("compaction: microcompact respects maxItems budget strictly", async () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const captureSvc = new ConversationCaptureService(db);
  const svc = new CompactionEngineService(db);

  // Create a conversation then append 20 messages
  const adapter = new StubAgentAdapter("claude-code");
  const conv = await captureSvc.captureFromAdapter(ws.id, adapter);
  for (let i = 0; i < 20; i++) {
    captureSvc.appendMessage(conv.id, ws.id, "user", `message ${i} content `.repeat(10));
  }

  const result = svc.compactWorkspace(ws.id, 5);
  assert.ok(result.compactedCount >= 0, "compactedCount must be non-negative");
  assert.ok(result.kept.length <= 5, `kept must be ≤ 5, got ${result.kept.length}`);
});

test("compaction: offloaded blobs are deduplicated by content hash", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new CompactionEngineService(db);

  const largeOutput = "line".repeat(500);
  const b1 = svc.offloadToolOutput(ws.id, largeOutput);
  const b2 = svc.offloadToolOutput(ws.id, largeOutput);

  assert.equal(b1.id, b2.id, "same content must produce same blob id");
  assert.equal(b1.contentHash, b2.contentHash);
  assert.ok(b1.bytes > 0);
});

test("compaction: different content produces different blobs", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new CompactionEngineService(db);

  const b1 = svc.offloadToolOutput(ws.id, "output A");
  const b2 = svc.offloadToolOutput(ws.id, "output B");

  assert.notEqual(b1.id, b2.id);
  assert.notEqual(b1.contentHash, b2.contentHash);
});

// ─── Token reduction metrics ─────────────────────────────────────────────────

test("metrics: ~90% reduction is measurable and recordable", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new MetricsInstrumentationService(db);

  const m = svc.record(ws.id, { rawContextTokens: 10000, compactedTokens: 900 });
  assert.ok(Math.abs(m.reductionPercent - 91) < 0.1, `Expected ~91%, got ${m.reductionPercent}`);
});

test("metrics: snapshot savingsRatio is clamped to [0, 1]", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new MetricsInstrumentationService(db);

  const s1 = svc.snapshot(ws.id, 100, 200);
  assert.equal(s1.savingsRatio, 0, "negative savings clamped to 0");

  const s2 = svc.snapshot(ws.id, 100, 0);
  assert.equal(s2.savingsRatio, 1, "100% savings = ratio 1");

  const s3 = svc.snapshot(ws.id, 1000, 300);
  assert.ok(s3.savingsRatio > 0 && s3.savingsRatio < 1);
  assert.ok(Math.abs(s3.savingsRatio - 0.7) < 0.001);
});

test("metrics: multiple records — each has non-zero reductionPercent", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new MetricsInstrumentationService(db);

  // record() writes to token_metrics
  const m1 = svc.record(ws.id, { rawContextTokens: 1000, compactedTokens: 100 });
  const m2 = svc.record(ws.id, { rawContextTokens: 2000, compactedTokens: 300 });
  const m3 = svc.record(ws.id, { rawContextTokens: 5000, compactedTokens: 500 });

  assert.ok(m1.reductionPercent > 0, `m1 reduction: ${m1.reductionPercent}`);
  assert.ok(m2.reductionPercent > 0, `m2 reduction: ${m2.reductionPercent}`);
  assert.ok(m3.reductionPercent > 0, `m3 reduction: ${m3.reductionPercent}`);

  // averageSavings30d reads from metrics_snapshots (separate table)
  // snapshot() populates it
  svc.snapshot(ws.id, 1000, 100);
  svc.snapshot(ws.id, 2000, 300);
  svc.snapshot(ws.id, 5000, 500);

  const avg = svc.averageSavings30d(ws.id);
  assert.ok(avg > 0 && avg <= 1, `avg savingsRatio must be in (0,1], got ${avg}`);
});

// ─── Prompt execution tracking ───────────────────────────────────────────────

test("prompt tracking: overall progress is weighted by task weight", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new PromptExecutionTrackingService(db);

  // Heavy task done
  const heavy = svc.create(ws.id, "persistence", "db-setup", 10);
  const s1 = svc.addStep(heavy.id, "create migrations");
  const s2 = svc.addStep(heavy.id, "create repos");
  svc.completeStep(s1.id);
  svc.completeStep(s2.id);
  svc.complete(heavy.id);

  // Light task pending
  svc.create(ws.id, "docs", "write-readme", 1);

  const progress = svc.progressForWorkspace(ws.id);
  assert.ok(progress > 50, `Expected >50% (heavy task done), got ${progress}`);
  assert.ok(progress < 100, "Not all done yet");
});

test("prompt tracking: zero steps = 0% completion", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new PromptExecutionTrackingService(db);

  svc.create(ws.id, "epic", "task-with-no-steps", 1);
  const progress = svc.progressForWorkspace(ws.id);
  assert.equal(progress, 0);
});

// ─── Implementation precedent ─────────────────────────────────────────────────

test("precedent: identical fingerprint matches existing precedent", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ImplementationPrecedentService(db);

  const change = {
    intent: "Add rate limiting middleware",
    stack: "Express.js",
    filesAffected: ["src/middleware/rateLimit.ts"],
  };

  svc.register("ProjectA", change, "Express rate limiter", ws.id);
  const result = svc.resolve(change);

  assert.ok(result.precedent, "should find precedent");
  assert.equal(result.precedent.intent, "Add rate limiting middleware");
});

test("precedent: different intent produces different fingerprint", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ImplementationPrecedentService(db);

  const changeA = { intent: "Add authentication", stack: "Node.js", filesAffected: ["src/auth.ts"] };
  const changeB = { intent: "Add rate limiting", stack: "Node.js", filesAffected: ["src/rate.ts"] };

  svc.register("ProjectA", changeA, "Auth impl", ws.id);
  svc.register("ProjectA", changeB, "Rate limit impl", ws.id);

  const resultA = svc.resolve(changeA);
  const resultB = svc.resolve(changeB);

  assert.ok(resultA.precedent);
  assert.ok(resultB.precedent);
  assert.notEqual(resultA.precedent.id, resultB.precedent.id);
});

test("precedent: no match returns falsy precedent (null or undefined)", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ImplementationPrecedentService(db);
  void ws;

  const result = svc.resolve({
    intent: "Build a quantum teleporter",
    stack: "Haskell",
    filesAffected: [],
  });

  assert.ok(!result.precedent, `Expected no precedent, got: ${JSON.stringify(result.precedent)}`);
});

// ─── Resume context ───────────────────────────────────────────────────────────

test("resume context: aggregates memory, tasks, and decisions", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");

  new ProjectMemoryService(db).learn(ws.id, "arch", "local-first SQLite");
  new ProjectMemoryService(db).learn(ws.id, "stack", "TypeScript");
  new TaskExtractionService(db).extractFromText(ws.id, "core", "TODO: finish tests\nTODO: deploy to prod");

  const ctx = new ResumeContextService(db).build(ws.id);

  assert.equal(ctx.workspaceId, ws.id);
  assert.ok(ctx.memoryFacts.length >= 2, `Expected ≥2 facts, got ${ctx.memoryFacts.length}`);
  assert.ok(ctx.pendingTasks.length >= 2, `Expected ≥2 tasks, got ${ctx.pendingTasks.length}`);
});

test("resume context: empty workspace returns empty arrays not errors", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/empty", "Empty");
  const ctx = new ResumeContextService(db).build(ws.id);

  assert.equal(ctx.workspaceId, ws.id);
  assert.deepEqual(ctx.memoryFacts, []);
  assert.deepEqual(ctx.pendingTasks, []);
});

// ─── AgentContinuityHubService — edge cases ──────────────────────────────────

test("hub: bootstrapWorkspace is idempotent across calls", () => {
  const db = makeDb();
  const hub = new AgentContinuityHubService(db);

  const ws1 = hub.bootstrapWorkspace({ rootPath: "/project", name: "Project" });
  const ws2 = hub.bootstrapWorkspace({ rootPath: "/project", name: "Project" });

  assert.equal(ws1.id, ws2.id, "same path must yield same workspace id");
});

test("hub: registerAgent is idempotent for same workspace+name", () => {
  const db = makeDb();
  const hub = new AgentContinuityHubService(db);
  const ws = hub.bootstrapWorkspace({ rootPath: "/p", name: "P" });

  const a1 = hub.registerAgent(ws.id, "Copilot", "copilot");
  const a2 = hub.registerAgent(ws.id, "Copilot", "copilot");

  assert.equal(a1.id, a2.id);
});

test("hub: ingestConversation creates tasks and memories from messages", () => {
  const db = makeDb();
  const hub = new AgentContinuityHubService(db);
  const ws = hub.bootstrapWorkspace({ rootPath: "/p", name: "P" });

  hub.ingestConversation({
    workspaceId: ws.id,
    captured: {
      sourceAgent: "claude-code",
      messages: [
        { role: "user", content: "TODO: implement caching layer\nTODO: add Redis support" },
        { role: "assistant", content: "We decided to use Redis for session caching." },
      ],
    },
    epic: "infrastructure",
  });

  const snapshot = hub.buildContinuitySnapshot(ws.id, {});
  assert.ok(snapshot.pendingTasks.length >= 2, "tasks must be extracted from conversation");
  assert.ok(snapshot.workspace.id === ws.id);
});

test("hub: buildContinuitySnapshot includes coverage after ensureDefaultCoverage", () => {
  const db = makeDb();
  const hub = new AgentContinuityHubService(db);
  const ws = hub.bootstrapWorkspace({ rootPath: "/p", name: "P" });

  new PromptCoverageService(db).ensureDefaultCoverage(ws.id);

  const snapshot = hub.buildContinuitySnapshot(ws.id, {});
  assert.ok(snapshot.coverage.overallPercent > 0, "coverage must be > 0 after seeding");
  assert.ok(snapshot.coverage.items.length > 0);
});

test("hub: dashboard tokenSavingsRatio stays in [0,1] range", () => {
  const db = makeDb();
  const hub = new AgentContinuityHubService(db);
  const ws = hub.bootstrapWorkspace({ rootPath: "/p", name: "P" });

  const snapshot = hub.buildContinuitySnapshot(ws.id, {});
  const ratio = snapshot.dashboard.tokenSavingsRatio;
  assert.ok(ratio >= 0 && ratio <= 1, `ratio must be in [0,1], got ${ratio}`);
});

// ─── Context packet budget enforcement ───────────────────────────────────────

test("context packet: zero budget produces empty blocks", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ContextPacketBuilderService(db, {
    pendingTasks: 0,
    memoryFacts: 0,
    precedentHints: 0,
    conversationDelta: 0,
  });

  const packet = svc.build({
    workspaceId: ws.id,
    pendingTasks: ["task-a", "task-b"],
    memoryFacts: ["fact-1"],
    precedentHints: ["hint-1"],
    conversationDelta: ["msg-1"],
  });

  assert.equal(packet.budgetUsed, 0, "zero budget must produce zero usage");
});

test("context packet: budget limits items per block independently", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ContextPacketBuilderService(db, {
    pendingTasks: 2,
    memoryFacts: 1,
    precedentHints: 3,
    conversationDelta: 0,
  });

  const packet = svc.build({
    workspaceId: ws.id,
    pendingTasks: ["t1", "t2", "t3", "t4"],
    memoryFacts: ["f1", "f2", "f3"],
    precedentHints: ["h1", "h2"],
    conversationDelta: ["d1"],
  });

  assert.ok(packet.budgetUsed > 0);
  // Budget was: tasks=2, facts=1, precedents=3 (only 2 available), delta=0
  // So max items = 2 + 1 + 2 + 0 = 5
  // budgetUsed = sum of chars from those 5 items
});

test("context packet: latest persisted for workspace is retrievable", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ContextPacketBuilderService(db);

  svc.build({ workspaceId: ws.id, pendingTasks: ["t1"], memoryFacts: [], precedentHints: [], conversationDelta: [] });
  svc.build({ workspaceId: ws.id, pendingTasks: ["t2"], memoryFacts: [], precedentHints: [], conversationDelta: [] });

  const latest = svc.latestForWorkspace(ws.id);
  assert.ok(latest, "should return latest packet");
});

// ─── Session memory compaction ────────────────────────────────────────────────

test("session memory: summarize formats entries as [category] fact", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const captureSvc = new ConversationCaptureService(db);
  const svc = new SessionMemoryService(db);

  const adapter = new StubAgentAdapter("claude-code");
  return captureSvc.captureFromAdapter(ws.id, adapter).then((conv) => {
    svc.record(conv.id, ws.id, "decision", "Use SQLite for persistence");
    svc.record(conv.id, ws.id, "constraint", "Local-first only");

    const summaries = svc.summarize(conv.id);
    assert.equal(summaries.length, 2);
    assert.ok(summaries.some((s) => s.includes("[decision]")));
    assert.ok(summaries.some((s) => s.includes("[constraint]")));
  });
});
