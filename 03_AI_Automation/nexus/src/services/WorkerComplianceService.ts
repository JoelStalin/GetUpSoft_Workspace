import type { Database } from "../storage/Database.ts";
import type { Job } from "../storage/entities.ts";
import { WorkerComplianceRepository } from "../storage/repositories/WorkerComplianceRepository.ts";
import { JobQueueService } from "./JobQueueService.ts";
import { WorkerAuditService } from "./WorkerAuditService.ts";

const EXCLUDED_AGENT_TYPES = new Set([
  "worker-auditor",
  "worker-police",
  "worker-judge",
  "worker-compliance",
  "context-storage-worker",
  "web-researcher",
  "agent-recruiter",
]);

export class WorkerComplianceService {
  private repo: WorkerComplianceRepository;
  private queueService: JobQueueService;
  private auditService: WorkerAuditService;

  constructor(db: Database) {
    this.repo = new WorkerComplianceRepository(db);
    this.queueService = new JobQueueService(db);
    this.auditService = new WorkerAuditService(db);
  }

  queueReviewForJob(job: Job, result: Record<string, unknown>): Job | undefined {
    if (EXCLUDED_AGENT_TYPES.has(job.agentType)) return undefined;

    const expectedSignals = this.expectedSignalsFor(job.jobType, job.agentType);
    const reviewJob = this.queueService.enqueue({
      workspaceId: job.workspaceId,
      agentType: "worker-compliance",
      jobType: "validate_worker_output",
      priority: 7,
      maxRetries: 2,
      payload: {
        auditedJobId: job.id,
        auditedAgentType: job.agentType,
        auditedJobType: job.jobType,
        originalPayload: JSON.parse(job.payloadJson),
        result,
        expectedSignals,
      },
    });

    this.repo.create({
      workspaceId: job.workspaceId,
      auditedJobId: job.id,
      auditedAgentType: job.agentType,
      auditedJobType: job.jobType,
      complianceJobId: reviewJob.id,
      compliant: false,
      status: "queued",
      issues: [],
      expectedSignals,
    });

    return reviewJob;
  }

  handleReviewCompletion(complianceJob: Job, result: Record<string, unknown>): void {
    const payload = JSON.parse(complianceJob.payloadJson) as {
      auditedJobId?: string;
      auditedAgentType?: string;
      auditedJobType?: string;
    };

    if (!payload.auditedJobId || !payload.auditedAgentType || !payload.auditedJobType) return;

    const issues = Array.isArray(result.issues)
      ? result.issues.map((issue) => String(issue))
      : [];
    const expectedSignals = Array.isArray(result.expectedSignals)
      ? result.expectedSignals.map((signal) => String(signal))
      : [];
    const compliant = Boolean(result.compliant);

    this.repo.create({
      workspaceId: complianceJob.workspaceId,
      auditedJobId: payload.auditedJobId,
      auditedAgentType: payload.auditedAgentType,
      auditedJobType: payload.auditedJobType,
      complianceJobId: complianceJob.id,
      compliant,
      status: compliant ? "passed" : "failed",
      issues,
      expectedSignals,
    });

    if (!compliant) {
      this.auditService.recordFailure(
        {
          ...complianceJob,
          id: payload.auditedJobId,
          agentType: payload.auditedAgentType,
          jobType: payload.auditedJobType,
        },
        "worker-compliance",
        `Compliance failure: ${issues.join("; ") || "missing required deliverables"}`,
      );
    }
  }

  listReports(workspaceId: string) {
    return this.repo.listByWorkspace(workspaceId);
  }

  private expectedSignalsFor(jobType: string, agentType: string): string[] {
    const defaults = ["summary"];
    if (/token-vault/.test(agentType) || /token|budget|balance/.test(jobType)) {
      return [...defaults, "workerBalances", "providerBalances", "wasteFindings", "guardrails"];
    }
    if (/accounts-worker/.test(agentType) || /account|provider_connection|connection_health/.test(jobType)) {
      return [...defaults, "accountRegistry", "connectionStatuses", "routingPoliciesApplied"];
    }
    if (/translator/.test(agentType) || /translate|prompt_normalization|recruiter_handoff/.test(jobType)) {
      return [
        ...defaults,
        "detectedLanguage",
        "correctedPrompt",
        "promptUnderstanding",
        "workerTaskPrompts",
        "recruiterPayload",
      ];
    }
    if (/data[-_]?miner/.test(agentType) || /data|mining|feature|ml/.test(jobType)) {
      return [...defaults, "classifications", "dataframePlan", "mlReadyDatasets", "memoryLinks"];
    }
    if (/review/.test(jobType) || /review/.test(agentType)) return [...defaults, "findings"];
    if (/deploy|pipeline|workflow|automation/.test(jobType) || /automation/.test(agentType)) {
      return [...defaults, "actions"];
    }
    if (/security/.test(jobType) || /security/.test(agentType)) return [...defaults, "findings"];
    if (/lingu/.test(agentType)) return [...defaults, "issues"];
    if (/integrat/.test(agentType)) return [...defaults, "integrationPlan"];
    return defaults;
  }
}
