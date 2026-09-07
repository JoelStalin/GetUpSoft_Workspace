import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareLinkedInEasyApply } from '../apps/orca/src/careerai/linkedin-easy-apply-node.mjs';
import { getNodeExecutionData } from '../apps/orca/src/careerai/execution-debug.mjs';

const profile = { email: 'candidato@example.invalid', phone: '+18095550100', first_name: 'Joel' };
const assets = { cv: '/tmp/cv.pdf' };

function makeFakePage({ hasEasyApply = true, hasModal = true, fields = [], filledOk = true } = {}) {
  const clicks = [];
  const filledSelectors = [];
  const page = {
    _url: 'https://www.linkedin.com/jobs/view/123',
    goto: async (url) => { page._url = url; },
    url: () => page._url,
    evaluate: async () => {
      // Primera llamada: bodyText (deteccion de bloqueo). Segunda: extraccion de campos.
      page._calls = (page._calls || 0) + 1;
      if (page._calls === 1) return 'Jobs you might like';
      return hasModal ? fields : null;
    },
    locator: (selector) => ({
      first: () => ({
        isVisible: async () => {
          if (/jobs-apply-button|Easy Apply/i.test(selector)) return hasEasyApply;
          if (/Submit application/i.test(selector)) return false; // nunca visible en el flujo feliz de prueba
          return false;
        },
        waitFor: async ({ state } = {}) => {
          let visible = false;
          if (/jobs-apply-button|Easy Apply/i.test(selector)) visible = hasEasyApply;
          else if (/role="dialog"|easy-apply-modal/i.test(selector)) visible = hasModal;
          if (state === 'visible' && !visible) throw new Error('timeout esperando visibilidad (fixture)');
        },
        click: async () => { clicks.push(selector); },
      }),
    }),
    fill: async (selector, value) => {
      if (!filledOk) throw new Error('campo no editable en este fixture');
      filledSelectors.push({ selector, value });
    },
    setInputFiles: async (selector, value) => { filledSelectors.push({ selector, value, upload: true }); },
    waitForTimeout: async () => {},
    screenshot: async () => {},
  };
  page._clicks = clicks;
  page._filled = filledSelectors;
  return page;
}

// --- caso feliz: rellena lo seguro, deja lo sensible para revision, NUNCA envia ---------
const runId = `test-easy-apply-${Date.now()}`;
const fields = [
  { name: 'email', label: 'Email', type: 'text', required: true, selector: '#email' },
  { name: 'phone', label: 'Phone number', type: 'text', required: true, selector: '#phone' },
  { name: 'salary_expectation', label: 'Expected salary', type: 'text', required: false, selector: '#salary' },
  { name: 'work_authorization', label: 'Are you authorized to work?', type: 'text', required: true, selector: '#auth' },
];
const pageFeliz = makeFakePage({ hasEasyApply: true, fields });
const resultado = await prepareLinkedInEasyApply(runId, {
  page: pageFeliz, jobUrl: 'https://www.linkedin.com/jobs/view/123', profile, assets,
});

if (resultado.ok !== true || resultado.status !== 'ready_for_review') throw new Error('Debe completarse y quedar listo para revision');
if (resultado.submit_performed !== false) throw new Error('Un nodo prepare-only jamas debe marcar submit_performed:true');
if (resultado.fillable !== 2) throw new Error('Solo email y phone son seguros de rellenar (2)');
if (resultado.pending_human !== 2) throw new Error('salary_expectation y work_authorization deben quedar para revision humana');
if (resultado.can_submit_without_human !== false) throw new Error('work_authorization es obligatorio y bloqueado: no se puede enviar solo');
if (!resultado.blocking_required_fields.includes('Phone number') === false) { /* phone si se resolvio */ }
if (resultado.blocking_required_fields.length !== 1 || !resultado.blocking_required_fields[0].includes('authorized')) {
  throw new Error('Debe listar exactamente el campo obligatorio sin resolver (work_authorization)');
}
if (pageFeliz._clicks.some((c) => /Submit application/i.test(c))) throw new Error('Jamas debe clickear un boton de envio');
if (pageFeliz._filled.length !== 2) throw new Error('Debe haber rellenado exactamente los 2 campos seguros');

// Registrado via execution-debug.mjs como el nodo real "external-form-fill".
const grabado = getNodeExecutionData(runId, 'external-form-fill');
if (!grabado.last || grabado.last.output.submit_performed !== false) throw new Error('Debe grabar la ejecucion con submit_performed:false');

// --- sin Easy Apply: reporta claro, no inventa un formulario ----------------------------
const runIdSinEasyApply = `test-easy-apply-none-${Date.now()}`;
const pageSinEasyApply = makeFakePage({ hasEasyApply: false });
const sinEasyApply = await prepareLinkedInEasyApply(runIdSinEasyApply, {
  page: pageSinEasyApply, jobUrl: 'https://www.linkedin.com/jobs/view/999', profile, assets,
});
if (sinEasyApply.status !== 'not_easy_apply') throw new Error('Sin boton de Easy Apply, debe reportarlo en vez de improvisar');
if (sinEasyApply.submit_performed !== false) throw new Error('Debe seguir siendo submit_performed:false');

// --- modal no aparece tras el click: fallar honesto, NUNCA inventar campos del document --
// Bug real encontrado en vivo (2026-09-07): sin este caso, un click que no abre el modal
// terminaba "extrayendo" el buscador y otros controles de toda la pagina como si fueran del
// formulario. Este test fija ese comportamiento: sin modal, sin campos inventados.
const runIdSinModal = `test-easy-apply-no-modal-${Date.now()}`;
const pageSinModal = makeFakePage({ hasEasyApply: true, hasModal: false });
const sinModal = await prepareLinkedInEasyApply(runIdSinModal, {
  page: pageSinModal, jobUrl: 'https://www.linkedin.com/jobs/view/1', profile, assets,
});
if (sinModal.status !== 'modal_not_detected') throw new Error('Si el modal no aparece, debe reportarlo explicitamente');
if (sinModal.submit_performed !== false) throw new Error('Debe seguir siendo submit_performed:false');
if ('fillable' in sinModal) throw new Error('Sin modal detectado, no debe reportar ningun campo como rellenado');

// --- checkpoint/captcha: para y reporta ---------------------------------------------------
const runIdBloqueado = `test-easy-apply-blocked-${Date.now()}`;
const pageBloqueada = {
  goto: async () => {}, url: () => 'https://www.linkedin.com/checkpoint/challenge',
  evaluate: async () => 'verify it\'s you', screenshot: async () => {},
};
const bloqueado = await prepareLinkedInEasyApply(runIdBloqueado, { page: pageBloqueada, jobUrl: 'https://www.linkedin.com/jobs/view/1', profile, assets });
if (bloqueado.status !== 'blocked' || bloqueado.blocked_at !== 'linkedin_checkpoint') throw new Error('Un checkpoint debe pararse y reportarse');

// --- un campo que falla al rellenar no se pierde en silencio -----------------------------
const runIdFalloRelleno = `test-easy-apply-fill-fail-${Date.now()}`;
const pageFalloRelleno = makeFakePage({ hasEasyApply: true, fields: [{ name: 'email', label: 'Email', type: 'text', required: true, selector: '#email' }], filledOk: false });
const falloRelleno = await prepareLinkedInEasyApply(runIdFalloRelleno, { page: pageFalloRelleno, jobUrl: 'https://www.linkedin.com/jobs/view/1', profile, assets });
if (!falloRelleno.applied.some((a) => a.ok === false)) throw new Error('Un campo que fallo al rellenarse debe quedar reportado, no silenciado');

// Limpieza.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const id of [runId, runIdSinEasyApply, runIdSinModal, runIdBloqueado, runIdFalloRelleno]) {
  fs.rmSync(path.join(root, 'data', 'careerai', 'executions', `${id}.json`), { force: true });
}

console.log(JSON.stringify({
  ok: true,
  node: 'external-form-fill',
  provider: 'linkedin_easy_apply',
  reutiliza_buildFillPlan_existente: true,
  jamas_clickea_submit: true,
  campos_sensibles_van_a_revision_humana: true,
  reporta_fallo_de_relleno_en_vez_de_silenciarlo: true,
  mode: 'prepare_only',
}));
