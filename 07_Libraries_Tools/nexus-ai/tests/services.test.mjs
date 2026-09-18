import test from "node:test";
import assert from "node:assert/strict";

import { openDatabase } from "../src/storage/Database.ts";
import { WorkspaceResolverService } from "../src/services/WorkspaceResolverService.ts";
import { ConversationCaptureService } from "../src/services/ConversationCaptureService.ts";
import { TranscriptService } from "../src/services/TranscriptService.ts";
import { SessionMemoryService } from "../src/services/SessionMemoryService.ts";
import { ProjectMemoryService } from "../src/services/ProjectMemoryService.ts";
import { DecisionExtractionService } from "../src/services/DecisionExtractionService.ts";
import { TaskExtractionService } from "../src/services/TaskExtractionService.ts";
import { PromptExecutionTrackingService } from "../src/services/PromptExecutionTrackingService.ts";
import { ChangeAuditService } from "../src/services/ChangeAuditService.ts";
import { ImplementationPrecedentService } from "../src/services/ImplementationPrecedentService.ts";
import { CompactionEngineService } from "../src/services/CompactionEngineService.ts";
import { ContextPacketBuilderService } from "../src/services/ContextPacketBuilderService.ts";
import { ResumeContextService } from "../src/services/ResumeContextService.ts";
import { MetricsInstrumentationService } from "../src/services/MetricsInstrumentationService.ts";
import { StubAgentAdapter } from "../src/adapters/agentAdapter.ts";
import { AgentContinuityHubService } from "../src/services/AgentContinuityHubService.ts";

function makeDb() {
  return openDatabase(":memory:");
}

test("WorkspaceResolverService upserts workspace idempotently", () => {
  const db = makeDb();
  const svc = new WorkspaceResolverService(db);
  const a = svc.resolve("/test/proj", "Proj");
  const b = svc.resolve("/test/proj", "Proj");
  assert.equal(a.id, b.id);
  assert.equal(a.name, "Proj");
});

test("ConversationCaptureService captures and appends messages", async () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ConversationCaptureService(db);
  const conv = await svc.captureFromAdapter(ws.id, new StubAgentAdapter("claude-code"));
  svc.appendMessage(conv.id, ws.id, "user", "hello");
  const transcript = new TranscriptService(db).getTranscript(conv.id);
  assert.equal(transcript.length, 1);
  assert.equal(transcript[0].role, "user");
});

test("SessionMemoryService records and summarizes", async () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const conv = await new ConversationCaptureService(db).captureFromAdapter(ws.id, new StubAgentAdapter("claude-code"));
  const svc = new SessionMemoryService(db);
  svc.record(conv.id, ws.id, "stack", "TypeScript");
  svc.record(conv.id, ws.id, "arch", "local-first");
  const summary = svc.summarize(conv.id);
  assert.equal(summary.length, 2);
  assert.match(summary[0], /\[/);
});

test("ProjectMemoryService upserts facts without duplicates", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ProjectMemoryService(db);
  svc.learn(ws.id, "arch", "sqlite");
  svc.learn(ws.id, "arch", "sqlite");
  assert.equal(svc.recall(ws.id).length, 1);
});

test("DecisionExtractionService extracts decisions from text", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new DecisionExtractionService(db);
  const result = svc.extractFromText(ws.id, "We decided to use TypeScript for the project");
  assert.ok(result.length >= 1);
});

test("TaskExtractionService extracts TODO items", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new TaskExtractionService(db);
  const tasks = svc.extractFromText(ws.id, "alpha", "TODO: write tests\nTODO: add CI");
  assert.equal(tasks.length, 2);
});

test("PromptExecutionTrackingService computes weighted progress", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new PromptExecutionTrackingService(db);

  const e1 = svc.create(ws.id, "epic1", "task-a", 2);
  const s1 = svc.addStep(e1.id, "step-1");
  svc.completeStep(s1.id);
  svc.complete(e1.id);

  const e2 = svc.create(ws.id, "epic1", "task-b", 2);
  svc.addStep(e2.id, "step-2");

  const progress = svc.progressForWorkspace(ws.id);
  assert.ok(progress > 0 && progress < 100, `Expected 0<p<100, got ${progress}`);
});

test("ChangeAuditService records and links files", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ChangeAuditService(db);
  svc.record({
    workspaceId: ws.id,
    agentId: "agent-1",
    changeType: "add",
    title: "New feature",
    filesAffected: [{ filePath: "src/feature.ts", action: "created" }],
  });
  const entries = svc.findByWorkspace(ws.id);
  assert.equal(entries.length, 1);
  const files = svc.filesAffectedBy(entries[0].id);
  assert.equal(files.length, 1);
  assert.match(files[0], /created/);
});

test("ImplementationPrecedentService fingerprint is stable and lookup works", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ImplementationPrecedentService(db);
  const change = { intent: "Add auth", stack: "Node.js", filesAffected: ["src/auth.ts"] };
  svc.register("PROJECT_A", change, "JWT pattern", ws.id);
  const result = svc.resolve(change);
  assert.ok(result.precedent);
  assert.equal(result.precedent.intent, "Add auth");
});

test("CompactionEngineService offloads tool output with deduplication", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new CompactionEngineService(db);
  const raw = "line1\nline2\nline3";
  const b1 = svc.offloadToolOutput(ws.id, raw);
  const b2 = svc.offloadToolOutput(ws.id, raw);
  assert.equal(b1.id, b2.id);
  assert.ok(b1.bytes > 0);
  assert.equal(b1.contentHash.length, 64);
});

test("ContextPacketBuilderService persists packet to DB", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new ContextPacketBuilderService(db);
  svc.build({
    workspaceId: ws.id,
    pendingTasks: ["task-a", "task-b"],
    memoryFacts: ["fact-1"],
    precedentHints: [],
    conversationDelta: ["msg-1", "msg-2"],
  });
  const latest = svc.latestForWorkspace(ws.id);
  assert.ok(latest);
  assert.ok(latest.budgetUsed > 0);
});

test("ResumeContextService assembles full context", async () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  new ProjectMemoryService(db).learn(ws.id, "arch", "local-first");
  const svc = new ResumeContextService(db);
  const ctx = svc.build(ws.id);
  assert.equal(ctx.workspaceId, ws.id);
  assert.ok(Array.isArray(ctx.memoryFacts));
  assert.ok(ctx.memoryFacts.length >= 1);
});

test("MetricsInstrumentationService records reduction correctly", () => {
  const db = makeDb();
  const ws = new WorkspaceResolverService(db).resolve("/p", "P");
  const svc = new MetricsInstrumentationService(db);
  const m = svc.record(ws.id, { rawContextTokens: 1000, compactedTokens: 100 });
  assert.ok(Math.abs(m.reductionPercent - 90) < 0.01);
  const snap = svc.snapshot(ws.id, 1000, 100);
  assert.ok(Math.abs(snap.savingsRatio - 0.9) < 0.0001);
});

test("AgentContinuityHubService builds continuity snapshot with skills, research, and coverage", () => {
  const db = makeDb();
  const hub = new AgentContinuityHubService(db);
  const workspace = hub.bootstrapWorkspace({ rootPath: "/proj", name: "Proj", repoRootPath: "/repo-root" });
  const agent = hub.registerAgent(workspace.id, "Copilot", "copilot");
  const skill = hub.registerSkill({
    workspaceId: workspace.id,
    name: "TypeScript repo skill",
    skillKey: "ts-repo-skill",
    scope: "workspace",
    stack: "TypeScript",
    skillBody: "Prefer repository pattern and compact context packets.",
    tagsJson: JSON.stringify(["typescript", "repository"]),
  });
  hub.bindSkill(skill.id, agent.id, workspace.id, "default");
  hub.addResearchReference({
    workspaceId: workspace.id,
    title: "better-sqlite3",
    kind: "library",
    url: "https://github.com/WiseLibs/better-sqlite3",
    notes: "Used for local-first persistence.",
    tagsJson: JSON.stringify(["sqlite"]),
  });

  hub.ingestConversation({
    workspaceId: workspace.id,
    agentId: agent.id,
    captured: {
      sourceAgent: "copilot",
      title: "Implement persistence",
      summary: "Capture TODOs and decisions",
      messages: [
        { role: "user", content: "TODO: wire continuity service\nTODO: add coverage tracking" },
        { role: "assistant", content: "We decided to keep it local-first." },
      ],
    },
    epic: "continuity",
  });

  hub.recordCoverage(workspace.id, [
    {
      requirementKey: "workspace-continuity",
      epic: "continuity",
      title: "Separate memory by workspace and repo lineage",
      status: "implemented",
      evidence: "Workspace resolver stores normalized path and repo fingerprint.",
    },
    {
      requirementKey: "skills-engine",
      epic: "skills",
      title: "Suggest skills by workspace and stack",
      status: "implemented",
      evidence: "Skills engine ranks skills by scope, stack, and recent context.",
    },
  ]);

  const snapshot = hub.buildContinuitySnapshot(workspace.id, {
    agentId: agent.id,
    stack: "TypeScript",
    intent: { intent: "Implement persistence", stack: "TypeScript", filesAffected: ["src/storage/Database.ts"], repoId: "repo-root" },
  });

  assert.equal(snapshot.workspace.id, workspace.id);
  assert.ok(snapshot.packet.budgetUsed > 0);
  assert.ok(snapshot.pendingTasks.length >= 2);
  assert.ok(snapshot.skills.length >= 1);
  assert.ok(snapshot.researchReferences.length >= 1);
  assert.ok(snapshot.coverage.overallPercent >= 100);
  assert.ok(snapshot.dashboard.tokenSavingsRatio >= 0);
});
