import { extractRequirementTerms, analyzeCvGap } from '../platform/orca/src/careerai/cv-gap-analyzer.mjs';

// --- extraccion de terminos: prioriza los que aparecen en seccion de requisitos ----------
const oferta = `
Sobre la empresa: fundada en 1998, cultura colaborativa.

Requisitos:
- Experiencia con AS400 y RPGLE
- Conocimiento de SQL
- Deseable Node.js

Beneficios: seguro medico, dias libres.
`;
const terminos = extractRequirementTerms(oferta);
if (!terminos.some((t) => /as400/i.test(t))) throw new Error('Debe extraer AS400 como termino de requisito');
if (!terminos.some((t) => /rpgle/i.test(t))) throw new Error('Debe extraer RPGLE');
if (!terminos.some((t) => /node\.js/i.test(t))) throw new Error('Debe reconocer Node.js (con punto) como termino tecnico');

// --- analisis de gap: CV que cubre todo -----------------------------------------------
const cvCompleto = 'Desarrollador con 5 anos de experiencia en AS400, RPGLE y SQL. Tambien conocimiento basico de Node.js.';
const completo = analyzeCvGap({ cvText: cvCompleto, opportunityText: oferta });
if (completo.missing.length !== 0) throw new Error(`No deberia haber carencias, encontro: ${JSON.stringify(completo.missing)}`);
if (completo.coverage_percent !== 100) throw new Error('Cobertura total debe ser 100%');
if (completo.requires_human_review !== false) throw new Error('Sin carencias, no hace falta marcar revision humana');

// --- CV que NO cubre todo: debe reportar exactamente lo que falta ----------------------
const cvIncompleto = 'Desarrollador con experiencia en AS400. Sin experiencia en bases de datos SQL.';
const incompleto = analyzeCvGap({ cvText: cvIncompleto, opportunityText: oferta });
// SQL aparece literalmente en el texto del CV ("bases de datos SQL"), asi que debe contar
// como matched aunque el contexto sea negativo — este nodo compara PALABRAS, no semantica; la
// interpretacion ("dice que NO tiene SQL") es del LLM/humano, no de este nodo determinista.
if (!incompleto.matched.some((t) => /sql/i.test(t))) throw new Error('SQL aparece literalmente en el texto: debe contar como matched (limitacion conocida, no semantico)');
if (!incompleto.missing.some((t) => /rpgle/i.test(t))) throw new Error('RPGLE no aparece en el CV: debe listarse como carencia');
if (incompleto.requires_human_review !== true) throw new Error('Con carencias reales, debe marcar revision humana');

// --- palabra completa, no substring: "AS" no debe matchear dentro de "Assistant" --------
const gapPalabraCompleta = analyzeCvGap({
  cvText: 'Administrative Assistant con experiencia en atencion al cliente.',
  requirementTerms: ['AS'],
});
if (gapPalabraCompleta.matched.includes('AS')) throw new Error('AS no debe matchear dentro de "Assistant": coincidencia de palabra completa, no substring');

// --- requirementTerms explicitos: no hace falta auto-extraer -----------------------------
const conTerminosExplicitos = analyzeCvGap({
  cvText: 'Experiencia en Python y Django.',
  requirementTerms: ['Python', 'Kubernetes'],
});
if (conTerminosExplicitos.matched.join() !== 'Python') throw new Error('Con terminos explicitos, debe usarlos tal cual sin auto-extraer nada');
if (conTerminosExplicitos.missing.join() !== 'Kubernetes') throw new Error('Kubernetes no esta en el CV: debe listarse como carencia');

// --- sin CV o sin oferta/terminos: no se puede analizar nada -----------------------------
const sinCv = analyzeCvGap({ opportunityText: oferta });
if (sinCv.ok !== false) throw new Error('Sin texto de CV, no se puede analizar nada');
const sinOferta = analyzeCvGap({ cvText: cvCompleto });
if (sinOferta.ok !== false) throw new Error('Sin oferta ni terminos explicitos, no hay contra que comparar');

console.log(JSON.stringify({
  ok: true,
  node: 'cv-gap-analyzer',
  prioriza_terminos_en_seccion_de_requisitos: true,
  reconoce_terminos_con_puntuacion_tecnica: true,
  coincidencia_por_palabra_completa: true,
  decision_de_que_hacer_con_gaps_es_del_cliente: true,
}));
