import type { Database } from "../storage/Database.ts";
import type { Job, WorkerLearningPattern } from "../storage/entities.ts";
import { WorkerLearningRepository } from "../storage/repositories/WorkerLearningRepository.ts";

export type JobComplexity = "low" | "medium" | "high";

export class WorkerLearningService {
  private repo: WorkerLearningRepository;

  constructor(db: Database) {
    this.repo = new WorkerLearningRepository(db);
  }

  classify(job: Job): JobComplexity {
    const payload = JSON.parse(job.payloadJson) as Record<string, unknown>;
    const serialized = JSON.stringify(payload);
    const keyCount = Object.keys(payload).length;

    if (
      serialized.length > 1600 ||
      keyCount > 8 ||
      /(research|architecture|security|integration|workflow|judge|audit)/i.test(job.jobType)
    ) {
      return "high";
    }

    if (serialized.length > 500 || keyCount > 4) {
      return "medium";
    }

    return "low";
  }

  reusableFor(job: Job): WorkerLearningPattern | undefined {
    const signaturePayload = this.signaturePayload(job);
    const pattern = this.repo.findReusable(job.workspaceId, job.agentType, job.jobType, signaturePayload);
    if (pattern) this.repo.markUsed(pattern.id);
    return pattern;
  }

  learn(job: Job, solution: object, complexity?: JobComplexity): WorkerLearningPattern {
    return this.repo.upsert({
      workspaceId: job.workspaceId,
      agentType: job.agentType,
      jobType: job.jobType,
      signaturePayload: this.signaturePayload(job),
      complexity: complexity ?? this.classify(job),
      solution,
    });
  }

  listByWorkspace(workspaceId: string): WorkerLearningPattern[] {
    return this.repo.listByWorkspace(workspaceId);
  }

  signaturePayload(job: Job): object {
    const payload = JSON.parse(job.payloadJson) as Record<string, unknown>;
    return {
      jobType: job.jobType,
      agentType: job.agentType,
      keys: Object.keys(payload).sort(),
      payload,
    };
  }
}
