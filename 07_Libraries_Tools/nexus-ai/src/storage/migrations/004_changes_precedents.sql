-- Extend change_log with richer fields
CREATE TABLE IF NOT EXISTS change_log_entries (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  agentId TEXT NOT NULL,
  changeType TEXT NOT NULL,
  title TEXT NOT NULL,
  reason TEXT,
  diffSummary TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_change_log_entries_workspaceId ON change_log_entries(workspaceId);
CREATE INDEX IF NOT EXISTS idx_change_log_entries_createdAt ON change_log_entries(createdAt);

CREATE TABLE IF NOT EXISTS change_file_links (
  id TEXT PRIMARY KEY,
  changeLogEntryId TEXT NOT NULL,
  filePath TEXT NOT NULL,
  action TEXT NOT NULL,
  FOREIGN KEY (changeLogEntryId) REFERENCES change_log_entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_change_file_links_entryId ON change_file_links(changeLogEntryId);

CREATE TABLE IF NOT EXISTS implementation_precedents (
  id TEXT PRIMARY KEY,
  workspaceId TEXT,
  sourceProject TEXT NOT NULL,
  fingerprint TEXT NOT NULL UNIQUE,
  intent TEXT NOT NULL,
  stack TEXT NOT NULL,
  filesAffected TEXT NOT NULL,
  rationale TEXT,
  outcome TEXT NOT NULL DEFAULT 'success',
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_implementation_precedents_fingerprint ON implementation_precedents(fingerprint);

CREATE TABLE IF NOT EXISTS precedent_variants (
  id TEXT PRIMARY KEY,
  precedentId TEXT NOT NULL,
  variantLabel TEXT NOT NULL,
  description TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (precedentId) REFERENCES implementation_precedents(id) ON DELETE CASCADE
);
