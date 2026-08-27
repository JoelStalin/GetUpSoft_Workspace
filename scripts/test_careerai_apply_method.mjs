import { classifyApplyMethod, triggerAnalysis, APPLY_METHODS } from '../apps/orca/src/careerai/apply-method-classifier.mjs';

// 1. Boton nativo de la plataforma: la via mas barata.
const facil = classifyApplyMethod({
  title: 'Coordinador de Operaciones',
  description: 'Easy Apply desde la plataforma.',
  canonical_url: 'https://ejemplo-board.com/jobs/1',
});
if (facil.method !== APPLY_METHODS.EASY) throw new Error(`Esperaba easy_apply, obtuve ${facil.method}`);
if (facil.requires.includes('webscraping')) throw new Error('El boton nativo no necesita scraping');

// 2. Correo: exige una direccion real, no basta con la frase.
const correo = classifyApplyMethod({
  title: 'Analista',
  description: 'Envie su CV a reclutamiento@empresa.com indicando la vacante.',
  canonical_url: 'https://ejemplo-board.com/jobs/2',
});
if (correo.method !== APPLY_METHODS.EMAIL) throw new Error(`Esperaba email_apply, obtuve ${correo.method}`);
if (correo.recipient !== 'reclutamiento@empresa.com') throw new Error('Debe extraer el destinatario');
if (!correo.requires.includes('approval')) throw new Error('Un correo enviado no se puede retirar: exige aprobacion');
if (!correo.requires.includes('cover_letter')) throw new Error('El correo adjunta CV y carta');

const frasesSinCorreo = classifyApplyMethod({
  description: 'Envie su CV a la direccion indicada en nuestro portal.',
  canonical_url: 'https://ejemplo-board.com/jobs/3',
});
if (frasesSinCorreo.method === APPLY_METHODS.EMAIL) throw new Error('Sin direccion real no es postulacion por correo');

// 3. Formulario externo en ATS conocido: exige scraping y antibot.
const externo = classifyApplyMethod({
  title: 'Ingeniero',
  description: 'Complete el formulario para postular.',
  canonical_url: 'https://ejemplo-board.com/jobs/4',
  apply_url: 'https://boards.greenhouse.io/empresa/jobs/9876',
});
if (externo.method !== APPLY_METHODS.EXTERNAL_FORM) throw new Error('Un ATS externo es formulario externo');
if (externo.ats !== 'greenhouse') throw new Error('Debe identificar el ATS para elegir adaptador');
for (const requisito of ['webscraping', 'antibot', 'session', 'approval']) {
  if (!externo.requires.includes(requisito)) throw new Error(`El formulario externo exige ${requisito}`);
}
if (externo.pause_on_unknown_domain !== false) throw new Error('Un ATS conocido no debe pausar por dominio');

// 4. Dominio externo desconocido: formulario, pero se pausa antes de tocarlo.
const desconocido = classifyApplyMethod({
  description: 'Postule en nuestro portal.',
  canonical_url: 'https://ejemplo-board.com/jobs/5',
  apply_url: 'https://portal-raro.example/apply/7',
});
if (desconocido.method !== APPLY_METHODS.EXTERNAL_FORM) throw new Error('Sale a otro dominio: es formulario externo');
if (desconocido.pause_on_unknown_domain !== true) throw new Error('Un dominio no reconocido debe pausar');

// 5. Barreras reales: no se puede completar, y el cliente se entera.
const conCuenta = classifyApplyMethod({
  description: 'Create an account to apply for this position.',
  canonical_url: 'https://ejemplo-board.com/jobs/6',
});
if (conCuenta.method !== APPLY_METHODS.UNSUPPORTED) throw new Error('Cuenta previa obligatoria no es automatizable');
if (conCuenta.report_to_client !== true) throw new Error('Lo no completable va al reporte del cliente');
if (conCuenta.reason !== 'account_required') throw new Error('Debe decir por que no se pudo');

// 6. Sin senal no se adivina la via.
const ambigua = classifyApplyMethod({ description: 'Buscamos profesional con experiencia.', canonical_url: 'https://ejemplo-board.com/jobs/7' });
if (ambigua.method !== APPLY_METHODS.UNSUPPORTED) throw new Error('Sin senal no se debe adivinar la via');
if (ambigua.report_to_client !== true) throw new Error('La ambigua tambien se reporta al cliente');

// --- disparador: solo las posiciones nuevas entran al analisis ---------------
const lote = [
  { opportunity_id: 'p1', title: 'Uno', description: 'Easy Apply', canonical_url: 'https://ejemplo-board.com/1' },
  { opportunity_id: 'p2', title: 'Dos', description: 'Envie su CV a rrhh@empresa.com', canonical_url: 'https://ejemplo-board.com/2' },
  { opportunity_id: 'p3', title: 'Tres', description: 'Formulario', canonical_url: 'https://ejemplo-board.com/3', apply_url: 'https://jobs.lever.co/x/1' },
  { opportunity_id: 'p4', title: 'Cuatro', description: 'Create an account to apply', canonical_url: 'https://ejemplo-board.com/4' },
];
const disparo = triggerAnalysis(lote, new Set(['p1']));
if (disparo.new_positions !== 3) throw new Error('Solo las posiciones nuevas se analizan');
if (disparo.skipped_already_seen !== 1) throw new Error('Debe informar cuantas ya se habian visto');
if (disparo.by_method[APPLY_METHODS.EMAIL] !== 1) throw new Error('Debe contar por metodo');
if (disparo.for_client_report.length !== 1) throw new Error('Debe agrupar lo no completable para el reporte');

console.log(JSON.stringify({
  ok: true,
  node: 'apply-method-classifier',
  metodos: Object.values(APPLY_METHODS),
  nuevas_analizadas: disparo.new_positions,
  ya_vistas_omitidas: disparo.skipped_already_seen,
  para_reporte_al_cliente: disparo.for_client_report.length,
}));
