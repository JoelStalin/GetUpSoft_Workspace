import { randomUUID } from "node:crypto";
import type { Database } from "../Database.ts";
import type { ProjectTimelineEvent } from "../entities.ts";

export class ProjectTimelineRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  record(input: {
    workspaceId: string;
    eventType: string;
    actorAgentType?: string | null;
    relatedJobId?: string | null;
    title: string;
    details?: string | null;
  }): ProjectTimelineEvent {
    const event: ProjectTimelineEvent = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      eventType: input.eventType,
      actorAgentType: input.actorAgentType ?? null,
      relatedJobId: input.relatedJobId ?? null,
      title: input.title,
      details: input.details ?? null,
      createdAt: new Date().toISOString(),
    };

    this.db.prepare(`
      INSERT INTO project_timeline_events (
        id, workspaceId, eventType, actorAgentType, relatedJobId, title, details, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id,
      event.workspaceId,
      event.eventType,
      event.actorAgentType,
      event.relatedJobId,
      event.title,
      event.details,
      event.createdAt,
    );

    return event;
  }

  recent(workspaceId: string, limit = 20): ProjectTimelineEvent[] {
    return this.db.prepare(`
      SELECT * FROM project_timeline_events
      WHERE workspaceId = ?
      ORDER BY createdAt DESC
      LIMIT ?
    `).all(workspaceId, limit) as ProjectTimelineEvent[];
  }
}
