"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode6 = __toESM(require("vscode"), 1);
var path = __toESM(require("path"), 1);
var fs = __toESM(require("fs"), 1);

// src/storage/Database.ts
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");
var import_node_url = require("node:url");
var import_meta = {};
var __dirname = (0, import_node_path.dirname)((0, import_node_url.fileURLToPath)(import_meta.url));
var MIGRATIONS_DIR = (0, import_node_path.join)(__dirname, "migrations");
function openDatabase(dbPath) {
  const db = new import_better_sqlite3.default(dbPath);
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
  const files = (0, import_node_fs.readdirSync)(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  const insertMigration = db.prepare(
    "INSERT INTO schema_migrations (version, appliedAt) VALUES (?, ?)"
  );
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = (0, import_node_fs.readFileSync)((0, import_node_path.join)(MIGRATIONS_DIR, file), "utf8");
    db.exec(sql);
    insertMigration.run(file, (/* @__PURE__ */ new Date()).toISOString());
  }
}

// src/storage/repositories/AgentRepository.ts
var import_node_crypto = require("node:crypto");
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
      id: (0, import_node_crypto.randomUUID)(),
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
var import_node_crypto2 = require("node:crypto");
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
      id: (0, import_node_crypto2.randomUUID)(),
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
var import_node_crypto3 = require("node:crypto");
var import_node_path2 = require("node:path");
var WorkspaceResolverService = class {
  repo;
  constructor(db) {
    this.repo = new WorkspaceRepository(db);
  }
  resolve(rootPath, name) {
    return this.resolveWorkspace({ rootPath, name });
  }
  resolveWorkspace(input) {
    const normalizedPath = (0, import_node_path2.normalize)((0, import_node_path2.resolve)(input.rootPath));
    const repoRootPath = (0, import_node_path2.normalize)((0, import_node_path2.resolve)(input.repoRootPath ?? input.rootPath));
    const descriptor = {
      rootPath: input.rootPath,
      name: input.name ?? ((0, import_node_path2.basename)(normalizedPath) || "workspace"),
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
    return (0, import_node_crypto3.createHash)("sha256").update(value).digest("hex");
  }
};

// src/storage/repositories/ConversationRepository.ts
var import_node_crypto4 = require("node:crypto");
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
      id: (0, import_node_crypto4.randomUUID)(),
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
var import_node_crypto5 = require("node:crypto");
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
      id: (0, import_node_crypto5.randomUUID)(),
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
var import_node_crypto6 = require("node:crypto");
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
      id: (0, import_node_crypto6.randomUUID)(),
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
var import_node_crypto7 = require("node:crypto");
var SessionMemoryService = class {
  db;
  msgRepo;
  constructor(db) {
    this.db = db;
    this.msgRepo = new MessageRepository(db);
  }
  record(conversationId, workspaceId, category, fact, confidence = 1) {
    const memory = {
      id: (0, import_node_crypto7.randomUUID)(),
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
    return (0, import_node_crypto7.createHash)("sha256").update(content).digest("hex");
  }
};

// src/storage/repositories/TaskRepository.ts
var import_node_crypto8 = require("node:crypto");
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
      id: (0, import_node_crypto8.randomUUID)(),
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
      id: (0, import_node_crypto8.randomUUID)(),
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
var import_node_crypto9 = require("node:crypto");
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
      id: (0, import_node_crypto9.randomUUID)(),
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
          linkStmt.run((0, import_node_crypto9.randomUUID)(), entry.id, f.filePath, f.action);
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
var import_node_crypto11 = require("node:crypto");

// src/storage/repositories/ImplementationPrecedentRepository.ts
var import_node_crypto10 = require("node:crypto");
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
      id: (0, import_node_crypto10.randomUUID)(),
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
    return (0, import_node_crypto11.createHash)("sha256").update(seed).digest("hex");
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
var import_node_crypto12 = require("node:crypto");
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
      id: (0, import_node_crypto12.randomUUID)(),
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
var import_node_crypto13 = require("node:crypto");
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
    const contentHash = (0, import_node_crypto13.createHash)("sha256").update(rawOutput).digest("hex");
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
var import_node_crypto14 = require("node:crypto");
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
      id: (0, import_node_crypto14.randomUUID)(),
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
          blockStmt.run((0, import_node_crypto14.randomUUID)(), packet.id, b.blockType, b.content, b.tokenEstimate ?? 0);
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
var import_node_crypto15 = require("node:crypto");
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
      id: (0, import_node_crypto15.randomUUID)(),
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
      id: (0, import_node_crypto15.randomUUID)(),
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
var import_node_crypto16 = require("node:crypto");
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
      id: (0, import_node_crypto16.randomUUID)(),
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
var import_node_crypto17 = require("node:crypto");
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
      id: (0, import_node_crypto17.randomUUID)(),
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
var import_node_crypto18 = require("node:crypto");
var MetricsRepository = class {
  db;
  constructor(db) {
    this.db = db;
  }
  recordSnapshot(workspaceId, tokensBaseline, tokensOptimized) {
    const savingsRatio = tokensBaseline > 0 ? Math.max(0, Math.min(1, 1 - tokensOptimized / tokensBaseline)) : 0;
    const snapshot = {
      id: (0, import_node_crypto18.randomUUID)(),
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
    const metric = { id: (0, import_node_crypto18.randomUUID)(), ...input };
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
var vscode = __toESM(require("vscode"), 1);
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
var vscode2 = __toESM(require("vscode"), 1);
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
var vscode3 = __toESM(require("vscode"), 1);
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
var vscode4 = __toESM(require("vscode"), 1);

// src/storage/repositories/PromptExecutionRepository.ts
var import_node_crypto19 = require("node:crypto");
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
      id: (0, import_node_crypto19.randomUUID)(),
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
      id: (0, import_node_crypto19.randomUUID)(),
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
var vscode5 = __toESM(require("vscode"), 1);
var AgentItem = class extends vscode5.TreeItem {
  constructor(agent) {
    super(agent.name, vscode5.TreeItemCollapsibleState.None);
    this.agent = agent;
    this.contextValue = "agentItem";
    this.iconPath = new vscode5.ThemeIcon("robot");
    this.description = agent.adapterType;
    this.tooltip = `Adapter: ${agent.adapterType}`;
  }
};
var AgentsProvider = class {
  constructor(db, workspaceId) {
    this.db = db;
    this.workspaceId = workspaceId;
    this.repo = new AgentRepository(db);
  }
  _onDidChangeTreeData = new vscode5.EventEmitter();
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
    return this.repo.findByWorkspace(this.workspaceId).map((a) => new AgentItem(a));
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
  const config = vscode6.workspace.getConfiguration("aihub");
  const custom = config.get("dbPath");
  if (custom && custom.trim()) return custom.trim();
  const storageDir = context.globalStorageUri.fsPath;
  fs.mkdirSync(storageDir, { recursive: true });
  return path.join(storageDir, "continuity.sqlite");
}
function resolveWorkspacePath() {
  return vscode6.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}
function registerProviders(db, workspaceId) {
  return {
    memory: new ProjectMemoryProvider(db, workspaceId),
    tasks: new PendingTasksProvider(db, workspaceId),
    changelog: new ChangeLogProvider(db, workspaceId),
    progress: new PromptProgressProvider(db, workspaceId),
    agents: new AgentsProvider(db, workspaceId)
  };
}
function refreshAll(providers) {
  providers.memory.refresh();
  providers.tasks.refresh();
  providers.changelog.refresh();
  providers.progress.refresh();
  providers.agents.refresh();
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
  const providers = registerProviders(db, workspace2.id);
  vscode6.window.registerTreeDataProvider("aihub.projectMemory", providers.memory);
  vscode6.window.registerTreeDataProvider("aihub.pendingTasks", providers.tasks);
  vscode6.window.registerTreeDataProvider("aihub.changelog", providers.changelog);
  vscode6.window.registerTreeDataProvider("aihub.promptProgress", providers.progress);
  vscode6.window.registerTreeDataProvider("aihub.agents", providers.agents);
  const cmds = [
    vscode6.commands.registerCommand("aihub.openProjectMemory", () => {
      vscode6.commands.executeCommand("workbench.view.extension.aihub-sidebar");
    }),
    vscode6.commands.registerCommand("aihub.refresh", () => {
      refreshAll(providers);
      vscode6.window.setStatusBarMessage("$(sync) AIHUB refreshed", 2e3);
    }),
    vscode6.commands.registerCommand("aihub.showPendingTasks", () => {
      vscode6.commands.executeCommand("aihub.pendingTasks.focus");
    }),
    vscode6.commands.registerCommand("aihub.showChangeLog", () => {
      vscode6.commands.executeCommand("aihub.changelog.focus");
    }),
    vscode6.commands.registerCommand("aihub.showPromptProgress", () => {
      vscode6.commands.executeCommand("aihub.promptProgress.focus");
    }),
    vscode6.commands.registerCommand("aihub.importConversation", async () => {
      const adapterKey = await vscode6.window.showQuickPick(
        defaultRegistry.list().map((a) => ({ label: a.displayName, description: a.key })),
        { title: "Select source agent" }
      );
      if (!adapterKey) return;
      const content = await vscode6.window.showInputBox({
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
      vscode6.window.showInformationMessage("Conversation imported successfully.");
    }),
    vscode6.commands.registerCommand("aihub.extractTasks", async () => {
      const editor = vscode6.window.activeTextEditor;
      const text = editor?.document.getText() ?? "";
      if (!text.trim()) {
        vscode6.window.showWarningMessage("Open a file or editor with conversation text first.");
        return;
      }
      const epic = await vscode6.window.showInputBox({
        title: "Epic name",
        prompt: "Which epic do these tasks belong to?",
        value: "general"
      });
      if (!epic) return;
      const tasks = taskExtractor.extractFromText(workspace2.id, epic, text);
      refreshAll(providers);
      vscode6.window.showInformationMessage(`Extracted ${tasks.length} tasks.`);
    }),
    vscode6.commands.registerCommand("aihub.startContextualChat", async () => {
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
      await vscode6.env.clipboard.writeText(contextText);
      metricsSvc.record(workspace2.id, {
        rawContextTokens: snapshot.packet.budgetUsed * 4,
        compactedTokens: Math.round(snapshot.packet.budgetUsed * 0.4)
      });
      vscode6.window.showInformationMessage(
        `Context packet copied (${snapshot.packet.budgetUsed} chars). Paste into your AI chat.`
      );
    }),
    vscode6.commands.registerCommand("aihub.rebuildMemoryIndex", async () => {
      await vscode6.window.withProgress(
        { location: vscode6.ProgressLocation.Notification, title: "Rebuilding memory index..." },
        async () => {
          wsResolver.resolve(wsPath, wsName);
          refreshAll(providers);
        }
      );
      vscode6.window.showInformationMessage("Memory index rebuilt.");
    }),
    vscode6.commands.registerCommand("aihub.preChangePrecedentLookup", async () => {
      const intent = await vscode6.window.showInputBox({
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
        vscode6.window.showInformationMessage("No similar precedent found for this change.");
        return;
      }
      const panel = vscode6.window.createWebviewPanel(
        "aihub.precedentView",
        "Precedent Found",
        vscode6.ViewColumn.Beside,
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
  vscode6.workspace.onDidChangeWorkspaceFolders(() => {
    const newPath = resolveWorkspacePath();
    const newName = path.basename(newPath);
    const newWs = wsResolver.resolve(newPath, newName);
    refreshAll(providers);
    Object.values(providers).forEach((p) => p.refresh(newWs.id));
  });
  coverageSvc.ensureDefaultCoverage(workspace2.id);
}
function deactivate() {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.cjs.map
