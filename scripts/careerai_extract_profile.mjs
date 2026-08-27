// Ejecuta cv-ingest + profession-extractor sobre el CV real del cliente.
// Uso: node scripts/careerai_extract_profile.mjs <ruta-al-cv>
import { loadLocalEnv } from '../apps/orca/src/careerai/llm-council.mjs';
import { ingestCv } from '../apps/orca/src/careerai/cv-ingest.mjs';
import { extractProfessions } from '../apps/orca/src/careerai/profession-extractor.mjs';

loadLocalEnv();

const cvPath = process.argv[2];
if (!cvPath) {
  console.error('Uso: node scripts/careerai_extract_profile.mjs <ruta-al-cv>');
  process.exit(1);
}

const ingested = ingestCv(cvPath);
console.log(JSON.stringify({ step: 'cv-ingest', status: ingested.status, characters: ingested.characters, sha256: ingested.sha256?.slice(0, 16) }));
if (!ingested.ok) process.exit(1);

const result = await extractProfessions(ingested.text);
console.log(JSON.stringify({ step: 'profession-extractor', method: result.method, provider: result.provider || null, total: result.professions.length }));
console.log(JSON.stringify(result.professions, null, 2));
