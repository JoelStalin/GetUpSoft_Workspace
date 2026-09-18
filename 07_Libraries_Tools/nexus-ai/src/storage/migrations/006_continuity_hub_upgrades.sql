ALTER TABLE workspaces ADD COLUMN normalizedPath TEXT;
ALTER TABLE workspaces ADD COLUMN repoRootPath TEXT;
ALTER TABLE workspaces ADD COLUMN repoFingerprint TEXT;
ALTER TABLE workspaces ADD COLUMN worktreeGroupId TEXT;
ALTER TABLE workspaces ADD COLUMN lastOpenedAt TEXT;

ALTER TABLE conversations ADD COLUMN agentId TEXT;
ALTER TABLE conversations ADD COLUMN sourceAdapter TEXT;
ALTER TABLE conversations ADD COLUMN linkedAgentsJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE conversations ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE conversations ADD COLUMN summary TEXT;
ALTER TABLE conversations ADD COLUMN recentContext TEXT;
ALTER TABLE conversations ADD COLUMN sessionMemoryId TEXT;
ALTER TABLE conversations ADD COLUMN relatedFilesJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE conversations ADD COLUMN relatedTaskIdsJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE conversations ADD COLUMN relatedDecisionIdsJson TEXT NOT NULL DEFAULT '[]';

ALTER TABLE messages ADD COLUMN agentId TEXT;
ALTER TABLE messages ADD COLUMN normalizedSearchText TEXT;
ALTER TABLE messages ADD COLUMN summary TEXT;
ALTER TABLE messages ADD COLUMN attachmentsJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE messages ADD COLUMN relatedFilesJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE messages ADD COLUMN relatedTaskIdsJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE messages ADD COLUMN toolUseMetadataJson TEXT;
ALTER TABLE messages ADD COLUMN toolResultReference TEXT;
ALTER TABLE messages ADD COLUMN compactionStrategy TEXT;
ALTER TABLE messages ADD COLUMN updatedAt TEXT;

ALTER TABLE project_memories ADD COLUMN memoryType TEXT NOT NULL DEFAULT 'projectFacts';
ALTER TABLE project_memories ADD COLUMN sourceConversationId TEXT;
ALTER TABLE project_memories ADD COLUMN lastUsedAt TEXT;

ALTER TABLE decisions ADD COLUMN relatedConversationId TEXT;
ALTER TABLE decisions ADD COLUMN relatedTaskId TEXT;
ALTER TABLE decisions ADD COLUMN updatedAt TEXT;

ALTER TABLE tasks ADD COLUMN sourceConversationId TEXT;
ALTER TABLE tasks ADD COLUMN sourceMessageId TEXT;
ALTER TABLE tasks ADD COLUMN description TEXT;
ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN tagsJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN relatedFilesJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN dependsOnJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN acceptanceCriteriaJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN completionPercent REAL NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN kind TEXT NOT NULL DEFAULT 'task';

ALTER TABLE prompt_executions ADD COLUMN completionPercent REAL NOT NULL DEFAULT 0;
ALTER TABLE prompt_execution_steps ADD COLUMN notes TEXT;

ALTER TABLE change_log_entries ADD COLUMN adapterId TEXT;
ALTER TABLE change_log_entries ADD COLUMN actorType TEXT NOT NULL DEFAULT 'agent';
ALTER TABLE change_log_entries ADD COLUMN affectedEntityType TEXT;
ALTER TABLE change_log_entries ADD COLUMN affectedEntityId TEXT;
ALTER TABLE change_log_entries ADD COLUMN beforeStateRef TEXT;
ALTER TABLE change_log_entries ADD COLUMN afterStateRef TEXT;
ALTER TABLE change_log_entries ADD COLUMN evidenceRef TEXT;
ALTER TABLE change_log_entries ADD COLUMN relatedConversationId TEXT;
ALTER TABLE change_log_entries ADD COLUMN relatedTaskId TEXT;
ALTER TABLE change_log_entries ADD COLUMN relatedDecisionId TEXT;
ALTER TABLE change_log_entries ADD COLUMN relatedPrecedentId TEXT;

ALTER TABLE implementation_precedents ADD COLUMN agentId TEXT;
ALTER TABLE implementation_precedents ADD COLUMN repoId TEXT;
ALTER TABLE implementation_precedents ADD COLUMN projectLabel TEXT;
ALTER TABLE implementation_precedents ADD COLUMN resultNotes TEXT;
ALTER TABLE implementation_precedents ADD COLUMN patchReference TEXT;
ALTER TABLE implementation_precedents ADD COLUMN variantSummary TEXT;

ALTER TABLE context_packets ADD COLUMN mode TEXT NOT NULL DEFAULT 'automatic';
ALTER TABLE context_packets ADD COLUMN projectSummary TEXT;
ALTER TABLE context_packets ADD COLUMN recentDecisionsJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE context_packets ADD COLUMN recentChangesJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE context_packets ADD COLUMN skillsHintsJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE context_packets ADD COLUMN repositoryConstraintsJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE context_packets ADD COLUMN suggestedNextStepsJson TEXT NOT NULL DEFAULT '[]';

ALTER TABLE token_metrics ADD COLUMN rawContextChars INTEGER NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN compressedContextChars INTEGER NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN cacheReusePercent REAL NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN reusedContextBlocks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN summarizedContextBlocks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN offloadedPayloadCount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN toolResultCompactions INTEGER NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN memoryExtractions INTEGER NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN similarImplementationHits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN precedentReusePercent REAL NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN duplicateReinventionAvoidedCount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE token_metrics ADD COLUMN crossProjectConsistencyMatches INTEGER NOT NULL DEFAULT 0;

ALTER TABLE skills ADD COLUMN skillKey TEXT;
ALTER TABLE skills ADD COLUMN scope TEXT NOT NULL DEFAULT 'workspace';
ALTER TABLE skills ADD COLUMN stack TEXT;
ALTER TABLE skills ADD COLUMN framework TEXT;
ALTER TABLE skills ADD COLUMN skillBody TEXT;
ALTER TABLE skills ADD COLUMN tagsJson TEXT NOT NULL DEFAULT '[]';
ALTER TABLE skills ADD COLUMN sourceKind TEXT NOT NULL DEFAULT 'manual';

ALTER TABLE skill_bindings ADD COLUMN workspaceId TEXT;
ALTER TABLE skill_bindings ADD COLUMN bindingContext TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_skills_skillKey ON skills(skillKey);
CREATE INDEX IF NOT EXISTS idx_workspaces_repoRootPath ON workspaces(repoRootPath);
CREATE INDEX IF NOT EXISTS idx_workspaces_worktreeGroupId ON workspaces(worktreeGroupId);
CREATE INDEX IF NOT EXISTS idx_workspaces_lastOpenedAt ON workspaces(lastOpenedAt);
CREATE INDEX IF NOT EXISTS idx_conversations_workspaceId_updatedAt ON conversations(workspaceId, updatedAt);
CREATE INDEX IF NOT EXISTS idx_messages_workspaceId_createdAt ON messages(workspaceId, createdAt);
CREATE INDEX IF NOT EXISTS idx_project_memories_workspaceId_memoryType ON project_memories(workspaceId, memoryType);
CREATE INDEX IF NOT EXISTS idx_project_memories_workspaceId_lastUsedAt ON project_memories(workspaceId, lastUsedAt);
CREATE INDEX IF NOT EXISTS idx_decisions_workspaceId_status ON decisions(workspaceId, status);
CREATE INDEX IF NOT EXISTS idx_tasks_workspaceId_status_priority ON tasks(workspaceId, status, priority);
CREATE INDEX IF NOT EXISTS idx_change_log_entries_workspaceId_createdAt ON change_log_entries(workspaceId, createdAt);
CREATE INDEX IF NOT EXISTS idx_token_metrics_workspaceId_measuredAt ON token_metrics(workspaceId, measuredAt);

CREATE TABLE IF NOT EXISTS content_replacements (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  messageId TEXT,
  originalContentHash TEXT NOT NULL,
  replacementPreview TEXT NOT NULL,
  blobId TEXT,
  strategy TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_content_replacements_workspaceId ON content_replacements(workspaceId);

CREATE TABLE IF NOT EXISTS research_references (
  id TEXT PRIMARY KEY,
  workspaceId TEXT,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  url TEXT NOT NULL,
  notes TEXT,
  example TEXT,
  tagsJson TEXT NOT NULL DEFAULT '[]',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_research_references_workspaceId ON research_references(workspaceId);

CREATE TABLE IF NOT EXISTS prompt_requirement_coverage (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  requirementKey TEXT NOT NULL,
  epic TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  evidence TEXT,
  reason TEXT,
  updatedAt TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_requirement_coverage_unique
  ON prompt_requirement_coverage(workspaceId, requirementKey);
