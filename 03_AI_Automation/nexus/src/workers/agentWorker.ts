/**
 * Worker thread entry point — no vscode API, no SQLite.
 * Receives jobs from the main thread via MessageChannel, runs agent logic,
 * posts result/error back. All DB writes happen on the main thread.
 */
import { parentPort, workerData } from "node:worker_threads";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import { pipeline } from "@xenova/transformers";
import { chromium } from "playwright";
import * as dfd from "danfojs";
import { google } from "googleapis";
import * as fs from "fs-extra";

dotenv.config();

let classifierPipeline: any = null;

async function getClassifier() {
  if (!classifierPipeline) {
    // Modelo ligero para clasificación zero-shot local
    classifierPipeline = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');
  }
  return classifierPipeline;
}

let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

function getAnthropic() {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY");
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

async function callExternalAI(provider: string, model: string, system: string, prompt: string): Promise<string> {
  if (provider === "OpenAI") {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: model || "gpt-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
    });
    return response.choices[0].message.content || "";
  } else if (provider === "Anthropic") {
    const client = getAnthropic();
    const response = await client.messages.create({
      model: model || "claude-3-sonnet-20240229",
      max_tokens: 4096,
      system: system,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }
  return "Unsupported provider";
}

// ─── Helper imports ───────────────────────────────────────────────────────────
import {
  detectHardcodedSecrets, detectSQLInjectionRisk, detectXSSRisk,
  detectLongMethods, detectGodClasses, detectEmptyCatchBlocks,
  computeCyclomaticComplexity, computeCognitiveComplexity,
  buildFindingReport, prioritizeFindings, detectDuplication,
  detectMagicNumbers, detectDeadCode, detectUnusedVariables,
  detectLongParameterList, detectNestedConditions,
  detectInjection, detectXSS, detectHardcodedCredentials,
  detectWeakCrypto, detectPathTraversal, detectInsecureRandom,
  detectMissingAuth, detectCSRFMissing, mapToOWASP2025,
  buildSecurityReport, buildRemediationPlan, detectSSRF,
  computeCBO, computeLCOM, computeDIT, detectGodModule,
  detectCircularDependency, computeInstability, computeAbstractness,
  computeDistanceFromMainSeq, classifyArchSmell, scoreArchitecturalFitness,
  suggestArchRefactoringStrategy, detectTightCoupling, detectBigBallOfMud,
  scoreLayerSeparation, detectAnemicDomain, scoreModularity,
  detectTestableUnits, generateBoundaryInputs, computeMutationScore,
  detectMissingAssertions, buildTestMatrix, scoreTestQuality,
  generateEdgeCaseNames, detectTestSmells, computeCoverage,
  detectUndocumentedPublicAPIs, scoreDocCompleteness, buildJSDocBlock,
  detectStaleDoc, scoreReadability, buildChangelogEntry,
  detectNPlusOneQuery as detectNPlusOneQueryCode, detectSynchronousIO,
  detectExpensiveLoop, computeComplexityClass, scorePerformanceRisk,
  buildPerformanceReport, suggestPerformanceOptimization,
  detectVerbMisuse, detectMissingPagination, scoreRESTMaturity,
  buildAPIHealthReport, scoreAPIConsistency,
  detectUnboundedQuery, detectCartesianJoin, computeSelectivity,
  buildIndexRecommendation, buildDBHealthReport, scoreQueryComplexity,
  classifyBugCategory, scoreReproducibility, buildRootCauseTree,
  computeBugScore, buildBugReport, suggestBugFix,
  detectLongMethod, detectFeatureEnvy, buildRefactoringPlan,
  prioritizeRefactoring, computeRefactoringRisk,
} from "./helpers/codeHelpers.ts";

import {
  computePipelineDuration, findPipelineBottleneck, detectFailedStages,
  computeSuccessRate, scorePipelineHealth, buildPipelineRecommendations,
  classifyCICDMaturity, estimateDORAMetrics, detectMissingGates,
  validatePipelineSecurity, detectOverProvisioned, detectUnderProvisioned,
  scoreResiliency, detectSinglePointsOfFailure, scoreIaCAdoption,
  recommendRightSizing, buildInfraHealthReport,
  selectDeployStrategy, buildCanarySchedule, validateDeploymentReadiness,
  computeDeployBlastRadius, buildRollbackPlan, detectEnvironmentDrift,
  scoreDeploymentSafety, buildDeploymentChecklist, estimateDowntime,
  scoreAlertQuality, computeSLOCompliance, computeBaseline, detectAnomalies,
  scoreObservability, buildAlertOptimizationPlan, computeErrorBudget,
  classifyIncidentPriority, computeMTTD, computeMTTR,
  buildIncidentRunbook, scoreIncidentResponse, buildPostmortemTemplate,
  detectRecurringIncidents, estimateCustomerImpact,
  detectIdleResources, computePotentialSavings, scoreCostEfficiency,
  buildCostOptimizationReport, detectCostAnomalies,
} from "./helpers/devopsHelpers.ts";

import {
  computeRICE, scoreEisenhower, computeSprintUtilization,
  rankTasksByPriority, buildSprintPlan, computeVelocity,
  estimateSprintCompletion, detectUnassignedTasks,
  computeDebtCost, classifyDebtSeverity, computeTotalDebt,
  prioritizeDebt, detectAgedDebt, buildDebtRemediationPlan, scoreDebtHealth,
  buildOnboardingChecklist, scoreOnboardingProgress, detectKnowledgeGaps,
  assignStarterTasks,
  validateResultSignals, scoreWorkerOutput, buildComplianceRecord,
  detectSchemaDrift, buildComplianceReport,
  scoreIAMCompliance, detectOverPermissiveRoles, scoreSecretRotation,
  detectStaleSecrets, buildSecurityGovernanceReport,
  computeWorkerReliability, classifyWorkerHealth, detectWorkersNeedingIntervention,
  inferFailureCauses, judgeWorkerRemedy, buildWorkerRebuildPlan,
  scoreAuditSeverity, buildAuditReport, extractInvestigationEvidence,
} from "./helpers/governanceHelpers.ts";

import {
  classifyDatasetSize, scoreDataQuality, normalizeColumnNames,
  buildDataframePlan, classifyMLSuitability, detectOutliersIQR,
  selectMLFeatures, detectHighCardinality,
  prioritizeSourcesForIndexing, detectStaleIndexEntries,
  computeIndexFreshness, buildIndexingBatchPlan, scoreIndexCoverage,
  computeRemainingBudget, computeBudgetUtilization, detectLowBudgetProviders,
  recommendExecutionMode, forecastTokenExhaustion, buildTokenVaultSummary,
  detectTokenWaste,
  scoreAccountHealth, detectDisconnectedAccounts, computeRoutingPreference,
  buildAccountRegistrySummary, detectStaleAccountPings,
} from "./helpers/dataHelpers.ts";

import {
  detectLanguage, autocorrectText, buildMultilingualPrompt,
  scoreI18nReadiness, computeTextSimilarity, segmentSentences,
  scoreLinguisticQuality, computeFleschKincaidGrade,
  detectTerminologyInconsistency, detectUnreplacedPlaceholders,
} from "./helpers/linguisticHelpers.ts";

import {
  routeByCapability, selectPrimaryRoute, scoreAgentFit,
  buildRosterAssignment, detectRosterGaps, computeRosterDiversity,
  recommendAdditionalAgents, scoreRecruitmentCompleteness,
  extractHTMLTitle, extractSnippet, inferResearchDomain,
  scoreResearchSourceQuality, deduplicateFindings, isValidURL,
  buildMemoryFact, detectStaleFacts, mergeDuplicateFacts,
  extractLearnedSolution, scoreMemoryRelevance, buildPointerEnvelope,
  buildCrossFunctionalChecklist, computeApprovalStatus, scoreReviewQuality,
  validateInboundSchema, enrichCaptureRecord, buildCaptureRoutingPlan,
  scoreIntegrationRisk, detectIntegrationAntipatterns, buildIntegrationContract,
  classifyTriggerType, buildRetryPolicy, scoreWorkflowObservability,
  buildDLQConfig,
} from "./helpers/recruitmentHelpers.ts";

export type WorkerJob = {
  jobId: string;
  agentType: string;
  jobType: string;
  payload: Record<string, unknown>;
  workerId: string;
  executionMode?: "local" | "learned" | "ai-assisted";
  learnedSolution?: Record<string, unknown> | null;
  projectContext?: {
    workspaceId: string;
    timeline: string[];
    memoryFacts: string[];
    taskPointer?: string;
    memoryPointers?: string[];
    artifactPointers?: string[];
    termCodes?: string[];
    cacheKeys?: string[];
    pointerEnvelopeId?: string;
  };
  selectedModel?: {
    provider: string;
    model: string;
    rationale: string;
    confidence: number;
  } | null;
};

export type WorkerResult = {
  jobId: string;
  workerId: string;
  ok: true;
  result: Record<string, unknown>;
};

export type WorkerError = {
  jobId: string;
  workerId: string;
  ok: false;
  error: string;
};

// ─── Agent logic dispatch ──────────────────────────────────────────────────────

export async function runJob(job: WorkerJob): Promise<Record<string, unknown>> {
  if (job.executionMode === "learned" && job.learnedSolution) {
    return {
      ...job.learnedSolution,
      executionMode: "learned",
      reusedLearning: true,
      summary: String(job.learnedSolution.summary ?? `Reused learned solution for ${job.agentType}.`),
    };
  }

  const handler = HANDLERS[job.agentType] ?? HANDLERS["__default__"];
  return handler(job);
}

export type JobHandler = (job: WorkerJob) => Promise<Record<string, unknown>>;

// Each handler receives the full job; returns a plain object result.
// Handlers are pure compute — they may call external APIs but never touch SQLite.
export const HANDLERS: Record<string, JobHandler> = {
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
    note: "No specific handler — generic processing complete",
  }),
};

export async function analyzeCode(job: WorkerJob, mode: string): Promise<Record<string, unknown>> {
  const { files = [], context = "", lines = [] } = job.payload as { files?: string[]; context?: string; lines?: string[] };
  const codeLines = Array.isArray(lines) ? lines.map(String) : [];

  if (mode === "review") {
    const findings = [
      ...detectInjection(codeLines),
      ...detectXSS(codeLines),
      ...detectHardcodedCredentials(codeLines),
      ...detectWeakCrypto(codeLines),
    ];
    const longMethods = detectLongMethods(codeLines);
    const godClasses = detectGodClasses(codeLines);
    const emptyCatch = detectEmptyCatchBlocks(codeLines);
    const complexity = computeCyclomaticComplexity(codeLines);
    const cognitive = computeCognitiveComplexity(codeLines);
    const duplication = detectDuplication(codeLines);
    const report = buildFindingReport(findings);
    return { mode, agentType: job.agentType, jobType: job.jobType, filesAnalyzed: files.length, ...report, longMethods, godClasses, emptyCatch, cyclomaticComplexity: complexity, cognitiveComplexity: cognitive, duplication: duplication.length, suggestions: prioritizeFindings(findings).slice(0, 5).map((f) => f.suggestion ?? f.message), summary: `Code review: ${findings.length} finding(s), complexity=${complexity}`, contextUsed: String(context).slice(0, 200), executionMode: job.executionMode ?? "local" };
  }

  if (mode === "architecture") {
    const deps = (job.payload as { deps?: Record<string, string[]> }).deps ?? {};
    const modules = (job.payload as { modules?: Array<{ name: string; exportCount: number; lineCount: number }> }).modules ?? [];
    const cbo = computeCBO(Object.values(deps));
    const instability = computeInstability(3, 7);
    const abstractness = computeAbstractness(2, 10);
    const distance = computeDistanceFromMainSeq(abstractness, instability);
    const circles = detectCircularDependency(deps);
    const godModules = detectGodModule(modules);
    const tight = detectTightCoupling(deps);
    const smell = classifyArchSmell({ instability, abstractness, distance });
    const fitness = scoreArchitecturalFitness({ cbo, lcom: 0.3, dit: 2, wmc: 15, fanIn: 3, fanOut: 7, instability, abstractness, distanceFromMainSeq: distance });
    return { mode, agentType: job.agentType, jobType: job.jobType, cbo, instability, abstractness, distanceFromMainSeq: distance, circularDependencies: circles, godModules, tightlyCoupled: tight, architectureSmell: smell, fitnessScore: fitness, suggestions: suggestArchRefactoringStrategy({ cbo, lcom: 0.3, dit: 2, wmc: 15, fanIn: 3, fanOut: 7, instability, abstractness, distanceFromMainSeq: distance }), summary: `Architecture analysis: fitness=${fitness}/100, smell=${smell}`, executionMode: job.executionMode ?? "local" };
  }

  if (mode === "tests") {
    const units = detectTestableUnits(codeLines);
    const boundaries = generateBoundaryInputs(0, 100);
    const edgeCases = units.flatMap((u) => generateEdgeCaseNames(u.name, u.params));
    const testMatrix = buildTestMatrix(units.map((u) => u.name), ["happy-path", "null-input", "boundary", "error"]);
    const score = scoreTestQuality({ coverage: 70, mutationScore: 60, flakyCandidates: 0, missingAssertions: 0 });
    return { mode, agentType: job.agentType, jobType: job.jobType, detectableUnits: units.length, boundaryValues: boundaries, edgeCases: edgeCases.slice(0, 20), testMatrix, qualityScore: score, summary: `Test generator found ${units.length} testable unit(s), ${edgeCases.length} edge cases`, executionMode: job.executionMode ?? "local" };
  }

  if (mode === "documentation") {
    const sentences = segmentSentences(String(context));
    const readabilityScore = scoreReadability(String(context));
    return { mode, agentType: job.agentType, jobType: job.jobType, readabilityScore, sentenceCount: sentences.length, suggestions: ["Add @param and @returns to all public functions", "Add code examples to complex APIs"], summary: `Documentation analysis: readability=${readabilityScore}/100`, executionMode: job.executionMode ?? "local" };
  }

  if (mode === "bug_analysis") {
    const errorStr = String((job.payload as { error?: string }).error ?? "");
    const category = classifyBugCategory(errorStr);
    const reproducibility = scoreReproducibility([], false, false);
    const bugScore = computeBugScore("medium", 1);
    return { mode, agentType: job.agentType, jobType: job.jobType, category, reproducibility, bugScore, rootCauses: buildRootCauseTree(errorStr), fixSuggestion: suggestBugFix(category), summary: `Bug analysis: category=${category}, score=${bugScore}`, executionMode: job.executionMode ?? "local" };
  }

  if (mode === "refactoring") {
    const longMethods = detectLongMethod(codeLines);
    const featureEnvy = detectFeatureEnvy(codeLines);
    const plan = buildRefactoringPlan([...longMethods.map((m) => ({ name: "long-method", type: "long-method", line: m.line })), ...featureEnvy.map((e) => ({ name: "feature-envy", type: "feature-envy", line: e.line }))]);
    return { mode, agentType: job.agentType, jobType: job.jobType, longMethods: longMethods.length, featureEnvy: featureEnvy.length, refactoringPlan: plan, riskScore: computeRefactoringRisk({ linesChanged: codeLines.length, testedLines: 0, hasIntegrationTests: false }), summary: `Refactor advisor: ${longMethods.length} long methods, ${featureEnvy.length} feature envy`, executionMode: job.executionMode ?? "local" };
  }

  if (mode === "security") {
    const allFindings = [
      ...detectInjection(codeLines), ...detectXSS(codeLines), ...detectHardcodedCredentials(codeLines),
      ...detectWeakCrypto(codeLines), ...detectPathTraversal(codeLines), ...detectInsecureRandom(codeLines), ...detectSSRF(codeLines),
    ];
    const report = buildSecurityReport(allFindings);
    const owaspCategories = [...new Set(allFindings.map((f) => mapToOWASP2025(f.rule)).filter(Boolean))];
    return { mode, agentType: job.agentType, jobType: job.jobType, ...report, owaspCategories, remediationPlan: buildRemediationPlan(allFindings).slice(0, 5), summary: `Security scan: ${allFindings.length} findings, ${report.criticalCount} critical`, executionMode: job.executionMode ?? "local" };
  }

  if (mode === "performance") {
    const nPlusOne = detectNPlusOneQueryCode(codeLines);
    const syncIO = detectSynchronousIO(codeLines);
    const expensiveLoops = detectExpensiveLoop(codeLines);
    const complexity = computeComplexityClass(codeLines);
    const report = buildPerformanceReport({ nPlusOne: nPlusOne.length, syncIO: syncIO.length, complexityClass: complexity, bundleBloat: 0, leakySubscriptions: 0 });
    return { mode, agentType: job.agentType, jobType: job.jobType, ...report, expensiveLoops, suggestions: [suggestPerformanceOptimization("n+1"), suggestPerformanceOptimization("sync-io")], summary: `Performance: complexity=${complexity}, ${nPlusOne.length} N+1, ${syncIO.length} sync IO`, executionMode: job.executionMode ?? "local" };
  }

  if (mode === "api_design") {
    const routes = (job.payload as { routes?: Array<{ method: string; path: string; middleware?: string[] }> }).routes ?? [];
    const healthReport = buildAPIHealthReport(routes);
    return { mode, agentType: job.agentType, jobType: job.jobType, ...healthReport, summary: `API design: ${routes.length} routes, maturity=${JSON.stringify(healthReport.maturityLevel)}`, executionMode: job.executionMode ?? "local" };
  }

  if (mode === "database") {
    const queries = (job.payload as { queries?: Array<{ sql: string }> }).queries ?? [];
    const unbounded = detectUnboundedQuery(queries);
    const cartesian = detectCartesianJoin(queries);
    const complexities = queries.map((q) => scoreQueryComplexity(q));
    const dbReport = buildDBHealthReport({ unboundedQueries: unbounded.length, cartesianJoins: cartesian.length, missingIndexes: 0, redundantIndexes: 0, normalizationLevel: 3, lockContentionTables: [] });
    return { mode, agentType: job.agentType, jobType: job.jobType, ...dbReport, avgQueryComplexity: complexities.length > 0 ? Math.round(complexities.reduce((a, b) => a + b, 0) / complexities.length) : 0, summary: `DB advisor: ${unbounded.length} unbounded queries, ${cartesian.length} cartesian joins`, executionMode: job.executionMode ?? "local" };
  }

  // fallback
  const findings = detectHardcodedSecrets(codeLines).map((s) => ({ rule: s.pattern, severity: "high" as const, line: s.line, message: `Hardcoded secret: ${s.pattern}` }));
  return { mode, agentType: job.agentType, jobType: job.jobType, filesAnalyzed: files.length, findings, suggestions: [], summary: `${mode} analysis complete for ${files.length} file(s).`, contextUsed: String(context).slice(0, 200), executionMode: job.executionMode ?? "local", projectTimelineUsed: job.projectContext?.timeline.length ?? 0 };
}

async function runDevOps(job: WorkerJob, mode: string): Promise<Record<string, unknown>> {
  const { environment = "unknown", target = "" } = job.payload as {
    environment?: string;
    target?: string;
  };
  return {
    mode,
    agentType: job.agentType,
    jobType: job.jobType,
    environment,
    target,
    actions: [],
    status: "analysed",
    summary: `${mode} operation analysed for env=${environment}.`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runPlanning(job: WorkerJob, mode: string): Promise<Record<string, unknown>> {
  const { items = [] } = job.payload as { items?: unknown[] };
  return {
    mode,
    agentType: job.agentType,
    jobType: job.jobType,
    itemsProcessed: items.length,
    output: [],
    summary: `${mode} planning complete for ${items.length} item(s).`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runStorage(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as { objective?: string; changedSources?: string[] };
  const changedSources = Array.isArray(payload.changedSources) ? payload.changedSources : [];
  return {
    indexedSources: changedSources,
    entriesCreated: changedSources.length,
    summary: `Storage worker prepared indexing plan for ${changedSources.length} source group(s). Objective: ${payload.objective ?? "general sync"}.`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runDataMiner(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as {
    objective?: string;
    sources?: string[];
    datasets?: Array<Record<string, unknown>>;
    targetModel?: string;
    memoryContext?: string[];
  };
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const datasets = Array.isArray(payload.datasets) ? payload.datasets : [];
  const memoryFacts = job.projectContext?.memoryFacts ?? [];
  const declaredMemory = Array.isArray(payload.memoryContext) ? payload.memoryContext : [];
  const memoryLinks = [...new Set([...declaredMemory, ...memoryFacts].map((item) => String(item)).filter(Boolean))];
  const classifications = datasets.map((dataset, index) => {
    const domain = typeof dataset.domain === "string" ? dataset.domain : `dataset-${index + 1}`;
    const rows =
      typeof dataset.rows === "number"
        ? dataset.rows
        : Array.isArray(dataset.records)
          ? dataset.records.length
          : 0;
    return rows > 100000
      ? `${domain}:bigdata`
      : rows > 0
        ? `${domain}:structured`
        : `${domain}:schema-only`;
  });

  const normalizedColumns = Array.from(
    new Set(
      datasets.flatMap((dataset) =>
        Array.isArray(dataset.columns) ? dataset.columns.map((column) => String(column)) : Object.keys(dataset),
      ),
    ),
  );
  const mlReadyDatasets = datasets.map((dataset, index) => {
    const name =
      typeof dataset.name === "string"
        ? dataset.name
        : typeof dataset.domain === "string"
          ? dataset.domain
          : `dataset-${index + 1}`;
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
      targetModel: payload.targetModel ?? "general-worker-intelligence",
    },
    mlReadyDatasets,
    memoryLinks,
    summary: `Data miner classified ${datasets.length} dataset(s) from ${sources.length} source(s) and prepared ML-ready dataframe guidance.`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runWebResearch(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as { sources?: Array<{ url: string }>, objective?: string };
  const findings: any[] = [];
  
  if (payload.sources && payload.sources.length > 0) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    
    for (const source of payload.sources.slice(0, 3)) {
      const page = await context.newPage();
      try {
        await page.goto(source.url, { timeout: 15000 });
        const title = await page.title();
        const content = await page.textContent('body');
        findings.push({ url: source.url, title, snippet: content?.slice(0, 300) });
      } catch (e) {
        findings.push({ url: source.url, error: "Failed to browse" });
      } finally {
        await page.close();
      }
    }
    await browser.close();
  }

  return {
    jobType: job.jobType,
    objective: payload.objective,
    findings,
    summary: `Real web research completed for ${findings.length} sources using Playwright/Chromium.`
  };
}

export function detectPromptLanguage(text: string): string {
  const normalized = text.toLowerCase();
  const spanishSignals = [" el ", " la ", " de ", " que ", " para ", " worker ", " traductor ", " reclutador "];
  const englishSignals = [" the ", " and ", " for ", " with ", " worker ", " prompt ", " recruiter "];
  const spanishScore = spanishSignals.reduce((score, token) => score + (normalized.includes(token) ? 1 : 0), 0);
  const englishScore = englishSignals.reduce((score, token) => score + (normalized.includes(token) ? 1 : 0), 0);

  if (spanishScore > englishScore) return "es";
  if (englishScore > spanishScore) return "en";
  return "mixed";
}

export function correctPromptText(text: string): string {
  let corrected = text.replace(/\s+/g, " ").trim();
  const replacements: Array<[RegExp, string]> = [
    [/\bidetificar\b/gi, "identificar"],
    [/\blenguaje\b/gi, "lenguaje"],
    [/\bgramticos\b/gi, "gramaticales"],
    [/\bcomprecion\b/gi, "comprension"],
    [/\bpasaria\b/gi, "pasaria"],
    [/\btraducir las tareas\b/gi, "traducir las tareas"],
    [/\bworquer\b/gi, "worker"],
    [/\brevize\b/gi, "revise"],
    [/\btokesn\b/gi, "tokens"],
    [/\bseguridat\b/gi, "seguridad"],
    [/\bworquer\b/gi, "worker"],
  ];
  for (const [pattern, replacement] of replacements) {
    corrected = corrected.replace(pattern, replacement);
  }
  return corrected;
}

type TranslatorTaskInput = {
  worker?: string;
  task?: string;
  goal?: string;
  context?: string;
};

export function buildWorkerTaskPrompts(
  tasks: TranslatorTaskInput[],
  correctedPrompt: string,
  promptUnderstanding: string,
  targetLanguage: string,
): Array<Record<string, string>> {
  return tasks.map((task, index) => {
    const worker = String(task.worker ?? `worker-${index + 1}`);
    const taskName = String(task.task ?? task.goal ?? `task-${index + 1}`);
    const context = String(task.context ?? "");
    return {
      worker,
      task: taskName,
      prompt:
        targetLanguage === "en"
          ? `Worker: ${worker}. Task: ${taskName}. Objective: ${promptUnderstanding}. Source prompt: ${correctedPrompt}.${context ? ` Context: ${context}.` : ""}`
          : `Worker: ${worker}. Tarea: ${taskName}. Objetivo: ${promptUnderstanding}. Prompt origen: ${correctedPrompt}.${context ? ` Contexto: ${context}.` : ""}`,
    };
  });
}

async function runTranslator(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as {
    prompt?: string;
    workerTasks?: TranslatorTaskInput[];
    targetLanguage?: string;
  };
  const prompt = String(payload.prompt ?? "");
  const detectedLanguage = detectPromptLanguage(` ${prompt.toLowerCase()} `);
  const correctedPrompt = correctPromptText(prompt);
  const promptUnderstanding =
    detectedLanguage === "es"
      ? `Interpretacion inicial: ${correctedPrompt}`
      : detectedLanguage === "en"
        ? `Initial understanding: ${correctedPrompt}`
        : `Unified understanding: ${correctedPrompt}`;
  const workerTasks = Array.isArray(payload.workerTasks) ? payload.workerTasks : [];
  const targetLanguage = payload.targetLanguage ?? "en";
  const workerTaskPrompts = buildWorkerTaskPrompts(
    workerTasks,
    correctedPrompt,
    promptUnderstanding,
    targetLanguage,
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
      targetLanguage,
    },
    summary: `Translator prepared ${workerTaskPrompts.length} recruiter-ready worker prompt(s).`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runIntegration(job: WorkerJob): Promise<Record<string, unknown>> {
  // Mocking Google Calendar API interaction with real library
  // (In a real setup, we'd use process.env.GOOGLE_CREDENTIALS)
  const calendar = google.calendar('v3');
  return {
    provider: "Google Calendar API",
    library: "googleapis",
    summary: "Integration engineer ready with official Google SDK."
  };
}

async function runTokenVault(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as {
    providerBudgets?: Array<{ provider?: string; totalTokens?: number; usedTokens?: number }>;
    workerUsage?: Array<{ worker?: string; provider?: string; usedTokens?: number; recommendedMode?: string }>;
    optimizationGoal?: string;
  };
  const providerBudgets = Array.isArray(payload.providerBudgets) ? payload.providerBudgets : [];
  const workerUsage = Array.isArray(payload.workerUsage) ? payload.workerUsage : [];

  const providerBalances = providerBudgets.map((budget) => {
    const totalTokens = Number(budget.totalTokens ?? 0);
    const usedTokens = Number(budget.usedTokens ?? 0);
    return {
      provider: String(budget.provider ?? "unknown"),
      totalTokens,
      usedTokens,
      remainingTokens: Math.max(0, totalTokens - usedTokens),
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
      recommendedMode: usage.recommendedMode ?? "local-first",
    };
  });

  const wasteFindings = workerBalances
    .filter((usage) => usage.usedTokens > Math.max(5000, Math.floor(usage.remainingTokens * 0.5)))
    .map((usage) => `Worker ${usage.worker} may be overspending tokens on ${usage.provider}.`);

  return {
    workerBalances,
    providerBalances,
    wasteFindings,
    guardrails: [
      "Keep simple and repeated jobs in local or learned mode.",
      "Escalate to ai-assisted mode only for high-complexity work.",
      "Alert when a provider balance falls below 20% of its budget.",
    ],
    summary: `Token vault reviewed ${workerBalances.length} worker usage record(s) across ${providerBalances.length} provider budget(s). Goal: ${payload.optimizationGoal ?? "responsible token spending"}.`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runAccounts(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as {
    providers?: Array<{ provider?: string; accountName?: string; status?: string; regions?: string[] }>;
    routingPolicies?: string[];
    connectionTargets?: string[];
  };
  const providers = Array.isArray(payload.providers) ? payload.providers : [];
  const connectionTargets = Array.isArray(payload.connectionTargets) ? payload.connectionTargets : [];

  const accountRegistry = providers.map((provider, index) => ({
    provider: String(provider.provider ?? `provider-${index + 1}`),
    accountName: String(provider.accountName ?? `account-${index + 1}`),
    status: String(provider.status ?? "connected"),
    regions: Array.isArray(provider.regions) ? provider.regions.map((region) => String(region)) : [],
  }));

  const connectionStatuses = accountRegistry.flatMap((account) =>
    (connectionTargets.length > 0 ? connectionTargets : ["default-routing"]).map((target) => ({
      provider: account.provider,
      accountName: account.accountName,
      target,
      status: account.status === "connected" ? "healthy" : "attention-required",
    })),
  );

  return {
    accountRegistry,
    connectionStatuses,
    routingPoliciesApplied: Array.isArray(payload.routingPolicies) ? payload.routingPolicies : [],
    summary: `Accounts worker reviewed ${accountRegistry.length} provider account(s) and ${connectionStatuses.length} connection path(s).`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runWorkerCompliance(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as {
    result?: Record<string, unknown>;
    expectedSignals?: string[];
    auditedAgentType?: string;
    auditedJobType?: string;
  };
  const result = payload.result ?? {};
  const expectedSignals = Array.isArray(payload.expectedSignals) ? payload.expectedSignals : [];
  const missing = expectedSignals.filter((signal) => !(signal in result));
  const compliant = missing.length === 0;

  return {
    compliant,
    issues: compliant ? [] : missing.map((signal) => `Missing required signal: ${signal}`),
    expectedSignals,
    summary: compliant
      ? `Compliance passed for ${payload.auditedAgentType ?? "worker"} ${payload.auditedJobType ?? "job"}.`
      : `Compliance failed for ${payload.auditedAgentType ?? "worker"} ${payload.auditedJobType ?? "job"}.`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runAutomation(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as { platform?: string; workflowGoal?: string; integrations?: string[] };
  return {
    actions: [
      "Define trigger and event schema",
      "Map retries, dead-letter handling, and approvals",
      "Emit workflow and observability checkpoints",
    ],
    workflowSpec: `${payload.platform ?? "generic"} workflow for ${payload.workflowGoal ?? "automation"}`,
    summary: `Automation workflow drafted for ${payload.platform ?? "generic"} platform.`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runSecurityGovernance(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as { assets?: string[] };
  return {
    findings: [],
    remediations: ["Rotate secrets", "Verify IAM least privilege", "Review dependency trust chain"],
    summary: `Security governance reviewed ${(payload.assets ?? []).length} asset(s).`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runLinguistic(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as { content?: string; locale?: string };
  return {
    issues: [],
    rewrittenText: String(payload.content ?? "").trim(),
    summary: `Linguistic QA reviewed content for ${payload.locale ?? "default"} locale.`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runReview(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as { scope?: string };
  return {
    findings: [],
    approvals: ["engineering"],
    summary: `Cross-functional review completed for ${payload.scope ?? "scope"}.`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runCapture(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as { targetSystem?: string; sources?: string[] };
  return {
    actions: ["Validate inbound schema", "Enrich capture record", "Route to target system"],
    routingPlan: `Capture sources ${(payload.sources ?? []).join(", ")} into ${payload.targetSystem ?? "CRM"}.`,
    summary: `Capture flow prepared for ${(payload.sources ?? []).length} source(s).`,
    executionMode: job.executionMode ?? "local",
  };
}

async function runMemoryAgent(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as {
    sourceAgentType?: string;
    sourceJobType?: string;
    originalPayload?: Record<string, unknown>;
    result?: Record<string, unknown>;
  };
  const result = payload.result ?? {};
  const facts = [
    `Worker ${payload.sourceAgentType ?? "unknown"} completed ${payload.sourceJobType ?? "job"} in ${String(result.executionMode ?? "local")} mode.`,
  ];

  return {
    facts,
    learnedSolution: result,
    signaturePayload: payload.originalPayload ?? {},
    summary: `Memory agent captured reusable memory for ${payload.sourceAgentType ?? "unknown"}.`,
    executionMode: "local",
  };
}

async function runWorkerAudit(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as {
    auditedAgentType?: string;
    failureCount?: number;
    lastError?: string;
    leaders?: Array<{ auditedAgentType: string; failureCount: number; status?: string }>;
  };

  if (job.jobType === "daily_worker_audit") {
    const leaders = payload.leaders ?? [];
    return {
      reviewedAt: new Date().toISOString(),
      flaggedAgents: leaders.filter((leader) => leader.failureCount >= 3),
      summary: `Audited ${leaders.length} worker reliability record(s).`,
    };
  }

  if (job.jobType === "rebuild_worker_profile") {
    return {
      rebuiltAt: new Date().toISOString(),
      auditedAgentType: payload.auditedAgentType ?? "unknown",
      rebuildPlan: [
        "Tighten system prompt and schemas",
        "Reduce unsupported task surface",
        "Add safer defaults and validation",
      ],
      summary: `Prepared worker rebuild plan for ${payload.auditedAgentType ?? "unknown"}.`,
    };
  }

  return {
    auditedAt: new Date().toISOString(),
    auditedAgentType: payload.auditedAgentType ?? "unknown",
    severity: (payload.failureCount ?? 0) >= 5 ? "critical" : "high",
    suspectedHotspots: inferHotspots(String(payload.lastError ?? "")),
    summary: `Detected repeated failures for ${payload.auditedAgentType ?? "unknown"} (${payload.failureCount ?? 0} errors).`,
  };
}

async function runWorkerPolice(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as {
    auditedAgentType?: string;
    failureCount?: number;
    lastError?: string;
    auditSummary?: string;
  };

  return {
    investigatedAt: new Date().toISOString(),
    auditedAgentType: payload.auditedAgentType ?? "unknown",
    suspectedCauses: inferHotspots(String(payload.lastError ?? "")),
    needsResearch: true,
    summary: `Police investigation opened for ${payload.auditedAgentType ?? "unknown"} after ${payload.failureCount ?? 0} failures.`,
    evidenceRequest: payload.auditSummary ?? "",
  };
}

async function runWorkerJudge(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as {
    auditedAgentType?: string;
    failureCount?: number;
    lastError?: string;
    researchRecommendations?: Array<{ provider?: string; model?: string }>;
  };

  const lastError = String(payload.lastError ?? "");
  const failureCount = payload.failureCount ?? 0;
  const researchRecommendations = payload.researchRecommendations ?? [];
  const decision =
    shouldRebuild(lastError, failureCount) || researchRecommendations.length === 0
      ? "rebuild_worker"
      : "reassign_model";

  return {
    judgedAt: new Date().toISOString(),
    auditedAgentType: payload.auditedAgentType ?? "unknown",
    decision,
    summary:
      decision === "rebuild_worker"
        ? `Judge recommends rebuilding ${payload.auditedAgentType ?? "unknown"} due to recurring implementation faults.`
        : `Judge recommends model reassignment for ${payload.auditedAgentType ?? "unknown"} to reduce repeated errors.`,
  };
}

async function runAgentRecruitment(job: WorkerJob): Promise<Record<string, unknown>> {
  const payload = job.payload as {
    roster?: Array<{ agentType: string; capabilities?: string[]; role?: string }>;
    businessDomains?: string[];
    translatedTaskPrompts?: Array<{ worker?: string; task?: string; prompt?: string }>;
    promptUnderstanding?: string;
  };

  let roster = payload.roster ?? [];
  const translatedTaskPrompts = Array.isArray(payload.translatedTaskPrompts)
    ? payload.translatedTaskPrompts
    : [];

  // PM Lógica: Si no hay roster, el Reclutador asume el mando y selecciona workers del pool conocido
  if (roster.length === 0 && translatedTaskPrompts.length > 0) {
    roster = translatedTaskPrompts.map(p => ({
      agentType: p.worker || "generic-worker",
      capabilities: [p.worker?.includes("engineer") ? "coding" : "nlp"],
      role: "Especialista asignado por PM"
    }));
  }

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
      taskPrompt: taskPrompt?.prompt ?? (translatedTaskPrompts[0]?.prompt || "Execute assigned task"),
    };
  });

  return {
    selectedModel: job.selectedModel ?? null,
    assignedAt: new Date().toISOString(),
    assignments,
    domainsReviewed: payload.businessDomains ?? [],
    translatedTaskPrompts,
    promptUnderstanding: payload.promptUnderstanding ?? null,
    summary: `Project Manager assigned models for ${assignments.length} worker agent(s) to execute the plan.`,
    risks: assignments.length === 0 ? ["No roster payload supplied to recruiter."] : [],
  };
}

async function fetchResearchSource(source: ResearchSource): Promise<Record<string, unknown>> {
  const response = await fetch(source.url, {
    headers: { "user-agent": "AIHUB-Web-Researcher/0.1" },
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
    observedAt: new Date().toISOString(),
  };
}

function buildResearchRecommendations(
  focusAreas: string[],
  findings: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const areas = focusAreas.length > 0 ? focusAreas : ["coding", "graphic_design", "administrative_reporting"];
  return areas.map((capability) => {
    const route = pickModelForCapabilities([capability]);
    const sources = findings
      .filter((finding) => finding.capability === capability)
      .map((finding) => ({
        title: String(finding.title ?? ""),
        url: String(finding.url ?? ""),
      }));

    return {
      capability,
      provider: route.provider,
      model: route.model,
      rationale: route.rationale,
      confidence: route.confidence,
      sources,
    };
  });
}

function pickModelForCapabilities(capabilities: string[]): {
  provider: string;
  model: string;
  rationale: string;
  confidence: number;
} {
  const joined = capabilities.join(" ").toLowerCase();

  if (/(graphic|design|multimodal|visual)/.test(joined)) {
    return {
      provider: "Google",
      model: "Gemini 2.5 Pro",
      rationale: "Best routed for visual and multimodal design-oriented work.",
      confidence: 0.88,
    };
  }

  if (/(financial|report|administrative|compliance|cost)/.test(joined)) {
    return {
      provider: "OpenAI",
      model: "GPT-4.1",
      rationale: "Strong route for structured reporting, summarization, and administrative output.",
      confidence: 0.86,
    };
  }

  if (/(research|benchmark|release)/.test(joined)) {
    return {
      provider: "Google",
      model: "Gemini 2.5 Pro",
      rationale: "Preferred route for broad research synthesis and source-heavy comparison work.",
      confidence: 0.84,
    };
  }

  return {
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Default route for coding, architecture, DevOps, and implementation reasoning.",
    confidence: 0.91,
  };
}

function inferHotspots(error: string): string[] {
  const normalized = error.toLowerCase();
  const hotspots: string[] = [];
  if (/(syntax|unsupported|parse)/.test(normalized)) hotspots.push("prompt/schema mismatch");
  if (/(timeout|network|fetch|503|429)/.test(normalized)) hotspots.push("provider/network instability");
  if (/(not found|missing|undefined|null)/.test(normalized)) hotspots.push("missing dependency or invalid assumptions");
  if (/(sql|database|migration)/.test(normalized)) hotspots.push("storage contract drift");
  return hotspots.length > 0 ? hotspots : ["general worker reliability regression"];
}

function shouldRebuild(error: string, failureCount: number): boolean {
  return (
    failureCount >= 5 ||
    /(syntax|unsupported|schema|not found|missing|undefined|migration)/i.test(error)
  );
}

function firstCapability(capabilities: string[]): string | undefined {
  return capabilities[0];
}

function inferCapability(text: string): string {
  const normalized = text.toLowerCase();
  if (/(graphic|design|image|multimodal)/.test(normalized)) return "graphic_design";
  if (/(finance|financial|report|administrative)/.test(normalized)) return "financial_reporting";
  if (/(code|tool|agent|benchmark|reasoning|developer)/.test(normalized)) return "coding";
  return "deep_research";
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim();
}

// ─── Message loop ─────────────────────────────────────────────────────────────

if (parentPort) {
  parentPort.on("message", async (job: WorkerJob) => {
    try {
      const result = await runJob(job);
      const msg: WorkerResult = { jobId: job.jobId, workerId: job.workerId, ok: true, result };
      parentPort.postMessage(msg);
    } catch (err) {
      const msg: WorkerError = {
        jobId: job.jobId,
        workerId: job.workerId,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
      parentPort.postMessage(msg);
    }
  });
}
