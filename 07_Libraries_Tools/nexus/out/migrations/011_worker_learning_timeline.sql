CREATE TABLE IF NOT EXISTS project_timeline_events (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  eventType TEXT NOT NULL,
  actorAgentType TEXT,
  relatedJobId TEXT,
  title TEXT NOT NULL,
  details TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (relatedJobId) REFERENCES jobs(id)
);

CREATE INDEX IF NOT EXISTS idx_project_timeline_workspace
  ON project_timeline_events(workspaceId, createdAt DESC);

CREATE TABLE IF NOT EXISTS worker_learning_patterns (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  agentType TEXT NOT NULL,
  jobType TEXT NOT NULL,
  signature TEXT NOT NULL,
  complexity TEXT NOT NULL DEFAULT 'low',
  solutionJson TEXT NOT NULL,
  usageCount INTEGER NOT NULL DEFAULT 0,
  lastUsedAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_worker_learning_unique
  ON worker_learning_patterns(workspaceId, agentType, jobType, signature);
