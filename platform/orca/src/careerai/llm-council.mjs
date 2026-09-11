// El "cerebro" de los nodos: consulta a varios proveedores y sigue adelante con los que
// respondan. La regla de fondo es que ningun nodo se quede bloqueado esperando a un
// proveedor concreto; si uno cae, el consejo continua con el resto y lo deja registrado.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const DEFAULT_TIMEOUT = Number(process.env.CAREERAI_LLM_TIMEOUT_MS || 120000);
const MAX_ATTEMPTS = Number(process.env.CAREERAI_LLM_RETRIES || 1);

function providerTimeoutMs(provider) {
  const specific = Number(process.env[`CAREERAI_${provider.toUpperCase()}_TIMEOUT_MS`]);
  if (Number.isFinite(specific) && specific > 0) return specific;
  if (provider === 'hermes') return Math.min(DEFAULT_TIMEOUT, 15000);
  if (provider === 'claude') return Math.min(DEFAULT_TIMEOUT, 90000);
  return Math.min(DEFAULT_TIMEOUT, 60000);
}

// Codigos que significan "vuelve a intentarlo", no "esto no va a funcionar".
// Tratarlos como definitivos hacia que el nodo escalara a un humano por una
// sobrecarga pasajera del proveedor.
const TRANSIENT_HTTP = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

export function isTransient(error) {
  const message = String(error?.message || error);
  const match = message.match(/HTTP (\d{3})/);
  if (match) return TRANSIENT_HTTP.has(Number(match[1]));
  return /timeout|ETIMEDOUT|ECONNRESET|socket hang up|fetch failed|overloaded/i.test(message);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Reparto de roles del consejo. No todos los proveedores hacen lo mismo: cada uno tiene
// una funcion y una cadena de respaldo para cuando el titular no responde.
export const ROLES = {
  // NVIDIA NIM absorbe primero el trabajo pesado cuando existe un endpoint económico;
  // Hermes queda como respaldo local/gratuito antes de gastar llamadas comerciales.
  heavy_lifting: { primary: 'nvidia', fallback: ['hermes', 'gemini', 'openai'] },
  // NVIDIA/Hermes (gratis) primero; Claude solo entra si nadie mas responde,
  // porque revisar codigo con el proveedor comercial es el ultimo recurso, no el primero.
  code_review: { primary: 'nvidia', fallback: ['hermes', 'gemini', 'openai', 'claude'] },
  // NVIDIA/Hermes primero; ChatGPT/Gemini delegan el analisis de sistema y reportes
  // antes de tocar un proveedor de pago mas caro.
  systems_analysis: { primary: 'nvidia', fallback: ['hermes', 'openai', 'gemini', 'claude'] },
  reporting: { primary: 'nvidia', fallback: ['hermes', 'openai', 'gemini', 'claude'] },
  // Gemini/ChatGPT se encargan de testing y QA una vez agotado lo gratuito.
  qa_testing: { primary: 'nvidia', fallback: ['hermes', 'gemini', 'openai'] },
  // La investigacion es la unica tarea que se vota entre varios.
  research: { primary: 'hermes', fallback: ['nvidia', 'gemini', 'openai'], council: true },
};

// Los proveedores se declaran con su fuente de credencial, nunca con la credencial dentro.
export const PROVIDERS = {
  nvidia: { transport: 'http', env: 'NVIDIA_NIM_BASE_URL' },
  hermes: { transport: 'cli', env: 'HERMES_CLI_PATH' },
  gemini: { transport: 'http', env: 'GEMINI_API_KEY' },
  openai: { transport: 'http', env: 'CHATGPT_API_KEY' },
  claude: { transport: 'hybrid', env: ['ANTHROPIC_API_KEY', 'CLAUDE_CLI_PATH'] },
};

export function loadLocalEnv(root = process.cwd()) {
  for (const file of ['.env.local', '.env']) {
    const target = path.join(root, file);
    if (!fs.existsSync(target)) continue;
    for (const line of fs.readFileSync(target, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

export function availableProviders() {
  return Object.entries(PROVIDERS)
    .filter(([, config]) => {
      const envNames = Array.isArray(config.env) ? config.env : [config.env];
      const values = envNames.map((name) => ({ name, value: process.env[name] })).filter((item) => item.value);
      if (!values.length) return false;
      if (config.transport === 'cli') return values.some((item) => fs.existsSync(item.value));
      if (config.transport === 'hybrid') {
        return values.some((item) => item.name.endsWith('_API_KEY') || fs.existsSync(item.value));
      }
      return true;
    })
    .map(([name]) => name);
}

export function delegationSnapshot() {
  const available = availableProviders();
  return {
    ok: true,
    available,
    unavailable: Object.keys(PROVIDERS).filter((name) => !available.includes(name)),
    token_policy: {
      strategy: 'primary_then_fallback',
      max_attempts_per_provider: MAX_ATTEMPTS,
      council_only_for: Object.entries(ROLES).filter(([, spec]) => spec.council).map(([role]) => role),
    },
    roles: Object.fromEntries(Object.entries(ROLES).map(([role, spec]) => [role, {
      primary: spec.primary,
      fallback: spec.fallback,
      council: Boolean(spec.council),
      configured_chain: [spec.primary, ...spec.fallback].filter((name) => available.includes(name)),
    }])),
    transports: Object.fromEntries(Object.entries(PROVIDERS).map(([name, config]) => [name, config.transport])),
  };
}

// El CLI de Hermes imprime sus errores por stdout y termina con codigo 0. Sin esta
// deteccion, el consejo tomaba el mensaje de error como una respuesta valida y, peor aun,
// daba por buena la cadena y nunca probaba el proveedor de respaldo.
const HERMES_ERROR_RE = /^(API call failed|Error:|Traceback|No API key|Authentication failed|Rate limit)/im;

function askHermes(prompt) {
  const cli = process.env.HERMES_CLI_PATH;
  const raw = execFileSync(cli, ['-z', prompt], { encoding: 'utf8', timeout: providerTimeoutMs('hermes') }).trim();
  const failure = raw.match(HERMES_ERROR_RE);
  if (failure) throw new Error(raw.split('\n')[0].slice(0, 160));
  if (!raw) throw new Error('respuesta vacia');
  return raw;
}

function askClaudeCli(prompt) {
  const cli = process.env.CLAUDE_CLI_PATH;
  const raw = execFileSync(cli, [
    '-p', prompt,
    '--output-format', 'text',
    '--max-turns', '1',
    '--setting-sources', 'project',
    '--permission-mode', 'plan',
  ], {
    encoding: 'utf8',
    timeout: providerTimeoutMs('claude'),
    windowsHide: true,
  }).trim();
  if (!raw) throw new Error('respuesta vacia');
  return raw;
}

async function askHttp(provider, prompt) {
  const endpoints = {
    nvidia: {
      url: () => `${process.env.NVIDIA_NIM_BASE_URL.replace(/\/$/, '')}/v1/chat/completions`,
      headers: () => ({
        'content-type': 'application/json',
        ...(process.env.NVIDIA_API_KEY ? { authorization: `Bearer ${process.env.NVIDIA_API_KEY}` } : {}),
      }),
      body: () => JSON.stringify({
        model: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3.5-lightning-30b-a3b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: Number(process.env.NVIDIA_MAX_TOKENS || 2048),
      }),
      extract: (data) => data?.choices?.[0]?.message?.content,
    },
    gemini: {
      url: () => `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-flash-latest'}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      headers: () => ({ 'content-type': 'application/json' }),
      body: () => JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      extract: (data) => data?.candidates?.[0]?.content?.parts?.[0]?.text,
    },
    openai: {
      url: () => 'https://api.openai.com/v1/chat/completions',
      headers: () => ({ 'content-type': 'application/json', authorization: `Bearer ${process.env.CHATGPT_API_KEY}` }),
      body: () => JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] }),
      extract: (data) => data?.choices?.[0]?.message?.content,
    },
    claude: {
      url: () => 'https://api.anthropic.com/v1/messages',
      headers: () => ({ 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }),
      body: () => JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }),
      extract: (data) => data?.content?.[0]?.text,
    },
  };

  const spec = endpoints[provider];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), providerTimeoutMs(provider));
  let response;
  try {
    response = await fetch(spec.url(), { method: 'POST', headers: spec.headers(), body: spec.body(), signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = spec.extract(await response.json());
  if (!text) throw new Error('respuesta vacia');
  return String(text).trim();
}

export async function askCouncil(prompt, { providers = availableProviders() } = {}) {
  const answers = [];
  const failures = [];

  for (const provider of providers) {
    let lastError = null;
    let attempts = 0;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      attempts = attempt;
      try {
        const text = provider === 'hermes'
          ? askHermes(prompt)
          : provider === 'claude' && !process.env.ANTHROPIC_API_KEY
            ? askClaudeCli(prompt)
            : await askHttp(provider, prompt);
        answers.push({ provider, text, attempts });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        // Un fallo definitivo no se reintenta: gastar tres llamadas en un 401 no arregla nada.
        if (!isTransient(error) || attempt === MAX_ATTEMPTS) break;
        await wait(1000 * 2 ** (attempt - 1));
      }
    }
    if (lastError) {
      // Un proveedor caido nunca bloquea al consejo: se registra y se sigue.
      failures.push({
        provider,
        error: String(lastError.message || lastError).split('\n')[0],
        attempts,
        transient: isTransient(lastError),
      });
    }
  }

  return {
    ok: answers.length > 0,
    asked: providers,
    answered: answers.map((item) => item.provider),
    failed: failures,
    answers,
    // Sin ninguna respuesta el nodo escala en vez de continuar a ciegas.
    status: answers.length ? 'answered' : 'needs_human',
  };
}

// Enruta una tarea al proveedor que le toca por rol, con respaldo si el titular falla.
// Para el rol de investigacion se consulta a varios y se vota.
export async function askRole(role, prompt, { providers = availableProviders(), askFn = askCouncil } = {}) {
  const spec = ROLES[role];
  if (!spec) {
    const error = new Error(`Rol desconocido: ${role}`);
    error.code = 'UNKNOWN_ROLE';
    throw error;
  }

  if (spec.council) {
    const chain = [spec.primary, ...spec.fallback].filter((name) => providers.includes(name));
    return { role, mode: 'council', ...(await askFn(prompt, { providers: chain })) };
  }

  const chain = [spec.primary, ...spec.fallback].filter((name) => providers.includes(name));
  if (!chain.length) {
    return { role, mode: 'single', ok: false, status: 'needs_human', asked: [], answered: [], failed: [], answers: [],
      reason: `sin proveedor disponible para el rol ${role}` };
  }

  // Se prueba en orden y se para en el primero que responde: el respaldo existe para la
  // caida del titular, no para consultar a todos y gastar el triple.
  const failures = [];
  for (const provider of chain) {
    const result = await askFn(prompt, { providers: [provider] });
    if (result.ok) {
      return { role, mode: 'single', ...result, failed: [...failures, ...result.failed],
        used_fallback: provider !== spec.primary, provider };
    }
    failures.push(...result.failed);
  }
  return { role, mode: 'single', ok: false, status: 'needs_human', asked: chain, answered: [], failed: failures, answers: [] };
}

// Extrae el primer bloque JSON de una respuesta en lenguaje natural.
export function extractJson(text) {
  if (!text) return null;
  const fenced = String(text).match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : String(text);
  const start = candidate.search(/[[{]/);
  if (start === -1) return null;
  const opener = candidate[start];
  const closer = opener === '[' ? ']' : '}';
  const end = candidate.lastIndexOf(closer);
  if (end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

// Consenso por frecuencia: un termino cuenta cuando lo propone mas de un proveedor,
// y los propuestos por uno solo quedan aparte para revision en vez de mezclarse.
export function consensusTerms(proposals, { minVotes = 2 } = {}) {
  const votes = new Map();
  for (const { provider, terms } of proposals) {
    for (const term of terms || []) {
      const key = String(term).trim();
      if (!key) continue;
      const entry = votes.get(key.toLowerCase()) || { term: key, providers: new Set() };
      entry.providers.add(provider);
      votes.set(key.toLowerCase(), entry);
    }
  }
  const all = [...votes.values()].map((entry) => ({ term: entry.term, votes: entry.providers.size, providers: [...entry.providers] }));
  return {
    agreed: all.filter((item) => item.votes >= minVotes).sort((a, b) => b.votes - a.votes),
    single_source: all.filter((item) => item.votes < minVotes),
  };
}
