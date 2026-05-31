import type { Database } from "../storage/Database.ts";
import { JobRepository } from "../storage/repositories/JobRepository.ts";
import type { Job } from "../storage/entities.ts";

export type EnqueueInput = {
  workspaceId: string;
  agentType: string;
  jobType: string;
  payload: object;
  priority?: number;         // 1–10, default 5
  maxRetries?: number;       // default 3
  scheduledAt?: string;      // ISO 8601 — for delayed jobs
};

export type QueueStats = {
  agentType: string;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  dead: number;
};

export class JobQueueService {
  private repo: JobRepository;
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.repo = new JobRepository(db);
  }

  enqueue(input: EnqueueInput): Job {
    const job = this.repo.enqueue(input);
    this.repo.appendEvent(job.id, "enqueued", undefined, { agentType: input.agentType });
    return job;
  }

  // Called by WorkerPoolService dispatch loop — atomically claims the next
  // pending job for a given agent type (returns undefined if queue is empty).
  claimNext(agentType: string, workerId: string): Job | undefined {
    const job = this.repo.claimNext(agentType);
    if (job) {
      this.repo.appendEvent(job.id, "claimed", workerId);
      this.repo.setProcessing(job.id);
      this.repo.appendEvent(job.id, "started", workerId);
      return this.repo.findById(job.id);
    }
    return job;
  }

  complete(jobId: string, result: object, workerId: string): Job {
    const job = this.repo.complete(jobId, result);
    this.repo.appendEvent(jobId, "completed", workerId, { resultKeys: Object.keys(result) });
    return job;
  }

  // Records failure; auto-retries with exponential backoff or dead-letters.
  fail(jobId: string, error: string, workerId: string): Job {
    const job = this.repo.fail(jobId, error);

    if (job.status === "dead") {
      this.repo.appendEvent(jobId, "dead_lettered", workerId, { error, retryCount: job.retryCount });
    } else {
      this.repo.appendEvent(jobId, "retried", workerId, {
        error,
        retryCount: job.retryCount,
        scheduledAt: job.scheduledAt,
      });
    }

    return job;
  }

  findById(jobId: string): Job | undefined {
    return this.repo.findById(jobId);
  }

  pendingFor(workspaceId: string): Job[] {
    return this.repo.findByWorkspace(workspaceId, "pending");
  }

  allFor(workspaceId: string): Job[] {
    return this.repo.findByWorkspace(workspaceId);
  }

  statsForAgent(agentType: string): QueueStats {
    const rows = this.repo.countByAgentTypeAndStatus(agentType);
    const map = Object.fromEntries(rows.map((r) => [r.status, r.count]));
    return {
      agentType,
      pending: map["pending"] ?? 0,
      processing: (map["claimed"] ?? 0) + (map["processing"] ?? 0),
      completed: map["completed"] ?? 0,
      failed: map["failed"] ?? 0,
      dead: map["dead"] ?? 0,
    };
  }

  // Returns pending counts across all agent types — used by sidebar.
  allQueueDepths(): { agentType: string; count: number }[] {
    return this.repo.pendingCountByAgentType();
  }

  eventsForJob(jobId: string) {
    return this.repo.eventsForJob(jobId);
  }
}
