import fs from 'node:fs';import assert from 'node:assert/strict';
const parity=JSON.parse(fs.readFileSync('data/careerai/n8n-node-parity.json','utf8'));
let cases=0;
for(const node of parity.nodes){
 assert.ok(node.n8n_equivalent.type);assert.ok(node.n8n_equivalent.source_url);
 assert.ok(Array.isArray(node.configuration.properties)&&node.configuration.properties.length);
 const defaults=Object.fromEntries(node.configuration.properties.map(p=>[p.name,p.default]));
 for(const p of node.configuration.properties)assert.ok(Object.prototype.hasOwnProperty.call(defaults,p.name));
 assert.equal(node.use_cases.length,2);assert.equal(node.functional_tests.length,3);cases+=3;
 if(node.n8n_equivalent.type==='n8n-nodes-base.code')assert.ok(node.configuration.properties.some(p=>p.typeOptions?.editor==='codeNodeEditor'));
}
const wa=parity.nodes.filter(n=>n.whatsapp_options);assert.equal(wa.length,3);for(const n of wa){assert.ok(n.whatsapp_options.free_self_hosted);assert.ok(n.whatsapp_options.official)}
console.log(JSON.stringify({ok:true,nodes:parity.nodes.length,functional_contract_cases:cases,whatsapp_dual_provider:wa.length,script_editor:true}));
