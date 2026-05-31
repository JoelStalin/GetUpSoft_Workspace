import { randomUUID } from "node:crypto";
import type { Database } from "../storage/Database.ts";
import type { PointerEnvelope } from "../storage/entities.ts";
import { PointerEnvelopeRepository } from "../storage/repositories/PointerMemoryRepository.ts";

export class PointerEnvelopeService {
  private repo: PointerEnvelopeRepository;

  constructor(db: Database) {
    this.repo = new PointerEnvelopeRepository(db);
  }

  create(input: {
    workspaceId: string;
    senderAgent: string;
    receiverAgent: string;
    taskPointerUri: string;
    memoryPointers: string[];
    artifactPointers?: string[];
    termCodes?: string[];
    cacheKeys?: string[];
    missionId?: string;
    traceId?: string;
  }): PointerEnvelope {
    return this.repo.create({
      workspaceId: input.workspaceId,
      missionId: input.missionId ?? `mission-${randomUUID().slice(0, 8)}`,
      traceId: input.traceId ?? randomUUID(),
      senderAgent: input.senderAgent,
      receiverAgent: input.receiverAgent,
      taskPointerUri: input.taskPointerUri,
      memoryPointers: input.memoryPointers,
      artifactPointers: input.artifactPointers ?? [],
      termCodes: input.termCodes ?? [],
      cacheKeys: input.cacheKeys ?? [],
    });
  }

  markConsumed(id: string, status = "consumed"): void {
    this.repo.markConsumed(id, status);
  }

  listByWorkspace(workspaceId: string): PointerEnvelope[] {
    return this.repo.listByWorkspace(workspaceId);
  }
}
