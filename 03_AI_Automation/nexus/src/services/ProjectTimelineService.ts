import type { Database } from "../storage/Database.ts";
import type { Job, ProjectTimelineEvent } from "../storage/entities.ts";
import { ProjectTimelineRepository } from "../storage/repositories/ProjectTimelineRepository.ts";

export class ProjectTimelineService {
  private repo: ProjectTimelineRepository;

  constructor(db: Database) {
    this.repo = new ProjectTimelineRepository(db);
  }

  recordJobStarted(job: Job): ProjectTimelineEvent {
    return this.repo.record({
      workspaceId: job.workspaceId,
      eventType: "job_started",
      actorAgentType: job.agentType,
      relatedJobId: job.id,
      title: `${job.agentType} started ${job.jobType}`,
      details: `status=${job.status}`,
    });
  }

  recordJobCompleted(job: Job, summary?: string): ProjectTimelineEvent {
    return this.repo.record({
      workspaceId: job.workspaceId,
      eventType: "job_completed",
      actorAgentType: job.agentType,
      relatedJobId: job.id,
      title: `${job.agentType} completed ${job.jobType}`,
      details: summary ?? null,
    });
  }

  recordJobFailed(job: Job, error: string): ProjectTimelineEvent {
    return this.repo.record({
      workspaceId: job.workspaceId,
      eventType: "job_failed",
      actorAgentType: job.agentType,
      relatedJobId: job.id,
      title: `${job.agentType} failed ${job.jobType}`,
      details: error,
    });
  }

  recentSummary(workspaceId: string, limit = 8): string[] {
    return this.repo
      .recent(workspaceId, limit)
      .map((event) => `${event.eventType}: ${event.title}${event.details ? ` — ${event.details}` : ""}`);
  }
}
