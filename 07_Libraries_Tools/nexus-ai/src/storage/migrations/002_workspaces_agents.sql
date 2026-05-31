CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rootPath TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  name TEXT NOT NULL,
  adapterType TEXT NOT NULL,
  configJson TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agents_workspaceId ON agents(workspaceId);

CREATE TABLE IF NOT EXISTS session_memories (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  workspaceId TEXT NOT NULL,
  category TEXT NOT NULL,
  fact TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_memories_conversationId ON session_memories(conversationId);
CREATE INDEX IF NOT EXISTS idx_session_memories_workspaceId ON session_memories(workspaceId);
