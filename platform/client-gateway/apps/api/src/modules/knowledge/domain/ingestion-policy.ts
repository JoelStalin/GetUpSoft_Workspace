// K01 — politica de ingestion (funcion pura). Solo fuentes con classification y
// verification_status permitidos se indexan (regla AC de K01). "restricted" nunca se
// indexa automaticamente -- requiere revision manual, sin excepcion.
export type Classification = 'public' | 'internal' | 'confidential' | 'restricted';
export type VerificationStatus = 'unverified' | 'verified' | 'flagged' | 'revoked';

export interface SourceForIngestion {
  classification: Classification;
  verificationStatus: VerificationStatus;
}

export interface IngestionDecision {
  indexable: boolean;
  reason: string;
}

const NEVER_INDEXABLE_CLASSIFICATIONS: Classification[] = ['restricted'];
const INDEXABLE_VERIFICATION_STATUSES: VerificationStatus[] = ['verified'];

export function decideIngestion(source: SourceForIngestion): IngestionDecision {
  if (NEVER_INDEXABLE_CLASSIFICATIONS.includes(source.classification)) {
    return { indexable: false, reason: `classification "${source.classification}" nunca se indexa automaticamente, requiere revision manual` };
  }
  if (!INDEXABLE_VERIFICATION_STATUSES.includes(source.verificationStatus)) {
    return { indexable: false, reason: `verification_status "${source.verificationStatus}" no autorizado para indexar (solo "verified")` };
  }
  return { indexable: true, reason: 'classification e verification_status permitidos' };
}
