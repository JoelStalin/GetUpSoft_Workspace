import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1))), '..');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'data/careerai/node-inventory.json'), 'utf8'));

const docs = {
  manual: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.manualworkflowtrigger/',
  schedule: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/',
  code: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/',
  http: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/',
  if: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/',
  switch: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.switch/',
  wait: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/',
  gmail: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/',
  whatsapp: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.whatsapp/',
  ai: 'https://github.com/n8n-io/n8n/tree/master/packages/%40n8n/nodes-langchain/nodes',
  data: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.datatable/',
  rss: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.rssfeedread/',
  error: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/',
  browser: 'https://github.com/IA-Generative/n8n-nodes-playwright-core',
  evolution: 'https://github.com/evolution-foundation/evolution-api',
};

const field = (displayName, name, type, defaultValue, extra = {}) => ({ displayName, name, type, default: defaultValue, ...extra });
const schemas = {
  manual: [field('Input Mode', 'inputMode', 'options', 'manual', { options: ['manual', 'webhook'] })],
  schedule: [field('Trigger Interval', 'rule', 'fixedCollection', { interval: [{ field: 'hours', hoursInterval: 1 }] })],
  code: [field('Mode', 'mode', 'options', 'runOnceForAllItems', { options: ['runOnceForAllItems', 'runOnceForEachItem'] }), field('JavaScript', 'jsCode', 'string', '', { typeOptions: { editor: 'codeNodeEditor' } })],
  http: [field('Method', 'method', 'options', 'GET', { options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }), field('URL', 'url', 'string', ''), field('Authentication', 'authentication', 'options', 'predefinedCredentialType', { options: ['none', 'predefinedCredentialType', 'genericCredentialType'] }), field('Options', 'options', 'collection', {})],
  if: [field('Conditions', 'conditions', 'fixedCollection', { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' }, conditions: [] })],
  switch: [field('Mode', 'mode', 'options', 'rules', { options: ['rules', 'expression'] }), field('Rules', 'rules', 'fixedCollection', { values: [] })],
  wait: [field('Resume', 'resume', 'options', 'webhook', { options: ['timeInterval', 'specificTime', 'webhook', 'form'] }), field('Options', 'options', 'collection', {})],
  gmail: [field('Resource', 'resource', 'options', 'message', { options: ['message', 'draft', 'thread', 'label'] }), field('Operation', 'operation', 'options', 'send', { options: ['send', 'create', 'get', 'getAll'] }), field('Credential', 'credential', 'credentials', null, { credentialType: 'gmailOAuth2' }), field('To', 'to', 'string', ''), field('Subject', 'subject', 'string', ''), field('Message', 'message', 'string', '')],
  whatsapp: [field('Provider', 'provider', 'options', 'evolution', { options: ['evolution', 'meta_cloud'] }), field('Resource', 'resource', 'options', 'message', { options: ['message', 'media', 'instance'] }), field('Operation', 'operation', 'options', 'send', { options: ['send', 'sendTemplate', 'sendAndWait', 'connectionState'] }), field('Credential', 'credential', 'credentials', null, { credentialTypeByProvider: { evolution: 'evolutionApi', meta_cloud: 'whatsAppApi' } }), field('To', 'to', 'string', '', { displayOptions: { show: { resource: ['message'], operation: ['send', 'sendTemplate', 'sendAndWait'] } } }), field('Message', 'message', 'string', '', { displayOptions: { show: { operation: ['send', 'sendAndWait'] } } }), field('Template', 'template', 'resourceLocator', '', { displayOptions: { show: { operation: ['sendTemplate'] } } })],
  ai: [field('Provider', 'provider', 'options', 'openai', { options: ['nvidia', 'hermes', 'gemini', 'openai', 'claude'] }), field('Credential', 'credential', 'credentials', null, { credentialTypeByProvider: { nvidia: 'nvidiaApi', gemini: 'googlePalmApi', openai: 'openAiApi', claude: 'anthropicApi' } }), field('Model', 'model', 'resourceLocator', ''), field('Prompt', 'prompt', 'string', '={{ $json.prompt }}'), field('Options', 'options', 'collection', { maxTokens: 800, temperature: 0.2 })],
  data: [field('Resource', 'resource', 'options', 'row', { options: ['row', 'table'] }), field('Operation', 'operation', 'options', 'upsert', { options: ['insert', 'update', 'upsert', 'get', 'delete'] }), field('Table', 'table', 'resourceLocator', '')],
  rss: [field('URL', 'url', 'string', ''), field('Options', 'options', 'collection', {})],
  error: [field('Workflow Error Source', 'source', 'options', 'currentWorkflow', { options: ['currentWorkflow', 'allWorkflows'] })],
  browser: [field('Operation', 'operation', 'options', 'navigate', { options: ['navigate', 'getText', 'clickElement', 'fillForm', 'takeScreenshot', 'downloadFile', 'closeSession'] }), field('Session ID', 'sessionId', 'string', '={{ $execution.id }}'), field('Leave Session Open', 'leaveSessionOpen', 'boolean', true), field('Connection Timeout', 'connectionTimeout', 'number', 30000), field('URL or Selector', 'target', 'string', '')],
};

const explicit = {
  'career-command': ['n8n-nodes-base.manualTrigger', 'Manual Trigger', 'manual'],
  'run-scheduler': ['n8n-nodes-base.scheduleTrigger', 'Schedule Trigger', 'schedule'],
  'report-scheduler': ['n8n-nodes-base.scheduleTrigger', 'Schedule Trigger', 'schedule'],
  'new-position-trigger': ['n8n-nodes-base.if', 'If', 'if'],
  'rss-feed-ingest': ['n8n-nodes-base.rssFeedRead', 'RSS Feed Read', 'rss'],
  'email-alert-ingest': ['n8n-nodes-base.gmailTrigger', 'Gmail Trigger', 'gmail'],
  'gmail-notification': ['n8n-nodes-base.gmail', 'Gmail', 'gmail'],
  'email-apply-sender': ['n8n-nodes-base.gmail', 'Gmail', 'gmail'],
  'whatsapp-summary': ['n8n-nodes-base.whatsApp', 'WhatsApp Business Cloud / Evolution API', 'whatsapp'],
  'whatsapp-report-sender': ['n8n-nodes-base.whatsApp', 'WhatsApp Business Cloud / Evolution API', 'whatsapp'],
  'whatsapp-approval-notification': ['n8n-nodes-base.whatsApp', 'WhatsApp Business Cloud / Evolution API', 'whatsapp'],
  'live-browser-monitor': ['@ia-generative/n8n-nodes-playwright-core.playwright', 'Playwright Core', 'browser'],
  'external-form-fill': ['@ia-generative/n8n-nodes-playwright-core.playwright', 'Playwright Core', 'browser'],
  'scroll-paginator': ['@ia-generative/n8n-nodes-playwright-core.playwright', 'Playwright Core', 'browser'],
  'ocr-visual-verifier': ['@ia-generative/n8n-nodes-playwright-core.playwright', 'Playwright Core', 'browser'],
  'human-takeover': ['@ia-generative/n8n-nodes-playwright-core.playwright', 'Playwright Core', 'browser'],
  'autocorrection': ['n8n-nodes-base.errorTrigger', 'Error Trigger + Execute Workflow', 'error'],
  'blocked-escalation': ['n8n-nodes-base.wait', 'Wait', 'wait'],
  'human-approval': ['n8n-nodes-base.wait', 'Wait', 'wait'],
  'profile-confirmation': ['n8n-nodes-base.wait', 'Wait', 'wait'],
  'priority-prompt': ['n8n-nodes-base.wait', 'Wait', 'wait'],
  'asset-human-review': ['n8n-nodes-base.wait', 'Wait', 'wait'],
  'linkedin-gate': ['n8n-nodes-base.wait', 'Wait', 'wait'],
};

function infer(node) {
  if (explicit[node.id]) return explicit[node.id];
  if (node.type === 'intelligence') return ['@n8n/n8n-nodes-langchain.agent', 'AI Agent / Chat Model', 'ai'];
  if (node.type === 'decision') return ['n8n-nodes-base.if', 'If / Switch', 'if'];
  if (node.type === 'trigger') return ['n8n-nodes-base.scheduleTrigger', 'Schedule Trigger', 'schedule'];
  if (node.type === 'transform' || node.type === 'report') return ['n8n-nodes-base.code', 'Code', 'code'];
  if (node.type === 'approval') return ['n8n-nodes-base.wait', 'Wait', 'wait'];
  if (node.type === 'notification') return ['n8n-nodes-base.httpRequest', 'HTTP Request', 'http'];
  if (node.type === 'action') return ['n8n-nodes-base.httpRequest', 'HTTP Request', 'http'];
  if (/upsert|registry|audit|catalog|tracker|meter|binding|collector/.test(node.id)) return ['n8n-nodes-base.dataTable', 'Data Table', 'data'];
  if (/discovery|adapter|oauth|connection|proxy|invoice|payment|calendar|easycount/.test(node.id)) return ['n8n-nodes-base.httpRequest', 'HTTP Request', 'http'];
  return ['n8n-nodes-base.code', 'Code', 'code'];
}

const entries = inventory.nodes.map((node) => {
  const [type, displayName, schema] = infer(node);
  const sourceKey = schema === 'whatsapp' ? 'whatsapp' : schema;
  return {
    node_id: node.id,
    orca: { type: node.type, status: node.status, block: node.block, purpose: node.purpose },
    n8n_equivalent: {
      type, display_name: displayName, type_version: 1,
      parity: explicit[node.id] ? 'direct_or_composed' : 'composed',
      source_url: docs[sourceKey] || docs.code,
    },
    configuration: {
      style: 'n8n_node_description',
      resource_operation_first: true,
      supports_expressions: true,
      credentials_stored_by_reference: true,
      properties: schemas[schema] || schemas.code,
    },
    use_cases: [
      { id: `${node.id}:happy-path`, title: node.purpose, input: 'valid_fixture', preconditions: ['n8n-style configuration valid', 'required adapter available'], expected: 'produces_contract_output', side_effect_policy: 'fixture adapter only during automated tests' },
      { id: `${node.id}:invalid-or-expired-input`, title: `Entrada invalida, credencial o sesion vencida en ${node.id}`, input: 'missing required field or expired reference', preconditions: [], expected: 'fails_or_pauses_without_side_effect', side_effect_policy: 'adapter must not be invoked' },
    ],
    functional_tests: [
      `${node.id}:renders-n8n-configuration`, `${node.id}:happy-path`, `${node.id}:invalid-or-expired-input`,
    ],
    whatsapp_options: schema === 'whatsapp' ? {
      free_self_hosted: { provider: 'Evolution API', transport: 'Baileys / WhatsApp Web', source_url: docs.evolution, warning: 'No oficial; sujeto a limites y cambios de WhatsApp Web.' },
      official: { provider: 'Meta WhatsApp Business Cloud', source_url: docs.whatsapp, credential_type: 'whatsAppApi' },
    } : undefined,
  };
});

const output = {
  schema_version: 'careerai.n8n-node-parity.v1', generated_at: new Date().toISOString(), total: entries.length,
  research_sources: Object.values(docs), nodes: entries,
};
fs.writeFileSync(path.join(root, 'data/careerai/n8n-node-parity.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, total: entries.length, direct_or_composed: entries.filter((item) => item.n8n_equivalent.parity === 'direct_or_composed').length }));
