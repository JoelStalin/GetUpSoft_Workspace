CREATE TABLE IF NOT EXISTS prompt_executions (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  epic TEXT NOT NULL,
  title TEXT NOT NULL,
  technicalWeight INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  startedAt TEXT,
  completedAt TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prompt_executions_workspaceId ON prompt_executions(workspaceId);
CREATE INDEX IF NOT EXISTS idx_prompt_executions_epic ON prompt_executions(epic);

CREATE TABLE IF NOT EXISTS prompt_execution_steps (
  id TEXT PRIMARY KEY,
  executionId TEXT NOT NULL,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  completedAt TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (executionId) REFERENCES prompt_executions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prompt_execution_steps_executionId ON prompt_execution_steps(executionId);

CREATE TABLE IF NOT EXISTS tool_result_blobs (
  id TEXT PRIMARY KEY,
  messageId TEXT,
  workspaceId TEXT NOT NULL,
  contentHash TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  preview TEXT NOT NULL,
  storedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tool_result_blobs_contentHash ON tool_result_blobs(contentHash);
CREATE INDEX IF NOT EXISTS idx_tool_result_blobs_workspaceId ON tool_result_blobs(workspaceId);
