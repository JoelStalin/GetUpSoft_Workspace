import type { Database } from "../storage/Database.ts";
import type { AgentRosterConfig, Job, JobSchedule } from "../storage/entities.ts";
import {
  JobRepository,
  JobScheduleRepository,
} from "../storage/repositories/JobRepository.ts";
import { WorkerAuditRepository } from "../storage/repositories/WorkerAuditRepository.ts";
import { JobQueueService } from "./JobQueueService.ts";

export type RosterScheduleInput = Array<{
  agentType: string;
  role: string;
  capabilities: string[];
  config: AgentRosterConfig;
}>;

const DEFAULT_RESEARCH_SOURCES = [
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

export class DailyResearchSchedulerService {
  private readonly scheduleRepo: JobScheduleRepository;
  private readonly jobRepo: JobRepository;
  private readonly queueService: JobQueueService;
  private readonly auditRepo: WorkerAuditRepository;

  constructor(db: Database) {
    this.scheduleRepo = new JobScheduleRepository(db);
    this.jobRepo = new JobRepository(db);
    this.queueService = new JobQueueService(db);
    this.auditRepo = new WorkerAuditRepository(db);
  }

  ensureDailySchedules(workspaceId: string, roster: RosterScheduleInput): JobSchedule[] {
    const now = new Date().toISOString();
    return [
      this.scheduleRepo.upsert({
        workspaceId,
        agentType: "worker-auditor",
        jobType: "daily_worker_audit",
        cadenceHours: 24,
        nextRunAt: now,
        payload: {
          objective: "Review workers with the highest recent failure volume and flag reliability hotspots.",
          threshold: 3,
        },
      }),
      this.scheduleRepo.upsert({
        workspaceId,
        agentType: "context-storage-worker",
        jobType: "daily_context_index",
        cadenceHours: 24,
        nextRunAt: now,
        payload: {
          objective: "Reindex local AI context and project artifacts for fast retrieval.",
          changedSources: ["conversations", "tasks", "decisions", "project_memories", "research_references"],
        },
      }),
      this.scheduleRepo.upsert({
        workspaceId,
        agentType: "web-researcher",
        jobType: "daily_model_landscape",
        cadenceHours: 24,
        nextRunAt: now,
        payload: {
          objective: "Track model and benchmark changes across providers.",
          focusAreas: ["coding", "graphic_design", "administrative_reporting", "financial_reporting"],
          sources: DEFAULT_RESEARCH_SOURCES,
        },
      }),
      this.scheduleRepo.upsert({
        workspaceId,
        agentType: "agent-recruiter",
        jobType: "daily_model_routing",
        cadenceHours: 24,
        nextRunAt: now,
        payload: {
          objective: "Assign the best current model to each worker agent.",
          roster: roster.map((agent) => ({
            agentType: agent.agentType,
            role: agent.role,
            capabilities: agent.capabilities,
          })),
          businessDomains: ["software-development", "devops", "graphic_design", "financial_reporting"],
        },
      }),
    ];
  }

  enqueueDueSchedules(now = new Date()): Job[] {
    const timestamp = now.toISOString();
    const dueSchedules = this.scheduleRepo.due(timestamp);
    const enqueued: Job[] = [];

    for (const schedule of dueSchedules) {
      if (this.jobRepo.hasActiveJob(schedule.workspaceId, schedule.agentType, schedule.jobType)) {
        continue;
      }

      const payload = JSON.parse(schedule.payloadJson) as Record<string, unknown>;
      const enrichedPayload =
        schedule.agentType === "worker-auditor" && schedule.jobType === "daily_worker_audit"
          ? {
              ...payload,
              leaders: this.auditRepo.topFailingAgents(schedule.workspaceId, 5).map((entry) => ({
                auditedAgentType: entry.auditedAgentType,
                failureCount: entry.failureCount,
                lastError: entry.lastError,
                status: entry.status,
              })),
            }
          : payload;
      const job = this.queueService.enqueue({
        workspaceId: schedule.workspaceId,
        agentType: schedule.agentType,
        jobType: schedule.jobType,
        priority: 8,
        maxRetries: 2,
        payload: {
          ...enrichedPayload,
          scheduleId: schedule.id,
          scheduledBy: "daily-research-scheduler",
        },
      });

      const nextRunAt = new Date(
        now.getTime() + schedule.cadenceHours * 60 * 60 * 1000,
      ).toISOString();
      this.scheduleRepo.markEnqueued(schedule.id, timestamp, nextRunAt);
      enqueued.push(job);
    }

    return enqueued;
  }

  listSchedules(workspaceId: string): JobSchedule[] {
    return this.scheduleRepo.findByWorkspace(workspaceId);
  }
}
