/**
 * DevOps helpers — pure compute, no I/O, no DB.
 * Used by: cicd-orchestrator, infra-advisor, deploy-manager,
 *           monitoring-agent, incident-responder, cost-optimizer
 */

// ─── Shared types ─────────────────────────────────────────────────────────────

export type Environment = "development" | "staging" | "production" | "dr";
export type DeployStrategy = "rolling" | "blue-green" | "canary" | "recreate";
export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "investigating" | "mitigating" | "resolved";

export interface PipelineStage {
  name: string;
  durationMs?: number;
  status: "success" | "failure" | "skipped" | "pending";
  retries?: number;
}

export interface ResourceSpec {
  name: string;
  type: "compute" | "storage" | "network" | "database" | "cache";
  region: string;
  costPerHour?: number;
  utilizationPercent?: number;
}

export interface Alert {
  name: string;
  severity: AlertSeverity;
  value: number;
  threshold: number;
  unit: string;
  firedAt: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CICD-ORCHESTRATOR helpers ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Compute total pipeline duration in milliseconds. */
export function computePipelineDuration(stages: PipelineStage[]): number {
  return stages.reduce((acc, s) => acc + (s.durationMs ?? 0), 0);
}

/** Identify the longest-running pipeline stage (bottleneck). */
export function findPipelineBottleneck(stages: PipelineStage[]): PipelineStage | null {
  if (stages.length === 0) return null;
  return stages.reduce((max, s) => (s.durationMs ?? 0) > (max.durationMs ?? 0) ? s : max, stages[0]);
}

/** Detect failed pipeline stages. */
export function detectFailedStages(stages: PipelineStage[]): PipelineStage[] {
  return stages.filter((s) => s.status === "failure");
}

/** Compute pipeline success rate from historical runs. */
export function computeSuccessRate(runs: Array<{ success: boolean }>): number {
  if (runs.length === 0) return 100;
  return Math.round((runs.filter((r) => r.success).length / runs.length) * 100);
}

/** Score pipeline health (0–100). */
export function scorePipelineHealth(params: { successRate: number; avgDurationMs: number; failedStages: number; retryCount: number }): number {
  let score = params.successRate;
  if (params.avgDurationMs > 600000) score -= 15; // >10 min is problematic
  if (params.failedStages > 0) score -= params.failedStages * 10;
  if (params.retryCount > 3) score -= (params.retryCount - 3) * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Detect stages that should be parallelized. */
export function detectSerialBottlenecks(stages: PipelineStage[]): string[] {
  const parallelizable = ["lint", "test", "unit-test", "type-check", "build-docs"];
  return stages.filter((s) => parallelizable.some((p) => s.name.toLowerCase().includes(p))).map((s) => s.name);
}

/** Generate pipeline optimization recommendations. */
export function buildPipelineRecommendations(stages: PipelineStage[]): string[] {
  const recs: string[] = [];
  const bottleneck = findPipelineBottleneck(stages);
  if (bottleneck && (bottleneck.durationMs ?? 0) > 120000) recs.push(`Split "${bottleneck.name}" stage — takes ${Math.round((bottleneck.durationMs ?? 0) / 1000)}s`);
  const slow = detectSerialBottlenecks(stages);
  if (slow.length > 1) recs.push(`Parallelize: ${slow.join(", ")}`);
  const retryHeavy = stages.filter((s) => (s.retries ?? 0) > 2);
  if (retryHeavy.length > 0) recs.push(`Fix flaky stages (${retryHeavy.map((s) => s.name).join(", ")}) instead of relying on retries`);
  return recs;
}

/** Classify CI/CD maturity level. */
export function classifyCICDMaturity(params: { hasCI: boolean; hasCD: boolean; hasAutoRollback: boolean; hasPolicyAsCode: boolean; hasDriftDetection: boolean }): { level: 1 | 2 | 3 | 4 | 5; label: string } {
  const score = Object.values(params).filter(Boolean).length;
  const levels: Record<number, { level: 1 | 2 | 3 | 4 | 5; label: string }> = {
    0: { level: 1, label: "Manual deploys" },
    1: { level: 2, label: "CI only" },
    2: { level: 3, label: "CI + CD" },
    3: { level: 4, label: "CI + CD + Rollback" },
    4: { level: 5, label: "Full GitOps with policy-as-code" },
    5: { level: 5, label: "Full GitOps with drift detection" },
  };
  return levels[Math.min(5, score)] ?? { level: 1, label: "Unknown" };
}

/** Estimate DORA metrics from pipeline data. */
export function estimateDORAMetrics(params: {
  deploysPerDay: number;
  leadTimeHours: number;
  changeFailureRate: number;
  mttrHours: number;
}): Record<string, string> {
  const freq = params.deploysPerDay > 3 ? "Elite" : params.deploysPerDay > 0.5 ? "High" : params.deploysPerDay > 0.07 ? "Medium" : "Low";
  const lt = params.leadTimeHours < 1 ? "Elite" : params.leadTimeHours < 24 ? "High" : params.leadTimeHours < 168 ? "Medium" : "Low";
  const cfr = params.changeFailureRate < 0.05 ? "Elite" : params.changeFailureRate < 0.10 ? "High" : params.changeFailureRate < 0.15 ? "Medium" : "Low";
  const mttr = params.mttrHours < 1 ? "Elite" : params.mttrHours < 24 ? "High" : params.mttrHours < 168 ? "Medium" : "Low";
  return { deploymentFrequency: freq, leadTime: lt, changeFailureRate: cfr, mttr };
}

/** Detect missing pipeline gates (required checks). */
export function detectMissingGates(stages: PipelineStage[], required: string[]): string[] {
  const stageNames = new Set(stages.map((s) => s.name.toLowerCase()));
  return required.filter((r) => !stageNames.has(r.toLowerCase()));
}

/** Build a pipeline stage dependency graph. */
export function buildStageDependencyGraph(stages: Array<{ name: string; dependsOn?: string[] }>): Record<string, string[]> {
  return Object.fromEntries(stages.map((s) => [s.name, s.dependsOn ?? []]));
}

/** Compute critical path length of a pipeline. */
export function computeCriticalPath(stages: PipelineStage[], deps: Record<string, string[]>): string[] {
  // Simple longest-path: topological order, no parallelism for now
  const order: string[] = [];
  const visited = new Set<string>();
  function visit(name: string): void {
    if (visited.has(name)) return;
    visited.add(name);
    for (const dep of deps[name] ?? []) visit(dep);
    order.push(name);
  }
  for (const s of stages) visit(s.name);
  return order;
}

/** Detect pipeline stages running without caching. */
export function detectMissingCache(stages: PipelineStage[], cacheableSteps: string[]): string[] {
  const names = stages.map((s) => s.name.toLowerCase());
  return cacheableSteps.filter((step) => names.some((n) => n.includes(step)));
}

/** Validate pipeline security: secrets exposure, privileged mode. */
export function validatePipelineSecurity(envVars: Record<string, string>): Array<{ key: string; issue: string }> {
  const issues: Array<{ key: string; issue: string }> = [];
  for (const [key, value] of Object.entries(envVars)) {
    if (/(password|secret|token|key)/i.test(key) && value.length > 3 && !value.startsWith("${{")) {
      issues.push({ key, issue: "Plaintext secret in env — use CI secrets store" });
    }
  }
  return issues;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── INFRA-ADVISOR helpers ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Detect over-provisioned resources (utilization < threshold). */
export function detectOverProvisioned(resources: ResourceSpec[], minUtilization = 20): ResourceSpec[] {
  return resources.filter((r) => (r.utilizationPercent ?? 100) < minUtilization);
}

/** Detect under-provisioned resources (utilization > threshold). */
export function detectUnderProvisioned(resources: ResourceSpec[], maxUtilization = 85): ResourceSpec[] {
  return resources.filter((r) => (r.utilizationPercent ?? 0) > maxUtilization);
}

/** Score infrastructure resilience (0–100). */
export function scoreResiliency(params: { hasMultiAZ: boolean; hasAutoScaling: boolean; hasHealthChecks: boolean; hasDR: boolean; hasBackups: boolean }): number {
  return Object.values(params).filter(Boolean).length * 20;
}

/** Detect single points of failure in resource topology. */
export function detectSinglePointsOfFailure(resources: ResourceSpec[]): string[] {
  const regionCounts = new Map<string, number>();
  for (const r of resources) regionCounts.set(r.type, (regionCounts.get(r.type) ?? 0) + 1);
  return Array.from(regionCounts.entries()).filter(([, count]) => count === 1).map(([type]) => type);
}

/** Classify infrastructure pattern. */
export function classifyInfraPattern(params: { hasContainers: boolean; hasServerless: boolean; hasBareMetl: boolean; hasIaC: boolean }): string {
  if (params.hasServerless) return "serverless";
  if (params.hasContainers && params.hasIaC) return "containerized-gitops";
  if (params.hasContainers) return "containerized";
  if (params.hasBareMetl) return "bare-metal";
  return "traditional-cloud";
}

/** Score IaC adoption (0–100). */
export function scoreIaCAdoption(params: { totalResources: number; iacManaged: number; hasDriftDetection: boolean; hasModules: boolean }): number {
  if (params.totalResources === 0) return 0;
  let score = Math.round((params.iacManaged / params.totalResources) * 70);
  if (params.hasDriftDetection) score += 20;
  if (params.hasModules) score += 10;
  return Math.min(100, score);
}

/** Recommend right-sizing for a compute resource. */
export function recommendRightSizing(resource: ResourceSpec): string {
  const util = resource.utilizationPercent ?? 50;
  if (util < 10) return `Downsize ${resource.name} — only ${util}% utilized`;
  if (util > 90) return `Upsize ${resource.name} — ${util}% utilized, near capacity`;
  return `${resource.name} is right-sized (${util}% utilization)`;
}

/** Estimate redundancy score for a deployment. */
export function scoreRedundancy(resources: ResourceSpec[]): number {
  const uniqueRegions = new Set(resources.map((r) => r.region)).size;
  const replicas = resources.length;
  return Math.min(100, uniqueRegions * 25 + Math.min(50, replicas * 10));
}

/** Detect resources without tagging/metadata (cost tracking risk). */
export function detectUntaggedResources(resources: Array<{ name: string; tags?: Record<string, string> }>): string[] {
  const requiredTags = ["env", "team", "project"];
  return resources
    .filter((r) => !r.tags || requiredTags.some((t) => !(t in r.tags!)))
    .map((r) => r.name);
}

/** Build infrastructure health report. */
export function buildInfraHealthReport(resources: ResourceSpec[]): Record<string, unknown> {
  const overProv = detectOverProvisioned(resources);
  const underProv = detectUnderProvisioned(resources);
  const spof = detectSinglePointsOfFailure(resources);
  return {
    totalResources: resources.length,
    overProvisioned: overProv.length,
    underProvisioned: underProv.length,
    singlePointsOfFailure: spof,
    healthScore: Math.max(0, 100 - overProv.length * 5 - underProv.length * 10 - spof.length * 20),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── DEPLOY-MANAGER helpers ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Select appropriate deployment strategy for given context. */
export function selectDeployStrategy(params: { hasStatefulSessions: boolean; canBlueGreen: boolean; riskTolerance: "low" | "medium" | "high"; traffic: number }): DeployStrategy {
  if (params.riskTolerance === "low" && params.canBlueGreen) return "blue-green";
  if (params.traffic > 10000 && !params.hasStatefulSessions) return "canary";
  if (params.hasStatefulSessions) return "rolling";
  return "recreate";
}

/** Compute canary traffic percentage schedule. */
export function buildCanarySchedule(totalStages: number): Array<{ stage: number; trafficPercent: number }> {
  const percentages = totalStages === 3 ? [5, 25, 100] : totalStages === 4 ? [5, 15, 50, 100] : [1, 5, 20, 50, 100];
  return percentages.slice(0, totalStages).map((p, i) => ({ stage: i + 1, trafficPercent: p }));
}

/** Validate deployment readiness checklist. */
export function validateDeploymentReadiness(checks: {
  testsPass: boolean;
  migrationReviewed: boolean;
  rollbackPlanExists: boolean;
  featureFlagsConfigured: boolean;
  monitoringAlertsDefined: boolean;
}): Array<{ check: string; passed: boolean }> {
  return Object.entries(checks).map(([check, passed]) => ({ check, passed }));
}

/** Compute blast radius of a deployment (0–100). */
export function computeDeployBlastRadius(params: { affectedServices: number; hasDataMigration: boolean; isPublicFacing: boolean; trafficPercent: number }): number {
  let radius = params.affectedServices * 10;
  if (params.hasDataMigration) radius += 30;
  if (params.isPublicFacing) radius += 20;
  radius *= params.trafficPercent / 100;
  return Math.min(100, Math.round(radius));
}

/** Build rollback plan for a deployment. */
export function buildRollbackPlan(params: { strategy: DeployStrategy; hasDataMigration: boolean; estimatedRollbackMinutes: number }): string[] {
  const steps: string[] = [];
  if (params.strategy === "blue-green") steps.push("Switch load balancer back to blue environment");
  else if (params.strategy === "canary") steps.push("Set canary traffic weight to 0%");
  else steps.push("Deploy previous stable image tag");
  if (params.hasDataMigration) {
    steps.push("Run migration rollback script (ensure idempotency)");
    steps.push("Verify data integrity after rollback");
  }
  steps.push(`Confirm rollback complete within ${params.estimatedRollbackMinutes} minutes`);
  steps.push("Post rollback incident report");
  return steps;
}

/** Detect environment drift (config differences between envs). */
export function detectEnvironmentDrift(envConfigs: Record<Environment, Record<string, string>>): Array<{ key: string; environments: string[] }> {
  const allKeys = new Set(Object.values(envConfigs).flatMap((c) => Object.keys(c)));
  const results: Array<{ key: string; environments: string[] }> = [];
  for (const key of allKeys) {
    const missingIn = Object.entries(envConfigs)
      .filter(([, cfg]) => !(key in cfg))
      .map(([env]) => env);
    if (missingIn.length > 0) results.push({ key, environments: missingIn });
  }
  return results;
}

/** Score deployment safety (0–100). */
export function scoreDeploymentSafety(params: { strategy: DeployStrategy; blastRadius: number; hasRollback: boolean; hasSmokeTest: boolean }): number {
  const strategyScore = { "blue-green": 30, "canary": 25, "rolling": 15, "recreate": 0 }[params.strategy];
  let score = strategyScore;
  score += Math.max(0, 30 - Math.round(params.blastRadius / 3));
  if (params.hasRollback) score += 25;
  if (params.hasSmokeTest) score += 15;
  return Math.min(100, score);
}

/** Build deployment checklist. */
export function buildDeploymentChecklist(env: Environment, strategy: DeployStrategy): string[] {
  const base = [
    "Verify all tests pass in CI",
    "Review and approve change request",
    "Notify on-call and stakeholders",
    "Ensure rollback plan documented",
  ];
  if (env === "production") base.push("Deploy during low-traffic window", "Monitor error rates for 30 min post-deploy");
  if (strategy === "canary") base.push("Set initial canary weight to 5%", "Monitor canary metrics before full rollout");
  if (strategy === "blue-green") base.push("Verify blue environment healthy", "Warm up green environment cache");
  return base;
}

/** Estimate deployment downtime in seconds. */
export function estimateDowntime(strategy: DeployStrategy, instanceCount: number): number {
  if (strategy === "blue-green") return 0;
  if (strategy === "canary") return 0;
  if (strategy === "rolling") return Math.round(30 / instanceCount);
  return 30 * instanceCount; // recreate
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MONITORING-AGENT helpers ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Score alert quality (0–100). */
export function scoreAlertQuality(alert: Alert): number {
  let score = 100;
  if (alert.threshold <= 0) score -= 30;
  if (!alert.unit) score -= 20;
  const age = Date.now() - new Date(alert.firedAt).getTime();
  if (age > 3600000 && alert.severity === "critical") score -= 25; // stale critical
  return Math.max(0, score);
}

/** Detect alert storms (many alerts in a short window). */
export function detectAlertStorm(alerts: Alert[], windowMinutes: number): boolean {
  const windowMs = windowMinutes * 60 * 1000;
  const now = Date.now();
  const recent = alerts.filter((a) => now - new Date(a.firedAt).getTime() < windowMs);
  return recent.length > 10;
}

/** Compute SLO compliance percentage. */
export function computeSLOCompliance(params: { target: number; measuredValue: number; isHigherBetter: boolean }): number {
  if (params.isHigherBetter) return Math.min(100, Math.round((params.measuredValue / params.target) * 100));
  return params.measuredValue <= params.target ? 100 : Math.max(0, Math.round((params.target / params.measuredValue) * 100));
}

/** Classify alert severity from metric value. */
export function classifyAlertSeverity(value: number, thresholds: { critical: number; high: number; medium: number }): AlertSeverity {
  if (value >= thresholds.critical) return "critical";
  if (value >= thresholds.high) return "high";
  if (value >= thresholds.medium) return "medium";
  return "low";
}

/** Build anomaly detection baseline from time series. */
export function computeBaseline(values: number[]): { mean: number; stdDev: number; p95: number; p99: number } {
  if (values.length === 0) return { mean: 0, stdDev: 0, p95: 0, p99: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  return {
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(Math.sqrt(variance) * 100) / 100,
    p95: sorted[Math.floor(values.length * 0.95)] ?? sorted[sorted.length - 1],
    p99: sorted[Math.floor(values.length * 0.99)] ?? sorted[sorted.length - 1],
  };
}

/** Detect anomalies using z-score method. */
export function detectAnomalies(values: number[], threshold = 3): Array<{ index: number; value: number; zScore: number }> {
  const baseline = computeBaseline(values);
  if (baseline.stdDev === 0) return [];
  return values
    .map((v, i) => ({ index: i, value: v, zScore: Math.abs((v - baseline.mean) / baseline.stdDev) }))
    .filter((entry) => entry.zScore > threshold);
}

/** Score observability coverage (0–100). */
export function scoreObservability(params: { hasMetrics: boolean; hasLogs: boolean; hasTraces: boolean; hasAlerts: boolean; hasDashboard: boolean }): number {
  return Object.values(params).filter(Boolean).length * 20;
}

/** Build alert noise reduction recommendations. */
export function buildAlertOptimizationPlan(alerts: Alert[]): string[] {
  const recs: string[] = [];
  const lowSev = alerts.filter((a) => a.severity === "low");
  if (lowSev.length > 5) recs.push(`Suppress ${lowSev.length} low-severity alerts during business hours`);
  if (detectAlertStorm(alerts, 5)) recs.push("Enable alert grouping — storm detected (>10 alerts in 5 min)");
  const stale = alerts.filter((a) => Date.now() - new Date(a.firedAt).getTime() > 7200000);
  if (stale.length > 0) recs.push(`${stale.length} alert(s) stale >2h — review thresholds`);
  return recs;
}

/** Compute error budget remaining. */
export function computeErrorBudget(sloTarget: number, measuredAvailability: number, windowDays: number): { remainingPercent: number; remainingMinutes: number } {
  const allowedDowntime = (1 - sloTarget / 100) * windowDays * 24 * 60;
  const usedDowntime = (1 - measuredAvailability / 100) * windowDays * 24 * 60;
  const remaining = Math.max(0, allowedDowntime - usedDowntime);
  return {
    remainingPercent: Math.round((remaining / allowedDowntime) * 100),
    remainingMinutes: Math.round(remaining),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── INCIDENT-RESPONDER helpers ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Classify incident priority from alert severity and scope. */
export function classifyIncidentPriority(severity: AlertSeverity, affectedUsers: number): "P1" | "P2" | "P3" | "P4" {
  if (severity === "critical" || affectedUsers > 1000) return "P1";
  if (severity === "high" || affectedUsers > 100) return "P2";
  if (severity === "medium" || affectedUsers > 10) return "P3";
  return "P4";
}

/** Build incident timeline entry. */
export function buildTimelineEntry(timestamp: string, action: string, actor: string): { timestamp: string; action: string; actor: string } {
  return { timestamp, action, actor };
}

/** Compute Mean Time to Detect (MTTD) in minutes. */
export function computeMTTD(incidentStarted: Date, firstAlertFired: Date): number {
  return Math.round((firstAlertFired.getTime() - incidentStarted.getTime()) / 60000);
}

/** Compute Mean Time to Respond (MTTR) in minutes. */
export function computeMTTR(incidentStarted: Date, incidentResolved: Date): number {
  return Math.round((incidentResolved.getTime() - incidentStarted.getTime()) / 60000);
}

/** Build incident runbook recommendation. */
export function buildIncidentRunbook(params: { category: string; severity: AlertSeverity; service: string }): string[] {
  const steps: string[] = [
    `1. Acknowledge alert for ${params.service}`,
    `2. Open incident channel #inc-${params.service.toLowerCase()}`,
    "3. Assess blast radius and affected users",
    "4. Identify root cause using recent changes",
    "5. Apply immediate mitigation (rollback/feature flag)",
    "6. Notify stakeholders with ETA",
    "7. Resolve and write postmortem",
  ];
  if (params.severity === "critical") steps.splice(1, 0, "1.5. Page on-call engineer and VP Engineering");
  return steps;
}

/** Score incident response effectiveness (0–100). */
export function scoreIncidentResponse(params: { mttdMinutes: number; mttrMinutes: number; hadRunbook: boolean; hadPostmortem: boolean }): number {
  let score = 100;
  if (params.mttdMinutes > 30) score -= Math.min(30, params.mttdMinutes - 30);
  if (params.mttrMinutes > 60) score -= Math.min(30, (params.mttrMinutes - 60) / 2);
  if (!params.hadRunbook) score -= 20;
  if (!params.hadPostmortem) score -= 20;
  return Math.max(0, Math.round(score));
}

/** Detect recurring incident patterns. */
export function detectRecurringIncidents(incidents: Array<{ category: string; service: string }>): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>();
  for (const inc of incidents) {
    const key = `${inc.service}:${inc.category}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 3)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

/** Build postmortem template. */
export function buildPostmortemTemplate(incident: { title: string; priority: string; mttrMinutes: number; rootCause: string }): string {
  return `# Postmortem: ${incident.title}

**Priority:** ${incident.priority}
**MTTR:** ${incident.mttrMinutes} minutes

## What happened
[Describe the incident]

## Root cause
${incident.rootCause}

## Timeline
| Time | Event |
|------|-------|
| | |

## Impact
- Users affected:
- Duration: ${incident.mttrMinutes} min

## Action items
| Action | Owner | Due date |
|--------|-------|----------|
| | | |

## Lessons learned
[What did we learn?]
`;
}

/** Estimate customer impact score (0–100). */
export function estimateCustomerImpact(params: { affectedUsers: number; totalUsers: number; degradationType: "full-outage" | "degraded" | "partial" }): number {
  const percentage = params.totalUsers > 0 ? params.affectedUsers / params.totalUsers : 0;
  const degradationMultiplier = params.degradationType === "full-outage" ? 1 : params.degradationType === "degraded" ? 0.6 : 0.3;
  return Math.min(100, Math.round(percentage * 100 * degradationMultiplier));
}

// ══════════════════════════════════════════════════════════════════════════════
// ── COST-OPTIMIZER helpers ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Compute estimated monthly cost for a resource. */
export function computeMonthlyCost(resource: ResourceSpec): number {
  return Math.round((resource.costPerHour ?? 0) * 730 * 100) / 100;
}

/** Detect waste: idle resources with zero or near-zero utilization. */
export function detectIdleResources(resources: ResourceSpec[]): ResourceSpec[] {
  return resources.filter((r) => (r.utilizationPercent ?? 0) < 5);
}

/** Compute potential savings from right-sizing. */
export function computePotentialSavings(resources: ResourceSpec[]): { resourceName: string; currentMonthlyCost: number; estimatedSaving: number }[] {
  return detectIdleResources(resources).map((r) => ({
    resourceName: r.name,
    currentMonthlyCost: computeMonthlyCost(r),
    estimatedSaving: Math.round(computeMonthlyCost(r) * 0.7 * 100) / 100,
  }));
}

/** Score cost efficiency (0–100). */
export function scoreCostEfficiency(resources: ResourceSpec[]): number {
  if (resources.length === 0) return 100;
  const idle = detectIdleResources(resources).length;
  const overProv = resources.filter((r) => (r.utilizationPercent ?? 100) < 20).length;
  return Math.max(0, Math.round(100 - (idle / resources.length) * 40 - (overProv / resources.length) * 30));
}

/** Classify spend by resource type. */
export function classifySpendByType(resources: ResourceSpec[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const r of resources) {
    totals[r.type] = (totals[r.type] ?? 0) + computeMonthlyCost(r);
  }
  return totals;
}

/** Detect reserved instance opportunities. */
export function detectReservedInstanceOpportunities(resources: ResourceSpec[]): ResourceSpec[] {
  return resources.filter((r) => r.type === "compute" && (r.utilizationPercent ?? 0) > 60 && (r.costPerHour ?? 0) > 0.1);
}

/** Build cost optimization report. */
export function buildCostOptimizationReport(resources: ResourceSpec[]): Record<string, unknown> {
  const savings = computePotentialSavings(resources);
  const totalSaving = savings.reduce((acc, s) => acc + s.estimatedSaving, 0);
  return {
    totalMonthlySpend: resources.reduce((acc, r) => acc + computeMonthlyCost(r), 0),
    efficiencyScore: scoreCostEfficiency(resources),
    idleResources: detectIdleResources(resources).length,
    potentialSavings: Math.round(totalSaving * 100) / 100,
    spendByType: classifySpendByType(resources),
    reservedInstanceCandidates: detectReservedInstanceOpportunities(resources).length,
    recommendations: [
      ...savings.slice(0, 3).map((s) => `Terminate/downsize ${s.resourceName} — save $${s.estimatedSaving}/mo`),
      ...detectReservedInstanceOpportunities(resources).slice(0, 2).map((r) => `Convert ${r.name} to reserved instance (1yr) for up to 40% savings`),
    ],
  };
}

/** Detect cost anomalies (spike vs baseline). */
export function detectCostAnomalies(dailyCosts: number[]): Array<{ day: number; cost: number; expected: number }> {
  if (dailyCosts.length < 7) return [];
  const baseline = dailyCosts.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  return dailyCosts
    .map((cost, i) => ({ day: i, cost, expected: baseline }))
    .filter((entry) => entry.cost > entry.expected * 1.5);
}

/** Compute cost per request/transaction. */
export function computeCostPerRequest(monthlyCost: number, monthlyRequests: number): number {
  if (monthlyRequests === 0) return 0;
  return Math.round((monthlyCost / monthlyRequests) * 1000000) / 1000000; // cost in $ per request
}
