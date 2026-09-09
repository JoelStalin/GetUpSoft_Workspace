// Nodo asset-hash-registry: registro append-only del SHA-256 del CV original de cada
// candidato, para poder demostrar despues que nunca se alteraron los datos de un CV que ya
// fue aprobado por el cliente. Funcion pura e inyectable (sin tocar filesystem directamente)
// para poder probarla y para que quien la use decida donde persistir el ledger.
import crypto from 'node:crypto';

export function hashAsset(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// `ledger` es un array de entradas previas {asset_id, sha256, registered_at}. Se devuelve el
// ledger actualizado en vez de mutarlo, para que el llamador decida cuando persistirlo.
export function registerAssetHash({ assetId, buffer, ledger = [], now = new Date() } = {}) {
  if (!assetId) return { ok: false, reason: 'falta assetId' };
  if (!buffer) return { ok: false, reason: 'falta el contenido del archivo' };

  const sha256 = hashAsset(buffer);
  const existing = ledger.find((entry) => entry.asset_id === assetId);

  if (existing) {
    if (existing.sha256 === sha256) {
      return { ok: true, status: 'unchanged', asset_id: assetId, sha256, ledger, tampered: false };
    }
    // El mismo asset_id con un hash distinto es exactamente lo que este nodo existe para
    // detectar: el archivo cambio despues de haber sido registrado (y potencialmente
    // aprobado) — nunca se sobreescribe el hash en silencio.
    return {
      ok: true, status: 'tampered_or_replaced', asset_id: assetId, sha256,
      previous_sha256: existing.sha256, registered_at: existing.registered_at,
      ledger, tampered: true,
    };
  }

  const entry = { asset_id: assetId, sha256, registered_at: now.toISOString() };
  return { ok: true, status: 'registered', asset_id: assetId, sha256, ledger: [...ledger, entry], tampered: false };
}

export function verifyAssetHash({ assetId, buffer, ledger = [] } = {}) {
  const entry = ledger.find((item) => item.asset_id === assetId);
  if (!entry) return { ok: true, status: 'not_registered', matches: false };
  const sha256 = hashAsset(buffer);
  return { ok: true, status: sha256 === entry.sha256 ? 'matches' : 'mismatch', matches: sha256 === entry.sha256, sha256, expected_sha256: entry.sha256 };
}
