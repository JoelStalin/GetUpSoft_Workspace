/**
 * Governance, compliance, audit, and worker management helpers.
 * Used by: task-planner, tech-debt-tracker, onboarding-agent,
 *           worker-compliance, security-governor, worker-auditor,
 *           worker-police, worker-judge, compliance-checker
 */

// ─── Shared types ─────────────────────────────────────────────────────────────

export type Priority = "critical" | "high" | "medium" | "low";
export type ComplianceFramework = "SOC2" | "GDPR" | "HIPAA" | "ISO27001" | "PCI-DSS" | "OWASP";

export interface Task {
  id: string;
  title: string;
  estimate: number; // story points
  priority: Priority;
  tags?: string[];
  assignee?: string;
}

export interface TechDebtItem {
  id: string;
  description: string;
  effort: "small" | "medium" | "large";
  impact: "low" | "medium" | "high";
  category: "design" | "test" | "documentation" | "performance" | "security" | "dependency";
  age: number; // days
}

export interface WorkerProfile {
  agentType: string;
  failureCount: number;
  successCount: number;
  avgDurationMs: number;
  lastError?: string;
  lastRun?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── TASK-PLANNER helpers ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Compute RICE score for a task (Reach × Impact × Confidence / Effort). */
export function computeRICE(reach: number, impact: number, confidence: number, effort: number): number {
  if (effort === 0) return 0;
  return Math.round((reach * impact * (confidence / 100)) / effort);
}

/** Score task priority (0–100) from urgency and importance (Eisenhower). */
export function scoreEisenhower(urgent: boolean, important: boolean): { quadrant: string; score: number } {
  if (urgent && important) return { quadrant: "Do First", score: 100 };
  if (!urgent && important) return { quadrant: "Schedule", score: 70 };
  if (urgent && !important) return { quadrant: "Delegate", score: 40 };
  return { quadrant: "Eliminate", score: 10 };
}

/** Compute sprint capacity utilization. */
export function computeSprintUtilization(tasks: Task[], capacityPoints: number): number {
  const totalPoints = tasks.reduce((acc, t) => acc + t.estimate, 0);
  return Math.round((totalPoints / capacityPoints) * 100);
}

/** Detect over-allocated sprint (total estimate exceeds capacity). */
export function detectSprintOverallocation(tasks: Task[], capacityPoints: number): boolean {
  return tasks.reduce((acc, t) => acc + t.estimate, 0) > capacityPoints;
}

/** Rank tasks by priority weight. */
export function rankTasksByPriority(tasks: Task[]): Task[] {
  const weights: Record<Priority, number> = { critical: 100, high: 75, medium: 40, low: 15 };
  return [...tasks].sort((a, b) => weights[b.priority] - weights[a.priority]);
}

/** Group tasks by assignee. */
export function groupTasksByAssignee(tasks: Task[]): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};
  for (const task of tasks) {
    const key = task.assignee ?? "unassigned";
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  }
  return groups;
}

/** Detect tasks without assignee. */
export function detectUnassignedTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.assignee);
}

/** Compute team velocity from past sprints. */
export function computeVelocity(sprintPoints: number[]): { average: number; trend: "up" | "down" | "stable" } {
  if (sprintPoints.length === 0) return { average: 0, trend: "stable" };
  const avg = Math.round(sprintPoints.reduce((a, b) => a + b, 0) / sprintPoints.length);
  const last = sprintPoints[sprintPoints.length - 1];
  const prev = sprintPoints[sprintPoints.length - 2] ?? avg;
  const trend = last > prev * 1.1 ? "up" : last < prev * 0.9 ? "down" : "stable";
  return { average: avg, trend };
}

/** Estimate sprint completion from velocity. */
export function estimateSprintCompletion(remainingPoints: number, velocityAvg: number): number {
  if (velocityAvg === 0) return Infinity;
  return Math.ceil(remainingPoints / velocityAvg);
}

/** Build a sprint plan from backlog items. */
export function buildSprintPlan(backlog: Task[], capacityPoints: number): { selected: Task[]; overflow: Task[] } {
  const ranked = rankTasksByPriority(backlog);
  let usedPoints = 0;
  const selected: Task[] = [];
  const overflow: Task[] = [];
  for (const task of ranked) {
    if (usedPoints + task.estimate <= capacityPoints) {
      selected.push(task);
      usedPoints += task.estimate;
    } else {
      overflow.push(task);
    }
  }
  return { selected, overflow };
}

/** Detect tasks with unclear acceptance criteria. */
export function detectMissingCriteria(tasks: Array<{ title: string; description?: string; acceptanceCriteria?: string[] }>): string[] {
  return tasks.filter((t) => !t.acceptanceCriteria || t.acceptanceCriteria.length === 0).map((t) => t.title);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── TECH-DEBT-TRACKER helpers ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Compute tech debt cost (effort × age decay factor). */
export function computeDebtCost(item: TechDebtItem): number {
  const effortDays = { small: 1, medium: 3, large: 8 }[item.effort];
  const agePenalty = Math.log10(item.age + 1) * 0.5;
  return Math.round(effortDays * (1 + agePenalty) * 100) / 100;
}

/** Classify tech debt severity. */
export function classifyDebtSeverity(item: TechDebtItem): Priority {
  if (item.impact === "high" && item.category === "security") return "critical";
  if (item.impact === "high") return "high";
  if (item.impact === "medium" && item.age > 90) return "high";
  if (item.impact === "medium") return "medium";
  return "low";
}

/** Compute total tech debt in effort-days. */
export function computeTotalDebt(items: TechDebtItem[]): number {
  return Math.round(items.reduce((acc, item) => acc + computeDebtCost(item), 0) * 100) / 100;
}

/** Prioritize tech debt items by impact vs effort. */
export function prioritizeDebt(items: TechDebtItem[]): TechDebtItem[] {
  const impactScore = { high: 3, medium: 2, low: 1 };
  const effortScore = { small: 1, medium: 2, large: 3 };
  return [...items].sort((a, b) => {
    const roiA = impactScore[a.impact] / effortScore[a.effort];
    const roiB = impactScore[b.impact] / effortScore[b.effort];
    return roiB - roiA;
  });
}

/** Detect tech debt items becoming critical by age. */
export function detectAgedDebt(items: TechDebtItem[], ageLimitDays = 180): TechDebtItem[] {
  return items.filter((item) => item.age > ageLimitDays);
}

/** Group tech debt by category. */
export function groupDebtByCategory(items: TechDebtItem[]): Record<string, TechDebtItem[]> {
  const groups: Record<string, TechDebtItem[]> = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  return groups;
}

/** Build tech debt remediation sprint plan. */
export function buildDebtRemediationPlan(items: TechDebtItem[], sprintCapacityDays: number): { sprint: TechDebtItem[]; deferred: TechDebtItem[] } {
  const prioritized = prioritizeDebt(items);
  const effortMap = { small: 1, medium: 3, large: 8 };
  let used = 0;
  const sprint: TechDebtItem[] = [];
  const deferred: TechDebtItem[] = [];
  for (const item of prioritized) {
    if (used + effortMap[item.effort] <= sprintCapacityDays) {
      sprint.push(item);
      used += effortMap[item.effort];
    } else {
      deferred.push(item);
    }
  }
  return { sprint, deferred };
}

/** Score tech debt health of a codebase (0–100, higher is healthier). */
export function scoreDebtHealth(items: TechDebtItem[]): number {
  if (items.length === 0) return 100;
  const criticalCount = items.filter((i) => classifyDebtSeverity(i) === "critical").length;
  const agedCount = detectAgedDebt(items).length;
  return Math.max(0, Math.round(100 - criticalCount * 20 - agedCount * 5 - items.length * 2));
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ONBOARDING-AGENT helpers ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Build onboarding checklist for a new team member. */
export function buildOnboardingChecklist(role: string): string[] {
  const base = [
    "Set up local development environment",
    "Read architecture documentation",
    "Complete security awareness training",
    "Get access to required systems",
    "Meet with team lead for orientation",
    "Review team working agreements",
    "Complete first starter task",
  ];
  if (role === "engineer") base.push("Review codebase and run all tests", "Shadow a production deploy");
  if (role === "manager") base.push("Meet all direct reports 1:1", "Review team OKRs and roadmap");
  return base;
}

/** Estimate onboarding completion (0–100). */
export function scoreOnboardingProgress(completedItems: number, totalItems: number): number {
  if (totalItems === 0) return 100;
  return Math.round((completedItems / totalItems) * 100);
}

/** Identify missing knowledge areas from a skills matrix. */
export function detectKnowledgeGaps(required: string[], known: string[]): string[] {
  return required.filter((r) => !known.includes(r));
}

/** Assign starter tasks based on role and skill level. */
export function assignStarterTasks(role: string, level: "junior" | "mid" | "senior"): string[] {
  const tasks: Record<string, string[]> = {
    "junior-engineer": ["Fix a typo or documentation issue", "Add a unit test for an existing function", "Review a PR with a mentor"],
    "mid-engineer": ["Implement a small feature with tests", "Fix a medium-priority bug", "Write architecture decision record"],
    "senior-engineer": ["Lead a design review", "Mentor a junior on a feature", "Propose system improvement RFC"],
  };
  return tasks[`${level}-${role}`] ?? ["Read codebase and ask questions"];
}

// ══════════════════════════════════════════════════════════════════════════════
// ── WORKER-COMPLIANCE helpers ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Validate that a worker result contains all expected signals. */
export function validateResultSignals(result: Record<string, unknown>, required: string[]): { valid: boolean; missing: string[] } {
  const missing = required.filter((s) => !(s in result));
  return { valid: missing.length === 0, missing };
}

/** Score worker output quality (0–100). */
export function scoreWorkerOutput(result: Record<string, unknown>, expectedSignals: string[]): number {
  if (expectedSignals.length === 0) return 100;
  const present = expectedSignals.filter((s) => s in result && result[s] !== null && result[s] !== undefined);
  return Math.round((present.length / expectedSignals.length) * 100);
}

/** Build compliance audit record. */
export function buildComplianceRecord(params: {
  agentType: string;
  jobType: string;
  result: Record<string, unknown>;
  expectedSignals: string[];
}): Record<string, unknown> {
  const { valid, missing } = validateResultSignals(params.result, params.expectedSignals);
  return {
    auditedAt: new Date().toISOString(),
    agentType: params.agentType,
    jobType: params.jobType,
    compliant: valid,
    missingSignals: missing,
    score: scoreWorkerOutput(params.result, params.expectedSignals),
    presentSignals: params.expectedSignals.filter((s) => s in params.result),
  };
}

/** Detect schema drift between expected and actual worker output. */
export function detectSchemaDrift(expected: Record<string, string>, actual: Record<string, unknown>): Array<{ field: string; expectedType: string; actualType: string }> {
  const results: Array<{ field: string; expectedType: string; actualType: string }> = [];
  for (const [field, expectedType] of Object.entries(expected)) {
    const actualType = typeof actual[field];
    if (!(field in actual)) results.push({ field, expectedType, actualType: "missing" });
    else if (actualType !== expectedType) results.push({ field, expectedType, actualType });
  }
  return results;
}

/** Classify compliance framework gap. */
export function classifyComplianceGap(control: string, framework: ComplianceFramework): { framework: ComplianceFramework; control: string; severity: Priority } {
  const criticalControls = ["authentication", "encryption", "access-control", "audit-log"];
  const severity: Priority = criticalControls.some((c) => control.toLowerCase().includes(c)) ? "critical" : "medium";
  return { framework, control, severity };
}

/** Build compliance gap report. */
export function buildComplianceReport(gaps: Array<{ framework: ComplianceFramework; control: string; severity: Priority }>): Record<string, unknown> {
  const bySeverity = (s: Priority) => gaps.filter((g) => g.severity === s);
  return {
    totalGaps: gaps.length,
    criticalGaps: bySeverity("critical").length,
    highGaps: bySeverity("high").length,
    mediumGaps: bySeverity("medium").length,
    byFramework: Object.fromEntries(
      [...new Set(gaps.map((g) => g.framework))].map((f) => [f, gaps.filter((g) => g.framework === f).length]),
    ),
    remediationPriority: bySeverity("critical").length > 0 ? "immediate" : "planned",
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SECURITY-GOVERNOR helpers ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Score IAM least-privilege compliance. */
export function scoreIAMCompliance(permissions: Array<{ role: string; resources: string[]; actions: string[] }>): number {
  if (permissions.length === 0) return 100;
  const wildcards = permissions.filter((p) => p.resources.includes("*") || p.actions.includes("*"));
  return Math.max(0, Math.round(100 - (wildcards.length / permissions.length) * 60));
}

/** Detect over-permissive IAM roles. */
export function detectOverPermissiveRoles(permissions: Array<{ role: string; actions: string[] }>): string[] {
  return permissions.filter((p) => p.actions.includes("*") || p.actions.length > 20).map((p) => p.role);
}

/** Compute secret rotation health. */
export function scoreSecretRotation(secrets: Array<{ name: string; lastRotatedDays: number; maxAgeDays: number }>): number {
  if (secrets.length === 0) return 100;
  const stale = secrets.filter((s) => s.lastRotatedDays > s.maxAgeDays);
  return Math.max(0, Math.round(100 - (stale.length / secrets.length) * 100));
}

/** Detect stale secrets needing rotation. */
export function detectStaleSecrets(secrets: Array<{ name: string; lastRotatedDays: number; maxAgeDays: number }>): string[] {
  return secrets.filter((s) => s.lastRotatedDays > s.maxAgeDays).map((s) => s.name);
}

/** Validate network segmentation policy. */
export function validateNetworkSegmentation(flows: Array<{ from: string; to: string; allowed: boolean }>): Array<{ from: string; to: string; issue: string }> {
  const issues: Array<{ from: string; to: string; issue: string }> = [];
  for (const flow of flows) {
    if (flow.from === "internet" && flow.to === "database" && flow.allowed) {
      issues.push({ from: flow.from, to: flow.to, issue: "Direct internet → database access violates network segmentation" });
    }
  }
  return issues;
}

/** Score dependency trust chain. */
export function scoreDependencyTrust(deps: Array<{ name: string; version: string; hasKnownCVE: boolean; isMaintained: boolean }>): number {
  if (deps.length === 0) return 100;
  const vulnerable = deps.filter((d) => d.hasKnownCVE).length;
  const unmaintained = deps.filter((d) => !d.isMaintained).length;
  return Math.max(0, Math.round(100 - (vulnerable / deps.length) * 50 - (unmaintained / deps.length) * 30));
}

/** Build security governance report. */
export function buildSecurityGovernanceReport(params: {
  iamScore: number;
  secretRotationScore: number;
  dependencyTrustScore: number;
  networkIssues: number;
}): Record<string, unknown> {
  const overallScore = Math.round((params.iamScore + params.secretRotationScore + params.dependencyTrustScore) / 3);
  return {
    overallScore,
    iamScore: params.iamScore,
    secretRotationScore: params.secretRotationScore,
    dependencyTrustScore: params.dependencyTrustScore,
    networkIssues: params.networkIssues,
    riskLevel: overallScore < 60 ? "critical" : overallScore < 80 ? "high" : overallScore < 90 ? "medium" : "low",
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── WORKER-AUDITOR / WORKER-POLICE / WORKER-JUDGE helpers ─────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Compute worker reliability score (0–100). */
export function computeWorkerReliability(profile: WorkerProfile): number {
  const total = profile.successCount + profile.failureCount;
  if (total === 0) return 100;
  return Math.round((profile.successCount / total) * 100);
}

/** Classify worker health status. */
export function classifyWorkerHealth(reliability: number): "healthy" | "degraded" | "critical" | "unknown" {
  if (reliability >= 95) return "healthy";
  if (reliability >= 80) return "degraded";
  if (reliability >= 0) return "critical";
  return "unknown";
}

/** Detect workers needing intervention. */
export function detectWorkersNeedingIntervention(profiles: WorkerProfile[]): WorkerProfile[] {
  return profiles.filter((p) => {
    const reliability = computeWorkerReliability(p);
    return reliability < 80 || p.failureCount >= 3;
  });
}

/** Infer failure cause categories from error message. */
export function inferFailureCauses(lastError: string): string[] {
  const causes: string[] = [];
  const e = lastError.toLowerCase();
  if (/(prompt|schema|payload|parse|syntax)/.test(e)) causes.push("prompt-schema-mismatch");
  if (/(timeout|network|fetch|503|429|rate.?limit)/.test(e)) causes.push("provider-network-issue");
  if (/(undefined|null|not found|missing)/.test(e)) causes.push("missing-dependency");
  if (/(sql|migration|database|column)/.test(e)) causes.push("storage-contract-drift");
  if (/(memory|heap|oom)/.test(e)) causes.push("resource-exhaustion");
  return causes.length > 0 ? causes : ["general-regression"];
}

/** Determine if a worker should be rebuilt vs model-reassigned. */
export function judgeWorkerRemedy(profile: WorkerProfile, causes: string[]): "rebuild_worker" | "reassign_model" | "monitor" {
  const implementationFaults = ["prompt-schema-mismatch", "missing-dependency", "storage-contract-drift"];
  if (profile.failureCount >= 5 || causes.some((c) => implementationFaults.includes(c))) return "rebuild_worker";
  if (causes.includes("provider-network-issue") && profile.failureCount >= 3) return "reassign_model";
  return "monitor";
}

/** Build worker rebuild plan. */
export function buildWorkerRebuildPlan(agentType: string, causes: string[]): string[] {
  const steps: string[] = [`Audit ${agentType} handler in agentWorker.ts`];
  if (causes.includes("prompt-schema-mismatch")) steps.push("Review and tighten payload schema validation");
  if (causes.includes("missing-dependency")) steps.push("Add null guards for all optional payload fields");
  if (causes.includes("storage-contract-drift")) steps.push("Verify DB schema against worker assumptions");
  steps.push("Add targeted unit tests for failure scenarios");
  steps.push("Monitor for 24h after rebuild");
  return steps;
}

/** Score audit severity from failure metrics. */
export function scoreAuditSeverity(profile: WorkerProfile): { severity: "critical" | "high" | "medium" | "low"; reason: string } {
  const reliability = computeWorkerReliability(profile);
  if (reliability < 50 || profile.failureCount >= 10) return { severity: "critical", reason: `Reliability ${reliability}%, ${profile.failureCount} failures` };
  if (reliability < 80 || profile.failureCount >= 5) return { severity: "high", reason: `Reliability ${reliability}%` };
  if (reliability < 95) return { severity: "medium", reason: `Some failures detected` };
  return { severity: "low", reason: "Minor anomaly" };
}

/** Build audit report for a set of worker profiles. */
export function buildAuditReport(profiles: WorkerProfile[]): Record<string, unknown> {
  const interventionNeeded = detectWorkersNeedingIntervention(profiles);
  const avgReliability = profiles.length > 0
    ? Math.round(profiles.reduce((acc, p) => acc + computeWorkerReliability(p), 0) / profiles.length)
    : 100;
  return {
    auditedAt: new Date().toISOString(),
    totalWorkers: profiles.length,
    healthyWorkers: profiles.filter((p) => classifyWorkerHealth(computeWorkerReliability(p)) === "healthy").length,
    degradedWorkers: profiles.filter((p) => classifyWorkerHealth(computeWorkerReliability(p)) === "degraded").length,
    criticalWorkers: profiles.filter((p) => classifyWorkerHealth(computeWorkerReliability(p)) === "critical").length,
    avgReliabilityPercent: avgReliability,
    interventionRequired: interventionNeeded.map((p) => p.agentType),
    fleetHealth: avgReliability >= 95 ? "excellent" : avgReliability >= 85 ? "good" : avgReliability >= 70 ? "degraded" : "critical",
  };
}

/** Detect investigation evidence from audit context. */
export function extractInvestigationEvidence(profile: WorkerProfile): Record<string, unknown> {
  return {
    failureCount: profile.failureCount,
    successCount: profile.successCount,
    reliability: computeWorkerReliability(profile),
    suspectedCauses: inferFailureCauses(profile.lastError ?? ""),
    avgDurationMs: profile.avgDurationMs,
    lastError: profile.lastError ?? "no error recorded",
    lastRun: profile.lastRun ?? "unknown",
    verdict: judgeWorkerRemedy(profile, inferFailureCauses(profile.lastError ?? "")),
  };
}
