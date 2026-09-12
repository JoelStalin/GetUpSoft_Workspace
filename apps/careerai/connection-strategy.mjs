// Nodo connection-strategy-router y su registro mcp-connector-registry. Decide el NIVEL de
// conexion por plataforma sin conectarse a nada: es una decision pura, igual que ats-router.
//
// Orden estricto (cascada), del menos invasivo al mas invasivo:
//   1. mcp        -> ya existe un conector MCP para la plataforma: se usa, no se reinventa.
//   2. oauth2      -> no hay MCP pero la plataforma soporta OAuth2 con PKCE: pantalla estandar,
//                     token en vault cifrado por tenant, sin ver la contrasena del cliente.
//   3. live_browser_manual -> ni MCP ni OAuth2 usable: el cliente hace login manual una vez en
//                     el navegador visible; se persiste la sesion/cookies para scraping despues.
//
// Regla que gobierna el modulo: nunca se elige un nivel mas invasivo que el necesario, y nunca
// se inventa un conector MCU/OAuth2 que no esta declarado en el registro.

// Conectores MCP realmente disponibles hoy (los que existen como MCP server conectado en esta
// sesion de Claude Code). Declarar uno que no existe enviaria el connector-strategy-router a
// "listo" cuando en realidad no hay nada que llamar.
const MCP_REGISTRY = {
  gmail: { available: true, preferred_level: 'mcp' },
  google_drive: { available: true, preferred_level: 'mcp' },
  github: { available: true, preferred_level: 'mcp' },
  slack: { available: true, preferred_level: 'mcp' },
};

// Plataformas con OAuth2 + PKCE utilizable sin credenciales adicionales del cliente ademas de
// lo ya provisto (client_id/client_secret de la app registrada).
const OAUTH2_REGISTRY = {
  linkedin: { available: true, scopes: ['r_liteprofile'] },
  google_drive: { available: true, scopes: ['drive.readonly'] },
  gmail: { available: true, scopes: ['gmail.readonly', 'gmail.compose'] },
};

// Plataformas sin API/OAuth2 usable para lo que CareerAI necesita: solo queda login manual del
// cliente en live browser, con sesion persistida para operar despues.
const LIVE_BROWSER_ONLY = new Set(['indeed', 'glassdoor', 'workday', 'greenhouse', 'lever']);

export function getMcpConnectorRegistry() {
  // Copia defensiva: el registro es de solo lectura desde afuera.
  return JSON.parse(JSON.stringify(MCP_REGISTRY));
}

export function decideConnectionLevel(platform) {
  const key = String(platform || '').toLowerCase().trim();
  if (!key) {
    return { ok: false, platform, level: null, reason: 'plataforma vacia o invalida' };
  }

  const mcp = MCP_REGISTRY[key];
  if (mcp && mcp.available) {
    return {
      ok: true, platform: key, level: 'mcp',
      reason: 'conector MCP ya disponible; se usa en vez de reinventar la conexion',
      requires_manual_login: false,
    };
  }

  const oauth = OAUTH2_REGISTRY[key];
  if (oauth && oauth.available) {
    return {
      ok: true, platform: key, level: 'oauth2',
      reason: 'sin conector MCP; OAuth2/PKCE disponible con vault cifrado por tenant',
      requires_manual_login: false,
      scopes: oauth.scopes,
    };
  }

  if (LIVE_BROWSER_ONLY.has(key)) {
    return {
      ok: true, platform: key, level: 'live_browser_manual',
      reason: 'sin MCP ni OAuth2 usable; requiere login manual del cliente una vez',
      requires_manual_login: true,
    };
  }

  // Plataforma no declarada en ningun registro: no se asume un nivel, se pausa para revision.
  return {
    ok: true, platform: key, level: 'unknown', pause: true,
    reason: 'plataforma no declarada en ningun registro de conexion; requiere revision humana',
    requires_manual_login: false,
  };
}
