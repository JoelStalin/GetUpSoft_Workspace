import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hermesDoctor } from '../apps/orca/src/careerai/hermes-doctor.mjs';

const original = {
  key: process.env.HERMES_API_KEY,
  cli: process.env.HERMES_CLI_PATH,
  ttl: process.env.HERMES_DOCTOR_TTL_MS,
};
const restaurar = () => {
  for (const [env, value] of [['HERMES_API_KEY', original.key], ['HERMES_CLI_PATH', original.cli], ['HERMES_DOCTOR_TTL_MS', original.ttl]]) {
    if (value === undefined) delete process.env[env];
    else process.env[env] = value;
  }
};

try {
  // --- transporte HTTP: la API key manda -------------------------------------
  process.env.HERMES_API_KEY = 'clave-de-prueba';
  delete process.env.HERMES_CLI_PATH;
  const http = hermesDoctor({ force: true });
  if (http.status !== 'configured' || http.transport !== 'http') {
    throw new Error('Con API key el transporte es http');
  }

  // --- sin nada configurado ---------------------------------------------------
  delete process.env.HERMES_API_KEY;
  const nada = hermesDoctor({ force: true });
  if (nada.status !== 'requires_configuration') throw new Error('Sin key ni CLI debe pedir configuracion');
  if (nada.reason !== 'no_api_key_or_cli') throw new Error('Debe decir que falta');
  if (nada.transport !== null) throw new Error('Sin transporte disponible, transport es null');

  // --- CLI declarado pero inexistente ----------------------------------------
  process.env.HERMES_CLI_PATH = path.join(os.tmpdir(), 'no-existe-este-binario-hermes');
  const inexistente = hermesDoctor({ force: true });
  if (inexistente.status !== 'requires_configuration') throw new Error('Un CLI que no existe no configura nada');

  // --- CLI que existe pero falla ----------------------------------------------
  // El defecto original: Hermes imprime su error y sale con codigo 0. Aqui se usa un
  // ejecutable que falla de verdad para comprobar que el fallo no se toma por exito.
  const roto = path.join(os.tmpdir(), `hermes-roto-${Date.now()}.cmd`);
  fs.writeFileSync(roto, '@echo off\nexit /b 1\n');
  process.env.HERMES_CLI_PATH = roto;
  const fallando = hermesDoctor({ force: true });
  if (fallando.status !== 'requires_configuration') throw new Error('Un CLI que falla no debe reportarse como configurado');
  if (fallando.reason !== 'cli_not_responding') throw new Error('Debe decir que el CLI no responde');
  fs.unlinkSync(roto);

  // --- la cache: el motivo por el que este modulo existe ----------------------
  // Ejecutar el CLI en cada peticion bloqueaba el event loop del servidor: /api/stats
  // tardaba 6 s y el panel de estado del editor se cancelaba antes de recibir respuesta.
  process.env.HERMES_API_KEY = 'clave-para-medir-cache';
  delete process.env.HERMES_CLI_PATH;
  const primera = hermesDoctor({ force: true });
  const cacheada = hermesDoctor();
  if (cacheada !== primera) throw new Error('La segunda llamada debe devolver el objeto cacheado, no recalcular');

  // `force` salta la cache: sirve para revalidar tras configurar Hermes.
  const forzada = hermesDoctor({ force: true });
  if (forzada === primera) throw new Error('force debe recalcular, no devolver la cache');

  // Con TTL cero la cache no aplica nunca.
  process.env.HERMES_DOCTOR_TTL_MS = '0';
  const sinCache1 = hermesDoctor({ force: true });
  const sinCache2 = hermesDoctor();
  if (sinCache1 === sinCache2) throw new Error('Con TTL cero cada llamada debe recalcular');

  console.log(JSON.stringify({
    ok: true,
    node: 'hermes-doctor',
    transportes: ['http', 'cli', null],
    cache_evita_bloquear_event_loop: true,
    cli_fallido_no_cuenta_como_configurado: true,
  }));
} finally {
  restaurar();
}
