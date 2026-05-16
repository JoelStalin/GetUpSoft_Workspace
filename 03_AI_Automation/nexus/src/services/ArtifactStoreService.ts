import type { Database } from "../storage/Database.ts";
import type { ArtifactStoreEntry, Job } from "../storage/entities.ts";
import { ArtifactStoreRepository } from "../storage/repositories/PointerMemoryRepository.ts";
import { hashContent } from "../shared/pointerUtils.ts";

export class ArtifactStoreService {
  private repo: ArtifactStoreRepository;

  constructor(db: Database) {
    this.repo = new ArtifactStoreRepository(db);
  }

  store(
    workspaceId: string,
    artifactType: string,
    title: string,
    content: string,
    options: {
      artifactUri: string;
      mimeType?: string | null;
      metadata?: object;
    },
  ): ArtifactStoreEntry {
    return this.repo.put({
      workspaceId,
      artifactUri: options.artifactUri,
      artifactType,
      title,
      content,
      mimeType: options.mimeType ?? "application/json",
      metadata: {
        contentHash: hashContent(content),
        ...(options.metadata ?? {}),
      },
    });
  }

  storeJson(
    workspaceId: string,
    artifactType: string,
    title: string,
    payload: object,
    options: {
      artifactUri: string;
      metadata?: object;
    },
  ): ArtifactStoreEntry {
    return this.store(workspaceId, artifactType, title, JSON.stringify(payload), {
      artifactUri: options.artifactUri,
      mimeType: "application/json",
      metadata: options.metadata,
    });
  }

  storeJobResult(job: Job, result: Record<string, unknown>): ArtifactStoreEntry {
    return this.storeJson(
      job.workspaceId,
      "result",
      `${job.agentType} ${job.jobType} result`,
      result,
      {
        artifactUri: `result://job/${job.id}/output`,
        metadata: { agentType: job.agentType, jobType: job.jobType },
      },
    );
  }

  getByUri(artifactUri: string): ArtifactStoreEntry | undefined {
    return this.repo.findByUri(artifactUri);
  }

  listByWorkspace(workspaceId: string): ArtifactStoreEntry[] {
    return this.repo.listByWorkspace(workspaceId);
  }
}
