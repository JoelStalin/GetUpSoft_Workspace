import type { Database } from "../storage/Database.ts";
import type { AgentRosterConfig, Job, WorkerAuditCase } from "../storage/entities.ts";
import { WorkerAuditRepository } from "../storage/repositories/WorkerAuditRepository.ts";
import { JobQueueService } from "./JobQueueService.ts";
import { AgentRosterService } from "./AgentRosterService.ts";

const FAILURE_THRESHOLD = 3;

const FAILURE_RESEARCH_SOURCES = [
  {
    title: "Anthropic models",
    url: "https://docs.anthropic.com/en/docs/about-claude/models",
    capability: "coding",
  },
  {
    title: "OpenAI models",
    url: "https://platform.openai.com/docs/models",
    capability: "administrative_reporting",
  },
  {
    title: "Gemini models",
    url: "https://ai.google.dev/gemini-api/docs/models",
    capability: "graphic_design",
  },
];

export class WorkerAuditService {
  private repo: WorkerAuditRepository;
  private queueService: JobQueueService;
  private rosterService: AgentRosterService;

  constructor(db: Database) {
    this.repo = new WorkerAuditRepository(db);
    this.queueService = new JobQueueService(db);
    this.rosterService = new AgentRosterService(db);
  }

  recordFailure(job: Job, workerId: string, error: string): WorkerAuditCase {
    const auditCase = this.repo.recordFailure({
      workspaceId: job.workspaceId,
      auditedAgentType: job.agentType,
      lastError: error,
      lastJobId: job.id,
      lastWorkerId: workerId,
    });

    if (
      auditCase.failureCount >= FAILURE_THRESHOLD &&
      !auditCase.auditorJobId &&
      !this.isGovernanceAgent(job.agentType)
    ) {
      const auditorJob = this.queueService.enqueue({
        workspaceId: job.workspaceId,
        agentType: "worker-auditor",
        jobType: "failure_audit",
        priority: 10,
        maxRetries: 2,
        payload: {
          auditCaseId: auditCase.id,
          auditedAgentType: auditCase.auditedAgentType,
          failureCount: auditCase.failureCount,
          lastError: auditCase.lastError,
          lastWorkerId: auditCase.lastWorkerId,
          failedJobId: job.id,
          failedJobType: job.jobType,
        },
      });
      this.repo.attachJob(auditCase.id, "auditorJobId", auditorJob.id, "auditing");
      return this.repo.findById(auditCase.id)!;
    }

    return auditCase;
  }

  handleJobCompletion(job: Job, result: Record<string, unknown>): WorkerAuditCase | undefined {
    const payload = JSON.parse(job.payloadJson) as Record<string, unknown>;
    const auditCaseId = typeof payload.auditCaseId === "string" ? payload.auditCaseId : undefined;
    if (!auditCaseId) return undefined;

    const auditCase = this.repo.findById(auditCaseId);
    if (!auditCase) return undefined;

    if (job.agentType === "worker-auditor" && job.jobType === "failure_audit") {
      const policeJob = this.queueService.enqueue({
        workspaceId: job.workspaceId,
        agentType: "worker-police",
        jobType: "investigate_worker_failures",
        priority: 9,
        maxRetries: 2,
        payload: {
          auditCaseId,
          auditedAgentType: auditCase.auditedAgentType,
          failureCount: auditCase.failureCount,
          lastError: auditCase.lastError,
          auditSummary: result.summary ?? "Repeated worker failures require investigation.",
        },
      });
      this.repo.attachJob(auditCaseId, "policeJobId", policeJob.id, "police_investigating");
      return this.repo.findById(auditCaseId);
    }

    if (job.agentType === "worker-police") {
      const roster = this.rosterService.rosterWithConfig(job.workspaceId);
      const auditedAgent = roster.find((entry) => entry.agent.name === auditCase.auditedAgentType);
      const focusAreas = this.focusAreasForAgent(auditedAgent?.config);
      const researchJob = this.queueService.enqueue({
        workspaceId: job.workspaceId,
        agentType: "web-researcher",
        jobType: "worker_failure_research",
        priority: 9,
        maxRetries: 2,
        payload: {
          auditCaseId,
          auditedAgentType: auditCase.auditedAgentType,
          objective: `Investigate model/provider changes and failure mitigations for ${auditCase.auditedAgentType}.`,
          focusAreas,
          sources: FAILURE_RESEARCH_SOURCES,
          policeSummary: result.summary ?? "",
          lastError: auditCase.lastError,
        },
      });
      this.repo.attachJob(auditCaseId, "researchJobId", researchJob.id, "researching");
      return this.repo.findById(auditCaseId);
    }

    if (job.agentType === "web-researcher" && job.jobType === "worker_failure_research") {
      const judgeJob = this.queueService.enqueue({
        workspaceId: job.workspaceId,
        agentType: "worker-judge",
        jobType: "judge_worker_reliability",
        priority: 9,
        maxRetries: 2,
        payload: {
          auditCaseId,
          auditedAgentType: auditCase.auditedAgentType,
          failureCount: auditCase.failureCount,
          lastError: auditCase.lastError,
          researchRecommendations: result.recommendations ?? [],
          researchSummary: result.summary ?? "",
        },
      });
      this.repo.attachJob(auditCaseId, "judgeJobId", judgeJob.id, "judge_pending");
      return this.repo.findById(auditCaseId);
    }

    if (job.agentType === "worker-judge") {
      const decision = typeof result.decision === "string" ? result.decision : "reassign_model";
      if (decision === "rebuild_worker") {
        const rebuildJob = this.queueService.enqueue({
          workspaceId: job.workspaceId,
          agentType: "worker-auditor",
          jobType: "rebuild_worker_profile",
          priority: 8,
          maxRetries: 2,
          payload: {
            auditCaseId,
            auditedAgentType: auditCase.auditedAgentType,
            failureCount: auditCase.failureCount,
            lastError: auditCase.lastError,
            judgeSummary: result.summary ?? "",
          },
        });
        this.repo.attachJob(auditCaseId, "rebuildJobId", rebuildJob.id, "rebuilding");
      } else {
        const recruiterJob = this.queueService.enqueue({
          workspaceId: job.workspaceId,
          agentType: "agent-recruiter",
          jobType: "reroute_failing_worker",
          priority: 8,
          maxRetries: 2,
          payload: {
            auditCaseId,
            businessDomains: ["software-development", "devops", "reliability"],
            roster: [
              {
                agentType: auditCase.auditedAgentType,
                role: `Remediate repeated failures for ${auditCase.auditedAgentType}`,
                capabilities: this.focusAreasForAgent(
                  this.rosterService
                    .rosterWithConfig(job.workspaceId)
                    .find((entry) => entry.agent.name === auditCase.auditedAgentType)?.config,
                ),
              },
            ],
          },
        });
        this.repo.attachJob(auditCaseId, "recruiterJobId", recruiterJob.id, "recruiting");
      }
      return this.repo.findById(auditCaseId);
    }

    if (job.agentType === "agent-recruiter" && job.jobType === "reroute_failing_worker") {
      this.repo.resolve(
        auditCaseId,
        "reassign_model",
        String(result.summary ?? `Model reassignment prepared for ${auditCase.auditedAgentType}.`),
      );
      return this.repo.findById(auditCaseId);
    }

    if (job.agentType === "worker-auditor" && job.jobType === "rebuild_worker_profile") {
      this.repo.resolve(
        auditCaseId,
        "rebuild_worker",
        String(result.summary ?? `Rebuild plan prepared for ${auditCase.auditedAgentType}.`),
      );
      return this.repo.findById(auditCaseId);
    }

    return auditCase;
  }

  topFailingAgents(workspaceId: string, limit = 5): WorkerAuditCase[] {
    return this.repo.topFailingAgents(workspaceId, limit);
  }

  listByWorkspace(workspaceId: string): WorkerAuditCase[] {
    return this.repo.listByWorkspace(workspaceId);
  }

  private isGovernanceAgent(agentType: string): boolean {
    return ["worker-auditor", "worker-police", "worker-judge"].includes(agentType);
  }

  private focusAreasForAgent(config?: AgentRosterConfig): string[] {
    if (!config) return ["coding"];
    return config.researchFocus ?? config.capabilities.slice(0, 3);
  }
}
