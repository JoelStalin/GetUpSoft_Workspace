CREATE TABLE IF NOT EXISTS context_packet_blocks (
  id TEXT PRIMARY KEY,
  packetId TEXT NOT NULL,
  blockType TEXT NOT NULL,
  content TEXT NOT NULL,
  tokenEstimate INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (packetId) REFERENCES context_packets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_context_packet_blocks_packetId ON context_packet_blocks(packetId);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_bindings (
  id TEXT PRIMARY KEY,
  skillId TEXT NOT NULL,
  agentId TEXT NOT NULL,
  enabledAt TEXT NOT NULL,
  FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE,
  FOREIGN KEY (agentId) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_skill_bindings_unique ON skill_bindings(skillId, agentId);

-- Richer metrics beyond what 001 provides
CREATE TABLE IF NOT EXISTS token_metrics (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  conversationId TEXT,
  rawContextTokens INTEGER NOT NULL,
  compactedTokens INTEGER NOT NULL,
  reductionPercent REAL NOT NULL,
  compactionStrategy TEXT NOT NULL DEFAULT 'microcompact',
  measuredAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_token_metrics_workspaceId ON token_metrics(workspaceId);
CREATE INDEX IF NOT EXISTS idx_token_metrics_measuredAt ON token_metrics(measuredAt);
