import type { Database } from "../Database.ts";
import type { Job, JobEvent, JobSchedule, WorkerRegistryEntry } from "../entities.ts";
import { randomUUID } from "node:crypto";

export class JobRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  enqueue(input: {
    workspaceId: string;
    agentType: string;
    jobType: string;
    payload: object;
    priority?: number;
    maxRetries?: number;
    scheduledAt?: string;
  }): Job {
    const now = new Date().toISOString();
    const job: Job = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      agentType: input.agentType,
      jobType: input.jobType,
      priority: input.priority ?? 5,
      status: "pending",
      payloadJson: JSON.stringify(input.payload),
      resultJson: null,
      error: null,
      retryCount: 0,
      maxRetries: input.maxRetries ?? 3,
      scheduledAt: input.scheduledAt ?? null,
      claimedAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.db.prepare(`
      INSERT INTO jobs (id, workspaceId, agentType, jobType, priority, status,
        payloadJson, resultJson, error, retryCount, maxRetries,
        scheduledAt, claimedAt, completedAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      job.id, job.workspaceId, job.agentType, job.jobType, job.priority,
      job.status, job.payloadJson, null, null, 0, job.maxRetries,
      job.scheduledAt, null, null, now, now,
    );
    return job;
  }

  // Atomic claim — single UPDATE with subquery prevents double-claiming.
  claimNext(agentType: string): Job | undefined {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE jobs SET status = 'claimed', claimedAt = ?, updatedAt = ?
      WHERE id = (
        SELECT id FROM jobs
        WHERE agentType = ? AND status = 'pending'
          AND (scheduledAt IS NULL OR scheduledAt <= ?)
        ORDER BY priority DESC, createdAt ASC
        LIMIT 1
      )
    `).run(now, now, agentType, now);

    return this.db.prepare(`
      SELECT * FROM jobs
      WHERE agentType = ? AND status = 'claimed'
      ORDER BY claimedAt DESC LIMIT 1
    `).get(agentType) as Job | undefined;
  }

  setProcessing(jobId: string): void {
    const now = new Date().toISOString();
    this.db.prepare(
      "UPDATE jobs SET status = 'processing', updatedAt = ? WHERE id = ?",
    ).run(now, jobId);
  }

  complete(jobId: string, result: object): Job {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE jobs SET status = 'completed', resultJson = ?, completedAt = ?, updatedAt = ?
      WHERE id = ?
    `).run(JSON.stringify(result), now, now, jobId);
    return this.findById(jobId)!;
  }

  fail(jobId: string, error: string): Job {
    const now = new Date().toISOString();
    const job = this.findById(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    if (job.retryCount < job.maxRetries) {
      // Exponential backoff: 2^retryCount seconds
      const backoffMs = Math.pow(2, job.retryCount) * 1000;
      const scheduledAt = new Date(Date.now() + backoffMs).toISOString();
      this.db.prepare(`
        UPDATE jobs SET status = 'pending', error = ?, retryCount = retryCount + 1,
          scheduledAt = ?, claimedAt = NULL, updatedAt = ?
        WHERE id = ?
      `).run(error, scheduledAt, now, jobId);
    } else {
      this.db.prepare(`
        UPDATE jobs SET status = 'dead', error = ?, completedAt = ?, updatedAt = ?
        WHERE id = ?
      `).run(error, now, now, jobId);
    }

    return this.findById(jobId)!;
  }

  findById(id: string): Job | undefined {
    return this.db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as Job | undefined;
  }

  findByWorkspace(workspaceId: string, status?: string): Job[] {
    if (status) {
      return this.db.prepare(
        "SELECT * FROM jobs WHERE workspaceId = ? AND status = ? ORDER BY priority DESC, createdAt ASC",
      ).all(workspaceId, status) as Job[];
    }
    return this.db.prepare(
      "SELECT * FROM jobs WHERE workspaceId = ? ORDER BY priority DESC, createdAt ASC",
    ).all(workspaceId) as Job[];
  }

  countByAgentTypeAndStatus(agentType: string): { status: string; count: number }[] {
    return this.db.prepare(`
      SELECT status, COUNT(*) as count FROM jobs
      WHERE agentType = ? GROUP BY status
    `).all(agentType) as { status: string; count: number }[];
  }

  pendingCountByAgentType(): { agentType: string; count: number }[] {
    return this.db.prepare(`
      SELECT agentType, COUNT(*) as count FROM jobs
      WHERE status IN ('pending', 'claimed', 'processing')
      GROUP BY agentType ORDER BY count DESC
    `).all() as { agentType: string; count: number }[];
  }

  hasActiveJob(workspaceId: string, agentType: string, jobType: string): boolean {
    const row = this.db.prepare(`
      SELECT COUNT(*) as count FROM jobs
      WHERE workspaceId = ? AND agentType = ? AND jobType = ?
        AND status IN ('pending', 'claimed', 'processing')
    `).get(workspaceId, agentType, jobType) as { count: number };
    return row.count > 0;
  }

  appendEvent(jobId: string, event: string, workerId?: string, data?: object): JobEvent {
    const e: JobEvent = {
      id: randomUUID(),
      jobId,
      event,
      workerId: workerId ?? null,
      dataJson: JSON.stringify(data ?? {}),
      ts: new Date().toISOString(),
    };
    this.db.prepare(
      "INSERT INTO job_events (id, jobId, event, workerId, dataJson, ts) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(e.id, e.jobId, e.event, e.workerId, e.dataJson, e.ts);
    return e;
  }

  eventsForJob(jobId: string): JobEvent[] {
    return this.db.prepare(
      "SELECT * FROM job_events WHERE jobId = ? ORDER BY ts ASC",
    ).all(jobId) as JobEvent[];
  }
}

export class WorkerRegistryRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  register(agentType: string): WorkerRegistryEntry {
    const now = new Date().toISOString();
    const entry: WorkerRegistryEntry = {
      id: randomUUID(),
      agentType,
      status: "idle",
      currentJobId: null,
      jobsProcessed: 0,
      lastHeartbeat: now,
      startedAt: now,
    };
    this.db.prepare(`
      INSERT INTO worker_registry (id, agentType, status, currentJobId, jobsProcessed, lastHeartbeat, startedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(entry.id, entry.agentType, entry.status, null, 0, now, now);
    return entry;
  }

  heartbeat(id: string, status: string, currentJobId: string | null): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE worker_registry SET status = ?, currentJobId = ?, lastHeartbeat = ?
      WHERE id = ?
    `).run(status, currentJobId, now, id);
  }

  incrementProcessed(id: string): void {
    this.db.prepare(
      "UPDATE worker_registry SET jobsProcessed = jobsProcessed + 1 WHERE id = ?",
    ).run(id);
  }

  stop(id: string): void {
    this.db.prepare(
      "UPDATE worker_registry SET status = 'stopped', currentJobId = NULL WHERE id = ?",
    ).run(id);
  }

  all(): WorkerRegistryEntry[] {
    return this.db.prepare("SELECT * FROM worker_registry").all() as WorkerRegistryEntry[];
  }

  byAgentType(agentType: string): WorkerRegistryEntry[] {
    return this.db.prepare(
      "SELECT * FROM worker_registry WHERE agentType = ? ORDER BY startedAt",
    ).all(agentType) as WorkerRegistryEntry[];
  }
}

export class JobScheduleRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  upsert(input: {
    workspaceId: string;
    agentType: string;
    jobType: string;
    cadenceHours: number;
    payload: object;
    nextRunAt?: string;
    enabled?: number;
  }): JobSchedule {
    const existing = this.db.prepare(`
      SELECT * FROM job_schedules
      WHERE workspaceId = ? AND agentType = ? AND jobType = ?
    `).get(input.workspaceId, input.agentType, input.jobType) as JobSchedule | undefined;
    const now = new Date().toISOString();

    if (existing) {
      this.db.prepare(`
        UPDATE job_schedules
        SET cadenceHours = ?, payloadJson = ?, enabled = ?, updatedAt = ?
        WHERE id = ?
      `).run(
        input.cadenceHours,
        JSON.stringify(input.payload),
        input.enabled ?? existing.enabled,
        now,
        existing.id,
      );
      return this.db.prepare("SELECT * FROM job_schedules WHERE id = ?").get(existing.id) as JobSchedule;
    }

    const schedule: JobSchedule = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      agentType: input.agentType,
      jobType: input.jobType,
      cadenceHours: input.cadenceHours,
      payloadJson: JSON.stringify(input.payload),
      enabled: input.enabled ?? 1,
      lastEnqueuedAt: null,
      nextRunAt: input.nextRunAt ?? now,
      createdAt: now,
      updatedAt: now,
    };

    this.db.prepare(`
      INSERT INTO job_schedules (
        id, workspaceId, agentType, jobType, cadenceHours, payloadJson,
        enabled, lastEnqueuedAt, nextRunAt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      schedule.id,
      schedule.workspaceId,
      schedule.agentType,
      schedule.jobType,
      schedule.cadenceHours,
      schedule.payloadJson,
      schedule.enabled,
      schedule.lastEnqueuedAt,
      schedule.nextRunAt,
      schedule.createdAt,
      schedule.updatedAt,
    );

    return schedule;
  }

  findByWorkspace(workspaceId: string): JobSchedule[] {
    return this.db.prepare(`
      SELECT * FROM job_schedules
      WHERE workspaceId = ?
      ORDER BY agentType, jobType
    `).all(workspaceId) as JobSchedule[];
  }

  due(now: string): JobSchedule[] {
    return this.db.prepare(`
      SELECT * FROM job_schedules
      WHERE enabled = 1 AND nextRunAt <= ?
      ORDER BY nextRunAt ASC
    `).all(now) as JobSchedule[];
  }

  markEnqueued(scheduleId: string, lastEnqueuedAt: string, nextRunAt: string): void {
    this.db.prepare(`
      UPDATE job_schedules
      SET lastEnqueuedAt = ?, nextRunAt = ?, updatedAt = ?
      WHERE id = ?
    `).run(lastEnqueuedAt, nextRunAt, lastEnqueuedAt, scheduleId);
  }
}
