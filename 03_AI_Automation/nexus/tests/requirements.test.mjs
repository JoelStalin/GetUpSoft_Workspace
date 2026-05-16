import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CompactionEngine } from "../src/compaction/compactionEngine.ts";
import { ContextPacketBuilder } from "../src/core/contextPacketBuilder.ts";
import { DashboardModel } from "../src/ui/dashboardModel.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("creates proposed src architecture folders and entrypoint", () => {
  const expectedPaths = [
    "src/core",
    "src/storage",
    "src/adapters",
    "src/compaction",
    "src/precedents",
    "src/ui",
    "src/extension.ts",
  ];

  for (const expectedPath of expectedPaths) {
    const absolute = path.join(repoRoot, expectedPath);
    assert.equal(
      fs.existsSync(absolute),
      true,
      `Expected ${expectedPath} to exist`,
    );
  }
});

test("sqlite migration contains required table groups", () => {
  const sql = read("src/storage/migrations/001_initial_core.sql");
  const requiredTables = [
    "conversations",
    "messages",
    "project_memories",
    "decisions",
    "tasks",
    "task_steps",
    "change_log",
    "precedent_links",
    "context_packets",
    "metrics_snapshots",
  ];

  for (const table of requiredTables) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }

  assert.match(sql, /idx_messages_workspaceId/);
});

test("continuity upgrade migration adds coverage, research, and replacement tables", () => {
  const sql = read("src/storage/migrations/006_continuity_hub_upgrades.sql");
  const requiredTables = [
    "content_replacements",
    "research_references",
    "prompt_requirement_coverage",
  ];

  for (const table of requiredTables) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }

  assert.match(sql, /ALTER TABLE workspaces ADD COLUMN repoFingerprint/);
  assert.match(sql, /ALTER TABLE messages ADD COLUMN normalizedSearchText/);
  assert.match(sql, /ALTER TABLE token_metrics ADD COLUMN crossProjectConsistencyMatches/);
});

test("compaction engine enforces zero budget and offloads tool output", () => {
  const compaction = new CompactionEngine();
  assert.deepEqual(compaction.microcompact(["a", "b"], 0), []);

  const offload = compaction.offloadToolOutput("line1\nline2");
  assert.equal(offload.bytes > 0, true);
  assert.equal(offload.contentHash.length, 64);
  assert.match(offload.preview, /line1/);
});

test("context packet builder applies item budgets", () => {
  const builder = new ContextPacketBuilder({
    pendingTasks: 1,
    memoryFacts: 1,
    precedentHints: 1,
    conversationDelta: 1,
  });

  const packet = builder.build({
    pendingTasks: ["task-a", "task-b"],
    memoryFacts: ["memory-a", "memory-b"],
    precedentHints: ["hint-a", "hint-b"],
    conversationDelta: ["delta-a", "delta-b"],
  });

  assert.equal(packet.itemBudgetTotal, 4);
  assert.equal(packet.itemBudgetUsed, 4);
  assert.equal(packet.blocks.pendingTasks.length, 1);
  assert.equal(packet.blocks.memoryFacts.length, 1);
  assert.equal(packet.blocks.precedentHints.length, 1);
  assert.equal(packet.blocks.conversationDelta.length, 1);
});

test("dashboard token savings ratio is clamped to non-negative range", () => {
  const model = new DashboardModel();
  const state = model.build([], 10, 20);
  assert.equal(state.tokenSavingsRatio, 0);
});
