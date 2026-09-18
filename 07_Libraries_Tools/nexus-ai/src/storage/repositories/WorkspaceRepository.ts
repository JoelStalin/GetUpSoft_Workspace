import type { Database } from "../Database.ts";
import type { Workspace } from "../entities.ts";
import { randomUUID } from "node:crypto";

export type WorkspaceDescriptor = {
  rootPath: string;
  name: string;
  normalizedPath: string;
  repoRootPath: string;
  repoFingerprint: string;
  worktreeGroupId: string;
};

export class WorkspaceRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByPath(rootPath: string): Workspace | undefined {
    return this.db
      .prepare("SELECT * FROM workspaces WHERE rootPath = ?")
      .get(rootPath) as Workspace | undefined;
  }

  findById(id: string): Workspace | undefined {
    return this.db
      .prepare("SELECT * FROM workspaces WHERE id = ?")
      .get(id) as Workspace | undefined;
  }

  findRelatedByRepo(repoFingerprint: string, excludeWorkspaceId?: string, limit = 10): Workspace[] {
    const sql = excludeWorkspaceId
      ? "SELECT * FROM workspaces WHERE repoFingerprint = ? AND id != ? ORDER BY COALESCE(lastOpenedAt, updatedAt) DESC LIMIT ?"
      : "SELECT * FROM workspaces WHERE repoFingerprint = ? ORDER BY COALESCE(lastOpenedAt, updatedAt) DESC LIMIT ?";
    const params = excludeWorkspaceId ? [repoFingerprint, excludeWorkspaceId, limit] : [repoFingerprint, limit];
    return this.db.prepare(sql).all(...params) as Workspace[];
  }

  findRecent(limit = 10): Workspace[] {
    return this.db
      .prepare("SELECT * FROM workspaces ORDER BY COALESCE(lastOpenedAt, updatedAt) DESC LIMIT ?")
      .all(limit) as Workspace[];
  }

  upsert(input: string | WorkspaceDescriptor, legacyName?: string): Workspace {
    const descriptor: WorkspaceDescriptor =
      typeof input === "string"
        ? {
            rootPath: input,
            name: legacyName ?? input,
            normalizedPath: input,
            repoRootPath: input,
            repoFingerprint: input,
            worktreeGroupId: input,
          }
        : input;

    const existing = this.findByPath(descriptor.rootPath);
    const now = new Date().toISOString();
    if (existing) {
      this.db
        .prepare(
          "UPDATE workspaces SET name = ?, normalizedPath = ?, repoRootPath = ?, repoFingerprint = ?, worktreeGroupId = ?, lastOpenedAt = ?, updatedAt = ? WHERE id = ?"
        )
        .run(
          descriptor.name,
          descriptor.normalizedPath,
          descriptor.repoRootPath,
          descriptor.repoFingerprint,
          descriptor.worktreeGroupId,
          now,
          now,
          existing.id
        );
      return this.findById(existing.id) ?? existing;
    }

    const workspace: Workspace = {
      id: randomUUID(),
      name: descriptor.name,
      rootPath: descriptor.rootPath,
      normalizedPath: descriptor.normalizedPath,
      repoRootPath: descriptor.repoRootPath,
      repoFingerprint: descriptor.repoFingerprint,
      worktreeGroupId: descriptor.worktreeGroupId,
      lastOpenedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.db
      .prepare(
        "INSERT INTO workspaces (id, name, rootPath, normalizedPath, repoRootPath, repoFingerprint, worktreeGroupId, lastOpenedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        workspace.id,
        workspace.name,
        workspace.rootPath,
        workspace.normalizedPath,
        workspace.repoRootPath,
        workspace.repoFingerprint,
        workspace.worktreeGroupId,
        workspace.lastOpenedAt,
        workspace.createdAt,
        workspace.updatedAt
      );
    return workspace;
  }

  updateName(id: string, name: string): void {
    this.db
      .prepare("UPDATE workspaces SET name = ?, updatedAt = ? WHERE id = ?")
      .run(name, new Date().toISOString(), id);
  }

  touch(id: string): void {
    const now = new Date().toISOString();
    this.db
      .prepare("UPDATE workspaces SET lastOpenedAt = ?, updatedAt = ? WHERE id = ?")
      .run(now, now, id);
  }
}
