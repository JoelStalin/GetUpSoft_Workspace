// Nodo connection-health-check. Evalua, ANTES de arrancar la corrida, si todas las conexiones
// que necesita ya estan sanas: MCP conectado, token OAuth2 vigente, o sesion de live browser
// viva (reutilizando el mismo criterio de scraping-session-guard). Logica pura: no conecta a
// nada, no refresca tokens, solo agrega el estado que se le pasa y decide si la corrida puede
// empezar o debe pausar a esperar reconexion.
//
// Por que un chequeo aparte de scraping-session-guard: ese verifica la sesion justo antes de
// CADA accion de scraping durante la corrida; este evalua TODAS las conexiones necesarias de
// una vez, al principio, para no arrancar una corrida larga (discovery, analisis, preparacion)
// que va a fallar a mitad de camino por una conexion que ya se sabia caduca.

import { checkSessionAlive } from './scraping-session-guard.mjs';

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function checkOne(connection, { tenant_id, now }) {
  const platform = connection.platform || '(sin nombre)';

  if (connection.level === 'mcp') {
    return connection.mcp_available
      ? { platform, level: 'mcp', healthy: true, reason: 'conector MCP disponible' }
      : { platform, level: 'mcp', healthy: false, reason: 'el conector MCP declarado ya no esta disponible' };
  }

  if (connection.level === 'oauth2') {
    if (!connection.oauth_token) {
      return { platform, level: 'oauth2', healthy: false, reason: 'no hay token OAuth2 almacenado' };
    }
    const expiresAt = toDate(connection.oauth_expires_at);
    if (expiresAt && now.getTime() >= expiresAt.getTime()) {
      return { platform, level: 'oauth2', healthy: false, reason: 'el token OAuth2 vencio; requiere refresco o re-autorizacion' };
    }
    return { platform, level: 'oauth2', healthy: true, reason: 'token OAuth2 vigente' };
  }

  if (connection.level === 'live_browser_manual') {
    const sesion = checkSessionAlive(connection.session, { tenant_id, portal: platform, now });
    return { platform, level: 'live_browser_manual', healthy: sesion.alive === true, reason: sesion.reason, session_status: sesion.status };
  }

  return { platform, level: connection.level || null, healthy: false, reason: `nivel de conexion desconocido: "${connection.level}"` };
}

export function checkConnectionHealth(connections = [], { tenant_id, now = new Date() } = {}) {
  const results = connections.map((connection) => checkOne(connection, { tenant_id, now }));
  const unhealthy = results.filter((result) => !result.healthy);

  return {
    ok: true,
    ready_to_run: unhealthy.length === 0,
    total: results.length,
    healthy_count: results.length - unhealthy.length,
    results,
    unhealthy,
  };
}
