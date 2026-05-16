CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  sourceAgent TEXT NOT NULL,
  title TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  workspaceId TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tokenEstimate INTEGER NOT NULL DEFAULT 0,
  isCompacted INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_workspaceId ON messages(workspaceId);
CREATE INDEX IF NOT EXISTS idx_messages_conversationId_createdAt ON messages(conversationId, createdAt);

CREATE TABLE IF NOT EXISTS project_memories (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  category TEXT NOT NULL,
  fact TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  title TEXT NOT NULL,
  rationale TEXT NOT NULL,
  status TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  epic TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  technicalWeight INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_steps (
  id TEXT PRIMARY KEY,
  taskId TEXT NOT NULL,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS change_log (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  agentId TEXT NOT NULL,
  changeType TEXT NOT NULL,
  reason TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS precedent_links (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  intent TEXT NOT NULL,
  stack TEXT NOT NULL,
  filesAffected TEXT NOT NULL,
  sourceProject TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_precedent_links_fingerprint ON precedent_links(fingerprint);

CREATE TABLE IF NOT EXISTS context_packets (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  budgetTotal INTEGER NOT NULL,
  budgetUsed INTEGER NOT NULL,
  deltaOnly INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS metrics_snapshots (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  tokensBaseline INTEGER NOT NULL,
  tokensOptimized INTEGER NOT NULL,
  savingsRatio REAL NOT NULL,
  createdAt TEXT NOT NULL
);
