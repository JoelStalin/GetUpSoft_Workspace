CREATE TABLE IF NOT EXISTS memory_pointers (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  pointerUri TEXT NOT NULL,
  pointerType TEXT NOT NULL,
  targetTable TEXT NOT NULL,
  targetId TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  contentHash TEXT NOT NULL,
  permissionsJson TEXT NOT NULL DEFAULT '{}',
  ttlSeconds INTEGER,
  expiresAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_pointers_uri
  ON memory_pointers(pointerUri);

CREATE INDEX IF NOT EXISTS idx_memory_pointers_workspace
  ON memory_pointers(workspaceId, pointerType, updatedAt DESC);

CREATE TABLE IF NOT EXISTS artifact_store (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  artifactUri TEXT NOT NULL,
  artifactType TEXT NOT NULL,
  title TEXT NOT NULL,
  mimeType TEXT,
  contentHash TEXT NOT NULL,
  storageKind TEXT NOT NULL DEFAULT 'sqlite',
  storagePath TEXT,
  content TEXT NOT NULL,
  byteSize INTEGER NOT NULL DEFAULT 0,
  metadataJson TEXT NOT NULL DEFAULT '{}',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_artifact_store_uri
  ON artifact_store(artifactUri);

CREATE INDEX IF NOT EXISTS idx_artifact_store_workspace
  ON artifact_store(workspaceId, artifactType, createdAt DESC);

CREATE TABLE IF NOT EXISTS context_cache (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  cacheKey TEXT NOT NULL,
  agentType TEXT NOT NULL,
  jobType TEXT NOT NULL,
  normalizedIntent TEXT NOT NULL,
  pointerSetJson TEXT NOT NULL,
  compactContext TEXT NOT NULL,
  tokenCostSaved INTEGER NOT NULL DEFAULT 0,
  hitCount INTEGER NOT NULL DEFAULT 0,
  ttlSeconds INTEGER,
  expiresAt TEXT,
  createdAt TEXT NOT NULL,
  lastAccessedAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_context_cache_unique
  ON context_cache(workspaceId, cacheKey);

CREATE INDEX IF NOT EXISTS idx_context_cache_workspace
  ON context_cache(workspaceId, agentType, jobType, lastAccessedAt DESC);

CREATE TABLE IF NOT EXISTS term_registry (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  termCode TEXT NOT NULL,
  canonicalTerm TEXT NOT NULL,
  normalizedTerm TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'neutral',
  hexRepresentation TEXT,
  semanticGroupId TEXT,
  aliasesJson TEXT NOT NULL DEFAULT '[]',
  description TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_term_registry_code
  ON term_registry(workspaceId, termCode);

CREATE INDEX IF NOT EXISTS idx_term_registry_term
  ON term_registry(workspaceId, normalizedTerm);

CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  ownerType TEXT NOT NULL,
  ownerId TEXT NOT NULL,
  model TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  vectorJson TEXT NOT NULL,
  quantized INTEGER NOT NULL DEFAULT 0,
  compressionScheme TEXT NOT NULL DEFAULT 'none',
  createdAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);

CREATE INDEX IF NOT EXISTS idx_embeddings_owner
  ON embeddings(workspaceId, ownerType, ownerId);

CREATE TABLE IF NOT EXISTS semantic_cache (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  semanticGroupId TEXT NOT NULL,
  normalizedQuery TEXT NOT NULL,
  embeddingId TEXT NOT NULL,
  resultPointerUri TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  sourceKind TEXT NOT NULL,
  hitCount INTEGER NOT NULL DEFAULT 0,
  ttlSeconds INTEGER,
  expiresAt TEXT,
  createdAt TEXT NOT NULL,
  lastAccessedAt TEXT NOT NULL,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (embeddingId) REFERENCES embeddings(id)
);

CREATE INDEX IF NOT EXISTS idx_semantic_cache_workspace
  ON semantic_cache(workspaceId, sourceKind, lastAccessedAt DESC);

CREATE TABLE IF NOT EXISTS pointer_envelopes (
  id TEXT PRIMARY KEY,
  workspaceId TEXT NOT NULL,
  missionId TEXT NOT NULL,
  traceId TEXT NOT NULL,
  senderAgent TEXT NOT NULL,
  receiverAgent TEXT NOT NULL,
  taskPointerUri TEXT NOT NULL,
  memoryPointersJson TEXT NOT NULL,
  artifactPointersJson TEXT NOT NULL,
  termCodesJson TEXT NOT NULL,
  cacheKeysJson TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  createdAt TEXT NOT NULL,
  consumedAt TEXT,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);

CREATE INDEX IF NOT EXISTS idx_pointer_envelopes_workspace
  ON pointer_envelopes(workspaceId, receiverAgent, createdAt DESC);
