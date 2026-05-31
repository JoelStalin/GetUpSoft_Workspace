import { randomUUID } from "node:crypto";
import type { Database } from "../Database.ts";
import type {
  ArtifactStoreEntry,
  ContextCacheEntry,
  EmbeddingEntry,
  MemoryPointer,
  PointerEnvelope,
  SemanticCacheEntry,
  TermRegistryEntry,
} from "../entities.ts";
import { computeExpiry, hashContent, normalizeText } from "../../shared/pointerUtils.ts";

export class MemoryPointerRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  upsert(input: {
    workspaceId: string;
    pointerUri: string;
    pointerType: string;
    targetTable: string;
    targetId: string;
    version?: number;
    contentHash: string;
    permissions?: object;
    ttlSeconds?: number | null;
  }): MemoryPointer {
    const existing = this.findByUri(input.pointerUri);
    const now = new Date().toISOString();
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
        existing.id,
      );
      return this.findByUri(input.pointerUri)!;
    }

    const pointer: MemoryPointer = {
      id: randomUUID(),
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
      updatedAt: now,
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
      pointer.updatedAt,
    );

    return pointer;
  }

  findByUri(pointerUri: string): MemoryPointer | undefined {
    return this.db.prepare(
      "SELECT * FROM memory_pointers WHERE pointerUri = ?",
    ).get(pointerUri) as MemoryPointer | undefined;
  }

  listByWorkspace(workspaceId: string): MemoryPointer[] {
    return this.db.prepare(`
      SELECT * FROM memory_pointers
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId) as MemoryPointer[];
  }
}

export class ArtifactStoreRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  put(input: {
    workspaceId: string;
    artifactUri: string;
    artifactType: string;
    title: string;
    content: string;
    mimeType?: string | null;
    storageKind?: string;
    storagePath?: string | null;
    metadata?: object;
  }): ArtifactStoreEntry {
    const existing = this.findByUri(input.artifactUri);
    const now = new Date().toISOString();
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
        existing.id,
      );
      return this.findByUri(input.artifactUri)!;
    }

    const artifact: ArtifactStoreEntry = {
      id: randomUUID(),
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
      createdAt: now,
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
      artifact.createdAt,
    );

    return artifact;
  }

  findByUri(artifactUri: string): ArtifactStoreEntry | undefined {
    return this.db.prepare(
      "SELECT * FROM artifact_store WHERE artifactUri = ?",
    ).get(artifactUri) as ArtifactStoreEntry | undefined;
  }

  findById(id: string): ArtifactStoreEntry | undefined {
    return this.db.prepare(
      "SELECT * FROM artifact_store WHERE id = ?",
    ).get(id) as ArtifactStoreEntry | undefined;
  }

  listByWorkspace(workspaceId: string): ArtifactStoreEntry[] {
    return this.db.prepare(`
      SELECT * FROM artifact_store
      WHERE workspaceId = ?
      ORDER BY createdAt DESC
    `).all(workspaceId) as ArtifactStoreEntry[];
  }
}

export class ContextCacheRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  upsert(input: {
    workspaceId: string;
    cacheKey: string;
    agentType: string;
    jobType: string;
    normalizedIntent: string;
    pointerSet: object;
    compactContext: string;
    tokenCostSaved?: number;
    ttlSeconds?: number | null;
  }): ContextCacheEntry {
    const existing = this.findByKey(input.workspaceId, input.cacheKey);
    const now = new Date().toISOString();
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
        existing.id,
      );
      return this.findByKey(input.workspaceId, input.cacheKey)!;
    }

    const entry: ContextCacheEntry = {
      id: randomUUID(),
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
      lastAccessedAt: now,
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
      entry.lastAccessedAt,
    );

    return entry;
  }

  findByKey(workspaceId: string, cacheKey: string): ContextCacheEntry | undefined {
    return this.db.prepare(`
      SELECT * FROM context_cache
      WHERE workspaceId = ? AND cacheKey = ?
    `).get(workspaceId, cacheKey) as ContextCacheEntry | undefined;
  }

  markHit(id: string): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE context_cache
      SET hitCount = hitCount + 1, lastAccessedAt = ?
      WHERE id = ?
    `).run(now, id);
  }
}

export class TermRegistryRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  upsert(input: {
    workspaceId: string;
    termCode: string;
    canonicalTerm: string;
    normalizedTerm: string;
    language?: string;
    hexRepresentation?: string | null;
    semanticGroupId?: string | null;
    aliases?: string[];
    description?: string | null;
  }): TermRegistryEntry {
    const existing = this.findByCode(input.workspaceId, input.termCode);
    const now = new Date().toISOString();
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
        existing.id,
      );
      return this.findByCode(input.workspaceId, input.termCode)!;
    }

    const entry: TermRegistryEntry = {
      id: randomUUID(),
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
      updatedAt: now,
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
      entry.updatedAt,
    );

    return entry;
  }

  findByCode(workspaceId: string, termCode: string): TermRegistryEntry | undefined {
    return this.db.prepare(`
      SELECT * FROM term_registry
      WHERE workspaceId = ? AND termCode = ?
    `).get(workspaceId, termCode) as TermRegistryEntry | undefined;
  }

  findByNormalizedTerm(workspaceId: string, normalizedTerm: string): TermRegistryEntry | undefined {
    return this.db.prepare(`
      SELECT * FROM term_registry
      WHERE workspaceId = ? AND normalizedTerm = ?
    `).get(workspaceId, normalizedTerm) as TermRegistryEntry | undefined;
  }

  listByWorkspace(workspaceId: string): TermRegistryEntry[] {
    return this.db.prepare(`
      SELECT * FROM term_registry
      WHERE workspaceId = ?
      ORDER BY updatedAt DESC
    `).all(workspaceId) as TermRegistryEntry[];
  }
}

export class EmbeddingRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  upsert(input: {
    workspaceId: string;
    ownerType: string;
    ownerId: string;
    model: string;
    vector: number[];
    quantized?: boolean;
    compressionScheme?: string;
  }): EmbeddingEntry {
    const existing = this.findByOwner(input.workspaceId, input.ownerType, input.ownerId);
    const now = new Date().toISOString();
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
        existing.id,
      );
      return this.findByOwner(input.workspaceId, input.ownerType, input.ownerId)!;
    }

    const entry: EmbeddingEntry = {
      id: randomUUID(),
      workspaceId: input.workspaceId,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      model: input.model,
      dimensions: input.vector.length,
      vectorJson,
      quantized: input.quantized ? 1 : 0,
      compressionScheme: input.compressionScheme ?? "none",
      createdAt: now,
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
      entry.createdAt,
    );

    return entry;
  }

  findByOwner(workspaceId: string, ownerType: string, ownerId: string): EmbeddingEntry | undefined {
    return this.db.prepare(`
      SELECT * FROM embeddings
      WHERE workspaceId = ? AND ownerType = ? AND ownerId = ?
    `).get(workspaceId, ownerType, ownerId) as EmbeddingEntry | undefined;
  }

  listByWorkspace(workspaceId: string, ownerType?: string): EmbeddingEntry[] {
    if (ownerType) {
      return this.db.prepare(`
        SELECT * FROM embeddings
        WHERE workspaceId = ? AND ownerType = ?
      `).all(workspaceId, ownerType) as EmbeddingEntry[];
    }
    return this.db.prepare(`
      SELECT * FROM embeddings
      WHERE workspaceId = ?
    `).all(workspaceId) as EmbeddingEntry[];
  }
}

export class SemanticCacheRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  create(input: {
    workspaceId: string;
    semanticGroupId: string;
    normalizedQuery: string;
    embeddingId: string;
    resultPointerUri: string;
    confidence: number;
    sourceKind: string;
    ttlSeconds?: number | null;
  }): SemanticCacheEntry {
    const now = new Date().toISOString();
    const entry: SemanticCacheEntry = {
      id: randomUUID(),
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
      lastAccessedAt: now,
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
      entry.lastAccessedAt,
    );

    return entry;
  }

  listByWorkspace(workspaceId: string): SemanticCacheEntry[] {
    return this.db.prepare(`
      SELECT * FROM semantic_cache
      WHERE workspaceId = ?
      ORDER BY lastAccessedAt DESC
    `).all(workspaceId) as SemanticCacheEntry[];
  }

  markHit(id: string): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE semantic_cache
      SET hitCount = hitCount + 1, lastAccessedAt = ?
      WHERE id = ?
    `).run(now, id);
  }
}

export class PointerEnvelopeRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  create(input: {
    workspaceId: string;
    missionId: string;
    traceId: string;
    senderAgent: string;
    receiverAgent: string;
    taskPointerUri: string;
    memoryPointers: string[];
    artifactPointers: string[];
    termCodes: string[];
    cacheKeys: string[];
  }): PointerEnvelope {
    const now = new Date().toISOString();
    const entry: PointerEnvelope = {
      id: randomUUID(),
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
      consumedAt: null,
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
      entry.consumedAt,
    );

    return entry;
  }

  findById(id: string): PointerEnvelope | undefined {
    return this.db.prepare(
      "SELECT * FROM pointer_envelopes WHERE id = ?",
    ).get(id) as PointerEnvelope | undefined;
  }

  listByWorkspace(workspaceId: string): PointerEnvelope[] {
    return this.db.prepare(`
      SELECT * FROM pointer_envelopes
      WHERE workspaceId = ?
      ORDER BY createdAt DESC
    `).all(workspaceId) as PointerEnvelope[];
  }

  markConsumed(id: string, status = "consumed"): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE pointer_envelopes
      SET status = ?, consumedAt = ?
      WHERE id = ?
    `).run(status, now, id);
  }
}
