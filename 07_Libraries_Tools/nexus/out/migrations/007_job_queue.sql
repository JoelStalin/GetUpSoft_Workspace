-- Job queue infrastructure: IBM MQ-style persistent work queue
-- Main thread owns all DB writes; worker threads are pure compute nodes.

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  agentType TEXT NOT NULL,
  jobType TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 5,         -- 1=lowest, 10=critical
  status TEXT NOT NULL DEFAULT 'pending',      -- pending|claimed|processing|completed|failed|dead
  payloadJson TEXT NOT NULL DEFAULT '{}',
  resultJson TEXT,
  error TEXT,
  retryCount INTEGER NOT NULL DEFAULT 0,
  maxRetries INTEGER NOT NULL DEFAULT 3,
  scheduledAt TEXT,                            -- delayed/retry scheduling (ISO 8601)
  claimedAt TEXT,
  completedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_claim
  ON jobs(agentType, status, priority DESC, createdAt ASC);

CREATE INDEX IF NOT EXISTS idx_jobs_workspace
  ON jobs(workspaceId, status);

CREATE TABLE IF NOT EXISTS job_events (
  id TEXT PRIMARY KEY,
  jobId TEXT NOT NULL,
  event TEXT NOT NULL,  -- enqueued|claimed|started|completed|failed|retried|dead_lettered
  workerId TEXT,
  dataJson TEXT NOT NULL DEFAULT '{}',
  ts TEXT NOT NULL,
  FOREIGN KEY (jobId) REFERENCES jobs(id)
);

CREATE INDEX IF NOT EXISTS idx_job_events_job ON job_events(jobId, ts);

CREATE TABLE IF NOT EXISTS worker_registry (
  id TEXT PRIMARY KEY,
  agentType TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',   -- idle|busy|stopped
  currentJobId TEXT,
  jobsProcessed INTEGER NOT NULL DEFAULT 0,
  lastHeartbeat TEXT NOT NULL,
  startedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_worker_registry_agent ON worker_registry(agentType, status);
