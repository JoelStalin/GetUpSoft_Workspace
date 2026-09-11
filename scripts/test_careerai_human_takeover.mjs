import assert from 'node:assert/strict';
import { decideHumanTakeover, resolveHumanTakeover } from '../platform/orca/src/careerai/human-takeover.mjs';

const sinBloqueo = decideHumanTakeover({ url: 'https://www.linkedin.com/jobs/view/1', bodyText: 'Senior Developer', sessionId: 's1' });
assert.equal(sinBloqueo.takeover_required, false);

const conCaptcha = decideHumanTakeover({ url: 'https://www.linkedin.com/checkpoint/challenge', bodyText: 'verify it\'s you', sessionId: 's2' });
assert.equal(conCaptcha.takeover_required, true);
assert.equal(conCaptcha.status, 'ceded_to_human');
assert.equal(conCaptcha.automated_action_taken, false);

const razonManual = decideHumanTakeover({ url: 'https://portal.example.com/apply', bodyText: 'formulario normal', sessionId: 's3', reason: 'el portal pide 2FA por SMS' });
assert.equal(razonManual.takeover_required, true);
assert.equal(razonManual.reason, 'el portal pide 2FA por SMS');

const sinSession = decideHumanTakeover({ url: 'x', bodyText: 'captcha' });
assert.equal(sinSession.ok, false);

const resuelto = resolveHumanTakeover({ takeoverRequest: conCaptcha, sessionId: 's2' });
assert.equal(resuelto.ok, true);
assert.equal(resuelto.status, 'resumed');

const sessionEquivocada = resolveHumanTakeover({ takeoverRequest: conCaptcha, sessionId: 'otra-sesion' });
assert.equal(sessionEquivocada.ok, false, 'no debe resolver un takeover con un sessionId distinto al que lo abrio');

const sinTakeoverAbierto = resolveHumanTakeover({ takeoverRequest: sinBloqueo, sessionId: 's1' });
assert.equal(sinTakeoverAbierto.ok, false);

console.log(JSON.stringify({ ok: true, node: 'human-takeover', reutiliza_deteccion_de_bloqueo: true, nunca_actua_sobre_la_pagina: true, resolve_valida_mismo_session_id: true }));
