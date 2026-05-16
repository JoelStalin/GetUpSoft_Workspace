/**
 * Data pipeline, storage, token management and account helpers.
 * Used by: data-miner, context-storage-worker, token-vault-worker, accounts-worker
 */

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface Dataset {
  name: string;
  domain: string;
  rows: number;
  columns: string[];
  hasNulls?: boolean;
  hasOutliers?: boolean;
}

export interface TokenBudget {
  provider: string;
  totalTokens: number;
  usedTokens: number;
}

export interface ProviderAccount {
  provider: string;
  accountName: string;
  status: "connected" | "disconnected" | "error";
  regions: string[];
  lastPing?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── DATA-MINER helpers ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Classify dataset size tier. */
export function classifyDatasetSize(rows: number): "micro" | "small" | "medium" | "large" | "bigdata" {
  if (rows < 100) return "micro";
  if (rows < 10000) return "small";
  if (rows < 100000) return "medium";
  if (rows < 1000000) return "large";
  return "bigdata";
}

/** Detect missing values ratio across columns. */
export function computeMissingRatio(totalRows: number, nullCount: number): number {
  if (totalRows === 0) return 0;
  return Math.round((nullCount / totalRows) * 100) / 100;
}

/** Score dataset quality (0–100). */
export function scoreDataQuality(dataset: Dataset): number {
  let score = 100;
  if (dataset.hasNulls) score -= 20;
  if (dataset.hasOutliers) score -= 15;
  if (dataset.columns.length === 0) score -= 30;
  if (dataset.rows < 10) score -= 25;
  return Math.max(0, score);
}

/** Detect duplicate column names. */
export function detectDuplicateColumns(columns: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const col of columns) {
    if (seen.has(col)) duplicates.add(col);
    seen.add(col);
  }
  return [...duplicates];
}

/** Normalize column names (snake_case). */
export function normalizeColumnNames(columns: string[]): string[] {
  return columns.map((c) =>
    c.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
  );
}

/** Infer column data type from sample value. */
export function inferColumnType(value: unknown): "string" | "number" | "boolean" | "date" | "null" | "object" {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "object") return "object";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "date";
    if (!isNaN(Number(value))) return "number";
    return "string";
  }
  return "string";
}

/** Detect high-cardinality columns (poor candidates for grouping). */
export function detectHighCardinality(columns: Array<{ name: string; distinctValues: number; totalRows: number }>): string[] {
  return columns.filter((c) => c.totalRows > 0 && c.distinctValues / c.totalRows > 0.9).map((c) => c.name);
}

/** Select feature columns for ML (exclude ID-like and high-cardinality). */
export function selectMLFeatures(columns: Array<{ name: string; distinctValues: number; totalRows: number; type: string }>): string[] {
  const idPatterns = /^(id|uuid|key|guid|_id)$/i;
  return columns
    .filter((c) => !idPatterns.test(c.name) && c.distinctValues / (c.totalRows || 1) < 0.9 && c.type !== "null")
    .map((c) => c.name);
}

/** Compute dataset join complexity. */
export function computeJoinComplexity(datasets: Dataset[]): { joins: number; estimatedRows: number } {
  if (datasets.length <= 1) return { joins: 0, estimatedRows: datasets[0]?.rows ?? 0 };
  const joins = datasets.length - 1;
  const estimatedRows = datasets.reduce((acc, d) => Math.max(acc, d.rows), 0);
  return { joins, estimatedRows };
}

/** Build ML-ready dataframe plan. */
export function buildDataframePlan(datasets: Dataset[], objective: string): Record<string, unknown> {
  const allColumns = [...new Set(datasets.flatMap((d) => d.columns))];
  const normalized = normalizeColumnNames(allColumns);
  return {
    objective,
    sourceDatasets: datasets.map((d) => d.name),
    normalizedColumns: normalized,
    estimatedRows: Math.max(...datasets.map((d) => d.rows)),
    joinComplexity: computeJoinComplexity(datasets),
    featureCandidates: normalized.filter((c) => !/(id|key|uuid)/.test(c)),
    qualityScores: Object.fromEntries(datasets.map((d) => [d.name, scoreDataQuality(d)])),
  };
}

/** Classify dataset for ML suitability. */
export function classifyMLSuitability(dataset: Dataset): "ready" | "needs-cleaning" | "insufficient-data" | "schema-only" {
  if (dataset.rows === 0) return "schema-only";
  if (dataset.rows < 100) return "insufficient-data";
  if (dataset.hasNulls || dataset.hasOutliers) return "needs-cleaning";
  return "ready";
}

/** Compute correlation between two numeric column profiles. */
export function estimateCorrelationStrength(col1Values: number[], col2Values: number[]): number {
  if (col1Values.length !== col2Values.length || col1Values.length === 0) return 0;
  const n = col1Values.length;
  const mean1 = col1Values.reduce((a, b) => a + b, 0) / n;
  const mean2 = col2Values.reduce((a, b) => a + b, 0) / n;
  const num = col1Values.reduce((acc, v, i) => acc + (v - mean1) * (col2Values[i] - mean2), 0);
  const den = Math.sqrt(
    col1Values.reduce((acc, v) => acc + (v - mean1) ** 2, 0) *
    col2Values.reduce((acc, v) => acc + (v - mean2) ** 2, 0)
  );
  return den === 0 ? 0 : Math.round((num / den) * 100) / 100;
}

/** Detect outliers using IQR method. */
export function detectOutliersIQR(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  if (q1 === undefined || q3 === undefined) return [];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return values.filter((v) => v < lower || v > upper);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CONTEXT-STORAGE-WORKER helpers ───────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Prioritize sources for indexing by change recency. */
export function prioritizeSourcesForIndexing(sources: Array<{ path: string; lastModifiedMs: number; sizeBytes: number }>): typeof sources {
  return [...sources].sort((a, b) => b.lastModifiedMs - a.lastModifiedMs);
}

/** Detect stale index entries (source not modified but index older). */
export function detectStaleIndexEntries(entries: Array<{ path: string; indexedAt: number; sourceModifiedAt: number }>): string[] {
  return entries.filter((e) => e.sourceModifiedAt > e.indexedAt).map((e) => e.path);
}

/** Compute index freshness ratio (0–1, 1=all fresh). */
export function computeIndexFreshness(entries: Array<{ indexedAt: number; sourceModifiedAt: number }>): number {
  if (entries.length === 0) return 1;
  const fresh = entries.filter((e) => e.indexedAt >= e.sourceModifiedAt).length;
  return Math.round((fresh / entries.length) * 100) / 100;
}

/** Build indexing batch plan (group by priority). */
export function buildIndexingBatchPlan(sources: string[], batchSize: number): string[][] {
  const batches: string[][] = [];
  for (let i = 0; i < sources.length; i += batchSize) {
    batches.push(sources.slice(i, i + batchSize));
  }
  return batches;
}

/** Estimate storage cost for indexing. */
export function estimateIndexStorageCost(entryCount: number, avgEntrySizeBytes: number): { totalBytes: number; totalMB: number } {
  const totalBytes = entryCount * avgEntrySizeBytes;
  return { totalBytes, totalMB: Math.round((totalBytes / 1024 / 1024) * 100) / 100 };
}

/** Detect large source files that should be chunked before indexing. */
export function detectLargeSourceFiles(sources: Array<{ path: string; sizeBytes: number }>, maxSizeBytes = 512 * 1024): string[] {
  return sources.filter((s) => s.sizeBytes > maxSizeBytes).map((s) => s.path);
}

/** Score index coverage (how many sources are fully indexed). */
export function scoreIndexCoverage(indexed: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((indexed / total) * 100);
}

/** Build deduplication key for a context entry. */
export function buildDeduplicationKey(path: string, contentHash: string): string {
  return `${path}::${contentHash.slice(0, 12)}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── TOKEN-VAULT-WORKER helpers ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Compute remaining token budget for a provider. */
export function computeRemainingBudget(budget: TokenBudget): number {
  return Math.max(0, budget.totalTokens - budget.usedTokens);
}

/** Compute budget utilization percentage. */
export function computeBudgetUtilization(budget: TokenBudget): number {
  if (budget.totalTokens === 0) return 100;
  return Math.round((budget.usedTokens / budget.totalTokens) * 100);
}

/** Detect providers with low remaining budget. */
export function detectLowBudgetProviders(budgets: TokenBudget[], threshold = 20): TokenBudget[] {
  return budgets.filter((b) => computeBudgetUtilization(b) > 100 - threshold);
}

/** Recommend execution mode based on budget. */
export function recommendExecutionMode(budget: TokenBudget, jobComplexity: "simple" | "medium" | "complex"): "local" | "learned" | "ai-assisted" {
  const utilization = computeBudgetUtilization(budget);
  if (utilization > 90) return "local";
  if (utilization > 70 && jobComplexity === "simple") return "learned";
  if (jobComplexity === "complex" && utilization < 70) return "ai-assisted";
  return "learned";
}

/** Compute cost per token for budget planning. */
export function computeCostPerToken(monthlyBudgetUSD: number, totalTokens: number): number {
  if (totalTokens === 0) return 0;
  return Math.round((monthlyBudgetUSD / totalTokens) * 1e6) / 1e6; // USD per token
}

/** Forecast token exhaustion date. */
export function forecastTokenExhaustion(budget: TokenBudget, dailyUsageRate: number): string | null {
  const remaining = computeRemainingBudget(budget);
  if (dailyUsageRate <= 0) return null;
  const daysLeft = Math.floor(remaining / dailyUsageRate);
  const date = new Date();
  date.setDate(date.getDate() + daysLeft);
  return date.toISOString().split("T")[0];
}

/** Detect token waste (ai-assisted used for simple jobs). */
export function detectTokenWaste(usages: Array<{ worker: string; mode: string; tokensUsed: number; complexity: string }>): Array<{ worker: string; wasteEstimate: number }> {
  return usages
    .filter((u) => u.mode === "ai-assisted" && u.complexity === "simple")
    .map((u) => ({ worker: u.worker, wasteEstimate: Math.round(u.tokensUsed * 0.7) }));
}

/** Build token vault summary. */
export function buildTokenVaultSummary(budgets: TokenBudget[]): Record<string, unknown> {
  const total = budgets.reduce((acc, b) => acc + b.totalTokens, 0);
  const used = budgets.reduce((acc, b) => acc + b.usedTokens, 0);
  const low = detectLowBudgetProviders(budgets);
  return {
    totalBudget: total,
    usedBudget: used,
    remainingBudget: total - used,
    overallUtilization: total > 0 ? Math.round((used / total) * 100) : 0,
    lowBudgetProviders: low.map((b) => b.provider),
    recommendation: low.length > 0 ? "Switch low-budget providers to local/learned mode" : "Budgets healthy",
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ACCOUNTS-WORKER helpers ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Compute account health score (0–100). */
export function scoreAccountHealth(account: ProviderAccount): number {
  let score = 100;
  if (account.status === "error") score -= 50;
  if (account.status === "disconnected") score -= 30;
  if (account.regions.length === 0) score -= 20;
  const stalePingMs = account.lastPing ? Date.now() - new Date(account.lastPing).getTime() : Infinity;
  if (stalePingMs > 3600000) score -= 20; // >1h since last ping
  return Math.max(0, score);
}

/** Detect disconnected provider accounts. */
export function detectDisconnectedAccounts(accounts: ProviderAccount[]): ProviderAccount[] {
  return accounts.filter((a) => a.status !== "connected");
}

/** Compute routing preference from account scores. */
export function computeRoutingPreference(accounts: ProviderAccount[]): ProviderAccount[] {
  return [...accounts]
    .filter((a) => a.status === "connected")
    .sort((a, b) => scoreAccountHealth(b) - scoreAccountHealth(a));
}

/** Detect accounts missing multi-region support. */
export function detectSingleRegionAccounts(accounts: ProviderAccount[]): ProviderAccount[] {
  return accounts.filter((a) => a.regions.length === 1);
}

/** Build account registry summary. */
export function buildAccountRegistrySummary(accounts: ProviderAccount[]): Record<string, unknown> {
  const connected = accounts.filter((a) => a.status === "connected").length;
  return {
    totalAccounts: accounts.length,
    connectedAccounts: connected,
    disconnectedAccounts: accounts.length - connected,
    avgHealthScore: accounts.length > 0
      ? Math.round(accounts.reduce((acc, a) => acc + scoreAccountHealth(a), 0) / accounts.length)
      : 0,
    preferredProvider: computeRoutingPreference(accounts)[0]?.provider ?? null,
  };
}

/** Validate account connection targets against known providers. */
export function validateConnectionTargets(targets: string[], knownProviders: string[]): { valid: string[]; unknown: string[] } {
  return {
    valid: targets.filter((t) => knownProviders.includes(t)),
    unknown: targets.filter((t) => !knownProviders.includes(t)),
  };
}

/** Detect accounts with stale ping (potentially unreachable). */
export function detectStaleAccountPings(accounts: ProviderAccount[], maxAgeMs = 3600000): ProviderAccount[] {
  return accounts.filter((a) => {
    if (!a.lastPing) return true;
    return Date.now() - new Date(a.lastPing).getTime() > maxAgeMs;
  });
}
