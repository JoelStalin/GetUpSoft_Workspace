import test from "node:test";
import assert from "node:assert/strict";
import {
  detectPromptLanguage,
  correctPromptText,
  buildWorkerTaskPrompts,
  HANDLERS
} from "../src/workers/agentWorker.ts";

// ─── Phase 1: translator-worker ───────────────────────────────────────────

test("translator-worker: detectPromptLanguage identifies Spanish", () => {
  const text = "necesito que el worker traduzca este prompt para el reclutador";
  const lang = detectPromptLanguage(text);
  assert.equal(lang, "es");
});

test("translator-worker: detectPromptLanguage identifies English", () => {
  const text = "I need the worker to translate this prompt for the recruiter";
  const lang = detectPromptLanguage(text);
  assert.equal(lang, "en");
});

test("translator-worker: detectPromptLanguage identifies Mixed", () => {
  const text = "necesito que hagas un review de este worker and optimize the prompt";
  const lang = detectPromptLanguage(text);
  assert.equal(lang, "mixed");
});

test("translator-worker: correctPromptText fixes typos", () => {
  const text = "crea un worquer que revize tokesn y apis";
  const corrected = correctPromptText(text);
  assert.ok(corrected.length > 0);
  assert.match(corrected, /worker/i);
});

test("translator-worker: buildWorkerTaskPrompts generates structured prompts", () => {
  const tasks = [{ worker: "code-reviewer", task: "review src/main.ts" }];
  const correctedText = "Review the main file";
  const understanding = "Review task";
  const prompts = buildWorkerTaskPrompts(tasks, correctedText, understanding, "en");

  assert.equal(prompts.length, 1);
  assert.equal(prompts[0].worker, "code-reviewer");
  assert.match(prompts[0].prompt, /Review the main file/);
});

// ─── Phase 1: memory-agent ───────────────────────────────────────────────

test("memory-agent: captures reusable memory facts", async () => {
  const job = {
    jobId: "j1",
    agentType: "memory-agent",
    jobType: "capture_memory",
    workerId: "w1",
    payload: {
      sourceAgentType: "code-reviewer",
      sourceJobType: "review",
      result: { executionMode: "local", summary: "Review done" }
    }
  };
  
  const result = await HANDLERS["memory-agent"](job);
  assert.ok(Array.isArray(result.facts));
  assert.match(String(result.facts[0]), /Worker code-reviewer completed review/);
});

// ─── Phase 1: context-storage-worker ─────────────────────────────────────

test("context-storage-worker: prepares indexing plan", async () => {
  const job = {
    jobId: "j2",
    agentType: "context-storage-worker",
    jobType: "index",
    workerId: "w1",
    payload: {
      objective: "sync sources",
      changedSources: ["src/main.ts", "package.json"]
    }
  };

  const result = await HANDLERS["context-storage-worker"](job);
  assert.equal(result.entriesCreated, 2);
  assert.match(String(result.summary), /sync sources/);
});

// ─── Phase 2: agent-recruiter ─────────────────────────────────────────────

test("agent-recruiter: assigns models based on capabilities", async () => {
  const job = {
    jobId: "j3",
    agentType: "agent-recruiter",
    jobType: "recruit",
    workerId: "w1",
    payload: {
      roster: [
        { agentType: "code-reviewer", capabilities: ["coding"], role: "Senior Reviewer" },
        { agentType: "data-miner", capabilities: ["financial_reporting"], role: "Data Analyst" }
      ]
    }
  };

  const result = await HANDLERS["agent-recruiter"](job);
  const assignments = result.assignments;
  assert.equal(assignments.length, 2);
  assert.equal(assignments[0].agentType, "code-reviewer");
  assert.equal(assignments[0].provider, "Anthropic"); // Default for coding
  assert.equal(assignments[1].agentType, "data-miner");
  assert.equal(assignments[1].provider, "OpenAI"); // Default for financial
});

// ─── Phase 3: data-miner (Advanced execution) ────────────────────────────

test("data-miner: classifies datasets and prepares dataframe plan", async () => {
  const job = {
    jobId: "j4",
    agentType: "data-miner",
    jobType: "mine",
    workerId: "w1",
    payload: {
      sources: ["db-main", "api-sales"],
      datasets: [
        { domain: "users", rows: 5000 },
        { domain: "logs", rows: 150000 }
      ]
    }
  };

  const result = await HANDLERS["data-miner"](job);
  const classifications = result.classifications;
  const plan = result.dataframePlan;
  assert.equal(classifications.length, 2);
  assert.ok(classifications.includes("users:structured"));
  assert.ok(classifications.includes("logs:bigdata"));
  assert.equal(plan.joinsRequired, 1);
});

// ─── Governance: worker-auditor ──────────────────────────────────────────

test("worker-auditor: flags unreliable agents", async () => {
  const job = {
    jobId: "j5",
    agentType: "worker-auditor",
    jobType: "daily_worker_audit",
    workerId: "w1",
    payload: {
      leaders: [
        { auditedAgentType: "bad-worker", failureCount: 5 },
        { auditedAgentType: "good-worker", failureCount: 0 }
      ]
    }
  };

  const result = await HANDLERS["worker-auditor"](job);
  const flaggedAgents = result.flaggedAgents;
  assert.equal(flaggedAgents.length, 1);
  assert.equal(flaggedAgents[0].auditedAgentType, "bad-worker");
});
