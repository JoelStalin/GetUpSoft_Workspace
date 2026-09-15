// K01 - Knowledge Ingestion Pipeline: Content Hashing, Provenance & Classification
import crypto from 'node:crypto';

export class KnowledgeIngestionService {
  constructor({ maxSizeBytes = 10 * 1024 * 1024 } = {}) {
    this.maxSizeBytes = maxSizeBytes;
    this.documents = new Map(); // hash -> doc record
  }

  computeHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  ingestDocument({ sourceId, title, content, classification = 'internal', metadata = {} }) {
    if (!content || typeof content !== 'string') {
      throw new Error('El contenido del documento debe ser un texto valido');
    }
    const byteLength = Buffer.byteLength(content, 'utf8');
    if (byteLength > this.maxSizeBytes) {
      throw new Error('El documento excede el limite maximo permitido de bytes');
    }

    const validClassifications = ['public', 'internal', 'confidential', 'restricted'];
    if (!validClassifications.includes(classification)) {
      throw new Error('Clasificacion no permitida: ' + classification);
    }

    const contentHash = this.computeHash(content);
    const existing = this.documents.get(contentHash);

    if (existing) {
      return {
        ok: true,
        deduplicated: true,
        contentHash,
        documentId: existing.id,
        version: existing.version
      };
    }

    const docId = 'doc_' + contentHash.substring(0, 16);
    const record = {
      id: docId,
      sourceId,
      title,
      classification,
      contentHash,
      byteLength,
      metadata,
      version: 1,
      createdAt: new Date().toISOString()
    };

    this.documents.set(contentHash, record);
    return {
      ok: true,
      deduplicated: false,
      contentHash,
      documentId: docId,
      version: 1
    };
  }

  getDocument(contentHash) {
    return this.documents.get(contentHash) || null;
  }
}
