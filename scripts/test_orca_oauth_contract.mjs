import fs from 'node:fs';

const file = new URL('../apps/orca/data/workflow_blueprints.json', import.meta.url);
const workflows = JSON.parse(fs.readFileSync(file, 'utf8'));
const workflow = workflows.find((item) => item.id === 'careerai-indeed-agent');
if (!workflow) throw new Error('CareerAI workflow missing');
const required = {
  oauth_mode: 'onscreen_pkce',
  oauth_vault: 'encrypted:user_id/project_id/provider',
  browser_validation: 'chrome-live-mcp',
  oauth_resume: true,
  oauth_reauth_on_expiry: true,
};
for (const [key, expected] of Object.entries(required)) {
  if (workflow.settings?.[key] !== expected) throw new Error(`OAuth contract mismatch: ${key}`);
}
console.log(JSON.stringify({ ok: true, workflow: workflow.id, oauth: required }));
