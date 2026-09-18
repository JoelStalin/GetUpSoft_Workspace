export type Workspace = {
  id: string;
  name: string;
  rootPath: string;
  repoRootPath: string | null;
  repoFingerprint: string | null;
  worktreeGroupId: string | null;
  configJson: string;
  createdAt: string;
  updatedAt: string;
};

export type Agent = {
  id: string;
  workspaceId: string;
  name: string;
  adapterType: string;
  configJson: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  workspaceId: string;
  sourceAgent: string;
  agentId: string | null;
  title: string | null;
  sourceAdapter: string | null;
  linkedAgentsJson: string;
  status: string;
  summary: string | null;
  recentContext: string | null;
  sessionMemoryId: string | null;
  relatedFilesJson: string;
  relatedTaskIdsJson: string;
  relatedDecisionIdsJson: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  tokenCount: number | null;
  isCompacted: number;
  blobId: string | null;
  toolName: string | null;
  toolCallId: string | null;
  sourceConversationId: string | null;
  createdAt: string;
};

export type ProjectMemory = {
  id: string;
  workspaceId: string;
  category: string;
  fact: string;
  confidence: number;
  sourceConversationId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SessionMemory = {
  id: string;
  workspaceId: string;
  summary: string;
  keyFacts: string;
  openQuestions: string;
  createdAt: string;
};

export type Decision = {
  id: string;
  workspaceId: string;
  title: string;
  rationale: string | null;
  alternatives: string | null;
  outcome: string | null;
  status: string;
  relatedConversationId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  workspaceId: string;
  epicName: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  assignedAgentId: string | null;
  relatedConversationId: string | null;
  sourceConversationId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskStep = {
  id: string;
  taskId: string;
  description: string;
  status: string;
  createdAt: string;
};

export type PromptExecution = {
  id: string;
  workspaceId: string;
  promptName: string;
  status: string;
  totalSteps: number;
  completedSteps: number;
  startedAt: string;
  completedAt: string | null;
};

export type PromptExecutionStep = {
  id: string;
  executionId: string;
  stepName: string;
  weight: number;
  status: string;
  completedAt: string | null;
};

export type ToolResultBlob = {
  id: string;
  conversationId: string;
  contentHash: string;
  content: string;
  byteSize: number;
  createdAt: string;
};

export type ChangeLogEntry = {
  id: string;
  workspaceId: string;
  changeType: string;
  title: string;
  description: string | null;
  reason: string | null;
  agentId: string | null;
  relatedConversationId: string | null;
  relatedTaskId: string | null;
  precedentId: string | null;
  filesAffectedJson: string;
  createdAt: string;
};

export type ChangeFileLink = {
  id: string;
  changeLogEntryId: string;
  filePath: string;
};

export type ImplementationPrecedent = {
  id: string;
  workspaceId: string;
  intent: string;
  fingerprint: string;
  solutionSummary: string;
  filesAffectedJson: string;
  stack: string | null;
  framework: string | null;
  tags: string;
  successScore: number;
  sourceConversationId: string | null;
  relatedConversationId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContextPacket = {
  id: string;
  workspaceId: string;
  pendingTasksJson: string;
  memoryFactsJson: string;
  precedentHintsJson: string;
  conversationDeltaJson: string;
  skillsHintsJson: string;
  budgetUsed: number;
  createdAt: string;
};

export type ContextPacketBlock = {
  id: string;
  packetId: string;
  blockType: string;
  content: string;
  tokenEstimate: number;
};

export type MetricsSnapshot = {
  id: string;
  workspaceId: string;
  rawContextTokens: number;
  compactedTokens: number;
  reductionPercent: number;
  savingsRatio: number;
  snapshotDate: string;
};

export type TokenMetric = {
  id: string;
  workspaceId: string;
  rawContextTokens: number;
  compactedTokens: number;
  reductionPercent: number;
  savingsRatio: number;
  recordedAt: string;
};

export type ResearchReference = {
  id: string;
  workspaceId: string;
  title: string;
  url: string | null;
  summary: string | null;
  tags: string;
  conversationId: string | null;
  createdAt: string;
};

export type Skill = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  skillKey: string | null;
  scope: string;
  stack: string | null;
  framework: string | null;
  skillBody: string | null;
  tagsJson: string;
  sourceKind: string;
  createdAt: string;
};

export type SkillBinding = {
  id: string;
  skillId: string;
  agentId: string;
  enabledAt: string;
  workspaceId: string | null;
  bindingContext: string | null;
};

export type ContentReplacement = {
  id: string;
  workspaceId: string;
  messageId: string | null;
  originalHash: string;
  replacedContent: string;
  replacedAt: string;
};

export type ResearchReferenceEntity = {
  id: string;
  workspaceId: string;
  title: string;
  url: string | null;
  snippet: string | null;
  source: string | null;
  conversationId: string | null;
  createdAt: string;
};

export type PromptRequirementCoverage = {
  id: string;
  workspaceId: string;
  requirementId: string;
  title: string;
  epicName: string;
  weight: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Job Queue ────────────────────────────────────────────────────────────────

export type Job = {
  id: string;
  workspaceId: string;
  agentType: string;
  jobType: string;
  priority: number;
  status: string;   // pending|claimed|processing|completed|failed|dead
  payloadJson: string;
  resultJson: string | null;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  scheduledAt: string | null;
  claimedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JobEvent = {
  id: string;
  jobId: string;
  event: string;
  workerId: string | null;
  dataJson: string;
  ts: string;
};

export type WorkerRegistryEntry = {
  id: string;
  agentType: string;
  status: string;     // idle|busy|stopped
  currentJobId: string | null;
  jobsProcessed: number;
  lastHeartbeat: string;
  startedAt: string;
};

export type JobSchedule = {
  id: string;
  workspaceId: string;
  agentType: string;
  jobType: string;
  cadenceHours: number;
  payloadJson: string;
  enabled: number;
  lastEnqueuedAt: string | null;
  nextRunAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ModelRecommendation = {
  id: string;
  workspaceId: string;
  agentType: string | null;
  capability: string | null;
  jobType: string | null;
  provider: string;
  model: string;
  rationale: string;
  confidence: number;
  sourceAgentType: string;
  sourceJobId: string | null;
  sourcesJson: string;
  observedAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkerAuditCase = {
  id: string;
  workspaceId: string;
  auditedAgentType: string;
  status: string;
  failureCount: number;
  firstFailureAt: string;
  lastFailureAt: string;
  lastError: string;
  lastJobId: string | null;
  lastWorkerId: string | null;
  auditorJobId: string | null;
  policeJobId: string | null;
  researchJobId: string | null;
  judgeJobId: string | null;
  recruiterJobId: string | null;
  rebuildJobId: string | null;
  decision: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};

export type ContextIndexEntry = {
  id: string;
  workspaceId: string;
  sourceType: string;
  sourceId: string;
  title: string;
  body: string;
  tagsJson: string;
  searchableText: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkerComplianceReport = {
  id: string;
  workspaceId: string;
  auditedJobId: string;
  auditedAgentType: string;
  auditedJobType: string;
  complianceJobId: string | null;
  compliant: number;
  status: string;
  issuesJson: string;
  expectedSignalsJson: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectTimelineEvent = {
  id: string;
  workspaceId: string;
  eventType: string;
  actorAgentType: string | null;
  relatedJobId: string | null;
  title: string;
  details: string | null;
  createdAt: string;
};

export type WorkerLearningPattern = {
  id: string;
  workspaceId: string;
  agentType: string;
  jobType: string;
  signature: string;
  complexity: string;
  solutionJson: string;
  usageCount: number;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type MemoryPointer = {
  id: string;
  workspaceId: string;
  pointerUri: string;
  pointerType: string;
  targetTable: string;
  targetId: string;
  version: number;
  contentHash: string;
  permissionsJson: string;
  ttlSeconds: number | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArtifactStoreEntry = {
  id: string;
  workspaceId: string;
  artifactUri: string;
  artifactType: string;
  title: string;
  mimeType: string | null;
  contentHash: string;
  storageKind: string;
  storagePath: string | null;
  content: string;
  byteSize: number;
  metadataJson: string;
  createdAt: string;
};

export type ContextCacheEntry = {
  id: string;
  workspaceId: string;
  cacheKey: string;
  agentType: string;
  jobType: string;
  normalizedIntent: string;
  pointerSetJson: string;
  compactContext: string;
  tokenCostSaved: number;
  hitCount: number;
  ttlSeconds: number | null;
  expiresAt: string | null;
  createdAt: string;
  lastAccessedAt: string;
};

export type TermRegistryEntry = {
  id: string;
  workspaceId: string;
  termCode: string;
  canonicalTerm: string;
  normalizedTerm: string;
  language: string;
  hexRepresentation: string | null;
  semanticGroupId: string | null;
  aliasesJson: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmbeddingEntry = {
  id: string;
  workspaceId: string;
  ownerType: string;
  ownerId: string;
  model: string;
  dimensions: number;
  vectorJson: string;
  quantized: number;
  compressionScheme: string;
  createdAt: string;
};

export type SemanticCacheEntry = {
  id: string;
  workspaceId: string;
  semanticGroupId: string;
  normalizedQuery: string;
  embeddingId: string;
  resultPointerUri: string;
  confidence: number;
  sourceKind: string;
  hitCount: number;
  ttlSeconds: number | null;
  expiresAt: string | null;
  createdAt: string;
  lastAccessedAt: string;
};

export type PointerEnvelope = {
  id: string;
  workspaceId: string;
  missionId: string;
  traceId: string;
  senderAgent: string;
  receiverAgent: string;
  taskPointerUri: string;
  memoryPointersJson: string;
  artifactPointersJson: string;
  termCodesJson: string;
  cacheKeysJson: string;
  status: string;
  createdAt: string;
  consumedAt: string | null;
};

// ─── Agent roster config (stored in Agent.configJson) ─────────────────────────

export type AgentRosterConfig = {
  role: string;
  capabilities: string[];
  queueName: string;
  systemPromptTemplate: string;
  maxConcurrent: number;
  retryLimit: number;
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  routingHints?: Record<string, string>;
  dailyScheduleHours?: number | null;
  researchFocus?: string[];
  localFirst?: boolean;
  ownsMemory?: boolean;
};
