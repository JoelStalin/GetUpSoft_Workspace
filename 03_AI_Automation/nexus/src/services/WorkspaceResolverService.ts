import type { Database } from "../storage/Database.ts";
import { WorkspaceRepository, type WorkspaceDescriptor } from "../storage/repositories/WorkspaceRepository.ts";
import type { Workspace } from "../storage/entities.ts";
import { createHash } from "node:crypto";
import { basename, normalize, resolve } from "node:path";

export type WorkspaceResolveInput = {
  rootPath: string;
  name?: string;
  repoRootPath?: string;
};

export class WorkspaceResolverService {
  private repo: WorkspaceRepository;

  constructor(db: Database) {
    this.repo = new WorkspaceRepository(db);
  }

  resolve(rootPath: string, name?: string): Workspace {
    return this.resolveWorkspace({ rootPath, name });
  }

  resolveWorkspace(input: WorkspaceResolveInput): Workspace {
    const normalizedPath = normalize(resolve(input.rootPath));
    const repoRootPath = normalize(resolve(input.repoRootPath ?? input.rootPath));
    const descriptor: WorkspaceDescriptor = {
      rootPath: input.rootPath,
      name: input.name ?? (basename(normalizedPath) || "workspace"),
      normalizedPath,
      repoRootPath,
      repoFingerprint: this.hashPath(repoRootPath),
      worktreeGroupId: this.hashPath(repoRootPath).slice(0, 16),
    };
    return this.repo.upsert(descriptor);
  }

  findById(id: string): Workspace | undefined {
    return this.repo.findById(id);
  }

  recent(limit = 10): Workspace[] {
    return this.repo.findRecent(limit);
  }

  related(workspaceId: string, limit = 10): Workspace[] {
    const workspace = this.repo.findById(workspaceId);
    if (!workspace?.repoFingerprint) {
      return [];
    }
    return this.repo.findRelatedByRepo(workspace.repoFingerprint, workspaceId, limit);
  }

  private hashPath(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }
}
