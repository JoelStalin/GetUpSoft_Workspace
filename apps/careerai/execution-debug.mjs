// Datos de ejecucion estilo n8n para depurar un run de CareerAI desde el canvas de ORCA.
//
// n8n guarda, por cada nodo de una ejecucion, la data que entro y la que salio
// (`runData[nodeName] = [{ data, error, executionTime, startTime }, ...]`), permite "pinear"
// la salida de un nodo (los nodos aguas abajo usan ese valor fijo aunque el nodo se vuelva a
// ejecutar) y dejar re-ejecutar desde un nodo puntual. Antes de esto, pipeline.mjs solo
// guardaba contadores-resumen por paso (`{node, status, unique: 3}`) — suficiente para saber
// que paso, pero no para inspeccionar POR QUE goes mal un nodo concreto sin volver a correr
// todo con console.log.
//
// Este modulo es el almacen (archivo por run) + las operaciones de lectura/pin/limpieza.
// pipeline.mjs lo llena si se le pasa un runId; sin runId sigue funcionando igual que antes
// (nadie que ya lo use se rompe).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const executionsDir = path.join(root, 'data', 'careerai', 'executions');

function fileFor(runId) {
  if (!runId) throw new Error('runId requerido');
  // Mismo saneo que usa tenant-resolver: sin barras ni traversal en el nombre de archivo.
  const safe = String(runId).replace(/[^A-Za-z0-9_-]/g, '');
  if (!safe) throw new Error('runId invalido');
  return path.join(executionsDir, `${safe}.json`);
}

function emptyState(runId) {
  return { run_id: runId, nodes: {}, pinned: {}, updated_at: null };
}

function readState(runId) {
  try {
    return JSON.parse(fs.readFileSync(fileFor(runId), 'utf8'));
  } catch {
    return emptyState(runId);
  }
}

function writeState(state) {
  fs.mkdirSync(executionsDir, { recursive: true });
  state.updated_at = new Date().toISOString();
  fs.writeFileSync(fileFor(state.run_id), JSON.stringify(state, null, 2));
  return state;
}

// Registra una ejecucion de nodo. Como en n8n, se ACUMULA (un nodo puede ejecutarse mas de
// una vez dentro del mismo run, p. ej. en un loop) — nunca se pisa el historial anterior.
export function recordNodeExecution(runId, nodeId, {
  status = 'completed',
  input = null,
  output = null,
  error = null,
  startedAt = null,
  finishedAt = null,
} = {}) {
  if (!nodeId) throw new Error('nodeId requerido');
  const state = readState(runId);
  if (!state.nodes[nodeId]) state.nodes[nodeId] = [];
  const executionTimeMs = startedAt && finishedAt
    ? Math.max(0, new Date(finishedAt) - new Date(startedAt))
    : null;
  const entry = {
    run_index: state.nodes[nodeId].length,
    status,
    input,
    output,
    error: error ? String(error?.message || error) : null,
    started_at: startedAt,
    finished_at: finishedAt,
    execution_time_ms: executionTimeMs,
  };
  state.nodes[nodeId].push(entry);
  writeState(state);
  return entry;
}

// Todo el runData del run, forma n8n: { [nodeId]: NodeRunData[] }.
export function getExecutionData(runId) {
  const state = readState(runId);
  return { ok: true, run_id: runId, nodes: state.nodes, pinned_node_ids: Object.keys(state.pinned), updated_at: state.updated_at };
}

// Historial de un solo nodo (todas sus ejecuciones dentro de este run).
export function getNodeExecutionData(runId, nodeId) {
  const state = readState(runId);
  const history = state.nodes[nodeId] || [];
  return {
    ok: true, run_id: runId, node_id: nodeId,
    history,
    last: history.length ? history[history.length - 1] : null,
    pinned: Object.prototype.hasOwnProperty.call(state.pinned, nodeId) ? state.pinned[nodeId] : null,
  };
}

// Pinea la salida de un nodo: mientras este pin exista, resolvedNodeOutput devuelve ESTE
// valor en vez de la ultima ejecucion real, igual que "Pin data" en n8n. Util para depurar un
// nodo aguas abajo sin tener que volver a disparar el nodo caro/lento que lo alimenta (p. ej.
// una llamada real a un LLM o un scrape).
export function pinNodeData(runId, nodeId, data) {
  if (!nodeId) throw new Error('nodeId requerido');
  const state = readState(runId);
  state.pinned[nodeId] = { data, pinned_at: new Date().toISOString() };
  writeState(state);
  return { ok: true, run_id: runId, node_id: nodeId, pinned: true };
}

export function unpinNodeData(runId, nodeId) {
  const state = readState(runId);
  const existed = Object.prototype.hasOwnProperty.call(state.pinned, nodeId);
  delete state.pinned[nodeId];
  writeState(state);
  return { ok: true, run_id: runId, node_id: nodeId, was_pinned: existed };
}

// Lo que un nodo aguas abajo deberia usar: el pin si existe, si no la salida de la ultima
// ejecucion real. Es la funcion que un ejecutor de nodos deberia llamar para leer la entrada
// del nodo anterior en vez de ir directo a getNodeExecutionData.
export function resolvedNodeOutput(runId, nodeId) {
  const state = readState(runId);
  if (Object.prototype.hasOwnProperty.call(state.pinned, nodeId)) {
    return { ok: true, run_id: runId, node_id: nodeId, source: 'pinned', data: state.pinned[nodeId].data };
  }
  const history = state.nodes[nodeId] || [];
  if (!history.length) return { ok: true, run_id: runId, node_id: nodeId, source: 'none', data: null };
  return { ok: true, run_id: runId, node_id: nodeId, source: 'last_execution', data: history[history.length - 1].output };
}

// Limpia el historial de ejecucion de un run (para volver a correrlo de cero). Los pines NO
// se tocan a proposito: pinear algo es una decision explicita de quien depura, y limpiar una
// corrida no deberia perderla sin que lo pidan aparte.
export function clearExecutionData(runId) {
  const state = readState(runId);
  state.nodes = {};
  writeState(state);
  return { ok: true, run_id: runId, cleared: true, pinned_preserved: Object.keys(state.pinned).length };
}

export function clearPinnedData(runId) {
  const state = readState(runId);
  const count = Object.keys(state.pinned).length;
  state.pinned = {};
  writeState(state);
  return { ok: true, run_id: runId, cleared_pins: count };
}

// Envoltorio para que un ejecutor de nodos registre timing/error/output sin repetir el
// try/catch cada vez. `fn` recibe la entrada resuelta (pin o ultima salida del nodo previo si
// se pasa previousNodeId) y debe devolver la salida de ESTE nodo.
export async function withNodeExecution(runId, nodeId, fn, { input = null, previousNodeId = null } = {}) {
  const resolvedInput = input !== null
    ? input
    : (previousNodeId ? resolvedNodeOutput(runId, previousNodeId).data : null);
  const startedAt = new Date().toISOString();
  try {
    const output = await fn(resolvedInput);
    const finishedAt = new Date().toISOString();
    recordNodeExecution(runId, nodeId, { status: 'completed', input: resolvedInput, output, startedAt, finishedAt });
    return output;
  } catch (error) {
    const finishedAt = new Date().toISOString();
    recordNodeExecution(runId, nodeId, { status: 'error', input: resolvedInput, output: null, error, startedAt, finishedAt });
    throw error;
  }
}
