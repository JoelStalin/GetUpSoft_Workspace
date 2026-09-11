import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  recordNodeExecution, getExecutionData, getNodeExecutionData,
  pinNodeData, unpinNodeData, resolvedNodeOutput, clearExecutionData, clearPinnedData,
  withNodeExecution,
} from '../platform/orca/src/careerai/execution-debug.mjs';

const runId = `test-exec-debug-${Date.now()}`;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'data', 'careerai', 'executions', `${runId}.json`);

// --- registrar una ejecucion guarda input/output reales, no solo un resumen ------
recordNodeExecution(runId, 'dedupe-canonical', {
  status: 'completed', input: [{ id: 1 }, { id: 1 }], output: [{ id: 1 }],
  startedAt: '2026-08-28T10:00:00.000Z', finishedAt: '2026-08-28T10:00:01.500Z',
});
const nodeData = getNodeExecutionData(runId, 'dedupe-canonical');
if (nodeData.last.output.length !== 1) throw new Error('Debe guardar la salida real del nodo, no un resumen');
if (nodeData.last.execution_time_ms !== 1500) throw new Error('Debe calcular el tiempo de ejecucion a partir de started/finished');
if (nodeData.history.length !== 1) throw new Error('Debe quedar en el historial del nodo');

// --- un nodo puede ejecutarse mas de una vez (loop): se acumula, no se pisa ------
recordNodeExecution(runId, 'dedupe-canonical', { status: 'completed', input: [{ id: 2 }], output: [{ id: 2 }] });
const nodeData2 = getNodeExecutionData(runId, 'dedupe-canonical');
if (nodeData2.history.length !== 2) throw new Error('Ejecuciones repetidas del mismo nodo deben acumularse, no reemplazarse');

// --- errores tambien se graban, con input pero sin output ------------------------
recordNodeExecution(runId, 'stack-classifier', { status: 'error', input: [{ id: 3 }], error: new Error('catalogo vacio') });
const errNode = getNodeExecutionData(runId, 'stack-classifier');
if (errNode.last.status !== 'error' || errNode.last.error !== 'catalogo vacio') {
  throw new Error('Un error debe quedar registrado con su mensaje, no silenciado');
}

// --- getExecutionData trae el runData completo del run, forma n8n ----------------
const full = getExecutionData(runId);
if (!full.nodes['dedupe-canonical'] || !full.nodes['stack-classifier']) {
  throw new Error('getExecutionData debe traer todos los nodos registrados de este run');
}

// --- resolvedNodeOutput sin pin: usa la ULTIMA ejecucion real --------------------
const sinPin = resolvedNodeOutput(runId, 'dedupe-canonical');
if (sinPin.source !== 'last_execution' || sinPin.data[0].id !== 2) {
  throw new Error('Sin pin, debe resolver a la salida de la ultima ejecucion real');
}

// --- pin: mientras exista, resolvedNodeOutput usa el pin, no la ultima ejecucion -
pinNodeData(runId, 'dedupe-canonical', [{ id: 'FIJADO_MANUALMENTE' }]);
const conPin = resolvedNodeOutput(runId, 'dedupe-canonical');
if (conPin.source !== 'pinned' || conPin.data[0].id !== 'FIJADO_MANUALMENTE') {
  throw new Error('Con un pin activo, debe usarse el dato fijado, no la ultima ejecucion real');
}
// Una nueva ejecucion real NO debe pisar el pin (n8n tampoco lo hace).
recordNodeExecution(runId, 'dedupe-canonical', { status: 'completed', output: [{ id: 'nueva-ejecucion-real' }] });
const siguePinneado = resolvedNodeOutput(runId, 'dedupe-canonical');
if (siguePinneado.source !== 'pinned') throw new Error('Una ejecucion nueva no debe romper un pin activo');

// --- unpin: vuelve a resolver a la ultima ejecucion real --------------------------
unpinNodeData(runId, 'dedupe-canonical');
const desdePinneado = resolvedNodeOutput(runId, 'dedupe-canonical');
if (desdePinneado.source !== 'last_execution' || desdePinneado.data[0].id !== 'nueva-ejecucion-real') {
  throw new Error('Al despinear, debe volver a resolver a la ultima ejecucion real');
}

// --- withNodeExecution: envuelve fn, resuelve el input del nodo anterior automaticamente --
recordNodeExecution(runId, 'previo', { status: 'completed', output: { total: 42 } });
const resultado = await withNodeExecution(runId, 'siguiente', async (input) => {
  if (input.total !== 42) throw new Error('withNodeExecution debe resolver el input del nodo anterior');
  return { doblado: input.total * 2 };
}, { previousNodeId: 'previo' });
if (resultado.doblado !== 84) throw new Error('withNodeExecution debe devolver la salida real de fn');
const siguienteGrabado = getNodeExecutionData(runId, 'siguiente');
if (siguienteGrabado.last.output.doblado !== 84) throw new Error('withNodeExecution debe grabar la salida real');

// --- withNodeExecution en error: graba el error y lo re-lanza --------------------
let lanzo = false;
try {
  await withNodeExecution(runId, 'nodo-que-falla', async () => { throw new Error('boom'); });
} catch (e) {
  lanzo = e.message === 'boom';
}
if (!lanzo) throw new Error('withNodeExecution debe re-lanzar el error despues de grabarlo');
const falloGrabado = getNodeExecutionData(runId, 'nodo-que-falla');
if (falloGrabado.last.status !== 'error') throw new Error('El fallo debe quedar registrado como error');

// --- clearExecutionData limpia el historial pero PRESERVA los pines --------------
pinNodeData(runId, 'nodo-pineado-persistente', { x: 1 });
const limpieza = clearExecutionData(runId);
if (limpieza.pinned_preserved !== 1) throw new Error('Limpiar la ejecucion no debe borrar los pines existentes');
const trasLimpiar = getExecutionData(runId);
if (Object.keys(trasLimpiar.nodes).length !== 0) throw new Error('clearExecutionData debe vaciar el historial de nodos');
if (!trasLimpiar.pinned_node_ids.includes('nodo-pineado-persistente')) throw new Error('El pin debe seguir vivo tras limpiar');

// --- clearPinnedData si hace falta limpiar tambien los pines a proposito ---------
const limpiezaPines = clearPinnedData(runId);
if (limpiezaPines.cleared_pins !== 1) throw new Error('clearPinnedData debe reportar cuantos pines borro');

fs.rmSync(file, { force: true });

console.log(JSON.stringify({
  ok: true,
  node: 'execution-debug',
  guarda_input_output_real: true,
  acumula_ejecuciones_repetidas: true,
  pin_tiene_prioridad_sobre_ultima_ejecucion: true,
  limpiar_ejecucion_preserva_pines: true,
  with_node_execution_resuelve_input_previo: true,
}));
