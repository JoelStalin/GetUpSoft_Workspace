import type { Database } from "../storage/Database.ts";
import type { Job, MemoryPointer } from "../storage/entities.ts";
import { MemoryPointerRepository } from "../storage/repositories/PointerMemoryRepository.ts";
import { hashContent, makePointerUri } from "../shared/pointerUtils.ts";

type PointerInput = {
  workspaceId: string;
  pointerType: string;
  targetTable: string;
  targetId: string;
  version?: number;
  permissions?: object;
  ttlSeconds?: number | null;
  preferredUri?: string;
  contentForHash?: unknown;
};

export class MemoryPointerResolverService {
  private db: Database;
  private repo: MemoryPointerRepository;

  constructor(db: Database) {
    this.db = db;
    this.repo = new MemoryPointerRepository(db);
  }

  ensurePointer(input: PointerInput): MemoryPointer {
    const pointerUri =
      input.preferredUri ?? makePointerUri(input.pointerType, input.workspaceId, input.targetTable, input.targetId);
    const contentHash =
      input.contentForHash !== undefined
        ? hashContent(input.contentForHash)
        : this.hashForTarget(input.targetTable, input.targetId);

    return this.repo.upsert({
      workspaceId: input.workspaceId,
      pointerUri,
      pointerType: input.pointerType,
      targetTable: input.targetTable,
      targetId: input.targetId,
      version: input.version ?? 1,
      contentHash,
      permissions: input.permissions ?? {},
      ttlSeconds: input.ttlSeconds ?? null,
    });
  }

  resolve(pointerUri: string): Record<string, unknown> | undefined {
    const pointer = this.repo.findByUri(pointerUri);
    if (!pointer) return undefined;

    const row = this.db.prepare(`SELECT * FROM ${pointer.targetTable} WHERE id = ?`).get(pointer.targetId) as
      | Record<string, unknown>
      | undefined;
    if (!row) return undefined;
    return row;
  }

  ensureJobTaskPointer(job: Job): MemoryPointer {
    return this.ensurePointer({
      workspaceId: job.workspaceId,
      pointerType: "task",
      targetTable: "jobs",
      targetId: job.id,
      preferredUri: `task://mission/${job.workspaceId}/${job.id}`,
      contentForHash: job.payloadJson,
    });
  }

  listByWorkspace(workspaceId: string): MemoryPointer[] {
    return this.repo.listByWorkspace(workspaceId);
  }

  private hashForTarget(targetTable: string, targetId: string): string {
    const row = this.db.prepare(`SELECT * FROM ${targetTable} WHERE id = ?`).get(targetId) as
      | Record<string, unknown>
      | undefined;
    return hashContent(row ?? { targetTable, targetId });
  }
}
