import fs from 'node:fs';

for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
}
const token = process.env.CLOUDFLARE_API_TOKEN_GETUPSOFT_ALL_ACCOUNT || process.env.CLOUDFLARE_API_TOKEN;
const response = await fetch('https://api.cloudflare.com/client/v4/zones?name=orca.dev', {
  headers: { authorization: `Bearer ${token}` },
});
const data = await response.json();
console.log(JSON.stringify({
  success: data.success,
  errors: data.errors,
  zones: (data.result || []).map((zone) => ({ id: zone.id, name: zone.name, status: zone.status, account_id: zone.account?.id, account: zone.account?.name })),
}));
