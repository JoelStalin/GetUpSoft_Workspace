import { extractJson, consensusTerms, PROVIDERS } from '../apps/orca/src/careerai/llm-council.mjs';
import { researchFamily, mergeIntoCatalog, buildResearchPrompt } from '../apps/orca/src/careerai/catalog-researcher.mjs';

// --- extraccion de JSON de respuestas en lenguaje natural ---------------------
// Las cadenas de abajo son muestras arbitrarias del FORMATO de respuesta, no vocabulario
// del sistema: el catalogo real se construye desde el CV de cada cliente.
const NL = String.fromCharCode(10);
if (extractJson('```json' + NL + '{"terms":["termino-uno"]}' + NL + '```').terms[0] !== 'termino-uno') {
  throw new Error('Debe leer JSON en bloque cercado');
}
if (extractJson('Claro, aqui tienes:' + NL + '{"terms":["termino dos"]}' + NL + 'Espero que sirva.').terms[0] !== 'termino dos') {
  throw new Error('Debe leer JSON rodeado de texto');
}
if (extractJson('No tengo informacion sobre eso.') !== null) throw new Error('Sin JSON debe devolver null');
if (extractJson('{"roto": ') !== null) throw new Error('JSON invalido debe devolver null, no lanzar');

// --- consenso por votos ------------------------------------------------------
const votes = consensusTerms([
  { provider: 'hermes', terms: ['comun', 'dos-votos', 'solo-uno'] },
  { provider: 'gemini', terms: ['comun', 'dos-votos'] },
  { provider: 'openai', terms: ['comun'] },
], { minVotes: 2 });
if (votes.agreed[0].term !== 'comun' || votes.agreed[0].votes !== 3) throw new Error('El mas votado debe ir primero');
if (!votes.single_source.some((item) => item.term === 'solo-uno')) {
  throw new Error('Lo propuesto por un solo proveedor queda aparte, no entra al catalogo');
}

// --- ningun proveedor responde: escala, no rompe ni corrompe el catalogo ------
const catalogo = () => ({ families: [{ id: 'demo', label: 'Demo', terms: ['A'], adjacent: [], negative: [], validated: false }] });

const caido = await researchFamily('demo', {
  catalog: catalogo(),
  council: async () => ({ ok: false, answered: [], failed: [{ provider: 'hermes', error: 'timeout' }], answers: [], status: 'needs_human' }),
});
if (caido.status !== 'needs_human') throw new Error('Sin respuestas debe escalar');
if (caido.catalog_modified !== false) throw new Error('Sin respuestas no debe tocar el catalogo');

// --- respuestas sin JSON utilizable ------------------------------------------
const basura = await researchFamily('demo', {
  catalog: catalogo(),
  council: async () => ({ ok: true, answered: ['gemini'], failed: [], answers: [{ provider: 'gemini', text: 'No puedo ayudarte con eso.' }], status: 'answered' }),
});
if (basura.status !== 'needs_human') throw new Error('Respuestas sin JSON deben escalar');

// --- un solo proveedor: se marca, no se da por validado ----------------------
const solo = await researchFamily('demo', {
  catalog: catalogo(),
  council: async () => ({ ok: true, answered: ['hermes'], failed: [{ provider: 'gemini', error: 'HTTP 429' }],
    answers: [{ provider: 'hermes', text: '{"terms":["X"],"adjacent":[],"negative":[],"titles":[],"certifications":[]}' }], status: 'answered' }),
});
if (solo.status !== 'single_provider_only') throw new Error('Un solo proveedor no valida una familia');

// --- consenso real: investiga y fusiona --------------------------------------
const respuesta = (terms) => JSON.stringify({ terms, adjacent: ['adyacente'], negative: ['falso-positivo'], titles: ['Titulo Ejemplo'], certifications: [] });
const investigado = await researchFamily('demo', {
  catalog: catalogo(),
  council: async () => ({
    ok: true, answered: ['hermes', 'gemini', 'openai'], failed: [], status: 'answered',
    answers: [
      { provider: 'hermes', text: respuesta(['consensuado', 'segundo', 'tercero']) },
      { provider: 'gemini', text: '```json' + NL + respuesta(['consensuado', 'segundo']) + NL + '```' },
      { provider: 'openai', text: 'Aqui tienes: ' + respuesta(['consensuado', 'Solo mio']) },
    ],
  }),
});
if (investigado.status !== 'researched') throw new Error('Con tres proveedores debe quedar investigada');
if (!investigado.proposal.terms.includes('consensuado')) throw new Error('El termino consensuado debe entrar en la propuesta');
if (investigado.proposal.terms.includes('Solo mio')) throw new Error('Un termino de un solo proveedor no entra a la propuesta');
if (!investigado.needs_review.terms.includes('Solo mio')) throw new Error('Debe quedar listado para revision humana');

const fusionado = mergeIntoCatalog(catalogo(), investigado);
const familia = fusionado.families[0];
if (!familia.terms.includes('A')) throw new Error('La fusion nunca debe borrar lo que ya habia');
if (!familia.terms.includes('consensuado')) throw new Error('La fusion debe anadir lo consensuado');
if (familia.validated !== true) throw new Error('Tras el consenso la familia queda validada');
if (familia.validated_by.method !== 'llm_council') throw new Error('Debe registrar la procedencia');
if (!familia.validated_by.providers.includes('gemini')) throw new Error('Debe registrar quien participo');

// --- el prompt pide justo lo que el nodo necesita ----------------------------
const prompt = buildResearchPrompt({ label: 'Demo', terms: ['A'] });
for (const campo of ['terms', 'adjacent', 'negative', 'titles', 'certifications']) {
  if (!prompt.includes(campo)) throw new Error(`El prompt debe pedir ${campo}`);
}
if (!/falsos positivos/i.test(prompt)) throw new Error('Debe pedir explicitamente los falsos positivos');

console.log(JSON.stringify({
  ok: true,
  node: 'catalog-researcher',
  proveedores_declarados: Object.keys(PROVIDERS),
  escala_sin_respuestas: true,
  un_proveedor_no_valida: true,
  fusion_no_destructiva: true,
}));
