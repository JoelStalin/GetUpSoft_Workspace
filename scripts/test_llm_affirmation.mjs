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

export async function parseUserIntentWithLLM(userInput, pendingOpportunities = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const opportunitiesContext = pendingOpportunities.map(o => ({
    id: o.opportunity_id || o.lead_id,
    company: o.company,
    title: o.title
  }));

  const systemPrompt = `Eres el nodo cognitivo de CareerAI. Tu tarea es analizar la respuesta en lenguaje natural de un usuario y determinar si su intención es AFIRMATIVA (aprobar el envío de una, varias o todas las postulaciones preparadas), NEGATIVA (rechazar o pausar) o una CONSULTA/INSTRUCCIÓN ESPECÍFICA.
  
  No te limites a palabras fijas como "sí" o "confirmar". Reconoce modismos, jerga ("dale", "mándala", "fuego", "procede", "afirmativo", "de una", "go ahead", "send it", "avanza con la de mercado libre", etc.).
  
  Lista de Oportunidades Pendientes de Aprobación:
  ${JSON.stringify(opportunitiesContext, null, 2)}
  
  Respuesta del Usuario: "${userInput}"
  
  Devuelve OBLIGATORIAMENTE un JSON estructurado con el siguiente formato:
  {
    "is_affirmative": boolean,
    "intent": "APPROVE_ALL" | "APPROVE_SPECIFIC" | "REJECT" | "CLARIFICATION_NEEDED",
    "target_company": string | null,
    "matched_opportunity_ids": string[],
    "confidence": number,
    "reasoning": string
  }`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText);
  } catch (err) {
    // Fallback heurístico si el endpoint falla
    const lower = userInput.toLowerCase();
    const isAffirmative = ['si', 'sí', 'dale', 'procede', 'fuego', 'confirmo', 'mándala', 'mandala', 'ok', 'yes', 'send', 'go'].some(w => lower.includes(w));
    return {
      is_affirmative: isAffirmative,
      intent: isAffirmative ? (lower.includes('todas') || lower.includes('all') ? 'APPROVE_ALL' : 'APPROVE_SPECIFIC') : 'CLARIFICATION_NEEDED',
      target_company: null,
      matched_opportunity_ids: [],
      confidence: 0.8,
      reasoning: 'Fallback heurístico local activado'
    };
  }
}

// Pruebas con diversas expresiones naturales
const testPhrases = [
  'dale pa lante bro mandale a stripe',
  'de una, mandalas todas que estan bien preparadas',
  'espera no envies nada todavia quiero revisar algo',
  'procede con la de mercado libre y vercel por favor',
  'fuegooo enviate esa postulacion de scale ai'
];

const mockOpportunities = [
  { opportunity_id: 'lead_ln_01', company: 'Stripe Inc.', title: 'Backend Engineer' },
  { opportunity_id: 'lead_in_02', company: 'Mercado Libre', title: 'Software Architect' },
  { opportunity_id: 'lead_gh_04', company: 'Scale AI', title: 'AI Specialist' },
  { opportunity_id: 'lead_ln_10', company: 'Vercel', title: 'DX Engineer' }
];

console.log('Evaluando intenciones con el LLM Cognitivo Gratuito...\n');
for (const phrase of testPhrases) {
  const result = await parseUserIntentWithLLM(phrase, mockOpportunities);
  console.log(`🗣️ Entrada: "${phrase}"`);
  console.log(`  🤖 Análisis LLM:`, JSON.stringify(result));
  console.log('----------------------------------------------------------------');
}
