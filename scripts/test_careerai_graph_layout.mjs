import fs from 'node:fs';
import { computeLayers, layoutGraph, countBackwardEdges } from '../apps/orca/src/careerai/graph-layout.mjs';

// --- capas -------------------------------------------------------------------
const cadena = {
  nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
  edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }],
};
const lineal = computeLayers(cadena.nodes, cadena.edges);
if (lineal.layers.get('a') !== 0 || lineal.layers.get('b') !== 1 || lineal.layers.get('c') !== 2) {
  throw new Error('Una cadena simple debe dar capas 0, 1, 2');
}
if (lineal.back_edges.length !== 0) throw new Error('Una cadena no tiene aristas de ciclo');
if (lineal.roots.length !== 1) throw new Error('La cadena tiene una sola raiz');

// La capa la marca el predecesor mas profundo, no el primero que se encuentre.
const rombo = {
  nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
  edges: [{ from: 'a', to: 'b' }, { from: 'a', to: 'c' }, { from: 'c', to: 'd' }, { from: 'b', to: 'd' }],
};
const capasRombo = computeLayers(rombo.nodes, rombo.edges);
if (capasRombo.layers.get('d') !== 2) throw new Error('Debe tomar el camino mas largo hasta el nodo');

// El caso que motivo reescribir el algoritmo: un ciclo dejaba 43 nodos sin capa
// amontonados en la columna 0. Las realimentaciones son legitimas en este workflow.
const conCiclo = {
  nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
  edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'b' }],
};
const ciclico = computeLayers(conCiclo.nodes, conCiclo.edges);
if (ciclico.layers.get('c') !== 2) throw new Error('El ciclo no debe impedir que se asigne capa');
if (!ciclico.back_edges.includes('c->b')) throw new Error('Debe identificar la arista que cierra el ciclo');

// Un componente enteramente ciclico no tiene raiz, y aun asi debe colocarse.
const soloCiclo = {
  nodes: [{ id: 'x' }, { id: 'y' }],
  edges: [{ from: 'x', to: 'y' }, { from: 'y', to: 'x' }],
};
const sinRaiz = computeLayers(soloCiclo.nodes, soloCiclo.edges);
if (sinRaiz.roots.length !== 0) throw new Error('Un ciclo puro no tiene raices');
if (sinRaiz.layers.get('x') === undefined || sinRaiz.layers.get('y') === undefined) {
  throw new Error('Todos los nodos deben recibir capa, incluso sin raiz');
}

// Las aristas a nodos inexistentes y los bucles sobre si mismo no rompen nada.
const sucio = computeLayers([{ id: 'a' }], [{ from: 'a', to: 'fantasma' }, { from: 'a', to: 'a' }]);
if (sucio.layers.get('a') !== 0) throw new Error('Aristas invalidas no deben alterar las capas');

// --- disposicion --------------------------------------------------------------
const grande = {
  nodes: Array.from({ length: 13 }, (_, i) => ({ id: `n${i}` })),
  edges: Array.from({ length: 12 }, (_, i) => ({ from: `n${i}`, to: `n${i + 1}` })),
};
const layout = layoutGraph(grande.nodes, grande.edges, { columns: 6 });
if (layout.columns !== 6 || layout.rows !== 3) throw new Error(`13 nodos en 6 columnas son 3 filas, obtuve ${layout.rows}`);
if (layout.positions.size !== 13) throw new Error('Todos los nodos deben tener posicion');

// Ningun nodo puede quedar sobre otro: ese era el bug original del canvas.
const claves = new Set([...layout.positions.values()].map((p) => `${p.x},${p.y}`));
if (claves.size !== 13) throw new Error('Dos nodos no pueden compartir posicion');

// El orden topologico se conserva pese al envoltorio en filas.
if (layout.order[0] !== 'n0' || layout.order[12] !== 'n12') throw new Error('Debe respetarse el orden del flujo');

// El envoltorio existe para que quepa en pantalla: 33 columnas median ~10.000 px.
if (layout.width > 2200) throw new Error(`El grafo debe caber en pantalla, mide ${layout.width}px`);

const grafoVacio = layoutGraph([], []);
if (grafoVacio.positions.size !== 0) throw new Error('Un grafo vacio no debe romper');

// --- aristas hacia atras en el grafo real ------------------------------------
const blueprints = JSON.parse(fs.readFileSync('apps/orca/data/workflow_blueprints.json', 'utf8'));
const workflow = blueprints.find((item) => item.id === 'careerai-indeed-agent');
const real = layoutGraph(workflow.nodes, workflow.edges);
if (real.positions.size !== workflow.nodes.length) throw new Error('Todos los nodos del workflow real deben colocarse');
if (real.width > 2200) throw new Error('El workflow real debe caber en pantalla');
const { layers } = computeLayers(workflow.nodes, workflow.edges);
const haciaAtras = countBackwardEdges(workflow.edges, layers);
if (haciaAtras > workflow.edges.length * 0.5) {
  throw new Error(`Demasiadas aristas hacia atras (${haciaAtras}/${workflow.edges.length}): el orden del grafo esta mal`);
}

console.log(JSON.stringify({
  ok: true,
  node: 'graph-layout',
  nodos_reales: workflow.nodes.length,
  columnas: real.columns,
  filas: real.rows,
  ancho_px: real.width,
  aristas_de_ciclo: real.back_edges.length,
  aristas_hacia_atras: haciaAtras,
}));
