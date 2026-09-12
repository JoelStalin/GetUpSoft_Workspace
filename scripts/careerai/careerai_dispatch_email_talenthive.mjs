import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function loadLocalEnv() {
  if (fs.existsSync('.env.local')) {
    const text = fs.readFileSync('.env.local', 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.trimStart().startsWith('#')) continue;
      const sep = line.indexOf('=');
      if (sep < 1) continue;
      process.env[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
    }
  }
}
loadLocalEnv();

function getGoogleToken() {
  try {
    const vaultPath = path.resolve(process.env.ORCA_OAUTH_VAULT || 'data/orca/oauth-vault.enc.json');
    const keyText = process.env.ORCA_OAUTH_VAULT_KEY;
    const envelope = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
    const key = crypto.createHash('sha256').update(keyText, 'utf8').digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
    const vault = JSON.parse(Buffer.concat([
      decipher.update(Buffer.from(envelope.data, 'base64')),
      decipher.final(),
    ]).toString('utf8'));
    return vault.careerai?.yoeli?.google?.access_token;
  } catch (err) {
    console.error('Vault error:', err.message);
    return null;
  }
}

export async function dispatchTalentHiveEmail({ confirm = false } = {}) {
  const stagedDraftPath = path.resolve('task-ledger/evidence/careerai/talenthive_application_draft.json');
  if (!fs.existsSync(stagedDraftPath)) {
    throw new Error('No existe el borrador preparado de la aplicación');
  }

  const draft = JSON.parse(fs.readFileSync(stagedDraftPath, 'utf8'));

  if (!confirm) {
    console.log('ℹ️ MODO PREVIEW / SIMULACIÓN (Pasa confirm: true para enviar de verdad)');
    return { ok: true, mode: 'preview', draft };
  }

  const token = getGoogleToken();
  if (!token) {
    throw new Error('No se pudo obtener el token de Google/Gmail');
  }

  const boundary = `boundary_talenthive_${Date.now()}`;
  const headers = { authorization: `Bearer ${token}` };

  const rawParts = [
    `From: ${draft.from}`,
    `To: ${draft.to}`,
    `Cc: ${draft.from}`,
    `Subject: =?utf-8?B?${Buffer.from(draft.subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    draft.body_text,
    ''
  ];

  for (const att of draft.attachments) {
    const fileBuf = fs.readFileSync(att.filepath);
    rawParts.push(
      `--${boundary}`,
      `Content-Type: application/pdf; name="${att.filename}"`,
      `Content-Disposition: attachment; filename="${att.filename}"`,
      'Content-Transfer-Encoding: base64',
      '',
      fileBuf.toString('base64'),
      ''
    );
  }

  rawParts.push(`--${boundary}--`);

  const rawEncoded = Buffer.from(rawParts.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ raw: rawEncoded })
  });

  const sendData = await sendRes.json();
  if (!sendRes.ok) {
    throw new Error(`Error enviando correo: ${JSON.stringify(sendData)}`);
  }

  draft.status = 'DISPATCHED_TO_RECRUITER';
  draft.gmail_id = sendData.id;
  draft.dispatched_at = new Date().toISOString();
  fs.writeFileSync(stagedDraftPath, JSON.stringify(draft, null, 2), 'utf8');

  console.log(`✅ Correo entregado exitosamente a ${draft.to} (Gmail ID: ${sendData.id})`);
  return { ok: true, status: 'dispatched', gmail_id: sendData.id };
}

if (process.argv[2] === '--send-now') {
  dispatchTalentHiveEmail({ confirm: true }).catch(console.error);
}
