// Nodo orca-project-provisioner: crea el registro del proyecto ORCA de un cliente con su URL
// de monitoreo real. Extraido de scripts/create_orca_project_link.mjs (que seguia apuntando
// enlaces al puerto 5174 donde nunca hubo nada escuchando) como funcion pura, testeable sin
// tocar el filesystem, para poder reusarla desde el pipeline ademas del CLI.
import crypto from 'node:crypto';

function slugify(name) {
  return String(name || '')
    .toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'proyecto';
}

export function provisionOrcaProject({ owner, projectName, domain, existingRecords = [], now = new Date() } = {}) {
  if (!owner || !projectName) return { ok: false, reason: 'falta owner o projectName' };
  const slug = slugify(projectName);
  const projectId = crypto.createHash('sha256').update(`${owner.trim().toLowerCase()}:${slug}`).digest('hex').slice(0, 24);
  const base = String(domain || '').replace(/\/$/, '');
  if (!base) return { ok: false, reason: 'falta domain: la URL de monitoreo no puede apuntar a nada' };

  const record = {
    owner, project_name: projectName, slug, project_id: projectId,
    url: `${base}/project/${slug}/${projectId}`,
    created_at: now.toISOString(),
  };

  // Idempotente: el mismo owner+slug reemplaza el registro anterior en vez de duplicarlo.
  const records = existingRecords.filter((entry) => !(String(entry.owner).toLowerCase() === owner.toLowerCase() && entry.slug === slug));
  records.push(record);

  return { ok: true, ...record, monitoring_url: record.url, records };
}
