import type { Database } from "../storage/Database.ts";
import { AgentRepository } from "../storage/repositories/AgentRepository.ts";
import type { Agent, AgentRosterConfig } from "../storage/entities.ts";

export type RosterAgent = {
  name: string;
  adapterType: string;
  config: AgentRosterConfig;
};

// ─── Full roster for a software dev + DevOps company ─────────────────────────

export const SOFTWARE_DEV_DEVOPS_ROSTER: RosterAgent[] = [
  // ── Development ─────────────────────────────────────────────────────────────
  {
    name: "code-reviewer",
    adapterType: "roster",
    config: {
      role: "Pull request reviewer — style, correctness, security, maintainability",
      capabilities: ["pr_review", "style_check", "correctness", "security_hints"],
      queueName: "q.code-reviewer",
      systemPromptTemplate:
        "You are a senior software engineer doing a PR review. Focus on: correctness, security, maintainability, and test coverage. Input: {{files}}. Context: {{context}}. Output JSON with findings[] and suggestions[].",
      maxConcurrent: 2,
      retryLimit: 3,
      inputSchema: { files: "string[]", diff: "string", context: "string" },
      outputSchema: { findings: "Finding[]", suggestions: "string[]", approved: "boolean" },
    },
  },
  {
    name: "architect-advisor",
    adapterType: "roster",
    config: {
      role: "System design and Architecture Decision Records (ADR) advisor",
      capabilities: ["system_design", "adr", "trade_off_analysis", "diagram_hints"],
      queueName: "q.architect-advisor",
      systemPromptTemplate:
        "You are a principal software architect. Analyze the described design problem and produce an ADR with: context, decision, rationale, alternatives considered, and consequences. Problem: {{description}}. Stack: {{stack}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { description: "string", stack: "string", constraints: "string[]" },
      outputSchema: { adr: "string", alternatives: "string[]", risks: "string[]" },
    },
  },
  {
    name: "test-generator",
    adapterType: "roster",
    config: {
      role: "Unit, integration, and E2E test scaffold generator",
      capabilities: ["unit_tests", "integration_tests", "e2e_tests", "coverage_hints"],
      queueName: "q.test-generator",
      systemPromptTemplate:
        "You are a QA engineer. Generate comprehensive tests for the provided code. Framework: {{framework}}. Coverage target: {{coverageTarget}}%. Input code: {{code}}.",
      maxConcurrent: 2,
      retryLimit: 3,
      inputSchema: { code: "string", framework: "string", coverageTarget: "number" },
      outputSchema: { tests: "string", testCount: "number", coverageHints: "string[]" },
    },
  },
  {
    name: "doc-writer",
    adapterType: "roster",
    config: {
      role: "README, API documentation, and changelog writer",
      capabilities: ["readme", "api_docs", "changelog", "jsdoc"],
      queueName: "q.doc-writer",
      systemPromptTemplate:
        "You are a technical writer. Generate clear, accurate documentation. Target: {{docType}} for {{target}}. Context: {{context}}. Output in Markdown.",
      maxConcurrent: 2,
      retryLimit: 3,
      inputSchema: { docType: "string", target: "string", context: "string" },
      outputSchema: { markdown: "string", sections: "string[]" },
    },
  },
  {
    name: "bug-analyzer",
    adapterType: "roster",
    config: {
      role: "Root cause analysis for bugs, crashes, and regressions",
      capabilities: ["root_cause_analysis", "stack_trace_parsing", "reproduction_steps"],
      queueName: "q.bug-analyzer",
      systemPromptTemplate:
        "You are a debugging expert. Analyze the bug report and provide root cause, reproduction steps, and a fix recommendation. Bug: {{description}}. Stack trace: {{stackTrace}}. Code context: {{context}}.",
      maxConcurrent: 2,
      retryLimit: 3,
      inputSchema: { description: "string", stackTrace: "string", context: "string" },
      outputSchema: { rootCause: "string", reproSteps: "string[]", fixRecommendation: "string" },
    },
  },
  {
    name: "refactor-advisor",
    adapterType: "roster",
    config: {
      role: "Code refactoring, extraction, and tech debt reduction advisor",
      capabilities: ["refactoring", "tech_debt", "code_smell_detection", "extraction"],
      queueName: "q.refactor-advisor",
      systemPromptTemplate:
        "You are a refactoring expert. Identify code smells, duplication, and poor abstractions. Suggest specific refactors with before/after examples. Code: {{code}}.",
      maxConcurrent: 2,
      retryLimit: 3,
      inputSchema: { code: "string", files: "string[]" },
      outputSchema: { smells: "CodeSmell[]", refactors: "Refactor[]", priorityOrder: "string[]" },
    },
  },
  {
    name: "security-scanner",
    adapterType: "roster",
    config: {
      role: "SAST, dependency vulnerability, and secrets detection",
      capabilities: ["sast", "dependency_audit", "secrets_detection", "owasp_check"],
      queueName: "q.security-scanner",
      systemPromptTemplate:
        "You are a security engineer. Scan for OWASP Top 10 vulnerabilities, hardcoded secrets, and insecure dependencies. Code: {{code}}. Dependencies: {{dependencies}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { code: "string", dependencies: "string[]", files: "string[]" },
      outputSchema: { vulnerabilities: "Vulnerability[]", severity: "string", remediations: "string[]" },
    },
  },
  {
    name: "performance-analyzer",
    adapterType: "roster",
    config: {
      role: "Performance bottleneck detection and optimization recommendations",
      capabilities: ["profiling_hints", "query_optimization", "memory_leak_detection", "caching_advice"],
      queueName: "q.performance-analyzer",
      systemPromptTemplate:
        "You are a performance engineer. Identify bottlenecks, N+1 queries, memory leaks, and unnecessary computation. Profile data: {{profileData}}. Code: {{code}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { code: "string", profileData: "string", metrics: "object" },
      outputSchema: { bottlenecks: "Bottleneck[]", recommendations: "string[]", estimatedGain: "string" },
    },
  },
  {
    name: "api-designer",
    adapterType: "roster",
    config: {
      role: "OpenAPI spec generator and contract-first API design advisor",
      capabilities: ["openapi_spec", "rest_design", "graphql_schema", "versioning"],
      queueName: "q.api-designer",
      systemPromptTemplate:
        "You are an API architect. Design a clean, versioned API following REST principles. Generate an OpenAPI 3.1 spec. Domain: {{domain}}. Operations: {{operations}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { domain: "string", operations: "string[]", constraints: "string[]" },
      outputSchema: { openApiSpec: "string", endpoints: "Endpoint[]", designNotes: "string[]" },
    },
  },
  {
    name: "db-advisor",
    adapterType: "roster",
    config: {
      role: "Database schema, index, and query optimization advisor",
      capabilities: ["schema_design", "index_optimization", "query_analysis", "migration_safety"],
      queueName: "q.db-advisor",
      systemPromptTemplate:
        "You are a database engineer. Analyze schema, queries, and indexes. Recommend optimizations and flag dangerous migrations. Schema: {{schema}}. Queries: {{queries}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { schema: "string", queries: "string[]", dbType: "string" },
      outputSchema: { suggestions: "DBSuggestion[]", indexRecommendations: "string[]", migrationRisks: "string[]" },
    },
  },

  // ── DevOps ───────────────────────────────────────────────────────────────────
  {
    name: "cicd-orchestrator",
    adapterType: "roster",
    config: {
      role: "CI/CD pipeline design and optimization (GitHub Actions, GitLab CI, Jenkins)",
      capabilities: ["pipeline_design", "github_actions", "gitlab_ci", "parallelization"],
      queueName: "q.cicd-orchestrator",
      systemPromptTemplate:
        "You are a DevOps engineer. Design an optimal CI/CD pipeline. Platform: {{platform}}. Stack: {{stack}}. Requirements: {{requirements}}. Output YAML pipeline definition.",
      maxConcurrent: 1,
      retryLimit: 3,
      inputSchema: { platform: "string", stack: "string", requirements: "string[]" },
      outputSchema: { pipelineYaml: "string", stages: "string[]", estimatedDuration: "number" },
    },
  },
  {
    name: "infra-advisor",
    adapterType: "roster",
    config: {
      role: "Infrastructure as Code, Terraform, and cloud architecture advisor",
      capabilities: ["terraform", "iac", "cloud_architecture", "cost_aware_design"],
      queueName: "q.infra-advisor",
      systemPromptTemplate:
        "You are a cloud architect. Design infrastructure for the described workload. Cloud: {{cloud}}. Budget: {{budget}}. SLA: {{sla}}. Output Terraform module outline and architecture diagram description.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { cloud: "string", workload: "string", budget: "string", sla: "string" },
      outputSchema: { terraformOutline: "string", architectureNotes: "string[]", estimatedCost: "string" },
    },
  },
  {
    name: "deploy-manager",
    adapterType: "roster",
    config: {
      role: "Deployment strategy advisor — blue/green, canary, rollback planning",
      capabilities: ["blue_green", "canary", "rollback", "feature_flags", "deployment_checklist"],
      queueName: "q.deploy-manager",
      systemPromptTemplate:
        "You are a deployment engineer. Plan the deployment of {{service}} version {{version}} to {{environment}}. Generate a deployment checklist and rollback plan.",
      maxConcurrent: 1,
      retryLimit: 3,
      inputSchema: { service: "string", version: "string", environment: "string", strategy: "string" },
      outputSchema: { checklist: "string[]", rollbackPlan: "string", riskLevel: "string" },
    },
  },
  {
    name: "monitoring-agent",
    adapterType: "roster",
    config: {
      role: "Alert rules, dashboards, and SLO definitions for observability stacks",
      capabilities: ["alert_rules", "dashboard_design", "slo_sli", "log_analysis"],
      queueName: "q.monitoring-agent",
      systemPromptTemplate:
        "You are a site reliability engineer. Define SLOs, alert rules, and dashboards for {{service}}. Stack: {{observabilityStack}}. Current metrics: {{metrics}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { service: "string", observabilityStack: "string", metrics: "object" },
      outputSchema: { slos: "SLO[]", alertRules: "AlertRule[]", dashboardLayout: "string" },
    },
  },
  {
    name: "incident-responder",
    adapterType: "roster",
    config: {
      role: "Incident response runbooks and postmortem facilitator",
      capabilities: ["runbook_generation", "postmortem", "timeline_reconstruction", "action_items"],
      queueName: "q.incident-responder",
      systemPromptTemplate:
        "You are an incident commander. Given the incident details, generate a response runbook and postmortem template. Incident: {{description}}. Severity: {{severity}}. Services affected: {{services}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { description: "string", severity: "string", services: "string[]" },
      outputSchema: { runbook: "string", postmortemTemplate: "string", actionItems: "string[]" },
    },
  },
  {
    name: "cost-optimizer",
    adapterType: "roster",
    config: {
      role: "Cloud cost analysis, rightsizing, and waste elimination",
      capabilities: ["cost_analysis", "rightsizing", "reserved_instances", "waste_detection"],
      queueName: "q.cost-optimizer",
      systemPromptTemplate:
        "You are a FinOps engineer. Analyze cloud spend and identify waste. Cloud: {{cloud}}. Current spend: {{currentSpend}}. Resources: {{resources}}. Suggest optimizations with estimated savings.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { cloud: "string", currentSpend: "object", resources: "object[]" },
      outputSchema: { recommendations: "CostRecommendation[]", estimatedSavings: "string", priority: "string[]" },
    },
  },

  // ── Project / Knowledge ──────────────────────────────────────────────────────
  {
    name: "memory-agent",
    adapterType: "roster",
    config: {
      role: "Central memory owner that captures reusable learnings, project facts, and worker memory for future local execution",
      capabilities: ["memory_management", "knowledge_capture", "worker_learning", "memory_governance"],
      queueName: "q.memory-agent",
      systemPromptTemplate:
        "You are the memory agent. Convert solved work into reusable project facts and worker learnings so future runs can stay local-first and avoid unnecessary AI calls.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { sourceAgentType: "string", sourceJobType: "string", originalPayload: "object", result: "object" },
      outputSchema: { facts: "string[]", learnedSolution: "object", summary: "string" },
      researchFocus: ["memory", "learning", "project_context"],
      localFirst: true,
      ownsMemory: true,
    },
  },
  {
    name: "worker-auditor",
    adapterType: "roster",
    config: {
      role: "Reliability auditor that monitors workers, identifies the most failure-prone agents, and opens escalation cases",
      capabilities: ["worker_reliability", "failure_audit", "escalation", "rebuild_planning"],
      queueName: "q.worker-auditor",
      systemPromptTemplate:
        "You are a worker reliability auditor. Review repeated worker failures, identify systemic hotspots, rank the most unstable workers, and produce an audit summary for escalation.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { auditedAgentType: "string", failureCount: "number", lastError: "string" },
      outputSchema: { severity: "string", suspectedHotspots: "string[]", summary: "string" },
      dailyScheduleHours: 24,
      researchFocus: ["worker_reliability", "failure_patterns", "rebuild_strategies"],
      localFirst: true,
    },
  },
  {
    name: "worker-police",
    adapterType: "roster",
    config: {
      role: "Investigator that analyzes why a worker is failing and requests supporting evidence from research",
      capabilities: ["failure_investigation", "root_cause_analysis", "evidence_request", "worker_forensics"],
      queueName: "q.worker-police",
      systemPromptTemplate:
        "You are the worker police investigator. Examine the audit case, identify likely causes of failures, determine what evidence is missing, and prepare a focused investigation summary.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { auditedAgentType: "string", failureCount: "number", lastError: "string", auditSummary: "string" },
      outputSchema: { suspectedCauses: "string[]", needsResearch: "boolean", summary: "string" },
      researchFocus: ["provider_failures", "model_regressions", "worker_forensics"],
      localFirst: true,
    },
  },
  {
    name: "worker-judge",
    adapterType: "roster",
    config: {
      role: "Decision-maker that uses police and research evidence to choose rebuild vs safer model reassignment",
      capabilities: ["governance", "reliability_judgement", "decision_making", "remediation_selection"],
      queueName: "q.worker-judge",
      systemPromptTemplate:
        "You are the worker judge. Review the audit evidence and decide whether the failing worker should be rebuilt or rerouted to a safer model. Output a single decision with rationale.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { auditedAgentType: "string", failureCount: "number", lastError: "string", researchRecommendations: "object[]" },
      outputSchema: { decision: "string", summary: "string" },
      researchFocus: ["reliability_governance", "model_selection", "rebuild_vs_reroute"],
      localFirst: true,
    },
  },
  {
    name: "web-researcher",
    adapterType: "roster",
    config: {
      role: "Deep web researcher for model landscape tracking, benchmarks, release notes, and toolchain changes",
      capabilities: ["deep_research", "web_research", "benchmark_tracking", "release_monitoring"],
      queueName: "q.web-researcher",
      systemPromptTemplate:
        "You are a research analyst tracking AI model changes daily. Review the provided web sources, extract meaningful updates, summarize strengths by task type, and emit structured findings with sources.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { sources: "ResearchSource[]", focusAreas: "string[]", objective: "string" },
      outputSchema: { findings: "ResearchFinding[]", recommendations: "ModelRecommendation[]" },
      routingHints: { primary: "Gemini 2.5 Pro", fallback: "Claude Sonnet" },
      dailyScheduleHours: 24,
      researchFocus: ["coding", "graphic_design", "administrative_reporting", "financial_reporting"],
      localFirst: false,
    },
  },
  {
    name: "agent-recruiter",
    adapterType: "roster",
    config: {
      role: "Model router that assigns the best current LLM/provider to each worker agent based on daily research",
      capabilities: ["model_selection", "provider_routing", "task_matching", "daily_benchmark_review"],
      queueName: "q.agent-recruiter",
      systemPromptTemplate:
        "You are an AI workforce recruiter. Use the latest model research to assign the best provider/model to each worker agent. Optimize for task fit, output quality, and operational cost. Return structured assignments.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { roster: "RosterAgent[]", businessDomains: "string[]", researchDigest: "object" },
      outputSchema: { assignments: "ModelAssignment[]", summary: "string", risks: "string[]" },
      routingHints: { coding: "Claude Sonnet", graphic_design: "Gemini 2.5 Pro", reporting: "GPT-4.1" },
      dailyScheduleHours: 24,
      researchFocus: ["model-benchmarks", "release-notes", "task-routing"],
      localFirst: true,
    },
  },
  {
    name: "task-planner",
    adapterType: "roster",
    config: {
      role: "Sprint planning, story point estimation, and backlog prioritization",
      capabilities: ["sprint_planning", "estimation", "backlog_grooming", "dependency_mapping"],
      queueName: "q.task-planner",
      systemPromptTemplate:
        "You are an Agile coach. Break down the epic into user stories with acceptance criteria and story point estimates. Epic: {{epic}}. Team velocity: {{velocity}}. Sprint length: {{sprintDays}} days.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { epic: "string", velocity: "number", sprintDays: "number" },
      outputSchema: { stories: "UserStory[]", sprintPlan: "string", risks: "string[]" },
    },
  },
  {
    name: "onboarding-agent",
    adapterType: "roster",
    config: {
      role: "New developer onboarding guide and workspace orientation",
      capabilities: ["onboarding_guide", "codebase_tour", "local_setup", "team_conventions"],
      queueName: "q.onboarding-agent",
      systemPromptTemplate:
        "You are a senior developer onboarding a new team member. Generate a structured onboarding guide for {{role}} joining the {{team}} team. Stack: {{stack}}.",
      maxConcurrent: 2,
      retryLimit: 2,
      inputSchema: { role: "string", team: "string", stack: "string[]" },
      outputSchema: { guide: "string", checklist: "string[]", resources: "string[]" },
    },
  },
  {
    name: "tech-debt-tracker",
    adapterType: "roster",
    config: {
      role: "Technical debt registry, scoring, and paydown prioritization",
      capabilities: ["debt_scoring", "paydown_planning", "impact_analysis", "estimation"],
      queueName: "q.tech-debt-tracker",
      systemPromptTemplate:
        "You are a software architect tracking tech debt. Score and prioritize the following debt items by business impact, risk, and fix effort. Items: {{debtItems}}. Team velocity: {{velocity}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { debtItems: "DebtItem[]", velocity: "number" },
      outputSchema: { scored: "ScoredDebtItem[]", paydownPlan: "string[]", quickWins: "string[]" },
    },
  },
  {
    name: "context-storage-worker",
    adapterType: "roster",
    config: {
      role: "Persistent storage and indexing worker for AI context, project memory, decisions, tasks, and research artifacts",
      capabilities: ["context_indexing", "local_storage", "fast_retrieval", "knowledge_persistence"],
      queueName: "q.context-storage-worker",
      systemPromptTemplate:
        "You are the storage and indexing worker. Organize AI context, memory, tasks, decisions, and project signals into searchable, deduplicated indexed records for fast retrieval.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { workspaceId: "string", objective: "string", changedSources: "string[]" },
      outputSchema: { indexedSources: "string[]", entriesCreated: "number", summary: "string" },
      dailyScheduleHours: 24,
      researchFocus: ["knowledge_storage", "indexing", "retrieval"],
      localFirst: true,
    },
  },
  {
    name: "data-miner",
    adapterType: "roster",
    config: {
      role: "Big data and dataframe preparation worker that classifies datasets, shapes ML-ready data, and keeps outputs linked to project memory",
      capabilities: [
        "data_mining",
        "bigdata_classification",
        "dataframe_preparation",
        "feature_readiness",
        "memory_linkage",
      ],
      queueName: "q.data-miner",
      systemPromptTemplate:
        "You are the data miner worker. Classify project data, organize dataframe-oriented structures, prepare ML-ready datasets, and link the resulting insights back to project memory for future worker intelligence.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: {
        objective: "string",
        sources: "string[]",
        datasets: "object[]",
        targetModel: "string",
        memoryContext: "string[]",
      },
      outputSchema: {
        classifications: "string[]",
        dataframePlan: "object",
        mlReadyDatasets: "string[]",
        memoryLinks: "string[]",
        summary: "string",
      },
      researchFocus: ["data_mining", "bigdata", "feature_engineering", "memory_indexing"],
      localFirst: true,
    },
  },
  {
    name: "translator-worker",
    adapterType: "roster",
    config: {
      role: "Prompt translator and first-pass interpreter that detects language, corrects grammar, clarifies intent, and prepares worker task prompts for recruiter handoff",
      capabilities: [
        "language_detection",
        "prompt_normalization",
        "grammar_correction",
        "task_translation",
        "recruiter_handoff",
      ],
      queueName: "q.translator-worker",
      systemPromptTemplate:
        "You are the translator worker. Detect the prompt language, correct spelling and grammar, produce the first clear understanding of the request, and translate each worker task into recruiter-ready prompts.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: {
        prompt: "string",
        workerTasks: "object[]",
        targetLanguage: "string",
      },
      outputSchema: {
        detectedLanguage: "string",
        correctedPrompt: "string",
        promptUnderstanding: "string",
        workerTaskPrompts: "object[]",
        recruiterPayload: "object",
        summary: "string",
      },
      researchFocus: ["translation", "prompt_interpretation", "task_routing", "worker_handoffs"],
      localFirst: true,
    },
  },
  {
    name: "token-vault-worker",
    adapterType: "roster",
    config: {
      role: "Token vault worker that monitors per-worker model usage, enforces responsible token spending, prevents unnecessary consumption, and tracks remaining token balances",
      capabilities: [
        "token_budgeting",
        "usage_monitoring",
        "budget_enforcement",
        "remaining_balance_tracking",
        "model_cost_governance",
      ],
      queueName: "q.token-vault-worker",
      systemPromptTemplate:
        "You are the token vault worker. Monitor worker token usage, keep model budgets under control, prevent wasteful token consumption, and maintain remaining token balances by worker and provider.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: {
        providerBudgets: "object[]",
        workerUsage: "object[]",
        optimizationGoal: "string",
      },
      outputSchema: {
        workerBalances: "object[]",
        providerBalances: "object[]",
        wasteFindings: "string[]",
        guardrails: "string[]",
        summary: "string",
      },
      researchFocus: ["token_budgeting", "cost_control", "usage_efficiency", "model_governance"],
      localFirst: true,
    },
  },
  {
    name: "accounts-worker",
    adapterType: "roster",
    config: {
      role: "Multi-account governance worker that manages provider accounts and connections for Claude, Gemini, ChatGPT, and related agent access flows",
      capabilities: [
        "account_management",
        "provider_connections",
        "multi_provider_governance",
        "credential_routing",
        "connection_health",
      ],
      queueName: "q.accounts-worker",
      systemPromptTemplate:
        "You are the accounts worker. Manage multiple provider accounts, maintain connections for Claude, Gemini, ChatGPT and other agent systems, and report healthy routing and account governance state.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: {
        providers: "object[]",
        routingPolicies: "string[]",
        connectionTargets: "string[]",
      },
      outputSchema: {
        accountRegistry: "object[]",
        connectionStatuses: "object[]",
        routingPoliciesApplied: "string[]",
        summary: "string",
      },
      researchFocus: ["account_management", "provider_connectivity", "routing_policies", "multi_agent_access"],
      localFirst: true,
    },
  },
  {
    name: "worker-compliance",
    adapterType: "roster",
    config: {
      role: "Output compliance worker that validates whether each worker fulfilled the requested task and reports failures to audit",
      capabilities: ["output_validation", "contract_checking", "quality_gate", "worker_compliance"],
      queueName: "q.worker-compliance",
      systemPromptTemplate:
        "You are the compliance worker. Compare the requested task against the produced output and determine if the worker satisfied the assignment. Return compliant, issues, and expected signals.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { auditedJobId: "string", auditedAgentType: "string", auditedJobType: "string", result: "object", expectedSignals: "string[]" },
      outputSchema: { compliant: "boolean", issues: "string[]", expectedSignals: "string[]", summary: "string" },
      researchFocus: ["quality_gates", "task_contracts", "output_validation"],
      localFirst: true,
    },
  },
  {
    name: "workflow-automation-worker",
    adapterType: "roster",
    config: {
      role: "Automation builder for 2026 workflow stacks including n8n, Make, GitHub Actions, queues, and event-driven orchestration",
      capabilities: ["workflow_automation", "n8n", "make", "event_orchestration", "runbook_automation"],
      queueName: "q.workflow-automation-worker",
      systemPromptTemplate:
        "You are the automation worker. Design and produce operational workflows for automation platforms, background jobs, approvals, retries, and observability.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { platform: "string", workflowGoal: "string", integrations: "string[]" },
      outputSchema: { actions: "string[]", workflowSpec: "string", summary: "string" },
      routingHints: { automation: "Claude Sonnet", business_ops: "GPT-4.1" },
      researchFocus: ["workflow_automation", "n8n", "make", "orchestration"],
      localFirst: true,
    },
  },
  {
    name: "integration-engineer",
    adapterType: "roster",
    config: {
      role: "API, webhook, MCP, SaaS, ERP, CRM, and internal platform integration specialist",
      capabilities: ["api_integration", "webhooks", "mcp", "sso", "data_mapping"],
      queueName: "q.integration-engineer",
      systemPromptTemplate:
        "You are the integrations worker. Build or review integration plans for APIs, webhooks, SaaS systems, authentication flows, and data mapping contracts.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { systems: "string[]", auth: "string", dataShape: "object" },
      outputSchema: { integrationPlan: "string", risks: "string[]", summary: "string" },
      researchFocus: ["integrations", "apis", "webhooks", "mcp"],
      localFirst: true,
    },
  },
  {
    name: "security-governor",
    adapterType: "roster",
    config: {
      role: "2026 security governance worker for AppSec, IAM, secrets hygiene, supply chain, and policy enforcement",
      capabilities: ["security_governance", "iam", "supply_chain_security", "policy_enforcement", "threat_review"],
      queueName: "q.security-governor",
      systemPromptTemplate:
        "You are the security governance worker. Evaluate architecture, workflows, and integrations for identity, secrets, policy, and software supply-chain risk.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { assets: "string[]", architecture: "string", policies: "string[]" },
      outputSchema: { findings: "string[]", remediations: "string[]", summary: "string" },
      researchFocus: ["security", "iam", "supply_chain", "appsec"],
      localFirst: true,
    },
  },
  {
    name: "linguistic-qa",
    adapterType: "roster",
    config: {
      role: "Linguistic quality worker for multilingual correctness, tone, terminology, localization, and prompt clarity",
      capabilities: ["linguistic_review", "localization", "terminology_control", "tone_consistency", "translation_qa"],
      queueName: "q.linguistic-qa",
      systemPromptTemplate:
        "You are the linguistic QA worker. Review text for correctness, clarity, localized terminology, consistent tone, and prompt usability across languages.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { content: "string", locale: "string", glossary: "string[]" },
      outputSchema: { issues: "string[]", rewrittenText: "string", summary: "string" },
      routingHints: { linguistic: "GPT-4.1", reasoning: "Claude Sonnet" },
      researchFocus: ["linguistics", "localization", "prompt_quality"],
      localFirst: true,
    },
  },
  {
    name: "review-orchestrator",
    adapterType: "roster",
    config: {
      role: "Cross-functional review worker that consolidates code, product, design, security, and release reviews",
      capabilities: ["cross_review", "release_readiness", "qa_signoff", "multi_stakeholder_review"],
      queueName: "q.review-orchestrator",
      systemPromptTemplate:
        "You are the review orchestrator. Combine technical, security, UX, and release considerations into a single readiness review with blockers and approvals.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { scope: "string", artifacts: "string[]", releaseContext: "string" },
      outputSchema: { findings: "string[]", approvals: "string[]", summary: "string" },
      researchFocus: ["review", "release_readiness", "quality"],
      localFirst: true,
    },
  },
  {
    name: "capture-orchestrator",
    adapterType: "roster",
    config: {
      role: "Lead, intake, and opportunity capture worker for forms, CRM enrichment, qualification, and routing",
      capabilities: ["lead_capture", "intake_automation", "crm_enrichment", "qualification", "routing"],
      queueName: "q.capture-orchestrator",
      systemPromptTemplate:
        "You are the capture orchestrator. Design and validate capture flows for new opportunities, inbound requests, qualification rules, enrichment, and downstream routing.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { sources: "string[]", qualificationRules: "string[]", targetSystem: "string" },
      outputSchema: { actions: "string[]", routingPlan: "string", summary: "string" },
      routingHints: { capture: "GPT-4.1", workflow: "Claude Sonnet" },
      researchFocus: ["capture_flows", "crm", "enrichment", "routing"],
      localFirst: true,
    },
  },
  {
    name: "compliance-checker",
    adapterType: "roster",
    config: {
      role: "SOC2, ISO 27001, GDPR, and HIPAA compliance gap analysis",
      capabilities: ["soc2", "iso27001", "gdpr", "hipaa", "gap_analysis"],
      queueName: "q.compliance-checker",
      systemPromptTemplate:
        "You are a compliance auditor. Perform a gap analysis against {{framework}}. Review: {{artifacts}}. Identify gaps and generate remediation tasks ranked by risk.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { framework: "string", artifacts: "string[]" },
      outputSchema: { gaps: "ComplianceGap[]", remediations: "string[]", riskScore: "string" },
    },
  },
];

// ─── Service ──────────────────────────────────────────────────────────────────

export class AgentRosterService {
  private repo: AgentRepository;
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.repo = new AgentRepository(db);
  }

  /** Idempotent — seeds the full roster for the workspace. */
  ensureRoster(workspaceId: string): Agent[] {
    return SOFTWARE_DEV_DEVOPS_ROSTER.map((def) =>
      this.repo.create(workspaceId, def.name, def.adapterType, def.config),
    );
  }

  /** Returns all roster agents for the workspace with parsed config. */
  rosterWithConfig(workspaceId: string): { agent: Agent; config: AgentRosterConfig }[] {
    return this.repo
      .findByWorkspace(workspaceId)
      .filter((a) => a.adapterType === "roster")
      .map((agent) => ({
        agent,
        config: JSON.parse(agent.configJson) as AgentRosterConfig,
      }));
  }

  findByAgentType(workspaceId: string, agentType: string): Agent | undefined {
    return this.repo.findByWorkspaceAndName(workspaceId, agentType);
  }
}
