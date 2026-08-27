import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

// Hermes se puede alcanzar por dos transportes: HTTP (HERMES_API_KEY) o CLI local
// (HERMES_CLI_PATH). El doctor original solo miraba la API key y reportaba
// `requires_configuration` aunque el CLI estuviera instalado y respondiendo.
// La comprobacion del CLI es sincrona y tarda ~2 s. Ejecutarla en cada peticion bloqueaba
// el event loop del servidor local y dejaba el panel de estado cargando indefinidamente.
// La version del CLI no cambia entre peticiones, asi que se cachea.
const CACHE_TTL_MS = Number(process.env.HERMES_DOCTOR_TTL_MS || 60000);
let cache = null;

export function hermesDoctor({ force = false } = {}) {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;
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
