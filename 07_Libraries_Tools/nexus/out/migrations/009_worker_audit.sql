CREATE TABLE IF NOT EXISTS worker_audit_cases (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  auditedAgentType TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  failureCount INTEGER NOT NULL DEFAULT 0,
  firstFailureAt TEXT NOT NULL,
  lastFailureAt TEXT NOT NULL,
  lastError TEXT NOT NULL,
  lastJobId TEXT,
  lastWorkerId TEXT,
  auditorJobId TEXT,
  policeJobId TEXT,
  researchJobId TEXT,
  judgeJobId TEXT,
  recruiterJobId TEXT,
  rebuildJobId TEXT,
  decision TEXT,
  resolutionNotes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  closedAt TEXT,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (lastJobId) REFERENCES jobs(id),
  FOREIGN KEY (auditorJobId) REFERENCES jobs(id),
  FOREIGN KEY (policeJobId) REFERENCES jobs(id),
  FOREIGN KEY (researchJobId) REFERENCES jobs(id),
  FOREIGN KEY (judgeJobId) REFERENCES jobs(id),
  FOREIGN KEY (recruiterJobId) REFERENCES jobs(id),
  FOREIGN KEY (rebuildJobId) REFERENCES jobs(id)
);

CREATE INDEX IF NOT EXISTS idx_worker_audit_cases_workspace
  ON worker_audit_cases(workspaceId, status, failureCount DESC, updatedAt DESC);

CREATE INDEX IF NOT EXISTS idx_worker_audit_cases_agent
  ON worker_audit_cases(workspaceId, auditedAgentType, status);
