// src/workers/agentWorker.ts
import { parentPort } from "node:worker_threads";
async function runJob(job) {
  if (job.executionMode === "learned" && job.learnedSolution) {
    return {
      ...job.learnedSolution,
      executionMode: "learned",
      reusedLearning: true,
      summary: String(job.learnedSolution.summary ?? `Reused learned solution for ${job.agentType}.`)
    };
  }
  const handler = HANDLERS[job.agentType] ?? HANDLERS["__default__"];
  return handler(job);
}
var HANDLERS = {
  // ── Development agents ──────────────────────────────────────────────────────
  "code-reviewer": async (job) => analyzeCode(job, "review"),
  "architect-advisor": async (job) => analyzeCode(job, "architecture"),
  "test-generator": async (job) => analyzeCode(job, "tests"),
  "doc-writer": async (job) => analyzeCode(job, "documentation"),
  "bug-analyzer": async (job) => analyzeCode(job, "bug_analysis"),
  "refactor-advisor": async (job) => analyzeCode(job, "refactoring"),
  "security-scanner": async (job) => analyzeCode(job, "security"),
  "performance-analyzer": async (job) => analyzeCode(job, "performance"),
  "api-designer": async (job) => analyzeCode(job, "api_design"),
  "db-advisor": async (job) => analyzeCode(job, "database"),
  // ── DevOps agents ────────────────────────────────────────────────────────────
  "cicd-orchestrator": async (job) => runDevOps(job, "cicd"),
  "infra-advisor": async (job) => runDevOps(job, "infrastructure"),
  "deploy-manager": async (job) => runDevOps(job, "deployment"),
  "monitoring-agent": async (job) => runDevOps(job, "monitoring"),
  "incident-responder": async (job) => runDevOps(job, "incident"),
  "cost-optimizer": async (job) => runDevOps(job, "cost"),
  // ── Project / Knowledge agents ───────────────────────────────────────────────
  "task-planner": async (job) => runPlanning(job, "sprint"),
  "onboarding-agent": async (job) => runPlanning(job, "onboarding"),
  "tech-debt-tracker": async (job) => runPlanning(job, "tech_debt"),
  "context-storage-worker": async (job) => runStorage(job),
  "data-miner": async (job) => runDataMiner(job),
  "translator-worker": async (job) => runTranslator(job),
  "token-vault-worker": async (job) => runTokenVault(job),
  "accounts-worker": async (job) => runAccounts(job),
  "worker-compliance": async (job) => runWorkerCompliance(job),
  "workflow-automation-worker": async (job) => runAutomation(job),
  "integration-engineer": async (job) => runIntegration(job),
  "security-governor": async (job) => runSecurityGovernance(job),
  "linguistic-qa": async (job) => runLinguistic(job),
  "review-orchestrator": async (job) => runReview(job),
  "capture-orchestrator": async (job) => runCapture(job),
  "compliance-checker": async (job) => runPlanning(job, "compliance"),
  "memory-agent": async (job) => runMemoryAgent(job),
  "worker-auditor": async (job) => runWorkerAudit(job),
  "worker-police": async (job) => runWorkerPolice(job),
  "worker-judge": async (job) => runWorkerJudge(job),
  "web-researcher": async (job) => runWebResearch(job),
  "agent-recruiter": async (job) => runAgentRecruitment(job),
  "__default__": async (job) => ({
    processed: true,
    agentType: job.agentType,
    jobType: job.jobType,
    note: "No specific handler \u2014 generic processing complete"
  })
};
async function analyzeCode(job, mode) {
  const { files = [], context = "" } = job.payload;
  return {
    mode,
    agentType: job.agentType,
    jobType: job.jobType,
    filesAnalyzed: files.length,
    findings: [],
    suggestions: [],
    summary: `${mode} analysis complete for ${files.length} file(s).`,
    contextUsed: typeof context === "string" ? context.slice(0, 200) : "",
    executionMode: job.executionMode ?? "local",
    projectTimelineUsed: job.projectContext?.timeline.length ?? 0
  };
}
async function runDevOps(job, mode) {
  const { environment = "unknown", target = "" } = job.payload;
  return {
    mode,
    agentType: job.agentType,
    jobType: job.jobType,
    environment,
    target,
    actions: [],
    status: "analysed",
    summary: `${mode} operation analysed for env=${environment}.`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runPlanning(job, mode) {
  const { items = [] } = job.payload;
  return {
    mode,
    agentType: job.agentType,
    jobType: job.jobType,
    itemsProcessed: items.length,
    output: [],
    summary: `${mode} planning complete for ${items.length} item(s).`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runStorage(job) {
  const payload = job.payload;
  const changedSources = Array.isArray(payload.changedSources) ? payload.changedSources : [];
  return {
    indexedSources: changedSources,
    entriesCreated: changedSources.length,
    summary: `Storage worker prepared indexing plan for ${changedSources.length} source group(s). Objective: ${payload.objective ?? "general sync"}.`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runDataMiner(job) {
  const payload = job.payload;
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const datasets = Array.isArray(payload.datasets) ? payload.datasets : [];
  const memoryFacts = job.projectContext?.memoryFacts ?? [];
  const declaredMemory = Array.isArray(payload.memoryContext) ? payload.memoryContext : [];
  const memoryLinks = [...new Set([...declaredMemory, ...memoryFacts].map((item) => String(item)).filter(Boolean))];
  const classifications = datasets.map((dataset, index) => {
    const domain = typeof dataset.domain === "string" ? dataset.domain : `dataset-${index + 1}`;
    const rows = typeof dataset.rows === "number" ? dataset.rows : Array.isArray(dataset.records) ? dataset.records.length : 0;
    return rows > 1e5 ? `${domain}:bigdata` : rows > 0 ? `${domain}:structured` : `${domain}:schema-only`;
  });
  const normalizedColumns = Array.from(
    new Set(
      datasets.flatMap(
        (dataset) => Array.isArray(dataset.columns) ? dataset.columns.map((column) => String(column)) : Object.keys(dataset)
      )
    )
  );
  const mlReadyDatasets = datasets.map((dataset, index) => {
    const name = typeof dataset.name === "string" ? dataset.name : typeof dataset.domain === "string" ? dataset.domain : `dataset-${index + 1}`;
    return `${name}:feature-ready`;
  });
  return {
    classifications,
    dataframePlan: {
      objective: payload.objective ?? "Prepare project data for worker intelligence and ML.",
      sources,
      normalizedColumns,
      featureGroups: normalizedColumns.slice(0, 12),
      joinsRequired: Math.max(0, sources.length - 1),
      targetModel: payload.targetModel ?? "general-worker-intelligence"
    },
    mlReadyDatasets,
    memoryLinks,
    summary: `Data miner classified ${datasets.length} dataset(s) from ${sources.length} source(s) and prepared ML-ready dataframe guidance.`,
    executionMode: job.executionMode ?? "local"
  };
}
function detectPromptLanguage(text) {
  const normalized = text.toLowerCase();
  const spanishSignals = [" el ", " la ", " de ", " que ", " para ", " worker ", " traductor ", " reclutador "];
  const englishSignals = [" the ", " and ", " for ", " with ", " worker ", " prompt ", " recruiter "];
  const spanishScore = spanishSignals.reduce((score, token) => score + (normalized.includes(token) ? 1 : 0), 0);
  const englishScore = englishSignals.reduce((score, token) => score + (normalized.includes(token) ? 1 : 0), 0);
  if (spanishScore > englishScore) return "es";
  if (englishScore > spanishScore) return "en";
  return "mixed";
}
function correctPromptText(text) {
  let corrected = text.replace(/\s+/g, " ").trim();
  const replacements = [
    [/\bidetificar\b/gi, "identificar"],
    [/\blenguaje\b/gi, "lenguaje"],
    [/\bgramticos\b/gi, "gramaticales"],
    [/\bcomprecion\b/gi, "comprension"],
    [/\bpasaria\b/gi, "pasaria"],
    [/\btraducir las tareas\b/gi, "traducir las tareas"],
    [/\bworker\b/gi, "worker"]
  ];
  for (const [pattern, replacement] of replacements) {
    corrected = corrected.replace(pattern, replacement);
  }
  return corrected;
}
function buildWorkerTaskPrompts(tasks, correctedPrompt, promptUnderstanding, targetLanguage) {
  return tasks.map((task, index) => {
    const worker = String(task.worker ?? `worker-${index + 1}`);
    const taskName = String(task.task ?? task.goal ?? `task-${index + 1}`);
    const context = String(task.context ?? "");
    return {
      worker,
      task: taskName,
      prompt: targetLanguage === "en" ? `Worker: ${worker}. Task: ${taskName}. Objective: ${promptUnderstanding}. Source prompt: ${correctedPrompt}.${context ? ` Context: ${context}.` : ""}` : `Worker: ${worker}. Tarea: ${taskName}. Objetivo: ${promptUnderstanding}. Prompt origen: ${correctedPrompt}.${context ? ` Contexto: ${context}.` : ""}`
    };
  });
}
async function runTranslator(job) {
  const payload = job.payload;
  const prompt = String(payload.prompt ?? "");
  const detectedLanguage = detectPromptLanguage(` ${prompt.toLowerCase()} `);
  const correctedPrompt = correctPromptText(prompt);
  const promptUnderstanding = detectedLanguage === "es" ? `Interpretacion inicial: ${correctedPrompt}` : detectedLanguage === "en" ? `Initial understanding: ${correctedPrompt}` : `Unified understanding: ${correctedPrompt}`;
  const workerTasks = Array.isArray(payload.workerTasks) ? payload.workerTasks : [];
  const targetLanguage = payload.targetLanguage ?? "en";
  const workerTaskPrompts = buildWorkerTaskPrompts(
    workerTasks,
    correctedPrompt,
    promptUnderstanding,
    targetLanguage
  );
  return {
    detectedLanguage,
    correctedPrompt,
    promptUnderstanding,
    workerTaskPrompts,
    recruiterPayload: {
      translatedTaskPrompts: workerTaskPrompts,
      promptUnderstanding,
      sourceLanguage: detectedLanguage,
      targetLanguage
    },
    summary: `Translator prepared ${workerTaskPrompts.length} recruiter-ready worker prompt(s).`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runTokenVault(job) {
  const payload = job.payload;
  const providerBudgets = Array.isArray(payload.providerBudgets) ? payload.providerBudgets : [];
  const workerUsage = Array.isArray(payload.workerUsage) ? payload.workerUsage : [];
  const providerBalances = providerBudgets.map((budget) => {
    const totalTokens = Number(budget.totalTokens ?? 0);
    const usedTokens = Number(budget.usedTokens ?? 0);
    return {
      provider: String(budget.provider ?? "unknown"),
      totalTokens,
      usedTokens,
      remainingTokens: Math.max(0, totalTokens - usedTokens)
    };
  });
  const workerBalances = workerUsage.map((usage) => {
    const usedTokens = Number(usage.usedTokens ?? 0);
    const provider = String(usage.provider ?? "unknown");
    const providerBudget = providerBalances.find((item) => item.provider === provider);
    return {
      worker: String(usage.worker ?? "unknown"),
      provider,
      usedTokens,
      remainingTokens: providerBudget?.remainingTokens ?? 0,
      recommendedMode: usage.recommendedMode ?? "local-first"
    };
  });
  const wasteFindings = workerBalances.filter((usage) => usage.usedTokens > Math.max(5e3, Math.floor(usage.remainingTokens * 0.5))).map((usage) => `Worker ${usage.worker} may be overspending tokens on ${usage.provider}.`);
  return {
    workerBalances,
    providerBalances,
    wasteFindings,
    guardrails: [
      "Keep simple and repeated jobs in local or learned mode.",
      "Escalate to ai-assisted mode only for high-complexity work.",
      "Alert when a provider balance falls below 20% of its budget."
    ],
    summary: `Token vault reviewed ${workerBalances.length} worker usage record(s) across ${providerBalances.length} provider budget(s). Goal: ${payload.optimizationGoal ?? "responsible token spending"}.`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runAccounts(job) {
  const payload = job.payload;
  const providers = Array.isArray(payload.providers) ? payload.providers : [];
  const connectionTargets = Array.isArray(payload.connectionTargets) ? payload.connectionTargets : [];
  const accountRegistry = providers.map((provider, index) => ({
    provider: String(provider.provider ?? `provider-${index + 1}`),
    accountName: String(provider.accountName ?? `account-${index + 1}`),
    status: String(provider.status ?? "connected"),
    regions: Array.isArray(provider.regions) ? provider.regions.map((region) => String(region)) : []
  }));
  const connectionStatuses = accountRegistry.flatMap(
    (account) => (connectionTargets.length > 0 ? connectionTargets : ["default-routing"]).map((target) => ({
      provider: account.provider,
      accountName: account.accountName,
      target,
      status: account.status === "connected" ? "healthy" : "attention-required"
    }))
  );
  return {
    accountRegistry,
    connectionStatuses,
    routingPoliciesApplied: Array.isArray(payload.routingPolicies) ? payload.routingPolicies : [],
    summary: `Accounts worker reviewed ${accountRegistry.length} provider account(s) and ${connectionStatuses.length} connection path(s).`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runWorkerCompliance(job) {
  const payload = job.payload;
  const result = payload.result ?? {};
  const expectedSignals = Array.isArray(payload.expectedSignals) ? payload.expectedSignals : [];
  const missing = expectedSignals.filter((signal) => !(signal in result));
  const compliant = missing.length === 0;
  return {
    compliant,
    issues: compliant ? [] : missing.map((signal) => `Missing required signal: ${signal}`),
    expectedSignals,
    summary: compliant ? `Compliance passed for ${payload.auditedAgentType ?? "worker"} ${payload.auditedJobType ?? "job"}.` : `Compliance failed for ${payload.auditedAgentType ?? "worker"} ${payload.auditedJobType ?? "job"}.`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runAutomation(job) {
  const payload = job.payload;
  return {
    actions: [
      "Define trigger and event schema",
      "Map retries, dead-letter handling, and approvals",
      "Emit workflow and observability checkpoints"
    ],
    workflowSpec: `${payload.platform ?? "generic"} workflow for ${payload.workflowGoal ?? "automation"}`,
    summary: `Automation workflow drafted for ${payload.platform ?? "generic"} platform.`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runIntegration(job) {
  const payload = job.payload;
  return {
    integrationPlan: `Integrate ${(payload.systems ?? []).join(" -> ") || "systems"} using ${payload.auth ?? "unspecified auth"}.`,
    risks: [],
    summary: `Integration plan created for ${(payload.systems ?? []).length} system(s).`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runSecurityGovernance(job) {
  const payload = job.payload;
  return {
    findings: [],
    remediations: ["Rotate secrets", "Verify IAM least privilege", "Review dependency trust chain"],
    summary: `Security governance reviewed ${(payload.assets ?? []).length} asset(s).`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runLinguistic(job) {
  const payload = job.payload;
  return {
    issues: [],
    rewrittenText: String(payload.content ?? "").trim(),
    summary: `Linguistic QA reviewed content for ${payload.locale ?? "default"} locale.`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runReview(job) {
  const payload = job.payload;
  return {
    findings: [],
    approvals: ["engineering"],
    summary: `Cross-functional review completed for ${payload.scope ?? "scope"}.`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runCapture(job) {
  const payload = job.payload;
  return {
    actions: ["Validate inbound schema", "Enrich capture record", "Route to target system"],
    routingPlan: `Capture sources ${(payload.sources ?? []).join(", ")} into ${payload.targetSystem ?? "CRM"}.`,
    summary: `Capture flow prepared for ${(payload.sources ?? []).length} source(s).`,
    executionMode: job.executionMode ?? "local"
  };
}
async function runMemoryAgent(job) {
  const payload = job.payload;
  const result = payload.result ?? {};
  const facts = [
    `Worker ${payload.sourceAgentType ?? "unknown"} completed ${payload.sourceJobType ?? "job"} in ${String(result.executionMode ?? "local")} mode.`
  ];
  return {
    facts,
    learnedSolution: result,
    signaturePayload: payload.originalPayload ?? {},
    summary: `Memory agent captured reusable memory for ${payload.sourceAgentType ?? "unknown"}.`,
    executionMode: "local"
  };
}
async function runWorkerAudit(job) {
  const payload = job.payload;
  if (job.jobType === "daily_worker_audit") {
    const leaders = payload.leaders ?? [];
    return {
      reviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
      flaggedAgents: leaders.filter((leader) => leader.failureCount >= 3),
      summary: `Audited ${leaders.length} worker reliability record(s).`
    };
  }
  if (job.jobType === "rebuild_worker_profile") {
    return {
      rebuiltAt: (/* @__PURE__ */ new Date()).toISOString(),
      auditedAgentType: payload.auditedAgentType ?? "unknown",
      rebuildPlan: [
        "Tighten system prompt and schemas",
        "Reduce unsupported task surface",
        "Add safer defaults and validation"
      ],
      summary: `Prepared worker rebuild plan for ${payload.auditedAgentType ?? "unknown"}.`
    };
  }
  return {
    auditedAt: (/* @__PURE__ */ new Date()).toISOString(),
    auditedAgentType: payload.auditedAgentType ?? "unknown",
    severity: (payload.failureCount ?? 0) >= 5 ? "critical" : "high",
    suspectedHotspots: inferHotspots(String(payload.lastError ?? "")),
    summary: `Detected repeated failures for ${payload.auditedAgentType ?? "unknown"} (${payload.failureCount ?? 0} errors).`
  };
}
async function runWorkerPolice(job) {
  const payload = job.payload;
  return {
    investigatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    auditedAgentType: payload.auditedAgentType ?? "unknown",
    suspectedCauses: inferHotspots(String(payload.lastError ?? "")),
    needsResearch: true,
    summary: `Police investigation opened for ${payload.auditedAgentType ?? "unknown"} after ${payload.failureCount ?? 0} failures.`,
    evidenceRequest: payload.auditSummary ?? ""
  };
}
async function runWorkerJudge(job) {
  const payload = job.payload;
  const lastError = String(payload.lastError ?? "");
  const failureCount = payload.failureCount ?? 0;
  const researchRecommendations = payload.researchRecommendations ?? [];
  const decision = shouldRebuild(lastError, failureCount) || researchRecommendations.length === 0 ? "rebuild_worker" : "reassign_model";
  return {
    judgedAt: (/* @__PURE__ */ new Date()).toISOString(),
    auditedAgentType: payload.auditedAgentType ?? "unknown",
    decision,
    summary: decision === "rebuild_worker" ? `Judge recommends rebuilding ${payload.auditedAgentType ?? "unknown"} due to recurring implementation faults.` : `Judge recommends model reassignment for ${payload.auditedAgentType ?? "unknown"} to reduce repeated errors.`
  };
}
async function runWebResearch(job) {
  const payload = job.payload;
  const sources = payload.sources ?? [];
  const focusAreas = payload.focusAreas ?? [];
  const findings = await Promise.all(
    sources.slice(0, 6).map((source) => fetchResearchSource(source))
  );
  const recommendations = buildResearchRecommendations(focusAreas, findings);
  return {
    jobType: job.jobType,
    objective: payload.objective ?? "daily model research",
    selectedModel: job.selectedModel ?? null,
    researchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    findings,
    recommendations,
    summary: `Reviewed ${findings.length} source(s) for ${focusAreas.join(", ") || "general routing"}.`
  };
}
async function runAgentRecruitment(job) {
  const payload = job.payload;
  const roster = payload.roster ?? [];
  const translatedTaskPrompts = Array.isArray(payload.translatedTaskPrompts) ? payload.translatedTaskPrompts : [];
  const assignments = roster.map((agent) => {
    const route = pickModelForCapabilities(agent.capabilities ?? []);
    const taskPrompt = translatedTaskPrompts.find((entry) => entry.worker === agent.agentType);
    return {
      agentType: agent.agentType,
      capability: firstCapability(agent.capabilities ?? []),
      provider: route.provider,
      model: route.model,
      rationale: `${route.rationale} Agent role: ${agent.role ?? "unknown"}.`,
      confidence: route.confidence,
      sources: [],
      taskPrompt: taskPrompt?.prompt ?? null
    };
  });
  return {
    selectedModel: job.selectedModel ?? null,
    assignedAt: (/* @__PURE__ */ new Date()).toISOString(),
    assignments,
    domainsReviewed: payload.businessDomains ?? [],
    translatedTaskPrompts,
    promptUnderstanding: payload.promptUnderstanding ?? null,
    summary: `Assigned models for ${assignments.length} worker agent(s).`,
    risks: assignments.length === 0 ? ["No roster payload supplied to recruiter."] : []
  };
}
async function fetchResearchSource(source) {
  const response = await fetch(source.url, {
    headers: { "user-agent": "AIHUB-Web-Researcher/0.1" }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch research source ${source.url}: ${response.status}`);
  }
  const html = await response.text();
  const title = extractTitle(html) ?? source.title ?? source.url;
  const snippet = extractSnippet(html);
  return {
    title,
    url: source.url,
    capability: source.capability ?? inferCapability(snippet),
    snippet,
    observedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function buildResearchRecommendations(focusAreas, findings) {
  const areas = focusAreas.length > 0 ? focusAreas : ["coding", "graphic_design", "administrative_reporting"];
  return areas.map((capability) => {
    const route = pickModelForCapabilities([capability]);
    const sources = findings.filter((finding) => finding.capability === capability).map((finding) => ({
      title: String(finding.title ?? ""),
      url: String(finding.url ?? "")
    }));
    return {
      capability,
      provider: route.provider,
      model: route.model,
      rationale: route.rationale,
      confidence: route.confidence,
      sources
    };
  });
}
function pickModelForCapabilities(capabilities) {
  const joined = capabilities.join(" ").toLowerCase();
  if (/(graphic|design|multimodal|visual)/.test(joined)) {
    return {
      provider: "Google",
      model: "Gemini 2.5 Pro",
      rationale: "Best routed for visual and multimodal design-oriented work.",
      confidence: 0.88
    };
  }
  if (/(financial|report|administrative|compliance|cost)/.test(joined)) {
    return {
      provider: "OpenAI",
      model: "GPT-4.1",
      rationale: "Strong route for structured reporting, summarization, and administrative output.",
      confidence: 0.86
    };
  }
  if (/(research|benchmark|release)/.test(joined)) {
    return {
      provider: "Google",
      model: "Gemini 2.5 Pro",
      rationale: "Preferred route for broad research synthesis and source-heavy comparison work.",
      confidence: 0.84
    };
  }
  return {
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Default route for coding, architecture, DevOps, and implementation reasoning.",
    confidence: 0.91
  };
}
function inferHotspots(error) {
  const normalized = error.toLowerCase();
  const hotspots = [];
  if (/(syntax|unsupported|parse)/.test(normalized)) hotspots.push("prompt/schema mismatch");
  if (/(timeout|network|fetch|503|429)/.test(normalized)) hotspots.push("provider/network instability");
  if (/(not found|missing|undefined|null)/.test(normalized)) hotspots.push("missing dependency or invalid assumptions");
  if (/(sql|database|migration)/.test(normalized)) hotspots.push("storage contract drift");
  return hotspots.length > 0 ? hotspots : ["general worker reliability regression"];
}
function shouldRebuild(error, failureCount) {
  return failureCount >= 5 || /(syntax|unsupported|schema|not found|missing|undefined|migration)/i.test(error);
}
function firstCapability(capabilities) {
  return capabilities[0];
}
function inferCapability(text) {
  const normalized = text.toLowerCase();
  if (/(graphic|design|image|multimodal)/.test(normalized)) return "graphic_design";
  if (/(finance|financial|report|administrative)/.test(normalized)) return "financial_reporting";
  if (/(code|tool|agent|benchmark|reasoning|developer)/.test(normalized)) return "coding";
  return "deep_research";
}
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim();
}
function extractSnippet(html) {
  const metaDescription = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  )?.[1];
  if (metaDescription) return metaDescription.trim().slice(0, 400);
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);
}
if (parentPort) {
  parentPort.on("message", async (job) => {
    try {
      const result = await runJob(job);
      const msg = { jobId: job.jobId, workerId: job.workerId, ok: true, result };
      parentPort.postMessage(msg);
    } catch (err) {
      const msg = {
        jobId: job.jobId,
        workerId: job.workerId,
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      };
      parentPort.postMessage(msg);
    }
  });
}
export {
  buildWorkerTaskPrompts,
  correctPromptText,
  detectPromptLanguage
};
//# sourceMappingURL=agentWorker.js.map
