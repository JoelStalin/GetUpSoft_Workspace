import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

// Hermes se puede alcanzar por dos transportes: HTTP (HERMES_API_KEY) o CLI local
// (HERMES_CLI_PATH). El doctor original solo miraba la API key y reportaba
// `requires_configuration` aunque el CLI estuviera instalado y respondiendo.
// La comprobacion del CLI es sincrona y tarda ~2 s. Ejecutarla en cada peticion bloqueaba
// el event loop del servidor local y dejaba el panel de estado cargando indefinidamente.
// La version del CLI no cambia entre peticiones, asi que se cachea.
let cache = null;

// El TTL se lee en cada llamada, no al cargar el modulo: leerlo una sola vez impedia
// cambiarlo en pruebas. Y se distingue el 0 explicito del valor ausente, porque
// `0 || 60000` daba 60000 y hacia imposible desactivar la cache.
function cacheTtlMs() {
  const raw = process.env.HERMES_DOCTOR_TTL_MS;
  if (raw === undefined || raw === '') return 60000;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 60000;
}

export function hermesDoctor({ force = false } = {}) {
  const ttl = cacheTtlMs();
  if (!force && ttl > 0 && cache && Date.now() - cache.at < ttl) return cache.value;
  const value = probeHermes();
  cache = { at: Date.now(), value };
  return value;
}

function probeHermes() {
  if (process.env.HERMES_API_KEY) {
    return { ok: true, status: 'configured', transport: 'http' };
  }
  const cliPath = process.env.HERMES_CLI_PATH;
  if (cliPath && fs.existsSync(cliPath)) {
    try {
      const version = execFileSync(cliPath, ['--version'], { encoding: 'utf8', timeout: 15000 })
        .split(/\r?\n/)[0]
        .trim();
      return { ok: true, status: 'configured', transport: 'cli', version };
    } catch (error) {
      return { ok: true, status: 'requires_configuration', transport: 'cli', reason: 'cli_not_responding' };
    }
  }
  return { ok: true, status: 'requires_configuration', transport: null, reason: 'no_api_key_or_cli' };
}
