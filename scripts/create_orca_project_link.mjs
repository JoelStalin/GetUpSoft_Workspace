import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const owner = process.argv[2];
const projectName = process.argv[3];
if (!owner || !projectName) {
  console.error('Uso: npm run orca:project-link -- <usuario> <nombre-proyecto>');
  process.exit(1);
}

const slug = projectName.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'proyecto';
const id = crypto.createHash('sha256').update(`${owner.trim().toLowerCase()}:${slug}`).digest('hex').slice(0, 24);
// Apunta al servidor que de verdad sirve el proyecto. Antes se generaban enlaces al 5174,
// donde nunca hubo nada escuchando, asi que la URL de monitoreo no abria nada.
const domain = (process.env.ORCA_PUBLIC_DOMAIN || `http://127.0.0.1:${process.env.ORCA_UI_PORT || 4173}`).replace(/\/$/, '');
const record = { owner, project_name: projectName, slug, project_id: id, url: `${domain}/project/${slug}/${id}` };

const file = path.resolve('data/orca/project-links.json');
fs.mkdirSync(path.dirname(file), { recursive: true });
const records = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
const next = records.filter((entry) => !(entry.owner.toLowerCase() === owner.toLowerCase() && entry.slug === slug));
next.push({ ...record, created_at: new Date().toISOString() });
fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, ...record, monitoring_url: record.url }, null, 2));
