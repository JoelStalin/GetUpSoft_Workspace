import assert from 'node:assert/strict';
import { mergeWorkflowState } from '../apps/orca/src/runtime/workflow-state-merge.mjs';
const base={id:'wf',name:'Current',active:false,nodes:[{id:'whatsapp',position:{x:1,y:2},data:{label:'WhatsApp',parameters:{provider:'evolution',to:''},configuration_schema:{properties:[{name:'provider'},{name:'to'},{name:'message'}]},n8n_equivalent:{type:'n8n-nodes-base.whatsApp'}}}],connections:{},edges:[],links:[]};
const saved={id:'wf',name:'User workflow',active:true,nodes:[{id:'whatsapp',position:{x:40,y:50},data:{label:'Mi WhatsApp',parameters:{provider:'meta_cloud'},configuration_schema:{properties:[{name:'provider'}]},n8n_equivalent:{type:'obsolete'}}}]};
const merged=mergeWorkflowState(base,saved),node=merged.nodes[0];
assert.equal(merged.name,'User workflow');assert.deepEqual(node.position,{x:40,y:50});assert.equal(node.data.label,'Mi WhatsApp');
assert.deepEqual(node.data.configuration_schema.properties.map(p=>p.name),['provider','to','message']);
assert.equal(node.data.n8n_equivalent.type,'n8n-nodes-base.whatsApp');assert.equal(node.data.parameters.provider,'meta_cloud');assert.equal(node.data.parameters.to,'');
console.log(JSON.stringify({ok:true,node:'workflow-schema-migration',preserves_user_values:true,refreshes_n8n_schema:true}));
