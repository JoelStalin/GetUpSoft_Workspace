import { decideConnectionLevel, getMcpConnectorRegistry } from '../apps/orca/src/careerai/connection-strategy.mjs';

// --- nivel 1: MCP ya disponible, no se reinventa -----------------------------
const gmail = decideConnectionLevel('gmail');
if (gmail.level !== 'mcp' || gmail.requires_manual_login !== false) {
  throw new Error('Gmail tiene MCP disponible: debe usarlo, no pedir login manual');
}

const drive = decideConnectionLevel('google_drive');
if (drive.level !== 'mcp') throw new Error('Google Drive tiene MCP; debe preferirse sobre OAuth2');

// --- nivel 2: sin MCP pero con OAuth2/PKCE -----------------------------------
const linkedin = decideConnectionLevel('linkedin');
if (linkedin.level !== 'oauth2' || linkedin.requires_manual_login !== false) {
  throw new Error('LinkedIn sin MCP declarado debe caer a OAuth2, no a login manual');
}
if (!Array.isArray(linkedin.scopes) || linkedin.scopes.length === 0) {
  throw new Error('OAuth2 debe declarar los scopes que va a pedir');
}

// --- nivel 3: sin MCP ni OAuth2 usable -> login manual del cliente ------------
const indeed = decideConnectionLevel('indeed');
if (indeed.level !== 'live_browser_manual' || indeed.requires_manual_login !== true) {
  throw new Error('Indeed sin MCP ni OAuth2 debe requerir login manual en live browser');
}

const workday = decideConnectionLevel('workday');
if (workday.level !== 'live_browser_manual') throw new Error('Workday tampoco tiene MCP/OAuth2: login manual');

// --- plataforma no declarada: pausa, no se inventa un nivel -------------------
const desconocida = decideConnectionLevel('portal-nuevo-sin-registrar');
if (desconocida.level !== 'unknown' || desconocida.pause !== true) {
  throw new Error('Una plataforma no registrada debe pausar, no asumir un nivel');
}

// --- entrada vacia -------------------------------------------------------------
const vacia = decideConnectionLevel('');
if (vacia.ok !== false) throw new Error('Una plataforma vacia debe fallar explicitamente');

// --- el registro MCP es de solo lectura hacia afuera --------------------------
const registryA = getMcpConnectorRegistry();
registryA.gmail.available = false;
const registryB = getMcpConnectorRegistry();
if (registryB.gmail.available !== true) {
  throw new Error('El registro MCP debe devolver una copia; mutar el resultado no debe afectar futuras lecturas');
}

console.log(JSON.stringify({
  ok: true,
  nodes: ['connection-strategy-router', 'mcp-connector-registry'],
  niveles_probados: ['mcp', 'oauth2', 'live_browser_manual', 'unknown'],
  plataformas_mcp: Object.keys(registryB).filter((k) => registryB[k].available),
  registro_inmutable_hacia_afuera: true,
}));
