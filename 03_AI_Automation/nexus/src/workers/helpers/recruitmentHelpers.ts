/**
 * Agent recruitment, web research, and memory helpers.
 * Used by: agent-recruiter, web-researcher, memory-agent,
 *           review-orchestrator, capture-orchestrator, integration-engineer,
 *           workflow-automation-worker
 */

// ─── Shared types ─────────────────────────────────────────────────────────────

export type CapabilityDomain = "coding" | "design" | "research" | "reporting" | "security" | "devops" | "data" | "nlp" | "planning";

export interface AgentProfile {
  agentType: string;
  capabilities: CapabilityDomain[];
  role?: string;
  preferredProvider?: string;
  avgResponseMs?: number;
  reliabilityScore?: number;
}

export interface ModelRoute {
  provider: string;
  model: string;
  rationale: string;
  confidence: number;
}

export interface MemoryFact {
  key: string;
  value: unknown;
  source: string;
  timestamp: string;
  ttl?: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── AGENT-RECRUITER helpers ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Map capability domains to best model route. */
export function routeByCapability(capability: CapabilityDomain): ModelRoute {
  const routes: Record<CapabilityDomain, ModelRoute> = {
    coding: { provider: "Anthropic", model: "claude-sonnet-4-6", rationale: "Best for code, architecture, implementation reasoning", confidence: 0.92 },
    design: { provider: "Google", model: "gemini-2.5-pro", rationale: "Multimodal strengths for visual design work", confidence: 0.88 },
    research: { provider: "Google", model: "gemini-2.5-pro", rationale: "Strong for broad research synthesis", confidence: 0.85 },
    reporting: { provider: "OpenAI", model: "gpt-4.1", rationale: "Structured output and administrative reporting", confidence: 0.86 },
    security: { provider: "Anthropic", model: "claude-sonnet-4-6", rationale: "Conservative reasoning for security analysis", confidence: 0.90 },
    devops: { provider: "Anthropic", model: "claude-sonnet-4-6", rationale: "Strong for CI/CD, infrastructure reasoning", confidence: 0.89 },
    data: { provider: "OpenAI", model: "gpt-4.1", rationale: "Good for data analysis and structured transformations", confidence: 0.87 },
    nlp: { provider: "Anthropic", model: "claude-sonnet-4-6", rationale: "Top-tier language understanding and generation", confidence: 0.93 },
    planning: { provider: "Anthropic", model: "claude-sonnet-4-6", rationale: "Strong planning, decomposition, and reasoning", confidence: 0.91 },
  };
  return routes[capability];
}

/** Select the primary route for an agent with multiple capabilities. */
export function selectPrimaryRoute(capabilities: CapabilityDomain[]): ModelRoute {
  if (capabilities.length === 0) return routeByCapability("coding");
  const routes = capabilities.map((c) => routeByCapability(c));
  return routes.reduce((best, r) => r.confidence > best.confidence ? r : best, routes[0]);
}

/** Score agent fit for a task. */
export function scoreAgentFit(agent: AgentProfile, requiredCapabilities: CapabilityDomain[]): number {
  if (agent.capabilities.length === 0) return 0;
  if (requiredCapabilities.length === 0) return 50;
  const matched = requiredCapabilities.filter((c) => agent.capabilities.includes(c)).length;
  const capabilityScore = Math.round((matched / requiredCapabilities.length) * 70);
  const reliabilityBonus = Math.round(((agent.reliabilityScore ?? 100) / 100) * 30);
  return Math.min(100, capabilityScore + reliabilityBonus);
}

/** Detect under-specialized agents (too many capabilities = jack of all trades). */
export function detectOverloadedAgents(agents: AgentProfile[], maxCapabilities = 4): AgentProfile[] {
  return agents.filter((a) => a.capabilities.length > maxCapabilities);
}

/** Build a roster assignment map (agent → model route). */
export function buildRosterAssignment(agents: AgentProfile[]): Array<{ agentType: string; route: ModelRoute; fit: number }> {
  return agents.map((agent) => {
    const route = selectPrimaryRoute(agent.capabilities);
    return {
      agentType: agent.agentType,
      route,
      fit: scoreAgentFit(agent, agent.capabilities),
    };
  });
}

/** Detect roster gaps (missing capability coverage). */
export function detectRosterGaps(agents: AgentProfile[], requiredCapabilities: CapabilityDomain[]): CapabilityDomain[] {
  const coveredCapabilities = new Set(agents.flatMap((a) => a.capabilities));
  return requiredCapabilities.filter((c) => !coveredCapabilities.has(c));
}

/** Compute roster diversity score (number of unique capabilities covered). */
export function computeRosterDiversity(agents: AgentProfile[]): number {
  const allCapabilities: CapabilityDomain[] = ["coding", "design", "research", "reporting", "security", "devops", "data", "nlp", "planning"];
  const covered = new Set(agents.flatMap((a) => a.capabilities));
  return Math.round((covered.size / allCapabilities.length) * 100);
}

/** Recommend additional agents for uncovered domains. */
export function recommendAdditionalAgents(gaps: CapabilityDomain[]): Array<{ agentType: string; capability: CapabilityDomain }> {
  const recommendations: Record<CapabilityDomain, string> = {
    coding: "code-reviewer",
    design: "ui-designer",
    research: "web-researcher",
    reporting: "doc-writer",
    security: "security-scanner",
    devops: "cicd-orchestrator",
    data: "data-miner",
    nlp: "linguistic-qa",
    planning: "task-planner",
  };
  return gaps.map((gap) => ({ agentType: recommendations[gap], capability: gap }));
}

/** Score recruitment completeness (0–100). */
export function scoreRecruitmentCompleteness(agents: AgentProfile[], requiredCapabilities: CapabilityDomain[]): number {
  const gaps = detectRosterGaps(agents, requiredCapabilities);
  return Math.max(0, Math.round(((requiredCapabilities.length - gaps.length) / requiredCapabilities.length) * 100));
}

// ══════════════════════════════════════════════════════════════════════════════
// ── WEB-RESEARCHER helpers ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Extract title from HTML content. */
export function extractHTMLTitle(html: string): string | null {
  return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null;
}

/** Extract meta description from HTML. */
export function extractMetaDescription(html: string): string | null {
  return html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? null;
}

/** Strip HTML tags to get readable text. */
export function stripHTML(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract snippet from HTML (meta or first 400 chars of body text). */
export function extractSnippet(html: string, maxLength = 400): string {
  const meta = extractMetaDescription(html);
  if (meta) return meta.slice(0, maxLength);
  return stripHTML(html).slice(0, maxLength);
}

/** Infer research capability domain from page content. */
export function inferResearchDomain(text: string): CapabilityDomain {
  const t = text.toLowerCase();
  if (/(graphic|design|figma|sketch|ui|ux|visual)/.test(t)) return "design";
  if (/(finance|financial|report|budget|compliance)/.test(t)) return "reporting";
  if (/(security|vulnerability|cve|owasp|exploit)/.test(t)) return "security";
  if (/(devops|ci|cd|deploy|kubernetes|docker)/.test(t)) return "devops";
  if (/(data|dataset|ml|machine.?learning|model)/.test(t)) return "data";
  if (/(nlp|language|translation|sentiment)/.test(t)) return "nlp";
  if (/(benchmark|research|comparison|survey)/.test(t)) return "research";
  return "coding";
}

/** Score research source quality (0–100). */
export function scoreResearchSourceQuality(params: { hasTitle: boolean; hasDescription: boolean; domainRelevant: boolean; contentLength: number; url: string }): number {
  let score = 0;
  if (params.hasTitle) score += 20;
  if (params.hasDescription) score += 20;
  if (params.domainRelevant) score += 30;
  if (params.contentLength > 200) score += 15;
  if (/(arxiv|github|official|docs|research)/.test(params.url)) score += 15;
  return Math.min(100, score);
}

/** Deduplicate research findings by URL. */
export function deduplicateFindings(findings: Array<{ url: string; title: string; snippet: string }>): typeof findings {
  const seen = new Set<string>();
  return findings.filter((f) => {
    if (seen.has(f.url)) return false;
    seen.add(f.url);
    return true;
  });
}

/** Build model recommendation from research findings. */
export function buildModelRecommendationFromResearch(findings: Array<{ capability: string; provider: string; model: string; confidence: number }>): ModelRoute[] {
  const byCapability = new Map<string, typeof findings[0]>();
  for (const f of findings) {
    const existing = byCapability.get(f.capability);
    if (!existing || f.confidence > existing.confidence) byCapability.set(f.capability, f);
  }
  return Array.from(byCapability.values()).map((f) => ({
    provider: f.provider,
    model: f.model,
    rationale: `Research-backed recommendation for ${f.capability}`,
    confidence: f.confidence,
  }));
}

/** Validate URL format. */
export function isValidURL(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

/** Build search query from focus areas. */
export function buildSearchQuery(focusAreas: string[], year?: number): string {
  const yearStr = year ? ` ${year}` : "";
  return focusAreas.join(" ") + yearStr + " best models benchmark comparison";
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MEMORY-AGENT helpers ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Build a memory fact from a worker result. */
export function buildMemoryFact(source: string, key: string, value: unknown): MemoryFact {
  return { key, value, source, timestamp: new Date().toISOString() };
}

/** Compute memory fact staleness (ms since creation). */
export function computeFactAge(fact: MemoryFact): number {
  return Date.now() - new Date(fact.timestamp).getTime();
}

/** Detect stale memory facts past TTL. */
export function detectStaleFacts(facts: MemoryFact[]): MemoryFact[] {
  return facts.filter((f) => {
    if (!f.ttl) return false;
    return computeFactAge(f) > f.ttl * 1000;
  });
}

/** Build a memory signature for deduplication. */
export function buildFactSignature(fact: MemoryFact): string {
  return `${fact.source}::${fact.key}::${JSON.stringify(fact.value).slice(0, 64)}`;
}

/** Merge duplicate facts (keep most recent). */
export function mergeDuplicateFacts(facts: MemoryFact[]): MemoryFact[] {
  const byKey = new Map<string, MemoryFact>();
  for (const f of facts) {
    const existing = byKey.get(f.key);
    if (!existing || new Date(f.timestamp) > new Date(existing.timestamp)) byKey.set(f.key, f);
  }
  return [...byKey.values()];
}

/** Extract reusable solution pattern from a job result. */
export function extractLearnedSolution(result: Record<string, unknown>): Record<string, unknown> {
  const { executionMode: _, ...rest } = result;
  void _;
  return rest;
}

/** Score memory relevance for a given context. */
export function scoreMemoryRelevance(fact: MemoryFact, contextKeywords: string[]): number {
  const factText = JSON.stringify(fact).toLowerCase();
  const matched = contextKeywords.filter((k) => factText.includes(k.toLowerCase())).length;
  return contextKeywords.length > 0 ? Math.round((matched / contextKeywords.length) * 100) : 0;
}

/** Build memory pointer envelope. */
export function buildPointerEnvelope(params: { workspaceId: string; agentType: string; pointers: string[] }): Record<string, unknown> {
  return {
    envelopeId: `${params.workspaceId}-${params.agentType}-${Date.now()}`,
    workspaceId: params.workspaceId,
    agentType: params.agentType,
    pointers: params.pointers,
    createdAt: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── REVIEW-ORCHESTRATOR helpers ───────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Build a cross-functional review checklist. */
export function buildCrossFunctionalChecklist(scope: string): string[] {
  return [
    `Engineering: Technical correctness and test coverage for "${scope}"`,
    "Security: No new vulnerabilities introduced",
    "Performance: No regression in critical paths",
    "Product: Meets acceptance criteria",
    "Documentation: Public APIs documented",
  ];
}

/** Compute review approval status. */
export function computeApprovalStatus(approvals: string[], required: string[]): { approved: boolean; pending: string[] } {
  const pending = required.filter((r) => !approvals.includes(r));
  return { approved: pending.length === 0, pending };
}

/** Score review quality. */
export function scoreReviewQuality(params: { commentCount: number; approvalCount: number; requiredApprovals: number; hasSecurity: boolean; hasPerf: boolean }): number {
  let score = Math.min(40, params.commentCount * 5);
  score += Math.round((params.approvalCount / params.requiredApprovals) * 40);
  if (params.hasSecurity) score += 10;
  if (params.hasPerf) score += 10;
  return Math.min(100, score);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CAPTURE-ORCHESTRATOR helpers ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Validate inbound data schema. */
export function validateInboundSchema(data: Record<string, unknown>, required: string[]): { valid: boolean; missing: string[] } {
  const missing = required.filter((k) => !(k in data));
  return { valid: missing.length === 0, missing };
}

/** Enrich capture record with metadata. */
export function enrichCaptureRecord(data: Record<string, unknown>, metadata: Record<string, unknown>): Record<string, unknown> {
  return { ...data, ...metadata, capturedAt: new Date().toISOString() };
}

/** Build routing plan for a capture source. */
export function buildCaptureRoutingPlan(sources: string[], targetSystem: string): Array<{ source: string; target: string; transform: string }> {
  return sources.map((source) => ({
    source,
    target: targetSystem,
    transform: `normalize_${source.toLowerCase().replace(/\W+/g, "_")}`,
  }));
}

/** Score capture completeness. */
export function scoreCapturCompleteness(record: Record<string, unknown>, expectedFields: string[]): number {
  const present = expectedFields.filter((f) => f in record && record[f] !== null).length;
  return expectedFields.length > 0 ? Math.round((present / expectedFields.length) * 100) : 100;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── INTEGRATION-ENGINEER helpers ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Score integration risk (0–100). */
export function scoreIntegrationRisk(params: { systemCount: number; hasAuth: boolean; hasSchemaMismatch: boolean; isAsync: boolean }): number {
  let risk = params.systemCount * 10;
  if (!params.hasAuth) risk += 20;
  if (params.hasSchemaMismatch) risk += 25;
  if (params.isAsync) risk += 10;
  return Math.min(100, risk);
}

/** Detect integration anti-patterns. */
export function detectIntegrationAntipatterns(params: { hasDirectDBAccess: boolean; hasSharedMutableState: boolean; hasHardcodedEndpoints: boolean }): string[] {
  const antipatterns: string[] = [];
  if (params.hasDirectDBAccess) antipatterns.push("Shared DB: services should not access each other's databases");
  if (params.hasSharedMutableState) antipatterns.push("Shared mutable state: use event-driven or async messaging");
  if (params.hasHardcodedEndpoints) antipatterns.push("Hardcoded endpoints: use service discovery or environment config");
  return antipatterns;
}

/** Build integration contract spec. */
export function buildIntegrationContract(systems: string[], authType: string): Record<string, unknown> {
  return {
    systems,
    authType,
    contract: systems.map((s, i) => i < systems.length - 1 ? `${s} → ${systems[i + 1]}` : null).filter(Boolean),
    retryPolicy: { maxRetries: 3, backoffMs: 1000, jitter: true },
    timeoutMs: 30000,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── WORKFLOW-AUTOMATION-WORKER helpers ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Classify workflow trigger type. */
export function classifyTriggerType(trigger: string): "event" | "schedule" | "webhook" | "manual" | "condition" {
  if (/cron|schedule|interval|daily|weekly/.test(trigger.toLowerCase())) return "schedule";
  if (/webhook|http|api|endpoint/.test(trigger.toLowerCase())) return "webhook";
  if (/event|emit|publish|message|queue/.test(trigger.toLowerCase())) return "event";
  if (/condition|threshold|rule|when/.test(trigger.toLowerCase())) return "condition";
  return "manual";
}

/** Build workflow retry policy. */
export function buildRetryPolicy(maxRetries: number, baseBackoffMs: number): { maxRetries: number; delays: number[] } {
  const delays = Array.from({ length: maxRetries }, (_, i) => Math.round(baseBackoffMs * Math.pow(2, i)));
  return { maxRetries, delays };
}

/** Score workflow observability (0–100). */
export function scoreWorkflowObservability(params: { hasLogging: boolean; hasMetrics: boolean; hasAlerts: boolean; hasTracing: boolean }): number {
  return Object.values(params).filter(Boolean).length * 25;
}

/** Detect workflow bottlenecks (steps with no parallelism). */
export function detectWorkflowBottlenecks(steps: Array<{ name: string; parallel: boolean; durationMs: number }>): string[] {
  return steps.filter((s) => !s.parallel && s.durationMs > 5000).map((s) => s.name);
}

/** Build dead letter queue config. */
export function buildDLQConfig(workflowName: string, maxRetries: number): Record<string, unknown> {
  return {
    dlqName: `${workflowName}-dlq`,
    maxRetries,
    retentionDays: 14,
    alertOnDLQ: true,
    replayable: true,
  };
}
