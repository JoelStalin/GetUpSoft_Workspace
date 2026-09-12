import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function loadLocalEnv() {
  const text = fs.readFileSync('.env.local', 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith('#')) continue;
    const sep = line.indexOf('=');
    if (sep < 1) continue;
    process.env[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
}
loadLocalEnv();

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

const token = vault.careerai?.yoeli?.google?.access_token;
if (!token) throw new Error('No hay access_token');
const headers = { authorization: 'Bearer ' + token };

console.log('1. SUBIENDO LOS 20 ARCHIVOS A GOOGLE DRIVE...');
const folderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
  method: 'POST',
  headers: { ...headers, 'content-type': 'application/json' },
  body: JSON.stringify({ name: 'CareerAI_Candidaturas_2026', mimeType: 'application/vnd.google-apps.folder' })
});
const folderData = await folderRes.json();
const folderId = folderData.id;
console.log('Carpeta creada en Google Drive:', folderData.name, 'ID:', folderId);

const pdfDir = path.resolve('task-ledger/evidence/careerai/cvs_y_cartas_reales');
const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));

for (const file of files) {
  const filePath = path.join(pdfDir, file);
  const fileBuffer = fs.readFileSync(filePath);
  const metadata = { name: file, parents: [folderId] };
  const boundary = '-------314159265358979323846';
  const delimiter = '\r\n--' + boundary + '\r\n';
  const closeDelim = '\r\n--' + boundary + '--';
  const body = Buffer.concat([
    Buffer.from(delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata)),
    Buffer.from(delimiter + 'Content-Type: application/pdf\r\n\r\n'),
    fileBuffer,
    Buffer.from(closeDelim)
  ]);
  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { ...headers, 'content-type': 'multipart/related; boundary=' + boundary },
    body
  });
  console.log('  [Drive] Subido:', file, 'ID:', uploadData.id);
}

console.log('\n2. ENVIANDO LOS 10 CORREOS REALES MEDIANTE GMAIL API...');
const apps = JSON.parse(fs.readFileSync('task-ledger/evidence/careerai/10-candidaturas/candidaturas_procesadas.json', 'utf8'));
for (const app of apps) {
  const index = String(app.index).padStart(2, '0');
  const cvFile = 'CV_' + index + '_' + app.company.replace(/\s+/g, '_') + '.pdf';
  const letterFile = 'Carta_' + index + '_' + app.company.replace(/\s+/g, '_') + '.pdf';
  const cvBuf = fs.readFileSync(path.join(pdfDir, cvFile));
  const letBuf = fs.readFileSync(path.join(pdfDir, letterFile));
  const recipient = 'joelstalin2105@gmail.com';
  const subject = '[CareerAI Postulacion #' + index + '] - ' + app.title + ' en ' + app.company;
  const bodyText = app.cover_letter.body + '\n\n---\nPostulacion generada por CareerAI Engine (100 Criterios de Reclutador Validados).\nAdjuntos: CV adaptado y Carta de Presentacion en PDF.';
  const boundary = 'boundary_careerai_' + Date.now() + '_' + index;
  const raw = [
    'From: joelstalin2105@gmail.com',
    'To: ' + recipient,
    'Subject: =?utf-8?B?' + Buffer.from(subject).toString('base64') + '?=',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' + boundary + '"',
    '',
    '--' + boundary,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    bodyText,
    '',
    '--' + boundary,
    'Content-Type: application/pdf; name="' + cvFile + '"',
    'Content-Disposition: attachment; filename="' + cvFile + '"',
    'Content-Transfer-Encoding: base64',
    '',
    cvBuf.toString('base64'),
    '',
    '--' + boundary,
    'Content-Type: application/pdf; name="' + letterFile + '"',
    'Content-Disposition: attachment; filename="' + letterFile + '"',
    'Content-Transfer-Encoding: base64',
    '',
    letBuf.toString('base64'),
    '',
    '--' + boundary + '--'
  ].join('\r\n');
  const rawEncoded = Buffer.from(raw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ raw: rawEncoded })
  });
  const sendData = await sendRes.json();
  if (sendRes.ok) {
    console.log('  ✉️ [Gmail] [' + index + '/10] Enviado a ' + recipient + ' para ' + app.company + ' (Gmail Message ID: ' + sendData.id + ')');
  } else {
    console.error('  ❌ Error enviando ' + index + ':', JSON.stringify(sendData));
  }
}
console.log('\n=== OPERACION REAL EN GOOGLE DRIVE Y GMAIL COMPLETADA ===');
