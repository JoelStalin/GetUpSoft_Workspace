import assert from 'node:assert/strict';
import { registerAssetHash, verifyAssetHash, hashAsset } from '../platform/orca/src/careerai/asset-hash-registry.mjs';

const original = Buffer.from('CV original de Juan Perez, contenido v1');
const altered = Buffer.from('CV original de Juan Perez, contenido v2 alterado');

const first = registerAssetHash({ assetId: 'cv-juan-perez', buffer: original, ledger: [] });
assert.equal(first.ok, true);
assert.equal(first.status, 'registered');
assert.equal(first.ledger.length, 1);
assert.equal(first.sha256, hashAsset(original));

const sameAgain = registerAssetHash({ assetId: 'cv-juan-perez', buffer: original, ledger: first.ledger });
assert.equal(sameAgain.status, 'unchanged');
assert.equal(sameAgain.tampered, false);
assert.equal(sameAgain.ledger.length, 1, 'no duplica la entrada al re-registrar el mismo contenido');

const tampered = registerAssetHash({ assetId: 'cv-juan-perez', buffer: altered, ledger: first.ledger });
assert.equal(tampered.status, 'tampered_or_replaced');
assert.equal(tampered.tampered, true);
assert.notEqual(tampered.sha256, tampered.previous_sha256);

const verifyOk = verifyAssetHash({ assetId: 'cv-juan-perez', buffer: original, ledger: first.ledger });
assert.equal(verifyOk.matches, true);

const verifyFail = verifyAssetHash({ assetId: 'cv-juan-perez', buffer: altered, ledger: first.ledger });
assert.equal(verifyFail.matches, false);
assert.equal(verifyFail.status, 'mismatch');

const verifyUnregistered = verifyAssetHash({ assetId: 'cv-otro', buffer: original, ledger: first.ledger });
assert.equal(verifyUnregistered.status, 'not_registered');

console.log(JSON.stringify({ ok: true, node: 'asset-hash-registry', append_only: true, detecta_tampering: true, nunca_sobreescribe_hash_en_silencio: true }));
