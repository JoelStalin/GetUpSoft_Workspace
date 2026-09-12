// Disposicion del grafo en el canvas.
//
// La rejilla anterior colocaba los nodos por orden de declaracion, asi que las 95 conexiones
// cruzaban el canvas en todas direcciones y el flujo era ilegible. Aqui se ordenan por capas
// topologicas: cada nodo se dibuja a la derecha de aquellos de los que depende, de modo que
// el grafo se lee de izquierda a derecha siguiendo el flujo real.

const COLUMN_WIDTH = 300;
const ROW_HEIGHT = 130;
const MARGIN_X = 60;
const MARGIN_Y = 60;

export function computeLayers(nodes = [], edges = []) {
  const ids = new Set(nodes.map((node) => node.id));
  const salientes = new Map(nodes.map((node) => [node.id, []]));
  for (const edge of edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to) continue;
    salientes.get(edge.from).push(edge.to);
  }

  // Kahn puro no sirve aqui: el grafo tiene ciclos legitimos (reintentos, escalados que
  // vuelven a un paso anterior, el investigador que realimenta al constructor de busquedas)
  // y dejaba 43 nodos sin capa, amontonados en la columna 0.
  // Se recorre en profundidad desde las raices y se ignoran las aristas que vuelven a un
  // ancestro: esas son las que cierran el ciclo, y son justo las que no deben marcar la capa.
  const capa = new Map(nodes.map((node) => [node.id, 0]));
  const backEdges = new Set();
  const enPila = new Set();
  const visitado = new Set();

  function recorrer(id, profundidad) {
    capa.set(id, Math.max(capa.get(id) ?? 0, profundidad));
    if (enPila.has(id)) return;
    enPila.add(id);
    visitado.add(id);
    for (const destino of salientes.get(id) || []) {
      if (enPila.has(destino)) { backEdges.add(`${id}->${destino}`); continue; }
      recorrer(destino, capa.get(id) + 1);
    }
    enPila.delete(id);
  }

  const conEntrada = new Set(edges.filter((edge) => ids.has(edge.from)).map((edge) => edge.to));
  const raices = nodes.filter((node) => !conEntrada.has(node.id));
  for (const raiz of raices) recorrer(raiz.id, 0);
  // Un componente enteramente ciclico no tiene raiz: se entra por cualquiera de sus nodos.
  for (const node of nodes) if (!visitado.has(node.id)) recorrer(node.id, 0);

  return {
    layers: capa,
    back_edges: [...backEdges],
    roots: raices.map((node) => node.id),
  };
}

// El orden topologico puro producia 33 columnas (~10.000 px): al encuadrarlo, los nodos
// quedaban reducidos a lineas. Se conserva ese orden (que es el que hace legible el flujo)
// pero se envuelve en filas para que el grafo quepa en pantalla.
export function layoutGraph(nodes = [], edges = [], { columns = 6 } = {}) {
  const { layers, back_edges, roots } = computeLayers(nodes, edges);

  // Cuando el inventario funcional aporta bloques (A..I), cada bloque se convierte en
  // una "swimlane" vertical. Esto evita que conectores de notificacion, modelos, gates y
  // reportes se mezclen en una rejilla arbitraria. Dentro de cada lane se aproxima el
  // orden de sus predecesores para reducir cruces.
  const withBlocks = nodes.filter((node) => node.block);
  if (nodes.length > 0 && withBlocks.length === nodes.length) {
    const blockIds = [...new Set(nodes.map((node) => node.block))].sort();
    const index = new Map(nodes.map((node, position) => [node.id, position]));
    const predecessors = new Map(nodes.map((node) => [node.id, []]));
    for (const edge of edges) if (predecessors.has(edge.to)) predecessors.get(edge.to).push(edge.from);
    const groups = new Map(blockIds.map((block) => [block, nodes.filter((node) => node.block === block)]));
    const rowById = new Map();
    for (const block of blockIds) {
      const group = groups.get(block);
      group.sort((a, b) => {
        const score = (node) => {
          const rows = (predecessors.get(node.id) || []).map((id) => rowById.get(id)).filter(Number.isFinite);
          return rows.length ? rows.reduce((sum, row) => sum + row, 0) / rows.length : index.get(node.id);
        };
        return score(a) - score(b);
      });
      group.forEach((node, row) => rowById.set(node.id, row));
    }
    const posiciones = new Map();
    blockIds.forEach((block, column) => {
      groups.get(block).forEach((node, row) => posiciones.set(node.id, {
        x: MARGIN_X + column * COLUMN_WIDTH,
        y: MARGIN_Y + row * ROW_HEIGHT,
      }));
    });
    const rows = Math.max(0, ...blockIds.map((block) => groups.get(block).length));
    return {
      ok: true,
      strategy: 'functional_swimlanes',
      positions: posiciones,
      order: blockIds.flatMap((block) => groups.get(block).map((node) => node.id)),
      layer_count: blockIds.length,
      columns: blockIds.length,
      rows,
      back_edges,
      roots,
      width: MARGIN_X * 2 + blockIds.length * COLUMN_WIDTH,
      height: MARGIN_Y * 2 + rows * ROW_HEIGHT,
      lanes: blockIds,
    };
  }

  // Orden de lectura: primero por capa, y dentro de la capa por su orden de declaracion,
  // que agrupa los nodos del mismo bloque funcional.
  const indiceOriginal = new Map(nodes.map((node, index) => [node.id, index]));
  const ordenados = [...nodes].sort((a, b) => {
    const capaA = layers.get(a.id) ?? 0;
    const capaB = layers.get(b.id) ?? 0;
    if (capaA !== capaB) return capaA - capaB;
    return indiceOriginal.get(a.id) - indiceOriginal.get(b.id);
  });

  const posiciones = new Map();
  ordenados.forEach((node, indice) => {
    posiciones.set(node.id, {
      x: MARGIN_X + (indice % columns) * COLUMN_WIDTH,
      y: MARGIN_Y + Math.floor(indice / columns) * ROW_HEIGHT,
    });
  });

  const filas = Math.ceil(ordenados.length / columns);
  return {
    ok: true,
    positions: posiciones,
    order: ordenados.map((node) => node.id),
    layer_count: new Set([...layers.values()]).size,
    columns,
    rows: filas,
    back_edges,
    roots,
    width: MARGIN_X * 2 + Math.min(columns, ordenados.length) * COLUMN_WIDTH,
    height: MARGIN_Y * 2 + filas * ROW_HEIGHT,
  };
}

// Mide cuantas aristas van hacia atras. Una arista hacia atras es legitima (un reintento,
// un escalado que vuelve al paso anterior), pero muchas indican que el orden esta mal.
export function countBackwardEdges(edges = [], layers) {
  return edges.filter((edge) => {
    const origen = layers.get(edge.from);
    const destino = layers.get(edge.to);
    return origen !== undefined && destino !== undefined && destino <= origen;
  }).length;
}
