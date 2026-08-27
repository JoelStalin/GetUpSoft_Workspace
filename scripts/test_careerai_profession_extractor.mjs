import { extractProfessions, extractByCatalog, buildExtractionPrompt } from '../apps/orca/src/careerai/profession-extractor.mjs';
import { extractPdfText } from '../apps/orca/src/careerai/cv-ingest.mjs';

// El punto que este test protege: el extractor NO sabe de tecnologia. Se le da un CV de
// una profesion que no existe en el catalogo y debe devolver esa profesion igualmente.
const cvEnfermeria = [
  'Maria Gomez - Enfermera especialista en cuidados intensivos.',
  'Doce anos de experiencia en unidades de cuidados intensivos de adultos.',
  'Licenciada en Enfermeria por la Universidad Nacional. Certificacion en soporte vital avanzado.',
  'Coordinacion de equipos de enfermeria en turnos rotativos y supervision de personal en formacion.',
  'Manejo de ventilacion mecanica, monitorizacion hemodinamica y protocolos de sepsis.',
  'Registro y trazabilidad de administracion de medicamentos segun normativa hospitalaria.',
].join(' ');

const catalogoFalso = {
  families: [
    { id: 'familia-a', label: 'Familia A', terms: ['Alfa', 'Beta'], negative: [] },
    { id: 'familia-b', label: 'Familia B', terms: ['Gamma'], negative: [] },
  ],
};

// Un CV que no toca ninguna familia del catalogo no debe inventar coincidencias.
const barrido = extractByCatalog(cvEnfermeria, catalogoFalso);
if (barrido.families.length !== 0) throw new Error('El barrido no debe inventar familias que el CV no menciona');

// El mismo barrido si debe encontrar lo que el CV menciona de verdad.
const cvConAlfa = [
  'Perfil tecnico con experiencia en Alfa y en integraciones sobre Gamma durante seis anos.',
  'Responsable del diseno de componentes, de la coordinacion con proveedores externos',
  'y de la documentacion tecnica de cada entrega. Trabajo en equipos distribuidos con',
  'metodologias agiles y revision de codigo entre pares de forma continua.',
].join(' ');
const conCoincidencia = extractByCatalog(cvConAlfa, catalogoFalso);
if (conCoincidencia.families.length !== 2) throw new Error('Debe encontrar las familias que el CV si menciona');

// Con el consejo respondiendo, la profesion sale del CV aunque el catalogo no la conozca.
const consejoEnfermeria = async () => ({
  ok: true, provider: 'stub', answered: ['stub'], failed: [], status: 'answered',
  answers: [{ provider: 'stub', text: JSON.stringify({
    professions: [
      { label: 'Enfermera de cuidados intensivos', evidence: 'Doce anos de experiencia en unidades de cuidados intensivos', years: 12, seniority: 'Senior' },
      { label: 'Coordinadora de equipos de enfermeria', evidence: 'Coordinacion de equipos de enfermeria en turnos rotativos', years: 5, seniority: 'Mid' },
    ],
  }) }],
});

const resultado = await extractProfessions(cvEnfermeria, { catalog: catalogoFalso, askFn: consejoEnfermeria });
if (resultado.method !== 'llm_council') throw new Error('Con el consejo respondiendo debe usar su analisis');
if (!/enfermer/i.test(resultado.professions[0].label)) {
  throw new Error('Debe devolver la profesion real del CV, no una del catalogo');
}
if (resultado.professions[0].years !== 12) throw new Error('Debe conservar los anos de experiencia');
if (resultado.professions[0].family_id !== null) throw new Error('Sin familia en el catalogo, family_id queda en null y no se fuerza');
if (resultado.requires_client_confirmation !== true) throw new Error('El cliente siempre confirma el perfil extraido');

// Sin consejo, el barrido mantiene al cliente en marcha y lo dice con claridad.
const sinConsejo = await extractProfessions(cvConAlfa, {
  catalog: catalogoFalso,
  askFn: async () => ({ ok: false, failed: [{ provider: 'stub', error: 'HTTP 503' }] }),
});
if (sinConsejo.method !== 'catalog_fallback') throw new Error('Sin consejo debe caer al barrido');
if (sinConsejo.council_status !== 'sin_respuesta') throw new Error('Debe declarar que el consejo no respondio');
if (sinConsejo.professions[0].confidence !== 'baja') throw new Error('El barrido debe declararse de confianza baja');

// Un CV demasiado corto es un error explicito, no un perfil vacio.
let code = null;
try { await extractProfessions('muy corto', { catalog: catalogoFalso }); } catch (error) { code = error.code; }
if (code !== 'CV_TEXT_TOO_SHORT') throw new Error('Un CV ilegible debe fallar explicitamente');

// El prompt no debe sugerir ninguna profesion: solo pide analizar el documento.
const prompt = buildExtractionPrompt(cvEnfermeria);
if (!prompt.includes('No inventes evidencia')) throw new Error('El prompt debe prohibir inventar evidencia');
if (/RPG|AS.?400|Odoo|Python|iSeries/i.test(prompt.split('--- CV ---')[0])) {
  throw new Error('El prompt no debe mencionar ninguna tecnologia: la profesion sale del CV');
}

// El extractor de PDF devuelve cadena vacia ante basura, sin lanzar.
if (extractPdfText(Buffer.from('esto no es un pdf')) !== '') throw new Error('Un archivo invalido debe dar texto vacio');

console.log(JSON.stringify({
  ok: true,
  node: 'profession-extractor',
  probado_con: 'CV de enfermeria fuera del catalogo',
  profesiones: resultado.professions.map((item) => item.label),
  respaldo_sin_consejo: sinConsejo.method,
}));
