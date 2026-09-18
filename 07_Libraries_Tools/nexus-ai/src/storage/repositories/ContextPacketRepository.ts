import type { Database } from "../Database.ts";
import type { ContextPacket, ContextPacketBlock } from "../entities.ts";
import { randomUUID } from "node:crypto";

export type NewContextPacket = {
  workspaceId: string;
  budgetTotal: number;
  budgetUsed: number;
  deltaOnly: boolean;
  mode?: string;
  projectSummary?: string | null;
  recentDecisionsJson?: string;
  recentChangesJson?: string;
  skillsHintsJson?: string;
  repositoryConstraintsJson?: string;
  suggestedNextStepsJson?: string;
  blocks?: Array<{ blockType: string; content: string; tokenEstimate?: number }>;
};

export class ContextPacketRepository {
  private db: Database;
  constructor(db: Database) { this.db = db; }

  findLatestByWorkspace(workspaceId: string): ContextPacket | undefined {
    return this.db
      .prepare(
        "SELECT * FROM context_packets WHERE workspaceId = ? ORDER BY createdAt DESC LIMIT 1"
      )
      .get(workspaceId) as ContextPacket | undefined;
  }

  findBlocksForPacket(packetId: string): ContextPacketBlock[] {
    return this.db
      .prepare("SELECT * FROM context_packet_blocks WHERE packetId = ?")
      .all(packetId) as ContextPacketBlock[];
  }

  save(input: NewContextPacket): ContextPacket {
    const packet: ContextPacket = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      budgetTotal: input.budgetTotal,
      budgetUsed: input.budgetUsed,
      deltaOnly: input.deltaOnly ? 1 : 0,
      mode: input.mode ?? "automatic",
      projectSummary: input.projectSummary ?? null,
      recentDecisionsJson: input.recentDecisionsJson ?? "[]",
      recentChangesJson: input.recentChangesJson ?? "[]",
      skillsHintsJson: input.skillsHintsJson ?? "[]",
      repositoryConstraintsJson: input.repositoryConstraintsJson ?? "[]",
      suggestedNextStepsJson: input.suggestedNextStepsJson ?? "[]",
      createdAt: new Date().toISOString(),
    };

    const tx = this.db.transaction(() => {
      this.db
        .prepare(
          "INSERT INTO context_packets (id, workspaceId, budgetTotal, budgetUsed, deltaOnly, mode, projectSummary, recentDecisionsJson, recentChangesJson, skillsHintsJson, repositoryConstraintsJson, suggestedNextStepsJson, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .run(
          packet.id,
          packet.workspaceId,
          packet.budgetTotal,
          packet.budgetUsed,
          packet.deltaOnly,
          packet.mode,
          packet.projectSummary,
          packet.recentDecisionsJson,
          packet.recentChangesJson,
          packet.skillsHintsJson,
          packet.repositoryConstraintsJson,
          packet.suggestedNextStepsJson,
          packet.createdAt
        );

      if (input.blocks) {
        const blockStmt = this.db.prepare(
          "INSERT INTO context_packet_blocks (id, packetId, blockType, content, tokenEstimate) VALUES (?, ?, ?, ?, ?)"
        );
        for (const b of input.blocks) {
          blockStmt.run(randomUUID(), packet.id, b.blockType, b.content, b.tokenEstimate ?? 0);
        }
      }
    });

    tx();
    return packet;
  }
}
