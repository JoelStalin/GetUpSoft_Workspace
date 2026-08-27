// Mantiene honesto el inventario de nodos: todo lo marcado "listo" tiene que existir
// de verdad en el blueprint, y todo nodo del blueprint tiene que estar inventariado.
// Sin esto, el inventario se convierte en una lista de deseos que nadie revisa.
import fs from 'node:fs';

const inventory = JSON.parse(fs.readFileSync('data/careerai/node-inventory.json', 'utf8'));
const blueprints = JSON.parse(fs.readFileSync('apps/orca/data/workflow_blueprints.json', 'utf8'));
const workflow = blueprints.find((item) => item.id === inventory.workflow_id);
if (!workflow) throw new Error(`Workflow no encontrado: ${inventory.workflow_id}`);

const VALID_STATUS = ['listo', 'prototipo', 'falta'];
const VALID_OWNER = ['claude', 'joel', 'ambos', '-'];

const blueprintIds = new Set(workflow.nodes.map((node) => node.id));
const inventoryIds = new Set();
const errors = [];

for (const node of inventory.nodes) {
  for (const field of ['id', 'type', 'status', 'owner', 'purpose', 'block']) {
    if (!node[field]) errors.push(`${node.id || '(sin id)'}: falta el campo ${field}`);
  }
  if (inventoryIds.has(node.id)) errors.push(`${node.id}: duplicado en el inventario`);
  inventoryIds.add(node.id);

  if (!VALID_STATUS.includes(node.status)) errors.push(`${node.id}: estado invalido "${node.status}"`);
  if (!VALID_OWNER.includes(node.owner)) errors.push(`${node.id}: owner invalido "${node.owner}"`);

  // Un nodo "listo" que no esta en el blueprint es una mentira en el inventario.
  if (node.status === 'listo' && !blueprintIds.has(node.id)) {
    errors.push(`${node.id}: marcado "listo" pero no existe en el blueprint`);
  }
  // Un nodo que ya esta en el blueprint no puede seguir como pendiente.
  if (node.status !== 'listo' && blueprintIds.has(node.id)) {
    errors.push(`${node.id}: existe en el blueprint pero figura como "${node.status}"`);
  }
  // El tipo declarado debe coincidir con el del blueprint.
  const built = workflow.nodes.find((candidate) => candidate.id === node.id);
  if (built && built.type !== node.type) {
    errors.push(`${node.id}: tipo "${node.type}" no coincide con el blueprint ("${built.type}")`);
  }
}

for (const id of blueprintIds) {
  if (!inventoryIds.has(id)) errors.push(`${id}: esta en el blueprint pero falta en el inventario`);
}

const counted = {
  total: inventory.nodes.length,
  listo: inventory.nodes.filter((node) => node.status === 'listo').length,
  prototipo: inventory.nodes.filter((node) => node.status === 'prototipo').length,
  falta: inventory.nodes.filter((node) => node.status === 'falta').length,
};
for (const [key, value] of Object.entries(counted)) {
  if (inventory.totals[key] !== value) {
    errors.push(`totals.${key} dice ${inventory.totals[key]} pero hay ${value}`);
  }
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  schema_version: inventory.schema_version,
  ...counted,
  blueprint_nodes: blueprintIds.size,
  pendiente_por_owner: {
    joel: inventory.nodes.filter((node) => node.owner === 'joel' && node.status !== 'listo').length,
    claude: inventory.nodes.filter((node) => node.owner === 'claude' && node.status !== 'listo').length,
    ambos: inventory.nodes.filter((node) => node.owner === 'ambos').length,
  },
}));
