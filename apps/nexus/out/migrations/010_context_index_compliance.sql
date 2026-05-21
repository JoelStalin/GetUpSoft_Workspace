CREATE TABLE IF NOT EXISTS context_index_entries (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  sourceType TEXT NOT NULL,
  sourceId TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tagsJson TEXT NOT NULL DEFAULT '[]',
  searchableText TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_context_index_source
  ON context_index_entries(workspaceId, sourceType, sourceId);

CREATE INDEX IF NOT EXISTS idx_context_index_search
  ON context_index_entries(workspaceId, sourceType, updatedAt DESC);

CREATE TABLE IF NOT EXISTS worker_compliance_reports (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  auditedJobId TEXT NOT NULL,
  auditedAgentType TEXT NOT NULL,
  auditedJobType TEXT NOT NULL,
  complianceJobId TEXT,
  compliant INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'recorded',
  issuesJson TEXT NOT NULL DEFAULT '[]',
  expectedSignalsJson TEXT NOT NULL DEFAULT '[]',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (auditedJobId) REFERENCES jobs(id),
  FOREIGN KEY (complianceJobId) REFERENCES jobs(id)
);

CREATE INDEX IF NOT EXISTS idx_worker_compliance_reports_workspace
  ON worker_compliance_reports(workspaceId, compliant, updatedAt DESC);
