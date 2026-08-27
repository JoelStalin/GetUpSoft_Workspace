import { routeAts, buildFillPlan, getAdapter } from '../apps/orca/src/careerai/ats-adapters.mjs';

// --- ats-router --------------------------------------------------------------
const gh = routeAts('https://boards.greenhouse.io/empresa/jobs/123');
if (gh.ats !== 'greenhouse' || !gh.adapter_available || gh.pause) throw new Error('Greenhouse debe enrutarse y estar listo');

const lever = routeAts('https://jobs.lever.co/empresa/abc-123');
if (lever.ats !== 'lever' || !lever.adapter_available) throw new Error('Lever debe enrutarse y estar listo');

// ATS reconocido pero sin adaptador: se pausa en vez de improvisar.
const wd = routeAts('https://empresa.myworkdayjobs.com/es/job/1');
if (wd.ats !== 'workday') throw new Error('Debe reconocer Workday');
if (wd.adapter_available !== false || wd.pause !== true) throw new Error('Sin adaptador debe pausar, no improvisar');
if (!/aun no existe/.test(wd.reason)) throw new Error('Debe explicar por que pausa');

// Dominio desconocido: pausa obligatoria.
const raro = routeAts('https://portal-desconocido.example/apply/1');
if (raro.status !== 'unknown_domain' || raro.pause !== true) throw new Error('Un dominio desconocido debe pausar');

const malaUrl = routeAts('no-es-una-url');
if (malaUrl.ok !== false || malaUrl.pause !== true) throw new Error('Una URL invalida debe pausar');

// --- plan de llenado ---------------------------------------------------------
const campos = [
  { name: 'first_name', label: 'First Name', required: true },
  { name: 'last_name', label: 'Last Name', required: true },
  { name: 'email', label: 'Email', required: true },
  { name: 'phone', label: 'Phone', required: false },
  { name: 'resume', label: 'Resume/CV', type: 'file', required: true },
  { name: 'cover_letter', label: 'Cover Letter', type: 'file', required: false },
  { name: 'work_authorization', label: 'Are you authorized to work in the US?', required: true },
  { name: 'salary', label: 'Salary expectation', required: false },
  { name: 'gender', label: 'Gender', required: false },
  { name: 'custom_q', label: 'Why do you want to work here?', required: false },
];

const perfil = { first_name: 'Maria', last_name: 'Gomez', email: 'maria@example.com', phone: '+1 555 0100' };
const artefactos = { cv: '/tmp/cv-adaptado.pdf', cover_letter: '/tmp/carta.pdf' };

const plan = buildFillPlan(campos, { profile: perfil, assets: artefactos });
if (plan.fillable !== 6) throw new Error(`Esperaba 6 campos rellenables, obtuve ${plan.fillable}`);

// Los campos que nunca se autorrellenan.
const bloqueado = (etiqueta) => plan.pending.find((item) => item.field === etiqueta);
if (bloqueado('Are you authorized to work in the US?')?.reason !== 'declaracion legal') {
  throw new Error('La autorizacion de trabajo es una declaracion legal: no se autorrellena');
}
if (bloqueado('Salary expectation')?.reason !== 'decision del candidato') {
  throw new Error('La expectativa salarial la decide el candidato');
}
if (bloqueado('Gender')?.reason !== 'dato sensible protegido') {
  throw new Error('Los datos demograficos protegidos no se autorrellenan');
}
if (bloqueado('Why do you want to work here?')?.reason !== 'campo no reconocido') {
  throw new Error('Un campo libre no reconocido queda para el humano');
}

// Un campo obligatorio sin resolver impide enviar sin humano.
if (plan.can_submit_without_human !== false) throw new Error('Con la autorizacion pendiente no se puede enviar solo');
if (!plan.blocking_required_fields.includes('Are you authorized to work in the US?')) {
  throw new Error('Debe nombrar el campo obligatorio que bloquea');
}
if (plan.submit_performed !== false) throw new Error('El plan nunca envia');

// Con todos los obligatorios resueltos si se puede continuar (sigue exigiendo aprobacion).
const simples = campos.filter((c) => ['first_name', 'last_name', 'email', 'resume'].includes(c.name));
const planSimple = buildFillPlan(simples, { profile: perfil, assets: artefactos });
if (planSimple.can_submit_without_human !== true) throw new Error('Sin obligatorios pendientes deberia poder continuar');
if (planSimple.approval_required !== true) throw new Error('Aun asi exige aprobacion');

// Falta el artefacto: no se sube cualquier cosa.
const sinCv = buildFillPlan(simples, { profile: perfil, assets: {} });
if (sinCv.pending.find((item) => /Resume/.test(item.field))?.reason !== 'falta el artefacto cv') {
  throw new Error('Sin CV adaptado no se sube nada');
}

// Falta el dato en el perfil: no se inventa.
const sinTelefono = buildFillPlan([{ name: 'phone', label: 'Phone', required: true }], { profile: {}, assets: {} });
if (sinTelefono.fillable !== 0) throw new Error('Sin dato en el perfil no se rellena');
if (sinTelefono.can_submit_without_human !== false) throw new Error('Un obligatorio sin dato bloquea el envio');

// --- adaptadores -------------------------------------------------------------
if (getAdapter('greenhouse').layout !== 'single_page') throw new Error('Greenhouse es de una sola pagina');
if (!getAdapter('lever').supports_file_upload) throw new Error('Lever admite subida de archivo');
if (getAdapter('workday') !== null) throw new Error('Un adaptador no implementado debe devolver null, no un objeto vacio');

console.log(JSON.stringify({
  ok: true,
  nodes: ['ats-router', 'greenhouse-adapter', 'lever-adapter'],
  campos_rellenables: plan.fillable,
  pendientes_humano: plan.pending_human,
  nunca_autorrellenados: ['autorizacion de trabajo', 'salario', 'datos demograficos'],
  submit_performed: false,
}));
