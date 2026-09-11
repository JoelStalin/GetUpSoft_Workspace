import vm from 'node:vm';

export function nodeFamily(entry) {
  const type = entry?.n8n_equivalent?.type || '';
  if (type.includes('manualTrigger')) return 'manual';
  if (type.includes('scheduleTrigger')) return 'schedule';
  if (type.endsWith('.code')) return 'code';
  if (type.endsWith('.if') || type.endsWith('.switch')) return 'decision';
  if (type.endsWith('.wait')) return 'wait';
  if (type.includes('dataTable')) return 'data';
  if (type.includes('whatsApp')) return 'whatsapp';
  if (type.includes('gmail')) return 'gmail';
  if (type.includes('playwright') || type.includes('browser')) return 'browser';
  if (type.includes('langchain')) return 'ai';
  if (type.includes('rssFeed')) return 'rss';
  if (type.includes('httpRequest')) return 'http';
  if (type.includes('errorTrigger')) return 'error';
  return 'code';
}

const missing = (field) => ({ ok: false, status: 'configuration_required', error: `missing_${field}`, side_effect: false });
const adapterMissing = (family) => ({ ok: false, status: 'adapter_required', error: `missing_${family}_adapter`, side_effect: false });

export async function executeNodeFamily(entry, config = {}, input = {}, adapters = {}) {
  const family = nodeFamily(entry);
  if (family === 'manual') {
    if (!['manual', 'webhook'].includes(config.inputMode)) return missing('inputMode');
    return { ok: true, status: 'emitted', output: structuredClone(input), side_effect: false };
  }
  if (family === 'schedule') {
    const rule = config.rule; if (!rule?.interval?.length) return missing('rule');
    return { ok: true, status: 'scheduled', output: { rule }, side_effect: false };
  }
  if (family === 'code') {
    if (!String(config.jsCode || '').trim()) return missing('jsCode');
    const items = Array.isArray(input) ? structuredClone(input) : [{ json: structuredClone(input) }];
    const context = vm.createContext({ items, structuredClone });
    const script = new vm.Script(`(async()=>{${config.jsCode}})()`, { filename: `${entry.node_id}.node.js` });
    const output = await script.runInContext(context, { timeout: 1500 });
    if (!Array.isArray(output)) throw new Error('code_node_must_return_items');
    return { ok: true, status: 'completed', output, side_effect: false };
  }
  if (family === 'decision') {
    const predicate = config.predicate;
    if (typeof predicate !== 'function') return missing('conditions');
    return { ok: true, status: 'completed', output: { branch: predicate(input) ? 'true' : 'false', input }, side_effect: false };
  }
  if (family === 'wait') {
    if (!['timeInterval', 'specificTime', 'webhook', 'form'].includes(config.resume)) return missing('resume');
    return { ok: true, status: 'waiting', output: { resume: config.resume }, side_effect: false };
  }
  if (family === 'error') {
    if (!config.source) return missing('source');
    return { ok: true, status: 'captured', output: { error: input.error || 'fixture_error' }, side_effect: false };
  }

  const required = {
    http: ['url'], rss: ['url'], data: ['table'], browser: ['sessionId', 'target'],
    ai: ['credential', 'prompt'], gmail: ['credential', 'to'], whatsapp: ['credential', 'to'],
  }[family] || [];
  for (const field of required) if (!config[field]) return missing(field);
  if (family === 'whatsapp' && ['send', 'sendAndWait'].includes(config.operation) && !config.message) return missing('message');
  if (family === 'whatsapp' && config.operation === 'sendTemplate' && !config.template) return missing('template');
  if (family === 'gmail' && config.operation === 'send' && !config.message) return missing('message');
  const adapter = adapters[family]; if (typeof adapter !== 'function') return adapterMissing(family);
  const output = await adapter({ node_id: entry.node_id, family, config: structuredClone(config), input: structuredClone(input) });
  return { ok: true, status: family === 'browser' && output?.user_setup_required ? 'waiting_for_user_setup' : 'completed', output, side_effect: ['http', 'data', 'ai', 'gmail', 'whatsapp', 'browser', 'rss'].includes(family) };
}
