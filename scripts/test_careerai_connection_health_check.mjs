import { checkConnectionHealth } from '../apps/orca/src/careerai/connection-health-check.mjs';

const now = new Date('2026-08-27T12:00:00Z');

// --- todo sano: ready_to_run true -----------------------------------------------
const todoSano = checkConnectionHealth([
  { platform: 'gmail', level: 'mcp', mcp_available: true },
  { platform: 'linkedin', level: 'oauth2', oauth_token: 'abc', oauth_expires_at: '2026-08-28T00:00:00Z' },
  { platform: 'indeed', level: 'live_browser_manual', session: { tenant_id: 'joel', portal: 'indeed', expires_at: '2026-08-28T00:00:00Z' } },
], { tenant_id: 'joel', now });
if (todoSano.ready_to_run !== true || todoSano.healthy_count !== 3) {
  throw new Error('Con las tres conexiones sanas, ready_to_run debe ser true');
}

// --- MCP caido: no listo, se nombra la conexion que falla ----------------------
const mcpCaido = checkConnectionHealth([{ platform: 'gmail', level: 'mcp', mcp_available: false }], { tenant_id: 'joel', now });
if (mcpCaido.ready_to_run !== false || mcpCaido.unhealthy.length !== 1) {
  throw new Error('Un conector MCP caido debe marcar la corrida como no lista');
}
if (mcpCaido.unhealthy[0].platform !== 'gmail') throw new Error('Debe nombrar la plataforma que falla');

// --- OAuth2 sin token: no listo --------------------------------------------------
const sinToken = checkConnectionHealth([{ platform: 'linkedin', level: 'oauth2' }], { tenant_id: 'joel', now });
if (sinToken.ready_to_run !== false) throw new Error('Sin token OAuth2 almacenado, no puede estar listo');

// --- OAuth2 vencido: no listo -----------------------------------------------------
const tokenVencido = checkConnectionHealth(
  [{ platform: 'linkedin', level: 'oauth2', oauth_token: 'abc', oauth_expires_at: '2026-08-27T00:00:00Z' }],
  { tenant_id: 'joel', now },
);
if (tokenVencido.ready_to_run !== false) throw new Error('Un token OAuth2 vencido debe marcar la corrida como no lista');

// --- live browser sin sesion: no listo -------------------------------------------
const sinSesion = checkConnectionHealth([{ platform: 'indeed', level: 'live_browser_manual', session: null }], { tenant_id: 'joel', now });
if (sinSesion.ready_to_run !== false) throw new Error('Sin sesion de live browser, no puede estar listo');

// --- reutiliza scraping-session-guard: sesion de otro tenant tambien falla aqui --
const sesionCruzada = checkConnectionHealth(
  [{ platform: 'indeed', level: 'live_browser_manual', session: { tenant_id: 'otro-cliente', portal: 'indeed', expires_at: '2026-08-28T00:00:00Z' } }],
  { tenant_id: 'joel', now },
);
if (sesionCruzada.ready_to_run !== false || sesionCruzada.unhealthy[0].session_status !== 'tenant_mismatch') {
  throw new Error('El chequeo de salud debe heredar la verificacion de tenant de scraping-session-guard');
}

// --- nivel desconocido: no listo, no se asume sano -------------------------------
const nivelDesconocido = checkConnectionHealth([{ platform: 'x', level: 'telepatia' }], { tenant_id: 'joel', now });
if (nivelDesconocido.ready_to_run !== false) throw new Error('Un nivel de conexion no reconocido no debe considerarse sano');

// --- sin conexiones declaradas: ready_to_run true (nada que verificar) -----------
const vacio = checkConnectionHealth([], { tenant_id: 'joel', now });
if (vacio.ready_to_run !== true || vacio.total !== 0) throw new Error('Sin conexiones declaradas, no hay nada que bloquee');

console.log(JSON.stringify({
  ok: true,
  node: 'connection-health-check',
  niveles_evaluados: ['mcp', 'oauth2', 'live_browser_manual'],
  reutiliza_scraping_session_guard: true,
}));
