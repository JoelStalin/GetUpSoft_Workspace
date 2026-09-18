// Verifica que la URL de proyecto del cliente sirva de verdad. El defecto que este test
// impide repetir: el generador emitia enlaces al puerto 5174, donde nunca hubo nada
// escuchando, y el inventario daba el nodo por listo.
const baseUrl = process.env.ORCA_TEST_URL || 'http://127.0.0.1:4173';

const listado = await (await fetch(`${baseUrl}/api/orca/projects`)).json();
if (!listado.ok) throw new Error('El listado de proyectos debe responder');
if (!Array.isArray(listado.projects)) throw new Error('Debe devolver la lista de proyectos');
if (!listado.projects.length) throw new Error('Debe haber al menos un proyecto registrado');

const proyecto = listado.projects[0];
if (!proyecto.monitoring_url.includes(new URL(baseUrl).port)) {
  throw new Error(`La URL de monitoreo debe apuntar al servidor que la sirve: ${proyecto.monitoring_url}`);
}

// La pagina del proyecto debe servir el editor, no un 404.
const pagina = await fetch(proyecto.monitoring_url);
if (pagina.status !== 200) throw new Error(`La pagina del proyecto debe responder 200, respondio ${pagina.status}`);
const html = await pagina.text();
if (!/<div id="root">|ORCA/i.test(html)) throw new Error('La pagina debe servir el editor');

// Detalle del proyecto, con su workflow y sus corridas.
const detalle = await (await fetch(`${baseUrl}/api/orca/projects/${proyecto.project_id}`)).json();
if (!detalle.ok) throw new Error('El detalle del proyecto debe responder');
if (detalle.project.project_id !== proyecto.project_id) throw new Error('Debe devolver el proyecto pedido');
if (!detalle.workflow || detalle.workflow.nodes < 1) throw new Error('Debe incluir el workflow del proyecto');
if (!Array.isArray(detalle.runs)) throw new Error('Debe incluir las corridas del proyecto');

// Filtro por propietario: un cliente no ve los proyectos de otro.
const ajeno = await (await fetch(`${baseUrl}/api/orca/projects?owner=nadie-con-ese-nombre`)).json();
if (ajeno.total !== 0) throw new Error('Un propietario sin proyectos no debe ver ninguno');

// Un proyecto inexistente falla claro, no sirve una pagina en blanco.
const inexistente = await fetch(`${baseUrl}/api/orca/projects/no-existe`);
if (inexistente.status !== 404) throw new Error('Un proyecto inexistente debe dar 404');
const paginaInexistente = await fetch(`${baseUrl}/project/careerai/no-existe`);
if (paginaInexistente.status !== 404) throw new Error('La pagina de un proyecto inexistente debe dar 404');

console.log(JSON.stringify({
  ok: true,
  node: 'project-run-binding',
  proyectos: listado.total,
  monitoring_url: proyecto.monitoring_url,
  workflow_nodes: detalle.workflow.nodes,
}));
