/**
 * Code analysis helpers — pure compute, no I/O, no DB.
 * Used by: code-reviewer, architect-advisor, test-generator, doc-writer,
 *           bug-analyzer, refactor-advisor, security-scanner,
 *           performance-analyzer, api-designer, db-advisor
 */

// ─── Shared types ─────────────────────────────────────────────────────────────

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  rule: string;
  severity: Severity;
  line?: number;
  column?: number;
  message: string;
  suggestion?: string;
  owaspCategory?: string;
  cweId?: string;
}

export interface ArchMetrics {
  cbo: number;
  lcom: number;
  dit: number;
  wmc: number;
  fanIn: number;
  fanOut: number;
  instability: number;
  abstractness: number;
  distanceFromMainSeq: number;
}

export interface QueryAnalysis {
  hasUnboundedSelect: boolean;
  hasCartesianJoin: boolean;
  hasNonSargableFilter: boolean;
  missingIndexHints: string[];
  estimatedComplexity: "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n²)" | "O(n³)";
  score: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CODE-REVIEWER helpers ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Map severity label to numeric priority weight (higher = worse). */
export function severityWeight(s: Severity): number {
  return { critical: 100, high: 75, medium: 40, low: 15, info: 5 }[s];
}

/** Score overall severity of a list of findings (0–100). */
export function scoreSeverity(findings: Finding[]): number {
  if (findings.length === 0) return 0;
  const total = findings.reduce((acc, f) => acc + severityWeight(f.severity), 0);
  return Math.min(100, Math.round(total / findings.length));
}

/** Classify a line of code into a concern category. */
export function classifyLine(line: string): "security" | "performance" | "style" | "logic" | "unknown" {
  const l = line.toLowerCase();
  if (/(eval\(|exec\(|innerHTML|dangerouslySetInner|\.query\(.*\+|password\s*=\s*['"]|secret\s*=\s*['"])/.test(l)) return "security";
  if (/(for.*in.*\.length|setinterval|settimeout.*0|\.foreach|\.map|\.filter|\.reduce)/.test(l)) return "performance";
  if (/(console\.|todo|fixme|hack|xxx)/.test(l)) return "style";
  if (/(if.*if.*if|&&.*&&.*&&|\|\|.*\|\|.*\|\||throw new|catch\s*\(\s*\))/.test(l)) return "logic";
  return "unknown";
}

/** Detect duplicated consecutive line groups (min 3 lines). */
export function detectDuplication(lines: string[]): Array<{ startLine: number; duplicateAt: number; length: number }> {
  const results: Array<{ startLine: number; duplicateAt: number; length: number }> = [];
  const minBlock = 3;
  for (let i = 0; i < lines.length - minBlock; i++) {
    const block = lines
      .slice(i, i + minBlock)
      .map((line) => line.trim())
      .join("\n");
    for (let j = i + minBlock; j < lines.length - minBlock + 1; j++) {
      const candidate = lines
        .slice(j, j + minBlock)
        .map((line) => line.trim())
        .join("\n");
      if (block === candidate) {
        results.push({ startLine: i + 1, duplicateAt: j + 1, length: minBlock });
      }
    }
  }
  return results;
}

/** Detect methods longer than `threshold` lines (default 30). */
export function detectLongMethods(lines: string[], threshold = 30): Array<{ name: string; startLine: number; length: number }> {
  const results: Array<{ name: string; startLine: number; length: number }> = [];
  let methodStart = -1;
  let methodName = "";
  let depth = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const fnMatch = l.match(/(?:function\s+(\w+)|(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*\S+\s*)?\{)/);
    if (fnMatch && methodStart === -1) {
      methodName = fnMatch[1] ?? fnMatch[2] ?? "anonymous";
      methodStart = i;
      depth = 0;
    }
    if (methodStart !== -1) {
      depth += (l.match(/\{/g) ?? []).length;
      depth -= (l.match(/\}/g) ?? []).length;
      if (depth <= 0 && i > methodStart) {
        const length = i - methodStart + 1;
        if (length > threshold) results.push({ name: methodName, startLine: methodStart + 1, length });
        methodStart = -1;
        methodName = "";
      }
    }
  }
  return results;
}

/** Detect lines with nesting depth exceeding `maxDepth` (default 4). */
export function detectNestedConditions(lines: string[], maxDepth = 4): Array<{ line: number; depth: number }> {
  const results: Array<{ line: number; depth: number }> = [];
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    depth += (l.match(/\{/g) ?? []).length;
    depth -= (l.match(/\}/g) ?? []).length;
    if (/(if|else|for|while|switch)\s*[\(\{]/.test(l) && depth > maxDepth) {
      results.push({ line: i + 1, depth });
    }
  }
  return results;
}

/** Detect magic numbers (numeric literals not 0, 1, -1, or in const declarations). */
export function detectMagicNumbers(lines: string[]): Array<{ line: number; value: string }> {
  const results: Array<{ line: number; value: string }> = [];
  const magicRe = /(?<![a-zA-Z_$])(-?\d+\.?\d*)(?![a-zA-Z_$])/g;
  const allowed = new Set(["0", "1", "-1", "2", "100"]);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/^\s*(\/\/|\/\*|\*|const|let|var)\s/.test(l)) continue;
    let match: RegExpExecArray | null;
    while ((match = magicRe.exec(l)) !== null) {
      if (!allowed.has(match[1])) results.push({ line: i + 1, value: match[1] });
    }
    magicRe.lastIndex = 0;
  }
  return results;
}

/** Detect classes with more than `threshold` methods (God Class). */
export function detectGodClasses(lines: string[], threshold = 20): Array<{ name: string; methodCount: number; startLine: number }> {
  const results: Array<{ name: string; methodCount: number; startLine: number }> = [];
  let inClass = false;
  let className = "";
  let classStart = 0;
  let methodCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const classMatch = l.match(/class\s+(\w+)/);
    if (classMatch) {
      if (inClass && methodCount > threshold) results.push({ name: className, methodCount, startLine: classStart });
      inClass = true;
      className = classMatch[1];
      classStart = i + 1;
      methodCount = 0;
    }
    if (inClass && /(?:async\s+)?(?:public|private|protected|static)?\s+\w+\s*\(/.test(l)) methodCount++;
  }
  if (inClass && methodCount > threshold) results.push({ name: className, methodCount, startLine: classStart });
  return results;
}

/** Detect dead code patterns (unreachable after return/throw). */
export function detectDeadCode(lines: string[]): Array<{ line: number; reason: string }> {
  const results: Array<{ line: number; reason: string }> = [];
  let afterReturn = false;
  let depth = 0;
  const prevDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    const opens = (l.match(/\{/g) ?? []).length;
    const closes = (l.match(/\}/g) ?? []).length;
    if (closes > opens) { afterReturn = false; }
    depth += opens - closes;
    if (afterReturn && l && !l.startsWith("//") && !l.startsWith("*") && l !== "}") {
      results.push({ line: i + 1, reason: "Unreachable code after return/throw" });
      afterReturn = false;
    }
    if (/^\s*(return|throw)\s/.test(l) && !l.includes("=>")) afterReturn = true;
  }
  return results;
  void prevDepth;
}

/** Detect empty catch blocks (silent exception swallowing). */
export function detectEmptyCatchBlocks(lines: string[]): Array<{ line: number }> {
  const results: Array<{ line: number }> = [];
  for (let i = 0; i < lines.length - 1; i++) {
    const l = lines[i].trim();
    if (/catch\s*\([^)]*\)\s*\{/.test(l)) {
      const next = lines[i + 1]?.trim() ?? "";
      if (next === "}" || next === "") results.push({ line: i + 1 });
    }
  }
  return results;
}

/** Detect hardcoded secrets (passwords, tokens, API keys). */
export function detectHardcodedSecrets(lines: string[]): Array<{ line: number; pattern: string }> {
  const patterns: Array<[RegExp, string]> = [
    [/password\s*[:=]\s*['"][^'"]{4,}['"]/i, "hardcoded-password"],
    [/api[_-]?key\s*[:=]\s*['"][^'"]{8,}['"]/i, "hardcoded-api-key"],
    [/secret\s*[:=]\s*['"][^'"]{8,}['"]/i, "hardcoded-secret"],
    [/token\s*[:=]\s*['"][^'"]{10,}['"]/i, "hardcoded-token"],
    [/bearer\s+[a-zA-Z0-9\-._~+/]{20,}/i, "hardcoded-bearer"],
    [/private[_-]?key\s*[:=]\s*['"]{1}[^'"]{10,}['"]/i, "hardcoded-private-key"],
    [/BEGIN\s+(RSA|EC|DSA|OPENSSH)\s+PRIVATE\s+KEY/, "embedded-private-key"],
  ];
  const results: Array<{ line: number; pattern: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    for (const [re, label] of patterns) {
      if (re.test(lines[i])) results.push({ line: i + 1, pattern: label });
    }
  }
  return results;
}

/** Detect Python-style mutable default argument patterns in JS/TS. */
export function detectMutableDefaults(lines: string[]): Array<{ line: number }> {
  const results: Array<{ line: number }> = [];
  for (let i = 0; i < lines.length; i++) {
    if (/\([^)]*=\s*(\[\]|\{\}|new\s+\w+\()/.test(lines[i])) results.push({ line: i + 1 });
  }
  return results;
}

/** Detect SQL injection risk (string concatenation in SQL context). */
export function detectSQLInjectionRisk(lines: string[]): Array<{ line: number; snippet: string }> {
  const results: Array<{ line: number; snippet: string }> = [];
  const re = /(?:query|execute|run|prepare)\s*\(\s*[`'"]\s*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)[^`'"]*\$\{|[`'"]\s*\+\s*\w/i;
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) results.push({ line: i + 1, snippet: lines[i].trim().slice(0, 100) });
  }
  return results;
}

/** Detect XSS risk (innerHTML, document.write, dangerouslySetInnerHTML). */
export function detectXSSRisk(lines: string[]): Array<{ line: number; pattern: string }> {
  const patterns: Array<[RegExp, string]> = [
    [/\.innerHTML\s*=/, "innerHTML-assignment"],
    [/document\.write\s*\(/, "document.write"],
    [/dangerouslySetInnerHTML/, "react-dangerouslySetInnerHTML"],
    [/\.outerHTML\s*=/, "outerHTML-assignment"],
    [/insertAdjacentHTML\s*\(/, "insertAdjacentHTML"],
  ];
  const results: Array<{ line: number; pattern: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    for (const [re, label] of patterns) {
      if (re.test(lines[i])) results.push({ line: i + 1, pattern: label });
    }
  }
  return results;
}

/** Compute cyclomatic complexity of a code block (decision points + 1). */
export function computeCyclomaticComplexity(lines: string[]): number {
  let complexity = 1;
  const decisionRe = /\b(if|else if|for|while|case|catch|&&|\|\||\?)\b/g;
  for (const line of lines) {
    const matches = line.match(decisionRe);
    if (matches) complexity += matches.length;
  }
  return complexity;
}

/** Compute cognitive complexity (penalizes nesting, recursion, bool operators). */
export function computeCognitiveComplexity(lines: string[]): number {
  let score = 0;
  let depth = 0;
  for (const line of lines) {
    const l = line.trim();
    const opens = (l.match(/\{/g) ?? []).length;
    const closes = (l.match(/\}/g) ?? []).length;
    if (/(if|for|while|switch)\s*[\(\{]/.test(l)) { score += 1 + depth; depth++; }
    else if (/else\s*(if)?/.test(l)) score += 1;
    else if (/(&&|\|\|)/.test(l)) score += 1;
    depth += opens - closes;
    if (depth < 0) depth = 0;
  }
  return score;
}

/** Build a structured finding report sorted by severity. */
export function buildFindingReport(findings: Finding[]): {
  summary: string;
  critical: Finding[];
  high: Finding[];
  medium: Finding[];
  low: Finding[];
  info: Finding[];
  totalScore: number;
} {
  const byLevel = (s: Severity) => findings.filter((f) => f.severity === s);
  return {
    summary: `${findings.length} finding(s): ${byLevel("critical").length} critical, ${byLevel("high").length} high, ${byLevel("medium").length} medium, ${byLevel("low").length} low.`,
    critical: byLevel("critical"),
    high: byLevel("high"),
    medium: byLevel("medium"),
    low: byLevel("low"),
    info: byLevel("info"),
    totalScore: scoreSeverity(findings),
  };
}

/** Prioritize findings descending by severity weight then line number. */
export function prioritizeFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const diff = severityWeight(b.severity) - severityWeight(a.severity);
    if (diff !== 0) return diff;
    return (a.line ?? 0) - (b.line ?? 0);
  });
}

/** Detect improper null handling (chained access without optional chaining). */
export function detectImproperNullHandling(lines: string[]): Array<{ line: number; snippet: string }> {
  const results: Array<{ line: number; snippet: string }> = [];
  const re = /(\w+)\.(\w+)\.(\w+)/;
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i]) && !lines[i].includes("?.")) {
      results.push({ line: i + 1, snippet: lines[i].trim().slice(0, 80) });
    }
  }
  return results;
}

/** Detect unused variable declarations (declared but never referenced again). */
export function detectUnusedVariables(lines: string[]): Array<{ line: number; name: string }> {
  const results: Array<{ line: number; name: string }> = [];
  const declarations = new Map<string, number>();
  const declRe = /(?:const|let|var)\s+(\w+)/g;
  const allCode = lines.join("\n");

  for (let i = 0; i < lines.length; i++) {
    let match: RegExpExecArray | null;
    const re = /(?:const|let|var)\s+(\w+)/g;
    while ((match = re.exec(lines[i])) !== null) {
      declarations.set(match[1], i + 1);
    }
  }

  for (const [name, line] of declarations) {
    const usageCount = (allCode.match(new RegExp(`\\b${name}\\b`, "g")) ?? []).length;
    if (usageCount <= 1) results.push({ line, name });
  }
  void declRe;
  return results;
}

/** Detect functions with more than `threshold` parameters (default 4). */
export function detectLongParameterList(lines: string[], threshold = 4): Array<{ line: number; count: number }> {
  const results: Array<{ line: number; count: number }> = [];
  const re = /(?:function\s+\w+|(?:async\s+)?\w+)\s*\(([^)]+)\)/;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(re);
    if (match) {
      const params = match[1].split(",").filter((p) => p.trim().length > 0);
      if (params.length > threshold) results.push({ line: i + 1, count: params.length });
    }
  }
  return results;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ARCHITECT-ADVISOR helpers ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Compute Coupling Between Objects from a dependency list. */
export function computeCBO(dependencies: string[][]): number {
  const allDeps = dependencies.flat();
  const unique = new Set(allDeps);
  return unique.size;
}

/** Compute LCOM4 proxy: 1 - (shared attributes / total method pairs). */
export function computeLCOM(methodCount: number, sharedAttributeUses: number): number {
  if (methodCount <= 1) return 0;
  const pairs = (methodCount * (methodCount - 1)) / 2;
  return Math.max(0, Math.round((1 - sharedAttributeUses / pairs) * 100) / 100);
}

/** Compute Depth of Inheritance Tree from a class hierarchy map. */
export function computeDIT(hierarchy: Record<string, string | null>): Record<string, number> {
  const depths: Record<string, number> = {};
  function depth(cls: string): number {
    if (depths[cls] !== undefined) return depths[cls];
    const parent = hierarchy[cls];
    depths[cls] = parent ? 1 + depth(parent) : 0;
    return depths[cls];
  }
  for (const cls of Object.keys(hierarchy)) depth(cls);
  return depths;
}

/** Detect modules that exceed responsibility threshold (God Module). */
export function detectGodModule(modules: Array<{ name: string; exportCount: number; lineCount: number }>): Array<{ name: string; reason: string }> {
  return modules
    .filter((m) => m.exportCount > 30 || m.lineCount > 1000)
    .map((m) => ({
      name: m.name,
      reason: m.exportCount > 30 ? `Exports ${m.exportCount} symbols (threshold: 30)` : `${m.lineCount} lines (threshold: 1000)`,
    }));
}

/** Detect circular dependencies from an adjacency map. */
export function detectCircularDependency(deps: Record<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack: string[] = [];

  function dfs(node: string): void {
    if (stack.includes(node)) {
      cycles.push([...stack.slice(stack.indexOf(node)), node]);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.push(node);
    for (const dep of deps[node] ?? []) dfs(dep);
    stack.pop();
  }

  for (const node of Object.keys(deps)) dfs(node);
  return cycles;
}

/** Check SOLID principle violations (heuristic, text-based). */
export function detectViolationsSOLID(lines: string[]): Array<{ principle: string; line: number; message: string }> {
  const results: Array<{ principle: string; line: number; message: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (detectGodClasses([l]).length > 0) results.push({ principle: "SRP", line: i + 1, message: "Potential Single Responsibility violation" });
    if (/instanceof\s+\w+/.test(l)) results.push({ principle: "OCP", line: i + 1, message: "instanceof check may violate Open/Closed" });
    if (/any/.test(l) && /:\s*any/.test(l)) results.push({ principle: "LSP", line: i + 1, message: "any type may hide Liskov substitution issue" });
  }
  return results;
}

/** Score layer separation quality (0–100) based on import directions. */
export function scoreLayerSeparation(imports: Array<{ from: string; to: string }>): number {
  const layerOrder = ["domain", "application", "infrastructure", "presentation", "ui"];
  let violations = 0;
  for (const { from, to } of imports) {
    const fromIdx = layerOrder.findIndex((l) => from.toLowerCase().includes(l));
    const toIdx = layerOrder.findIndex((l) => to.toLowerCase().includes(l));
    if (fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx) violations++;
  }
  return Math.max(0, 100 - violations * 10);
}

/** Detect leaky abstractions (implementation details in public interface). */
export function detectLeakyAbstractions(interfaceLines: string[]): Array<{ line: number; pattern: string }> {
  const leakPatterns: Array<[RegExp, string]> = [
    [/SqlConnection|MongoClient|RedisClient/, "db-impl-in-interface"],
    [/HttpRequest|HttpResponse|req:\s*Request/, "http-impl-in-interface"],
    [/Buffer|ReadStream|WriteStream/, "node-impl-in-interface"],
    [/Error\s*\|\s*null/, "error-impl-exposed"],
  ];
  const results: Array<{ line: number; pattern: string }> = [];
  for (let i = 0; i < interfaceLines.length; i++) {
    for (const [re, label] of leakPatterns) {
      if (re.test(interfaceLines[i])) results.push({ line: i + 1, pattern: label });
    }
  }
  return results;
}

/** Detect anemic domain model (data classes with no behavior). */
export function detectAnemicDomain(classes: Array<{ name: string; fields: number; methods: number }>): Array<{ name: string; reason: string }> {
  return classes
    .filter((c) => c.fields > 2 && c.methods === 0)
    .map((c) => ({ name: c.name, reason: `${c.fields} fields, 0 methods — anemic model` }));
}

/** Score modularity of a module graph (0–100). */
export function scoreModularity(modules: Array<{ name: string; internalDeps: number; externalDeps: number }>): number {
  if (modules.length === 0) return 100;
  const ratios = modules.map((m) => {
    const total = m.internalDeps + m.externalDeps;
    return total === 0 ? 1 : m.internalDeps / total;
  });
  return Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100);
}

/** Detect tightly coupled module pairs (bidirectional dependency). */
export function detectTightCoupling(deps: Record<string, string[]>): Array<{ moduleA: string; moduleB: string }> {
  const pairs: Array<{ moduleA: string; moduleB: string }> = [];
  const seen = new Set<string>();
  for (const [mod, depList] of Object.entries(deps)) {
    for (const dep of depList) {
      const key = [mod, dep].sort().join("↔");
      if (!seen.has(key) && deps[dep]?.includes(mod)) {
        pairs.push({ moduleA: mod, moduleB: dep });
        seen.add(key);
      }
    }
  }
  return pairs;
}

/** Build a dependency adjacency map from import lines. */
export function buildDependencyGraph(importLines: string[]): Record<string, string[]> {
  const graph: Record<string, string[]> = {};
  for (const line of importLines) {
    const match = line.match(/from\s+['"]([^'"]+)['"]/);
    const fileMatch = line.match(/\/\/\s*file:\s*(\S+)/);
    if (match && fileMatch) {
      const src = fileMatch[1];
      if (!graph[src]) graph[src] = [];
      graph[src].push(match[1]);
    }
  }
  return graph;
}

/** Compute instability metric I = Ce / (Ca + Ce). */
export function computeInstability(afferentCoupling: number, efferentCoupling: number): number {
  const total = afferentCoupling + efferentCoupling;
  if (total === 0) return 0;
  return Math.round((efferentCoupling / total) * 100) / 100;
}

/** Compute abstractness A = abstract_types / total_types. */
export function computeAbstractness(abstractTypes: number, totalTypes: number): number {
  if (totalTypes === 0) return 0;
  return Math.round((abstractTypes / totalTypes) * 100) / 100;
}

/** Compute distance from main sequence D = |A + I - 1|. */
export function computeDistanceFromMainSeq(abstractness: number, instability: number): number {
  return Math.round(Math.abs(abstractness + instability - 1) * 100) / 100;
}

/** Classify architecture smell by metric profile. */
export function classifyArchSmell(metrics: { instability: number; abstractness: number; distance: number }): string {
  if (metrics.abstractness < 0.2 && metrics.instability < 0.2) return "zone-of-pain";
  if (metrics.abstractness > 0.8 && metrics.instability > 0.8) return "zone-of-uselessness";
  if (metrics.distance > 0.5) return "off-main-sequence";
  return "healthy";
}

/** Suggest refactoring strategy based on architecture metrics. */
export function suggestArchRefactoringStrategy(metrics: ArchMetrics): string[] {
  const suggestions: string[] = [];
  if (metrics.cbo > 10) suggestions.push("Reduce coupling: introduce interfaces or façade");
  if (metrics.lcom > 0.8) suggestions.push("Low cohesion: split class into focused units");
  if (metrics.dit > 5) suggestions.push("Deep inheritance: prefer composition over inheritance");
  if (metrics.instability > 0.8 && metrics.abstractness < 0.2) suggestions.push("Zone of Pain: increase abstraction or reduce afferent coupling");
  if (metrics.distanceFromMainSeq > 0.5) suggestions.push("Far from main sequence: rebalance abstractness/instability");
  return suggestions;
}

/** Detect Big Ball of Mud (modules with near-total coupling to all others). */
export function detectBigBallOfMud(deps: Record<string, string[]>): string[] {
  const total = Object.keys(deps).length;
  return Object.entries(deps)
    .filter(([, depList]) => depList.length > total * 0.7)
    .map(([mod]) => mod);
}

/** Score overall architectural fitness (0–100). */
export function scoreArchitecturalFitness(metrics: ArchMetrics): number {
  let score = 100;
  if (metrics.cbo > 10) score -= Math.min(30, (metrics.cbo - 10) * 2);
  if (metrics.lcom > 0.5) score -= Math.min(20, metrics.lcom * 20);
  if (metrics.dit > 4) score -= (metrics.dit - 4) * 5;
  if (metrics.distanceFromMainSeq > 0.3) score -= metrics.distanceFromMainSeq * 20;
  return Math.max(0, Math.round(score));
}

// ══════════════════════════════════════════════════════════════════════════════
// ── TEST-GENERATOR helpers ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export interface TestUnit {
  name: string;
  params: string[];
  returnType: string;
  line: number;
}

/** Extract testable function signatures from source lines. */
export function detectTestableUnits(lines: string[]): TestUnit[] {
  const units: TestUnit[] = [];
  const re = /export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*(\S+))?/;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(re);
    if (match) {
      const params = match[2].split(",").map((p) => p.trim()).filter(Boolean);
      units.push({ name: match[1], params, returnType: match[3] ?? "unknown", line: i + 1 });
    }
  }
  return units;
}

/** Generate boundary value test inputs for a numeric parameter. */
export function generateBoundaryInputs(min: number, max: number): number[] {
  return [min - 1, min, min + 1, Math.floor((min + max) / 2), max - 1, max, max + 1];
}

/** Generate null/undefined/empty test inputs for a parameter. */
export function generateNullInputs(): Array<null | undefined | "" | [] | {}> {
  return [null, undefined, "", [], {}];
}

/** Generate negative/invalid test inputs for a string parameter. */
export function generateNegativeStringInputs(): string[] {
  return ["", " ", "\n", "\t", "null", "undefined", "0", "<script>", "'; DROP TABLE--", "a".repeat(10001)];
}

/** Compute mutation score from test results. */
export function computeMutationScore(killedMutants: number, totalMutants: number): number {
  if (totalMutants === 0) return 100;
  return Math.round((killedMutants / totalMutants) * 100);
}

/** Detect test functions missing assertions. */
export function detectMissingAssertions(testLines: string[]): Array<{ testName: string; line: number }> {
  const results: Array<{ testName: string; line: number }> = [];
  let inTest = false;
  let testName = "";
  let testStart = 0;
  let hasAssert = false;

  for (let i = 0; i < testLines.length; i++) {
    const l = testLines[i];
    const testMatch = l.match(/test\s*\(\s*['"]([^'"]+)['"]/);
    if (testMatch) { inTest = true; testName = testMatch[1]; testStart = i + 1; hasAssert = false; }
    if (inTest && /(assert\.|expect\(|should\.|toBe|toEqual|deepEqual)/.test(l)) hasAssert = true;
    if (inTest && l.trim() === "});" && !hasAssert) {
      results.push({ testName, line: testStart });
      inTest = false;
    }
  }
  return results;
}

/** Classify test by scope. */
export function classifyTestType(testName: string, testBody: string): "unit" | "integration" | "e2e" {
  if (/(fetch|http|database|db|sql|redis|mongo)/i.test(testBody)) return "integration";
  if (/(browser|page\.|puppeteer|playwright|selenium)/i.test(testBody)) return "e2e";
  return "unit";
}

/** Build a test coverage matrix: unit × scenario. */
export function buildTestMatrix(units: string[], scenarios: string[]): Record<string, Record<string, boolean>> {
  const matrix: Record<string, Record<string, boolean>> = {};
  for (const unit of units) {
    matrix[unit] = {};
    for (const scenario of scenarios) matrix[unit][scenario] = false;
  }
  return matrix;
}

/** Detect test candidates likely to be flaky (timing, env, random). */
export function detectFlakyCandidates(testLines: string[]): Array<{ line: number; reason: string }> {
  const patterns: Array<[RegExp, string]> = [
    [/setTimeout|setInterval|sleep/, "timing-dependency"],
    [/Math\.random\(\)|Date\.now\(\)|new Date\(\)/, "non-deterministic-value"],
    [/process\.env\.\w+/, "env-variable-dependency"],
    [/fs\.|readFile|writeFile/, "file-system-access"],
  ];
  const results: Array<{ line: number; reason: string }> = [];
  for (let i = 0; i < testLines.length; i++) {
    for (const [re, reason] of patterns) {
      if (re.test(testLines[i])) results.push({ line: i + 1, reason });
    }
  }
  return results;
}

/** Score overall test suite quality (0–100). */
export function scoreTestQuality(params: { coverage: number; mutationScore: number; flakyCandidates: number; missingAssertions: number }): number {
  let score = (params.coverage * 0.4) + (params.mutationScore * 0.4);
  score -= params.flakyCandidates * 5;
  score -= params.missingAssertions * 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Generate edge case names for a function. */
export function generateEdgeCaseNames(fnName: string, paramNames: string[]): string[] {
  const edges: string[] = [];
  for (const p of paramNames) {
    edges.push(`${fnName}: ${p} is null`);
    edges.push(`${fnName}: ${p} is empty`);
    edges.push(`${fnName}: ${p} is maximum value`);
    edges.push(`${fnName}: ${p} is minimum value`);
    edges.push(`${fnName}: ${p} has special characters`);
  }
  edges.push(`${fnName}: all params are valid (happy path)`);
  edges.push(`${fnName}: concurrent calls don't interfere`);
  return edges;
}

/** Detect test smell patterns. */
export function detectTestSmells(testLines: string[]): Array<{ line: number; smell: string }> {
  const smells: Array<[RegExp, string]> = [
    [/test\s*\(\s*['"].*['"],\s*async\s*\(\)\s*=>\s*\{\s*\}\s*\)/, "empty-test"],
    [/assert\.ok\(true\)|expect\(true\)\.toBe\(true\)/, "trivial-assertion"],
    [/catch\s*\(\s*\)\s*\{\s*\}/, "empty-catch-in-test"],
    [/console\.log/, "console-log-in-test"],
    [/\.only\b/, "focused-test-left-in"],
    [/\.skip\b/, "skipped-test"],
  ];
  const results: Array<{ line: number; smell: string }> = [];
  for (let i = 0; i < testLines.length; i++) {
    for (const [re, smell] of smells) {
      if (re.test(testLines[i])) results.push({ line: i + 1, smell });
    }
  }
  return results;
}

/** Compute line coverage percentage. */
export function computeCoverage(totalLines: number, testedLines: number): number {
  if (totalLines === 0) return 100;
  return Math.round((testedLines / totalLines) * 100);
}

/** Prioritize test generation by risk (complexity × missing coverage). */
export function prioritizeTestGeneration(units: Array<{ name: string; complexity: number; currentCoverage: number }>): typeof units {
  return [...units].sort((a, b) => {
    const riskA = a.complexity * (1 - a.currentCoverage / 100);
    const riskB = b.complexity * (1 - b.currentCoverage / 100);
    return riskB - riskA;
  });
}

/** Build mock specification for a function's dependencies. */
export function buildMockSpec(deps: Array<{ name: string; methods: string[] }>): Record<string, string[]> {
  return Object.fromEntries(deps.map((d) => [d.name, d.methods.map((m) => `mock_${d.name}_${m}`)]));
}

// ══════════════════════════════════════════════════════════════════════════════
// ── DOC-WRITER helpers ───────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Detect exported functions/classes lacking JSDoc/TSDoc. */
export function detectUndocumentedPublicAPIs(lines: string[]): Array<{ line: number; name: string }> {
  const results: Array<{ line: number; name: string }> = [];
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    const prev = lines[i - 1]?.trim() ?? "";
    const match = l.match(/export\s+(?:async\s+)?(?:function|class|const)\s+(\w+)/);
    if (match && !prev.endsWith("*/") && !prev.startsWith("*")) {
      results.push({ line: i + 1, name: match[1] });
    }
  }
  return results;
}

/** Score documentation completeness (0–100). */
export function scoreDocCompleteness(doc: { hasDescription: boolean; hasParams: boolean; hasReturns: boolean; hasExample: boolean; hasThrows: boolean }): number {
  let score = 0;
  if (doc.hasDescription) score += 30;
  if (doc.hasParams) score += 25;
  if (doc.hasReturns) score += 20;
  if (doc.hasExample) score += 15;
  if (doc.hasThrows) score += 10;
  return score;
}

/** Extract parameter names and types from a TypeScript function signature. */
export function extractParamTypes(signature: string): Array<{ name: string; type: string; optional: boolean }> {
  const inner = signature.match(/\(([^)]*)\)/)?.[1] ?? "";
  return inner
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const optional = p.includes("?");
      const [namePart, typePart] = p.replace("?", "").split(":").map((s) => s.trim());
      return { name: namePart ?? "param", type: typePart ?? "unknown", optional };
    });
}

/** Build a JSDoc comment block for a function. */
export function buildJSDocBlock(name: string, params: Array<{ name: string; type: string }>, returnType: string, description: string): string {
  const lines = ["/**", ` * ${description}`];
  for (const p of params) lines.push(` * @param {${p.type}} ${p.name}`);
  lines.push(` * @returns {${returnType}}`);
  lines.push(" */");
  return lines.join("\n");
}

/** Build a TSDoc comment block. */
export function buildTSDocBlock(name: string, params: Array<{ name: string; description: string }>, returnDescription: string): string {
  const lines = [`/** ${name}`, ...params.map((p) => ` * @param ${p.name} - ${p.description}`), ` * @returns ${returnDescription}`, " */"];
  return lines.join("\n");
}

/** Detect potentially stale documentation (param names changed). */
export function detectStaleDoc(docParams: string[], codeParams: string[]): string[] {
  const missing = docParams.filter((p) => !codeParams.includes(p));
  const extra = codeParams.filter((p) => !docParams.includes(p));
  return [...missing.map((p) => `Doc has ${p} but code doesn't`), ...extra.map((p) => `Code has ${p} but doc doesn't`)];
}

/** Compute approximate Flesch reading ease for text (0–100, higher=easier). */
export function scoreReadability(text: string): number {
  const sentences = (text.match(/[.!?]+/g) ?? []).length || 1;
  const words = (text.match(/\b\w+\b/g) ?? []).length || 1;
  const syllables = text.replace(/[^aeiou]/gi, "").length || 1;
  return Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words))));
}

/** Detect documentation blocks without code examples. */
export function detectMissingExamples(docBlocks: string[]): number[] {
  return docBlocks.reduce<number[]>((acc, block, i) => {
    if (!/@example|```/.test(block)) acc.push(i);
    return acc;
  }, []);
}

/** Build a CHANGELOG entry from a diff summary. */
export function buildChangelogEntry(version: string, date: string, changes: Array<{ type: "added" | "changed" | "fixed" | "removed"; description: string }>): string {
  const groups = new Map<string, string[]>();
  for (const c of changes) {
    if (!groups.has(c.type)) groups.set(c.type, []);
    groups.get(c.type)!.push(`- ${c.description}`);
  }
  const lines = [`## [${version}] - ${date}`];
  for (const [type, items] of groups) {
    lines.push(`\n### ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    lines.push(...items);
  }
  return lines.join("\n");
}

/** Detect inconsistent terminology across documentation strings. */
export function detectInconsistentTerms(docs: string[], termVariants: Array<[string, string]>): Array<{ term: string; variant: string; doc: number }> {
  const results: Array<{ term: string; variant: string; doc: number }> = [];
  for (let i = 0; i < docs.length; i++) {
    for (const [preferred, variant] of termVariants) {
      if (new RegExp(`\\b${variant}\\b`, "i").test(docs[i]) && !new RegExp(`\\b${preferred}\\b`, "i").test(docs[i])) {
        results.push({ term: preferred, variant, doc: i });
      }
    }
  }
  return results;
}

/** Extract return type from TypeScript function signature. */
export function extractReturnType(signature: string): string {
  const match = signature.match(/\)\s*:\s*([^{;]+)/);
  return match?.[1]?.trim() ?? "void";
}

/** Detect functions with thrown errors not documented. */
export function detectMissingErrorDocs(lines: string[]): Array<{ line: number; error: string }> {
  const results: Array<{ line: number; error: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/throw new (\w+Error)\(/);
    if (match) {
      const docRange = lines.slice(Math.max(0, i - 10), i).join("\n");
      if (!docRange.includes("@throws") && !docRange.includes("@exception")) {
        results.push({ line: i + 1, error: match[1] });
      }
    }
  }
  return results;
}

/** Summarize a module's purpose from its exports and comments. */
export function summarizeModule(lines: string[]): string {
  const fileComment = lines.slice(0, 5).join(" ").match(/\/\*\*([^*]|\*[^/])*\*\//)?.[0] ?? "";
  const exports = lines.filter((l) => /^export/.test(l.trim())).length;
  const description = fileComment.replace(/\/\*\*|\*\/|\s*\*\s*/g, " ").trim().slice(0, 200);
  return `${description || "No file-level comment."} (${exports} export(s))`;
}

/** Score API documentation usability (0–100). */
export function scoreAPIUsability(doc: { hasDescription: boolean; hasExample: boolean; hasErrorDocs: boolean; hasTypes: boolean; wordCount: number }): number {
  let score = 0;
  if (doc.hasDescription) score += 25;
  if (doc.hasExample) score += 30;
  if (doc.hasErrorDocs) score += 20;
  if (doc.hasTypes) score += 15;
  if (doc.wordCount > 10) score += 10;
  return Math.min(100, score);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── BUG-ANALYZER helpers ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Classify bug category from error message or stack trace. */
export function classifyBugCategory(error: string): "null-pointer" | "logic" | "resource" | "concurrency" | "network" | "schema" | "unknown" {
  const e = error.toLowerCase();
  if (/(cannot read|undefined|null.*property|typeerror)/.test(e)) return "null-pointer";
  if (/(race|concurrent|mutex|lock|deadlock)/.test(e)) return "concurrency";
  if (/(timeout|econnrefused|socket|network|fetch|dns)/.test(e)) return "network";
  if (/(sql|constraint|migration|schema|column)/.test(e)) return "schema";
  if (/(memory|heap|leak|out of memory|oom)/.test(e)) return "resource";
  if (/(assertion|expect|logic|condition|branch)/.test(e)) return "logic";
  return "unknown";
}

/** Score reproducibility of a bug (0–100, higher=easier to repro). */
export function scoreReproducibility(steps: string[], hasTestCase: boolean, isFlaky: boolean): number {
  let score = steps.length > 0 ? 60 : 20;
  if (hasTestCase) score += 30;
  if (isFlaky) score -= 40;
  return Math.max(0, Math.min(100, score));
}

/** Detect off-by-one error patterns in code. */
export function detectOffByOneErrors(lines: string[]): Array<{ line: number; snippet: string }> {
  const results: Array<{ line: number; snippet: string }> = [];
  const re = /\b(\w+)\s*(>=|<=)\s*(\w+)\.(length|size|count)\b|\bfor\s*\([^;]*;\s*\w+\s*<=\s*\w+\.(length|size)/;
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) results.push({ line: i + 1, snippet: lines[i].trim().slice(0, 80) });
  }
  return results;
}

/** Detect potential race condition patterns. */
export function detectRaceConditions(lines: string[]): Array<{ line: number; pattern: string }> {
  const patterns: Array<[RegExp, string]> = [
    [/await\s+\w+\s*;\s*\n.*await\s+\w+/, "sequential-awaits-shared-state"],
    [/setInterval|setTimeout.*async/, "async-timer"],
    [/global\.\w+\s*=|module\.\w+\s*=/, "global-mutation"],
  ];
  const code = lines.join("\n");
  const results: Array<{ line: number; pattern: string }> = [];
  for (const [re, label] of patterns) {
    if (re.test(code)) results.push({ line: 0, pattern: label });
  }
  return results;
}

/** Detect unclosed resource patterns (missing finally/close). */
export function detectMemoryLeaks(lines: string[]): Array<{ line: number; resource: string }> {
  const results: Array<{ line: number; resource: string }> = [];
  const openPatterns: Array<[RegExp, string]> = [
    [/new\s+EventEmitter\(\)|\.on\(/, "EventEmitter"],
    [/setInterval\(/, "setInterval"],
    [/createReadStream|createWriteStream/, "Stream"],
    [/open\(|connect\(/, "Connection"],
  ];
  for (let i = 0; i < lines.length; i++) {
    for (const [re, resource] of openPatterns) {
      if (re.test(lines[i])) {
        const context = lines.slice(i, Math.min(lines.length, i + 20)).join("\n");
        if (!/(close\(\)|destroy\(\)|removeListener|clearInterval|finally)/.test(context)) {
          results.push({ line: i + 1, resource });
        }
      }
    }
  }
  return results;
}

/** Detect errors that are caught but silently swallowed. */
export function detectErrorSwallowing(lines: string[]): Array<{ line: number }> {
  const results: Array<{ line: number }> = [];
  for (let i = 0; i < lines.length; i++) {
    if (/catch\s*\(/.test(lines[i])) {
      const block = lines.slice(i, Math.min(lines.length, i + 5)).join("\n");
      if (!/(console\.|log\(|throw|reject\(|return|rethrow)/.test(block)) {
        results.push({ line: i + 1 });
      }
    }
  }
  return results;
}

/** Build a root cause analysis tree (5-whys). */
export function buildRootCauseTree(symptom: string, maxDepth = 3): Array<{ level: number; cause: string }> {
  const templates = [
    "What triggered: <symptom>?",
    "Why did that condition exist?",
    "What underlying assumption was wrong?",
  ];
  return templates.slice(0, maxDepth).map((t, i) => ({
    level: i + 1,
    cause: t.replace("<symptom>", symptom),
  }));
}

/** Score the blast radius of a bug (0–100). */
export function scoreBugBlastRadius(affectedFiles: number, affectedUsers: number, isProductionFacing: boolean): number {
  let score = Math.min(40, affectedFiles * 5);
  score += Math.min(40, Math.log10(affectedUsers + 1) * 15);
  if (isProductionFacing) score += 20;
  return Math.min(100, Math.round(score));
}

/** Infer likely source files from a stack trace. */
export function inferBugHotspots(stacktrace: string): string[] {
  const fileRe = /(?:at\s+\S+\s+\()?([\w/.\-\\]+\.[jt]sx?):(\d+)/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = fileRe.exec(stacktrace)) !== null) {
    matches.push(`${match[1]}:${match[2]}`);
  }
  return [...new Set(matches)].slice(0, 5);
}

/** Compute bug priority score from severity and frequency. */
export function computeBugScore(severity: Severity, frequency: number): number {
  return Math.min(100, severityWeight(severity) + Math.min(25, frequency * 5));
}

/** Detect null dereference chains. */
export function detectNullDereference(lines: string[]): Array<{ line: number; chain: string }> {
  const results: Array<{ line: number; chain: string }> = [];
  const re = /(\w+)\.(\w+)\.(\w+)(?![\w?])/;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(re);
    if (match && !lines[i].includes("?.")) {
      results.push({ line: i + 1, chain: match[0] });
    }
  }
  return results;
}

/** Build a structured bug report object. */
export function buildBugReport(params: { title: string; category: string; severity: Severity; stacktrace: string; steps: string[]; reproducibility: number }): Record<string, unknown> {
  return {
    title: params.title,
    category: params.category,
    severity: params.severity,
    priority: computeBugScore(params.severity, params.steps.length),
    hotspots: inferBugHotspots(params.stacktrace),
    reproducibility: params.reproducibility,
    steps: params.steps,
    rootCauses: buildRootCauseTree(params.title),
  };
}

/** Detect regression risk from changed files vs existing test coverage. */
export function detectRegressionRisk(changedFiles: string[], testedFiles: string[]): { file: string; risk: "high" | "medium" | "low" }[] {
  return changedFiles.map((f) => ({
    file: f,
    risk: testedFiles.includes(f) ? "low" : changedFiles.length > 10 ? "high" : "medium",
  }));
}

/** Suggest a fix strategy for a known bug category. */
export function suggestBugFix(category: ReturnType<typeof classifyBugCategory>): string {
  const strategies: Record<string, string> = {
    "null-pointer": "Add optional chaining (?.) and null guards at data boundaries",
    "concurrency": "Use mutex, atomic operations, or restructure to avoid shared mutable state",
    "network": "Add retry logic with exponential backoff and circuit breaker",
    "schema": "Run migration in transaction with rollback; validate schema before use",
    "resource": "Ensure cleanup in finally blocks or use RAII patterns",
    "logic": "Add explicit state assertions and boundary condition tests",
    "unknown": "Add comprehensive logging to narrow down the failure point",
  };
  return strategies[category] ?? strategies["unknown"];
}

// ══════════════════════════════════════════════════════════════════════════════
// ── REFACTOR-ADVISOR helpers ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Detect methods longer than threshold (refactoring candidate). */
export function detectLongMethod(lines: string[], threshold = 20): Array<{ line: number; length: number }> {
  return detectLongMethods(lines, threshold).map((m) => ({ line: m.startLine, length: m.length }));
}

/** Detect classes larger than threshold methods. */
export function detectLargeClass(methodCount: number, threshold = 15): boolean {
  return methodCount > threshold;
}

/** Detect Feature Envy: method references another class more than its own. */
export function detectFeatureEnvy(lines: string[]): Array<{ line: number; foreignClass: string }> {
  const results: Array<{ line: number; foreignClass: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(/(\w+)\.\w+\(/g) ?? [];
    const counts = new Map<string, number>();
    for (const m of matches) {
      const cls = m.split(".")[0];
      counts.set(cls, (counts.get(cls) ?? 0) + 1);
    }
    for (const [cls, count] of counts) {
      if (count > 3 && cls !== "this") results.push({ line: i + 1, foreignClass: cls });
    }
  }
  return results;
}

/** Detect data clumps (same parameter group appearing 3+ times). */
export function detectDataClumps(signatures: string[]): Array<{ params: string[]; occurrences: number }> {
  const groups = new Map<string, number>();
  for (const sig of signatures) {
    const params = (sig.match(/\(([^)]+)\)/)?.[1] ?? "").split(",").map((p) => p.trim().split(":")[0].trim()).sort();
    if (params.length >= 3) {
      const key = params.join(",");
      groups.set(key, (groups.get(key) ?? 0) + 1);
    }
  }
  return Array.from(groups.entries())
    .filter(([, count]) => count >= 3)
    .map(([key, occurrences]) => ({ params: key.split(","), occurrences }));
}

/** Detect primitive obsession (too many primitive params). */
export function detectPrimitiveObsession(params: Array<{ name: string; type: string }>): boolean {
  const primitives = new Set(["string", "number", "boolean", "any"]);
  const primitiveCount = params.filter((p) => primitives.has(p.type.toLowerCase())).length;
  return params.length >= 4 && primitiveCount / params.length > 0.75;
}

/** Detect switch statements that could be replaced with polymorphism. */
export function detectSwitchStatements(lines: string[]): Array<{ line: number; cases: number }> {
  const results: Array<{ line: number; cases: number }> = [];
  for (let i = 0; i < lines.length; i++) {
    if (/switch\s*\(/.test(lines[i])) {
      const block = lines.slice(i, Math.min(lines.length, i + 30)).join("\n");
      const caseCount = (block.match(/\bcase\b/g) ?? []).length;
      if (caseCount > 3) results.push({ line: i + 1, cases: caseCount });
    }
  }
  return results;
}

/** Detect message chain (train wreck) calls. */
export function detectMessageChains(lines: string[]): Array<{ line: number; chain: string }> {
  const results: Array<{ line: number; chain: string }> = [];
  const re = /\w+(?:\.\w+\(\))+(?:\.\w+\(\)){2,}/;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(re);
    if (match) results.push({ line: i + 1, chain: match[0] });
  }
  return results;
}

/** Compute risk score of a refactoring (0–100). */
export function computeRefactoringRisk(params: { linesChanged: number; testedLines: number; hasIntegrationTests: boolean }): number {
  let risk = Math.min(50, params.linesChanged / 2);
  const coverage = params.testedLines > 0 ? params.linesChanged / params.testedLines : 1;
  risk += coverage * 30;
  if (!params.hasIntegrationTests) risk += 20;
  return Math.min(100, Math.round(risk));
}

/** Prioritize refactoring issues by value/risk ratio. */
export function prioritizeRefactoring(issues: Array<{ name: string; impact: number; risk: number }>): typeof issues {
  return [...issues].sort((a, b) => {
    const roiA = a.impact / (a.risk + 1);
    const roiB = b.impact / (b.risk + 1);
    return roiB - roiA;
  });
}

/** Build a step-by-step refactoring plan. */
export function buildRefactoringPlan(issues: Array<{ name: string; type: string; line: number }>): string[] {
  return issues.map((issue, i) => `Step ${i + 1}: Fix "${issue.name}" (${issue.type}) at line ${issue.line}`);
}

/** Detect divergent change: class changed for multiple unrelated reasons. */
export function detectDivergentChange(changeReasons: string[]): boolean {
  const uniqueDomains = new Set(changeReasons.map((r) => r.split("-")[0]));
  return uniqueDomains.size > 2;
}

/** Detect shotgun surgery: one change requires many small edits across files. */
export function detectShotgunSurgery(changedFiles: string[], changesPerFile: number[]): boolean {
  const avgChanges = changesPerFile.reduce((a, b) => a + b, 0) / changesPerFile.length;
  return changedFiles.length > 5 && avgChanges < 3;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SECURITY-SCANNER helpers ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Detect injection vulnerabilities (SQL, command, LDAP). */
export function detectInjection(lines: string[]): Finding[] {
  const findings: Finding[] = [];
  const patterns: Array<[RegExp, string, string]> = [
    [/(?:query|execute)\s*\(\s*[`"']\s*(?:SELECT|INSERT|UPDATE|DELETE)[^`"']*\$\{/i, "SQL injection via template literal", "A03:2021"],
    [/(?:exec|spawn|execSync)\s*\(\s*\S*\s*\+/, "Command injection via concatenation", "A03:2021"],
    [/ldap.*filter.*\+\s*\w+/i, "LDAP injection risk", "A03:2021"],
  ];
  for (let i = 0; i < lines.length; i++) {
    for (const [re, msg, owasp] of patterns) {
      if (re.test(lines[i])) {
        findings.push({ rule: "injection", severity: "critical", line: i + 1, message: msg, owaspCategory: owasp, cweId: "CWE-89" });
      }
    }
  }
  return findings;
}

/** Detect XSS vulnerabilities. */
export function detectXSS(lines: string[]): Finding[] {
  return detectXSSRisk(lines).map((r) => ({
    rule: "xss",
    severity: "high" as Severity,
    line: r.line,
    message: `XSS risk: ${r.pattern}`,
    owaspCategory: "A03:2021",
    cweId: "CWE-79",
    suggestion: "Sanitize user input with DOMPurify or Content-Security-Policy headers",
  }));
}

/** Detect hardcoded credentials as security findings. */
export function detectHardcodedCredentials(lines: string[]): Finding[] {
  return detectHardcodedSecrets(lines).map((r) => ({
    rule: "hardcoded-credential",
    severity: "critical" as Severity,
    line: r.line,
    message: `Hardcoded credential: ${r.pattern}`,
    owaspCategory: "A02:2021",
    cweId: "CWE-798",
    suggestion: "Move secrets to environment variables or a secrets manager",
  }));
}

/** Detect weak cryptographic algorithm usage. */
export function detectWeakCrypto(lines: string[]): Finding[] {
  const findings: Finding[] = [];
  const weakAlgos: Array<[RegExp, string]> = [
    [/createHash\s*\(\s*['"]md5['"]/i, "MD5"],
    [/createHash\s*\(\s*['"]sha1['"]/i, "SHA-1"],
    [/createCipher\s*\(\s*['"]des['"]/i, "DES"],
    [/createCipher\s*\(\s*['"]rc4['"]/i, "RC4"],
  ];
  for (let i = 0; i < lines.length; i++) {
    for (const [re, algo] of weakAlgos) {
      if (re.test(lines[i])) {
        findings.push({ rule: "weak-crypto", severity: "high", line: i + 1, message: `Weak algorithm: ${algo}`, owaspCategory: "A02:2021", cweId: "CWE-327", suggestion: `Replace ${algo} with SHA-256 or AES-256-GCM` });
      }
    }
  }
  return findings;
}

/** Detect path traversal vulnerabilities. */
export function detectPathTraversal(lines: string[]): Finding[] {
  const findings: Finding[] = [];
  const re = /(?:readFile|readdir|unlink|open)\s*\(\s*(?:req\.|path\.join\(|`[^`]*\$\{)/;
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) {
      findings.push({ rule: "path-traversal", severity: "high", line: i + 1, message: "Potential path traversal: user-controlled path in file operation", owaspCategory: "A01:2021", cweId: "CWE-22" });
    }
  }
  return findings;
}

/** Detect open redirect vulnerabilities. */
export function detectOpenRedirect(lines: string[]): Finding[] {
  const findings: Finding[] = [];
  const re = /(?:redirect|location|res\.redirect)\s*\(\s*(?:req\.|params\.|query\.)/;
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) {
      findings.push({ rule: "open-redirect", severity: "medium", line: i + 1, message: "Open redirect: user-controlled URL in redirect", owaspCategory: "A01:2021", cweId: "CWE-601" });
    }
  }
  return findings;
}

/** Detect SSRF risks (server-side request forgery). */
export function detectSSRF(lines: string[]): Finding[] {
  const findings: Finding[] = [];
  const re = /fetch\s*\(\s*(?:req\.|params\.|query\.|body\.)/;
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) {
      findings.push({ rule: "ssrf", severity: "high", line: i + 1, message: "SSRF risk: user-controlled URL in fetch/HTTP request", owaspCategory: "A10:2021", cweId: "CWE-918" });
    }
  }
  return findings;
}

/** Detect insecure random number generation. */
export function detectInsecureRandom(lines: string[]): Finding[] {
  const findings: Finding[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/Math\.random\(\)/.test(lines[i]) && /(token|secret|password|key|nonce|salt|csrf)/i.test(lines[i])) {
      findings.push({ rule: "insecure-random", severity: "high", line: i + 1, message: "Math.random() used for security-sensitive value", owaspCategory: "A02:2021", cweId: "CWE-338", suggestion: "Use crypto.randomBytes() or crypto.getRandomValues()" });
    }
  }
  return findings;
}

/** Detect routes missing authentication middleware. */
export function detectMissingAuth(routes: Array<{ path: string; middleware: string[] }>): Array<{ path: string }> {
  return routes
    .filter((r) => !r.middleware.some((m) => /(auth|authenticate|jwt|session|passport|guard)/i.test(m)))
    .map((r) => ({ path: r.path }));
}

/** Detect missing CSRF protection on mutating routes. */
export function detectCSRFMissing(routes: Array<{ method: string; path: string; middleware: string[] }>): Array<{ path: string; method: string }> {
  return routes
    .filter((r) => ["POST", "PUT", "PATCH", "DELETE"].includes(r.method.toUpperCase()))
    .filter((r) => !r.middleware.some((m) => /(csrf|csurf|xsrf)/i.test(m)))
    .map((r) => ({ path: r.path, method: r.method }));
}

/** Map a finding to OWASP Top 10 2025 category. */
export function mapToOWASP2025(rule: string): string {
  const mapping: Record<string, string> = {
    "injection": "A03:2025-Injection",
    "xss": "A03:2025-Injection",
    "broken-access": "A01:2025-Broken-Access-Control",
    "hardcoded-credential": "A02:2025-Cryptographic-Failures",
    "weak-crypto": "A02:2025-Cryptographic-Failures",
    "ssrf": "A10:2025-Exceptional-Conditions",
    "insecure-random": "A02:2025-Cryptographic-Failures",
    "path-traversal": "A01:2025-Broken-Access-Control",
    "open-redirect": "A01:2025-Broken-Access-Control",
    "security-misconfiguration": "A05:2025-Security-Misconfiguration",
  };
  return mapping[rule] ?? "A05:2025-Security-Misconfiguration";
}

/** Compute a CVSS-like score for a finding. */
export function scoreCVSS(params: { attackVector: "network" | "local" | "physical"; complexity: "low" | "high"; privilegeRequired: boolean; userInteraction: boolean; impact: "high" | "medium" | "low" }): number {
  let score = params.attackVector === "network" ? 3 : params.attackVector === "local" ? 1.5 : 0.5;
  score *= params.complexity === "low" ? 1.5 : 0.8;
  score *= params.privilegeRequired ? 0.7 : 1;
  score *= params.userInteraction ? 0.8 : 1;
  score *= params.impact === "high" ? 2 : params.impact === "medium" ? 1.5 : 1;
  return Math.min(10, Math.round(score * 10) / 10);
}

/** Build comprehensive security report. */
export function buildSecurityReport(findings: Finding[]): Record<string, unknown> {
  const criticals = findings.filter((f) => f.severity === "critical");
  const highs = findings.filter((f) => f.severity === "high");
  return {
    totalFindings: findings.length,
    criticalCount: criticals.length,
    highCount: highs.length,
    passedOWASP: findings.length === 0,
    owaspCategories: [...new Set(findings.map((f) => f.owaspCategory).filter(Boolean))],
    topFindings: prioritizeFindings(findings).slice(0, 5),
    remediationPriority: criticals.length > 0 ? "immediate" : highs.length > 0 ? "this-sprint" : "backlog",
  };
}

/** Detect missing security headers. */
export function detectInsecureHeaders(headers: Record<string, string>): string[] {
  const required = ["Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options", "Strict-Transport-Security", "Referrer-Policy"];
  return required.filter((h) => !Object.keys(headers).some((k) => k.toLowerCase() === h.toLowerCase()));
}

/** Detect sensitive data exposure (PII in logs/responses). */
export function detectSensitiveDataExposure(lines: string[]): Array<{ line: number; pattern: string }> {
  const patterns: Array<[RegExp, string]> = [
    [/console\.log.*(?:password|token|ssn|credit.?card|cvv)/i, "PII-in-log"],
    [/JSON\.stringify.*(?:password|secret|token)/i, "sensitive-in-stringify"],
    [/res\.json.*(?:password|hash|salt)/i, "sensitive-in-response"],
  ];
  const results: Array<{ line: number; pattern: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    for (const [re, label] of patterns) {
      if (re.test(lines[i])) results.push({ line: i + 1, pattern: label });
    }
  }
  return results;
}

/** Classify security finding severity. */
export function classifySecuritySeverity(cvssScore: number): Severity {
  if (cvssScore >= 9) return "critical";
  if (cvssScore >= 7) return "high";
  if (cvssScore >= 4) return "medium";
  if (cvssScore >= 0.1) return "low";
  return "info";
}

/** Build a security remediation plan ordered by priority. */
export function buildRemediationPlan(findings: Finding[]): Array<{ finding: string; action: string; effort: string }> {
  return prioritizeFindings(findings).map((f) => ({
    finding: f.message,
    action: f.suggestion ?? "Review and fix according to OWASP guidelines",
    effort: f.severity === "critical" ? "immediate" : f.severity === "high" ? "1-sprint" : "2-sprint",
  }));
}

// ══════════════════════════════════════════════════════════════════════════════
// ── PERFORMANCE-ANALYZER helpers ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/** Detect N+1 query patterns (query inside a loop). */
export function detectNPlusOneQuery(lines: string[]): Array<{ line: number; snippet: string }> {
  const results: Array<{ line: number; snippet: string }> = [];
  let inLoop = false;
  for (let i = 0; i < lines.length; i++) {
    if (/(for|while|forEach|map|filter|reduce)\s*[\(\{]/.test(lines[i])) inLoop = true;
    if (inLoop && /(?:query|findOne|findById|select|fetch|get)\s*\(/.test(lines[i])) {
      results.push({ line: i + 1, snippet: lines[i].trim().slice(0, 80) });
    }
    if (lines[i].trim() === "}" || lines[i].trim() === "});") inLoop = false;
  }
  return results;
}

/** Detect synchronous I/O in async context. */
export function detectSynchronousIO(lines: string[]): Array<{ line: number; fn: string }> {
  const syncFns = [/readFileSync/, /writeFileSync/, /execSync/, /spawnSync/, /readdirSync/, /statSync/];
  const results: Array<{ line: number; fn: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    for (const re of syncFns) {
      const match = lines[i].match(re);
      if (match) results.push({ line: i + 1, fn: match[0] });
    }
  }
  return results;
}

/** Detect expensive operations inside tight loops. */
export function detectExpensiveLoop(lines: string[]): Array<{ line: number; issue: string }> {
  const results: Array<{ line: number; issue: string }> = [];
  let inLoop = false;
  for (let i = 0; i < lines.length; i++) {
    if (/(for|while)\s*\(/.test(lines[i])) inLoop = true;
    if (inLoop) {
      if (/JSON\.parse|JSON\.stringify/.test(lines[i])) results.push({ line: i + 1, issue: "JSON parse/stringify in loop" });
      if (/new RegExp\(/.test(lines[i])) results.push({ line: i + 1, issue: "RegExp construction in loop" });
      if (/document\.querySelector|getElementById/.test(lines[i])) results.push({ line: i + 1, issue: "DOM query in loop" });
    }
    if (lines[i].trim() === "}") inLoop = false;
  }
  return results;
}

/** Estimate Big-O complexity class from loop nesting. */
export function computeComplexityClass(lines: string[]): "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n²)" | "O(n³)" {
  let maxNesting = 0;
  let current = 0;
  let hasLogPattern = false;
  for (const line of lines) {
    if (/(for|while)\s*\(/.test(line)) current++;
    if (/>>|Math\.log|\/\s*2/.test(line)) hasLogPattern = true;
    if (line.trim() === "}") current = Math.max(0, current - 1);
    maxNesting = Math.max(maxNesting, current);
  }
  if (maxNesting === 0) return "O(1)";
  if (maxNesting === 1 && hasLogPattern) return "O(log n)";
  if (maxNesting === 1) return "O(n)";
  if (maxNesting === 2 && hasLogPattern) return "O(n log n)";
  if (maxNesting === 2) return "O(n²)";
  return "O(n³)";
}

/** Detect unnecessary React-style re-renders (inline objects/functions as props). */
export function detectUnnecessaryReRender(lines: string[]): Array<{ line: number; pattern: string }> {
  const results: Array<{ line: number; pattern: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    if (/=\{\s*\{/.test(lines[i])) results.push({ line: i + 1, pattern: "inline-object-prop" });
    if (/=\{\s*\(/.test(lines[i]) || /=\{\s*function/.test(lines[i])) results.push({ line: i + 1, pattern: "inline-function-prop" });
  }
  return results;
}

/** Detect heavy bundle imports (known large packages). */
export function detectBundleBloat(importLines: string[]): Array<{ line: number; package: string; suggestion: string }> {
  const heavyPackages: Array<[RegExp, string, string]> = [
    [/from\s+['"]lodash['"]/, "lodash", "Use lodash-es or individual imports: lodash/get"],
    [/from\s+['"]moment['"]/, "moment", "Use date-fns or dayjs (smaller alternatives)"],
    [/from\s+['"]rxjs['"](?!\/)/, "rxjs", "Import only needed operators: rxjs/operators"],
    [/import\s+\*\s+as/, "*-import", "Use named imports to enable tree-shaking"],
  ];
  const results: Array<{ line: number; package: string; suggestion: string }> = [];
  for (let i = 0; i < importLines.length; i++) {
    for (const [re, pkg, suggestion] of heavyPackages) {
      if (re.test(importLines[i])) results.push({ line: i + 1, package: pkg, suggestion });
    }
  }
  return results;
}

/** Detect computations that should be memoized. */
export function detectCacheableComputation(lines: string[]): Array<{ line: number; pattern: string }> {
  const results: Array<{ line: number; pattern: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    if (/\.filter\(.*\)\.map\(|\.sort\(.*\)\.filter\(/.test(lines[i])) {
      results.push({ line: i + 1, pattern: "chained-array-ops" });
    }
    if (/(?:const|let)\s+\w+\s*=.*\.reduce\(/.test(lines[i])) {
      results.push({ line: i + 1, pattern: "reduce-in-render" });
    }
  }
  return results;
}

/** Score overall performance risk (0–100). */
export function scorePerformanceRisk(issues: Array<{ severity: "high" | "medium" | "low" }>): number {
  const weights = { high: 30, medium: 15, low: 5 };
  return Math.min(100, issues.reduce((acc, i) => acc + weights[i.severity], 0));
}

/** Detect connection pool misconfiguration indicators. */
export function detectConnectionPoolIssues(lines: string[]): Array<{ line: number; issue: string }> {
  const results: Array<{ line: number; issue: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    if (/pool.*max.*1\b|connectionLimit.*1\b/.test(lines[i])) results.push({ line: i + 1, issue: "Pool max=1 is too small for concurrent requests" });
    if (/new.*Pool\(\)|createPool\(/.test(lines[i]) && !/max|limit/.test(lines.slice(i, i + 5).join(""))) {
      results.push({ line: i + 1, issue: "Connection pool created without explicit max limit" });
    }
  }
  return results;
}

/** Detect leaky event listener subscriptions. */
export function detectLeakySubscriptions(lines: string[]): Array<{ line: number; event: string }> {
  const results: Array<{ line: number; event: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/\.(?:on|addEventListener)\s*\(\s*['"](\w+)['"]/);
    if (match) {
      const context = lines.slice(i, Math.min(lines.length, i + 30)).join("\n");
      if (!/(removeListener|removeEventListener|off\(|once\()/.test(context)) {
        results.push({ line: i + 1, event: match[1] });
      }
    }
  }
  return results;
}

/** Build a performance analysis report. */
export function buildPerformanceReport(params: { nPlusOne: number; syncIO: number; complexityClass: string; bundleBloat: number; leakySubscriptions: number }): Record<string, unknown> {
  const issues = params.nPlusOne + params.syncIO + params.bundleBloat + params.leakySubscriptions;
  return {
    totalIssues: issues,
    algorithmComplexity: params.complexityClass,
    nPlusOneQueries: params.nPlusOne,
    syncIOBlocking: params.syncIO,
    bundleWeight: params.bundleBloat,
    memoryRisks: params.leakySubscriptions,
    overallRisk: issues > 10 ? "critical" : issues > 5 ? "high" : issues > 2 ? "medium" : "low",
  };
}

/** Detect redundant repeated computations. */
export function detectRedundantComputations(lines: string[]): Array<{ line: number; expression: string }> {
  const seen = new Map<string, number>();
  const results: Array<{ line: number; expression: string }> = [];
  const re = /\b(\w+\.\w+\((?:[^)]*)\))\b/g;
  for (let i = 0; i < lines.length; i++) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(lines[i])) !== null) {
      const expr = match[1];
      if (seen.has(expr)) results.push({ line: i + 1, expression: expr });
      else seen.set(expr, i + 1);
    }
    re.lastIndex = 0;
  }
  return results;
}

/** Suggest optimization strategy for a performance issue. */
export function suggestPerformanceOptimization(issue: string): string {
  const strategies: Record<string, string> = {
    "n+1": "Use batch loading (DataLoader pattern) or JOIN queries",
    "sync-io": "Replace with async equivalent (readFile instead of readFileSync)",
    "expensive-loop": "Hoist expensive operations outside the loop or memoize results",
    "bundle-bloat": "Use dynamic import() for non-critical code and tree-shakeable libraries",
    "leaky-subscription": "Store subscription reference and call removeListener in cleanup/destructor",
    "n2-complexity": "Consider sorting + binary search, hash map lookup, or divide-and-conquer",
  };
  return strategies[issue] ?? "Profile with Node.js --prof or Chrome DevTools to find the hot path";
}

// ══════════════════════════════════════════════════════════════════════════════
// ── API-DESIGNER helpers ─────────────────────────────────────════════════════
// ══════════════════════════════════════════════════════════════════════════════

export interface Route {
  method: string;
  path: string;
  middleware?: string[];
  response?: { status: number; schema?: Record<string, unknown> };
}

/** Detect incorrect HTTP verb usage. */
export function detectVerbMisuse(routes: Route[]): Array<{ path: string; method: string; issue: string }> {
  const results: Array<{ path: string; method: string; issue: string }> = [];
  for (const route of routes) {
    if (route.method === "GET" && /\/(create|add|new)/.test(route.path)) {
      results.push({ path: route.path, method: route.method, issue: "GET used for mutation-like path" });
    }
    if (route.method === "POST" && /\/\{id\}$/.test(route.path) && !/update|edit/.test(route.path)) {
      results.push({ path: route.path, method: route.method, issue: "Consider PUT/PATCH for resource update with ID" });
    }
  }
  return results;
}

/** Detect inconsistent naming conventions across endpoints. */
export function detectInconsistentNaming(routes: Route[]): Array<{ path: string; issue: string }> {
  const results: Array<{ path: string; issue: string }> = [];
  for (const route of routes) {
    if (/[A-Z]/.test(route.path)) results.push({ path: route.path, issue: "Uppercase in path (use kebab-case)" });
    if (/_/.test(route.path)) results.push({ path: route.path, issue: "Underscore in path (use kebab-case)" });
    if (/\/(get|fetch|retrieve|list)/.test(route.path) && route.method === "GET") {
      results.push({ path: route.path, issue: "Verb in path for GET endpoint (use nouns)" });
    }
  }
  return results;
}

/** Detect list endpoints missing pagination. */
export function detectMissingPagination(routes: Route[]): Route[] {
  return routes.filter((r) => {
    const isListEndpoint = /\/\w+s$|\/list$|\/all$/.test(r.path) && r.method === "GET";
    const hasPagination = /limit|offset|page|cursor|per_?page/.test(JSON.stringify(r));
    return isListEndpoint && !hasPagination;
  });
}

/** Detect APIs missing versioning (no /v1/, /v2/ prefix). */
export function detectMissingVersioning(routes: Route[]): boolean {
  return routes.length > 0 && !routes.some((r) => /\/v\d+\//.test(r.path));
}

/** Score API REST maturity (Richardson Maturity Model level 0-3). */
export function scoreRESTMaturity(routes: Route[]): { level: 0 | 1 | 2 | 3; description: string } {
  if (routes.length === 0) return { level: 0, description: "No routes defined" };
  const hasResources = routes.some((r) => /\/\w+\/\{?\w+\}?/.test(r.path));
  const hasHTTPVerbs = new Set(routes.map((r) => r.method)).size > 1;
  const hasHypermedia = routes.some((r) => JSON.stringify(r).includes("_links"));
  if (hasHypermedia) return { level: 3, description: "HATEOAS — full REST maturity" };
  if (hasResources && hasHTTPVerbs) return { level: 2, description: "HTTP verbs + resources" };
  if (hasResources) return { level: 1, description: "Resources only" };
  return { level: 0, description: "Single endpoint (RPC style)" };
}

/** Detect breaking changes between two API versions. */
export function detectBreakingChanges(v1: Route[], v2: Route[]): Array<{ path: string; change: string }> {
  const results: Array<{ path: string; change: string }> = [];
  for (const r of v1) {
    const v2Route = v2.find((r2) => r2.path === r.path && r2.method === r.method);
    if (!v2Route) results.push({ path: r.path, change: `Route ${r.method} ${r.path} removed` });
  }
  return results;
}

/** Detect routes missing proper error response documentation. */
export function detectMissingErrorResponses(routes: Route[]): Array<{ path: string; missingCodes: number[] }> {
  const expectedCodes = [400, 401, 403, 404, 500];
  return routes
    .filter((r) => !r.response || !expectedCodes.includes(r.response.status))
    .map((r) => ({ path: r.path, missingCodes: expectedCodes }));
}

/** Detect routes likely missing rate limiting. */
export function detectMissingRateLimit(routes: Route[]): Route[] {
  return routes.filter((r) => {
    const isPublic = !r.middleware?.some((m) => /(auth|jwt|session)/i.test(m));
    const hasRateLimit = r.middleware?.some((m) => /(rateLimit|throttle|limiter)/i.test(m));
    return isPublic && !hasRateLimit;
  });
}

/** Validate REST naming conventions across all routes. */
export function validateRESTConventions(routes: Route[]): Array<{ path: string; violations: string[] }> {
  return routes
    .map((r) => {
      const violations: string[] = [];
      if (/[A-Z]/.test(r.path)) violations.push("CamelCase in path");
      if (/\d{4,}/.test(r.path)) violations.push("Hardcoded ID in path definition");
      if (r.path.endsWith("/") && r.path.length > 1) violations.push("Trailing slash");
      return { path: r.path, violations };
    })
    .filter((r) => r.violations.length > 0);
}

/** Detect non-idempotent PUT routes (should be idempotent). */
export function detectNonIdempotentPUT(routes: Route[]): Route[] {
  return routes.filter((r) => r.method === "PUT" && !/\{id\}|\/:id/.test(r.path));
}

/** Score API consistency across routes (0–100). */
export function scoreAPIConsistency(routes: Route[]): number {
  if (routes.length === 0) return 100;
  const namingIssues = detectInconsistentNaming(routes).length;
  const verbIssues = detectVerbMisuse(routes).length;
  const total = namingIssues + verbIssues;
  return Math.max(0, Math.round(100 - (total / routes.length) * 50));
}

/** Detect security gaps in API spec. */
export function detectAPISecurityGaps(routes: Route[]): string[] {
  const gaps: string[] = [];
  if (detectMissingVersioning(routes)) gaps.push("No API versioning");
  const unauthed = detectMissingAuth(routes.map((r) => ({ path: r.path, middleware: r.middleware ?? [] })));
  if (unauthed.length > 0) gaps.push(`${unauthed.length} unauthenticated route(s)`);
  const noRateLimit = detectMissingRateLimit(routes);
  if (noRateLimit.length > 0) gaps.push(`${noRateLimit.length} route(s) without rate limiting`);
  return gaps;
}

/** Build API health summary report. */
export function buildAPIHealthReport(routes: Route[]): Record<string, unknown> {
  return {
    totalRoutes: routes.length,
    maturityLevel: scoreRESTMaturity(routes),
    consistencyScore: scoreAPIConsistency(routes),
    securityGaps: detectAPISecurityGaps(routes),
    missingPagination: detectMissingPagination(routes).length,
    verbMisuse: detectVerbMisuse(routes).length,
    missingVersioning: detectMissingVersioning(routes),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── DB-ADVISOR helpers ───────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export interface SQLQuery {
  sql: string;
  table?: string;
  params?: unknown[];
}

/** Detect queries missing a LIMIT clause. */
export function detectUnboundedQuery(queries: SQLQuery[]): SQLQuery[] {
  return queries.filter((q) => /SELECT/i.test(q.sql) && !/LIMIT\s+\d/i.test(q.sql));
}

/** Detect Cartesian join (missing JOIN condition). */
export function detectCartesianJoin(queries: SQLQuery[]): SQLQuery[] {
  return queries.filter((q) => {
    const commaJoin = /FROM\s+\w+\s*,\s*\w+/i.test(q.sql);
    if (commaJoin) return true;
    const fromCount = (q.sql.match(/FROM|JOIN/gi) ?? []).length;
    const onCount = (q.sql.match(/\bON\b/gi) ?? []).length;
    return fromCount > 1 && onCount < fromCount - 1;
  });
}

/** Detect non-sargable filter (function call on indexed column). */
export function detectNonSargableFilter(queries: SQLQuery[]): Array<{ query: SQLQuery; issue: string }> {
  const results: Array<{ query: SQLQuery; issue: string }> = [];
  const patterns: Array<[RegExp, string]> = [
    [/WHERE\s+\w+\s*\(.*\)\s*=/i, "Function on column in WHERE clause"],
    [/WHERE\s+YEAR\(|MONTH\(|LOWER\(|UPPER\(/i, "Date/string function on column"],
    [/WHERE\s+CAST\s*\(/i, "CAST in WHERE prevents index use"],
  ];
  for (const q of queries) {
    for (const [re, issue] of patterns) {
      if (re.test(q.sql)) results.push({ query: q, issue });
    }
  }
  return results;
}

/** Compute index selectivity (higher is better, range 0–1). */
export function computeSelectivity(distinctValues: number, totalRows: number): number {
  if (totalRows === 0) return 1;
  return Math.round((distinctValues / totalRows) * 1000) / 1000;
}

/** Detect redundant/overlapping indexes. */
export function detectRedundantIndex(indexes: Array<{ name: string; columns: string[] }>): Array<{ redundant: string; coveredBy: string }> {
  const results: Array<{ redundant: string; coveredBy: string }> = [];
  for (let i = 0; i < indexes.length; i++) {
    for (let j = 0; j < indexes.length; j++) {
      if (i === j) continue;
      const a = indexes[i].columns;
      const b = indexes[j].columns;
      if (a.length < b.length && a.every((col, idx) => b[idx] === col)) {
        results.push({ redundant: indexes[i].name, coveredBy: indexes[j].name });
      }
    }
  }
  return results;
}

/** Score schema normalization level (0–3 for 1NF/2NF/3NF). */
export function scoreNormalization(schema: { hasRepeatingGroups: boolean; hasFunctionalDependencies: boolean; hasTransitiveDependencies: boolean }): { level: number; label: string } {
  if (schema.hasRepeatingGroups) return { level: 0, label: "Below 1NF — repeating groups detected" };
  if (schema.hasFunctionalDependencies) return { level: 1, label: "1NF — functional dependencies on non-key columns" };
  if (schema.hasTransitiveDependencies) return { level: 2, label: "2NF — transitive dependencies present" };
  return { level: 3, label: "3NF — fully normalized" };
}

/** Detect columns that should not be stored as BLOBs. */
export function detectBlobColumn(columns: Array<{ name: string; type: string }>): string[] {
  const blobTypes = ["BLOB", "BYTEA", "IMAGE", "VARBINARY"];
  return columns
    .filter((c) => blobTypes.some((t) => c.type.toUpperCase().includes(t)))
    .map((c) => c.name);
}

/** Detect tables with missing foreign key constraints. */
export function detectMissingForeignKey(schema: { tables: string[]; foreignKeys: Array<{ from: string; to: string }> }): string[] {
  const referencedTables = new Set(schema.foreignKeys.map((fk) => fk.from));
  return schema.tables.filter((t) => !referencedTables.has(t) && t !== "migrations" && !t.endsWith("_log"));
}

/** Detect missing NOT NULL constraints on important columns. */
export function detectMissingConstraints(columns: Array<{ name: string; nullable: boolean; hasDefault: boolean }>): string[] {
  const criticalPatterns = /^(user_id|email|created_at|status|type|role)/;
  return columns.filter((c) => criticalPatterns.test(c.name) && c.nullable && !c.hasDefault).map((c) => c.name);
}

/** Build an index recommendation for a slow query. */
export function buildIndexRecommendation(query: SQLQuery, whereColumns: string[], orderColumns: string[]): { indexColumns: string[]; indexType: "BTREE" | "HASH" | "GIN"; rationale: string } {
  const isEquality = whereColumns.length > 0 && !/LIKE|BETWEEN|>/i.test(query.sql);
  return {
    indexColumns: [...whereColumns, ...orderColumns].slice(0, 4),
    indexType: isEquality && whereColumns.length === 1 ? "HASH" : "BTREE",
    rationale: `Covering index on (${[...whereColumns, ...orderColumns].join(", ")}) for WHERE + ORDER BY`,
  };
}

/** Detect lock contention patterns (concurrent writes on same table). */
export function detectLockContention(queries: SQLQuery[]): string[] {
  const writesByTable = new Map<string, number>();
  for (const q of queries) {
    if (/(UPDATE|DELETE|INSERT)/i.test(q.sql)) {
      const tableMatch = q.sql.match(/(?:UPDATE|INTO|FROM)\s+(\w+)/i);
      if (tableMatch) writesByTable.set(tableMatch[1], (writesByTable.get(tableMatch[1]) ?? 0) + 1);
    }
  }
  return Array.from(writesByTable.entries()).filter(([, count]) => count > 5).map(([table]) => table);
}

/** Score SQL query complexity (0–100). */
export function scoreQueryComplexity(query: SQLQuery): number {
  let score = 0;
  score += (query.sql.match(/JOIN/gi) ?? []).length * 10;
  score += (query.sql.match(/SUBQUERY|SELECT.*SELECT/gi) ?? []).length * 20;
  score += (query.sql.match(/GROUP BY|HAVING/gi) ?? []).length * 5;
  score += (query.sql.match(/ORDER BY/gi) ?? []).length * 3;
  if (!/LIMIT/i.test(query.sql)) score += 15;
  return Math.min(100, score);
}

/** Build a database health report. */
export function buildDBHealthReport(params: {
  unboundedQueries: number;
  cartesianJoins: number;
  missingIndexes: number;
  redundantIndexes: number;
  normalizationLevel: number;
  lockContentionTables: string[];
}): Record<string, unknown> {
  const issues = params.unboundedQueries + params.cartesianJoins + params.missingIndexes + params.redundantIndexes;
  return {
    totalIssues: issues,
    normalizationLevel: params.normalizationLevel,
    unboundedQueries: params.unboundedQueries,
    cartesianJoins: params.cartesianJoins,
    indexGaps: params.missingIndexes,
    redundantIndexes: params.redundantIndexes,
    lockContention: params.lockContentionTables,
    healthScore: Math.max(0, 100 - issues * 8 - params.lockContentionTables.length * 10),
    priority: issues > 5 ? "critical" : issues > 2 ? "high" : "normal",
  };
}

/** Detect full table scan risk (SELECT without indexed WHERE). */
export function detectTableScanRisk(query: SQLQuery, indexedColumns: string[]): boolean {
  if (!/WHERE/i.test(query.sql)) return true;
  const whereMatch = query.sql.match(/WHERE\s+(\w+)/i);
  if (!whereMatch) return true;
  return !indexedColumns.includes(whereMatch[1]);
}
