import type { Database } from "../storage/Database.ts";
import type { ContextCacheEntry, Job } from "../storage/entities.ts";
import { ContextCacheRepository } from "../storage/repositories/PointerMemoryRepository.ts";
import { normalizeText, stableStringify } from "../shared/pointerUtils.ts";

export class ContextCacheService {
  private repo: ContextCacheRepository;

  constructor(db: Database) {
    this.repo = new ContextCacheRepository(db);
  }

  cacheKeyForJob(job: Job): string {
    return `ctx://${job.agentType}/${job.jobType}/${Buffer.from(stableStringify(JSON.parse(job.payloadJson))).toString("hex").slice(0, 24)}`;
  }

  warmForJob(
    job: Job,
    compactContext: string,
    pointerSet: {
      taskPointerUri: string;
      memoryPointers: string[];
      artifactPointers: string[];
      envelopeId?: string;
    },
    tokenCostSaved = 0,
  ): ContextCacheEntry {
    return this.repo.upsert({
      workspaceId: job.workspaceId,
      cacheKey: this.cacheKeyForJob(job),
      agentType: job.agentType,
      jobType: job.jobType,
      normalizedIntent: normalizeText(`${job.agentType} ${job.jobType}`),
      pointerSet,
      compactContext,
      tokenCostSaved,
      ttlSeconds: 60 * 60,
    });
  }

  lookup(workspaceId: string, cacheKey: string): ContextCacheEntry | undefined {
    const entry = this.repo.findByKey(workspaceId, cacheKey);
    if (entry) this.repo.markHit(entry.id);
    return entry;
  }
}
