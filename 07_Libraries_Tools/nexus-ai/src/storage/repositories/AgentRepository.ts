import type { Database } from "../Database.ts";
import type { Agent } from "../entities.ts";
import { randomUUID } from "node:crypto";

export class AgentRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findByWorkspace(workspaceId: string): Agent[] {
    return this.db
      .prepare("SELECT * FROM agents WHERE workspaceId = ? ORDER BY createdAt")
      .all(workspaceId) as Agent[];
  }

  findById(id: string): Agent | undefined {
    return this.db
      .prepare("SELECT * FROM agents WHERE id = ?")
      .get(id) as Agent | undefined;
  }

  findByWorkspaceAndName(workspaceId: string, name: string): Agent | undefined {
    return this.db
      .prepare("SELECT * FROM agents WHERE workspaceId = ? AND name = ?")
      .get(workspaceId, name) as Agent | undefined;
  }

  create(workspaceId: string, name: string, adapterType: string, config: object = {}): Agent {
    const existing = this.findByWorkspaceAndName(workspaceId, name);
    if (existing) {
      this.db
        .prepare("UPDATE agents SET adapterType = ?, configJson = ? WHERE id = ?")
        .run(adapterType, JSON.stringify(config), existing.id);
      return this.findById(existing.id) ?? existing;
    }

    const now = new Date().toISOString();
    const agent: Agent = {
      id: randomUUID(),
      workspaceId,
      name,
      adapterType,
      configJson: JSON.stringify(config),
      createdAt: now,
    };
    this.db
      .prepare(
        "INSERT INTO agents (id, workspaceId, name, adapterType, configJson, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(agent.id, agent.workspaceId, agent.name, agent.adapterType, agent.configJson, agent.createdAt);
    return agent;
  }
}
