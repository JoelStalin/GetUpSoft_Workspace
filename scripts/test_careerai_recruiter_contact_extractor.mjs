import assert from 'node:assert/strict';
import { extractRecruiterContact } from '../apps/orca/src/careerai/recruiter-contact-extractor.mjs';

const alto = extractRecruiterContact('Vacante AS400. Envia tu CV a rrhh@empresa.com para postular.');
assert.equal(alto.found, 1);
assert.equal(alto.best.email, 'rrhh@empresa.com');
assert.equal(alto.best.confidence, 'high');

const generico = extractRecruiterContact('Para dudas legales, escribir a legal@empresa.com. Envia tu CV a talento@empresa.com.');
assert.equal(generico.found, 2);
assert.equal(generico.best.email, 'talento@empresa.com', 'debe preferir el buzon no generico con contexto de contacto');
assert.equal(generico.candidates.find((c) => c.email === 'legal@empresa.com').generic_mailbox, true);

const sinContexto = extractRecruiterContact('Empresa fundada en dosmil diez. Sitio web: hola@ejemplo.com. Direccion en el centro de la ciudad.');
assert.equal(sinContexto.candidates[0].near_contact_keyword, false, 'sin palabra clave de contacto cerca no debe marcarse como cercano al contexto');
assert.notEqual(sinContexto.candidates[0].confidence, 'high', 'sin contexto de contacto no puede llegar a high aunque el buzon no sea generico');

const vacio = extractRecruiterContact('Sin ningun email en esta descripcion.');
assert.equal(vacio.found, 0);
assert.equal(vacio.best, null);

console.log(JSON.stringify({ ok: true, node: 'recruiter-contact-extractor', descarta_buzones_genericos: true, exige_contexto_de_contacto_para_high: true }));
