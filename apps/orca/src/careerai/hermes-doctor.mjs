import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

// Hermes se puede alcanzar por dos transportes: HTTP (HERMES_API_KEY) o CLI local
// (HERMES_CLI_PATH). El doctor original solo miraba la API key y reportaba
// `requires_configuration` aunque el CLI estuviera instalado y respondiendo.
export function hermesDoctor() {
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
