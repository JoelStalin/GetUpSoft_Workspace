// src/extension.ts
import * as vscode9 from "vscode";
import * as path from "path";
import * as fs from "fs";

// src/storage/Database.ts
import BetterSqlite3 from "better-sqlite3";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
var __dirname = dirname(fileURLToPath(import.meta.url));
var MIGRATIONS_DIR = join(__dirname, "migrations");
function openDatabase(dbPath) {
  const db = new BetterSqlite3(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}
function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      appliedAt TEXT NOT NULL
    )
  `);
  const applied = new Set(
    db.prepare("SELECT version FROM schema_migrations").all().map((r) => r.version)
  );
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  const insertMigration = db.prepare(
    "INSERT INTO schema_migrations (version, appliedAt) VALUES (?, ?)"
  );
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    db.exec(sql);
    insertMigration.run(file, (/* @__PURE__ */ new Date()).toISOString());
  }
}

// src/storage/repositories/AgentRepository.ts
import { randomUUID } from "node:crypto";
var AgentRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByWorkspace(workspaceId) {
    return this.db.prepare("SELECT * FROM agents WHERE workspaceId = ? ORDER BY createdAt").all(workspaceId);
  }
  findById(id) {
    return this.db.prepare("SELECT * FROM agents WHERE id = ?").get(id);
  }
  findByWorkspaceAndName(workspaceId, name) {
    return this.db.prepare("SELECT * FROM agents WHERE workspaceId = ? AND name = ?").get(workspaceId, name);
  }
  create(workspaceId, name, adapterType, config = {}) {
    const existing = this.findByWorkspaceAndName(workspaceId, name);
    if (existing) {
      this.db.prepare("UPDATE agents SET adapterType = ?, configJson = ? WHERE id = ?").run(adapterType, JSON.stringify(config), existing.id);
      return this.findById(existing.id) ?? existing;
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const agent = {
      id: randomUUID(),
      workspaceId,
      name,
      adapterType,
      configJson: JSON.stringify(config),
      createdAt: now
    };
    this.db.prepare(
      "INSERT INTO agents (id, workspaceId, name, adapterType, configJson, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(agent.id, agent.workspaceId, agent.name, agent.adapterType, agent.configJson, agent.createdAt);
    return agent;
  }
};

// src/storage/repositories/WorkspaceRepository.ts
import { randomUUID as randomUUID2 } from "node:crypto";
var WorkspaceRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByPath(rootPath) {
    return this.db.prepare("SELECT * FROM workspaces WHERE rootPath = ?").get(rootPath);
  }
  findById(id) {
    return this.db.prepare("SELECT * FROM workspaces WHERE id = ?").get(id);
  }
  findRelatedByRepo(repoFingerprint, excludeWorkspaceId, limit = 10) {
    const sql = excludeWorkspaceId ? "SELECT * FROM workspaces WHERE repoFingerprint = ? AND id != ? ORDER BY COALESCE(lastOpenedAt, updatedAt) DESC LIMIT ?" : "SELECT * FROM workspaces WHERE repoFingerprint = ? ORDER BY COALESCE(lastOpenedAt, updatedAt) DESC LIMIT ?";
    const params = excludeWorkspaceId ? [repoFingerprint, excludeWorkspaceId, limit] : [repoFingerprint, limit];
    return this.db.prepare(sql).all(...params);
  }
  findRecent(limit = 10) {
    return this.db.prepare("SELECT * FROM workspaces ORDER BY COALESCE(lastOpenedAt, updatedAt) DESC LIMIT ?").all(limit);
  }
  upsert(input, legacyName) {
    const descriptor = typeof input === "string" ? {
      rootPath: input,
      name: legacyName ?? input,
      normalizedPath: input,
      repoRootPath: input,
      repoFingerprint: input,
      worktreeGroupId: input
    } : input;
    const existing = this.findByPath(descriptor.rootPath);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (existing) {
      this.db.prepare(
        "UPDATE workspaces SET name = ?, normalizedPath = ?, repoRootPath = ?, repoFingerprint = ?, worktreeGroupId = ?, lastOpenedAt = ?, updatedAt = ? WHERE id = ?"
      ).run(
        descriptor.name,
        descriptor.normalizedPath,
        descriptor.repoRootPath,
        descriptor.repoFingerprint,
        descriptor.worktreeGroupId,
        now,
        now,
        existing.id
      );
      return this.findById(existing.id) ?? existing;
    }
    const workspace2 = {
      id: randomUUID2(),
      name: descriptor.name,
      rootPath: descriptor.rootPath,
      normalizedPath: descriptor.normalizedPath,
      repoRootPath: descriptor.repoRootPath,
      repoFingerprint: descriptor.repoFingerprint,
      worktreeGroupId: descriptor.worktreeGroupId,
      lastOpenedAt: now,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(
      "INSERT INTO workspaces (id, name, rootPath, normalizedPath, repoRootPath, repoFingerprint, worktreeGroupId, lastOpenedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      workspace2.id,
      workspace2.name,
      workspace2.rootPath,
      workspace2.normalizedPath,
      workspace2.repoRootPath,
      workspace2.repoFingerprint,
      workspace2.worktreeGroupId,
      workspace2.lastOpenedAt,
      workspace2.createdAt,
      workspace2.updatedAt
    );
    return workspace2;
  }
  updateName(id, name) {
    this.db.prepare("UPDATE workspaces SET name = ?, updatedAt = ? WHERE id = ?").run(name, (/* @__PURE__ */ new Date()).toISOString(), id);
  }
  touch(id) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare("UPDATE workspaces SET lastOpenedAt = ?, updatedAt = ? WHERE id = ?").run(now, now, id);
  }
};

// src/services/WorkspaceResolverService.ts
import { createHash } from "node:crypto";
import { basename, normalize, resolve } from "node:path";
var WorkspaceResolverService = class {
  repo;
  constructor(db) {
    this.repo = new WorkspaceRepository(db);
  }
  resolve(rootPath, name) {
    return this.resolveWorkspace({ rootPath, name });
  }
  resolveWorkspace(input) {
    const normalizedPath = normalize(resolve(input.rootPath));
    const repoRootPath = normalize(resolve(input.repoRootPath ?? input.rootPath));
    const descriptor = {
      rootPath: input.rootPath,
      name: input.name ?? (basename(normalizedPath) || "workspace"),
      normalizedPath,
      repoRootPath,
      repoFingerprint: this.hashPath(repoRootPath),
      worktreeGroupId: this.hashPath(repoRootPath).slice(0, 16)
    };
    return this.repo.upsert(descriptor);
  }
  findById(id) {
    return this.repo.findById(id);
  }
  recent(limit = 10) {
    return this.repo.findRecent(limit);
  }
  related(workspaceId, limit = 10) {
    const workspace2 = this.repo.findById(workspaceId);
    if (!workspace2?.repoFingerprint) {
      return [];
    }
    return this.repo.findRelatedByRepo(workspace2.repoFingerprint, workspaceId, limit);
  }
  hashPath(value) {
    return createHash("sha256").update(value).digest("hex");
  }
};

// src/storage/repositories/ConversationRepository.ts
import { randomUUID as randomUUID3 } from "node:crypto";
var ConversationRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findById(id) {
    return this.db.prepare("SELECT * FROM conversations WHERE id = ?").get(id);
  }
  findByWorkspace(workspaceId, limit = 50) {
    return this.db.prepare(
      "SELECT * FROM conversations WHERE workspaceId = ? ORDER BY updatedAt DESC LIMIT ?"
    ).all(workspaceId, limit);
  }
  create(input, sourceAgent, title) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const params = typeof input === "string" ? { workspaceId: input, sourceAgent: sourceAgent ?? "manual", title } : input;
    const conv = {
      id: randomUUID3(),
      workspaceId: params.workspaceId,
      sourceAgent: params.sourceAgent,
      agentId: params.agentId ?? null,
      title: params.title ?? null,
      sourceAdapter: params.sourceAdapter ?? null,
      linkedAgentsJson: params.linkedAgentsJson ?? "[]",
      status: params.status ?? "active",
      summary: params.summary ?? null,
      recentContext: params.recentContext ?? null,
      sessionMemoryId: params.sessionMemoryId ?? null,
      relatedFilesJson: params.relatedFilesJson ?? "[]",
      relatedTaskIdsJson: params.relatedTaskIdsJson ?? "[]",
      relatedDecisionIdsJson: params.relatedDecisionIdsJson ?? "[]",
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(
      "INSERT INTO conversations (id, workspaceId, sourceAgent, agentId, title, sourceAdapter, linkedAgentsJson, status, summary, recentContext, sessionMemoryId, relatedFilesJson, relatedTaskIdsJson, relatedDecisionIdsJson, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      conv.id,
      conv.workspaceId,
      conv.sourceAgent,
      conv.agentId,
      conv.title,
      conv.sourceAdapter,
      conv.linkedAgentsJson,
      conv.status,
      conv.summary,
      conv.recentContext,
      conv.sessionMemoryId,
      conv.relatedFilesJson,
      conv.relatedTaskIdsJson,
      conv.relatedDecisionIdsJson,
      conv.createdAt,
      conv.updatedAt
    );
    return conv;
  }
  touch(id) {
    this.db.prepare("UPDATE conversations SET updatedAt = ? WHERE id = ?").run((/* @__PURE__ */ new Date()).toISOString(), id);
  }
};

// src/storage/repositories/MessageRepository.ts
import { randomUUID as randomUUID4 } from "node:crypto";
var MessageRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByConversation(conversationId) {
    return this.db.prepare(
      "SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt"
    ).all(conversationId);
  }
  findUncompactedByWorkspace(workspaceId, limit = 200) {
    return this.db.prepare(
      "SELECT * FROM messages WHERE workspaceId = ? AND isCompacted = 0 ORDER BY createdAt LIMIT ?"
    ).all(workspaceId, limit);
  }
  insert(input, workspaceId, role, content, tokenEstimate = 0) {
    const params = typeof input === "string" ? {
      conversationId: input,
      workspaceId: workspaceId ?? "",
      role: role ?? "user",
      content: content ?? "",
      tokenEstimate
    } : input;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const msg = {
      id: randomUUID4(),
      conversationId: params.conversationId,
      workspaceId: params.workspaceId,
      agentId: params.agentId ?? null,
      role: params.role,
      content: params.content,
      normalizedSearchText: params.normalizedSearchText ?? null,
      summary: params.summary ?? null,
      attachmentsJson: params.attachmentsJson ?? "[]",
      relatedFilesJson: params.relatedFilesJson ?? "[]",
      relatedTaskIdsJson: params.relatedTaskIdsJson ?? "[]",
      toolUseMetadataJson: params.toolUseMetadataJson ?? null,
      toolResultReference: params.toolResultReference ?? null,
      tokenEstimate: params.tokenEstimate ?? 0,
      isCompacted: params.isCompacted ? 1 : 0,
      compactionStrategy: params.compactionStrategy ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(
      "INSERT INTO messages (id, conversationId, workspaceId, agentId, role, content, normalizedSearchText, summary, attachmentsJson, relatedFilesJson, relatedTaskIdsJson, toolUseMetadataJson, toolResultReference, tokenEstimate, isCompacted, compactionStrategy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      msg.id,
      msg.conversationId,
      msg.workspaceId,
      msg.agentId,
      msg.role,
      msg.content,
      msg.normalizedSearchText,
      msg.summary,
      msg.attachmentsJson,
      msg.relatedFilesJson,
      msg.relatedTaskIdsJson,
      msg.toolUseMetadataJson,
      msg.toolResultReference,
      msg.tokenEstimate,
      msg.isCompacted,
      msg.compactionStrategy,
      msg.createdAt,
      msg.updatedAt
    );
    return msg;
  }
  markCompacted(ids) {
    const stmt = this.db.prepare("UPDATE messages SET isCompacted = 1, updatedAt = ? WHERE id = ?");
    const tx = this.db.transaction((idList) => {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      for (const id of idList) stmt.run(now, id);
    });
    tx(ids);
  }
};

// src/services/ConversationCaptureService.ts
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
function normalizeSearchText(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}
var ConversationCaptureService = class {
  convRepo;
  msgRepo;
  constructor(db) {
    this.convRepo = new ConversationRepository(db);
    this.msgRepo = new MessageRepository(db);
  }
  async captureFromAdapter(workspaceId, adapter) {
    const captured = await adapter.capture();
    return this.captureConversation({
      workspaceId,
      sourceAgent: captured.sourceAgent,
      sourceAdapter: adapter.describe().adapterType,
      title: captured.title,
      summary: captured.summary,
      recentContext: captured.recentContext,
      relatedFiles: captured.relatedFiles,
      linkedAgents: captured.linkedAgents,
      messages: captured.messages
    });
  }
  appendMessage(conversationId, workspaceId, role, content) {
    this.msgRepo.insert({
      conversationId,
      workspaceId,
      role,
      content,
      normalizedSearchText: normalizeSearchText(content),
      tokenEstimate: estimateTokens(content)
    });
    this.convRepo.touch(conversationId);
  }
  findRecent(workspaceId, limit = 20) {
    return this.convRepo.findByWorkspace(workspaceId, limit);
  }
  captureConversation(input) {
    const conv = this.convRepo.create({
      workspaceId: input.workspaceId,
      sourceAgent: input.sourceAgent,
      agentId: input.agentId ?? null,
      title: input.title,
      sourceAdapter: input.sourceAdapter ?? null,
      summary: input.summary ?? null,
      recentContext: input.recentContext ?? null,
      linkedAgentsJson: JSON.stringify(input.linkedAgents ?? []),
      relatedFilesJson: JSON.stringify(input.relatedFiles ?? [])
    });
    for (const msg of input.messages) {
      this.msgRepo.insert({
        conversationId: conv.id,
        workspaceId: input.workspaceId,
        agentId: input.agentId ?? null,
        role: msg.role,
        content: msg.content,
        summary: msg.summary ?? null,
        attachmentsJson: JSON.stringify(msg.attachments ?? []),
        relatedFilesJson: JSON.stringify(msg.relatedFiles ?? input.relatedFiles ?? []),
        relatedTaskIdsJson: JSON.stringify(msg.relatedTaskIds ?? []),
        toolUseMetadataJson: msg.toolUseMetadata ? JSON.stringify(msg.toolUseMetadata) : null,
        toolResultReference: msg.toolResultReference ?? null,
        normalizedSearchText: normalizeSearchText(msg.content),
        tokenEstimate: estimateTokens(msg.content),
        compactionStrategy: msg.compactionStrategy ?? null
      });
    }
    return conv;
  }
};

// src/storage/repositories/ProjectMemoryRepository.ts
import { randomUUID as randomUUID5 } from "node:crypto";
var ProjectMemoryRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByWorkspace(workspaceId, category) {
    if (category) {
      return this.db.prepare(
        "SELECT * FROM project_memories WHERE workspaceId = ? AND category = ? ORDER BY confidence DESC"
      ).all(workspaceId, category);
    }
    return this.db.prepare(
      "SELECT * FROM project_memories WHERE workspaceId = ? ORDER BY confidence DESC"
    ).all(workspaceId);
  }
  upsert(workspaceId, category, fact, confidence = 1, memoryType = category, sourceConversationId) {
    const existing = this.db.prepare(
      "SELECT * FROM project_memories WHERE workspaceId = ? AND category = ? AND fact = ?"
    ).get(workspaceId, category, fact);
    if (existing) {
      this.db.prepare("UPDATE project_memories SET confidence = ?, memoryType = ?, sourceConversationId = COALESCE(?, sourceConversationId), lastUsedAt = ? WHERE id = ?").run(confidence, memoryType, sourceConversationId ?? null, (/* @__PURE__ */ new Date()).toISOString(), existing.id);
      return {
        ...existing,
        confidence,
        memoryType,
        sourceConversationId: sourceConversationId ?? existing.sourceConversationId,
        lastUsedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const memory = {
      id: randomUUID5(),
      workspaceId,
      category,
      memoryType,
      fact,
      confidence,
      sourceConversationId: sourceConversationId ?? null,
      createdAt: now,
      lastUsedAt: now
    };
    this.db.prepare(
      "INSERT INTO project_memories (id, workspaceId, category, memoryType, fact, confidence, sourceConversationId, createdAt, lastUsedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      memory.id,
      memory.workspaceId,
      memory.category,
      memory.memoryType,
      memory.fact,
      memory.confidence,
      memory.sourceConversationId,
      memory.createdAt,
      memory.lastUsedAt
    );
    return memory;
  }
  delete(id) {
    this.db.prepare("DELETE FROM project_memories WHERE id = ?").run(id);
  }
};

// src/services/ProjectMemoryService.ts
var ProjectMemoryService = class {
  repo;
  constructor(db) {
    this.repo = new ProjectMemoryRepository(db);
  }
  learn(workspaceId, category, fact, confidence = 1) {
    return this.repo.upsert(workspaceId, category, fact, confidence);
  }
  recall(workspaceId, category) {
    return this.repo.findByWorkspace(workspaceId, category);
  }
  forget(id) {
    this.repo.delete(id);
  }
  summarize(workspaceId, maxItems = 20) {
    return this.repo.findByWorkspace(workspaceId).slice(0, maxItems).map((m) => `[${m.category}] ${m.fact}`);
  }
};

// src/services/SessionMemoryService.ts
import { createHash as createHash2, randomUUID as randomUUID6 } from "node:crypto";
var SessionMemoryService = class {
  db;
  msgRepo;
  constructor(db) {
    this.db = db;
    this.msgRepo = new MessageRepository(db);
  }
  record(conversationId, workspaceId, category, fact, confidence = 1) {
    const memory = {
      id: randomUUID6(),
      conversationId,
      workspaceId,
      category,
      fact,
      confidence,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.prepare(
      "INSERT INTO session_memories (id, conversationId, workspaceId, category, fact, confidence, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(memory.id, memory.conversationId, memory.workspaceId, memory.category, memory.fact, memory.confidence, memory.createdAt);
    return memory;
  }
  findByConversation(conversationId) {
    return this.db.prepare(
      "SELECT * FROM session_memories WHERE conversationId = ? ORDER BY confidence DESC"
    ).all(conversationId);
  }
  summarize(conversationId) {
    return this.findByConversation(conversationId).map((m) => `[${m.category}] ${m.fact}`);
  }
  estimateMessageTokens(content) {
    return Math.ceil(content.length / 4);
  }
  evaluateTimeBasedTrigger(lastExtractionAt, cooldownMinutes = 15) {
    if (!lastExtractionAt) {
      return true;
    }
    return Date.now() - Date.parse(lastExtractionAt) >= cooldownMinutes * 6e4;
  }
  shouldExtractMemory(conversationId, threshold = 8) {
    return this.getToolCallsBetweenUpdates(conversationId) >= threshold;
  }
  hasMetInitializationThreshold(conversationId, messageThreshold = 6) {
    return this.msgRepo.findByConversation(conversationId).length >= messageThreshold;
  }
  hasMetUpdateThreshold(conversationId, messageThreshold = 4) {
    const memories = this.findByConversation(conversationId);
    if (memories.length === 0) {
      return this.hasMetInitializationThreshold(conversationId, messageThreshold);
    }
    const latestMemoryAt = memories[0]?.createdAt ?? null;
    const newerMessages = this.msgRepo.findByConversation(conversationId).filter((message) => !latestMemoryAt || Date.parse(message.createdAt) > Date.parse(latestMemoryAt));
    return newerMessages.length >= messageThreshold;
  }
  getToolCallsBetweenUpdates(conversationId) {
    return this.msgRepo.findByConversation(conversationId).filter((message) => message.toolUseMetadataJson).length;
  }
  getSessionMemoryContent(conversationId) {
    return this.summarize(conversationId).join("\n");
  }
  recordExtractionTokenCount(conversationId, workspaceId) {
    const content = this.getSessionMemoryContent(conversationId);
    return this.record(
      conversationId,
      workspaceId,
      "memoryExtraction",
      `Extracted ${this.estimateMessageTokens(content)} tokens from session memory`,
      1
    );
  }
  setLastSummarizedMessageId(conversationId, workspaceId, messageId) {
    return this.record(conversationId, workspaceId, "lastSummarizedMessageId", messageId, 1);
  }
  waitForSessionMemoryExtraction() {
    return Promise.resolve();
  }
  contentHash(content) {
    return createHash2("sha256").update(content).digest("hex");
  }
};

// src/storage/repositories/TaskRepository.ts
import { randomUUID as randomUUID7 } from "node:crypto";
var TaskRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByWorkspace(workspaceId, epic) {
    if (epic) {
      return this.db.prepare(
        "SELECT * FROM tasks WHERE workspaceId = ? AND epic = ? ORDER BY createdAt"
      ).all(workspaceId, epic);
    }
    return this.db.prepare("SELECT * FROM tasks WHERE workspaceId = ? ORDER BY epic, createdAt").all(workspaceId);
  }
  findById(id) {
    return this.db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  }
  create(input, epic, title, technicalWeight = 1) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const params = typeof input === "string" ? {
      workspaceId: input,
      epic: epic ?? "general",
      title: title ?? "Untitled task",
      technicalWeight
    } : input;
    const task = {
      id: randomUUID7(),
      workspaceId: params.workspaceId,
      epic: params.epic,
      title: params.title,
      description: params.description ?? null,
      status: params.status ?? "pending",
      priority: params.priority ?? "medium",
      tagsJson: params.tagsJson ?? "[]",
      relatedFilesJson: params.relatedFilesJson ?? "[]",
      dependsOnJson: params.dependsOnJson ?? "[]",
      acceptanceCriteriaJson: params.acceptanceCriteriaJson ?? "[]",
      completionPercent: params.completionPercent ?? 0,
      kind: params.kind ?? "task",
      sourceConversationId: params.sourceConversationId ?? null,
      sourceMessageId: params.sourceMessageId ?? null,
      technicalWeight: params.technicalWeight ?? technicalWeight,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(
      "INSERT INTO tasks (id, workspaceId, epic, title, description, status, priority, tagsJson, relatedFilesJson, dependsOnJson, acceptanceCriteriaJson, completionPercent, kind, sourceConversationId, sourceMessageId, technicalWeight, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      task.id,
      task.workspaceId,
      task.epic,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.tagsJson,
      task.relatedFilesJson,
      task.dependsOnJson,
      task.acceptanceCriteriaJson,
      task.completionPercent,
      task.kind,
      task.sourceConversationId,
      task.sourceMessageId,
      task.technicalWeight,
      task.createdAt,
      task.updatedAt
    );
    return task;
  }
  updateStatus(id, status) {
    this.db.prepare("UPDATE tasks SET status = ?, updatedAt = ? WHERE id = ?").run(status, (/* @__PURE__ */ new Date()).toISOString(), id);
  }
  updateCompletion(id, completionPercent) {
    this.db.prepare("UPDATE tasks SET completionPercent = ?, updatedAt = ? WHERE id = ?").run(Math.max(0, Math.min(100, completionPercent)), (/* @__PURE__ */ new Date()).toISOString(), id);
  }
  addStep(taskId, title) {
    const step = {
      id: randomUUID7(),
      taskId,
      title,
      done: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.prepare(
      "INSERT INTO task_steps (id, taskId, title, done, createdAt) VALUES (?, ?, ?, ?, ?)"
    ).run(step.id, step.taskId, step.title, step.done, step.createdAt);
    return step;
  }
  pendingByWorkspace(workspaceId, limit = 25) {
    return this.db.prepare(
      "SELECT * FROM tasks WHERE workspaceId = ? AND status != 'done' ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, updatedAt DESC LIMIT ?"
    ).all(workspaceId, limit);
  }
  findSteps(taskId) {
    return this.db.prepare("SELECT * FROM task_steps WHERE taskId = ? ORDER BY createdAt").all(taskId);
  }
  completeStep(stepId) {
    this.db.prepare("UPDATE task_steps SET done = 1 WHERE id = ?").run(stepId);
  }
};

// src/services/TaskExtractionService.ts
var TODO_PATTERNS = [
  /(?:TODO|task|need to|should|must|have to)[:\s]+(.+)/gi,
  /[-*]\s+\[[ x]\]\s+(.+)/g
];
var TaskExtractionService = class {
  repo;
  constructor(db) {
    this.repo = new TaskRepository(db);
  }
  extractFromText(workspaceId, epic, text) {
    const tasks = [];
    for (const pattern of TODO_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        const title = match[1].trim().slice(0, 200);
        if (title) {
          tasks.push(this.repo.create(workspaceId, epic, title));
        }
      }
    }
    return tasks;
  }
  create(workspaceId, epic, title, weight = 1) {
    return this.repo.create(workspaceId, epic, title, weight);
  }
  addStep(taskId, title) {
    return this.repo.addStep(taskId, title);
  }
  completeStep(stepId) {
    this.repo.completeStep(stepId);
  }
  complete(taskId) {
    this.repo.updateStatus(taskId, "done");
  }
  findByEpic(workspaceId, epic) {
    return this.repo.findByWorkspace(workspaceId, epic);
  }
  findSteps(taskId) {
    return this.repo.findSteps(taskId);
  }
};

// src/storage/repositories/ChangeLogRepository.ts
import { randomUUID as randomUUID8 } from "node:crypto";
var ChangeLogRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByWorkspace(workspaceId, limit = 100) {
    return this.db.prepare(
      "SELECT * FROM change_log_entries WHERE workspaceId = ? ORDER BY createdAt DESC LIMIT ?"
    ).all(workspaceId, limit);
  }
  findFilesForEntry(entryId) {
    return this.db.prepare("SELECT * FROM change_file_links WHERE changeLogEntryId = ?").all(entryId);
  }
  record(input) {
    const entry = {
      id: randomUUID8(),
      workspaceId: input.workspaceId,
      agentId: input.agentId,
      adapterId: input.adapterId ?? null,
      actorType: input.actorType ?? "agent",
      changeType: input.changeType,
      title: input.title,
      reason: input.reason ?? null,
      affectedEntityType: input.affectedEntityType ?? null,
      affectedEntityId: input.affectedEntityId ?? null,
      beforeStateRef: input.beforeStateRef ?? null,
      afterStateRef: input.afterStateRef ?? null,
      evidenceRef: input.evidenceRef ?? null,
      relatedConversationId: input.relatedConversationId ?? null,
      relatedTaskId: input.relatedTaskId ?? null,
      relatedDecisionId: input.relatedDecisionId ?? null,
      relatedPrecedentId: input.relatedPrecedentId ?? null,
      diffSummary: input.diffSummary ?? null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const tx = this.db.transaction(() => {
      this.db.prepare(
        "INSERT INTO change_log_entries (id, workspaceId, agentId, adapterId, actorType, changeType, title, reason, affectedEntityType, affectedEntityId, beforeStateRef, afterStateRef, evidenceRef, relatedConversationId, relatedTaskId, relatedDecisionId, relatedPrecedentId, diffSummary, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        entry.id,
        entry.workspaceId,
        entry.agentId,
        entry.adapterId,
        entry.actorType,
        entry.changeType,
        entry.title,
        entry.reason,
        entry.affectedEntityType,
        entry.affectedEntityId,
        entry.beforeStateRef,
        entry.afterStateRef,
        entry.evidenceRef,
        entry.relatedConversationId,
        entry.relatedTaskId,
        entry.relatedDecisionId,
        entry.relatedPrecedentId,
        entry.diffSummary,
        entry.createdAt
      );
      if (input.filesAffected) {
        const linkStmt = this.db.prepare(
          "INSERT INTO change_file_links (id, changeLogEntryId, filePath, action) VALUES (?, ?, ?, ?)"
        );
        for (const f of input.filesAffected) {
          linkStmt.run(randomUUID8(), entry.id, f.filePath, f.action);
        }
      }
    });
    tx();
    return entry;
  }
};

// src/services/ChangeAuditService.ts
var ChangeAuditService = class {
  repo;
  constructor(db) {
    this.repo = new ChangeLogRepository(db);
  }
  record(input) {
    return this.repo.record(input);
  }
  findByWorkspace(workspaceId, limit = 100) {
    return this.repo.findByWorkspace(workspaceId, limit);
  }
  filesAffectedBy(entryId) {
    return this.repo.findFilesForEntry(entryId).map((f) => `${f.action}:${f.filePath}`);
  }
  summarize(workspaceId, limit = 10) {
    return this.repo.findByWorkspace(workspaceId, limit).map((e) => `[${e.changeType}] ${e.title}`);
  }
  query(workspaceId, filter) {
    const all = this.repo.findByWorkspace(workspaceId, filter.limit ?? 200);
    return all.filter((e) => {
      if (filter.agentId && e.agentId !== filter.agentId) return false;
      if (filter.changeType && e.changeType !== filter.changeType) return false;
      if (filter.taskId && e.relatedTaskId !== filter.taskId) return false;
      if (filter.conversationId && e.relatedConversationId !== filter.conversationId) return false;
      return true;
    });
  }
  queryByAgent(workspaceId, agentId, limit = 50) {
    return this.query(workspaceId, { agentId, limit });
  }
  queryByTask(workspaceId, taskId) {
    return this.query(workspaceId, { taskId });
  }
  queryByConversation(workspaceId, conversationId) {
    return this.query(workspaceId, { conversationId });
  }
  auditSummary(workspaceId, limit = 200) {
    const entries = this.repo.findByWorkspace(workspaceId, limit);
    const byAgent = {};
    const byType = {};
    for (const e of entries) {
      byAgent[e.agentId] = (byAgent[e.agentId] ?? 0) + 1;
      byType[e.changeType] = (byType[e.changeType] ?? 0) + 1;
    }
    return {
      totalChanges: entries.length,
      byAgent,
      byType,
      recentTitles: entries.slice(0, 5).map((e) => e.title)
    };
  }
  recordBatch(inputs) {
    return inputs.map((i) => this.record(i));
  }
  linkToPrecedent(workspaceId, entryId, precedentId) {
    this.repo.record({
      workspaceId,
      agentId: "system",
      changeType: "link",
      title: `Linked change ${entryId} to precedent ${precedentId}`,
      reason: "Automatic precedent link",
      relatedPrecedentId: precedentId,
      filesAffected: []
    });
  }
  answerWho(workspaceId, changeId) {
    const entries = this.repo.findByWorkspace(workspaceId, 1e3);
    const entry = entries.find((e) => e.id === changeId);
    return entry?.agentId ?? "unknown";
  }
  answerWhy(workspaceId, changeId) {
    const entries = this.repo.findByWorkspace(workspaceId, 1e3);
    const entry = entries.find((e) => e.id === changeId);
    return entry?.reason ?? "no reason recorded";
  }
  answerWhat(workspaceId, changeId) {
    const files = this.filesAffectedBy(changeId);
    const entries = this.repo.findByWorkspace(workspaceId, 1e3);
    const entry = entries.find((e) => e.id === changeId);
    return `[${entry?.changeType}] ${entry?.title ?? "unknown"} \u2014 files: ${files.join(", ")}`;
  }
};

// src/services/ImplementationPrecedentService.ts
import { createHash as createHash3 } from "node:crypto";

// src/storage/repositories/ImplementationPrecedentRepository.ts
import { randomUUID as randomUUID9 } from "node:crypto";
var ImplementationPrecedentRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByFingerprint(fingerprint) {
    return this.db.prepare("SELECT * FROM implementation_precedents WHERE fingerprint = ?").get(fingerprint);
  }
  findByWorkspace(workspaceId) {
    return this.db.prepare(
      "SELECT * FROM implementation_precedents WHERE workspaceId = ? OR workspaceId IS NULL ORDER BY createdAt DESC"
    ).all(workspaceId);
  }
  findByRepo(repoId, limit = 50) {
    return this.db.prepare(
      "SELECT * FROM implementation_precedents WHERE repoId = ? ORDER BY createdAt DESC LIMIT ?"
    ).all(repoId, limit);
  }
  upsert(input) {
    const existing = this.findByFingerprint(input.fingerprint);
    if (existing) return existing;
    const record = {
      id: randomUUID9(),
      ...input,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.prepare(
      "INSERT INTO implementation_precedents (id, workspaceId, sourceProject, repoId, projectLabel, agentId, fingerprint, intent, stack, filesAffected, rationale, outcome, resultNotes, patchReference, variantSummary, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      record.id,
      record.workspaceId,
      record.sourceProject,
      record.repoId,
      record.projectLabel,
      record.agentId,
      record.fingerprint,
      record.intent,
      record.stack,
      record.filesAffected,
      record.rationale,
      record.outcome,
      record.resultNotes,
      record.patchReference,
      record.variantSummary,
      record.createdAt
    );
    return record;
  }
};

// src/services/ImplementationPrecedentService.ts
var ImplementationPrecedentService = class {
  repo;
  constructor(db) {
    this.repo = new ImplementationPrecedentRepository(db);
  }
  fingerprint(change) {
    const stableFiles = [...change.filesAffected].sort().join("|");
    const seed = `${change.intent}::${change.stack}::${stableFiles}`;
    return createHash3("sha256").update(seed).digest("hex");
  }
  register(sourceProject, change, rationale, workspaceId) {
    const fp = this.fingerprint(change);
    return this.repo.upsert({
      workspaceId: workspaceId ?? null,
      sourceProject,
      repoId: change.repoId ?? null,
      projectLabel: change.projectLabel ?? null,
      agentId: change.agentId ?? null,
      fingerprint: fp,
      intent: change.intent,
      stack: change.stack,
      filesAffected: JSON.stringify(change.filesAffected),
      rationale: rationale ?? change.rationale ?? null,
      outcome: change.outcome ?? "success",
      resultNotes: change.resultNotes ?? null,
      patchReference: change.patchReference ?? null,
      variantSummary: change.variantSummary ?? null
    });
  }
  resolve(change) {
    const fingerprint = this.fingerprint(change);
    const exact = this.repo.findByFingerprint(fingerprint);
    return {
      fingerprint,
      precedent: exact,
      similar: exact ? [exact] : this.findSimilarImplementations(change)
    };
  }
  findByWorkspace(workspaceId) {
    return this.repo.findByWorkspace(workspaceId);
  }
  findSimilarImplementations(change, limit = 5) {
    const pool = change.repoId ? this.repo.findByRepo(change.repoId, 100) : this.repo.findByWorkspace(change.workspaceId ?? "");
    return pool.map((precedent) => ({
      precedent,
      score: this.scoreConsistencyAgainstPrecedents(change, precedent)
    })).filter((entry) => entry.score > 0.25).sort((a, b) => b.score - a.score).slice(0, limit).map((entry) => entry.precedent);
  }
  buildPrecedentPacket(change) {
    return this.findSimilarImplementations(change).map((precedent) => {
      const files = JSON.parse(precedent.filesAffected || "[]");
      return `${precedent.sourceProject}: ${precedent.intent} [${files.join(", ")}] -> ${precedent.outcome}`;
    });
  }
  scoreConsistencyAgainstPrecedents(change, precedent) {
    let score = 0;
    if (precedent.stack === change.stack) {
      score += 0.4;
    }
    if (precedent.intent.toLowerCase() === change.intent.toLowerCase()) {
      score += 0.4;
    }
    const precedentFiles = new Set(JSON.parse(precedent.filesAffected || "[]"));
    const overlap = change.filesAffected.filter((file) => precedentFiles.has(file)).length;
    if (precedentFiles.size > 0) {
      score += Math.min(0.2, overlap / precedentFiles.size);
    }
    return Math.min(1, score);
  }
};

// src/services/TranscriptService.ts
var TranscriptService = class {
  convRepo;
  msgRepo;
  constructor(db) {
    this.convRepo = new ConversationRepository(db);
    this.msgRepo = new MessageRepository(db);
  }
  getTranscript(conversationId) {
    return this.msgRepo.findByConversation(conversationId).map(toLine);
  }
  getActiveMessages(workspaceId, limit = 200) {
    return this.msgRepo.findUncompactedByWorkspace(workspaceId, limit).map(toLine);
  }
  totalTokens(conversationId) {
    return this.msgRepo.findByConversation(conversationId).reduce((sum, m) => sum + m.tokenEstimate, 0);
  }
  renderableSearchText(content) {
    return content.toLowerCase().replace(/\s+/g, " ").trim();
  }
  toolUseSearchText(toolUseMetadataJson) {
    return this.renderableSearchText(toolUseMetadataJson ?? "");
  }
  toolResultSearchText(reference) {
    return this.renderableSearchText(reference ?? "");
  }
};
function toLine(m) {
  return {
    role: m.role,
    content: m.content,
    tokenEstimate: m.tokenEstimate,
    isCompacted: m.isCompacted === 1
  };
}

// src/storage/repositories/DecisionRepository.ts
import { randomUUID as randomUUID10 } from "node:crypto";
var DecisionRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByWorkspace(workspaceId) {
    return this.db.prepare("SELECT * FROM decisions WHERE workspaceId = ? ORDER BY createdAt DESC").all(workspaceId);
  }
  findById(id) {
    return this.db.prepare("SELECT * FROM decisions WHERE id = ?").get(id);
  }
  create(workspaceId, title, rationale, status = "open", relatedConversationId, relatedTaskId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const decision = {
      id: randomUUID10(),
      workspaceId,
      title,
      rationale,
      status,
      relatedConversationId: relatedConversationId ?? null,
      relatedTaskId: relatedTaskId ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(
      "INSERT INTO decisions (id, workspaceId, title, rationale, status, relatedConversationId, relatedTaskId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      decision.id,
      decision.workspaceId,
      decision.title,
      decision.rationale,
      decision.status,
      decision.relatedConversationId,
      decision.relatedTaskId,
      decision.createdAt,
      decision.updatedAt
    );
    return decision;
  }
  updateStatus(id, status) {
    this.db.prepare("UPDATE decisions SET status = ?, updatedAt = ? WHERE id = ?").run(status, (/* @__PURE__ */ new Date()).toISOString(), id);
  }
};

// src/services/ResumeContextService.ts
var ResumeContextService = class {
  memoryService;
  taskService;
  auditService;
  precedentService;
  transcriptService;
  convRepo;
  decisionRepo;
  workspaceService;
  constructor(db) {
    this.memoryService = new ProjectMemoryService(db);
    this.taskService = new TaskExtractionService(db);
    this.auditService = new ChangeAuditService(db);
    this.precedentService = new ImplementationPrecedentService(db);
    this.transcriptService = new TranscriptService(db);
    this.convRepo = new ConversationRepository(db);
    this.decisionRepo = new DecisionRepository(db);
    this.workspaceService = new WorkspaceResolverService(db);
  }
  build(workspaceId, currentIntent, options = {}) {
    const workspace2 = this.workspaceService.findById(workspaceId);
    const memoryFacts = this.memoryService.summarize(workspaceId, 10);
    const projectSummary = [
      workspace2?.name ? `Workspace: ${workspace2.name}` : "Workspace registered",
      workspace2?.rootPath ? `Path: ${workspace2.rootPath}` : "Path unknown",
      workspace2?.repoRootPath ? `Repo root: ${workspace2.repoRootPath}` : "Repo root not captured"
    ];
    const allTasks = this.taskService.findByEpic(workspaceId);
    const pendingTasks = allTasks.filter((t) => t.status !== "done").slice(0, 10).map((t) => `[${t.epic}] ${t.title} (${t.status})`);
    const recentDecisions = this.decisionRepo.findByWorkspace(workspaceId).slice(0, 8).map((decision) => `[${decision.status}] ${decision.title}`);
    const recentChanges = this.auditService.summarize(workspaceId, 5);
    let precedentHints = [];
    if (currentIntent) {
      const lookup = this.precedentService.resolve(currentIntent);
      precedentHints = lookup.similar.map(
        (precedent) => `Similar change found in ${precedent.sourceProject}: ${precedent.intent}`
      );
    }
    const recentConvs = this.convRepo.findByWorkspace(workspaceId, 3);
    const conversationDelta = [];
    for (const conv of recentConvs) {
      const lines = this.transcriptService.getTranscript(conv.id).slice(-5);
      for (const line of lines) {
        conversationDelta.push(`[${line.role}] ${line.content.slice(0, 200)}`);
      }
    }
    const relatedWorkspaces = this.workspaceService.related(workspaceId, 5).map((related) => `${related.name} (${related.rootPath})`);
    return {
      workspaceId,
      projectSummary,
      memoryFacts,
      pendingTasks,
      recentDecisions,
      recentChanges,
      skillsHints: options.skillsHints ?? [],
      repositoryConstraints: options.repositoryConstraints ?? [],
      suggestedNextSteps: pendingTasks.slice(0, 3).map((task) => `Continue: ${task}`),
      precedentHints,
      conversationDelta,
      relatedWorkspaces
    };
  }
};

// src/compaction/compactionEngine.ts
import { createHash as createHash4 } from "node:crypto";
var CompactionEngine = class {
  previewChars;
  constructor(previewChars = 280) {
    this.previewChars = previewChars;
  }
  microcompact(messages, maxItems) {
    if (maxItems <= 0) {
      return [];
    }
    if (messages.length <= maxItems) {
      return messages;
    }
    const head = messages.slice(0, Math.max(maxItems - 1, 0)).join(" ");
    const summary = this.summarize(head);
    const last = messages[messages.length - 1];
    return [summary, last].filter(Boolean);
  }
  offloadToolOutput(rawOutput) {
    const contentHash = createHash4("sha256").update(rawOutput).digest("hex");
    return {
      contentHash,
      preview: rawOutput.slice(0, this.previewChars),
      bytes: Buffer.byteLength(rawOutput, "utf8")
    };
  }
  summarize(content) {
    const normalized = content.replace(/\s+/g, " ").trim();
    if (normalized.length <= this.previewChars) {
      return normalized;
    }
    return `${normalized.slice(0, this.previewChars - 3)}...`;
  }
};

// src/core/contextPacketBuilder.ts
var ContextPacketBuilder = class {
  budget;
  compactionEngine;
  constructor(budget, compactionEngine = new CompactionEngine()) {
    this.budget = budget;
    this.compactionEngine = compactionEngine;
  }
  build(input) {
    const blocks = {
      pendingTasks: this.fit(input.pendingTasks, this.budget.pendingTasks),
      memoryFacts: this.fit(input.memoryFacts, this.budget.memoryFacts),
      precedentHints: this.fit(input.precedentHints, this.budget.precedentHints),
      conversationDelta: this.fit(
        input.conversationDelta,
        this.budget.conversationDelta
      ),
      projectSummary: this.fit(input.projectSummary ?? [], this.budget.projectSummary ?? 0),
      recentDecisions: this.fit(input.recentDecisions ?? [], this.budget.recentDecisions ?? 0),
      recentChanges: this.fit(input.recentChanges ?? [], this.budget.recentChanges ?? 0),
      skillsHints: this.fit(input.skillsHints ?? [], this.budget.skillsHints ?? 0),
      repositoryConstraints: this.fit(input.repositoryConstraints ?? [], this.budget.repositoryConstraints ?? 0),
      suggestedNextSteps: this.fit(input.suggestedNextSteps ?? [], this.budget.suggestedNextSteps ?? 0)
    };
    const itemBudgetUsed = blocks.pendingTasks.length + blocks.memoryFacts.length + blocks.precedentHints.length + blocks.conversationDelta.length + (blocks.projectSummary?.length ?? 0) + (blocks.recentDecisions?.length ?? 0) + (blocks.recentChanges?.length ?? 0) + (blocks.skillsHints?.length ?? 0) + (blocks.repositoryConstraints?.length ?? 0) + (blocks.suggestedNextSteps?.length ?? 0);
    return {
      blocks,
      itemBudgetTotal: this.budget.pendingTasks + this.budget.memoryFacts + this.budget.precedentHints + this.budget.conversationDelta + (this.budget.projectSummary ?? 0) + (this.budget.recentDecisions ?? 0) + (this.budget.recentChanges ?? 0) + (this.budget.skillsHints ?? 0) + (this.budget.repositoryConstraints ?? 0) + (this.budget.suggestedNextSteps ?? 0),
      itemBudgetUsed
    };
  }
  fit(items, limit) {
    if (items.length <= limit) {
      return items;
    }
    return this.compactionEngine.microcompact(items, limit);
  }
};

// src/storage/repositories/ContextPacketRepository.ts
import { randomUUID as randomUUID11 } from "node:crypto";
var ContextPacketRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findLatestByWorkspace(workspaceId) {
    return this.db.prepare(
      "SELECT * FROM context_packets WHERE workspaceId = ? ORDER BY createdAt DESC LIMIT 1"
    ).get(workspaceId);
  }
  findBlocksForPacket(packetId) {
    return this.db.prepare("SELECT * FROM context_packet_blocks WHERE packetId = ?").all(packetId);
  }
  save(input) {
    const packet = {
      id: randomUUID11(),
      workspaceId: input.workspaceId,
      budgetTotal: input.budgetTotal,
      budgetUsed: input.budgetUsed,
      deltaOnly: input.deltaOnly ? 1 : 0,
      mode: input.mode ?? "automatic",
      projectSummary: input.projectSummary ?? null,
      recentDecisionsJson: input.recentDecisionsJson ?? "[]",
      recentChangesJson: input.recentChangesJson ?? "[]",
      skillsHintsJson: input.skillsHintsJson ?? "[]",
      repositoryConstraintsJson: input.repositoryConstraintsJson ?? "[]",
      suggestedNextStepsJson: input.suggestedNextStepsJson ?? "[]",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const tx = this.db.transaction(() => {
      this.db.prepare(
        "INSERT INTO context_packets (id, workspaceId, budgetTotal, budgetUsed, deltaOnly, mode, projectSummary, recentDecisionsJson, recentChangesJson, skillsHintsJson, repositoryConstraintsJson, suggestedNextStepsJson, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        packet.id,
        packet.workspaceId,
        packet.budgetTotal,
        packet.budgetUsed,
        packet.deltaOnly,
        packet.mode,
        packet.projectSummary,
        packet.recentDecisionsJson,
        packet.recentChangesJson,
        packet.skillsHintsJson,
        packet.repositoryConstraintsJson,
        packet.suggestedNextStepsJson,
        packet.createdAt
      );
      if (input.blocks) {
        const blockStmt = this.db.prepare(
          "INSERT INTO context_packet_blocks (id, packetId, blockType, content, tokenEstimate) VALUES (?, ?, ?, ?, ?)"
        );
        for (const b of input.blocks) {
          blockStmt.run(randomUUID11(), packet.id, b.blockType, b.content, b.tokenEstimate ?? 0);
        }
      }
    });
    tx();
    return packet;
  }
};

// src/services/ContextPacketBuilderService.ts
var ContextPacketBuilderService = class {
  builder;
  repo;
  constructor(db, budgets = {
    pendingTasks: 5,
    memoryFacts: 10,
    precedentHints: 3,
    conversationDelta: 20,
    projectSummary: 3,
    recentDecisions: 5,
    recentChanges: 5,
    skillsHints: 5,
    repositoryConstraints: 5,
    suggestedNextSteps: 5
  }) {
    this.builder = new ContextPacketBuilder(budgets);
    this.repo = new ContextPacketRepository(db);
  }
  build(input) {
    const packet = this.builder.build({
      pendingTasks: input.pendingTasks,
      memoryFacts: input.memoryFacts,
      precedentHints: input.precedentHints,
      conversationDelta: input.conversationDelta,
      projectSummary: input.projectSummary,
      recentDecisions: input.recentDecisions,
      recentChanges: input.recentChanges,
      skillsHints: input.skillsHints,
      repositoryConstraints: input.repositoryConstraints,
      suggestedNextSteps: input.suggestedNextSteps
    });
    const blocks = Object.entries(packet.blocks).flatMap(
      ([blockType, items]) => (items ?? []).map((content) => ({ blockType, content, tokenEstimate: Math.ceil(content.length / 4) }))
    );
    return this.repo.save({
      workspaceId: input.workspaceId,
      budgetTotal: packet.itemBudgetTotal,
      budgetUsed: packet.itemBudgetUsed,
      deltaOnly: input.deltaOnly ?? true,
      mode: input.mode ?? "automatic",
      projectSummary: (input.projectSummary ?? []).join("\n"),
      recentDecisionsJson: JSON.stringify(input.recentDecisions ?? []),
      recentChangesJson: JSON.stringify(input.recentChanges ?? []),
      skillsHintsJson: JSON.stringify(input.skillsHints ?? []),
      repositoryConstraintsJson: JSON.stringify(input.repositoryConstraints ?? []),
      suggestedNextStepsJson: JSON.stringify(input.suggestedNextSteps ?? []),
      blocks
    });
  }
  latestForWorkspace(workspaceId) {
    return this.repo.findLatestByWorkspace(workspaceId);
  }
};

// src/storage/repositories/SkillRepository.ts
import { randomUUID as randomUUID12 } from "node:crypto";
var SkillRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findAll() {
    return this.db.prepare("SELECT * FROM skills ORDER BY createdAt DESC").all();
  }
  findApplicable(scope, workspaceId) {
    if (workspaceId) {
      return this.db.prepare(
        `SELECT DISTINCT s.* FROM skills s
           LEFT JOIN skill_bindings sb ON sb.skillId = s.id
           WHERE s.scope IN (${scope.map(() => "?").join(", ")})
             AND (s.workspaceId = '' OR s.workspaceId = ?)
             AND (sb.workspaceId IS NULL OR sb.workspaceId = ?)
           ORDER BY s.createdAt DESC`
      ).all(...scope, workspaceId, workspaceId);
    }
    return this.db.prepare(`SELECT * FROM skills WHERE scope IN (${scope.map(() => "?").join(", ")}) ORDER BY createdAt DESC`).all(...scope);
  }
  upsert(input) {
    const existing = this.db.prepare("SELECT * FROM skills WHERE skillKey = ?").get(input.skillKey);
    if (existing) {
      this.db.prepare(
        "UPDATE skills SET workspaceId = ?, name = ?, description = ?, scope = ?, stack = ?, framework = ?, skillBody = ?, tagsJson = ?, sourceKind = ?, updatedAt = ? WHERE id = ?"
      ).run(
        input.workspaceId,
        input.name,
        input.description ?? null,
        input.scope ?? "workspace",
        input.stack ?? null,
        input.framework ?? null,
        input.skillBody,
        input.tagsJson ?? "[]",
        input.sourceKind ?? "manual",
        (/* @__PURE__ */ new Date()).toISOString(),
        existing.id
      );
      return this.db.prepare("SELECT * FROM skills WHERE id = ?").get(existing.id) ?? existing;
    }
    const created = {
      id: randomUUID12(),
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description ?? null,
      skillKey: input.skillKey,
      scope: input.scope ?? "workspace",
      stack: input.stack ?? null,
      framework: input.framework ?? null,
      skillBody: input.skillBody,
      tagsJson: input.tagsJson ?? "[]",
      sourceKind: input.sourceKind ?? "manual",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.prepare(
      "INSERT INTO skills (id, workspaceId, name, description, skillKey, scope, stack, framework, skillBody, tagsJson, sourceKind, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      created.id,
      created.workspaceId,
      created.name,
      created.description,
      created.skillKey,
      created.scope,
      created.stack,
      created.framework,
      created.skillBody,
      created.tagsJson,
      created.sourceKind,
      created.createdAt,
      created.createdAt
    );
    return created;
  }
  bind(skillId, agentId, workspaceId, bindingContext) {
    const existing = this.db.prepare("SELECT * FROM skill_bindings WHERE skillId = ? AND agentId = ?").get(skillId, agentId);
    if (existing) {
      this.db.prepare("UPDATE skill_bindings SET workspaceId = ?, bindingContext = ? WHERE id = ?").run(workspaceId ?? null, bindingContext ?? null, existing.id);
      return this.db.prepare("SELECT * FROM skill_bindings WHERE id = ?").get(existing.id) ?? existing;
    }
    const binding = {
      id: randomUUID12(),
      skillId,
      agentId,
      enabledAt: (/* @__PURE__ */ new Date()).toISOString(),
      workspaceId: workspaceId ?? null,
      bindingContext: bindingContext ?? null
    };
    this.db.prepare(
      "INSERT INTO skill_bindings (id, skillId, agentId, enabledAt, workspaceId, bindingContext) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      binding.id,
      binding.skillId,
      binding.agentId,
      binding.enabledAt,
      binding.workspaceId,
      binding.bindingContext
    );
    return binding;
  }
};

// src/services/SkillsEngineService.ts
var SkillsEngineService = class {
  repo;
  constructor(db) {
    this.repo = new SkillRepository(db);
  }
  register(input) {
    return this.repo.upsert(input);
  }
  bind(skillId, agentId, workspaceId, bindingContext) {
    return this.repo.bind(skillId, agentId, workspaceId, bindingContext);
  }
  suggest(input) {
    const pool = this.repo.findApplicable(["global", "workspace", "stack", "agent"], input.workspaceId);
    return pool.map((skill) => ({ skill, score: this.score(skill, input) })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).map((entry) => entry.skill);
  }
  score(skill, input) {
    let score = 0.1;
    if (skill.scope === "global") score += 0.1;
    if (skill.scope === "workspace") score += 0.3;
    if (skill.scope === "stack" && skill.stack && input.stack && skill.stack === input.stack) score += 0.35;
    if (skill.framework && input.framework && skill.framework === input.framework) score += 0.25;
    if (input.agent && skill.scope === "agent") {
      const context = `${skill.description ?? ""} ${skill.skillBody ?? ""}`.toLowerCase();
      if (context.includes(input.agent.adapterType.toLowerCase()) || context.includes(input.agent.name.toLowerCase())) {
        score += 0.35;
      }
    }
    const recentContext = (input.recentContext ?? []).join(" ").toLowerCase();
    if (recentContext && skill.tagsJson !== "[]") {
      const tags = JSON.parse(skill.tagsJson);
      if (tags.some((tag) => recentContext.includes(tag.toLowerCase()))) {
        score += 0.15;
      }
    }
    return score;
  }
};

// src/storage/repositories/ResearchReferenceRepository.ts
import { randomUUID as randomUUID13 } from "node:crypto";
var ResearchReferenceRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByWorkspace(workspaceId) {
    if (!workspaceId) {
      return this.db.prepare("SELECT * FROM research_references WHERE workspaceId IS NULL ORDER BY updatedAt DESC").all();
    }
    return this.db.prepare(
      "SELECT * FROM research_references WHERE workspaceId = ? OR workspaceId IS NULL ORDER BY updatedAt DESC"
    ).all(workspaceId);
  }
  upsert(input) {
    const existing = this.db.prepare("SELECT * FROM research_references WHERE url = ? AND COALESCE(workspaceId, '') = COALESCE(?, '')").get(input.url, input.workspaceId ?? null);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (existing) {
      this.db.prepare(
        "UPDATE research_references SET title = ?, kind = ?, notes = ?, example = ?, tagsJson = ?, updatedAt = ? WHERE id = ?"
      ).run(
        input.title,
        input.kind,
        input.notes ?? null,
        input.example ?? null,
        input.tagsJson ?? "[]",
        now,
        existing.id
      );
      return this.db.prepare("SELECT * FROM research_references WHERE id = ?").get(existing.id) ?? existing;
    }
    const reference = {
      id: randomUUID13(),
      workspaceId: input.workspaceId ?? null,
      title: input.title,
      kind: input.kind,
      url: input.url,
      notes: input.notes ?? null,
      example: input.example ?? null,
      tagsJson: input.tagsJson ?? "[]",
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(
      "INSERT INTO research_references (id, workspaceId, title, kind, url, notes, example, tagsJson, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      reference.id,
      reference.workspaceId,
      reference.title,
      reference.kind,
      reference.url,
      reference.notes,
      reference.example,
      reference.tagsJson,
      reference.createdAt,
      reference.updatedAt
    );
    return reference;
  }
};

// src/services/ResearchBibliographyService.ts
var DEFAULT_REFERENCES = [
  {
    title: "VS Code Extension API",
    kind: "documentation",
    url: "https://code.visualstudio.com/api",
    notes: "Base reference for turning the hub runtime into a real extension surface.",
    tagsJson: JSON.stringify(["vscode", "extension"])
  },
  {
    title: "Repository pattern with SQLite in TypeScript",
    kind: "architecture",
    url: "https://martinfowler.com/eaaCatalog/repository.html",
    notes: "Reference for local-first persistence and repository boundaries.",
    tagsJson: JSON.stringify(["sqlite", "repository", "typescript"])
  },
  {
    title: "Adapter pattern",
    kind: "architecture",
    url: "https://refactoring.guru/design-patterns/adapter",
    notes: "Useful when extending capture adapters and capability negotiation.",
    tagsJson: JSON.stringify(["adapter", "integration"])
  }
];
var ResearchBibliographyService = class {
  repo;
  constructor(db) {
    this.repo = new ResearchReferenceRepository(db);
  }
  ensureDefaults(workspaceId) {
    return DEFAULT_REFERENCES.map(
      (reference) => this.repo.upsert({ ...reference, workspaceId: workspaceId ?? null })
    );
  }
  add(input) {
    return this.repo.upsert(input);
  }
  list(workspaceId) {
    return this.repo.findByWorkspace(workspaceId);
  }
  summarize(workspaceId, limit = 5) {
    return this.list(workspaceId).slice(0, limit).map((reference) => `${reference.kind}: ${reference.title} -> ${reference.url}`);
  }
};

// src/storage/repositories/PromptRequirementCoverageRepository.ts
import { randomUUID as randomUUID14 } from "node:crypto";
var PromptRequirementCoverageRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByWorkspace(workspaceId) {
    return this.db.prepare(
      "SELECT * FROM prompt_requirement_coverage WHERE workspaceId = ? ORDER BY epic, requirementKey"
    ).all(workspaceId);
  }
  upsert(input) {
    const existing = this.db.prepare(
      "SELECT * FROM prompt_requirement_coverage WHERE workspaceId = ? AND requirementKey = ?"
    ).get(input.workspaceId, input.requirementKey);
    const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (existing) {
      this.db.prepare(
        "UPDATE prompt_requirement_coverage SET epic = ?, title = ?, status = ?, evidence = ?, reason = ?, updatedAt = ? WHERE id = ?"
      ).run(
        input.epic,
        input.title,
        input.status,
        input.evidence ?? null,
        input.reason ?? null,
        updatedAt,
        existing.id
      );
      return this.db.prepare("SELECT * FROM prompt_requirement_coverage WHERE id = ?").get(existing.id) ?? existing;
    }
    const record = {
      id: randomUUID14(),
      workspaceId: input.workspaceId,
      requirementKey: input.requirementKey,
      epic: input.epic,
      title: input.title,
      status: input.status,
      evidence: input.evidence ?? null,
      reason: input.reason ?? null,
      updatedAt
    };
    this.db.prepare(
      "INSERT INTO prompt_requirement_coverage (id, workspaceId, requirementKey, epic, title, status, evidence, reason, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      record.id,
      record.workspaceId,
      record.requirementKey,
      record.epic,
      record.title,
      record.status,
      record.evidence,
      record.reason,
      record.updatedAt
    );
    return record;
  }
};

// src/services/PromptCoverageService.ts
var PromptCoverageService = class {
  repo;
  constructor(db) {
    this.repo = new PromptRequirementCoverageRepository(db);
  }
  record(workspaceId, item) {
    return this.repo.upsert({ workspaceId, ...item });
  }
  seed(workspaceId, items) {
    return items.map((item) => this.record(workspaceId, item));
  }
  summarize(workspaceId) {
    const items = this.repo.findByWorkspace(workspaceId);
    const grouped = /* @__PURE__ */ new Map();
    for (const item of items) {
      if (!grouped.has(item.epic)) grouped.set(item.epic, []);
      grouped.get(item.epic).push(item);
    }
    const byEpic = {};
    for (const [epic, epicItems] of grouped.entries()) {
      byEpic[epic] = this.percent(epicItems);
    }
    return {
      overallPercent: this.percent(items),
      byEpic,
      items
    };
  }
  percent(items) {
    if (items.length === 0) return 0;
    const total = items.reduce((sum, item) => sum + this.statusWeight(item.status), 0);
    return Number((total / items.length * 100).toFixed(2));
  }
  ensureDefaultCoverage(workspaceId) {
    const existing = this.repo.findByWorkspace(workspaceId);
    if (existing.length > 0) return;
    const defaults = [
      { requirementKey: "workspace-memory", epic: "persistence", title: "Workspace memory isolation", status: "implemented", evidence: "WorkspaceResolverService" },
      { requirementKey: "conversation-capture", epic: "capture", title: "Conversation capture and storage", status: "implemented", evidence: "ConversationCaptureService" },
      { requirementKey: "task-extraction", epic: "tasks", title: "Task extraction from conversations", status: "implemented", evidence: "TaskExtractionService" },
      { requirementKey: "context-packet", epic: "context", title: "Context packet builder with budgets", status: "implemented", evidence: "ContextPacketBuilderService" },
      { requirementKey: "compaction", epic: "compaction", title: "Compaction engine and offloading", status: "implemented", evidence: "CompactionEngineService" },
      { requirementKey: "audit-log", epic: "audit", title: "Auditable change log by agent", status: "implemented", evidence: "ChangeAuditService" },
      { requirementKey: "precedents", epic: "precedents", title: "Implementation precedent registry", status: "implemented", evidence: "ImplementationPrecedentService" },
      { requirementKey: "skills-engine", epic: "skills", title: "Skills engine by workspace and stack", status: "implemented", evidence: "SkillsEngineService" },
      { requirementKey: "metrics", epic: "metrics", title: "Token reduction metrics and instrumentation", status: "implemented", evidence: "MetricsInstrumentationService" },
      { requirementKey: "vscode-extension", epic: "ui", title: "VS Code extension manifest and sidebar", status: "implemented", evidence: "package.json contributes + extension.ts" },
      { requirementKey: "adapter-registry", epic: "adapters", title: "Adapter registry with stubs", status: "partial", evidence: "AdapterRegistry with StubAgentAdapter" },
      { requirementKey: "cross-project-precedents", epic: "precedents", title: "Cross-project precedent lookup", status: "partial", evidence: "ImplementationPrecedentService.findSimilar" },
      { requirementKey: "semantic-search", epic: "search", title: "Semantic search index", status: "missing", evidence: "" },
      { requirementKey: "real-agent-integration", epic: "adapters", title: "Real integration with Copilot/Cursor/ChatGPT", status: "missing", evidence: "No public API available" }
    ];
    this.seed(workspaceId, defaults);
  }
  statusWeight(status) {
    switch (status) {
      case "implemented":
        return 1;
      case "partial":
        return 0.5;
      default:
        return 0;
    }
  }
};

// src/storage/repositories/MetricsRepository.ts
import { randomUUID as randomUUID15 } from "node:crypto";
var MetricsRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  recordSnapshot(workspaceId, tokensBaseline, tokensOptimized) {
    const savingsRatio = tokensBaseline > 0 ? Math.max(0, Math.min(1, 1 - tokensOptimized / tokensBaseline)) : 0;
    const snapshot = {
      id: randomUUID15(),
      workspaceId,
      tokensBaseline,
      tokensOptimized,
      savingsRatio,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.prepare(
      "INSERT INTO metrics_snapshots (id, workspaceId, tokensBaseline, tokensOptimized, savingsRatio, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      snapshot.id,
      snapshot.workspaceId,
      snapshot.tokensBaseline,
      snapshot.tokensOptimized,
      snapshot.savingsRatio,
      snapshot.createdAt
    );
    return snapshot;
  }
  recordTokenMetric(input) {
    const metric = { id: randomUUID15(), ...input };
    this.db.prepare(
      "INSERT INTO token_metrics (id, workspaceId, conversationId, rawContextChars, rawContextTokens, compressedContextChars, compactedTokens, reductionPercent, cacheReusePercent, reusedContextBlocks, summarizedContextBlocks, offloadedPayloadCount, toolResultCompactions, memoryExtractions, similarImplementationHits, precedentReusePercent, duplicateReinventionAvoidedCount, crossProjectConsistencyMatches, compactionStrategy, measuredAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      metric.id,
      metric.workspaceId,
      metric.conversationId,
      metric.rawContextChars,
      metric.rawContextTokens,
      metric.compressedContextChars,
      metric.compactedTokens,
      metric.reductionPercent,
      metric.cacheReusePercent,
      metric.reusedContextBlocks,
      metric.summarizedContextBlocks,
      metric.offloadedPayloadCount,
      metric.toolResultCompactions,
      metric.memoryExtractions,
      metric.similarImplementationHits,
      metric.precedentReusePercent,
      metric.duplicateReinventionAvoidedCount,
      metric.crossProjectConsistencyMatches,
      metric.compactionStrategy,
      metric.measuredAt
    );
    return metric;
  }
  latestSnapshot(workspaceId) {
    return this.db.prepare(
      "SELECT * FROM metrics_snapshots WHERE workspaceId = ? ORDER BY createdAt DESC LIMIT 1"
    ).get(workspaceId);
  }
  averageSavings(workspaceId, days = 30) {
    const since = new Date(Date.now() - days * 864e5).toISOString();
    const row = this.db.prepare(
      "SELECT AVG(savingsRatio) as avg FROM metrics_snapshots WHERE workspaceId = ? AND createdAt >= ?"
    ).get(workspaceId, since);
    return row?.avg ?? 0;
  }
};

// src/services/MetricsInstrumentationService.ts
var MetricsInstrumentationService = class {
  repo;
  constructor(db) {
    this.repo = new MetricsRepository(db);
  }
  record(workspaceId, measurement) {
    const reductionPercent = measurement.rawContextTokens > 0 ? Math.max(
      0,
      Math.min(
        100,
        (1 - measurement.compactedTokens / measurement.rawContextTokens) * 100
      )
    ) : 0;
    return this.repo.recordTokenMetric({
      workspaceId,
      conversationId: measurement.conversationId ?? null,
      rawContextChars: measurement.rawContextChars ?? measurement.rawContextTokens * 4,
      rawContextTokens: measurement.rawContextTokens,
      compressedContextChars: measurement.compressedContextChars ?? measurement.compactedTokens * 4,
      compactedTokens: measurement.compactedTokens,
      reductionPercent,
      cacheReusePercent: measurement.cacheReusePercent ?? 0,
      reusedContextBlocks: measurement.reusedContextBlocks ?? 0,
      summarizedContextBlocks: measurement.summarizedContextBlocks ?? 0,
      offloadedPayloadCount: measurement.offloadedPayloadCount ?? 0,
      toolResultCompactions: measurement.toolResultCompactions ?? 0,
      memoryExtractions: measurement.memoryExtractions ?? 0,
      similarImplementationHits: measurement.similarImplementationHits ?? 0,
      precedentReusePercent: measurement.precedentReusePercent ?? 0,
      duplicateReinventionAvoidedCount: measurement.duplicateReinventionAvoidedCount ?? 0,
      crossProjectConsistencyMatches: measurement.crossProjectConsistencyMatches ?? 0,
      compactionStrategy: measurement.strategy ?? "microcompact",
      measuredAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  snapshot(workspaceId, tokensBaseline, tokensOptimized) {
    return this.repo.recordSnapshot(workspaceId, tokensBaseline, tokensOptimized);
  }
  latestSnapshot(workspaceId) {
    return this.repo.latestSnapshot(workspaceId);
  }
  averageSavings30d(workspaceId) {
    return this.repo.averageSavings(workspaceId, 30);
  }
};

// src/core/promptTracker.ts
var PromptTracker = class {
  progress(epics) {
    let totalWeight = 0;
    let completedWeight = 0;
    for (const epic of epics) {
      for (const task of epic.tasks) {
        totalWeight += task.technicalWeight;
        if (task.steps.length === 0) {
          continue;
        }
        const doneCount = task.steps.filter((step) => step.done).length;
        completedWeight += doneCount / task.steps.length * task.technicalWeight;
      }
    }
    if (totalWeight === 0) {
      return 0;
    }
    return Number((completedWeight / totalWeight * 100).toFixed(2));
  }
};

// src/ui/dashboardModel.ts
var DashboardModel = class {
  tracker;
  constructor(tracker = new PromptTracker()) {
    this.tracker = tracker;
  }
  build(epics, tokensBaseline, tokensOptimized) {
    const overallProgress = this.tracker.progress(epics);
    const rawSavings = tokensBaseline > 0 ? 1 - tokensOptimized / tokensBaseline : 0;
    const clampedSavings = Math.min(1, Math.max(0, rawSavings));
    const tokenSavingsRatio = Number(clampedSavings.toFixed(4));
    return {
      overallProgress,
      tokenSavingsRatio
    };
  }
  buildWithContext(input) {
    const rawSavings = input.tokensBaseline > 0 ? 1 - input.tokensOptimized / input.tokensBaseline : 0;
    const clampedSavings = Math.min(1, Math.max(0, rawSavings));
    return {
      overallProgress: Number(input.overallProgress.toFixed(2)),
      tokenSavingsRatio: Number(clampedSavings.toFixed(4)),
      pendingTaskCount: input.pendingTaskCount,
      recentChangesCount: input.recentChangesCount,
      skillsCount: input.skillsCount,
      coverageByEpic: input.coverageByEpic,
      recentWorkspaces: input.recentWorkspaces
    };
  }
};

// src/services/AgentContinuityHubService.ts
var AgentContinuityHubService = class {
  workspaceService;
  conversationService;
  agentRepo;
  memoryService;
  sessionMemoryService;
  taskService;
  changeAuditService;
  resumeContextService;
  packetBuilderService;
  precedentService;
  skillsService;
  researchService;
  coverageService;
  metricsService;
  dashboardModel;
  constructor(db) {
    this.workspaceService = new WorkspaceResolverService(db);
    this.conversationService = new ConversationCaptureService(db);
    this.agentRepo = new AgentRepository(db);
    this.memoryService = new ProjectMemoryService(db);
    this.sessionMemoryService = new SessionMemoryService(db);
    this.taskService = new TaskExtractionService(db);
    this.changeAuditService = new ChangeAuditService(db);
    this.resumeContextService = new ResumeContextService(db);
    this.packetBuilderService = new ContextPacketBuilderService(db);
    this.precedentService = new ImplementationPrecedentService(db);
    this.skillsService = new SkillsEngineService(db);
    this.researchService = new ResearchBibliographyService(db);
    this.coverageService = new PromptCoverageService(db);
    this.metricsService = new MetricsInstrumentationService(db);
    this.dashboardModel = new DashboardModel();
  }
  bootstrapWorkspace(input) {
    const workspace2 = this.workspaceService.resolveWorkspace(input);
    this.researchService.ensureDefaults(workspace2.id);
    return workspace2;
  }
  registerAgent(workspaceId, name, adapterType, config = {}) {
    return this.agentRepo.create(workspaceId, name, adapterType, config);
  }
  registerSkill(input) {
    return this.skillsService.register(input);
  }
  bindSkill(skillId, agentId, workspaceId, bindingContext) {
    return this.skillsService.bind(skillId, agentId, workspaceId, bindingContext);
  }
  addResearchReference(input) {
    return this.researchService.add(input);
  }
  ingestConversation(input) {
    if (input.adapter) {
      return input.adapter.capture().then(
        (captured) => this.ingestCapturedConversation(input.workspaceId, captured, input.agentId, input.epic)
      );
    }
    if (!input.captured) {
      throw new Error("Either adapter or captured conversation must be provided.");
    }
    return this.ingestCapturedConversation(input.workspaceId, input.captured, input.agentId, input.epic);
  }
  remember(workspaceId, category, fact, confidence = 1) {
    this.memoryService.learn(workspaceId, category, fact, confidence);
  }
  recordCoverage(workspaceId, items) {
    return this.coverageService.seed(workspaceId, items);
  }
  buildContinuitySnapshot(workspaceId, options = {}) {
    const workspace2 = this.workspaceService.findById(workspaceId);
    if (!workspace2) {
      throw new Error(`Workspace ${workspaceId} was not found.`);
    }
    const agent = options.agentId ? this.agentRepo.findById(options.agentId) : void 0;
    const researchReferences = this.researchService.list(workspaceId);
    const skills = this.skillsService.suggest({
      workspaceId,
      agent,
      stack: options.stack,
      framework: options.framework,
      recentContext: researchReferences.map((reference) => reference.title)
    });
    const resume = this.resumeContextService.build(workspaceId, options.intent, {
      skillsHints: skills.map((skill) => skill.name),
      repositoryConstraints: [
        "Prefer persistent compacted context over replaying full history.",
        "Keep continuity isolated by workspace/worktree unless precedent reuse is explicitly allowed."
      ]
    });
    const packet = this.packetBuilderService.build({
      workspaceId,
      pendingTasks: resume.pendingTasks,
      memoryFacts: resume.memoryFacts,
      precedentHints: resume.precedentHints,
      conversationDelta: resume.conversationDelta,
      projectSummary: resume.projectSummary,
      recentDecisions: resume.recentDecisions,
      recentChanges: resume.recentChanges,
      skillsHints: resume.skillsHints,
      repositoryConstraints: resume.repositoryConstraints,
      suggestedNextSteps: resume.suggestedNextSteps,
      deltaOnly: true,
      mode: "automatic"
    });
    const rawContextTokens = resume.pendingTasks.length * 25 + resume.memoryFacts.length * 25 + resume.precedentHints.length * 25 + resume.conversationDelta.length * 30 + resume.recentChanges.length * 25;
    const compactedTokens = Math.ceil(packet.budgetUsed * 18);
    this.metricsService.record(workspaceId, {
      rawContextTokens,
      compactedTokens,
      rawContextChars: rawContextTokens * 4,
      compressedContextChars: compactedTokens * 4,
      strategy: "continuity-packet",
      conversationId: null,
      summarizedContextBlocks: 3,
      reusedContextBlocks: Math.max(0, resume.relatedWorkspaces.length),
      offloadedPayloadCount: 0,
      toolResultCompactions: 0,
      memoryExtractions: resume.memoryFacts.length,
      similarImplementationHits: resume.precedentHints.length,
      precedentReusePercent: resume.precedentHints.length > 0 ? 100 : 0,
      crossProjectConsistencyMatches: resume.relatedWorkspaces.length
    });
    const coverage = this.coverageService.summarize(workspaceId);
    const dashboard = this.dashboardModel.buildWithContext({
      overallProgress: coverage.overallPercent,
      tokensBaseline: rawContextTokens,
      tokensOptimized: compactedTokens,
      pendingTaskCount: resume.pendingTasks.length,
      recentChangesCount: resume.recentChanges.length,
      skillsCount: skills.length,
      coverageByEpic: coverage.byEpic,
      recentWorkspaces: resume.relatedWorkspaces
    });
    return {
      workspace: workspace2,
      packet,
      pendingTasks: this.taskService.findByEpic(workspaceId).filter((task) => task.status !== "done"),
      skills,
      researchReferences,
      coverage,
      dashboard
    };
  }
  ingestCapturedConversation(workspaceId, captured, agentId, epic = "conversation-ingest") {
    const conversation = this.conversationService.captureConversation({
      workspaceId,
      sourceAgent: captured.sourceAgent,
      sourceAdapter: captured.sourceAgent,
      title: captured.title,
      summary: captured.summary,
      recentContext: captured.recentContext,
      relatedFiles: captured.relatedFiles,
      linkedAgents: captured.linkedAgents,
      agentId,
      messages: captured.messages
    });
    for (const message of captured.messages) {
      if (this.sessionMemoryService.shouldExtractMemory(conversation.id, 0)) {
        this.sessionMemoryService.record(
          conversation.id,
          workspaceId,
          "recentContext",
          message.summary ?? message.content.slice(0, 240),
          0.8
        );
      }
      const tasks = this.taskService.extractFromText(workspaceId, epic, message.content);
      for (const task of tasks) {
        this.changeAuditService.record({
          workspaceId,
          agentId: agentId ?? "unknown",
          adapterId: captured.sourceAgent,
          changeType: "task-extracted",
          title: `Extracted task: ${task.title}`,
          relatedConversationId: conversation.id,
          relatedTaskId: task.id,
          affectedEntityType: "task",
          affectedEntityId: task.id
        });
      }
    }
    this.memoryService.learn(
      workspaceId,
      "recentContext",
      captured.summary ?? `Conversation ${conversation.id} captured from ${captured.sourceAgent}`,
      0.8
    );
    return conversation;
  }
};

// src/ui/sidebar/ProjectMemoryProvider.ts
import * as vscode from "vscode";
var MemoryItem = class extends vscode.TreeItem {
  constructor(label, category, collapsibleState = vscode.TreeItemCollapsibleState.None) {
    super(label, collapsibleState);
    this.category = category;
    this.contextValue = "memoryItem";
    this.iconPath = new vscode.ThemeIcon("circle-filled");
  }
};
var MemoryCategoryItem = class extends vscode.TreeItem {
  constructor(category, count) {
    super(`${category} (${count})`, vscode.TreeItemCollapsibleState.Collapsed);
    this.category = category;
    this.contextValue = "memoryCategory";
    this.iconPath = new vscode.ThemeIcon("symbol-namespace");
  }
};
var ProjectMemoryProvider = class {
  constructor(db, workspaceId) {
    this.db = db;
    this.workspaceId = workspaceId;
    this.memoryRepo = new ProjectMemoryRepository(db);
    this.decisionRepo = new DecisionRepository(db);
  }
  _onDidChangeTreeData = new vscode.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  memoryRepo;
  decisionRepo;
  refresh(workspaceId) {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!this.workspaceId) return [];
    if (!element) {
      const facts = this.memoryRepo.findByWorkspace(this.workspaceId);
      const decisions = this.decisionRepo.findByWorkspace(this.workspaceId);
      const byCategory = /* @__PURE__ */ new Map();
      for (const f of facts) {
        byCategory.set(f.category, (byCategory.get(f.category) ?? 0) + 1);
      }
      if (decisions.length > 0) {
        byCategory.set("decisions", decisions.length);
      }
      return Array.from(byCategory.entries()).map(
        ([cat, count]) => new MemoryCategoryItem(cat, count)
      );
    }
    if (element instanceof MemoryCategoryItem) {
      if (element.category === "decisions") {
        return this.decisionRepo.findByWorkspace(this.workspaceId).map((d) => {
          const item = new MemoryItem(d.title, "decisions");
          item.tooltip = d.rationale;
          item.description = d.status;
          return item;
        });
      }
      return this.memoryRepo.findByCategory(this.workspaceId, element.category).map((m) => {
        const item = new MemoryItem(m.fact, m.category);
        item.tooltip = `Confidence: ${m.confidence}`;
        item.description = m.category;
        return item;
      });
    }
    return [];
  }
};

// src/ui/sidebar/PendingTasksProvider.ts
import * as vscode2 from "vscode";
var STATUS_ICONS = {
  pending: "circle-large-outline",
  in_progress: "loading~spin",
  done: "check",
  blocked: "error"
};
var TaskItem = class extends vscode2.TreeItem {
  constructor(task) {
    super(task.title, vscode2.TreeItemCollapsibleState.None);
    this.task = task;
    this.contextValue = "taskItem";
    const icon = STATUS_ICONS[task.status] ?? "circle-large-outline";
    this.iconPath = new vscode2.ThemeIcon(icon);
    this.description = `${task.epic} \xB7 ${task.status}`;
    this.tooltip = task.description ?? task.title;
  }
};
var EpicItem = class extends vscode2.TreeItem {
  constructor(epic, tasks) {
    const done = tasks.filter((t) => t.status === "done").length;
    super(
      `${epic} (${done}/${tasks.length})`,
      vscode2.TreeItemCollapsibleState.Collapsed
    );
    this.epic = epic;
    this.tasks = tasks;
    this.contextValue = "epicItem";
    this.iconPath = new vscode2.ThemeIcon("folder");
  }
};
var PendingTasksProvider = class {
  constructor(db, workspaceId) {
    this.db = db;
    this.workspaceId = workspaceId;
    this.taskRepo = new TaskRepository(db);
  }
  _onDidChangeTreeData = new vscode2.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  taskRepo;
  refresh(workspaceId) {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!this.workspaceId) return [];
    if (!element) {
      const allTasks = this.taskRepo.findByWorkspace(this.workspaceId);
      const byEpic = /* @__PURE__ */ new Map();
      for (const t of allTasks) {
        const list = byEpic.get(t.epic) ?? [];
        list.push(t);
        byEpic.set(t.epic, list);
      }
      return Array.from(byEpic.entries()).map(([epic, tasks]) => new EpicItem(epic, tasks));
    }
    if (element instanceof EpicItem) {
      return element.tasks.map((t) => new TaskItem(t));
    }
    return [];
  }
};

// src/ui/sidebar/ChangeLogProvider.ts
import * as vscode3 from "vscode";
var CHANGE_ICONS = {
  add: "add",
  modify: "edit",
  delete: "trash",
  refactor: "symbol-misc",
  fix: "bug",
  docs: "book"
};
var ChangeLogItem = class extends vscode3.TreeItem {
  constructor(entry) {
    super(entry.title, vscode3.TreeItemCollapsibleState.None);
    this.entry = entry;
    this.contextValue = "changeLogItem";
    const icon = CHANGE_ICONS[entry.changeType] ?? "history";
    this.iconPath = new vscode3.ThemeIcon(icon);
    this.description = `${entry.agentId ?? "unknown"} \xB7 ${entry.createdAt.slice(0, 10)}`;
    this.tooltip = entry.reason;
  }
};
var ChangeLogProvider = class {
  constructor(db, workspaceId, limit = 50) {
    this.db = db;
    this.workspaceId = workspaceId;
    this.limit = limit;
    this.repo = new ChangeLogRepository(db);
  }
  _onDidChangeTreeData = new vscode3.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  repo;
  refresh(workspaceId) {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    return element;
  }
  getChildren() {
    if (!this.workspaceId) return [];
    return this.repo.findByWorkspace(this.workspaceId, this.limit).map((e) => new ChangeLogItem(e));
  }
};

// src/ui/sidebar/PromptProgressProvider.ts
import * as vscode4 from "vscode";

// src/storage/repositories/PromptExecutionRepository.ts
import { randomUUID as randomUUID16 } from "node:crypto";
var PromptExecutionRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  findByWorkspace(workspaceId, epic) {
    if (epic) {
      return this.db.prepare(
        "SELECT * FROM prompt_executions WHERE workspaceId = ? AND epic = ? ORDER BY createdAt"
      ).all(workspaceId, epic);
    }
    return this.db.prepare(
      "SELECT * FROM prompt_executions WHERE workspaceId = ? ORDER BY epic, createdAt"
    ).all(workspaceId);
  }
  create(workspaceId, epic, title, technicalWeight = 1) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const exec = {
      id: randomUUID16(),
      workspaceId,
      epic,
      title,
      technicalWeight,
      status: "pending",
      completionPercent: 0,
      startedAt: null,
      completedAt: null,
      createdAt: now
    };
    this.db.prepare(
      "INSERT INTO prompt_executions (id, workspaceId, epic, title, technicalWeight, status, completionPercent, startedAt, completedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      exec.id,
      exec.workspaceId,
      exec.epic,
      exec.title,
      exec.technicalWeight,
      exec.status,
      exec.completionPercent,
      exec.startedAt,
      exec.completedAt,
      exec.createdAt
    );
    return exec;
  }
  start(id) {
    this.db.prepare("UPDATE prompt_executions SET status = 'in_progress', startedAt = ? WHERE id = ?").run((/* @__PURE__ */ new Date()).toISOString(), id);
  }
  complete(id) {
    this.db.prepare("UPDATE prompt_executions SET status = 'done', completedAt = ? WHERE id = ?").run((/* @__PURE__ */ new Date()).toISOString(), id);
  }
  addStep(executionId, title) {
    const step = {
      id: randomUUID16(),
      executionId,
      title,
      done: 0,
      notes: null,
      completedAt: null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.prepare(
      "INSERT INTO prompt_execution_steps (id, executionId, title, done, notes, completedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(step.id, step.executionId, step.title, step.done, step.notes, step.completedAt, step.createdAt);
    return step;
  }
  completeStep(stepId) {
    this.db.prepare(
      "UPDATE prompt_execution_steps SET done = 1, completedAt = ? WHERE id = ?"
    ).run((/* @__PURE__ */ new Date()).toISOString(), stepId);
  }
  findSteps(executionId) {
    return this.db.prepare(
      "SELECT * FROM prompt_execution_steps WHERE executionId = ? ORDER BY createdAt"
    ).all(executionId);
  }
};

// src/ui/sidebar/PromptProgressProvider.ts
var EpicProgressItem = class extends vscode4.TreeItem {
  constructor(epicId, epicKey, completionPercent, taskCount) {
    const pct = Math.round(completionPercent);
    super(
      `${epicKey} \u2014 ${pct}%`,
      taskCount > 0 ? vscode4.TreeItemCollapsibleState.Collapsed : vscode4.TreeItemCollapsibleState.None
    );
    this.epicId = epicId;
    this.epicKey = epicKey;
    this.contextValue = "epicProgress";
    this.iconPath = new vscode4.ThemeIcon(pct >= 100 ? "check-all" : pct > 0 ? "loading" : "circle-large-outline");
    this.description = `${taskCount} task${taskCount !== 1 ? "s" : ""}`;
  }
};
var TaskProgressItem = class extends vscode4.TreeItem {
  constructor(taskKey, completionPercent, status) {
    super(
      `${taskKey} \u2014 ${Math.round(completionPercent)}%`,
      vscode4.TreeItemCollapsibleState.None
    );
    this.contextValue = "taskProgress";
    const icon = status === "done" ? "check" : completionPercent > 0 ? "loading" : "circle-large-outline";
    this.iconPath = new vscode4.ThemeIcon(icon);
    this.description = status;
  }
};
var OverallProgressItem = class extends vscode4.TreeItem {
  constructor(overallPercent) {
    super(`Overall: ${Math.round(overallPercent)}%`, vscode4.TreeItemCollapsibleState.None);
    this.contextValue = "overallProgress";
    this.iconPath = new vscode4.ThemeIcon("graph");
    this.description = `${Math.round(overallPercent)}% complete`;
  }
};
var PromptProgressProvider = class {
  constructor(db, workspaceId) {
    this.db = db;
    this.workspaceId = workspaceId;
    this.repo = new PromptExecutionRepository(db);
  }
  _onDidChangeTreeData = new vscode4.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  repo;
  refresh(workspaceId) {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!this.workspaceId) return [];
    if (!element) {
      const tasks = this.repo.findByWorkspace(this.workspaceId);
      if (tasks.length === 0) return [];
      const overall = tasks.reduce((sum, t) => sum + t.completionPercent, 0) / tasks.length;
      const byEpic = /* @__PURE__ */ new Map();
      for (const t of tasks) {
        const list = byEpic.get(t.epic) ?? [];
        list.push(t);
        byEpic.set(t.epic, list);
      }
      const epicItems = Array.from(byEpic.entries()).map(
        ([epicKey, epicTasks]) => {
          const epicPct = epicTasks.reduce((s, t) => s + t.completionPercent, 0) / epicTasks.length;
          return new EpicProgressItem(epicKey, epicKey, epicPct, epicTasks.length);
        }
      );
      return [new OverallProgressItem(overall), ...epicItems];
    }
    if (element instanceof EpicProgressItem) {
      return this.repo.findByWorkspace(this.workspaceId).filter((t) => t.epic === element.epicKey).map((t) => new TaskProgressItem(t.title, t.completionPercent, t.status));
    }
    return [];
  }
};

// src/ui/sidebar/AgentsProvider.ts
import * as vscode5 from "vscode";

// src/storage/repositories/ModelRecommendationRepository.ts
import { randomUUID as randomUUID17 } from "node:crypto";
var ModelRecommendationRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  upsert(input) {
    const existing = this.db.prepare(`
      SELECT * FROM model_recommendations
      WHERE workspaceId = ?
        AND COALESCE(agentType, '') = COALESCE(?, '')
        AND COALESCE(capability, '') = COALESCE(?, '')
        AND COALESCE(jobType, '') = COALESCE(?, '')
        AND provider = ?
        AND model = ?
    `).get(
      input.workspaceId,
      input.agentType ?? null,
      input.capability ?? null,
      input.jobType ?? null,
      input.provider,
      input.model
    );
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const observedAt = input.observedAt ?? now;
    if (existing) {
      this.db.prepare(`
        UPDATE model_recommendations
        SET rationale = ?, confidence = ?, sourceAgentType = ?, sourceJobId = ?,
            sourcesJson = ?, observedAt = ?, expiresAt = ?, updatedAt = ?
        WHERE id = ?
      `).run(
        input.rationale,
        input.confidence,
        input.sourceAgentType,
        input.sourceJobId ?? null,
        input.sourcesJson ?? "[]",
        observedAt,
        input.expiresAt ?? null,
        now,
        existing.id
      );
      return this.db.prepare("SELECT * FROM model_recommendations WHERE id = ?").get(existing.id);
    }
    const recommendation = {
      id: randomUUID17(),
      workspaceId: input.workspaceId,
      agentType: input.agentType ?? null,
      capability: input.capability ?? null,
      jobType: input.jobType ?? null,
      provider: input.provider,
      model: input.model,
      rationale: input.rationale,
      confidence: input.confidence,
      sourceAgentType: input.sourceAgentType,
      sourceJobId: input.sourceJobId ?? null,
      sourcesJson: input.sourcesJson ?? "[]",
      observedAt,
      expiresAt: input.expiresAt ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(`
      INSERT INTO model_recommendations (
        id, workspaceId, agentType, capability, jobType, provider, model, rationale,
        confidence, sourceAgentType, sourceJobId, sourcesJson, observedAt, expiresAt,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      recommendation.id,
      recommendation.workspaceId,
      recommendation.agentType,
      recommendation.capability,
      recommendation.jobType,
      recommendation.provider,
      recommendation.model,
      recommendation.rationale,
      recommendation.confidence,
      recommendation.sourceAgentType,
      recommendation.sourceJobId,
      recommendation.sourcesJson,
      recommendation.observedAt,
      recommendation.expiresAt,
      recommendation.createdAt,
      recommendation.updatedAt
    );
    return recommendation;
  }
  findByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM model_recommendations
      WHERE workspaceId = ?
      ORDER BY observedAt DESC, confidence DESC
    `).all(workspaceId);
  }
};

// src/services/ModelRoutingService.ts
var DEFAULT_RECOMMENDATIONS = [
  {
    agentType: "code-reviewer",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Strong fit for code review, refactors, and implementation-heavy reasoning.",
    confidence: 0.92,
    sourceAgentType: "system-default"
  },
  {
    agentType: "architect-advisor",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Reliable for long-form technical reasoning and architecture trade-offs.",
    confidence: 0.9,
    sourceAgentType: "system-default"
  },
  {
    capability: "coding",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Default coding route for implementation, refactoring, tests, and DevOps YAML.",
    confidence: 0.9,
    sourceAgentType: "system-default"
  },
  {
    capability: "graphic_design",
    provider: "Google",
    model: "Gemini 2.5 Pro",
    rationale: "Preferred multimodal route for design-heavy and visual tasks.",
    confidence: 0.88,
    sourceAgentType: "system-default"
  },
  {
    capability: "financial_reporting",
    provider: "OpenAI",
    model: "GPT-4.1",
    rationale: "Good administrative and reporting default with structured text output.",
    confidence: 0.87,
    sourceAgentType: "system-default"
  },
  {
    capability: "administrative_reporting",
    provider: "OpenAI",
    model: "GPT-4.1",
    rationale: "Default route for summaries, reporting, and policy-heavy administrative work.",
    confidence: 0.86,
    sourceAgentType: "system-default"
  },
  {
    capability: "deep_research",
    provider: "Google",
    model: "Gemini 2.5 Pro",
    rationale: "Good default for large-context research synthesis and multimodal source review.",
    confidence: 0.84,
    sourceAgentType: "system-default"
  },
  {
    capability: "workflow_automation",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Strong default for multi-step workflow logic, YAML, and orchestration reasoning.",
    confidence: 0.89,
    sourceAgentType: "system-default"
  },
  {
    capability: "api_integration",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Reliable default for integration contracts, API mapping, and implementation detail work.",
    confidence: 0.9,
    sourceAgentType: "system-default"
  },
  {
    capability: "linguistic_review",
    provider: "OpenAI",
    model: "GPT-4.1",
    rationale: "Strong editorial and text-quality route for multilingual and language-heavy tasks.",
    confidence: 0.87,
    sourceAgentType: "system-default"
  },
  {
    capability: "security_governance",
    provider: "Anthropic",
    model: "Claude Sonnet",
    rationale: "Preferred default for security reasoning with policy, code, and architecture context.",
    confidence: 0.88,
    sourceAgentType: "system-default"
  }
];
var ModelRoutingService = class {
  repo;
  constructor(db) {
    this.repo = new ModelRecommendationRepository(db);
  }
  ensureDefaults(workspaceId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
    return DEFAULT_RECOMMENDATIONS.map(
      (recommendation) => this.repo.upsert({
        workspaceId,
        ...recommendation,
        observedAt: now,
        expiresAt
      })
    );
  }
  applyResearchResult(workspaceId, sourceAgentType, sourceJobId, result) {
    const assignments = this.extractAssignments(result);
    const expiresAt = new Date(Date.now() + 36 * 60 * 60 * 1e3).toISOString();
    return assignments.map(
      (assignment) => this.repo.upsert({
        workspaceId,
        agentType: assignment.agentType ?? null,
        capability: assignment.capability ?? null,
        jobType: assignment.jobType ?? null,
        provider: assignment.provider,
        model: assignment.model,
        rationale: assignment.rationale,
        confidence: assignment.confidence ?? 0.75,
        sourceAgentType,
        sourceJobId,
        sourcesJson: JSON.stringify(assignment.sources ?? []),
        expiresAt
      })
    );
  }
  recommendForAgent(workspaceId, lookup) {
    const now = Date.now();
    const active = this.repo.findByWorkspace(workspaceId).filter((recommendation) => {
      if (!recommendation.expiresAt) return true;
      return new Date(recommendation.expiresAt).getTime() >= now;
    });
    const candidates = active.map((recommendation) => ({
      recommendation,
      score: this.scoreRecommendation(recommendation, lookup)
    })).filter((item) => item.score > 0).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const timeDiff = new Date(b.recommendation.observedAt).getTime() - new Date(a.recommendation.observedAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      return b.recommendation.confidence - a.recommendation.confidence;
    });
    const winner = candidates[0]?.recommendation;
    if (!winner) return void 0;
    return {
      provider: winner.provider,
      model: winner.model,
      rationale: winner.rationale,
      confidence: winner.confidence
    };
  }
  list(workspaceId) {
    return this.repo.findByWorkspace(workspaceId);
  }
  scoreRecommendation(recommendation, lookup) {
    let score = 0;
    if (lookup.agentType && recommendation.agentType === lookup.agentType) score += 100;
    if (lookup.jobType && recommendation.jobType === lookup.jobType) score += 55;
    if (lookup.capabilities?.length && recommendation.capability) {
      if (lookup.capabilities.includes(recommendation.capability)) score += 70;
    }
    if (!recommendation.agentType && !recommendation.jobType && !recommendation.capability) score += 1;
    return score;
  }
  extractAssignments(result) {
    const rawAssignments = Array.isArray(result.assignments) ? result.assignments : Array.isArray(result.recommendations) ? result.recommendations : [];
    return rawAssignments.filter(
      (assignment) => typeof assignment === "object" && assignment !== null && typeof assignment.provider === "string" && typeof assignment.model === "string" && typeof assignment.rationale === "string"
    );
  }
};

// src/ui/sidebar/AgentsProvider.ts
var AgentItem = class extends vscode5.TreeItem {
  constructor(agent, selectedModel) {
    super(agent.name, vscode5.TreeItemCollapsibleState.None);
    this.agent = agent;
    this.contextValue = "agentItem";
    this.iconPath = new vscode5.ThemeIcon("robot");
    this.description = selectedModel ? `${agent.adapterType} \xB7 ${selectedModel}` : agent.adapterType;
    this.tooltip = selectedModel ? `Adapter: ${agent.adapterType}
Model: ${selectedModel}` : `Adapter: ${agent.adapterType}`;
  }
};
var AgentsProvider = class {
  constructor(db, workspaceId) {
    this.db = db;
    this.workspaceId = workspaceId;
    this.repo = new AgentRepository(db);
    this.routing = new ModelRoutingService(db);
  }
  _onDidChangeTreeData = new vscode5.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  repo;
  routing;
  refresh(workspaceId) {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    return element;
  }
  getChildren() {
    if (!this.workspaceId) return [];
    return this.repo.findByWorkspace(this.workspaceId).map((a) => {
      const routed = this.routing.recommendForAgent(this.workspaceId, { agentType: a.name });
      const selectedModel = routed ? `${routed.provider} ${routed.model}` : void 0;
      return new AgentItem(a, selectedModel);
    });
  }
};

// src/ui/sidebar/ConversationsProvider.ts
import * as vscode6 from "vscode";
var ConversationItem = class extends vscode6.TreeItem {
  constructor(conversation) {
    super(
      conversation.title ?? conversation.sourceAgent,
      vscode6.TreeItemCollapsibleState.None
    );
    this.conversation = conversation;
    this.contextValue = "conversationItem";
    this.iconPath = new vscode6.ThemeIcon(
      conversation.status === "active" ? "comment-discussion" : "comment"
    );
    this.description = conversation.sourceAgent;
    this.tooltip = conversation.summary ?? conversation.title ?? "";
  }
};
var ConversationsProvider = class {
  constructor(db, workspaceId) {
    this.db = db;
    this.workspaceId = workspaceId;
    this.repo = new ConversationRepository(db);
  }
  _onDidChangeTreeData = new vscode6.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  repo;
  refresh(workspaceId) {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    return element;
  }
  getChildren() {
    if (!this.workspaceId) return [];
    return this.repo.findByWorkspace(this.workspaceId).map((c) => new ConversationItem(c));
  }
};

// src/ui/sidebar/SkillsProvider.ts
import * as vscode7 from "vscode";
var SkillItem = class extends vscode7.TreeItem {
  constructor(skill) {
    super(skill.name, vscode7.TreeItemCollapsibleState.None);
    this.skill = skill;
    this.contextValue = "skillItem";
    this.iconPath = new vscode7.ThemeIcon("lightbulb");
    this.description = skill.scope;
    this.tooltip = skill.description ?? skill.skillBody?.slice(0, 120) ?? "";
  }
};
var SkillsProvider = class {
  constructor(db, workspaceId) {
    this.db = db;
    this.workspaceId = workspaceId;
    this.repo = new SkillRepository(db);
  }
  _onDidChangeTreeData = new vscode7.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  repo;
  refresh(workspaceId) {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    return element;
  }
  getChildren() {
    if (!this.workspaceId) return [];
    return this.repo.findAll().filter((s) => s.workspaceId === this.workspaceId || s.scope === "global").map((s) => new SkillItem(s));
  }
};

// src/ui/sidebar/JobQueueProvider.ts
import * as vscode8 from "vscode";

// src/storage/repositories/JobRepository.ts
import { randomUUID as randomUUID18 } from "node:crypto";
var JobRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  enqueue(input) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const job = {
      id: randomUUID18(),
      workspaceId: input.workspaceId,
      agentType: input.agentType,
      jobType: input.jobType,
      priority: input.priority ?? 5,
      status: "pending",
      payloadJson: JSON.stringify(input.payload),
      resultJson: null,
      error: null,
      retryCount: 0,
      maxRetries: input.maxRetries ?? 3,
      scheduledAt: input.scheduledAt ?? null,
      claimedAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(`
      INSERT INTO jobs (id, workspaceId, agentType, jobType, priority, status,
        payloadJson, resultJson, error, retryCount, maxRetries,
        scheduledAt, claimedAt, completedAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      job.id,
      job.workspaceId,
      job.agentType,
      job.jobType,
      job.priority,
      job.status,
      job.payloadJson,
      null,
      null,
      0,
      job.maxRetries,
      job.scheduledAt,
      null,
      null,
      now,
      now
    );
    return job;
  }
  // Atomic claim — single UPDATE with subquery prevents double-claiming.
  claimNext(agentType) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE jobs SET status = 'claimed', claimedAt = ?, updatedAt = ?
      WHERE id = (
        SELECT id FROM jobs
        WHERE agentType = ? AND status = 'pending'
          AND (scheduledAt IS NULL OR scheduledAt <= ?)
        ORDER BY priority DESC, createdAt ASC
        LIMIT 1
      )
    `).run(now, now, agentType, now);
    return this.db.prepare(`
      SELECT * FROM jobs
      WHERE agentType = ? AND status = 'claimed'
      ORDER BY claimedAt DESC LIMIT 1
    `).get(agentType);
  }
  setProcessing(jobId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(
      "UPDATE jobs SET status = 'processing', updatedAt = ? WHERE id = ?"
    ).run(now, jobId);
  }
  complete(jobId, result) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE jobs SET status = 'completed', resultJson = ?, completedAt = ?, updatedAt = ?
      WHERE id = ?
    `).run(JSON.stringify(result), now, now, jobId);
    return this.findById(jobId);
  }
  fail(jobId, error) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const job = this.findById(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    if (job.retryCount < job.maxRetries) {
      const backoffMs = Math.pow(2, job.retryCount) * 1e3;
      const scheduledAt = new Date(Date.now() + backoffMs).toISOString();
      this.db.prepare(`
        UPDATE jobs SET status = 'pending', error = ?, retryCount = retryCount + 1,
          scheduledAt = ?, claimedAt = NULL, updatedAt = ?
        WHERE id = ?
      `).run(error, scheduledAt, now, jobId);
    } else {
      this.db.prepare(`
        UPDATE jobs SET status = 'dead', error = ?, completedAt = ?, updatedAt = ?
        WHERE id = ?
      `).run(error, now, now, jobId);
    }
    return this.findById(jobId);
  }
  findById(id) {
    return this.db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
  }
  findByWorkspace(workspaceId, status) {
    if (status) {
      return this.db.prepare(
        "SELECT * FROM jobs WHERE workspaceId = ? AND status = ? ORDER BY priority DESC, createdAt ASC"
      ).all(workspaceId, status);
    }
    return this.db.prepare(
      "SELECT * FROM jobs WHERE workspaceId = ? ORDER BY priority DESC, createdAt ASC"
    ).all(workspaceId);
  }
  countByAgentTypeAndStatus(agentType) {
    return this.db.prepare(`
      SELECT status, COUNT(*) as count FROM jobs
      WHERE agentType = ? GROUP BY status
    `).all(agentType);
  }
  pendingCountByAgentType() {
    return this.db.prepare(`
      SELECT agentType, COUNT(*) as count FROM jobs
      WHERE status IN ('pending', 'claimed', 'processing')
      GROUP BY agentType ORDER BY count DESC
    `).all();
  }
  hasActiveJob(workspaceId, agentType, jobType) {
    const row = this.db.prepare(`
      SELECT COUNT(*) as count FROM jobs
      WHERE workspaceId = ? AND agentType = ? AND jobType = ?
        AND status IN ('pending', 'claimed', 'processing')
    `).get(workspaceId, agentType, jobType);
    return row.count > 0;
  }
  appendEvent(jobId, event, workerId, data) {
    const e = {
      id: randomUUID18(),
      jobId,
      event,
      workerId: workerId ?? null,
      dataJson: JSON.stringify(data ?? {}),
      ts: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.prepare(
      "INSERT INTO job_events (id, jobId, event, workerId, dataJson, ts) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(e.id, e.jobId, e.event, e.workerId, e.dataJson, e.ts);
    return e;
  }
  eventsForJob(jobId) {
    return this.db.prepare(
      "SELECT * FROM job_events WHERE jobId = ? ORDER BY ts ASC"
    ).all(jobId);
  }
};
var WorkerRegistryRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  register(agentType) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const entry = {
      id: randomUUID18(),
      agentType,
      status: "idle",
      currentJobId: null,
      jobsProcessed: 0,
      lastHeartbeat: now,
      startedAt: now
    };
    this.db.prepare(`
      INSERT INTO worker_registry (id, agentType, status, currentJobId, jobsProcessed, lastHeartbeat, startedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(entry.id, entry.agentType, entry.status, null, 0, now, now);
    return entry;
  }
  heartbeat(id, status, currentJobId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE worker_registry SET status = ?, currentJobId = ?, lastHeartbeat = ?
      WHERE id = ?
    `).run(status, currentJobId, now, id);
  }
  incrementProcessed(id) {
    this.db.prepare(
      "UPDATE worker_registry SET jobsProcessed = jobsProcessed + 1 WHERE id = ?"
    ).run(id);
  }
  stop(id) {
    this.db.prepare(
      "UPDATE worker_registry SET status = 'stopped', currentJobId = NULL WHERE id = ?"
    ).run(id);
  }
  all() {
    return this.db.prepare("SELECT * FROM worker_registry").all();
  }
  byAgentType(agentType) {
    return this.db.prepare(
      "SELECT * FROM worker_registry WHERE agentType = ? ORDER BY startedAt"
    ).all(agentType);
  }
};
var JobScheduleRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  upsert(input) {
    const existing = this.db.prepare(`
      SELECT * FROM job_schedules
      WHERE workspaceId = ? AND agentType = ? AND jobType = ?
    `).get(input.workspaceId, input.agentType, input.jobType);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (existing) {
      this.db.prepare(`
        UPDATE job_schedules
        SET cadenceHours = ?, payloadJson = ?, enabled = ?, updatedAt = ?
        WHERE id = ?
      `).run(
        input.cadenceHours,
        JSON.stringify(input.payload),
        input.enabled ?? existing.enabled,
        now,
        existing.id
      );
      return this.db.prepare("SELECT * FROM job_schedules WHERE id = ?").get(existing.id);
    }
    const schedule = {
      id: randomUUID18(),
      workspaceId: input.workspaceId,
      agentType: input.agentType,
      jobType: input.jobType,
      cadenceHours: input.cadenceHours,
      payloadJson: JSON.stringify(input.payload),
      enabled: input.enabled ?? 1,
      lastEnqueuedAt: null,
      nextRunAt: input.nextRunAt ?? now,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(`
      INSERT INTO job_schedules (
        id, workspaceId, agentType, jobType, cadenceHours, payloadJson,
        enabled, lastEnqueuedAt, nextRunAt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      schedule.id,
      schedule.workspaceId,
      schedule.agentType,
      schedule.jobType,
      schedule.cadenceHours,
      schedule.payloadJson,
      schedule.enabled,
      schedule.lastEnqueuedAt,
      schedule.nextRunAt,
      schedule.createdAt,
      schedule.updatedAt
    );
    return schedule;
  }
  findByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM job_schedules
      WHERE workspaceId = ?
      ORDER BY agentType, jobType
    `).all(workspaceId);
  }
  due(now) {
    return this.db.prepare(`
      SELECT * FROM job_schedules
      WHERE enabled = 1 AND nextRunAt <= ?
      ORDER BY nextRunAt ASC
    `).all(now);
  }
  markEnqueued(scheduleId, lastEnqueuedAt, nextRunAt) {
    this.db.prepare(`
      UPDATE job_schedules
      SET lastEnqueuedAt = ?, nextRunAt = ?, updatedAt = ?
      WHERE id = ?
    `).run(lastEnqueuedAt, nextRunAt, lastEnqueuedAt, scheduleId);
  }
};

// src/services/JobQueueService.ts
var JobQueueService = class {
  repo;
  db;
  constructor(db) {
    this.db = db;
    this.repo = new JobRepository(db);
  }
  enqueue(input) {
    const job = this.repo.enqueue(input);
    this.repo.appendEvent(job.id, "enqueued", void 0, { agentType: input.agentType });
    return job;
  }
  // Called by WorkerPoolService dispatch loop — atomically claims the next
  // pending job for a given agent type (returns undefined if queue is empty).
  claimNext(agentType, workerId) {
    const job = this.repo.claimNext(agentType);
    if (job) {
      this.repo.appendEvent(job.id, "claimed", workerId);
      this.repo.setProcessing(job.id);
      this.repo.appendEvent(job.id, "started", workerId);
      return this.repo.findById(job.id);
    }
    return job;
  }
  complete(jobId, result, workerId) {
    const job = this.repo.complete(jobId, result);
    this.repo.appendEvent(jobId, "completed", workerId, { resultKeys: Object.keys(result) });
    return job;
  }
  // Records failure; auto-retries with exponential backoff or dead-letters.
  fail(jobId, error, workerId) {
    const job = this.repo.fail(jobId, error);
    if (job.status === "dead") {
      this.repo.appendEvent(jobId, "dead_lettered", workerId, { error, retryCount: job.retryCount });
    } else {
      this.repo.appendEvent(jobId, "retried", workerId, {
        error,
        retryCount: job.retryCount,
        scheduledAt: job.scheduledAt
      });
    }
    return job;
  }
  findById(jobId) {
    return this.repo.findById(jobId);
  }
  pendingFor(workspaceId) {
    return this.repo.findByWorkspace(workspaceId, "pending");
  }
  allFor(workspaceId) {
    return this.repo.findByWorkspace(workspaceId);
  }
  statsForAgent(agentType) {
    const rows = this.repo.countByAgentTypeAndStatus(agentType);
    const map = Object.fromEntries(rows.map((r) => [r.status, r.count]));
    return {
      agentType,
      pending: map["pending"] ?? 0,
      processing: (map["claimed"] ?? 0) + (map["processing"] ?? 0),
      completed: map["completed"] ?? 0,
      failed: map["failed"] ?? 0,
      dead: map["dead"] ?? 0
    };
  }
  // Returns pending counts across all agent types — used by sidebar.
  allQueueDepths() {
    return this.repo.pendingCountByAgentType();
  }
  eventsForJob(jobId) {
    return this.repo.eventsForJob(jobId);
  }
};

// src/ui/sidebar/JobQueueProvider.ts
var AgentQueueItem = class extends vscode8.TreeItem {
  constructor(agentType, pending) {
    super(
      agentType,
      pending > 0 ? vscode8.TreeItemCollapsibleState.Collapsed : vscode8.TreeItemCollapsibleState.None
    );
    this.agentType = agentType;
    this.pending = pending;
    this.contextValue = "agentQueueItem";
    this.iconPath = new vscode8.ThemeIcon(
      pending > 0 ? "loading~spin" : "circle-large-outline"
    );
    this.description = pending > 0 ? `${pending} pending` : "idle";
    this.tooltip = `${agentType}: ${pending} job(s) in queue`;
  }
};
var JobItem = class extends vscode8.TreeItem {
  constructor(job) {
    super(job.jobType, vscode8.TreeItemCollapsibleState.None);
    this.job = job;
    this.contextValue = "jobItem";
    this.iconPath = new vscode8.ThemeIcon(statusIcon(job.status));
    this.description = `[${job.status}] p=${job.priority}`;
    this.tooltip = `Job ${job.id.slice(0, 8)} \u2014 ${job.jobType} \u2014 ${job.status}
Retries: ${job.retryCount}/${job.maxRetries}`;
  }
};
function statusIcon(status) {
  switch (status) {
    case "pending":
      return "clock";
    case "claimed":
    case "processing":
      return "loading~spin";
    case "completed":
      return "check";
    case "failed":
      return "warning";
    case "dead":
      return "error";
    default:
      return "circle-outline";
  }
}
var JobQueueProvider = class {
  constructor(db, workspaceId) {
    this.db = db;
    this.workspaceId = workspaceId;
    this.svc = new JobQueueService(db);
  }
  _onDidChangeTreeData = new vscode8.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  svc;
  refresh(workspaceId) {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!this.workspaceId) return [];
    if (!element) {
      const depths = this.svc.allQueueDepths();
      if (depths.length === 0) {
        return [new AgentQueueItem("(no jobs in queue)", 0)];
      }
      return depths.map((d) => new AgentQueueItem(d.agentType, d.count));
    }
    if (element instanceof AgentQueueItem && element.pending > 0) {
      return this.svc.allFor(this.workspaceId).filter(
        (j) => j.agentType === element.agentType && ["pending", "claimed", "processing", "failed"].includes(j.status)
      ).slice(0, 20).map((j) => new JobItem(j));
    }
    return [];
  }
};

// src/services/WorkerPoolService.ts
import { Worker } from "node:worker_threads";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { join as join2, dirname as dirname2 } from "node:path";
import { randomUUID as randomUUID26 } from "node:crypto";

// src/storage/repositories/WorkerAuditRepository.ts
import { randomUUID as randomUUID19 } from "node:crypto";
var WorkerAuditRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  recordFailure(input) {
    const existing = this.findOpenByAgent(input.workspaceId, input.auditedAgentType);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (existing) {
      this.db.prepare(`
        UPDATE worker_audit_cases
        SET failureCount = failureCount + 1,
            lastFailureAt = ?,
            lastError = ?,
            lastJobId = ?,
            lastWorkerId = ?,
            updatedAt = ?
        WHERE id = ?
      `).run(
        now,
        input.lastError,
        input.lastJobId ?? null,
        input.lastWorkerId ?? null,
        now,
        existing.id
      );
      return this.findById(existing.id);
    }
    const auditCase = {
      id: randomUUID19(),
      workspaceId: input.workspaceId,
      auditedAgentType: input.auditedAgentType,
      status: "open",
      failureCount: 1,
      firstFailureAt: now,
      lastFailureAt: now,
      lastError: input.lastError,
      lastJobId: input.lastJobId ?? null,
      lastWorkerId: input.lastWorkerId ?? null,
      auditorJobId: null,
      policeJobId: null,
      researchJobId: null,
      judgeJobId: null,
      recruiterJobId: null,
      rebuildJobId: null,
      decision: null,
      resolutionNotes: null,
      createdAt: now,
      updatedAt: now,
      closedAt: null
    };
    this.db.prepare(`
      INSERT INTO worker_audit_cases (
        id, workspaceId, auditedAgentType, status, failureCount, firstFailureAt,
        lastFailureAt, lastError, lastJobId, lastWorkerId, auditorJobId, policeJobId,
        researchJobId, judgeJobId, recruiterJobId, rebuildJobId, decision,
        resolutionNotes, createdAt, updatedAt, closedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      auditCase.id,
      auditCase.workspaceId,
      auditCase.auditedAgentType,
      auditCase.status,
      auditCase.failureCount,
      auditCase.firstFailureAt,
      auditCase.lastFailureAt,
      auditCase.lastError,
      auditCase.lastJobId,
      auditCase.lastWorkerId,
      auditCase.auditorJobId,
      auditCase.policeJobId,
      auditCase.researchJobId,
      auditCase.judgeJobId,
      auditCase.recruiterJobId,
      auditCase.rebuildJobId,
      auditCase.decision,
      auditCase.resolutionNotes,
      auditCase.createdAt,
      auditCase.updatedAt,
      auditCase.closedAt
    );
    return auditCase;
  }
  findById(id) {
    return this.db.prepare(
      "SELECT * FROM worker_audit_cases WHERE id = ?"
    ).get(id);
  }
  findOpenByAgent(workspaceId, auditedAgentType) {
    return this.db.prepare(`
      SELECT * FROM worker_audit_cases
      WHERE workspaceId = ? AND auditedAgentType = ? AND closedAt IS NULL
      ORDER BY updatedAt DESC
      LIMIT 1
    `).get(workspaceId, auditedAgentType);
  }
  topFailingAgents(workspaceId, limit = 5) {
    return this.db.prepare(`
      SELECT * FROM worker_audit_cases
      WHERE workspaceId = ?
      ORDER BY failureCount DESC, updatedAt DESC
      LIMIT ?
    `).all(workspaceId, limit);
  }
  listByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM worker_audit_cases
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId);
  }
  attachJob(caseId, field, jobId, status) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE worker_audit_cases
      SET ${field} = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `).run(jobId, status, now, caseId);
  }
  setStatus(caseId, status, notes) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE worker_audit_cases
      SET status = ?, resolutionNotes = COALESCE(?, resolutionNotes), updatedAt = ?
      WHERE id = ?
    `).run(status, notes ?? null, now, caseId);
  }
  resolve(caseId, decision, resolutionNotes) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE worker_audit_cases
      SET status = 'resolved',
          decision = ?,
          resolutionNotes = ?,
          updatedAt = ?,
          closedAt = ?
      WHERE id = ?
    `).run(decision, resolutionNotes, now, now, caseId);
  }
};

// src/services/AgentRosterService.ts
var SOFTWARE_DEV_DEVOPS_ROSTER = [
  // ── Development ─────────────────────────────────────────────────────────────
  {
    name: "code-reviewer",
    adapterType: "roster",
    config: {
      role: "Pull request reviewer \u2014 style, correctness, security, maintainability",
      capabilities: ["pr_review", "style_check", "correctness", "security_hints"],
      queueName: "q.code-reviewer",
      systemPromptTemplate: "You are a senior software engineer doing a PR review. Focus on: correctness, security, maintainability, and test coverage. Input: {{files}}. Context: {{context}}. Output JSON with findings[] and suggestions[].",
      maxConcurrent: 2,
      retryLimit: 3,
      inputSchema: { files: "string[]", diff: "string", context: "string" },
      outputSchema: { findings: "Finding[]", suggestions: "string[]", approved: "boolean" }
    }
  },
  {
    name: "architect-advisor",
    adapterType: "roster",
    config: {
      role: "System design and Architecture Decision Records (ADR) advisor",
      capabilities: ["system_design", "adr", "trade_off_analysis", "diagram_hints"],
      queueName: "q.architect-advisor",
      systemPromptTemplate: "You are a principal software architect. Analyze the described design problem and produce an ADR with: context, decision, rationale, alternatives considered, and consequences. Problem: {{description}}. Stack: {{stack}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { description: "string", stack: "string", constraints: "string[]" },
      outputSchema: { adr: "string", alternatives: "string[]", risks: "string[]" }
    }
  },
  {
    name: "test-generator",
    adapterType: "roster",
    config: {
      role: "Unit, integration, and E2E test scaffold generator",
      capabilities: ["unit_tests", "integration_tests", "e2e_tests", "coverage_hints"],
      queueName: "q.test-generator",
      systemPromptTemplate: "You are a QA engineer. Generate comprehensive tests for the provided code. Framework: {{framework}}. Coverage target: {{coverageTarget}}%. Input code: {{code}}.",
      maxConcurrent: 2,
      retryLimit: 3,
      inputSchema: { code: "string", framework: "string", coverageTarget: "number" },
      outputSchema: { tests: "string", testCount: "number", coverageHints: "string[]" }
    }
  },
  {
    name: "doc-writer",
    adapterType: "roster",
    config: {
      role: "README, API documentation, and changelog writer",
      capabilities: ["readme", "api_docs", "changelog", "jsdoc"],
      queueName: "q.doc-writer",
      systemPromptTemplate: "You are a technical writer. Generate clear, accurate documentation. Target: {{docType}} for {{target}}. Context: {{context}}. Output in Markdown.",
      maxConcurrent: 2,
      retryLimit: 3,
      inputSchema: { docType: "string", target: "string", context: "string" },
      outputSchema: { markdown: "string", sections: "string[]" }
    }
  },
  {
    name: "bug-analyzer",
    adapterType: "roster",
    config: {
      role: "Root cause analysis for bugs, crashes, and regressions",
      capabilities: ["root_cause_analysis", "stack_trace_parsing", "reproduction_steps"],
      queueName: "q.bug-analyzer",
      systemPromptTemplate: "You are a debugging expert. Analyze the bug report and provide root cause, reproduction steps, and a fix recommendation. Bug: {{description}}. Stack trace: {{stackTrace}}. Code context: {{context}}.",
      maxConcurrent: 2,
      retryLimit: 3,
      inputSchema: { description: "string", stackTrace: "string", context: "string" },
      outputSchema: { rootCause: "string", reproSteps: "string[]", fixRecommendation: "string" }
    }
  },
  {
    name: "refactor-advisor",
    adapterType: "roster",
    config: {
      role: "Code refactoring, extraction, and tech debt reduction advisor",
      capabilities: ["refactoring", "tech_debt", "code_smell_detection", "extraction"],
      queueName: "q.refactor-advisor",
      systemPromptTemplate: "You are a refactoring expert. Identify code smells, duplication, and poor abstractions. Suggest specific refactors with before/after examples. Code: {{code}}.",
      maxConcurrent: 2,
      retryLimit: 3,
      inputSchema: { code: "string", files: "string[]" },
      outputSchema: { smells: "CodeSmell[]", refactors: "Refactor[]", priorityOrder: "string[]" }
    }
  },
  {
    name: "security-scanner",
    adapterType: "roster",
    config: {
      role: "SAST, dependency vulnerability, and secrets detection",
      capabilities: ["sast", "dependency_audit", "secrets_detection", "owasp_check"],
      queueName: "q.security-scanner",
      systemPromptTemplate: "You are a security engineer. Scan for OWASP Top 10 vulnerabilities, hardcoded secrets, and insecure dependencies. Code: {{code}}. Dependencies: {{dependencies}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { code: "string", dependencies: "string[]", files: "string[]" },
      outputSchema: { vulnerabilities: "Vulnerability[]", severity: "string", remediations: "string[]" }
    }
  },
  {
    name: "performance-analyzer",
    adapterType: "roster",
    config: {
      role: "Performance bottleneck detection and optimization recommendations",
      capabilities: ["profiling_hints", "query_optimization", "memory_leak_detection", "caching_advice"],
      queueName: "q.performance-analyzer",
      systemPromptTemplate: "You are a performance engineer. Identify bottlenecks, N+1 queries, memory leaks, and unnecessary computation. Profile data: {{profileData}}. Code: {{code}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { code: "string", profileData: "string", metrics: "object" },
      outputSchema: { bottlenecks: "Bottleneck[]", recommendations: "string[]", estimatedGain: "string" }
    }
  },
  {
    name: "api-designer",
    adapterType: "roster",
    config: {
      role: "OpenAPI spec generator and contract-first API design advisor",
      capabilities: ["openapi_spec", "rest_design", "graphql_schema", "versioning"],
      queueName: "q.api-designer",
      systemPromptTemplate: "You are an API architect. Design a clean, versioned API following REST principles. Generate an OpenAPI 3.1 spec. Domain: {{domain}}. Operations: {{operations}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { domain: "string", operations: "string[]", constraints: "string[]" },
      outputSchema: { openApiSpec: "string", endpoints: "Endpoint[]", designNotes: "string[]" }
    }
  },
  {
    name: "db-advisor",
    adapterType: "roster",
    config: {
      role: "Database schema, index, and query optimization advisor",
      capabilities: ["schema_design", "index_optimization", "query_analysis", "migration_safety"],
      queueName: "q.db-advisor",
      systemPromptTemplate: "You are a database engineer. Analyze schema, queries, and indexes. Recommend optimizations and flag dangerous migrations. Schema: {{schema}}. Queries: {{queries}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { schema: "string", queries: "string[]", dbType: "string" },
      outputSchema: { suggestions: "DBSuggestion[]", indexRecommendations: "string[]", migrationRisks: "string[]" }
    }
  },
  // ── DevOps ───────────────────────────────────────────────────────────────────
  {
    name: "cicd-orchestrator",
    adapterType: "roster",
    config: {
      role: "CI/CD pipeline design and optimization (GitHub Actions, GitLab CI, Jenkins)",
      capabilities: ["pipeline_design", "github_actions", "gitlab_ci", "parallelization"],
      queueName: "q.cicd-orchestrator",
      systemPromptTemplate: "You are a DevOps engineer. Design an optimal CI/CD pipeline. Platform: {{platform}}. Stack: {{stack}}. Requirements: {{requirements}}. Output YAML pipeline definition.",
      maxConcurrent: 1,
      retryLimit: 3,
      inputSchema: { platform: "string", stack: "string", requirements: "string[]" },
      outputSchema: { pipelineYaml: "string", stages: "string[]", estimatedDuration: "number" }
    }
  },
  {
    name: "infra-advisor",
    adapterType: "roster",
    config: {
      role: "Infrastructure as Code, Terraform, and cloud architecture advisor",
      capabilities: ["terraform", "iac", "cloud_architecture", "cost_aware_design"],
      queueName: "q.infra-advisor",
      systemPromptTemplate: "You are a cloud architect. Design infrastructure for the described workload. Cloud: {{cloud}}. Budget: {{budget}}. SLA: {{sla}}. Output Terraform module outline and architecture diagram description.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { cloud: "string", workload: "string", budget: "string", sla: "string" },
      outputSchema: { terraformOutline: "string", architectureNotes: "string[]", estimatedCost: "string" }
    }
  },
  {
    name: "deploy-manager",
    adapterType: "roster",
    config: {
      role: "Deployment strategy advisor \u2014 blue/green, canary, rollback planning",
      capabilities: ["blue_green", "canary", "rollback", "feature_flags", "deployment_checklist"],
      queueName: "q.deploy-manager",
      systemPromptTemplate: "You are a deployment engineer. Plan the deployment of {{service}} version {{version}} to {{environment}}. Generate a deployment checklist and rollback plan.",
      maxConcurrent: 1,
      retryLimit: 3,
      inputSchema: { service: "string", version: "string", environment: "string", strategy: "string" },
      outputSchema: { checklist: "string[]", rollbackPlan: "string", riskLevel: "string" }
    }
  },
  {
    name: "monitoring-agent",
    adapterType: "roster",
    config: {
      role: "Alert rules, dashboards, and SLO definitions for observability stacks",
      capabilities: ["alert_rules", "dashboard_design", "slo_sli", "log_analysis"],
      queueName: "q.monitoring-agent",
      systemPromptTemplate: "You are a site reliability engineer. Define SLOs, alert rules, and dashboards for {{service}}. Stack: {{observabilityStack}}. Current metrics: {{metrics}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { service: "string", observabilityStack: "string", metrics: "object" },
      outputSchema: { slos: "SLO[]", alertRules: "AlertRule[]", dashboardLayout: "string" }
    }
  },
  {
    name: "incident-responder",
    adapterType: "roster",
    config: {
      role: "Incident response runbooks and postmortem facilitator",
      capabilities: ["runbook_generation", "postmortem", "timeline_reconstruction", "action_items"],
      queueName: "q.incident-responder",
      systemPromptTemplate: "You are an incident commander. Given the incident details, generate a response runbook and postmortem template. Incident: {{description}}. Severity: {{severity}}. Services affected: {{services}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { description: "string", severity: "string", services: "string[]" },
      outputSchema: { runbook: "string", postmortemTemplate: "string", actionItems: "string[]" }
    }
  },
  {
    name: "cost-optimizer",
    adapterType: "roster",
    config: {
      role: "Cloud cost analysis, rightsizing, and waste elimination",
      capabilities: ["cost_analysis", "rightsizing", "reserved_instances", "waste_detection"],
      queueName: "q.cost-optimizer",
      systemPromptTemplate: "You are a FinOps engineer. Analyze cloud spend and identify waste. Cloud: {{cloud}}. Current spend: {{currentSpend}}. Resources: {{resources}}. Suggest optimizations with estimated savings.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { cloud: "string", currentSpend: "object", resources: "object[]" },
      outputSchema: { recommendations: "CostRecommendation[]", estimatedSavings: "string", priority: "string[]" }
    }
  },
  // ── Project / Knowledge ──────────────────────────────────────────────────────
  {
    name: "memory-agent",
    adapterType: "roster",
    config: {
      role: "Central memory owner that captures reusable learnings, project facts, and worker memory for future local execution",
      capabilities: ["memory_management", "knowledge_capture", "worker_learning", "memory_governance"],
      queueName: "q.memory-agent",
      systemPromptTemplate: "You are the memory agent. Convert solved work into reusable project facts and worker learnings so future runs can stay local-first and avoid unnecessary AI calls.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { sourceAgentType: "string", sourceJobType: "string", originalPayload: "object", result: "object" },
      outputSchema: { facts: "string[]", learnedSolution: "object", summary: "string" },
      researchFocus: ["memory", "learning", "project_context"],
      localFirst: true,
      ownsMemory: true
    }
  },
  {
    name: "worker-auditor",
    adapterType: "roster",
    config: {
      role: "Reliability auditor that monitors workers, identifies the most failure-prone agents, and opens escalation cases",
      capabilities: ["worker_reliability", "failure_audit", "escalation", "rebuild_planning"],
      queueName: "q.worker-auditor",
      systemPromptTemplate: "You are a worker reliability auditor. Review repeated worker failures, identify systemic hotspots, rank the most unstable workers, and produce an audit summary for escalation.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { auditedAgentType: "string", failureCount: "number", lastError: "string" },
      outputSchema: { severity: "string", suspectedHotspots: "string[]", summary: "string" },
      dailyScheduleHours: 24,
      researchFocus: ["worker_reliability", "failure_patterns", "rebuild_strategies"],
      localFirst: true
    }
  },
  {
    name: "worker-police",
    adapterType: "roster",
    config: {
      role: "Investigator that analyzes why a worker is failing and requests supporting evidence from research",
      capabilities: ["failure_investigation", "root_cause_analysis", "evidence_request", "worker_forensics"],
      queueName: "q.worker-police",
      systemPromptTemplate: "You are the worker police investigator. Examine the audit case, identify likely causes of failures, determine what evidence is missing, and prepare a focused investigation summary.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { auditedAgentType: "string", failureCount: "number", lastError: "string", auditSummary: "string" },
      outputSchema: { suspectedCauses: "string[]", needsResearch: "boolean", summary: "string" },
      researchFocus: ["provider_failures", "model_regressions", "worker_forensics"],
      localFirst: true
    }
  },
  {
    name: "worker-judge",
    adapterType: "roster",
    config: {
      role: "Decision-maker that uses police and research evidence to choose rebuild vs safer model reassignment",
      capabilities: ["governance", "reliability_judgement", "decision_making", "remediation_selection"],
      queueName: "q.worker-judge",
      systemPromptTemplate: "You are the worker judge. Review the audit evidence and decide whether the failing worker should be rebuilt or rerouted to a safer model. Output a single decision with rationale.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { auditedAgentType: "string", failureCount: "number", lastError: "string", researchRecommendations: "object[]" },
      outputSchema: { decision: "string", summary: "string" },
      researchFocus: ["reliability_governance", "model_selection", "rebuild_vs_reroute"],
      localFirst: true
    }
  },
  {
    name: "web-researcher",
    adapterType: "roster",
    config: {
      role: "Deep web researcher for model landscape tracking, benchmarks, release notes, and toolchain changes",
      capabilities: ["deep_research", "web_research", "benchmark_tracking", "release_monitoring"],
      queueName: "q.web-researcher",
      systemPromptTemplate: "You are a research analyst tracking AI model changes daily. Review the provided web sources, extract meaningful updates, summarize strengths by task type, and emit structured findings with sources.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { sources: "ResearchSource[]", focusAreas: "string[]", objective: "string" },
      outputSchema: { findings: "ResearchFinding[]", recommendations: "ModelRecommendation[]" },
      routingHints: { primary: "Gemini 2.5 Pro", fallback: "Claude Sonnet" },
      dailyScheduleHours: 24,
      researchFocus: ["coding", "graphic_design", "administrative_reporting", "financial_reporting"],
      localFirst: false
    }
  },
  {
    name: "agent-recruiter",
    adapterType: "roster",
    config: {
      role: "Model router that assigns the best current LLM/provider to each worker agent based on daily research",
      capabilities: ["model_selection", "provider_routing", "task_matching", "daily_benchmark_review"],
      queueName: "q.agent-recruiter",
      systemPromptTemplate: "You are an AI workforce recruiter. Use the latest model research to assign the best provider/model to each worker agent. Optimize for task fit, output quality, and operational cost. Return structured assignments.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { roster: "RosterAgent[]", businessDomains: "string[]", researchDigest: "object" },
      outputSchema: { assignments: "ModelAssignment[]", summary: "string", risks: "string[]" },
      routingHints: { coding: "Claude Sonnet", graphic_design: "Gemini 2.5 Pro", reporting: "GPT-4.1" },
      dailyScheduleHours: 24,
      researchFocus: ["model-benchmarks", "release-notes", "task-routing"],
      localFirst: true
    }
  },
  {
    name: "task-planner",
    adapterType: "roster",
    config: {
      role: "Sprint planning, story point estimation, and backlog prioritization",
      capabilities: ["sprint_planning", "estimation", "backlog_grooming", "dependency_mapping"],
      queueName: "q.task-planner",
      systemPromptTemplate: "You are an Agile coach. Break down the epic into user stories with acceptance criteria and story point estimates. Epic: {{epic}}. Team velocity: {{velocity}}. Sprint length: {{sprintDays}} days.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { epic: "string", velocity: "number", sprintDays: "number" },
      outputSchema: { stories: "UserStory[]", sprintPlan: "string", risks: "string[]" }
    }
  },
  {
    name: "onboarding-agent",
    adapterType: "roster",
    config: {
      role: "New developer onboarding guide and workspace orientation",
      capabilities: ["onboarding_guide", "codebase_tour", "local_setup", "team_conventions"],
      queueName: "q.onboarding-agent",
      systemPromptTemplate: "You are a senior developer onboarding a new team member. Generate a structured onboarding guide for {{role}} joining the {{team}} team. Stack: {{stack}}.",
      maxConcurrent: 2,
      retryLimit: 2,
      inputSchema: { role: "string", team: "string", stack: "string[]" },
      outputSchema: { guide: "string", checklist: "string[]", resources: "string[]" }
    }
  },
  {
    name: "tech-debt-tracker",
    adapterType: "roster",
    config: {
      role: "Technical debt registry, scoring, and paydown prioritization",
      capabilities: ["debt_scoring", "paydown_planning", "impact_analysis", "estimation"],
      queueName: "q.tech-debt-tracker",
      systemPromptTemplate: "You are a software architect tracking tech debt. Score and prioritize the following debt items by business impact, risk, and fix effort. Items: {{debtItems}}. Team velocity: {{velocity}}.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { debtItems: "DebtItem[]", velocity: "number" },
      outputSchema: { scored: "ScoredDebtItem[]", paydownPlan: "string[]", quickWins: "string[]" }
    }
  },
  {
    name: "context-storage-worker",
    adapterType: "roster",
    config: {
      role: "Persistent storage and indexing worker for AI context, project memory, decisions, tasks, and research artifacts",
      capabilities: ["context_indexing", "local_storage", "fast_retrieval", "knowledge_persistence"],
      queueName: "q.context-storage-worker",
      systemPromptTemplate: "You are the storage and indexing worker. Organize AI context, memory, tasks, decisions, and project signals into searchable, deduplicated indexed records for fast retrieval.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { workspaceId: "string", objective: "string", changedSources: "string[]" },
      outputSchema: { indexedSources: "string[]", entriesCreated: "number", summary: "string" },
      dailyScheduleHours: 24,
      researchFocus: ["knowledge_storage", "indexing", "retrieval"],
      localFirst: true
    }
  },
  {
    name: "data-miner",
    adapterType: "roster",
    config: {
      role: "Big data and dataframe preparation worker that classifies datasets, shapes ML-ready data, and keeps outputs linked to project memory",
      capabilities: [
        "data_mining",
        "bigdata_classification",
        "dataframe_preparation",
        "feature_readiness",
        "memory_linkage"
      ],
      queueName: "q.data-miner",
      systemPromptTemplate: "You are the data miner worker. Classify project data, organize dataframe-oriented structures, prepare ML-ready datasets, and link the resulting insights back to project memory for future worker intelligence.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: {
        objective: "string",
        sources: "string[]",
        datasets: "object[]",
        targetModel: "string",
        memoryContext: "string[]"
      },
      outputSchema: {
        classifications: "string[]",
        dataframePlan: "object",
        mlReadyDatasets: "string[]",
        memoryLinks: "string[]",
        summary: "string"
      },
      researchFocus: ["data_mining", "bigdata", "feature_engineering", "memory_indexing"],
      localFirst: true
    }
  },
  {
    name: "translator-worker",
    adapterType: "roster",
    config: {
      role: "Prompt translator and first-pass interpreter that detects language, corrects grammar, clarifies intent, and prepares worker task prompts for recruiter handoff",
      capabilities: [
        "language_detection",
        "prompt_normalization",
        "grammar_correction",
        "task_translation",
        "recruiter_handoff"
      ],
      queueName: "q.translator-worker",
      systemPromptTemplate: "You are the translator worker. Detect the prompt language, correct spelling and grammar, produce the first clear understanding of the request, and translate each worker task into recruiter-ready prompts.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: {
        prompt: "string",
        workerTasks: "object[]",
        targetLanguage: "string"
      },
      outputSchema: {
        detectedLanguage: "string",
        correctedPrompt: "string",
        promptUnderstanding: "string",
        workerTaskPrompts: "object[]",
        recruiterPayload: "object",
        summary: "string"
      },
      researchFocus: ["translation", "prompt_interpretation", "task_routing", "worker_handoffs"],
      localFirst: true
    }
  },
  {
    name: "token-vault-worker",
    adapterType: "roster",
    config: {
      role: "Token vault worker that monitors per-worker model usage, enforces responsible token spending, prevents unnecessary consumption, and tracks remaining token balances",
      capabilities: [
        "token_budgeting",
        "usage_monitoring",
        "budget_enforcement",
        "remaining_balance_tracking",
        "model_cost_governance"
      ],
      queueName: "q.token-vault-worker",
      systemPromptTemplate: "You are the token vault worker. Monitor worker token usage, keep model budgets under control, prevent wasteful token consumption, and maintain remaining token balances by worker and provider.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: {
        providerBudgets: "object[]",
        workerUsage: "object[]",
        optimizationGoal: "string"
      },
      outputSchema: {
        workerBalances: "object[]",
        providerBalances: "object[]",
        wasteFindings: "string[]",
        guardrails: "string[]",
        summary: "string"
      },
      researchFocus: ["token_budgeting", "cost_control", "usage_efficiency", "model_governance"],
      localFirst: true
    }
  },
  {
    name: "accounts-worker",
    adapterType: "roster",
    config: {
      role: "Multi-account governance worker that manages provider accounts and connections for Claude, Gemini, ChatGPT, and related agent access flows",
      capabilities: [
        "account_management",
        "provider_connections",
        "multi_provider_governance",
        "credential_routing",
        "connection_health"
      ],
      queueName: "q.accounts-worker",
      systemPromptTemplate: "You are the accounts worker. Manage multiple provider accounts, maintain connections for Claude, Gemini, ChatGPT and other agent systems, and report healthy routing and account governance state.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: {
        providers: "object[]",
        routingPolicies: "string[]",
        connectionTargets: "string[]"
      },
      outputSchema: {
        accountRegistry: "object[]",
        connectionStatuses: "object[]",
        routingPoliciesApplied: "string[]",
        summary: "string"
      },
      researchFocus: ["account_management", "provider_connectivity", "routing_policies", "multi_agent_access"],
      localFirst: true
    }
  },
  {
    name: "worker-compliance",
    adapterType: "roster",
    config: {
      role: "Output compliance worker that validates whether each worker fulfilled the requested task and reports failures to audit",
      capabilities: ["output_validation", "contract_checking", "quality_gate", "worker_compliance"],
      queueName: "q.worker-compliance",
      systemPromptTemplate: "You are the compliance worker. Compare the requested task against the produced output and determine if the worker satisfied the assignment. Return compliant, issues, and expected signals.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { auditedJobId: "string", auditedAgentType: "string", auditedJobType: "string", result: "object", expectedSignals: "string[]" },
      outputSchema: { compliant: "boolean", issues: "string[]", expectedSignals: "string[]", summary: "string" },
      researchFocus: ["quality_gates", "task_contracts", "output_validation"],
      localFirst: true
    }
  },
  {
    name: "workflow-automation-worker",
    adapterType: "roster",
    config: {
      role: "Automation builder for 2026 workflow stacks including n8n, Make, GitHub Actions, queues, and event-driven orchestration",
      capabilities: ["workflow_automation", "n8n", "make", "event_orchestration", "runbook_automation"],
      queueName: "q.workflow-automation-worker",
      systemPromptTemplate: "You are the automation worker. Design and produce operational workflows for automation platforms, background jobs, approvals, retries, and observability.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { platform: "string", workflowGoal: "string", integrations: "string[]" },
      outputSchema: { actions: "string[]", workflowSpec: "string", summary: "string" },
      routingHints: { automation: "Claude Sonnet", business_ops: "GPT-4.1" },
      researchFocus: ["workflow_automation", "n8n", "make", "orchestration"],
      localFirst: true
    }
  },
  {
    name: "integration-engineer",
    adapterType: "roster",
    config: {
      role: "API, webhook, MCP, SaaS, ERP, CRM, and internal platform integration specialist",
      capabilities: ["api_integration", "webhooks", "mcp", "sso", "data_mapping"],
      queueName: "q.integration-engineer",
      systemPromptTemplate: "You are the integrations worker. Build or review integration plans for APIs, webhooks, SaaS systems, authentication flows, and data mapping contracts.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { systems: "string[]", auth: "string", dataShape: "object" },
      outputSchema: { integrationPlan: "string", risks: "string[]", summary: "string" },
      researchFocus: ["integrations", "apis", "webhooks", "mcp"],
      localFirst: true
    }
  },
  {
    name: "security-governor",
    adapterType: "roster",
    config: {
      role: "2026 security governance worker for AppSec, IAM, secrets hygiene, supply chain, and policy enforcement",
      capabilities: ["security_governance", "iam", "supply_chain_security", "policy_enforcement", "threat_review"],
      queueName: "q.security-governor",
      systemPromptTemplate: "You are the security governance worker. Evaluate architecture, workflows, and integrations for identity, secrets, policy, and software supply-chain risk.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { assets: "string[]", architecture: "string", policies: "string[]" },
      outputSchema: { findings: "string[]", remediations: "string[]", summary: "string" },
      researchFocus: ["security", "iam", "supply_chain", "appsec"],
      localFirst: true
    }
  },
  {
    name: "linguistic-qa",
    adapterType: "roster",
    config: {
      role: "Linguistic quality worker for multilingual correctness, tone, terminology, localization, and prompt clarity",
      capabilities: ["linguistic_review", "localization", "terminology_control", "tone_consistency", "translation_qa"],
      queueName: "q.linguistic-qa",
      systemPromptTemplate: "You are the linguistic QA worker. Review text for correctness, clarity, localized terminology, consistent tone, and prompt usability across languages.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { content: "string", locale: "string", glossary: "string[]" },
      outputSchema: { issues: "string[]", rewrittenText: "string", summary: "string" },
      routingHints: { linguistic: "GPT-4.1", reasoning: "Claude Sonnet" },
      researchFocus: ["linguistics", "localization", "prompt_quality"],
      localFirst: true
    }
  },
  {
    name: "review-orchestrator",
    adapterType: "roster",
    config: {
      role: "Cross-functional review worker that consolidates code, product, design, security, and release reviews",
      capabilities: ["cross_review", "release_readiness", "qa_signoff", "multi_stakeholder_review"],
      queueName: "q.review-orchestrator",
      systemPromptTemplate: "You are the review orchestrator. Combine technical, security, UX, and release considerations into a single readiness review with blockers and approvals.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { scope: "string", artifacts: "string[]", releaseContext: "string" },
      outputSchema: { findings: "string[]", approvals: "string[]", summary: "string" },
      researchFocus: ["review", "release_readiness", "quality"],
      localFirst: true
    }
  },
  {
    name: "capture-orchestrator",
    adapterType: "roster",
    config: {
      role: "Lead, intake, and opportunity capture worker for forms, CRM enrichment, qualification, and routing",
      capabilities: ["lead_capture", "intake_automation", "crm_enrichment", "qualification", "routing"],
      queueName: "q.capture-orchestrator",
      systemPromptTemplate: "You are the capture orchestrator. Design and validate capture flows for new opportunities, inbound requests, qualification rules, enrichment, and downstream routing.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { sources: "string[]", qualificationRules: "string[]", targetSystem: "string" },
      outputSchema: { actions: "string[]", routingPlan: "string", summary: "string" },
      routingHints: { capture: "GPT-4.1", workflow: "Claude Sonnet" },
      researchFocus: ["capture_flows", "crm", "enrichment", "routing"],
      localFirst: true
    }
  },
  {
    name: "compliance-checker",
    adapterType: "roster",
    config: {
      role: "SOC2, ISO 27001, GDPR, and HIPAA compliance gap analysis",
      capabilities: ["soc2", "iso27001", "gdpr", "hipaa", "gap_analysis"],
      queueName: "q.compliance-checker",
      systemPromptTemplate: "You are a compliance auditor. Perform a gap analysis against {{framework}}. Review: {{artifacts}}. Identify gaps and generate remediation tasks ranked by risk.",
      maxConcurrent: 1,
      retryLimit: 2,
      inputSchema: { framework: "string", artifacts: "string[]" },
      outputSchema: { gaps: "ComplianceGap[]", remediations: "string[]", riskScore: "string" }
    }
  }
];
var AgentRosterService = class {
  repo;
  db;
  constructor(db) {
    this.db = db;
    this.repo = new AgentRepository(db);
  }
  /** Idempotent — seeds the full roster for the workspace. */
  ensureRoster(workspaceId) {
    return SOFTWARE_DEV_DEVOPS_ROSTER.map(
      (def) => this.repo.create(workspaceId, def.name, def.adapterType, def.config)
    );
  }
  /** Returns all roster agents for the workspace with parsed config. */
  rosterWithConfig(workspaceId) {
    return this.repo.findByWorkspace(workspaceId).filter((a) => a.adapterType === "roster").map((agent) => ({
      agent,
      config: JSON.parse(agent.configJson)
    }));
  }
  findByAgentType(workspaceId, agentType) {
    return this.repo.findByWorkspaceAndName(workspaceId, agentType);
  }
};

// src/services/WorkerAuditService.ts
var FAILURE_THRESHOLD = 3;
var FAILURE_RESEARCH_SOURCES = [
  {
    title: "Anthropic models",
    url: "https://docs.anthropic.com/en/docs/about-claude/models",
    capability: "coding"
  },
  {
    title: "OpenAI models",
    url: "https://platform.openai.com/docs/models",
    capability: "administrative_reporting"
  },
  {
    title: "Gemini models",
    url: "https://ai.google.dev/gemini-api/docs/models",
    capability: "graphic_design"
  }
];
var WorkerAuditService = class {
  repo;
  queueService;
  rosterService;
  constructor(db) {
    this.repo = new WorkerAuditRepository(db);
    this.queueService = new JobQueueService(db);
    this.rosterService = new AgentRosterService(db);
  }
  recordFailure(job, workerId, error) {
    const auditCase = this.repo.recordFailure({
      workspaceId: job.workspaceId,
      auditedAgentType: job.agentType,
      lastError: error,
      lastJobId: job.id,
      lastWorkerId: workerId
    });
    if (auditCase.failureCount >= FAILURE_THRESHOLD && !auditCase.auditorJobId && !this.isGovernanceAgent(job.agentType)) {
      const auditorJob = this.queueService.enqueue({
        workspaceId: job.workspaceId,
        agentType: "worker-auditor",
        jobType: "failure_audit",
        priority: 10,
        maxRetries: 2,
        payload: {
          auditCaseId: auditCase.id,
          auditedAgentType: auditCase.auditedAgentType,
          failureCount: auditCase.failureCount,
          lastError: auditCase.lastError,
          lastWorkerId: auditCase.lastWorkerId,
          failedJobId: job.id,
          failedJobType: job.jobType
        }
      });
      this.repo.attachJob(auditCase.id, "auditorJobId", auditorJob.id, "auditing");
      return this.repo.findById(auditCase.id);
    }
    return auditCase;
  }
  handleJobCompletion(job, result) {
    const payload = JSON.parse(job.payloadJson);
    const auditCaseId = typeof payload.auditCaseId === "string" ? payload.auditCaseId : void 0;
    if (!auditCaseId) return void 0;
    const auditCase = this.repo.findById(auditCaseId);
    if (!auditCase) return void 0;
    if (job.agentType === "worker-auditor" && job.jobType === "failure_audit") {
      const policeJob = this.queueService.enqueue({
        workspaceId: job.workspaceId,
        agentType: "worker-police",
        jobType: "investigate_worker_failures",
        priority: 9,
        maxRetries: 2,
        payload: {
          auditCaseId,
          auditedAgentType: auditCase.auditedAgentType,
          failureCount: auditCase.failureCount,
          lastError: auditCase.lastError,
          auditSummary: result.summary ?? "Repeated worker failures require investigation."
        }
      });
      this.repo.attachJob(auditCaseId, "policeJobId", policeJob.id, "police_investigating");
      return this.repo.findById(auditCaseId);
    }
    if (job.agentType === "worker-police") {
      const roster = this.rosterService.rosterWithConfig(job.workspaceId);
      const auditedAgent = roster.find((entry) => entry.agent.name === auditCase.auditedAgentType);
      const focusAreas = this.focusAreasForAgent(auditedAgent?.config);
      const researchJob = this.queueService.enqueue({
        workspaceId: job.workspaceId,
        agentType: "web-researcher",
        jobType: "worker_failure_research",
        priority: 9,
        maxRetries: 2,
        payload: {
          auditCaseId,
          auditedAgentType: auditCase.auditedAgentType,
          objective: `Investigate model/provider changes and failure mitigations for ${auditCase.auditedAgentType}.`,
          focusAreas,
          sources: FAILURE_RESEARCH_SOURCES,
          policeSummary: result.summary ?? "",
          lastError: auditCase.lastError
        }
      });
      this.repo.attachJob(auditCaseId, "researchJobId", researchJob.id, "researching");
      return this.repo.findById(auditCaseId);
    }
    if (job.agentType === "web-researcher" && job.jobType === "worker_failure_research") {
      const judgeJob = this.queueService.enqueue({
        workspaceId: job.workspaceId,
        agentType: "worker-judge",
        jobType: "judge_worker_reliability",
        priority: 9,
        maxRetries: 2,
        payload: {
          auditCaseId,
          auditedAgentType: auditCase.auditedAgentType,
          failureCount: auditCase.failureCount,
          lastError: auditCase.lastError,
          researchRecommendations: result.recommendations ?? [],
          researchSummary: result.summary ?? ""
        }
      });
      this.repo.attachJob(auditCaseId, "judgeJobId", judgeJob.id, "judge_pending");
      return this.repo.findById(auditCaseId);
    }
    if (job.agentType === "worker-judge") {
      const decision = typeof result.decision === "string" ? result.decision : "reassign_model";
      if (decision === "rebuild_worker") {
        const rebuildJob = this.queueService.enqueue({
          workspaceId: job.workspaceId,
          agentType: "worker-auditor",
          jobType: "rebuild_worker_profile",
          priority: 8,
          maxRetries: 2,
          payload: {
            auditCaseId,
            auditedAgentType: auditCase.auditedAgentType,
            failureCount: auditCase.failureCount,
            lastError: auditCase.lastError,
            judgeSummary: result.summary ?? ""
          }
        });
        this.repo.attachJob(auditCaseId, "rebuildJobId", rebuildJob.id, "rebuilding");
      } else {
        const recruiterJob = this.queueService.enqueue({
          workspaceId: job.workspaceId,
          agentType: "agent-recruiter",
          jobType: "reroute_failing_worker",
          priority: 8,
          maxRetries: 2,
          payload: {
            auditCaseId,
            businessDomains: ["software-development", "devops", "reliability"],
            roster: [
              {
                agentType: auditCase.auditedAgentType,
                role: `Remediate repeated failures for ${auditCase.auditedAgentType}`,
                capabilities: this.focusAreasForAgent(
                  this.rosterService.rosterWithConfig(job.workspaceId).find((entry) => entry.agent.name === auditCase.auditedAgentType)?.config
                )
              }
            ]
          }
        });
        this.repo.attachJob(auditCaseId, "recruiterJobId", recruiterJob.id, "recruiting");
      }
      return this.repo.findById(auditCaseId);
    }
    if (job.agentType === "agent-recruiter" && job.jobType === "reroute_failing_worker") {
      this.repo.resolve(
        auditCaseId,
        "reassign_model",
        String(result.summary ?? `Model reassignment prepared for ${auditCase.auditedAgentType}.`)
      );
      return this.repo.findById(auditCaseId);
    }
    if (job.agentType === "worker-auditor" && job.jobType === "rebuild_worker_profile") {
      this.repo.resolve(
        auditCaseId,
        "rebuild_worker",
        String(result.summary ?? `Rebuild plan prepared for ${auditCase.auditedAgentType}.`)
      );
      return this.repo.findById(auditCaseId);
    }
    return auditCase;
  }
  topFailingAgents(workspaceId, limit = 5) {
    return this.repo.topFailingAgents(workspaceId, limit);
  }
  listByWorkspace(workspaceId) {
    return this.repo.listByWorkspace(workspaceId);
  }
  isGovernanceAgent(agentType) {
    return ["worker-auditor", "worker-police", "worker-judge"].includes(agentType);
  }
  focusAreasForAgent(config) {
    if (!config) return ["coding"];
    return config.researchFocus ?? config.capabilities.slice(0, 3);
  }
};

// src/storage/repositories/ContextIndexRepository.ts
import { randomUUID as randomUUID20 } from "node:crypto";
var ContextIndexRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  upsert(input) {
    const existing = this.db.prepare(`
      SELECT * FROM context_index_entries
      WHERE workspaceId = ? AND sourceType = ? AND sourceId = ?
    `).get(input.workspaceId, input.sourceType, input.sourceId);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const tagsJson = JSON.stringify(input.tags);
    const searchableText = [input.title, input.body, ...input.tags].join(" ").toLowerCase();
    if (existing) {
      this.db.prepare(`
        UPDATE context_index_entries
        SET title = ?, body = ?, tagsJson = ?, searchableText = ?, updatedAt = ?
        WHERE id = ?
      `).run(input.title, input.body, tagsJson, searchableText, now, existing.id);
      return this.findById(existing.id);
    }
    const entry = {
      id: randomUUID20(),
      workspaceId: input.workspaceId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      title: input.title,
      body: input.body,
      tagsJson,
      searchableText,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(`
      INSERT INTO context_index_entries (
        id, workspaceId, sourceType, sourceId, title, body, tagsJson,
        searchableText, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id,
      entry.workspaceId,
      entry.sourceType,
      entry.sourceId,
      entry.title,
      entry.body,
      entry.tagsJson,
      entry.searchableText,
      entry.createdAt,
      entry.updatedAt
    );
    return entry;
  }
  findById(id) {
    return this.db.prepare(
      "SELECT * FROM context_index_entries WHERE id = ?"
    ).get(id);
  }
  listByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM context_index_entries
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId);
  }
  search(workspaceId, query, limit = 20) {
    const like = `%${query.toLowerCase()}%`;
    return this.db.prepare(`
      SELECT * FROM context_index_entries
      WHERE workspaceId = ? AND searchableText LIKE ?
      ORDER BY updatedAt DESC
      LIMIT ?
    `).all(workspaceId, like, limit);
  }
};

// src/services/ContextIndexService.ts
var ContextIndexService = class {
  db;
  repo;
  constructor(db) {
    this.db = db;
    this.repo = new ContextIndexRepository(db);
  }
  syncWorkspace(workspaceId) {
    const entries = [];
    for (const conversation of this.fetchRows(
      "SELECT id, title, COALESCE(summary, recentContext, '') AS body, sourceAgent AS tag FROM conversations WHERE workspaceId = ?",
      workspaceId
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "conversation",
          sourceId: conversation.id,
          title: conversation.title ?? "Conversation",
          body: conversation.body ?? "",
          tags: ["conversation", conversation.tag ?? "agent-chat"]
        })
      );
    }
    for (const task of this.fetchRows(
      "SELECT id, title, COALESCE(description, '') AS body, epic AS tag FROM tasks WHERE workspaceId = ?",
      workspaceId
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "task",
          sourceId: task.id,
          title: task.title ?? "Task",
          body: task.body ?? "",
          tags: ["task", task.tag ?? "general"]
        })
      );
    }
    for (const decision of this.fetchRows(
      "SELECT id, title, COALESCE(rationale, '') AS body, status AS tag FROM decisions WHERE workspaceId = ?",
      workspaceId
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "decision",
          sourceId: decision.id,
          title: decision.title ?? "Decision",
          body: decision.body ?? "",
          tags: ["decision", decision.tag ?? "unknown"]
        })
      );
    }
    for (const memory of this.fetchRows(
      "SELECT id, category AS title, fact AS body, category AS tag FROM project_memories WHERE workspaceId = ?",
      workspaceId
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "project-memory",
          sourceId: memory.id,
          title: memory.title ?? "Project Memory",
          body: memory.body ?? "",
          tags: ["memory", memory.tag ?? "general"]
        })
      );
    }
    for (const research of this.fetchRows(
      "SELECT id, title, COALESCE(notes, '') AS body, kind AS tag FROM research_references WHERE workspaceId = ? OR workspaceId IS NULL",
      workspaceId
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "research",
          sourceId: research.id,
          title: research.title ?? "Research",
          body: research.body ?? "",
          tags: ["research", research.tag ?? "reference"]
        })
      );
    }
    for (const term of this.fetchRows(
      "SELECT id, canonicalTerm AS title, COALESCE(description, normalizedTerm, '') AS body, termCode AS tag FROM term_registry WHERE workspaceId = ?",
      workspaceId
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "term",
          sourceId: term.id,
          title: term.title ?? "Term",
          body: term.body ?? "",
          tags: ["term", term.tag ?? "semantic-code"]
        })
      );
    }
    for (const artifact of this.fetchRows(
      "SELECT id, title, substr(COALESCE(content, ''), 1, 4000) AS body, artifactType AS tag FROM artifact_store WHERE workspaceId = ?",
      workspaceId
    )) {
      entries.push(
        this.repo.upsert({
          workspaceId,
          sourceType: "artifact",
          sourceId: artifact.id,
          title: artifact.title ?? "Artifact",
          body: artifact.body ?? "",
          tags: ["artifact", artifact.tag ?? "result"]
        })
      );
    }
    return entries;
  }
  listByWorkspace(workspaceId) {
    return this.repo.listByWorkspace(workspaceId);
  }
  search(workspaceId, query, limit = 20) {
    return this.repo.search(workspaceId, query, limit);
  }
  fetchRows(sql, workspaceId) {
    return this.db.prepare(sql).all(workspaceId);
  }
};

// src/storage/repositories/WorkerComplianceRepository.ts
import { randomUUID as randomUUID21 } from "node:crypto";
var WorkerComplianceRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  create(input) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const report = {
      id: randomUUID21(),
      workspaceId: input.workspaceId,
      auditedJobId: input.auditedJobId,
      auditedAgentType: input.auditedAgentType,
      auditedJobType: input.auditedJobType,
      complianceJobId: input.complianceJobId ?? null,
      compliant: input.compliant ? 1 : 0,
      status: input.status,
      issuesJson: JSON.stringify(input.issues),
      expectedSignalsJson: JSON.stringify(input.expectedSignals),
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(`
      INSERT INTO worker_compliance_reports (
        id, workspaceId, auditedJobId, auditedAgentType, auditedJobType, complianceJobId,
        compliant, status, issuesJson, expectedSignalsJson, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      report.id,
      report.workspaceId,
      report.auditedJobId,
      report.auditedAgentType,
      report.auditedJobType,
      report.complianceJobId,
      report.compliant,
      report.status,
      report.issuesJson,
      report.expectedSignalsJson,
      report.createdAt,
      report.updatedAt
    );
    return report;
  }
  attachComplianceJob(reportId, complianceJobId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE worker_compliance_reports
      SET complianceJobId = ?, updatedAt = ?
      WHERE id = ?
    `).run(complianceJobId, now, reportId);
  }
  listByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM worker_compliance_reports
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId);
  }
};

// src/services/WorkerComplianceService.ts
var EXCLUDED_AGENT_TYPES = /* @__PURE__ */ new Set([
  "worker-auditor",
  "worker-police",
  "worker-judge",
  "worker-compliance",
  "context-storage-worker",
  "web-researcher",
  "agent-recruiter"
]);
var WorkerComplianceService = class {
  repo;
  queueService;
  auditService;
  constructor(db) {
    this.repo = new WorkerComplianceRepository(db);
    this.queueService = new JobQueueService(db);
    this.auditService = new WorkerAuditService(db);
  }
  queueReviewForJob(job, result) {
    if (EXCLUDED_AGENT_TYPES.has(job.agentType)) return void 0;
    const expectedSignals = this.expectedSignalsFor(job.jobType, job.agentType);
    const reviewJob = this.queueService.enqueue({
      workspaceId: job.workspaceId,
      agentType: "worker-compliance",
      jobType: "validate_worker_output",
      priority: 7,
      maxRetries: 2,
      payload: {
        auditedJobId: job.id,
        auditedAgentType: job.agentType,
        auditedJobType: job.jobType,
        originalPayload: JSON.parse(job.payloadJson),
        result,
        expectedSignals
      }
    });
    this.repo.create({
      workspaceId: job.workspaceId,
      auditedJobId: job.id,
      auditedAgentType: job.agentType,
      auditedJobType: job.jobType,
      complianceJobId: reviewJob.id,
      compliant: false,
      status: "queued",
      issues: [],
      expectedSignals
    });
    return reviewJob;
  }
  handleReviewCompletion(complianceJob, result) {
    const payload = JSON.parse(complianceJob.payloadJson);
    if (!payload.auditedJobId || !payload.auditedAgentType || !payload.auditedJobType) return;
    const issues = Array.isArray(result.issues) ? result.issues.map((issue) => String(issue)) : [];
    const expectedSignals = Array.isArray(result.expectedSignals) ? result.expectedSignals.map((signal) => String(signal)) : [];
    const compliant = Boolean(result.compliant);
    this.repo.create({
      workspaceId: complianceJob.workspaceId,
      auditedJobId: payload.auditedJobId,
      auditedAgentType: payload.auditedAgentType,
      auditedJobType: payload.auditedJobType,
      complianceJobId: complianceJob.id,
      compliant,
      status: compliant ? "passed" : "failed",
      issues,
      expectedSignals
    });
    if (!compliant) {
      this.auditService.recordFailure(
        {
          ...complianceJob,
          id: payload.auditedJobId,
          agentType: payload.auditedAgentType,
          jobType: payload.auditedJobType
        },
        "worker-compliance",
        `Compliance failure: ${issues.join("; ") || "missing required deliverables"}`
      );
    }
  }
  listReports(workspaceId) {
    return this.repo.listByWorkspace(workspaceId);
  }
  expectedSignalsFor(jobType, agentType) {
    const defaults = ["summary"];
    if (/token-vault/.test(agentType) || /token|budget|balance/.test(jobType)) {
      return [...defaults, "workerBalances", "providerBalances", "wasteFindings", "guardrails"];
    }
    if (/accounts-worker/.test(agentType) || /account|provider_connection|connection_health/.test(jobType)) {
      return [...defaults, "accountRegistry", "connectionStatuses", "routingPoliciesApplied"];
    }
    if (/translator/.test(agentType) || /translate|prompt_normalization|recruiter_handoff/.test(jobType)) {
      return [
        ...defaults,
        "detectedLanguage",
        "correctedPrompt",
        "promptUnderstanding",
        "workerTaskPrompts",
        "recruiterPayload"
      ];
    }
    if (/data[-_]?miner/.test(agentType) || /data|mining|feature|ml/.test(jobType)) {
      return [...defaults, "classifications", "dataframePlan", "mlReadyDatasets", "memoryLinks"];
    }
    if (/review/.test(jobType) || /review/.test(agentType)) return [...defaults, "findings"];
    if (/deploy|pipeline|workflow|automation/.test(jobType) || /automation/.test(agentType)) {
      return [...defaults, "actions"];
    }
    if (/security/.test(jobType) || /security/.test(agentType)) return [...defaults, "findings"];
    if (/lingu/.test(agentType)) return [...defaults, "issues"];
    if (/integrat/.test(agentType)) return [...defaults, "integrationPlan"];
    return defaults;
  }
};

// src/storage/repositories/ProjectTimelineRepository.ts
import { randomUUID as randomUUID22 } from "node:crypto";
var ProjectTimelineRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  record(input) {
    const event = {
      id: randomUUID22(),
      workspaceId: input.workspaceId,
      eventType: input.eventType,
      actorAgentType: input.actorAgentType ?? null,
      relatedJobId: input.relatedJobId ?? null,
      title: input.title,
      details: input.details ?? null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.prepare(`
      INSERT INTO project_timeline_events (
        id, workspaceId, eventType, actorAgentType, relatedJobId, title, details, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id,
      event.workspaceId,
      event.eventType,
      event.actorAgentType,
      event.relatedJobId,
      event.title,
      event.details,
      event.createdAt
    );
    return event;
  }
  recent(workspaceId, limit = 20) {
    return this.db.prepare(`
      SELECT * FROM project_timeline_events
      WHERE workspaceId = ?
      ORDER BY createdAt DESC
      LIMIT ?
    `).all(workspaceId, limit);
  }
};

// src/services/ProjectTimelineService.ts
var ProjectTimelineService = class {
  repo;
  constructor(db) {
    this.repo = new ProjectTimelineRepository(db);
  }
  recordJobStarted(job) {
    return this.repo.record({
      workspaceId: job.workspaceId,
      eventType: "job_started",
      actorAgentType: job.agentType,
      relatedJobId: job.id,
      title: `${job.agentType} started ${job.jobType}`,
      details: `status=${job.status}`
    });
  }
  recordJobCompleted(job, summary) {
    return this.repo.record({
      workspaceId: job.workspaceId,
      eventType: "job_completed",
      actorAgentType: job.agentType,
      relatedJobId: job.id,
      title: `${job.agentType} completed ${job.jobType}`,
      details: summary ?? null
    });
  }
  recordJobFailed(job, error) {
    return this.repo.record({
      workspaceId: job.workspaceId,
      eventType: "job_failed",
      actorAgentType: job.agentType,
      relatedJobId: job.id,
      title: `${job.agentType} failed ${job.jobType}`,
      details: error
    });
  }
  recentSummary(workspaceId, limit = 8) {
    return this.repo.recent(workspaceId, limit).map((event) => `${event.eventType}: ${event.title}${event.details ? ` \u2014 ${event.details}` : ""}`);
  }
};

// src/storage/repositories/WorkerLearningRepository.ts
import { createHash as createHash5, randomUUID as randomUUID23 } from "node:crypto";
var WorkerLearningRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  upsert(input) {
    const signature = this.signatureFor(input.signaturePayload);
    const existing = this.findBySignature(input.workspaceId, input.agentType, input.jobType, signature);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (existing) {
      this.db.prepare(`
        UPDATE worker_learning_patterns
        SET complexity = ?, solutionJson = ?, updatedAt = ?
        WHERE id = ?
      `).run(input.complexity, JSON.stringify(input.solution), now, existing.id);
      return this.findById(existing.id);
    }
    const pattern = {
      id: randomUUID23(),
      workspaceId: input.workspaceId,
      agentType: input.agentType,
      jobType: input.jobType,
      signature,
      complexity: input.complexity,
      solutionJson: JSON.stringify(input.solution),
      usageCount: 0,
      lastUsedAt: now,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(`
      INSERT INTO worker_learning_patterns (
        id, workspaceId, agentType, jobType, signature, complexity, solutionJson,
        usageCount, lastUsedAt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pattern.id,
      pattern.workspaceId,
      pattern.agentType,
      pattern.jobType,
      pattern.signature,
      pattern.complexity,
      pattern.solutionJson,
      pattern.usageCount,
      pattern.lastUsedAt,
      pattern.createdAt,
      pattern.updatedAt
    );
    return pattern;
  }
  findReusable(workspaceId, agentType, jobType, signaturePayload) {
    const signature = this.signatureFor(signaturePayload);
    return this.findBySignature(workspaceId, agentType, jobType, signature);
  }
  markUsed(id) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE worker_learning_patterns
      SET usageCount = usageCount + 1, lastUsedAt = ?, updatedAt = ?
      WHERE id = ?
    `).run(now, now, id);
  }
  listByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM worker_learning_patterns
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId);
  }
  findById(id) {
    return this.db.prepare(
      "SELECT * FROM worker_learning_patterns WHERE id = ?"
    ).get(id);
  }
  findBySignature(workspaceId, agentType, jobType, signature) {
    return this.db.prepare(`
      SELECT * FROM worker_learning_patterns
      WHERE workspaceId = ? AND agentType = ? AND jobType = ? AND signature = ?
    `).get(workspaceId, agentType, jobType, signature);
  }
  signatureFor(payload) {
    return createHash5("sha256").update(stableStringify(payload)).digest("hex");
  }
};
function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(
      ([a], [b]) => a.localeCompare(b)
    );
    return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

// src/services/WorkerLearningService.ts
var WorkerLearningService = class {
  repo;
  constructor(db) {
    this.repo = new WorkerLearningRepository(db);
  }
  classify(job) {
    const payload = JSON.parse(job.payloadJson);
    const serialized = JSON.stringify(payload);
    const keyCount = Object.keys(payload).length;
    if (serialized.length > 1600 || keyCount > 8 || /(research|architecture|security|integration|workflow|judge|audit)/i.test(job.jobType)) {
      return "high";
    }
    if (serialized.length > 500 || keyCount > 4) {
      return "medium";
    }
    return "low";
  }
  reusableFor(job) {
    const signaturePayload = this.signaturePayload(job);
    const pattern = this.repo.findReusable(job.workspaceId, job.agentType, job.jobType, signaturePayload);
    if (pattern) this.repo.markUsed(pattern.id);
    return pattern;
  }
  learn(job, solution, complexity) {
    return this.repo.upsert({
      workspaceId: job.workspaceId,
      agentType: job.agentType,
      jobType: job.jobType,
      signaturePayload: this.signaturePayload(job),
      complexity: complexity ?? this.classify(job),
      solution
    });
  }
  listByWorkspace(workspaceId) {
    return this.repo.listByWorkspace(workspaceId);
  }
  signaturePayload(job) {
    const payload = JSON.parse(job.payloadJson);
    return {
      jobType: job.jobType,
      agentType: job.agentType,
      keys: Object.keys(payload).sort(),
      payload
    };
  }
};

// src/storage/repositories/PointerMemoryRepository.ts
import { randomUUID as randomUUID24 } from "node:crypto";

// src/shared/pointerUtils.ts
import { createHash as createHash6 } from "node:crypto";
function stableStringify2(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify2(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(
      ([a], [b]) => a.localeCompare(b)
    );
    return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableStringify2(val)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
function hashContent(value) {
  const content = typeof value === "string" ? value : stableStringify2(value);
  return createHash6("sha256").update(content).digest("hex");
}
function normalizeText(value) {
  return value.normalize("NFKD").toLowerCase().replace(/[^\w\s.-]+/g, " ").replace(/\s+/g, " ").trim();
}
function termCodeFor(value) {
  const normalized = normalizeText(value);
  return normalized.replace(/[\s_-]+/g, ".").replace(/\.+/g, ".").replace(/^\.|\.$/g, "") || "unknown";
}
function hexEncode(value) {
  return Buffer.from(value, "utf8").toString("hex");
}
function makePointerUri(pointerType, workspaceId, targetTable, targetId) {
  const scheme = pointerType.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "mem";
  return `${scheme}://ws/${workspaceId}/${targetTable}/${targetId}`;
}
function computeExpiry(ttlSeconds) {
  if (!ttlSeconds || ttlSeconds <= 0) return null;
  return new Date(Date.now() + ttlSeconds * 1e3).toISOString();
}
function vectorForText(value, dimensions = 16) {
  const digest = createHash6("sha256").update(normalizeText(value)).digest();
  const vector = [];
  for (let i = 0; i < dimensions; i++) {
    const byte = digest[i % digest.length] ?? 0;
    vector.push(Number((byte / 255).toFixed(6)));
  }
  return vector;
}
function cosineSimilarity(left, right) {
  const size = Math.min(left.length, right.length);
  if (size === 0) return 0;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let i = 0; i < size; i++) {
    dot += left[i] * right[i];
    leftNorm += left[i] * left[i];
    rightNorm += right[i] * right[i];
  }
  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

// src/storage/repositories/PointerMemoryRepository.ts
var MemoryPointerRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  upsert(input) {
    const existing = this.findByUri(input.pointerUri);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const expiresAt = computeExpiry(input.ttlSeconds);
    const permissionsJson = JSON.stringify(input.permissions ?? {});
    if (existing) {
      this.db.prepare(`
        UPDATE memory_pointers
        SET version = ?, contentHash = ?, permissionsJson = ?, ttlSeconds = ?, expiresAt = ?, updatedAt = ?
        WHERE id = ?
      `).run(
        input.version ?? existing.version,
        input.contentHash,
        permissionsJson,
        input.ttlSeconds ?? null,
        expiresAt,
        now,
        existing.id
      );
      return this.findByUri(input.pointerUri);
    }
    const pointer = {
      id: randomUUID24(),
      workspaceId: input.workspaceId,
      pointerUri: input.pointerUri,
      pointerType: input.pointerType,
      targetTable: input.targetTable,
      targetId: input.targetId,
      version: input.version ?? 1,
      contentHash: input.contentHash,
      permissionsJson,
      ttlSeconds: input.ttlSeconds ?? null,
      expiresAt,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(`
      INSERT INTO memory_pointers (
        id, workspaceId, pointerUri, pointerType, targetTable, targetId, version,
        contentHash, permissionsJson, ttlSeconds, expiresAt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pointer.id,
      pointer.workspaceId,
      pointer.pointerUri,
      pointer.pointerType,
      pointer.targetTable,
      pointer.targetId,
      pointer.version,
      pointer.contentHash,
      pointer.permissionsJson,
      pointer.ttlSeconds,
      pointer.expiresAt,
      pointer.createdAt,
      pointer.updatedAt
    );
    return pointer;
  }
  findByUri(pointerUri) {
    return this.db.prepare(
      "SELECT * FROM memory_pointers WHERE pointerUri = ?"
    ).get(pointerUri);
  }
  listByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM memory_pointers
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId);
  }
};
var ArtifactStoreRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  put(input) {
    const existing = this.findByUri(input.artifactUri);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const contentHash = hashContent(input.content);
    const metadataJson = JSON.stringify(input.metadata ?? {});
    const byteSize = Buffer.byteLength(input.content, "utf8");
    if (existing) {
      this.db.prepare(`
        UPDATE artifact_store
        SET artifactType = ?, title = ?, mimeType = ?, contentHash = ?, storageKind = ?,
            storagePath = ?, content = ?, byteSize = ?, metadataJson = ?
        WHERE id = ?
      `).run(
        input.artifactType,
        input.title,
        input.mimeType ?? null,
        contentHash,
        input.storageKind ?? existing.storageKind,
        input.storagePath ?? null,
        input.content,
        byteSize,
        metadataJson,
        existing.id
      );
      return this.findByUri(input.artifactUri);
    }
    const artifact = {
      id: randomUUID24(),
      workspaceId: input.workspaceId,
      artifactUri: input.artifactUri,
      artifactType: input.artifactType,
      title: input.title,
      mimeType: input.mimeType ?? null,
      contentHash,
      storageKind: input.storageKind ?? "sqlite",
      storagePath: input.storagePath ?? null,
      content: input.content,
      byteSize,
      metadataJson,
      createdAt: now
    };
    this.db.prepare(`
      INSERT INTO artifact_store (
        id, workspaceId, artifactUri, artifactType, title, mimeType, contentHash,
        storageKind, storagePath, content, byteSize, metadataJson, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      artifact.id,
      artifact.workspaceId,
      artifact.artifactUri,
      artifact.artifactType,
      artifact.title,
      artifact.mimeType,
      artifact.contentHash,
      artifact.storageKind,
      artifact.storagePath,
      artifact.content,
      artifact.byteSize,
      artifact.metadataJson,
      artifact.createdAt
    );
    return artifact;
  }
  findByUri(artifactUri) {
    return this.db.prepare(
      "SELECT * FROM artifact_store WHERE artifactUri = ?"
    ).get(artifactUri);
  }
  findById(id) {
    return this.db.prepare(
      "SELECT * FROM artifact_store WHERE id = ?"
    ).get(id);
  }
  listByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM artifact_store
      WHERE workspaceId = ?
      ORDER BY createdAt DESC
    `).all(workspaceId);
  }
};
var ContextCacheRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  upsert(input) {
    const existing = this.findByKey(input.workspaceId, input.cacheKey);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const expiresAt = computeExpiry(input.ttlSeconds);
    if (existing) {
      this.db.prepare(`
        UPDATE context_cache
        SET normalizedIntent = ?, pointerSetJson = ?, compactContext = ?,
            tokenCostSaved = ?, ttlSeconds = ?, expiresAt = ?, lastAccessedAt = ?
        WHERE id = ?
      `).run(
        input.normalizedIntent,
        JSON.stringify(input.pointerSet),
        input.compactContext,
        input.tokenCostSaved ?? existing.tokenCostSaved,
        input.ttlSeconds ?? null,
        expiresAt,
        now,
        existing.id
      );
      return this.findByKey(input.workspaceId, input.cacheKey);
    }
    const entry = {
      id: randomUUID24(),
      workspaceId: input.workspaceId,
      cacheKey: input.cacheKey,
      agentType: input.agentType,
      jobType: input.jobType,
      normalizedIntent: input.normalizedIntent,
      pointerSetJson: JSON.stringify(input.pointerSet),
      compactContext: input.compactContext,
      tokenCostSaved: input.tokenCostSaved ?? 0,
      hitCount: 0,
      ttlSeconds: input.ttlSeconds ?? null,
      expiresAt,
      createdAt: now,
      lastAccessedAt: now
    };
    this.db.prepare(`
      INSERT INTO context_cache (
        id, workspaceId, cacheKey, agentType, jobType, normalizedIntent, pointerSetJson,
        compactContext, tokenCostSaved, hitCount, ttlSeconds, expiresAt, createdAt, lastAccessedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id,
      entry.workspaceId,
      entry.cacheKey,
      entry.agentType,
      entry.jobType,
      entry.normalizedIntent,
      entry.pointerSetJson,
      entry.compactContext,
      entry.tokenCostSaved,
      entry.hitCount,
      entry.ttlSeconds,
      entry.expiresAt,
      entry.createdAt,
      entry.lastAccessedAt
    );
    return entry;
  }
  findByKey(workspaceId, cacheKey) {
    return this.db.prepare(`
      SELECT * FROM context_cache
      WHERE workspaceId = ? AND cacheKey = ?
    `).get(workspaceId, cacheKey);
  }
  markHit(id) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE context_cache
      SET hitCount = hitCount + 1, lastAccessedAt = ?
      WHERE id = ?
    `).run(now, id);
  }
};
var TermRegistryRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  upsert(input) {
    const existing = this.findByCode(input.workspaceId, input.termCode);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const aliasesJson = JSON.stringify(input.aliases ?? []);
    if (existing) {
      this.db.prepare(`
        UPDATE term_registry
        SET canonicalTerm = ?, normalizedTerm = ?, language = ?, hexRepresentation = ?,
            semanticGroupId = ?, aliasesJson = ?, description = ?, updatedAt = ?
        WHERE id = ?
      `).run(
        input.canonicalTerm,
        input.normalizedTerm,
        input.language ?? existing.language,
        input.hexRepresentation ?? null,
        input.semanticGroupId ?? null,
        aliasesJson,
        input.description ?? null,
        now,
        existing.id
      );
      return this.findByCode(input.workspaceId, input.termCode);
    }
    const entry = {
      id: randomUUID24(),
      workspaceId: input.workspaceId,
      termCode: input.termCode,
      canonicalTerm: input.canonicalTerm,
      normalizedTerm: input.normalizedTerm,
      language: input.language ?? "neutral",
      hexRepresentation: input.hexRepresentation ?? null,
      semanticGroupId: input.semanticGroupId ?? null,
      aliasesJson,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.db.prepare(`
      INSERT INTO term_registry (
        id, workspaceId, termCode, canonicalTerm, normalizedTerm, language,
        hexRepresentation, semanticGroupId, aliasesJson, description, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id,
      entry.workspaceId,
      entry.termCode,
      entry.canonicalTerm,
      entry.normalizedTerm,
      entry.language,
      entry.hexRepresentation,
      entry.semanticGroupId,
      entry.aliasesJson,
      entry.description,
      entry.createdAt,
      entry.updatedAt
    );
    return entry;
  }
  findByCode(workspaceId, termCode) {
    return this.db.prepare(`
      SELECT * FROM term_registry
      WHERE workspaceId = ? AND termCode = ?
    `).get(workspaceId, termCode);
  }
  findByNormalizedTerm(workspaceId, normalizedTerm) {
    return this.db.prepare(`
      SELECT * FROM term_registry
      WHERE workspaceId = ? AND normalizedTerm = ?
    `).get(workspaceId, normalizedTerm);
  }
  listByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM term_registry
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId);
  }
};
var EmbeddingRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  upsert(input) {
    const existing = this.findByOwner(input.workspaceId, input.ownerType, input.ownerId);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const vectorJson = JSON.stringify(input.vector);
    if (existing) {
      this.db.prepare(`
        UPDATE embeddings
        SET model = ?, dimensions = ?, vectorJson = ?, quantized = ?, compressionScheme = ?
        WHERE id = ?
      `).run(
        input.model,
        input.vector.length,
        vectorJson,
        input.quantized ? 1 : 0,
        input.compressionScheme ?? "none",
        existing.id
      );
      return this.findByOwner(input.workspaceId, input.ownerType, input.ownerId);
    }
    const entry = {
      id: randomUUID24(),
      workspaceId: input.workspaceId,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      model: input.model,
      dimensions: input.vector.length,
      vectorJson,
      quantized: input.quantized ? 1 : 0,
      compressionScheme: input.compressionScheme ?? "none",
      createdAt: now
    };
    this.db.prepare(`
      INSERT INTO embeddings (
        id, workspaceId, ownerType, ownerId, model, dimensions, vectorJson,
        quantized, compressionScheme, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id,
      entry.workspaceId,
      entry.ownerType,
      entry.ownerId,
      entry.model,
      entry.dimensions,
      entry.vectorJson,
      entry.quantized,
      entry.compressionScheme,
      entry.createdAt
    );
    return entry;
  }
  findByOwner(workspaceId, ownerType, ownerId) {
    return this.db.prepare(`
      SELECT * FROM embeddings
      WHERE workspaceId = ? AND ownerType = ? AND ownerId = ?
    `).get(workspaceId, ownerType, ownerId);
  }
  listByWorkspace(workspaceId, ownerType) {
    if (ownerType) {
      return this.db.prepare(`
        SELECT * FROM embeddings
        WHERE workspaceId = ? AND ownerType = ?
      `).all(workspaceId, ownerType);
    }
    return this.db.prepare(`
      SELECT * FROM embeddings
      WHERE workspaceId = ?
    `).all(workspaceId);
  }
};
var SemanticCacheRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  create(input) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const entry = {
      id: randomUUID24(),
      workspaceId: input.workspaceId,
      semanticGroupId: input.semanticGroupId,
      normalizedQuery: normalizeText(input.normalizedQuery),
      embeddingId: input.embeddingId,
      resultPointerUri: input.resultPointerUri,
      confidence: input.confidence,
      sourceKind: input.sourceKind,
      hitCount: 0,
      ttlSeconds: input.ttlSeconds ?? null,
      expiresAt: computeExpiry(input.ttlSeconds),
      createdAt: now,
      lastAccessedAt: now
    };
    this.db.prepare(`
      INSERT INTO semantic_cache (
        id, workspaceId, semanticGroupId, normalizedQuery, embeddingId, resultPointerUri,
        confidence, sourceKind, hitCount, ttlSeconds, expiresAt, createdAt, lastAccessedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id,
      entry.workspaceId,
      entry.semanticGroupId,
      entry.normalizedQuery,
      entry.embeddingId,
      entry.resultPointerUri,
      entry.confidence,
      entry.sourceKind,
      entry.hitCount,
      entry.ttlSeconds,
      entry.expiresAt,
      entry.createdAt,
      entry.lastAccessedAt
    );
    return entry;
  }
  listByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM semantic_cache
      WHERE workspaceId = ?
      ORDER BY lastAccessedAt DESC
    `).all(workspaceId);
  }
  markHit(id) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE semantic_cache
      SET hitCount = hitCount + 1, lastAccessedAt = ?
      WHERE id = ?
    `).run(now, id);
  }
};
var PointerEnvelopeRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  create(input) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const entry = {
      id: randomUUID24(),
      workspaceId: input.workspaceId,
      missionId: input.missionId,
      traceId: input.traceId,
      senderAgent: input.senderAgent,
      receiverAgent: input.receiverAgent,
      taskPointerUri: input.taskPointerUri,
      memoryPointersJson: JSON.stringify(input.memoryPointers),
      artifactPointersJson: JSON.stringify(input.artifactPointers),
      termCodesJson: JSON.stringify(input.termCodes),
      cacheKeysJson: JSON.stringify(input.cacheKeys),
      status: "queued",
      createdAt: now,
      consumedAt: null
    };
    this.db.prepare(`
      INSERT INTO pointer_envelopes (
        id, workspaceId, missionId, traceId, senderAgent, receiverAgent, taskPointerUri,
        memoryPointersJson, artifactPointersJson, termCodesJson, cacheKeysJson, status,
        createdAt, consumedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id,
      entry.workspaceId,
      entry.missionId,
      entry.traceId,
      entry.senderAgent,
      entry.receiverAgent,
      entry.taskPointerUri,
      entry.memoryPointersJson,
      entry.artifactPointersJson,
      entry.termCodesJson,
      entry.cacheKeysJson,
      entry.status,
      entry.createdAt,
      entry.consumedAt
    );
    return entry;
  }
  findById(id) {
    return this.db.prepare(
      "SELECT * FROM pointer_envelopes WHERE id = ?"
    ).get(id);
  }
  listByWorkspace(workspaceId) {
    return this.db.prepare(`
      SELECT * FROM pointer_envelopes
      WHERE workspaceId = ?
      ORDER BY createdAt DESC
    `).all(workspaceId);
  }
  markConsumed(id, status = "consumed") {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      UPDATE pointer_envelopes
      SET status = ?, consumedAt = ?
      WHERE id = ?
    `).run(status, now, id);
  }
};

// src/services/MemoryPointerResolverService.ts
var MemoryPointerResolverService = class {
  db;
  repo;
  constructor(db) {
    this.db = db;
    this.repo = new MemoryPointerRepository(db);
  }
  ensurePointer(input) {
    const pointerUri = input.preferredUri ?? makePointerUri(input.pointerType, input.workspaceId, input.targetTable, input.targetId);
    const contentHash = input.contentForHash !== void 0 ? hashContent(input.contentForHash) : this.hashForTarget(input.targetTable, input.targetId);
    return this.repo.upsert({
      workspaceId: input.workspaceId,
      pointerUri,
      pointerType: input.pointerType,
      targetTable: input.targetTable,
      targetId: input.targetId,
      version: input.version ?? 1,
      contentHash,
      permissions: input.permissions ?? {},
      ttlSeconds: input.ttlSeconds ?? null
    });
  }
  resolve(pointerUri) {
    const pointer = this.repo.findByUri(pointerUri);
    if (!pointer) return void 0;
    const row = this.db.prepare(`SELECT * FROM ${pointer.targetTable} WHERE id = ?`).get(pointer.targetId);
    if (!row) return void 0;
    return row;
  }
  ensureJobTaskPointer(job) {
    return this.ensurePointer({
      workspaceId: job.workspaceId,
      pointerType: "task",
      targetTable: "jobs",
      targetId: job.id,
      preferredUri: `task://mission/${job.workspaceId}/${job.id}`,
      contentForHash: job.payloadJson
    });
  }
  listByWorkspace(workspaceId) {
    return this.repo.listByWorkspace(workspaceId);
  }
  hashForTarget(targetTable, targetId) {
    const row = this.db.prepare(`SELECT * FROM ${targetTable} WHERE id = ?`).get(targetId);
    return hashContent(row ?? { targetTable, targetId });
  }
};

// src/services/TermRegistryService.ts
var TermRegistryService = class {
  repo;
  constructor(db) {
    this.repo = new TermRegistryRepository(db);
  }
  registerTerm(workspaceId, term, options = {}) {
    const normalized = normalizeText(term);
    const termCode = termCodeFor(term);
    return this.repo.upsert({
      workspaceId,
      termCode,
      canonicalTerm: term.trim(),
      normalizedTerm: normalized,
      language: options.language ?? "neutral",
      hexRepresentation: hexEncode(term.trim()),
      semanticGroupId: options.semanticGroupId ?? termCode,
      aliases: options.aliases ?? [],
      description: options.description ?? null
    });
  }
  registerTerms(workspaceId, values) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))].map(
      (value) => this.registerTerm(workspaceId, value)
    );
  }
  findByCode(workspaceId, termCode) {
    return this.repo.findByCode(workspaceId, termCode);
  }
  listByWorkspace(workspaceId) {
    return this.repo.listByWorkspace(workspaceId);
  }
};

// src/services/MemoryAgentService.ts
var IGNORED_MEMORY_AGENTS = /* @__PURE__ */ new Set(["memory-agent", "worker-compliance"]);
var MemoryAgentService = class {
  queueService;
  projectMemoryService;
  learningService;
  pointerResolver;
  termRegistryService;
  constructor(db) {
    this.queueService = new JobQueueService(db);
    this.projectMemoryService = new ProjectMemoryService(db);
    this.learningService = new WorkerLearningService(db);
    this.pointerResolver = new MemoryPointerResolverService(db);
    this.termRegistryService = new TermRegistryService(db);
  }
  enqueueCapture(job, result) {
    if (IGNORED_MEMORY_AGENTS.has(job.agentType)) return void 0;
    return this.queueService.enqueue({
      workspaceId: job.workspaceId,
      agentType: "memory-agent",
      jobType: "capture_worker_memory",
      priority: 6,
      maxRetries: 2,
      payload: {
        sourceJobId: job.id,
        sourceAgentType: job.agentType,
        sourceJobType: job.jobType,
        originalPayload: JSON.parse(job.payloadJson),
        result
      }
    });
  }
  handleCompletion(job, result) {
    if (job.agentType !== "memory-agent") return;
    const payload = JSON.parse(job.payloadJson);
    if (!payload.sourceAgentType || !payload.sourceJobType || !payload.sourceJobId) return;
    const facts = Array.isArray(result.facts) ? result.facts.map((item) => String(item)) : [];
    for (const fact of facts) {
      const memory = this.projectMemoryService.learn(job.workspaceId, "worker-memory", fact, 0.9);
      this.pointerResolver.ensurePointer({
        workspaceId: job.workspaceId,
        pointerType: "memory",
        targetTable: "project_memories",
        targetId: memory.id,
        preferredUri: `mem://ws/${job.workspaceId}/project-memory/${memory.id}`,
        contentForHash: fact
      });
      this.termRegistryService.registerTerm(job.workspaceId, fact, {
        language: "neutral",
        description: `Captured worker memory from ${payload.sourceAgentType}.`
      });
    }
    const learnedSolution = result.learnedSolution && typeof result.learnedSolution === "object" ? result.learnedSolution : void 0;
    if (learnedSolution) {
      const sourceJob = {
        ...job,
        id: payload.sourceJobId,
        agentType: payload.sourceAgentType,
        jobType: payload.sourceJobType,
        payloadJson: JSON.stringify(
          result.signaturePayload ?? payload.originalPayload ?? {}
        )
      };
      this.learningService.learn(sourceJob, learnedSolution);
    }
  }
};

// src/services/ArtifactStoreService.ts
var ArtifactStoreService = class {
  repo;
  constructor(db) {
    this.repo = new ArtifactStoreRepository(db);
  }
  store(workspaceId, artifactType, title, content, options) {
    return this.repo.put({
      workspaceId,
      artifactUri: options.artifactUri,
      artifactType,
      title,
      content,
      mimeType: options.mimeType ?? "application/json",
      metadata: {
        contentHash: hashContent(content),
        ...options.metadata ?? {}
      }
    });
  }
  storeJson(workspaceId, artifactType, title, payload, options) {
    return this.store(workspaceId, artifactType, title, JSON.stringify(payload), {
      artifactUri: options.artifactUri,
      mimeType: "application/json",
      metadata: options.metadata
    });
  }
  storeJobResult(job, result) {
    return this.storeJson(
      job.workspaceId,
      "result",
      `${job.agentType} ${job.jobType} result`,
      result,
      {
        artifactUri: `result://job/${job.id}/output`,
        metadata: { agentType: job.agentType, jobType: job.jobType }
      }
    );
  }
  getByUri(artifactUri) {
    return this.repo.findByUri(artifactUri);
  }
  listByWorkspace(workspaceId) {
    return this.repo.listByWorkspace(workspaceId);
  }
};

// src/services/ContextCacheService.ts
var ContextCacheService = class {
  repo;
  constructor(db) {
    this.repo = new ContextCacheRepository(db);
  }
  cacheKeyForJob(job) {
    return `ctx://${job.agentType}/${job.jobType}/${Buffer.from(stableStringify2(JSON.parse(job.payloadJson))).toString("hex").slice(0, 24)}`;
  }
  warmForJob(job, compactContext, pointerSet, tokenCostSaved = 0) {
    return this.repo.upsert({
      workspaceId: job.workspaceId,
      cacheKey: this.cacheKeyForJob(job),
      agentType: job.agentType,
      jobType: job.jobType,
      normalizedIntent: normalizeText(`${job.agentType} ${job.jobType}`),
      pointerSet,
      compactContext,
      tokenCostSaved,
      ttlSeconds: 60 * 60
    });
  }
  lookup(workspaceId, cacheKey) {
    const entry = this.repo.findByKey(workspaceId, cacheKey);
    if (entry) this.repo.markHit(entry.id);
    return entry;
  }
};

// src/services/EmbeddingIndexService.ts
var EmbeddingIndexService = class {
  repo;
  constructor(db) {
    this.repo = new EmbeddingRepository(db);
  }
  upsertText(workspaceId, ownerType, ownerId, text, options = {}) {
    return this.repo.upsert({
      workspaceId,
      ownerType,
      ownerId,
      model: options.model ?? "local-hash-embed-v1",
      vector: vectorForText(text),
      quantized: options.quantized ?? false,
      compressionScheme: options.compressionScheme ?? "none"
    });
  }
  similarity(left, right) {
    return cosineSimilarity(
      JSON.parse(left.vectorJson),
      JSON.parse(right.vectorJson)
    );
  }
  searchSimilar(workspaceId, ownerType, text, limit = 5) {
    const queryVector = vectorForText(text);
    return this.repo.listByWorkspace(workspaceId, ownerType).map((entry) => ({
      entry,
      score: cosineSimilarity(queryVector, JSON.parse(entry.vectorJson))
    })).sort((a, b) => b.score - a.score).slice(0, limit);
  }
};

// src/services/SemanticCacheService.ts
var SemanticCacheService = class {
  repo;
  embeddings;
  constructor(db) {
    this.repo = new SemanticCacheRepository(db);
    this.embeddings = new EmbeddingIndexService(db);
  }
  remember(workspaceId, query, resultPointerUri, sourceKind, confidence = 0.9) {
    const normalizedQuery = normalizeText(query);
    const embedding = this.embeddings.upsertText(
      workspaceId,
      "semantic-cache",
      resultPointerUri,
      normalizedQuery,
      { compressionScheme: "turboquant-inspired", quantized: true }
    );
    return this.repo.create({
      workspaceId,
      semanticGroupId: termCodeFor(normalizedQuery),
      normalizedQuery,
      embeddingId: embedding.id,
      resultPointerUri,
      confidence,
      sourceKind,
      ttlSeconds: 60 * 60 * 6
    });
  }
  findSimilar(workspaceId, query, threshold = 0.85) {
    const normalizedQuery = normalizeText(query);
    const candidates = this.repo.listByWorkspace(workspaceId);
    const matches = this.embeddings.searchSimilar(workspaceId, "semantic-cache", normalizedQuery, 10);
    const best = matches.find((candidate) => candidate.score >= threshold);
    if (best) {
      const entry = candidates.find((candidate) => candidate.embeddingId === best.entry.id);
      if (entry) {
        this.repo.markHit(entry.id);
        return entry;
      }
    }
    const fallback = candidates.find(
      (candidate) => lexicalSimilarity(candidate.normalizedQuery, normalizedQuery) >= 0.5
    );
    if (!fallback) return void 0;
    this.repo.markHit(fallback.id);
    return fallback;
  }
};
function lexicalSimilarity(left, right) {
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;
  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1;
  }
  return intersection / Math.max(leftTokens.size, rightTokens.size);
}

// src/services/PointerEnvelopeService.ts
import { randomUUID as randomUUID25 } from "node:crypto";
var PointerEnvelopeService = class {
  repo;
  constructor(db) {
    this.repo = new PointerEnvelopeRepository(db);
  }
  create(input) {
    return this.repo.create({
      workspaceId: input.workspaceId,
      missionId: input.missionId ?? `mission-${randomUUID25().slice(0, 8)}`,
      traceId: input.traceId ?? randomUUID25(),
      senderAgent: input.senderAgent,
      receiverAgent: input.receiverAgent,
      taskPointerUri: input.taskPointerUri,
      memoryPointers: input.memoryPointers,
      artifactPointers: input.artifactPointers ?? [],
      termCodes: input.termCodes ?? [],
      cacheKeys: input.cacheKeys ?? []
    });
  }
  markConsumed(id, status = "consumed") {
    this.repo.markConsumed(id, status);
  }
  listByWorkspace(workspaceId) {
    return this.repo.listByWorkspace(workspaceId);
  }
};

// src/services/WorkerPoolService.ts
var __dirname2 = dirname2(fileURLToPath2(import.meta.url));
function sanitizeWorkerExecArgv(execArgv) {
  const sanitized = [];
  for (let i = 0; i < execArgv.length; i++) {
    const arg = execArgv[i];
    if (arg === "--input-type") {
      i += 1;
      continue;
    }
    if (arg.startsWith("--input-type=")) {
      continue;
    }
    sanitized.push(arg);
  }
  return sanitized;
}
var WorkerPoolService = class {
  workers = /* @__PURE__ */ new Map();
  // agentType → workers
  timers = [];
  queueSvc;
  registry;
  researchService;
  routingService;
  auditService;
  contextIndexService;
  complianceService;
  timelineService;
  learningService;
  memoryAgentService;
  projectMemoryService;
  rosterService;
  pointerResolver;
  artifactStoreService;
  contextCacheService;
  termRegistryService;
  semanticCacheService;
  pointerEnvelopeService;
  pollIntervalMs;
  workerScriptPath;
  constructor(db, options = {}) {
    this.queueSvc = new JobQueueService(db);
    this.registry = new WorkerRegistryRepository(db);
    this.researchService = new ResearchBibliographyService(db);
    this.routingService = new ModelRoutingService(db);
    this.auditService = new WorkerAuditService(db);
    this.contextIndexService = new ContextIndexService(db);
    this.complianceService = new WorkerComplianceService(db);
    this.timelineService = new ProjectTimelineService(db);
    this.learningService = new WorkerLearningService(db);
    this.memoryAgentService = new MemoryAgentService(db);
    this.projectMemoryService = new ProjectMemoryService(db);
    this.rosterService = new AgentRosterService(db);
    this.pointerResolver = new MemoryPointerResolverService(db);
    this.artifactStoreService = new ArtifactStoreService(db);
    this.contextCacheService = new ContextCacheService(db);
    this.termRegistryService = new TermRegistryService(db);
    this.semanticCacheService = new SemanticCacheService(db);
    this.pointerEnvelopeService = new PointerEnvelopeService(db);
    this.pollIntervalMs = options.pollIntervalMs ?? 500;
    this.workerScriptPath = options.workerScriptPath ?? join2(__dirname2, "workers/agentWorker.js");
  }
  /** Start N worker threads for a given agentType and begin polling. */
  startPool(agentType, concurrency = 1) {
    const pool = [];
    for (let i = 0; i < concurrency; i++) {
      const workerId = `${agentType}-${randomUUID26().slice(0, 8)}`;
      const registryEntry = this.registry.register(agentType);
      const worker = new Worker(this.workerScriptPath, {
        workerData: { agentType, workerId },
        execArgv: sanitizeWorkerExecArgv(process.execArgv)
      });
      const live = {
        workerId,
        agentType,
        worker,
        busy: false,
        registryId: registryEntry.id,
        currentJob: void 0
      };
      worker.on("message", (msg) => {
        const job = live.currentJob;
        live.busy = false;
        live.currentJob = void 0;
        this.registry.heartbeat(live.registryId, "idle", null);
        this.registry.incrementProcessed(live.registryId);
        if (msg.ok) {
          this.queueSvc.complete(msg.jobId, msg.result, msg.workerId);
          if (job) this.timelineService.recordJobCompleted(job, String(msg.result.summary ?? ""));
          if (job) this.applyResultSideEffects(job, msg.result);
          if (job) this.auditService.handleJobCompletion(job, msg.result);
          if (job) this.complianceService.handleReviewCompletion(job, msg.result);
          if (job) this.memoryAgentService.handleCompletion(job, msg.result);
        } else {
          this.queueSvc.fail(msg.jobId, msg.error, msg.workerId);
          if (job) this.timelineService.recordJobFailed(job, msg.error);
          if (job) this.auditService.recordFailure(job, msg.workerId, msg.error);
        }
      });
      worker.on("error", (err) => {
        const job = live.currentJob;
        live.busy = false;
        live.currentJob = void 0;
        this.registry.heartbeat(live.registryId, "idle", null);
        console.error(`[WorkerPool] worker ${workerId} error:`, err.message);
        if (job) {
          this.queueSvc.fail(job.id, `Worker thread error: ${err.message}`, live.workerId);
          this.timelineService.recordJobFailed(job, `Worker thread error: ${err.message}`);
          this.auditService.recordFailure(job, live.workerId, `Worker thread error: ${err.message}`);
        }
      });
      pool.push(live);
    }
    this.workers.set(agentType, pool);
    const timer = setInterval(() => {
      this.dispatch(agentType);
    }, this.pollIntervalMs);
    this.timers.push(timer);
  }
  dispatch(agentType) {
    const pool = this.workers.get(agentType);
    if (!pool) return;
    const idleWorker = pool.find((w) => !w.busy);
    if (!idleWorker) return;
    const job = this.queueSvc.claimNext(agentType, idleWorker.workerId);
    if (!job) return;
    idleWorker.busy = true;
    idleWorker.currentJob = job;
    this.registry.heartbeat(idleWorker.registryId, "busy", job.id);
    const plan = this.planExecution(job);
    const dispatchContext = this.prepareDispatchContext(job, plan);
    this.timelineService.recordJobStarted(job);
    idleWorker.worker.postMessage({
      jobId: job.id,
      agentType: job.agentType,
      jobType: job.jobType,
      payload: JSON.parse(job.payloadJson),
      workerId: idleWorker.workerId,
      selectedModel: plan.selectedModel,
      learnedSolution: plan.learnedSolution,
      executionMode: plan.mode,
      projectContext: {
        workspaceId: job.workspaceId,
        timeline: plan.projectTimeline,
        memoryFacts: plan.memoryFacts,
        taskPointer: dispatchContext.taskPointerUri,
        memoryPointers: dispatchContext.memoryPointers,
        artifactPointers: dispatchContext.artifactPointers,
        termCodes: dispatchContext.termCodes,
        cacheKeys: dispatchContext.cacheKeys,
        pointerEnvelopeId: dispatchContext.pointerEnvelopeId
      }
    });
    this.pointerEnvelopeService.markConsumed(dispatchContext.pointerEnvelopeId, "dispatched");
  }
  /** Stop all workers and clear timers. */
  stop() {
    for (const timer of this.timers) clearInterval(timer);
    this.timers = [];
    for (const pool of this.workers.values()) {
      for (const live of pool) {
        this.registry.stop(live.registryId);
        live.worker.terminate();
      }
    }
    this.workers.clear();
  }
  activeAgentTypes() {
    return [...this.workers.keys()];
  }
  workerCount(agentType) {
    return this.workers.get(agentType)?.length ?? 0;
  }
  planExecution(job) {
    const learnedPattern = this.learningService.reusableFor(job);
    const complexity = this.learningService.classify(job);
    const agentConfig = this.rosterService.rosterWithConfig(job.workspaceId).find((entry) => entry.agent.name === job.agentType)?.config;
    const localFirst = agentConfig?.localFirst ?? true;
    let mode = "local";
    let selectedModel = null;
    let learnedSolution = null;
    if (learnedPattern) {
      mode = "learned";
      learnedSolution = JSON.parse(learnedPattern.solutionJson);
    } else if (!localFirst || complexity === "high") {
      mode = "ai-assisted";
      selectedModel = this.routingService.recommendForAgent(job.workspaceId, {
        agentType: job.agentType,
        jobType: job.jobType
      }) ?? null;
      if (!selectedModel) {
        mode = "local";
      }
    }
    return {
      complexity,
      mode,
      selectedModel,
      learnedSolution,
      projectTimeline: this.timelineService.recentSummary(job.workspaceId, 8),
      memoryFacts: this.projectMemoryService.summarize(job.workspaceId, 8)
    };
  }
  prepareDispatchContext(job, plan = this.planExecution(job)) {
    const payload = JSON.parse(job.payloadJson);
    const taskPointer = this.pointerResolver.ensureJobTaskPointer(job);
    const memoryPointers = this.projectMemoryService.recall(job.workspaceId).slice(0, 8).map(
      (memory) => this.pointerResolver.ensurePointer({
        workspaceId: job.workspaceId,
        pointerType: "memory",
        targetTable: "project_memories",
        targetId: memory.id,
        preferredUri: `mem://ws/${job.workspaceId}/project-memory/${memory.id}`,
        contentForHash: memory.fact
      }).pointerUri
    );
    const termCodes = this.termRegistryService.registerTerms(job.workspaceId, [job.agentType, job.jobType, ...Object.keys(payload)]).map((term) => term.termCode);
    const cacheKeys = [this.contextCacheService.cacheKeyForJob(job)];
    const envelope = this.pointerEnvelopeService.create({
      workspaceId: job.workspaceId,
      senderAgent: "orchestrator",
      receiverAgent: job.agentType,
      taskPointerUri: taskPointer.pointerUri,
      memoryPointers,
      termCodes,
      cacheKeys,
      missionId: `mission-${job.id}`,
      traceId: job.id
    });
    const compactContext = JSON.stringify({
      timeline: plan.projectTimeline,
      memoryFacts: plan.memoryFacts,
      taskPointer: taskPointer.pointerUri,
      pointerEnvelopeId: envelope.id
    });
    this.contextCacheService.warmForJob(
      job,
      compactContext,
      {
        taskPointerUri: taskPointer.pointerUri,
        memoryPointers,
        artifactPointers: [],
        envelopeId: envelope.id
      },
      compactContext.length
    );
    return {
      taskPointerUri: taskPointer.pointerUri,
      memoryPointers,
      artifactPointers: [],
      termCodes,
      cacheKeys,
      pointerEnvelopeId: envelope.id,
      compactContext
    };
  }
  applyResultSideEffects(job, result) {
    const resultArtifact = this.artifactStoreService.storeJobResult(job, result);
    const resultPointer = this.pointerResolver.ensurePointer({
      workspaceId: job.workspaceId,
      pointerType: "result",
      targetTable: "artifact_store",
      targetId: resultArtifact.id,
      preferredUri: resultArtifact.artifactUri,
      contentForHash: result
    });
    this.semanticCacheService.remember(
      job.workspaceId,
      `${job.agentType} ${job.jobType} ${JSON.stringify(JSON.parse(job.payloadJson))}`,
      resultPointer.pointerUri,
      job.agentType
    );
    this.termRegistryService.registerTerms(job.workspaceId, [
      job.agentType,
      job.jobType,
      ...Object.keys(result)
    ]);
    this.contextCacheService.warmForJob(
      job,
      JSON.stringify({
        summary: String(result.summary ?? ""),
        resultPointer: resultPointer.pointerUri
      }),
      {
        taskPointerUri: this.pointerResolver.ensureJobTaskPointer(job).pointerUri,
        memoryPointers: [],
        artifactPointers: [resultPointer.pointerUri]
      },
      JSON.stringify(result).length
    );
    if (job.agentType === "context-storage-worker") {
      this.contextIndexService.syncWorkspace(job.workspaceId);
    }
    if (job.agentType === "web-researcher") {
      const findings = Array.isArray(result.findings) ? result.findings : [];
      for (const finding of findings) {
        if (typeof finding !== "object" || finding === null) continue;
        const title = typeof finding.title === "string" ? finding.title : void 0;
        const url = typeof finding.url === "string" ? finding.url : void 0;
        if (!title || !url) continue;
        this.researchService.add({
          workspaceId: job.workspaceId,
          title,
          kind: "daily-model-research",
          url,
          notes: typeof finding.snippet === "string" ? finding.snippet : null,
          tagsJson: JSON.stringify(
            [job.agentType, typeof finding.capability === "string" ? finding.capability : "research"]
          )
        });
      }
    }
    if (job.agentType === "web-researcher" || job.agentType === "agent-recruiter") {
      this.routingService.applyResearchResult(job.workspaceId, job.agentType, job.id, result);
    }
    const complianceJob = this.complianceService.queueReviewForJob(job, result);
    if (complianceJob && !this.activeAgentTypes().includes("worker-compliance")) {
      this.startPool("worker-compliance", 1);
    }
    const memoryJob = this.memoryAgentService.enqueueCapture(job, result);
    if (memoryJob && !this.activeAgentTypes().includes("memory-agent")) {
      this.startPool("memory-agent", 1);
    }
  }
};

// src/services/DailyResearchSchedulerService.ts
var DEFAULT_RESEARCH_SOURCES = [
  {
    title: "Anthropic models",
    url: "https://docs.anthropic.com/en/docs/about-claude/models",
    capability: "coding"
  },
  {
    title: "OpenAI models",
    url: "https://platform.openai.com/docs/models",
    capability: "administrative_reporting"
  },
  {
    title: "Gemini models",
    url: "https://ai.google.dev/gemini-api/docs/models",
    capability: "graphic_design"
  }
];
var DailyResearchSchedulerService = class {
  scheduleRepo;
  jobRepo;
  queueService;
  auditRepo;
  constructor(db) {
    this.scheduleRepo = new JobScheduleRepository(db);
    this.jobRepo = new JobRepository(db);
    this.queueService = new JobQueueService(db);
    this.auditRepo = new WorkerAuditRepository(db);
  }
  ensureDailySchedules(workspaceId, roster) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return [
      this.scheduleRepo.upsert({
        workspaceId,
        agentType: "worker-auditor",
        jobType: "daily_worker_audit",
        cadenceHours: 24,
        nextRunAt: now,
        payload: {
          objective: "Review workers with the highest recent failure volume and flag reliability hotspots.",
          threshold: 3
        }
      }),
      this.scheduleRepo.upsert({
        workspaceId,
        agentType: "context-storage-worker",
        jobType: "daily_context_index",
        cadenceHours: 24,
        nextRunAt: now,
        payload: {
          objective: "Reindex local AI context and project artifacts for fast retrieval.",
          changedSources: ["conversations", "tasks", "decisions", "project_memories", "research_references"]
        }
      }),
      this.scheduleRepo.upsert({
        workspaceId,
        agentType: "web-researcher",
        jobType: "daily_model_landscape",
        cadenceHours: 24,
        nextRunAt: now,
        payload: {
          objective: "Track model and benchmark changes across providers.",
          focusAreas: ["coding", "graphic_design", "administrative_reporting", "financial_reporting"],
          sources: DEFAULT_RESEARCH_SOURCES
        }
      }),
      this.scheduleRepo.upsert({
        workspaceId,
        agentType: "agent-recruiter",
        jobType: "daily_model_routing",
        cadenceHours: 24,
        nextRunAt: now,
        payload: {
          objective: "Assign the best current model to each worker agent.",
          roster: roster.map((agent) => ({
            agentType: agent.agentType,
            role: agent.role,
            capabilities: agent.capabilities
          })),
          businessDomains: ["software-development", "devops", "graphic_design", "financial_reporting"]
        }
      })
    ];
  }
  enqueueDueSchedules(now = /* @__PURE__ */ new Date()) {
    const timestamp = now.toISOString();
    const dueSchedules = this.scheduleRepo.due(timestamp);
    const enqueued = [];
    for (const schedule of dueSchedules) {
      if (this.jobRepo.hasActiveJob(schedule.workspaceId, schedule.agentType, schedule.jobType)) {
        continue;
      }
      const payload = JSON.parse(schedule.payloadJson);
      const enrichedPayload = schedule.agentType === "worker-auditor" && schedule.jobType === "daily_worker_audit" ? {
        ...payload,
        leaders: this.auditRepo.topFailingAgents(schedule.workspaceId, 5).map((entry) => ({
          auditedAgentType: entry.auditedAgentType,
          failureCount: entry.failureCount,
          lastError: entry.lastError,
          status: entry.status
        }))
      } : payload;
      const job = this.queueService.enqueue({
        workspaceId: schedule.workspaceId,
        agentType: schedule.agentType,
        jobType: schedule.jobType,
        priority: 8,
        maxRetries: 2,
        payload: {
          ...enrichedPayload,
          scheduleId: schedule.id,
          scheduledBy: "daily-research-scheduler"
        }
      });
      const nextRunAt = new Date(
        now.getTime() + schedule.cadenceHours * 60 * 60 * 1e3
      ).toISOString();
      this.scheduleRepo.markEnqueued(schedule.id, timestamp, nextRunAt);
      enqueued.push(job);
    }
    return enqueued;
  }
  listSchedules(workspaceId) {
    return this.scheduleRepo.findByWorkspace(workspaceId);
  }
};

// src/adapters/agentAdapter.ts
var StubAgentAdapter = class {
  sourceAgent;
  constructor(sourceAgent) {
    this.sourceAgent = sourceAgent;
  }
  async capture() {
    return {
      sourceAgent: this.sourceAgent,
      title: "stub-capture",
      messages: []
    };
  }
  describe() {
    return {
      adapterType: this.sourceAgent,
      supportsCrossAgentContinuity: true,
      captureMode: "manual"
    };
  }
};
var ManualImportAdapter = class {
  captured;
  adapterType;
  constructor(captured, adapterType = "manual_import") {
    this.captured = captured;
    this.adapterType = adapterType;
  }
  async capture() {
    return this.captured;
  }
  describe() {
    return {
      adapterType: this.adapterType,
      supportsCrossAgentContinuity: true,
      captureMode: "manual"
    };
  }
};

// src/adapters/adapterRegistry.ts
var AdapterRegistry = class {
  adapters = /* @__PURE__ */ new Map();
  constructor() {
    this.registerDefaults();
  }
  registerDefaults() {
    const stubs = [
      { key: "copilot", name: "GitHub Copilot" },
      { key: "cursor", name: "Cursor AI" },
      { key: "chatgpt", name: "ChatGPT" },
      { key: "claude-code", name: "Claude Code" }
    ];
    for (const { key, name } of stubs) {
      this.register({
        key,
        displayName: name,
        capabilities: ["capture", "import"],
        isStub: true,
        adapter: new StubAgentAdapter(key)
      });
    }
    this.register({
      key: "manual_import",
      displayName: "Manual Import",
      capabilities: ["import", "normalize"],
      isStub: false,
      adapter: new ManualImportAdapter({ sourceAgent: "manual_import", messages: [] })
    });
  }
  register(entry) {
    this.adapters.set(entry.key, entry);
  }
  get(key) {
    return this.adapters.get(key);
  }
  list() {
    return Array.from(this.adapters.values());
  }
  getAdapter(key) {
    return this.adapters.get(key)?.adapter;
  }
  withCapability(cap) {
    return this.list().filter((a) => a.capabilities.includes(cap));
  }
  createManualImport(captured) {
    return new ManualImportAdapter(captured, "manual_import");
  }
};
var defaultRegistry = new AdapterRegistry();

// src/hub.ts
var DEFAULT_BUDGET = {
  pendingTasks: 500,
  memoryFacts: 300,
  precedentHints: 300,
  conversationDelta: 900,
  projectSummary: 50,
  recentDecisions: 120,
  recentChanges: 120,
  skillsHints: 120,
  repositoryConstraints: 80,
  suggestedNextSteps: 80
};

// src/extension.ts
function resolveDbPath(context) {
  const config = vscode9.workspace.getConfiguration("aihub");
  const custom = config.get("dbPath");
  if (custom && custom.trim()) return custom.trim();
  const storageDir = context.globalStorageUri.fsPath;
  fs.mkdirSync(storageDir, { recursive: true });
  return path.join(storageDir, "continuity.sqlite");
}
function resolveWorkspacePath() {
  return vscode9.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}
function registerProviders(db, workspaceId) {
  return {
    memory: new ProjectMemoryProvider(db, workspaceId),
    tasks: new PendingTasksProvider(db, workspaceId),
    changelog: new ChangeLogProvider(db, workspaceId),
    progress: new PromptProgressProvider(db, workspaceId),
    agents: new AgentsProvider(db, workspaceId),
    conversations: new ConversationsProvider(db, workspaceId),
    skills: new SkillsProvider(db, workspaceId),
    jobQueue: new JobQueueProvider(db, workspaceId)
  };
}
function refreshAll(providers) {
  providers.memory.refresh();
  providers.tasks.refresh();
  providers.changelog.refresh();
  providers.progress.refresh();
  providers.agents.refresh();
  providers.conversations.refresh();
  providers.skills.refresh();
  providers.jobQueue.refresh();
}
function activate(context) {
  const dbPath = resolveDbPath(context);
  const db = openDatabase(dbPath);
  const wsPath = resolveWorkspacePath();
  const wsName = path.basename(wsPath);
  const wsResolver = new WorkspaceResolverService(db);
  const workspace2 = wsResolver.resolve(wsPath, wsName);
  const hub = new AgentContinuityHubService(db);
  const contextSvc = new ContextPacketBuilderService(db, DEFAULT_BUDGET);
  const metricsSvc = new MetricsInstrumentationService(db);
  const coverageSvc = new PromptCoverageService(db);
  const taskExtractor = new TaskExtractionService(db);
  const auditSvc = new ChangeAuditService(db);
  const captureSvc = new ConversationCaptureService(db);
  const jobQueueSvc = new JobQueueService(db);
  const rosterSvc = new AgentRosterService(db);
  const workerPool = new WorkerPoolService(db);
  const dailyResearchSvc = new DailyResearchSchedulerService(db);
  const routingSvc = new ModelRoutingService(db);
  _workerPool = workerPool;
  const providers = registerProviders(db, workspace2.id);
  const ensurePool = (agentName) => {
    const agent = rosterSvc.findByAgentType(workspace2.id, agentName);
    if (!agent) return;
    const config = JSON.parse(agent.configJson);
    if (!workerPool.activeAgentTypes().includes(agentName)) {
      workerPool.startPool(agentName, config.maxConcurrent ?? 1);
    }
  };
  const seedDailyResearch = () => {
    const roster = rosterSvc.rosterWithConfig(workspace2.id);
    dailyResearchSvc.ensureDailySchedules(
      workspace2.id,
      roster.map(({ agent, config }) => ({
        agentType: agent.name,
        role: config.role,
        capabilities: config.capabilities,
        config
      }))
    );
  };
  const enqueueDueResearch = () => {
    const dueJobs = dailyResearchSvc.enqueueDueSchedules();
    if (dueJobs.length > 0) {
      ensurePool("worker-auditor");
      ensurePool("context-storage-worker");
      ensurePool("web-researcher");
      ensurePool("agent-recruiter");
      providers.jobQueue.refresh();
      providers.agents.refresh();
    }
  };
  vscode9.window.registerTreeDataProvider("aihub.projectMemory", providers.memory);
  vscode9.window.registerTreeDataProvider("aihub.pendingTasks", providers.tasks);
  vscode9.window.registerTreeDataProvider("aihub.changelog", providers.changelog);
  vscode9.window.registerTreeDataProvider("aihub.promptProgress", providers.progress);
  vscode9.window.registerTreeDataProvider("aihub.agents", providers.agents);
  vscode9.window.registerTreeDataProvider("aihub.conversations", providers.conversations);
  vscode9.window.registerTreeDataProvider("aihub.skills", providers.skills);
  vscode9.window.registerTreeDataProvider("aihub.jobQueue", providers.jobQueue);
  const cmds = [
    vscode9.commands.registerCommand("aihub.openProjectMemory", () => {
      vscode9.commands.executeCommand("workbench.view.extension.aihub-sidebar");
    }),
    vscode9.commands.registerCommand("aihub.refresh", () => {
      refreshAll(providers);
      vscode9.window.setStatusBarMessage("$(sync) AIHUB refreshed", 2e3);
    }),
    vscode9.commands.registerCommand("aihub.showPendingTasks", () => {
      vscode9.commands.executeCommand("aihub.pendingTasks.focus");
    }),
    vscode9.commands.registerCommand("aihub.showChangeLog", () => {
      vscode9.commands.executeCommand("aihub.changelog.focus");
    }),
    vscode9.commands.registerCommand("aihub.showPromptProgress", () => {
      vscode9.commands.executeCommand("aihub.promptProgress.focus");
    }),
    vscode9.commands.registerCommand("aihub.importConversation", async () => {
      const adapterKey = await vscode9.window.showQuickPick(
        defaultRegistry.list().map((a) => ({ label: a.displayName, description: a.key })),
        { title: "Select source agent" }
      );
      if (!adapterKey) return;
      const content = await vscode9.window.showInputBox({
        title: "Paste conversation content",
        prompt: "Paste the full conversation text to import",
        ignoreFocusOut: true
      });
      if (!content) return;
      const adapter = defaultRegistry.createManualImport({
        sourceAgent: "manual_import",
        title: `Import from ${adapterKey.label}`,
        messages: [{ role: "user", content }]
      });
      await captureSvc.captureFromAdapter(workspace2.id, adapter);
      refreshAll(providers);
      vscode9.window.showInformationMessage("Conversation imported successfully.");
    }),
    vscode9.commands.registerCommand("aihub.extractTasks", async () => {
      const editor = vscode9.window.activeTextEditor;
      const text = editor?.document.getText() ?? "";
      if (!text.trim()) {
        vscode9.window.showWarningMessage("Open a file or editor with conversation text first.");
        return;
      }
      const epic = await vscode9.window.showInputBox({
        title: "Epic name",
        prompt: "Which epic do these tasks belong to?",
        value: "general"
      });
      if (!epic) return;
      const tasks = taskExtractor.extractFromText(workspace2.id, epic, text);
      refreshAll(providers);
      vscode9.window.showInformationMessage(`Extracted ${tasks.length} tasks.`);
    }),
    vscode9.commands.registerCommand("aihub.startContextualChat", async () => {
      const snapshot = hub.buildContinuitySnapshot(workspace2.id, {});
      const taskLines = snapshot.pendingTasks.map(
        (t) => `- [${t.status}] ${t.title}`
      );
      const skillLines = snapshot.skills.map(
        (s) => `- ${s.name}: ${s.skillBody ?? ""}`.slice(0, 120)
      );
      const changeLines = auditSvc.summarize(workspace2.id, 5);
      const blocks = [
        `# Agent Continuity Hub \u2014 Context Packet`,
        `Workspace: ${wsName}`,
        `Path: ${wsPath}`,
        ``,
        `## Pending Tasks (${snapshot.pendingTasks.length})`,
        ...taskLines,
        ``,
        `## Skills Active (${snapshot.skills.length})`,
        ...skillLines,
        ``,
        `## Recent Changes`,
        ...changeLines.map((c) => `- ${c}`),
        ``,
        `## Coverage: ${snapshot.coverage.overallPercent.toFixed(1)}%`,
        `Token savings: ${(snapshot.dashboard.tokenSavingsRatio * 100).toFixed(1)}%`,
        `Budget used: ${snapshot.packet.budgetUsed} chars`
      ];
      const contextText = blocks.join("\n");
      await vscode9.env.clipboard.writeText(contextText);
      metricsSvc.record(workspace2.id, {
        rawContextTokens: snapshot.packet.budgetUsed * 4,
        compactedTokens: Math.round(snapshot.packet.budgetUsed * 0.4)
      });
      vscode9.window.showInformationMessage(
        `Context packet copied (${snapshot.packet.budgetUsed} chars). Paste into your AI chat.`
      );
    }),
    vscode9.commands.registerCommand("aihub.rebuildMemoryIndex", async () => {
      await vscode9.window.withProgress(
        { location: vscode9.ProgressLocation.Notification, title: "Rebuilding memory index..." },
        async () => {
          wsResolver.resolve(wsPath, wsName);
          refreshAll(providers);
        }
      );
      vscode9.window.showInformationMessage("Memory index rebuilt.");
    }),
    vscode9.commands.registerCommand("aihub.showJobQueue", () => {
      vscode9.commands.executeCommand("aihub.jobQueue.focus");
    }),
    vscode9.commands.registerCommand("aihub.ensureRoster", () => {
      const agents = rosterSvc.ensureRoster(workspace2.id);
      providers.agents.refresh();
      routingSvc.ensureDefaults(workspace2.id);
      seedDailyResearch();
      for (const agent of agents) {
        const cfg = JSON.parse(agent.configJson);
        const concurrency = cfg.maxConcurrent ?? 1;
        if (!workerPool.activeAgentTypes().includes(agent.name)) {
          workerPool.startPool(agent.name, concurrency);
        }
      }
      providers.jobQueue.refresh();
      vscode9.window.showInformationMessage(
        `Seeded ${agents.length} agents and started worker pool.`
      );
    }),
    vscode9.commands.registerCommand("aihub.enqueueJob", async () => {
      const agentTypes = rosterSvc.rosterWithConfig(workspace2.id).map(({ agent, config }) => ({
        label: agent.name,
        description: config.role
      }));
      const pick = await vscode9.window.showQuickPick(agentTypes, {
        title: "Select agent type"
      });
      if (!pick) return;
      const jobType = await vscode9.window.showInputBox({
        title: "Job type",
        prompt: "e.g. code_review, deploy, incident_response",
        value: "analysis"
      });
      if (!jobType) return;
      const payloadRaw = await vscode9.window.showInputBox({
        title: "Payload (JSON)",
        prompt: "Job payload as JSON object",
        value: "{}",
        ignoreFocusOut: true
      });
      if (payloadRaw === void 0) return;
      let payload;
      try {
        payload = JSON.parse(payloadRaw);
      } catch {
        vscode9.window.showErrorMessage("Invalid JSON payload.");
        return;
      }
      const job = jobQueueSvc.enqueue({
        workspaceId: workspace2.id,
        agentType: pick.label,
        jobType,
        payload,
        priority: 5
      });
      ensurePool(pick.label);
      providers.jobQueue.refresh();
      providers.agents.refresh();
      vscode9.window.showInformationMessage(
        `Job ${job.id.slice(0, 8)} enqueued for ${pick.label}.`
      );
    }),
    vscode9.commands.registerCommand("aihub.runDailyResearch", () => {
      seedDailyResearch();
      enqueueDueResearch();
      vscode9.window.showInformationMessage("Daily worker governance and model research jobs queued.");
    }),
    vscode9.commands.registerCommand("aihub.preChangePrecedentLookup", async () => {
      const intent = await vscode9.window.showInputBox({
        title: "Describe the change you are about to make",
        prompt: "What are you implementing? (e.g. 'add JWT authentication')",
        ignoreFocusOut: true
      });
      if (!intent) return;
      const result = hub.buildContinuitySnapshot(workspace2.id, {
        intent: { intent, stack: "unknown", filesAffected: [] }
      });
      const precedent = result.packet;
      if (!result) {
        vscode9.window.showInformationMessage("No similar precedent found for this change.");
        return;
      }
      const panel = vscode9.window.createWebviewPanel(
        "aihub.precedentView",
        "Precedent Found",
        vscode9.ViewColumn.Beside,
        {}
      );
      panel.webview.html = buildPrecedentHtml(intent, precedent);
      auditSvc.record({
        workspaceId: workspace2.id,
        changeType: "refactor",
        title: `Pre-change lookup: ${intent}`,
        reason: "Precedent lookup before implementing change",
        agentId: "user",
        filesAffected: []
      });
    })
  ];
  context.subscriptions.push(...cmds);
  vscode9.workspace.onDidChangeWorkspaceFolders(() => {
    const newPath = resolveWorkspacePath();
    const newName = path.basename(newPath);
    const newWs = wsResolver.resolve(newPath, newName);
    refreshAll(providers);
    Object.values(providers).forEach(
      (p) => p.refresh(newWs.id)
    );
  });
  coverageSvc.ensureDefaultCoverage(workspace2.id);
  rosterSvc.ensureRoster(workspace2.id);
  routingSvc.ensureDefaults(workspace2.id);
  seedDailyResearch();
  enqueueDueResearch();
  ensurePool("memory-agent");
  ensurePool("worker-auditor");
  ensurePool("worker-police");
  ensurePool("worker-judge");
  ensurePool("worker-compliance");
  ensurePool("context-storage-worker");
  ensurePool("web-researcher");
  ensurePool("agent-recruiter");
  const researchTimer = setInterval(() => {
    enqueueDueResearch();
  }, 60 * 60 * 1e3);
  context.subscriptions.push({ dispose: () => workerPool.stop() });
  context.subscriptions.push({ dispose: () => clearInterval(researchTimer) });
}
var _workerPool;
function deactivate() {
  _workerPool?.stop();
}
function buildPrecedentHtml(intent, precedent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Precedent</title>
  <style>
    body { font-family: var(--vscode-font-family); padding: 1rem; }
    h2 { color: var(--vscode-textLink-foreground); }
    pre { background: var(--vscode-textCodeBlock-background); padding: 0.5rem; border-radius: 4px; }
    .label { font-weight: bold; color: var(--vscode-textPreformat-foreground); }
  </style>
</head>
<body>
  <h2>Precedent Found for: ${escapeHtml(intent)}</h2>
  <p class="label">Intent:</p><p>${escapeHtml(String(precedent.intent ?? ""))}</p>
  <p class="label">Implementation:</p>
  <pre>${escapeHtml(JSON.stringify(precedent, null, 2))}</pre>
</body>
</html>`;
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export {
  activate,
  deactivate
};
//# sourceMappingURL=extension.js.map
