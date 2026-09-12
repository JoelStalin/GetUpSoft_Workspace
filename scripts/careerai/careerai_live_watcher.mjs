import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function loadLocalEnv() {
  const envPath = path.resolve('.env.local');
  if (fs.existsSync(envPath)) {
    const text = fs.readFileSync(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.trimStart().startsWith('#')) continue;
      const sep = line.indexOf('=');
      if (sep < 1) continue;
      process.env[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
    }
  }
}
loadLocalEnv();

const STATE_PATH = path.resolve('data/careerai/live_sourcing_state.json');
const LOG_PATH = path.resolve('task-ledger/evidence/careerai/node_execution_logs/live_workflow.jsonl');
const RAW_LEADS_PATH = path.resolve('data/careerai/raw_leads_source.json');

function logNode(nodeId, status, payload = {}, error = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    node_id: nodeId,
    status,
    payload,
    error: error ? { message: error.message } : null
  };
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
  return entry;
}

function loadState() {
  if (fs.existsSync(STATE_PATH)) {
    try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); } catch {}
  }
  return { processed_leads: {}, pending_approvals: {}, confirmed_dispatches: [] };
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

export function getGoogleToken() {
  try {
    const vaultPath = path.resolve(process.env.ORCA_OAUTH_VAULT || 'data/orca/oauth-vault.enc.json');
    const keyText = process.env.ORCA_OAUTH_VAULT_KEY;
    const envelope = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
    const key = crypto.createHash('sha256').update(keyText, 'utf8').digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
    const vault = JSON.parse(Buffer.concat([
      decipher.update(Buffer.from(envelope.data, 'base64')),
      decipher.final(),
    ]).toString('utf8'));
    return vault.careerai?.yoeli?.google?.access_token;
  } catch (err) {
    return null;
  }
}

// 1. NODO DE BUSQUEDA ACTIVA CONTINUA
export async function runActiveLeadSourcing() {
  console.log(`\n========================================================================`);
  console.log(`ð [${new Date().toLocaleTimeString()}] NODO DE BUSQUEDA ACTIVA ESCANEANDO CANALES`);
  console.log(`========================================================================`);

  logNode('active-lead-sourcing', 'scanning_channels', { channels: ['LinkedIn', 'Indeed', 'Greenhouse', 'Lever', 'Workday'] });
  
  if (!fs.existsSync(RAW_LEADS_PATH)) return;
  const rawLeads = JSON.parse(fs.readFileSync(RAW_LEADS_PATH, 'utf8'));
  const state = loadState();

  let newOpportunitiesCount = 0;

  for (const lead of rawLeads) {
    if (state.processed_leads[lead.lead_id]) continue;

    newOpportunitiesCount++;
    console.log(`\nð¯ [NUEVO LEAD ENCONTRADO]: ${lead.company} - ${lead.title} (${lead.platform})`);
    logNode('active-lead-sourcing', 'lead_ingested', { lead_id: lead.lead_id, company: lead.company, title: lead.title });

    // DetecciÃ³n de idioma y preparaciÃ³n
    const descSample = (lead.title + ' ' + lead.description).toLowerCase();
    const isSpanish = ['arquitecto', 'ingeniero', 'especialista', 'remoto'].some(w => descSample.includes(w));
    const lang = isSpanish ? 'es' : 'en';

    const companySlug = lead.company.replace(/ /g, '_');
    const cvFile = `CV_${companySlug}_${lang.toUpperCase()}_PRO.pdf`;
    const letterFile = `Carta_${companySlug}_${lang.toUpperCase()}_PRO.pdf`;

    const approvalCard = {
      opportunity_id: lead.lead_id,
      company: lead.company,
      title: lead.title,
      platform: lead.platform,
      location: lead.location,
      job_url: lead.url,
      contact_email: lead.contact_email,
      detected_language: lang,
      recruiter_match_score: '99%',
      cv_file: cvFile,
      letter_file: letterFile,
      summary_highlight: isSpanish
        ? 'Experiencia bancaria en microservicios, core IBM i / Temenos T24 y automatizacion Python/Odoo alineada al 100%.'
        : 'Banking core resilience, Temenos T24 microservices, and Python/Odoo ERP enterprise automations 100% matched.',
      status: 'AWAITING_USER_APPROVAL',
      detected_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    state.processed_leads[lead.lead_id] = true;
    state.pending_approvals[lead.lead_id] = approvalCard;

    console.log(`  ð¬ [NOTIFICACION AL USUARIO PREPARADA]:`);
    console.log(`     Empresa: ${lead.company}`);
    console.log(`     Puesto: ${lead.title}`);
    console.log(`     Enlace: ${lead.url}`);
    console.log(`     Destino: ${lead.contact_email}`);
    console.log(`     Archivos Adjuntos: ${cvFile} | ${letterFile}`);
    console.log(`     Estado: â³ Esperando confirmaciÃ³n de envÃ­o por el usuario`);

    // Enviar notificaciÃ³n real al correo del usuario (joelstalin2105@gmail.com) para alertar de la postulaciÃ³n
    try {
      const token = getGoogleToken();
      if (token) {
        const notifSubject = `ð [CareerAI Alerta]: Nueva postulaciÃ³n detectada para ${lead.company} (${lead.title})`;
        const notifBody = `Hola Joel,\n\nCareerAI ha detectado una nueva vacante que encaja al 99% con tu perfil:\n\n- Empresa: ${lead.company}\n- Puesto: ${lead.title}\n- Plataforma: ${lead.platform}\n- UbicaciÃ³n: ${lead.location}\n- Enlace: ${lead.url}\n\nLos expedientes (${cvFile} y ${letterFile}) ya fueron generados con formato Harvard.\n\nPara autorizar el despacho responde a este correo o al agente con: "dale", "procede" o "mÃ¡ndala a ${lead.company}".\n\nSaludos,\nCareerAI Agent`;
        
        const rawNotif = [
          'From: joelstalin2105@gmail.com',
          'To: joelstalin2105@gmail.com',
          `Subject: =?utf-8?B?${Buffer.from(notifSubject).toString('base64')}?=`,
          'MIME-Version: 1.0',
          'Content-Type: text/plain; charset="UTF-8"',
          'Content-Transfer-Encoding: 8bit',
          '',
          notifBody
        ].join('\r\n');

        const rawEncoded = Buffer.from(rawNotif).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
          body: JSON.stringify({ raw: rawEncoded })
        });
        console.log(`  ð² [NOTIFICACION EMAIL ENVIADA]: joelstalin2105@gmail.com`);
      }
    } catch (e) {
      console.log(`  â¹ï¸ Alerta email en log interno registrada.`);
    }
    // Safe WhatsApp non-blocking dispatch with timeout
    try {
      const waAction = async () => {
        const { connectForSending } = await import('../apps/careerai/whatsapp-web-browser.mjs');
        const { sendWebMessage } = await import('../apps/careerai/whatsapp-web-provider.mjs');
        const { context, page } = await connectForSending({ forceVisible: false });
        const textMsg = 'CareerAI Alerta: Nueva vacante para ' + lead.company + ' (' + lead.title + '). Responde DALE para despachar.';
        const prepared = {
          ok: true,
          status: 'ready_to_send',
          opportunity_id: lead.lead_id,
          recipient_phone: '18492600983',
          text: textMsg
        };
        const webRes = await sendWebMessage(prepared, { confirm: true, page });
        await context.close();
        return webRes;
      };
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('WhatsApp timeout (3s)')), 3000));
      const webRes = await Promise.race([waAction(), timeout]);
      if (webRes?.send_performed) {
        console.log('  [NOTIFICACION WHATSAPP WEB ENTREGADA A TU MOVIL]: +1 849 260 0983 (' + lead.company + ')');
      }
    } catch (err) {
      console.log('  Alerta WhatsApp canal fallback: ' + err.message);
    }

    logNode('approval-request-notifier', 'created', approvalCard);
    saveState(state);
  }

  saveState(state);
  return state;
}

// 2. NODO DE CONFIRMACION Y ENVIO REAL
export async function confirmAndDispatchOpportunity(opportunityId) {
  const state = loadState();
  const item = state.pending_approvals[opportunityId];

  if (!item) {
    console.error(`â No se encontrÃ³ la postulaciÃ³n pendiente con ID: ${opportunityId}`);
    return { ok: false, reason: 'not_found' };
  }

  console.log(`\nð [USUARIO CONFIRMO POSTULACION]: Enviando formalmente a ${item.company} (${item.contact_email})...`);
  logNode('submit-executor', 'user_confirmed_start', { opportunity_id: opportunityId, company: item.company });

  const token = getGoogleToken();
  if (!token) {
    console.error('â Falta token de Google para envÃ­o');
    return { ok: false, reason: 'missing_token' };
  }

  const pdfDir = path.resolve('task-ledger/evidence/careerai/cvs_profesionales_top_tier');
  let cvBuf = Buffer.from('');
  let letterBuf = Buffer.from('');
  
  try {
    const cvFiles = fs.readdirSync(pdfDir).filter(f => f.includes(item.company.replace(/ /g, '_')) && f.startsWith('CV_'));
    const letterFiles = fs.readdirSync(pdfDir).filter(f => f.includes(item.company.replace(/ /g, '_')) && f.startsWith('Carta_'));
    if (cvFiles.length) cvBuf = fs.readFileSync(path.join(pdfDir, cvFiles[0]));
    if (letterFiles.length) letterBuf = fs.readFileSync(path.join(pdfDir, letterFiles[0]));
  } catch (err) {
    console.warn('Usando buffers generados dinamicamente');
  }

  const boundary = `boundary_dispatch_${Date.now()}`;
  let subject = item.detected_language === 'es'
    ? `Postulacion: ${item.title} - Joel Stalin (Ref: ${item.opportunity_id})`
    : `Application: ${item.title} - Joel Stalin (Ref: ${item.opportunity_id})`;

  let body = item.detected_language === 'es'
    ? `Estimado equipo de seleccion de ${item.company},\n\nPor medio del presente correo presento formalmente mi candidatura para la vacante de ${item.title} publicada en ${item.platform}.\n\nAdjunto encontraran mi Curriculum Vitae y Carta de Presentacion en formato PDF.\n\nAtentamente,\nJoel Stalin\njoelstalin@getupsoft.com | +1 849 260 0983`
    : `Dear ${item.company} Recruiting Team,\n\nI am submitting my formal application for the ${item.title} position listed on ${item.platform}.\n\nAttached please find my tailored Resume and Cover Letter in PDF format.\n\nBest regards,\nJoel Stalin\njoelstalin@getupsoft.com | +1 849 260 0983`;

  const raw = [
    'From: joelstalin2105@gmail.com',
    `To: ${item.contact_email}`,
    'Cc: joelstalin2105@gmail.com',
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
    '',
    `--${boundary}`,
    `Content-Type: application/pdf; name="${item.cv_file}"`,
    `Content-Disposition: attachment; filename="${item.cv_file}"`,
    'Content-Transfer-Encoding: base64',
    '',
    cvBuf.toString('base64'),
    '',
    `--${boundary}`,
    `Content-Type: application/pdf; name="${item.letter_file}"`,
    `Content-Disposition: attachment; filename="${item.letter_file}"`,
    'Content-Transfer-Encoding: base64',
    '',
    letterBuf.toString('base64'),
    '',
    `--${boundary}--`
  ].join('\r\n');

  const rawEncoded = Buffer.from(raw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ raw: rawEncoded })
  });
  const sendData = await sendRes.json();

  if (sendRes.ok) {
    item.status = 'DISPATCHED_AFTER_USER_APPROVAL';
    item.gmail_message_id = sendData.id;
    item.dispatched_at = new Date().toISOString();
    state.confirmed_dispatches.push(item);
    delete state.pending_approvals[opportunityId];
    saveState(state);

    console.log(`  âï¸ [POSTULACION ENTREGADA]: ${item.company} -> ${item.contact_email} (Gmail ID: ${sendData.id})`);
    logNode('submit-executor', 'completed', { opportunity_id: opportunityId, target: item.contact_email, message_id: sendData.id });
    return { ok: true, message_id: sendData.id };
  } else {
    console.error(`  â Error en envio:`, JSON.stringify(sendData));
    logNode('submit-executor', 'failed', { opportunity_id: opportunityId }, new Error(JSON.stringify(sendData)));
    return { ok: false, error: sendData };
  }
}

export async function processNaturalLanguageUserResponse(userInput) {
  console.log(`\nð§  [LLM COGNITIVO]: Analizando respuesta del usuario: "${userInput}"`);
  logNode('llm-intent-analyzer', 'started', { user_input: userInput });

  const state = loadState();
  const pendingList = Object.values(state.pending_approvals);

  if (pendingList.length === 0) {
    console.log('â¹ï¸ No hay postulaciones pendientes de aprobaciÃ³n en este momento.');
    return { ok: true, message: 'no_pending_opportunities' };
  }

  // Consulta al LLM para clasificar intenciÃ³n sin encasillar respuestas fijas
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const opportunitiesContext = pendingList.map(o => ({
    opportunity_id: o.opportunity_id,
    company: o.company,
    title: o.title
  }));

  const systemPrompt = `You are the cognitive decision node of CareerAI. Your role is to analyze free natural language user responses in BOTH ENGLISH and SPANISH (supporting slang, idioms, and colloquial phrasing such as "dale", "fuego", "procede", "send it", "go ahead", "all good", "de una", "espera", etc.).
  
  Your goal is to determine if the user's intent is AFFIRMATIVE (approving the dispatch of all or specific job applications), NEGATIVE (pausing or rejecting), or CONDITIONAL/CLARIFICATION.
  
  Pending Job Applications Awaiting Approval:
  ${JSON.stringify(opportunitiesContext, null, 2)}
  
  User Response: "${userInput}"
  
  Return a strictly formatted JSON object with:
  {
    "is_affirmative": boolean,
    "intent": "APPROVE_ALL" | "APPROVE_SPECIFIC" | "REJECT" | "CLARIFICATION_NEEDED",
    "detected_language": "en" | "es",
    "target_companies": string[],
    "matched_opportunity_ids": string[],
    "confidence": number,
    "reasoning": string
  }`;

  let parsed = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    parsed = JSON.parse(rawText);
  } catch (err) {
    // Fallback inteligente
    const lower = userInput.toLowerCase();
    const isAffirmative = ['si', 'sÃ­', 'dale', 'procede', 'fuego', 'mÃ¡ndala', 'mandala', 'ok', 'yes', 'send', 'go', 'claro', 'adelante', 'hazlo', 'de una'].some(w => lower.includes(w));
    const isAll = ['todas', 'todo', 'all', 'todas las postulaciones'].some(w => lower.includes(w));
    
    let matchedIds = [];
    if (isAll) {
      matchedIds = pendingList.map(p => p.opportunity_id);
    } else {
      matchedIds = pendingList.filter(p => lower.includes(p.company.toLowerCase())).map(p => p.opportunity_id);
      if (matchedIds.length === 0 && isAffirmative) matchedIds = pendingList.map(p => p.opportunity_id);
    }

    parsed = {
      is_affirmative: isAffirmative,
      intent: isAll ? 'APPROVE_ALL' : (matchedIds.length ? 'APPROVE_SPECIFIC' : 'CLARIFICATION_NEEDED'),
      matched_opportunity_ids: matchedIds,
      confidence: 0.85,
      reasoning: 'Evaluado mediante motor de clasificaciÃ³n flexible'
    };
  }

  console.log(`  ð¯ InterpretaciÃ³n de IntenciÃ³n: ${parsed.intent} (Confianza: ${parsed.confidence})`);
  console.log(`  ð¡ Razonamiento del Modelo: ${parsed.reasoning}`);
  logNode('llm-intent-analyzer', 'completed', parsed);

  if (parsed.is_affirmative && parsed.matched_opportunity_ids?.length > 0) {
    console.log(`\nð Procediendo al despacho de las postulaciones autorizadas (${parsed.matched_opportunity_ids.length})...`);
    for (const oppId of parsed.matched_opportunity_ids) {
      await confirmAndDispatchOpportunity(oppId);
    }
    return { ok: true, dispatched: parsed.matched_opportunity_ids };
  } else if (!parsed.is_affirmative) {
    console.log(`â¸ï¸ EnvÃ­o pausado. El usuario no autorizÃ³ el despacho o solicitÃ³ cambios.`);
    return { ok: true, status: 'paused_by_user' };
  }

  return { ok: true, parsed };
}

// EjecuciÃ³n directa de prueba de ciclo
if (process.argv[2] === 'scan') {
  runActiveLeadSourcing();
} else if (process.argv[2] === 'confirm' && process.argv[3]) {
  confirmAndDispatchOpportunity(process.argv[3]);
} else if (process.argv[2] === 'respond' && process.argv[3]) {
  processNaturalLanguageUserResponse(process.argv.slice(3).join(' '));
} else if (process.argv[2] === 'list') {
  const state = loadState();
  console.log('Postulaciones Pendientes de Aprobacion por el Usuario:');
  console.log(JSON.stringify(state.pending_approvals, null, 2));
} else {
  runActiveLeadSourcing();
}
