// Nodo external-form-fill para LinkedIn Easy Apply: PREPARE-ONLY, nunca envia. Reutiliza el
// clasificador de campos ya construido para Greenhouse/Lever (buildFillPlan en
// ats-adapters.mjs) en vez de reinventar "que campos son seguros de auto-rellenar" — la
// politica (nunca autorizacion de trabajo, salario, datos demograficos) ya esta ahi y
// probada.
//
// Regla explicita, igual que el resto de senders/formularios del proyecto: se rellenan los
// campos seguros, se deja constancia de lo que necesita revision humana, y se PARA antes de
// cualquier boton de envio/submit/review-final. Ese click final es de quien aprueba, no de
// este nodo.
import { withNodeExecution } from './execution-debug.mjs';
import { buildFillPlan } from './ats-adapters.mjs';
import { detectBlocked } from './linkedin-jobs-node.mjs';
import { validateAsset } from './file-upload-handler.mjs';

// Bug real encontrado con evidencia (2026-09-07), diagnosticado con scripts/
// _debug_easy_apply_button.mjs contra la vacante real de Stefanini LATAM (no adivinado): el
// selector asumia `button[...]`, pero LinkedIn implementa "Solicitud sencilla"/"Easy Apply"
// como un elemento `<a aria-label="Solicitud sencilla">` (un LINK, no un button semantico) —
// confirmado inspeccionando la cadena real de ancestros del texto visible. De ahi que el
// primer intento reportara "not_easy_apply" en una vacante que si tenia el boton.
const EASY_APPLY_BUTTON_SELECTOR = 'a[aria-label*="Easy Apply" i], a[aria-label*="Solicitud sencilla" i], button.jobs-apply-button, button[aria-label*="Easy Apply" i], button[aria-label*="Solicitud sencilla" i], a:has-text("Solicitud sencilla"), a:has-text("Easy Apply"), button:has-text("Solicitud sencilla"), button:has-text("Easy Apply")';
// Cualquier boton que envia de verdad: jamas se hace click aqui, ni por accidente.
// Ampliado con el mismo criterio que EASY_APPLY_BUTTON_SELECTOR: LinkedIn usa <a>, no solo
// <button>, para sus controles de accion — este guard solo LEE isVisible, nunca hace click,
// asi que ampliar la cobertura solo hace el reporte mas fiel, no mas riesgoso.
const SUBMIT_LIKE_SELECTOR = 'a[aria-label*="Submit application" i], a[aria-label*="Enviar solicitud" i], button[aria-label*="Submit application" i], button[aria-label*="Enviar solicitud" i], a:has-text("Submit application"), a:has-text("Enviar solicitud"), button:has-text("Submit application"), button:has-text("Enviar solicitud")';

// Bug real encontrado (2026-09-07): antes caia a `document` completo si el selector del
// modal no matcheaba, y terminaba "extrayendo" el buscador de LinkedIn y otros controles de
// la pagina como si fueran campos del formulario — data falsa presentada a quien aprueba. Sin
// el modal detectado, es preferible fallar honesto (modal: null) a inventar campos.
const EASY_APPLY_MODAL_SELECTOR = 'div.jobs-easy-apply-modal, div[data-test-modal-id="easy-apply-modal"], div[role="dialog"]';

async function extractEasyApplyFields(page) {
  return page.evaluate((modalSelector) => {
    const modal = document.querySelector(modalSelector);
    if (!modal) return null;
    const controls = Array.from(modal.querySelectorAll('input:not([type="hidden"]), select, textarea'));
    return controls.map((el, index) => {
      const label = el.closest('div')?.querySelector('label')?.innerText?.trim()
        || el.getAttribute('aria-label')
        || el.placeholder
        || null;
      // Un selector estable por posicion, ya que Easy Apply no siempre pone ids limpios.
      const selector = el.id ? `#${el.id}` : `[data-easy-apply-index="${index}"]`;
      if (!el.id) el.setAttribute('data-easy-apply-index', String(index));
      return {
        name: el.name || null,
        id: el.id || null,
        label,
        type: el.tagName === 'SELECT' ? 'select' : (el.type || 'text'),
        required: el.required === true || el.getAttribute('aria-required') === 'true',
        selector,
      };
    });
  }, EASY_APPLY_MODAL_SELECTOR);
}

async function fillPlanIntoPage(page, plan) {
  const applied = [];
  for (const item of plan) {
    if (!item.selector) continue;
    try {
      if (item.action === 'upload') {
        // file-upload-handler.mjs: no se sube nada sin validar existencia/tipo/tamano
        // primero — subir un CV vacio o de la extension equivocada arruinaria la
        // postulacion y la revision humana lo descubriria demasiado tarde, ya en el
        // formulario.
        const validation = validateAsset(item.value, { fieldKey: item.asset || 'cv' });
        if (!validation.ok) throw new Error(`archivo rechazado antes de subir: ${validation.reason}`);
        await page.setInputFiles(item.selector, item.value);
      } else {
        await page.fill(item.selector, String(item.value));
      }
      applied.push({ field: item.field, action: item.action, ok: true });
    } catch (error) {
      // Un campo que no se puede rellenar de verdad pasa a revision humana, no se ignora en
      // silencio: quien apruebe necesita saber que ese dato no quedo puesto.
      applied.push({ field: item.field, action: item.action, ok: false, error: String(error?.message || error) });
    }
  }
  return applied;
}

// Nodo completo: navega a la vacante, abre Easy Apply si existe, extrae los campos del primer
// paso del formulario, arma el plan (buildFillPlan, ya probado) y rellena SOLO lo seguro.
// Jamas hace click en Next/Review/Submit — el screenshot final es la evidencia de en que
// quedo, para que la aprobacion humana decida el resto.
export async function prepareLinkedInEasyApply(runId, {
  page,
  jobUrl,
  profile = {},
  assets = {},
  screenshotPath = null,
} = {}) {
  if (!page) throw new Error('prepareLinkedInEasyApply necesita un page ya logueado');
  if (!jobUrl) throw new Error('prepareLinkedInEasyApply necesita jobUrl');

  return withNodeExecution(runId, 'external-form-fill', async () => {
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const url = typeof page.url === 'function' ? page.url() : jobUrl;
    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 2000)).catch(() => '');
    if (detectBlocked(url, bodyText)) {
      if (screenshotPath) await page.screenshot({ path: screenshotPath }).catch(() => {});
      return { ok: false, status: 'blocked', blocked_at: 'linkedin_checkpoint', reason: 'LinkedIn pidio verificacion/checkpoint/captcha', url, submit_performed: false };
    }

    // Bug real encontrado y corregido (2026-09-07): sin esta espera, la primera corrida en
    // vivo reporto "not_easy_apply" contra una pagina que en realidad no habia terminado de
    // renderizar (el screenshot mostraba el pie de pagina de LinkedIn, no la vacante) — un
    // falso negativo que habria descartado una vacante real sin haberla mirado de verdad.
    // page.locator().isVisible() no espera a que el elemento exista, solo consulta el estado
    // actual; hace falta esperar activamente a que el contenido de la vacante monte.
    const easyApplyButton = page.locator(EASY_APPLY_BUTTON_SELECTOR).first();
    await easyApplyButton.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    const hasEasyApply = await easyApplyButton.isVisible().catch(() => false);
    if (!hasEasyApply) {
      if (screenshotPath) await page.screenshot({ path: screenshotPath }).catch(() => {});
      return {
        ok: true, status: 'not_easy_apply', job_url: jobUrl,
        reason: 'esta vacante no tiene Easy Apply; requiere el sitio externo del empleador (fuera de alcance de este nodo)',
        submit_performed: false, approval_required: true,
      };
    }
    await easyApplyButton.click();
    // Espera activa a que el modal realmente monte, en vez de un timeout fijo ciego: el click
    // en vivo (2026-09-07) a veces no abria el modal a tiempo para un timeout de 1.5s.
    const modalAppeared = await page.locator(EASY_APPLY_MODAL_SELECTOR).first()
      .waitFor({ state: 'visible', timeout: 6000 }).then(() => true).catch(() => false);

    if (!modalAppeared) {
      if (screenshotPath) await page.screenshot({ path: screenshotPath }).catch(() => {});
      return {
        ok: true, status: 'modal_not_detected', job_url: jobUrl,
        reason: 'se hizo click en Easy Apply pero el modal del formulario no aparecio a tiempo; revisar manualmente, no se inventaron campos',
        submit_performed: false, approval_required: true,
      };
    }

    const fields = await extractEasyApplyFields(page);
    if (fields === null) {
      if (screenshotPath) await page.screenshot({ path: screenshotPath }).catch(() => {});
      return {
        ok: true, status: 'modal_not_detected', job_url: jobUrl,
        reason: 'el modal aparecio pero no se pudo leer su estructura; revisar manualmente, no se inventaron campos',
        submit_performed: false, approval_required: true,
      };
    }
    const plan = buildFillPlan(fields, { profile, assets });
    const applied = await fillPlanIntoPage(page, plan.plan);

    if (screenshotPath) await page.screenshot({ path: screenshotPath }).catch(() => {});

    // Guarda extra, redundante a proposito: si por lo que sea el codigo llegara a intentar
    // clickear un boton de envio, esto lo bloquea explicitamente antes de devolver el control.
    const submitVisible = await page.locator(SUBMIT_LIKE_SELECTOR).first().isVisible().catch(() => false);

    return {
      ok: true, status: 'ready_for_review', job_url: jobUrl,
      total_fields: plan.total_fields,
      fillable: plan.fillable,
      pending_human: plan.pending_human,
      can_submit_without_human: plan.can_submit_without_human,
      blocking_required_fields: plan.blocking_required_fields,
      applied,
      pending: plan.pending,
      submit_button_visible: submitVisible,
      submit_performed: false,
      approval_required: true,
      mode: 'prepare_only',
    };
  });
}
