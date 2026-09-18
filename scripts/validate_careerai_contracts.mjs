import fs from 'node:fs';

const file = new URL('../data/careerai/contracts.json', import.meta.url);
const document = JSON.parse(fs.readFileSync(file, 'utf8'));
const requiredContracts = ['Opportunity', 'AnalysisResult', 'ApprovalRequest', 'WorkflowRun', 'NotificationEvent'];
for (const name of requiredContracts) {
  const contract = document.contracts?.[name];
  if (!contract || !Array.isArray(contract.required) || contract.required.length === 0) throw new Error(`Invalid contract: ${name}`);
}
if (document.policy.external_action_requires_approval !== true || document.policy.submit_requires_opportunity_specific_approval !== true) {
  throw new Error('External action approval policy is not enforced');
}
if (!document.policy.secret_fields_forbidden.includes('access_token') || !document.policy.secret_fields_forbidden.includes('cookie')) {
  throw new Error('Secret field policy is incomplete');
}
console.log(JSON.stringify({ ok: true, schema_version: document.schema_version, contracts: requiredContracts.length }));
