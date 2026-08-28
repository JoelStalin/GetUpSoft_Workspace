import { prepareCloudApiMessage, sendCloudApiMessage, sendCloudApiTemplate, cloudApiStatus, idempotencyKey } from '../apps/orca/src/careerai/whatsapp-cloud-api.mjs';

const now = new Date('2026-08-28T12:00:00Z');
const approval = {
  approval_id: 'appr-1',
  opportunity_id: 'opp-1',
  status: 'approved',
  expires_at: '2026-08-29T00:00:00Z',
  payload_hash: null,
  approved_by: 'joel',
};
const opportunity = { opportunity_id: 'opp-1' };

// --- preparar nunca envia --------------------------------------------------------
const prepared = prepareCloudApiMessage({
  opportunity, approval, recipientPhone: '+1 809 555 0100', text: 'Hola, tu postulacion esta lista para revisar', now,
});
if (prepared.status !== 'ready_to_send' || prepared.send_performed !== false) {
  throw new Error('prepareCloudApiMessage nunca debe marcar send_performed');
}
if (prepared.transport !== 'cloud_api') throw new Error('Debe declarar el transporte explicitamente');

// --- allowlist de numeros ---------------------------------------------------------
const fueraDeLista = prepareCloudApiMessage({
  opportunity, approval, recipientPhone: '+1 111 111 1111', text: 'x', allowlistPhones: ['+18095550100'], now,
});
if (fueraDeLista.ok !== false || fueraDeLista.blocked_at !== 'recipient') {
  throw new Error('Un numero fuera de la lista permitida debe bloquearse');
}

// --- sin aprobacion valida: bloqueado ---------------------------------------------
const sinAprobacion = prepareCloudApiMessage({ opportunity, approval: null, recipientPhone: '+18095550100', text: 'x', now });
if (sinAprobacion.ok !== false || sinAprobacion.blocked_at !== 'approval') {
  throw new Error('Sin aprobacion valida no debe prepararse el envio');
}

// --- idempotencia: mismo opportunity_id + mismo texto ya enviado -----------------
const hash = idempotencyKey({ opportunityId: 'opp-1', payloadHash: prepared.payload_hash });
const yaEnviado = prepareCloudApiMessage({
  opportunity, approval, recipientPhone: '+1 809 555 0100', text: 'Hola, tu postulacion esta lista para revisar',
  sentKeys: new Set([prepared.idempotency_key]), now,
});
if (yaEnviado.status !== 'already_sent' || yaEnviado.send_performed !== false) {
  throw new Error('Un mensaje ya enviado con la misma clave de idempotencia no debe reenviarse');
}

// --- envio real exige confirm:true, incluso con todo preparado -------------------
const sinConfirmar = await sendCloudApiMessage(prepared, { accessToken: 'tok', phoneNumberId: '123' });
if (sinConfirmar.ok !== false || sinConfirmar.send_performed !== false) {
  throw new Error('Sin confirm:true explicito, el envio real nunca debe ejecutarse');
}

// --- envio real sin credenciales: bloqueado ---------------------------------------
const sinCredenciales = await sendCloudApiMessage(prepared, { confirm: true, accessToken: '', phoneNumberId: '' });
if (sinCredenciales.ok !== false) throw new Error('Sin credenciales configuradas, el envio no debe ejecutarse');

// --- envio real con confirm:true y credenciales: llama al Graph API oficial ------
let calledUrl = null;
let calledBody = null;
const fetchMock = async (url, opts) => {
  calledUrl = url;
  calledBody = JSON.parse(opts.body);
  return { ok: true, json: async () => ({ messages: [{ id: 'wamid.TEST123' }] }) };
};
const enviado = await sendCloudApiMessage(prepared, { confirm: true, accessToken: 'tok', phoneNumberId: '123', fetchImpl: fetchMock });
if (enviado.ok !== true || enviado.send_performed !== true || enviado.message_id !== 'wamid.TEST123') {
  throw new Error('Con confirm:true y credenciales, debe enviar via el Graph API oficial');
}
if (!/graph\.facebook\.com/.test(calledUrl)) throw new Error('Debe llamar al Graph API oficial de Meta, no a un endpoint no oficial');
if (calledBody.recipient_type !== 'individual') {
  throw new Error('Deliberadamente sin soporte de grupo: recipient_type siempre individual (ver nota OBA en el modulo)');
}
if (calledBody.messaging_product !== 'whatsapp') throw new Error('El payload debe seguir el contrato de la Cloud API');

// --- appsecret_proof: se agrega a la URL cuando hay appSecret configurado --------
let calledStatusUrl = null;
await (async () => {
  const fetchMock = async (url) => { calledStatusUrl = url.toString(); return { ok: true, json: async () => ({}) }; };
  await cloudApiStatus({ accessToken: 'tok', phoneNumberId: '123', appSecret: 'secreto', fetchImpl: fetchMock });
})();
if (!/appsecret_proof=/.test(calledStatusUrl)) {
  throw new Error('Con appSecret configurado, la URL debe incluir appsecret_proof (esta WABA lo exige)');
}

let calledStatusUrlSinSecret = null;
await (async () => {
  const fetchMock = async (url) => { calledStatusUrlSinSecret = url.toString(); return { ok: true, json: async () => ({}) }; };
  await cloudApiStatus({ accessToken: 'tok', phoneNumberId: '123', appSecret: '', fetchImpl: fetchMock });
})();
if (/appsecret_proof=/.test(calledStatusUrlSinSecret)) {
  throw new Error('Sin appSecret configurado, no debe inventarse un appsecret_proof invalido');
}

// --- sendCloudApiTemplate: unico camino que funciona fuera de la ventana de servicio --
let calledTemplateUrl = null;
let calledTemplateBody = null;
const fetchMockTemplate = async (url, opts) => {
  calledTemplateUrl = url.toString();
  calledTemplateBody = JSON.parse(opts.body);
  return { ok: true, json: async () => ({ messages: [{ id: 'wamid.TEMPLATE123' }] }) };
};
const preparedParaTemplate = prepareCloudApiMessage({
  opportunity: { opportunity_id: 'opp-2' },
  approval: { ...approval, opportunity_id: 'opp-2' },
  recipientPhone: '+1 809 555 0100', text: '[plantilla]', now,
});
const enviadoTemplate = await sendCloudApiTemplate(preparedParaTemplate, {
  templateName: 'careerai_status_update', languageCode: 'es_MX', confirm: true,
  accessToken: 'tok', phoneNumberId: '123', appSecret: 'secreto', fetchImpl: fetchMockTemplate,
});
if (enviadoTemplate.ok !== true || enviadoTemplate.template !== 'careerai_status_update') {
  throw new Error('Con confirm:true, templateName y credenciales, debe enviar la plantilla');
}
if (calledTemplateBody.type !== 'template' || calledTemplateBody.template.name !== 'careerai_status_update') {
  throw new Error('El payload debe declarar type:template con el nombre correcto');
}
if (!/appsecret_proof=/.test(calledTemplateUrl)) throw new Error('El envio de plantilla tambien debe incluir appsecret_proof');

const sinTemplateName = await sendCloudApiTemplate(preparedParaTemplate, { confirm: true, accessToken: 'tok', phoneNumberId: '123' });
if (sinTemplateName.ok !== false) throw new Error('Sin templateName, no se puede enviar fuera de la ventana de servicio');

// --- estado de configuracion: distingue numero de prueba de numero real ----------
const statusPrueba = await cloudApiStatus({
  accessToken: 'tok', phoneNumberId: '123',
  fetchImpl: async () => ({ ok: true, json: async () => ({ display_phone_number: '+1 555 963 8117', is_official_business_account: false }) }),
});
if (statusPrueba.likely_test_number !== true) {
  throw new Error('Un numero con prefijo 555 debe marcarse como probable numero de prueba de Meta');
}

const statusReal = await cloudApiStatus({
  accessToken: 'tok', phoneNumberId: '123',
  fetchImpl: async () => ({ ok: true, json: async () => ({ display_phone_number: '+1 809 555 0100', is_official_business_account: false }) }),
});
if (statusReal.likely_test_number !== false) {
  throw new Error('Un numero real (no 555-xxxx de Meta) no debe marcarse como numero de prueba');
}

const sinConfigurar = await cloudApiStatus({ accessToken: '', phoneNumberId: '' });
if (sinConfigurar.configured !== false) throw new Error('Sin credenciales, configured debe ser false');

console.log(JSON.stringify({
  ok: true,
  node: 'whatsapp-cloud-api',
  transport: 'meta_cloud_api_official',
  recipient_type_always: 'individual',
  motivo: 'grupos requieren Official Business Account (notabilidad), inalcanzable',
  send_performed_solo_con_confirm_true: true,
}));
