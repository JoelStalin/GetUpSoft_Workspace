CREATE TABLE IF NOT EXISTS job_schedules (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  agentType TEXT NOT NULL,
  jobType TEXT NOT NULL,
  cadenceHours INTEGER NOT NULL DEFAULT 24,
  payloadJson TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1,
  lastEnqueuedAt TEXT,
  nextRunAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_schedules_unique
  ON job_schedules(workspaceId, agentType, jobType);

CREATE INDEX IF NOT EXISTS idx_job_schedules_due
  ON job_schedules(enabled, nextRunAt);

CREATE TABLE IF NOT EXISTS model_recommendations (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  agentType TEXT,
  capability TEXT,
  jobType TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  rationale TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.5,
  sourceAgentType TEXT NOT NULL,
  sourceJobId TEXT,
  sourcesJson TEXT NOT NULL DEFAULT '[]',
  observedAt TEXT NOT NULL,
  expiresAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (sourceJobId) REFERENCES jobs(id)
);

CREATE INDEX IF NOT EXISTS idx_model_recommendations_lookup
  ON model_recommendations(workspaceId, agentType, capability, jobType, observedAt DESC);
