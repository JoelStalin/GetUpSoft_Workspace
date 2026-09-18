import test from "node:test";
import assert from "node:assert/strict";

// ─── codeHelpers imports ───────────────────────────────────────────────────────
import {
  severityWeight, scoreSeverity, classifyLine, detectDuplication,
  detectLongMethods, detectNestedConditions, detectMagicNumbers,
  detectGodClasses, detectDeadCode, detectEmptyCatchBlocks,
  detectHardcodedSecrets, detectMutableDefaults, detectSQLInjectionRisk,
  detectXSSRisk, computeCyclomaticComplexity, computeCognitiveComplexity,
  buildFindingReport, prioritizeFindings, detectImproperNullHandling,
  detectUnusedVariables, detectLongParameterList,
  computeCBO, computeLCOM, computeDIT, detectGodModule,
  detectCircularDependency, scoreLayerSeparation,
  detectLeakyAbstractions, detectAnemicDomain, scoreModularity,
  detectTightCoupling, computeInstability,
  computeAbstractness, computeDistanceFromMainSeq, classifyArchSmell,
  suggestArchRefactoringStrategy, detectBigBallOfMud, scoreArchitecturalFitness,
  detectTestableUnits, generateBoundaryInputs, generateNullInputs,
  generateNegativeStringInputs, computeMutationScore, detectMissingAssertions,
  classifyTestType, buildTestMatrix, detectFlakyCandidates, scoreTestQuality,
  generateEdgeCaseNames, detectTestSmells, computeCoverage,
  prioritizeTestGeneration, buildMockSpec,
  detectUndocumentedPublicAPIs, scoreDocCompleteness, extractParamTypes,
  buildJSDocBlock, detectStaleDoc, scoreReadability, detectMissingExamples,
  buildChangelogEntry, extractReturnType, scoreAPIUsability,
  classifyBugCategory, scoreReproducibility, detectOffByOneErrors,
  detectErrorSwallowing, buildRootCauseTree, scoreBugBlastRadius,
  inferBugHotspots, computeBugScore, buildBugReport, detectRegressionRisk,
  suggestBugFix,
  detectLongMethod, detectLargeClass, detectFeatureEnvy,
  detectPrimitiveObsession, detectSwitchStatements, detectMessageChains,
  computeRefactoringRisk, prioritizeRefactoring, buildRefactoringPlan,
  detectDivergentChange, detectShotgunSurgery,
  detectInjection, detectXSS, detectHardcodedCredentials, detectWeakCrypto,
  detectPathTraversal, detectInsecureRandom,
  detectMissingAuth, detectCSRFMissing, mapToOWASP2025, scoreCVSS,
  buildSecurityReport, detectInsecureHeaders, classifySecuritySeverity,
  buildRemediationPlan, detectSSRF,
  detectNPlusOneQuery, detectSynchronousIO, detectExpensiveLoop,
  computeComplexityClass, detectBundleBloat,
  scorePerformanceRisk, buildPerformanceReport, suggestPerformanceOptimization,
  detectVerbMisuse, detectInconsistentNaming, detectMissingPagination,
  detectMissingVersioning, scoreRESTMaturity, detectBreakingChanges,
  detectNonIdempotentPUT, scoreAPIConsistency, buildAPIHealthReport,
  detectUnboundedQuery, detectCartesianJoin,
  computeSelectivity, detectRedundantIndex, scoreNormalization,
  detectBlobColumn, buildIndexRecommendation, scoreQueryComplexity,
  buildDBHealthReport, detectTableScanRisk,
} from "../src/workers/helpers/codeHelpers.ts";

// ═════════════════════════════════════════════════════════════════════════════
// severity
// ═════════════════════════════════════════════════════════════════════════════
test("severity: severityWeight orders critical > high > medium > low > info", () => {
  assert.ok(severityWeight("critical") > severityWeight("high"));
  assert.ok(severityWeight("high") > severityWeight("medium"));
  assert.ok(severityWeight("medium") > severityWeight("low"));
  assert.ok(severityWeight("low") > severityWeight("info"));
});
test("severity: scoreSeverity returns 0 for empty", () => { assert.equal(scoreSeverity([]), 0); });
test("severity: scoreSeverity positive for findings", () => {
  assert.ok(scoreSeverity([{ rule: "x", severity: "high", message: "m" }]) > 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// classifyLine
// ═════════════════════════════════════════════════════════════════════════════
test("classifyLine: detects security", () => { assert.equal(classifyLine("const x = eval(code)"), "security"); });
test("classifyLine: detects style", () => { assert.equal(classifyLine("// TODO: fix this"), "style"); });
test("classifyLine: detects performance", () => { assert.equal(classifyLine("items.forEach(i => {})"), "performance"); });
test("classifyLine: returns unknown for plain line", () => { assert.equal(classifyLine("const x = 42;"), "unknown"); });

// ═════════════════════════════════════════════════════════════════════════════
// detectDuplication
// ═════════════════════════════════════════════════════════════════════════════
test("detectDuplication: finds identical blocks", () => {
  const lines = [
    "const result = computeValue(x);", "doSomethingWith(result);", "return result;",
    "const extra = 42;",
    "const result = computeValue(x);", "doSomethingWith(result);", "return result;",
  ];
  assert.ok(detectDuplication(lines).length > 0);
});
test("detectDuplication: empty for unique code", () => {
  assert.deepEqual(detectDuplication(["a = 1;", "b = 2;", "c = 3;"]), []);
});

// ═════════════════════════════════════════════════════════════════════════════
// detectLongMethods
// ═════════════════════════════════════════════════════════════════════════════
test("detectLongMethods: finds method over threshold", () => {
  const lines = ["function foo() {", ...Array(35).fill("  doSomething();"), "}"];
  const result = detectLongMethods(lines, 30);
  assert.ok(result.length > 0);
  assert.equal(result[0].name, "foo");
});
test("detectLongMethods: ignores short methods", () => {
  assert.deepEqual(detectLongMethods(["function bar() {", "  return 1;", "}"], 30), []);
});

// ═════════════════════════════════════════════════════════════════════════════
// detectMagicNumbers
// ═════════════════════════════════════════════════════════════════════════════
test("detectMagicNumbers: finds non-allowed numbers", () => {
  const result = detectMagicNumbers(["if (x > 42) return;"]);
  assert.ok(result.some((r) => r.value === "42"));
});
test("detectMagicNumbers: ignores 0 and 1", () => {
  const result = detectMagicNumbers(["if (x > 0 && y === 1) return;"]);
  assert.ok(!result.some((r) => r.value === "0" || r.value === "1"));
});

// ═════════════════════════════════════════════════════════════════════════════
// detectGodClasses
// ═════════════════════════════════════════════════════════════════════════════
test("detectGodClasses: flags class with many methods", () => {
  const lines = ["class BigClass {", ...Array(25).fill("  public doSomething() {}"), "}"];
  assert.ok(detectGodClasses(lines, 20).length > 0);
});
test("detectGodClasses: ignores small classes", () => {
  assert.deepEqual(detectGodClasses(["class SmallClass {", "  foo() {}", "  bar() {}", "}"], 20), []);
});

// ═════════════════════════════════════════════════════════════════════════════
// detectDeadCode
// ═════════════════════════════════════════════════════════════════════════════
test("detectDeadCode: finds code after return", () => {
  const lines = ["function f() {", "  return 1;", "  console.log('dead');", "}"];
  assert.ok(detectDeadCode(lines).length > 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// detectEmptyCatchBlocks
// ═════════════════════════════════════════════════════════════════════════════
test("detectEmptyCatchBlocks: finds empty catch", () => {
  const lines = ["try {", "  x();", "} catch (e) {", "}"];
  assert.ok(detectEmptyCatchBlocks(lines).length > 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// detectHardcodedSecrets
// ═════════════════════════════════════════════════════════════════════════════
test("detectHardcodedSecrets: finds password", () => {
  const result = detectHardcodedSecrets(['const password = "supersecret123";']);
  assert.ok(result.length > 0);
  assert.ok(result[0].pattern.includes("password"));
});
test("detectHardcodedSecrets: finds api key", () => {
  assert.ok(detectHardcodedSecrets(['const api_key = "sk-abc123xyz456";']).length > 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// detectSQLInjectionRisk
// ═════════════════════════════════════════════════════════════════════════════
test("detectSQLInjectionRisk: finds concatenated query", () => {
  assert.ok(detectSQLInjectionRisk(["db.query(`SELECT * FROM users WHERE id = ${userId}`)"]).length > 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// detectXSSRisk
// ═════════════════════════════════════════════════════════════════════════════
test("detectXSSRisk: finds innerHTML assignment", () => {
  const result = detectXSSRisk(["element.innerHTML = userInput;"]);
  assert.ok(result.length > 0);
  assert.ok(result[0].pattern.includes("innerHTML"));
});

// ═════════════════════════════════════════════════════════════════════════════
// cyclomatic / cognitive complexity
// ═════════════════════════════════════════════════════════════════════════════
test("cyclomaticComplexity: returns 1 for simple code", () => {
  assert.equal(computeCyclomaticComplexity(["const x = 1;"]), 1);
});
test("cyclomaticComplexity: increases on if", () => {
  assert.ok(computeCyclomaticComplexity(["if (x) {", "  y();", "}"]) > 1);
});
test("cognitiveComplexity: returns 0 for no control flow", () => {
  assert.equal(computeCognitiveComplexity(["const x = 1;"]), 0);
});
test("cognitiveComplexity: increases with nesting", () => {
  const lines = ["if (a) {", "  if (b) {", "    if (c) {}", "  }", "}"];
  assert.ok(computeCognitiveComplexity(lines) >= 3);
});

// ═════════════════════════════════════════════════════════════════════════════
// buildFindingReport / prioritizeFindings
// ═════════════════════════════════════════════════════════════════════════════
test("buildFindingReport: separates by severity", () => {
  const findings = [{ rule: "a", severity: "critical", message: "c" }, { rule: "b", severity: "low", message: "l" }];
  const report = buildFindingReport(findings);
  assert.equal(report.critical.length, 1);
  assert.equal(report.low.length, 1);
});
test("prioritizeFindings: sorts critical first", () => {
  const findings = [{ rule: "a", severity: "low", message: "lo" }, { rule: "b", severity: "critical", message: "crit" }];
  assert.equal(prioritizeFindings(findings)[0].severity, "critical");
});

// ═════════════════════════════════════════════════════════════════════════════
// null handling / unused vars / long params
// ═════════════════════════════════════════════════════════════════════════════
test("detectImproperNullHandling: flags deep chain", () => {
  assert.ok(detectImproperNullHandling(["const x = obj.a.b.c;"]).length > 0);
});
test("detectImproperNullHandling: ignores optional chaining", () => {
  assert.equal(detectImproperNullHandling(["const x = obj?.a?.b?.c;"]).length, 0);
});
test("detectLongParameterList: flags >4 params", () => {
  assert.ok(detectLongParameterList(["function foo(a, b, c, d, e) {}"], 4).length > 0);
});
test("detectLongParameterList: ignores <=4 params", () => {
  assert.deepEqual(detectLongParameterList(["function foo(a, b, c) {}"], 4), []);
});

// ═════════════════════════════════════════════════════════════════════════════
// architecture helpers
// ═════════════════════════════════════════════════════════════════════════════
test("computeCBO: counts unique dependencies", () => {
  assert.equal(computeCBO([["A", "B"], ["B", "C"]]), 3);
});
test("computeLCOM: returns 0 for single method", () => {
  assert.equal(computeLCOM(1, 0), 0);
});
test("computeDIT: computes depth from hierarchy", () => {
  const depths = computeDIT({ A: null, B: "A", C: "B" });
  assert.equal(depths["A"], 0);
  assert.equal(depths["B"], 1);
  assert.equal(depths["C"], 2);
});
test("detectGodModule: finds oversized module", () => {
  assert.ok(detectGodModule([{ name: "BigMod", exportCount: 40, lineCount: 500 }]).length > 0);
});
test("detectCircularDependency: finds cycle A→B→A", () => {
  assert.ok(detectCircularDependency({ A: ["B"], B: ["A"] }).length > 0);
});
test("detectCircularDependency: no false positive for DAG", () => {
  assert.deepEqual(detectCircularDependency({ A: ["B"], B: ["C"], C: [] }), []);
});
test("computeInstability: returns 0 for no deps", () => { assert.equal(computeInstability(0, 0), 0); });
test("computeInstability: returns 1 for pure efferent", () => { assert.equal(computeInstability(0, 5), 1); });
test("computeAbstractness: returns 0.5 for half abstract", () => { assert.equal(computeAbstractness(5, 10), 0.5); });
test("computeDistanceFromMainSeq: returns 0 for A+I=1", () => { assert.equal(computeDistanceFromMainSeq(0.5, 0.5), 0); });
test("classifyArchSmell: detects zone-of-pain", () => {
  assert.equal(classifyArchSmell({ instability: 0.1, abstractness: 0.1, distance: 0.8 }), "zone-of-pain");
});
test("classifyArchSmell: detects healthy", () => {
  assert.equal(classifyArchSmell({ instability: 0.5, abstractness: 0.5, distance: 0.0 }), "healthy");
});
test("detectBigBallOfMud: flags over-coupled module", () => {
  const deps = { A: ["B","C","D","E","F","G","H","I"], B:[], C:[], D:[], E:[], F:[], G:[], H:[], I:[] };
  assert.ok(detectBigBallOfMud(deps).includes("A"));
});
test("scoreArchitecturalFitness: returns 0-100", () => {
  const score = scoreArchitecturalFitness({ cbo: 5, lcom: 0.3, dit: 2, wmc: 10, fanIn: 3, fanOut: 4, instability: 0.5, abstractness: 0.5, distanceFromMainSeq: 0 });
  assert.ok(score >= 0 && score <= 100);
});

// ═════════════════════════════════════════════════════════════════════════════
// test-generator helpers
// ═════════════════════════════════════════════════════════════════════════════
test("detectTestableUnits: finds exported functions", () => {
  const units = detectTestableUnits(["export function add(a: number, b: number): number {", "  return a + b;", "}"]);
  assert.ok(units.length > 0);
  assert.equal(units[0].name, "add");
});
test("generateBoundaryInputs: includes min and max", () => {
  const inputs = generateBoundaryInputs(0, 100);
  assert.ok(inputs.includes(0));
  assert.ok(inputs.includes(100));
});
test("generateNullInputs: includes null and undefined", () => {
  const inputs = generateNullInputs();
  assert.ok(inputs.includes(null));
  assert.ok(inputs.includes(undefined));
});
test("generateNegativeStringInputs: includes empty string", () => {
  assert.ok(generateNegativeStringInputs().includes(""));
});
test("computeMutationScore: 100 for no mutants", () => { assert.equal(computeMutationScore(0, 0), 100); });
test("computeMutationScore: computes 80 for 8/10", () => { assert.equal(computeMutationScore(8, 10), 80); });
test("detectMissingAssertions: flags test without assert", () => {
  const lines = ['test("no assert", () => {', "  const x = 1;", "});"];
  assert.ok(detectMissingAssertions(lines).length > 0);
});
test("classifyTestType: detects integration test", () => {
  assert.equal(classifyTestType("x", "db.query('SELECT 1')"), "integration");
});
test("classifyTestType: defaults to unit", () => {
  assert.equal(classifyTestType("x", "const x = add(1, 2)"), "unit");
});
test("buildTestMatrix: creates entries for all units and scenarios", () => {
  const matrix = buildTestMatrix(["fn1", "fn2"], ["happy", "null"]);
  assert.ok("fn1" in matrix);
  assert.equal(matrix["fn1"]["happy"], false);
});
test("detectFlakyCandidates: finds setTimeout", () => {
  assert.ok(detectFlakyCandidates(["setTimeout(() => resolve(), 100)"]).length > 0);
});
test("scoreTestQuality: returns 0-100", () => {
  const score = scoreTestQuality({ coverage: 80, mutationScore: 70, flakyCandidates: 2, missingAssertions: 1 });
  assert.ok(score >= 0 && score <= 100);
});
test("generateEdgeCaseNames: generates per param", () => {
  const cases = generateEdgeCaseNames("add", ["a", "b"]);
  assert.ok(cases.some((c) => c.includes("null")));
});
test("detectTestSmells: finds focused test", () => {
  const result = detectTestSmells(["test.only('foo', () => {})"]);
  assert.ok(result.some((s) => s.smell === "focused-test-left-in"));
});
test("computeCoverage: returns 100 for 0 lines", () => { assert.equal(computeCoverage(0, 0), 100); });
test("computeCoverage: computes 80 for 80/100", () => { assert.equal(computeCoverage(100, 80), 80); });
test("prioritizeTestGeneration: orders by risk", () => {
  const units = [
    { name: "simple", complexity: 1, currentCoverage: 90 },
    { name: "risky", complexity: 10, currentCoverage: 10 },
  ];
  assert.equal(prioritizeTestGeneration(units)[0].name, "risky");
});
test("buildMockSpec: creates mock names", () => {
  const spec = buildMockSpec([{ name: "db", methods: ["findOne", "save"] }]);
  assert.ok(spec["db"].includes("mock_db_findOne"));
});

// ═════════════════════════════════════════════════════════════════════════════
// doc-writer helpers
// ═════════════════════════════════════════════════════════════════════════════
test("detectUndocumentedPublicAPIs: finds missing JSDoc", () => {
  const result = detectUndocumentedPublicAPIs(["const x = 1;", "export function foo() {}"]);
  assert.ok(result.some((r) => r.name === "foo"));
});
test("scoreDocCompleteness: 100 for all fields", () => {
  assert.equal(scoreDocCompleteness({ hasDescription: true, hasParams: true, hasReturns: true, hasExample: true, hasThrows: true }), 100);
});
test("scoreDocCompleteness: 0 for empty", () => {
  assert.equal(scoreDocCompleteness({ hasDescription: false, hasParams: false, hasReturns: false, hasExample: false, hasThrows: false }), 0);
});
test("extractParamTypes: parses signature", () => {
  const params = extractParamTypes("(a: string, b?: number)");
  assert.equal(params.length, 2);
  assert.equal(params[0].name, "a");
  assert.equal(params[1].optional, true);
});
test("buildJSDocBlock: produces valid comment", () => {
  const block = buildJSDocBlock("add", [{ name: "a", type: "number" }], "number", "Adds");
  assert.ok(block.startsWith("/**"));
  assert.ok(block.includes("@param"));
  assert.ok(block.includes("@returns"));
});
test("detectStaleDoc: finds renamed param", () => {
  assert.ok(detectStaleDoc(["oldParam"], ["newParam"]).length > 0);
});
test("scoreReadability: returns 0-100", () => {
  const score = scoreReadability("This is a simple test sentence.");
  assert.ok(score >= 0 && score <= 100);
});
test("detectMissingExamples: finds doc without example", () => {
  assert.ok(detectMissingExamples(["/** A function. */"]).includes(0));
});
test("buildChangelogEntry: produces correct format", () => {
  const entry = buildChangelogEntry("1.0.0", "2026-04-18", [{ type: "added", description: "New feature" }]);
  assert.ok(entry.includes("[1.0.0]"));
  assert.ok(entry.includes("Added"));
});
test("extractReturnType: extracts type", () => {
  assert.equal(extractReturnType("function foo(): Promise<string>"), "Promise<string>");
});
test("extractReturnType: returns void for no return", () => {
  assert.equal(extractReturnType("function foo()"), "void");
});
test("scoreAPIUsability: 100 for all features", () => {
  assert.equal(scoreAPIUsability({ hasDescription: true, hasExample: true, hasErrorDocs: true, hasTypes: true, wordCount: 50 }), 100);
});

// ═════════════════════════════════════════════════════════════════════════════
// bug-analyzer helpers
// ═════════════════════════════════════════════════════════════════════════════
test("classifyBugCategory: detects null-pointer", () => {
  assert.equal(classifyBugCategory("TypeError: cannot read property 'x' of undefined"), "null-pointer");
});
test("classifyBugCategory: detects network", () => {
  assert.equal(classifyBugCategory("ECONNREFUSED 127.0.0.1:3000"), "network");
});
test("classifyBugCategory: detects schema", () => {
  assert.equal(classifyBugCategory("SQLite constraint violation"), "schema");
});
test("classifyBugCategory: returns unknown for vague error", () => {
  assert.equal(classifyBugCategory("something went wrong"), "unknown");
});
test("scoreReproducibility: higher with test case", () => {
  assert.ok(scoreReproducibility(["step1"], true, false) > scoreReproducibility(["step1"], false, false));
});
test("buildRootCauseTree: produces maxDepth entries", () => {
  assert.equal(buildRootCauseTree("System crashed", 3).length, 3);
});
test("inferBugHotspots: extracts file:line from stacktrace", () => {
  const hotspots = inferBugHotspots("at Object.foo (src/utils.ts:42:10)");
  assert.ok(hotspots.length > 0);
  assert.ok(hotspots[0].includes("utils.ts"));
});
test("computeBugScore: critical > low", () => {
  assert.ok(computeBugScore("critical", 1) > computeBugScore("low", 1));
});
test("suggestBugFix: returns string for all categories", () => {
  for (const cat of ["null-pointer", "concurrency", "network", "schema", "resource", "logic", "unknown"]) {
    assert.equal(typeof suggestBugFix(cat), "string");
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// refactor-advisor helpers
// ═════════════════════════════════════════════════════════════════════════════
test("detectLongMethod: finds long methods", () => {
  const lines = ["function foo() {", ...Array(25).fill("  x();"), "}"];
  assert.ok(detectLongMethod(lines, 20).length > 0);
});
test("detectLargeClass: true for >15 methods", () => {
  assert.equal(detectLargeClass(20, 15), true);
  assert.equal(detectLargeClass(5, 15), false);
});
test("detectPrimitiveObsession: detects 4 string params", () => {
  const params = [{ name: "a", type: "string" }, { name: "b", type: "string" }, { name: "c", type: "string" }, { name: "d", type: "string" }];
  assert.equal(detectPrimitiveObsession(params), true);
});
test("detectSwitchStatements: finds large switch", () => {
  assert.ok(detectSwitchStatements(["switch (x) {", "case 1:", "case 2:", "case 3:", "case 4:", "}"]).length > 0);
});
test("computeRefactoringRisk: returns 0-100", () => {
  const risk = computeRefactoringRisk({ linesChanged: 50, testedLines: 80, hasIntegrationTests: true });
  assert.ok(risk >= 0 && risk <= 100);
});
test("prioritizeRefactoring: orders by ROI", () => {
  const issues = [{ name: "low-impact", impact: 10, risk: 5 }, { name: "high-impact", impact: 90, risk: 5 }];
  assert.equal(prioritizeRefactoring(issues)[0].name, "high-impact");
});
test("buildRefactoringPlan: generates steps", () => {
  const plan = buildRefactoringPlan([{ name: "GodClass", type: "large-class", line: 10 }]);
  assert.ok(plan.length > 0);
  assert.ok(plan[0].includes("Step 1"));
});
test("detectDivergentChange: detects multiple domains", () => {
  assert.equal(detectDivergentChange(["auth-login", "billing-invoice", "email-send"]), true);
  assert.equal(detectDivergentChange(["auth-login", "auth-register"]), false);
});
test("detectShotgunSurgery: detects many small changes across files", () => {
  assert.equal(detectShotgunSurgery(["a","b","c","d","e","f"], [1,1,1,1,1,1]), true);
  assert.equal(detectShotgunSurgery(["a","b"], [20, 20]), false);
});

// ═════════════════════════════════════════════════════════════════════════════
// security-scanner helpers
// ═════════════════════════════════════════════════════════════════════════════
test("detectInjection: finds template literal SQL", () => {
  const result = detectInjection(["db.query(`SELECT * FROM users WHERE id = ${req.body.id}`)"]);
  assert.ok(result.length > 0);
  assert.equal(result[0].severity, "critical");
});
test("detectXSS: finds innerHTML", () => {
  assert.ok(detectXSS(["div.innerHTML = userInput;"]).length > 0);
});
test("detectHardcodedCredentials: finds password", () => {
  const result = detectHardcodedCredentials(['password: "hunter2"']);
  assert.ok(result.length > 0);
  assert.equal(result[0].severity, "critical");
});
test("detectWeakCrypto: finds MD5", () => {
  assert.ok(detectWeakCrypto(["crypto.createHash('md5').update(data)"]).length > 0);
});
test("detectPathTraversal: finds user-controlled path", () => {
  assert.ok(detectPathTraversal(["fs.readFile(req.params.filePath, 'utf-8')"]).length > 0);
});
test("detectInsecureRandom: finds Math.random in security context", () => {
  assert.ok(detectInsecureRandom(["const token = Math.random().toString(36);"]).length > 0);
});
test("detectMissingAuth: flags route without middleware", () => {
  assert.ok(detectMissingAuth([{ path: "/admin", middleware: [] }]).some((r) => r.path === "/admin"));
});
test("detectMissingAuth: passes route with auth", () => {
  assert.equal(detectMissingAuth([{ path: "/admin", middleware: ["authenticate"] }]).length, 0);
});
test("detectCSRFMissing: flags POST without csrf", () => {
  assert.ok(detectCSRFMissing([{ method: "POST", path: "/submit", middleware: [] }]).length > 0);
});
test("mapToOWASP2025: maps injection", () => { assert.ok(mapToOWASP2025("injection").includes("Injection")); });
test("scoreCVSS: returns 0-10", () => {
  const score = scoreCVSS({ attackVector: "network", complexity: "low", privilegeRequired: false, userInteraction: false, impact: "high" });
  assert.ok(score >= 0 && score <= 10);
});
test("classifySecuritySeverity: maps correctly", () => {
  assert.equal(classifySecuritySeverity(9.5), "critical");
  assert.equal(classifySecuritySeverity(7.0), "high");
  assert.equal(classifySecuritySeverity(5.0), "medium");
  assert.equal(classifySecuritySeverity(2.0), "low");
});
test("buildSecurityReport: summarizes findings", () => {
  const report = buildSecurityReport([{ rule: "injection", severity: "critical", message: "SQL injection" }]);
  assert.equal(report.criticalCount, 1);
  assert.equal(report.passedOWASP, false);
});
test("detectInsecureHeaders: finds missing CSP", () => {
  assert.ok(detectInsecureHeaders({ "X-Frame-Options": "DENY" }).includes("Content-Security-Policy"));
});
test("buildRemediationPlan: orders critical first", () => {
  const findings = [
    { rule: "x", severity: "low", message: "minor" },
    { rule: "y", severity: "critical", message: "critical issue" },
  ];
  assert.equal(buildRemediationPlan(findings)[0].effort, "immediate");
});

// ═════════════════════════════════════════════════════════════════════════════
// performance helpers
// ═════════════════════════════════════════════════════════════════════════════
test("detectNPlusOneQuery: finds query in loop", () => {
  const lines = ["for (const user of users) {", "  db.findOne({ id: user.id });", "}"];
  assert.ok(detectNPlusOneQuery(lines).length > 0);
});
test("detectSynchronousIO: finds readFileSync", () => {
  assert.ok(detectSynchronousIO(["const data = fs.readFileSync('file.txt', 'utf-8');"]).length > 0);
});
test("computeComplexityClass: O(1) for no loops", () => {
  assert.equal(computeComplexityClass(["const x = 1;"]), "O(1)");
});
test("computeComplexityClass: O(n) for one loop", () => {
  assert.equal(computeComplexityClass(["for (let i = 0; i < n; i++) {", "  x++;", "}"]), "O(n)");
});
test("computeComplexityClass: O(n²) for nested loop", () => {
  const lines = ["for (let i = 0; i < n; i++) {", "for (let j = 0; j < n; j++) {", "  x++;", "}", "}"];
  assert.equal(computeComplexityClass(lines), "O(n²)");
});
test("detectBundleBloat: finds lodash import", () => {
  assert.ok(detectBundleBloat(["import _ from 'lodash'"]).length > 0);
});
test("scorePerformanceRisk: returns 0 for no issues", () => { assert.equal(scorePerformanceRisk([]), 0); });
test("scorePerformanceRisk: scales with severity", () => {
  assert.ok(scorePerformanceRisk([{ severity: "high" }, { severity: "medium" }]) > 0);
});
test("buildPerformanceReport: includes total issues", () => {
  const report = buildPerformanceReport({ nPlusOne: 2, syncIO: 1, complexityClass: "O(n)", bundleBloat: 0, leakySubscriptions: 0 });
  assert.equal(report.totalIssues, 3);
});
test("suggestPerformanceOptimization: returns non-empty string", () => {
  assert.ok(suggestPerformanceOptimization("n+1").length > 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// API designer helpers
// ═════════════════════════════════════════════════════════════════════════════
test("detectVerbMisuse: flags GET with create in path", () => {
  assert.ok(detectVerbMisuse([{ method: "GET", path: "/create-user" }]).length > 0);
});
test("detectInconsistentNaming: flags uppercase in path", () => {
  assert.ok(detectInconsistentNaming([{ method: "GET", path: "/GetUsers" }]).length > 0);
});
test("detectMissingPagination: finds unbounded list", () => {
  assert.ok(detectMissingPagination([{ method: "GET", path: "/users", middleware: [] }]).length > 0);
});
test("detectMissingVersioning: true for unversioned routes", () => {
  assert.equal(detectMissingVersioning([{ method: "GET", path: "/users" }]), true);
});
test("detectMissingVersioning: false for versioned routes", () => {
  assert.equal(detectMissingVersioning([{ method: "GET", path: "/v1/users" }]), false);
});
test("scoreRESTMaturity: returns level object", () => {
  const result = scoreRESTMaturity([{ method: "GET", path: "/users" }]);
  assert.ok("level" in result && "description" in result);
});
test("scoreAPIConsistency: returns 0-100", () => {
  const score = scoreAPIConsistency([{ method: "GET", path: "/users" }]);
  assert.ok(score >= 0 && score <= 100);
});
test("buildAPIHealthReport: returns totalRoutes", () => {
  assert.equal(buildAPIHealthReport([{ method: "GET", path: "/users" }]).totalRoutes, 1);
});
test("detectBreakingChanges: finds removed route", () => {
  const v1 = [{ method: "GET", path: "/old" }];
  const v2 = [{ method: "GET", path: "/new" }];
  assert.ok(detectBreakingChanges(v1, v2).length > 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// DB advisor helpers
// ═════════════════════════════════════════════════════════════════════════════
test("detectUnboundedQuery: finds SELECT without LIMIT", () => {
  assert.ok(detectUnboundedQuery([{ sql: "SELECT * FROM users" }]).length > 0);
});
test("detectUnboundedQuery: passes query with LIMIT", () => {
  assert.equal(detectUnboundedQuery([{ sql: "SELECT * FROM users LIMIT 10" }]).length, 0);
});
test("detectCartesianJoin: finds missing ON clause", () => {
  assert.ok(detectCartesianJoin([{ sql: "SELECT * FROM a, b" }]).length > 0);
});
test("computeSelectivity: returns 1 for all unique", () => {
  assert.equal(computeSelectivity(100, 100), 1);
});
test("computeSelectivity: returns low for low distinct", () => {
  assert.ok(computeSelectivity(2, 100) < 0.1);
});
test("scoreQueryComplexity: complex > simple", () => {
  const simple = scoreQueryComplexity({ sql: "SELECT * FROM users LIMIT 10" });
  const complex = scoreQueryComplexity({ sql: "SELECT * FROM a JOIN b ON a.id=b.id JOIN c ON b.id=c.id GROUP BY a.id" });
  assert.ok(complex > simple);
});
test("buildDBHealthReport: includes healthScore of 100 for clean DB", () => {
  const report = buildDBHealthReport({ unboundedQueries: 0, cartesianJoins: 0, missingIndexes: 0, redundantIndexes: 0, normalizationLevel: 3, lockContentionTables: [] });
  assert.equal(report.healthScore, 100);
});
test("detectTableScanRisk: true without indexed column", () => {
  assert.equal(detectTableScanRisk({ sql: "SELECT * FROM users WHERE email = ?" }, ["id"]), true);
});
test("detectTableScanRisk: false with indexed column", () => {
  assert.equal(detectTableScanRisk({ sql: "SELECT * FROM users WHERE email = ?" }, ["email"]), false);
});

// ─── devopsHelpers imports ─────────────────────────────────────────────────────
import {
  computePipelineDuration, findPipelineBottleneck, detectFailedStages,
  computeSuccessRate, scorePipelineHealth, classifyCICDMaturity,
  estimateDORAMetrics, detectMissingGates,
  detectOverProvisioned, detectUnderProvisioned, scoreResiliency,
  detectSinglePointsOfFailure, scoreIaCAdoption,
  selectDeployStrategy, buildCanarySchedule, validateDeploymentReadiness,
  computeDeployBlastRadius, buildRollbackPlan, estimateDowntime,
  computeSLOCompliance, computeBaseline, detectAnomalies,
  scoreObservability, computeErrorBudget,
  classifyIncidentPriority, computeMTTD, buildIncidentRunbook,
  scoreIncidentResponse,
  detectIdleResources, scoreCostEfficiency, detectCostAnomalies,
} from "../src/workers/helpers/devopsHelpers.ts";

// ═════════════════════════════════════════════════════════════════════════════
// devops helpers
// ═════════════════════════════════════════════════════════════════════════════
test("devops: computePipelineDuration sums stages", () => {
  const stages = [{ name: "build", status: "success", durationMs: 60000 }, { name: "test", status: "success", durationMs: 30000 }];
  assert.equal(computePipelineDuration(stages), 90000);
});
test("devops: findPipelineBottleneck returns longest stage", () => {
  const stages = [{ name: "test", status: "success", durationMs: 120000 }, { name: "build", status: "success", durationMs: 30000 }];
  assert.equal(findPipelineBottleneck(stages)?.name, "test");
});
test("devops: findPipelineBottleneck returns null for empty", () => { assert.equal(findPipelineBottleneck([]), null); });
test("devops: detectFailedStages returns only failures", () => {
  const stages = [{ name: "build", status: "success" }, { name: "test", status: "failure" }];
  assert.equal(detectFailedStages(stages).length, 1);
});
test("devops: computeSuccessRate returns 100 for all success", () => {
  assert.equal(computeSuccessRate([{ success: true }, { success: true }]), 100);
});
test("devops: computeSuccessRate returns 50 for half success", () => {
  assert.equal(computeSuccessRate([{ success: true }, { success: false }]), 50);
});
test("devops: classifyCICDMaturity level 1 for nothing", () => {
  assert.equal(classifyCICDMaturity({ hasCI: false, hasCD: false, hasAutoRollback: false, hasPolicyAsCode: false, hasDriftDetection: false }).level, 1);
});
test("devops: classifyCICDMaturity level 5 for full gitops", () => {
  assert.equal(classifyCICDMaturity({ hasCI: true, hasCD: true, hasAutoRollback: true, hasPolicyAsCode: true, hasDriftDetection: true }).level, 5);
});
test("devops: estimateDORAMetrics returns Elite for high deploy freq", () => {
  const metrics = estimateDORAMetrics({ deploysPerDay: 5, leadTimeHours: 0.5, changeFailureRate: 0.03, mttrHours: 0.5 });
  assert.equal(metrics.deploymentFrequency, "Elite");
});
test("devops: detectMissingGates finds missing check", () => {
  assert.ok(detectMissingGates([{ name: "build", status: "success" }], ["lint", "build"]).includes("lint"));
});
test("devops: detectOverProvisioned finds low utilization", () => {
  assert.ok(detectOverProvisioned([{ name: "r1", type: "compute", region: "us-east-1", utilizationPercent: 5 }], 20).length > 0);
});
test("devops: detectUnderProvisioned finds high utilization", () => {
  assert.ok(detectUnderProvisioned([{ name: "r1", type: "compute", region: "us-east-1", utilizationPercent: 95 }], 85).length > 0);
});
test("devops: scoreResiliency 100 for all true", () => {
  assert.equal(scoreResiliency({ hasMultiAZ: true, hasAutoScaling: true, hasHealthChecks: true, hasDR: true, hasBackups: true }), 100);
});
test("devops: scoreResiliency 0 for all false", () => {
  assert.equal(scoreResiliency({ hasMultiAZ: false, hasAutoScaling: false, hasHealthChecks: false, hasDR: false, hasBackups: false }), 0);
});
test("devops: detectSinglePointsOfFailure finds singleton type", () => {
  assert.ok(detectSinglePointsOfFailure([{ name: "db", type: "database", region: "us-east-1" }]).includes("database"));
});
test("devops: selectDeployStrategy picks blue-green for low risk", () => {
  assert.equal(selectDeployStrategy({ hasStatefulSessions: false, canBlueGreen: true, riskTolerance: "low", traffic: 100 }), "blue-green");
});
test("devops: buildCanarySchedule ends at 100%", () => {
  const schedule = buildCanarySchedule(3);
  assert.equal(schedule[schedule.length - 1].trafficPercent, 100);
});
test("devops: validateDeploymentReadiness returns per-check results", () => {
  const checks = { testsPass: true, migrationReviewed: false, rollbackPlanExists: true, featureFlagsConfigured: true, monitoringAlertsDefined: false };
  assert.equal(validateDeploymentReadiness(checks).length, 5);
});
test("devops: computeDeployBlastRadius returns 0-100", () => {
  const radius = computeDeployBlastRadius({ affectedServices: 3, hasDataMigration: true, isPublicFacing: true, trafficPercent: 100 });
  assert.ok(radius >= 0 && radius <= 100);
});
test("devops: buildRollbackPlan includes migration step", () => {
  const plan = buildRollbackPlan({ strategy: "blue-green", hasDataMigration: true, estimatedRollbackMinutes: 5 });
  assert.ok(plan.some((step) => /migration/.test(step.toLowerCase())));
});
test("devops: estimateDowntime returns 0 for blue-green", () => { assert.equal(estimateDowntime("blue-green", 3), 0); });
test("devops: computeSLOCompliance returns 100 when at target", () => {
  assert.equal(computeSLOCompliance({ target: 99.9, measuredValue: 99.9, isHigherBetter: true }), 100);
});
test("devops: computeBaseline computes mean", () => {
  assert.equal(computeBaseline([1, 2, 3, 4, 5]).mean, 3);
});
test("devops: detectAnomalies finds spike", () => {
  assert.ok(detectAnomalies([10, 10, 10, 10, 10, 10, 100], 2).length > 0);
});
test("devops: scoreObservability 0 for nothing", () => {
  assert.equal(scoreObservability({ hasMetrics: false, hasLogs: false, hasTraces: false, hasAlerts: false, hasDashboard: false }), 0);
});
test("devops: computeErrorBudget returns positive remaining", () => {
  assert.ok(computeErrorBudget(99.9, 99.95, 30).remainingMinutes > 0);
});
test("devops: classifyIncidentPriority P1 for critical", () => { assert.equal(classifyIncidentPriority("critical", 50), "P1"); });
test("devops: classifyIncidentPriority P1 for 1000+ users", () => { assert.equal(classifyIncidentPriority("low", 2000), "P1"); });
test("devops: computeMTTD returns 15 min", () => {
  assert.equal(computeMTTD(new Date("2026-04-18T10:00:00Z"), new Date("2026-04-18T10:15:00Z")), 15);
});
test("devops: buildIncidentRunbook returns ordered steps", () => {
  assert.ok(buildIncidentRunbook({ category: "outage", severity: "critical", service: "api" }).length > 5);
});
test("devops: scoreIncidentResponse penalizes long MTTR", () => {
  const fast = scoreIncidentResponse({ mttdMinutes: 5, mttrMinutes: 15, hadRunbook: true, hadPostmortem: true });
  const slow = scoreIncidentResponse({ mttdMinutes: 60, mttrMinutes: 300, hadRunbook: false, hadPostmortem: false });
  assert.ok(fast > slow);
});
test("devops: detectIdleResources finds <5% utilization", () => {
  assert.ok(detectIdleResources([{ name: "idle", type: "compute", region: "us-east-1", utilizationPercent: 2 }]).length > 0);
});
test("devops: detectCostAnomalies finds spike vs baseline", () => {
  assert.ok(detectCostAnomalies([100,100,100,100,100,100,100,300]).length > 0);
});

// ─── governanceHelpers imports ────────────────────────────────────────────────
import {
  computeRICE, scoreEisenhower, computeSprintUtilization,
  detectSprintOverallocation, rankTasksByPriority, buildSprintPlan,
  computeVelocity, detectUnassignedTasks,
  computeDebtCost, classifyDebtSeverity, computeTotalDebt,
  prioritizeDebt, detectAgedDebt, scoreDebtHealth,
  buildOnboardingChecklist, scoreOnboardingProgress, detectKnowledgeGaps,
  validateResultSignals, scoreWorkerOutput, detectSchemaDrift,
  scoreIAMCompliance, detectOverPermissiveRoles,
  scoreSecretRotation, detectStaleSecrets,
  computeWorkerReliability, classifyWorkerHealth,
  inferFailureCauses, judgeWorkerRemedy, buildWorkerRebuildPlan,
  buildAuditReport,
} from "../src/workers/helpers/governanceHelpers.ts";

// ═════════════════════════════════════════════════════════════════════════════
// governance helpers
// ═════════════════════════════════════════════════════════════════════════════
test("governance: computeRICE returns 0 for 0 effort", () => { assert.equal(computeRICE(100, 5, 80, 0), 0); });
test("governance: scoreEisenhower 100 for urgent+important", () => { assert.equal(scoreEisenhower(true, true).score, 100); });
test("governance: scoreEisenhower 10 for neither", () => { assert.equal(scoreEisenhower(false, false).score, 10); });
test("governance: computeSprintUtilization computes ratio", () => {
  const tasks = [{ id: "1", title: "a", estimate: 5, priority: "high" }, { id: "2", title: "b", estimate: 5, priority: "low" }];
  assert.equal(computeSprintUtilization(tasks, 20), 50);
});
test("governance: detectSprintOverallocation returns true", () => {
  assert.equal(detectSprintOverallocation([{ id: "1", title: "a", estimate: 25, priority: "high" }], 20), true);
});
test("governance: rankTasksByPriority puts critical first", () => {
  const tasks = [{ id: "1", title: "a", estimate: 1, priority: "low" }, { id: "2", title: "b", estimate: 1, priority: "critical" }];
  assert.equal(rankTasksByPriority(tasks)[0].priority, "critical");
});
test("governance: buildSprintPlan fits within capacity", () => {
  const tasks = [{ id: "1", title: "big", estimate: 30, priority: "high" }, { id: "2", title: "small", estimate: 5, priority: "high" }];
  const { overflow } = buildSprintPlan(tasks, 20);
  assert.ok(overflow.length > 0);
});
test("governance: computeVelocity returns stable for constant points", () => {
  assert.equal(computeVelocity([20, 20, 20]).trend, "stable");
});
test("governance: detectUnassignedTasks finds unassigned", () => {
  assert.ok(detectUnassignedTasks([{ id: "1", title: "a", estimate: 1, priority: "low" }]).length > 0);
});
test("governance: computeDebtCost increases with age", () => {
  const young = computeDebtCost({ id: "1", description: "x", effort: "small", impact: "medium", category: "test", age: 1 });
  const old = computeDebtCost({ id: "2", description: "x", effort: "small", impact: "medium", category: "test", age: 365 });
  assert.ok(old > young);
});
test("governance: classifyDebtSeverity flags security as critical", () => {
  assert.equal(classifyDebtSeverity({ id: "1", description: "vuln", effort: "small", impact: "high", category: "security", age: 30 }), "critical");
});
test("governance: computeTotalDebt > 0 for items", () => {
  assert.ok(computeTotalDebt([{ id: "1", description: "a", effort: "small", impact: "low", category: "test", age: 10 }]) > 0);
});
test("governance: prioritizeDebt high-impact/small-effort first", () => {
  const items = [
    { id: "1", description: "a", effort: "large", impact: "low", category: "test", age: 10 },
    { id: "2", description: "b", effort: "small", impact: "high", category: "design", age: 10 },
  ];
  assert.equal(prioritizeDebt(items)[0].id, "2");
});
test("governance: detectAgedDebt finds old items", () => {
  assert.ok(detectAgedDebt([{ id: "1", description: "a", effort: "small", impact: "low", category: "test", age: 200 }], 180).length > 0);
});
test("governance: scoreDebtHealth returns 100 for empty", () => { assert.equal(scoreDebtHealth([]), 100); });
test("governance: buildOnboardingChecklist includes base items", () => { assert.ok(buildOnboardingChecklist("engineer").length > 5); });
test("governance: scoreOnboardingProgress computes 50%", () => { assert.equal(scoreOnboardingProgress(5, 10), 50); });
test("governance: detectKnowledgeGaps finds missing skills", () => {
  const gaps = detectKnowledgeGaps(["TypeScript", "React", "SQL"], ["TypeScript"]);
  assert.ok(gaps.includes("React"));
});
test("governance: validateResultSignals finds missing signal", () => {
  const { valid, missing } = validateResultSignals({ a: 1 }, ["a", "b"]);
  assert.equal(valid, false);
  assert.ok(missing.includes("b"));
});
test("governance: scoreWorkerOutput 100 when all present", () => {
  assert.equal(scoreWorkerOutput({ a: 1, b: 2 }, ["a", "b"]), 100);
});
test("governance: detectSchemaDrift finds missing field", () => {
  assert.ok(detectSchemaDrift({ foo: "string" }, {}).some((d) => d.field === "foo" && d.actualType === "missing"));
});
test("governance: detectSchemaDrift finds type mismatch", () => {
  assert.ok(detectSchemaDrift({ foo: "string" }, { foo: 42 }).some((d) => d.actualType === "number"));
});
test("governance: scoreIAMCompliance 100 for no wildcards", () => {
  assert.equal(scoreIAMCompliance([{ role: "reader", resources: ["bucket/data"], actions: ["read"] }]), 100);
});
test("governance: detectOverPermissiveRoles finds wildcard", () => {
  assert.ok(detectOverPermissiveRoles([{ role: "admin", actions: ["*"] }]).includes("admin"));
});
test("governance: scoreSecretRotation 0 for all stale", () => {
  assert.equal(scoreSecretRotation([{ name: "db_pass", lastRotatedDays: 200, maxAgeDays: 90 }]), 0);
});
test("governance: detectStaleSecrets finds overdue", () => {
  assert.ok(detectStaleSecrets([{ name: "api_key", lastRotatedDays: 100, maxAgeDays: 90 }]).includes("api_key"));
});
test("governance: computeWorkerReliability 100 for no failures", () => {
  assert.equal(computeWorkerReliability({ agentType: "a", failureCount: 0, successCount: 10, avgDurationMs: 100 }), 100);
});
test("governance: classifyWorkerHealth healthy for >95%", () => { assert.equal(classifyWorkerHealth(96), "healthy"); });
test("governance: classifyWorkerHealth critical for <80%", () => { assert.equal(classifyWorkerHealth(70), "critical"); });
test("governance: inferFailureCauses detects schema issue", () => {
  assert.ok(inferFailureCauses("SQLite column not found").includes("storage-contract-drift"));
});
test("governance: judgeWorkerRemedy rebuild for >5 failures", () => {
  assert.equal(judgeWorkerRemedy({ agentType: "x", failureCount: 6, successCount: 1, avgDurationMs: 0 }, []), "rebuild_worker");
});
test("governance: buildWorkerRebuildPlan generates steps", () => {
  assert.ok(buildWorkerRebuildPlan("code-reviewer", ["prompt-schema-mismatch"]).length > 0);
});
test("governance: buildAuditReport summarizes fleet", () => {
  const profiles = [
    { agentType: "a", failureCount: 0, successCount: 100, avgDurationMs: 100 },
    { agentType: "b", failureCount: 10, successCount: 5, avgDurationMs: 500 },
  ];
  const report = buildAuditReport(profiles);
  assert.equal(report.totalWorkers, 2);
  assert.ok(report.criticalWorkers >= 1);
});

// ─── dataHelpers imports ───────────────────────────────────────────────────────
import {
  classifyDatasetSize, scoreDataQuality, detectDuplicateColumns,
  normalizeColumnNames, inferColumnType, detectHighCardinality,
  selectMLFeatures, computeJoinComplexity, classifyMLSuitability,
  detectOutliersIQR,
  detectStaleIndexEntries, computeIndexFreshness, buildIndexingBatchPlan,
  scoreIndexCoverage,
  computeRemainingBudget, computeBudgetUtilization, detectLowBudgetProviders,
  recommendExecutionMode, buildTokenVaultSummary, detectTokenWaste,
  scoreAccountHealth, detectDisconnectedAccounts, computeRoutingPreference,
} from "../src/workers/helpers/dataHelpers.ts";

// ═════════════════════════════════════════════════════════════════════════════
// data helpers
// ═════════════════════════════════════════════════════════════════════════════
test("data: classifyDatasetSize correct tiers", () => {
  assert.equal(classifyDatasetSize(50), "micro");
  assert.equal(classifyDatasetSize(5000), "small");
  assert.equal(classifyDatasetSize(50000), "medium");
  assert.equal(classifyDatasetSize(500000), "large");
  assert.equal(classifyDatasetSize(2000000), "bigdata");
});
test("data: scoreDataQuality 100 for clean dataset", () => {
  assert.equal(scoreDataQuality({ name: "c", domain: "s", rows: 1000, columns: ["id"], hasNulls: false, hasOutliers: false }), 100);
});
test("data: scoreDataQuality penalizes nulls", () => {
  assert.ok(scoreDataQuality({ name: "d", domain: "s", rows: 1000, columns: ["id"], hasNulls: true, hasOutliers: false }) < 100);
});
test("data: detectDuplicateColumns finds duplicates", () => {
  assert.deepEqual(detectDuplicateColumns(["a", "b", "a"]), ["a"]);
});
test("data: normalizeColumnNames converts to snake_case", () => {
  assert.deepEqual(normalizeColumnNames(["First Name"]), ["first_name"]);
});
test("data: inferColumnType detects date string", () => { assert.equal(inferColumnType("2026-04-18"), "date"); });
test("data: inferColumnType detects number string", () => { assert.equal(inferColumnType("42"), "number"); });
test("data: inferColumnType detects null", () => { assert.equal(inferColumnType(null), "null"); });
test("data: detectHighCardinality finds high cardinality column", () => {
  assert.ok(detectHighCardinality([{ name: "uuid", distinctValues: 999, totalRows: 1000 }]).includes("uuid"));
});
test("data: selectMLFeatures excludes ID columns", () => {
  const cols = [
    { name: "id", distinctValues: 1000, totalRows: 1000, type: "number" },
    { name: "name", distinctValues: 500, totalRows: 1000, type: "string" },
  ];
  const features = selectMLFeatures(cols);
  assert.ok(!features.includes("id"));
  assert.ok(features.includes("name"));
});
test("data: computeJoinComplexity 0 joins for 1 dataset", () => {
  assert.equal(computeJoinComplexity([{ name: "a", domain: "x", rows: 100, columns: ["id"] }]).joins, 0);
});
test("data: classifyMLSuitability schema-only for 0 rows", () => {
  assert.equal(classifyMLSuitability({ name: "a", domain: "x", rows: 0, columns: ["id"] }), "schema-only");
});
test("data: detectOutliersIQR finds 1000 as outlier", () => {
  assert.ok(detectOutliersIQR([10, 11, 10, 12, 10, 11, 10, 1000]).includes(1000));
});
test("data: detectStaleIndexEntries finds modified sources", () => {
  assert.ok(detectStaleIndexEntries([{ path: "a.ts", indexedAt: 1000, sourceModifiedAt: 2000 }]).includes("a.ts"));
});
test("data: computeIndexFreshness 1 for all fresh", () => {
  assert.equal(computeIndexFreshness([{ indexedAt: 2000, sourceModifiedAt: 1000 }]), 1);
});
test("data: buildIndexingBatchPlan creates correct batches", () => {
  const batches = buildIndexingBatchPlan(["a", "b", "c", "d", "e"], 2);
  assert.equal(batches.length, 3);
});
test("data: scoreIndexCoverage 100 for all indexed", () => { assert.equal(scoreIndexCoverage(10, 10), 100); });
test("data: computeRemainingBudget correct amount", () => {
  assert.equal(computeRemainingBudget({ provider: "a", totalTokens: 1000, usedTokens: 300 }), 700);
});
test("data: computeBudgetUtilization 30 for 300/1000", () => {
  assert.equal(computeBudgetUtilization({ provider: "a", totalTokens: 1000, usedTokens: 300 }), 30);
});
test("data: detectLowBudgetProviders finds >80% used", () => {
  assert.ok(detectLowBudgetProviders([{ provider: "openai", totalTokens: 1000, usedTokens: 900 }], 20).length > 0);
});
test("data: recommendExecutionMode local for >90% used", () => {
  assert.equal(recommendExecutionMode({ provider: "x", totalTokens: 1000, usedTokens: 950 }, "simple"), "local");
});
test("data: buildTokenVaultSummary includes recommendation", () => {
  assert.ok("recommendation" in buildTokenVaultSummary([{ provider: "a", totalTokens: 1000, usedTokens: 500 }]));
});
test("data: detectTokenWaste finds ai-assisted for simple", () => {
  const waste = detectTokenWaste([{ worker: "r", mode: "ai-assisted", tokensUsed: 1000, complexity: "simple" }]);
  assert.ok(waste.length > 0);
});
test("data: scoreAccountHealth >80 for connected account", () => {
  assert.ok(scoreAccountHealth({ provider: "a", accountName: "m", status: "connected", regions: ["us-east-1"], lastPing: new Date().toISOString() }) > 80);
});
test("data: detectDisconnectedAccounts finds disconnected", () => {
  assert.ok(detectDisconnectedAccounts([{ provider: "x", accountName: "a", status: "disconnected", regions: [] }]).length > 0);
});
test("data: computeRoutingPreference returns connected first", () => {
  const accounts = [
    { provider: "a", accountName: "a1", status: "disconnected", regions: [] },
    { provider: "b", accountName: "b1", status: "connected", regions: ["us-east-1"] },
  ];
  assert.equal(computeRoutingPreference(accounts)[0].provider, "b");
});

// ─── linguisticHelpers imports ────────────────────────────────────────────────
import {
  detectLanguage, detectEncodingIssues, normalizeText, correctSpanishTypos,
  correctEnglishTypos, autocorrectText, computeTextSimilarity,
  segmentSentences, scoreI18nReadiness, detectPassiveVoice, detectLongSentences,
  scoreGrammarConsistency, computeFleschKincaidGrade,
  detectUnreplacedPlaceholders,
} from "../src/workers/helpers/linguisticHelpers.ts";

// ═════════════════════════════════════════════════════════════════════════════
// linguistic helpers
// ═════════════════════════════════════════════════════════════════════════════
test("linguistic: detectLanguage detects English", () => {
  assert.equal(detectLanguage("The quick brown fox jumps over the lazy dog"), "en");
});
test("linguistic: detectLanguage detects Spanish", () => {
  assert.equal(detectLanguage("El perro corre por el parque de la ciudad"), "es");
});
test("linguistic: detectEncodingIssues finds mojibake", () => { assert.equal(detectEncodingIssues("cafÃ©"), true); });
test("linguistic: detectEncodingIssues false for clean text", () => { assert.equal(detectEncodingIssues("café"), false); });
test("linguistic: normalizeText collapses whitespace", () => { assert.equal(normalizeText("hello   world"), "hello world"); });
test("linguistic: correctSpanishTypos corrects enriquesimiento", () => {
  assert.equal(correctSpanishTypos("enriquesimiento"), "enriquecimiento");
});
test("linguistic: correctSpanishTypos corrects lavor", () => { assert.equal(correctSpanishTypos("lavor"), "labor"); });
test("linguistic: correctEnglishTypos corrects teh", () => { assert.equal(correctEnglishTypos("teh cat"), "the cat"); });
test("linguistic: autocorrectText applies Spanish corrections", () => {
  assert.ok(autocorrectText("enriquesimiento de lavor", "es").includes("enriquecimiento"));
});
test("linguistic: computeTextSimilarity 1 for identical", () => {
  assert.equal(computeTextSimilarity("hello world", "hello world"), 1);
});
test("linguistic: computeTextSimilarity 0 for different", () => {
  assert.equal(computeTextSimilarity("hello", "world"), 0);
});
test("linguistic: segmentSentences splits on period", () => {
  assert.ok(segmentSentences("First sentence. Second sentence.").length >= 2);
});
test("linguistic: scoreI18nReadiness 100 for fully i18n", () => {
  assert.equal(scoreI18nReadiness({ hasLocaleFiles: true, hasICUFormat: true, hardcodedStrings: 0, totalStrings: 10 }), 100);
});
test("linguistic: detectPassiveVoice finds passive sentence", () => {
  assert.ok(detectPassiveVoice(["The task was completed by the team."]).includes(0));
});
test("linguistic: detectLongSentences flags >30 words", () => {
  assert.ok(detectLongSentences(["word ".repeat(35).trim()], 30).includes(0));
});
test("linguistic: scoreGrammarConsistency 100 for clean text", () => {
  assert.equal(scoreGrammarConsistency("This is a clean sentence."), 100);
});
test("linguistic: computeFleschKincaidGrade returns number", () => {
  assert.equal(typeof computeFleschKincaidGrade("The cat sat on the mat."), "number");
});
test("linguistic: detectUnreplacedPlaceholders finds TODO", () => {
  assert.ok(detectUnreplacedPlaceholders("See [TODO: add details] for more.").length > 0);
});

// ─── recruitmentHelpers imports ───────────────────────────────────────────────
import {
  routeByCapability, selectPrimaryRoute, scoreAgentFit,
  detectOverloadedAgents, buildRosterAssignment, detectRosterGaps,
  computeRosterDiversity, scoreRecruitmentCompleteness,
  extractHTMLTitle, stripHTML, inferResearchDomain,
  isValidURL, deduplicateFindings,
  buildMemoryFact, detectStaleFacts, mergeDuplicateFacts,
  scoreMemoryRelevance, buildPointerEnvelope,
  computeApprovalStatus, validateInboundSchema, enrichCaptureRecord,
  scoreIntegrationRisk, detectIntegrationAntipatterns,
  classifyTriggerType, buildRetryPolicy, scoreWorkflowObservability,
} from "../src/workers/helpers/recruitmentHelpers.ts";

// ═════════════════════════════════════════════════════════════════════════════
// recruitment helpers
// ═════════════════════════════════════════════════════════════════════════════
test("recruitment: routeByCapability returns route for coding", () => {
  const route = routeByCapability("coding");
  assert.ok(route.provider && route.model && route.confidence > 0);
});
test("recruitment: selectPrimaryRoute picks highest confidence", () => {
  assert.ok(selectPrimaryRoute(["coding", "security"]).confidence >= 0.9);
});
test("recruitment: scoreAgentFit 0 for empty capabilities", () => {
  assert.equal(scoreAgentFit({ agentType: "a", capabilities: [], reliabilityScore: 0 }, ["coding"]), 0);
});
test("recruitment: scoreAgentFit high for matching capabilities", () => {
  assert.ok(scoreAgentFit({ agentType: "a", capabilities: ["coding"], reliabilityScore: 100 }, ["coding"]) > 70);
});
test("recruitment: detectOverloadedAgents finds >4 capabilities", () => {
  assert.ok(detectOverloadedAgents([{ agentType: "a", capabilities: ["coding","security","devops","data","research"] }]).length > 0);
});
test("recruitment: buildRosterAssignment returns route per agent", () => {
  const assignments = buildRosterAssignment([{ agentType: "code-reviewer", capabilities: ["coding"] }]);
  assert.ok("route" in assignments[0]);
});
test("recruitment: detectRosterGaps finds uncovered domain", () => {
  assert.ok(detectRosterGaps([{ agentType: "a", capabilities: ["coding"] }], ["coding", "security"]).includes("security"));
});
test("recruitment: computeRosterDiversity 0 for no agents", () => { assert.equal(computeRosterDiversity([]), 0); });
test("recruitment: scoreRecruitmentCompleteness 100 when all covered", () => {
  assert.equal(scoreRecruitmentCompleteness([{ agentType: "a", capabilities: ["coding"] }], ["coding"]), 100);
});
test("recruitment: extractHTMLTitle extracts title tag", () => {
  assert.equal(extractHTMLTitle("<html><head><title>Test</title></head></html>"), "Test");
});
test("recruitment: extractHTMLTitle null for no title", () => {
  assert.equal(extractHTMLTitle("<html><body>content</body></html>"), null);
});
test("recruitment: stripHTML removes tags", () => {
  const result = stripHTML("<p>Hello <b>world</b></p>");
  assert.ok(result.includes("Hello") && !result.includes("<p>"));
});
test("recruitment: inferResearchDomain detects security", () => {
  assert.equal(inferResearchDomain("OWASP vulnerability CVE exploit security"), "security");
});
test("recruitment: isValidURL true for valid URL", () => { assert.equal(isValidURL("https://example.com"), true); });
test("recruitment: isValidURL false for invalid", () => { assert.equal(isValidURL("not-a-url"), false); });
test("recruitment: deduplicateFindings removes duplicate URLs", () => {
  const findings = [
    { url: "https://a.com", title: "A", snippet: "..." },
    { url: "https://a.com", title: "A dup", snippet: "..." },
    { url: "https://b.com", title: "B", snippet: "..." },
  ];
  assert.equal(deduplicateFindings(findings).length, 2);
});
test("recruitment: buildMemoryFact creates timestamped fact", () => {
  const fact = buildMemoryFact("code-reviewer", "lastMode", "learned");
  assert.ok(fact.timestamp);
});
test("recruitment: detectStaleFacts finds expired fact", () => {
  const old = { key: "x", value: 1, source: "a", timestamp: new Date(Date.now() - 10000).toISOString(), ttl: 5 };
  assert.ok(detectStaleFacts([old]).length > 0);
});
test("recruitment: mergeDuplicateFacts keeps most recent", () => {
  const facts = [
    { key: "x", value: 1, source: "a", timestamp: "2026-01-01T00:00:00Z" },
    { key: "x", value: 2, source: "a", timestamp: "2026-04-18T00:00:00Z" },
  ];
  const merged = mergeDuplicateFacts(facts);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].value, 2);
});
test("recruitment: scoreMemoryRelevance 100 for full match", () => {
  assert.equal(scoreMemoryRelevance({ key: "mode", value: "learned", source: "x", timestamp: "" }, ["mode", "learned"]), 100);
});
test("recruitment: buildPointerEnvelope includes envelopeId", () => {
  assert.ok("envelopeId" in buildPointerEnvelope({ workspaceId: "ws1", agentType: "a", pointers: ["p1"] }));
});
test("recruitment: computeApprovalStatus approved when all present", () => {
  assert.equal(computeApprovalStatus(["engineering", "security"], ["engineering", "security"]).approved, true);
});
test("recruitment: computeApprovalStatus finds pending", () => {
  assert.ok(computeApprovalStatus(["engineering"], ["engineering", "security"]).pending.includes("security"));
});
test("recruitment: validateInboundSchema detects missing fields", () => {
  const { valid, missing } = validateInboundSchema({ name: "Joel" }, ["name", "email"]);
  assert.equal(valid, false);
  assert.ok(missing.includes("email"));
});
test("recruitment: enrichCaptureRecord adds capturedAt", () => {
  assert.ok("capturedAt" in enrichCaptureRecord({ name: "Joel" }, { source: "form" }));
});
test("recruitment: scoreIntegrationRisk high > low system count", () => {
  const low = scoreIntegrationRisk({ systemCount: 1, hasAuth: true, hasSchemaMismatch: false, isAsync: false });
  const high = scoreIntegrationRisk({ systemCount: 5, hasAuth: false, hasSchemaMismatch: true, isAsync: true });
  assert.ok(high > low);
});
test("recruitment: detectIntegrationAntipatterns finds direct DB access", () => {
  assert.ok(detectIntegrationAntipatterns({ hasDirectDBAccess: true, hasSharedMutableState: false, hasHardcodedEndpoints: false }).length > 0);
});
test("recruitment: classifyTriggerType detects schedule", () => {
  assert.equal(classifyTriggerType("daily cron at midnight"), "schedule");
});
test("recruitment: classifyTriggerType detects webhook", () => {
  assert.equal(classifyTriggerType("webhook endpoint"), "webhook");
});
test("recruitment: buildRetryPolicy creates exponential delays", () => {
  const policy = buildRetryPolicy(3, 1000);
  assert.equal(policy.maxRetries, 3);
  assert.ok(policy.delays[1] > policy.delays[0]);
});
test("recruitment: scoreWorkflowObservability 100 for all true", () => {
  assert.equal(scoreWorkflowObservability({ hasLogging: true, hasMetrics: true, hasAlerts: true, hasTracing: true }), 100);
});
