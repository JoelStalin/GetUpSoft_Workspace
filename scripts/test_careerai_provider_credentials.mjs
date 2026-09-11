import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const suffix=`${process.pid}-${Date.now()}`;
process.env.ORCA_PROVIDER_VAULT=path.resolve(`data/careerai/test-provider-${suffix}.enc.json`);
process.env.ORCA_PROVIDER_KEY_FILE=path.resolve(`data/careerai/test-provider-${suffix}.key`);
const {providerCredentialStatus,saveProviderCredential,removeProviderCredential}=await import('../platform/orca/src/security/provider-credential-vault.mjs');
const secret='sk-test-secret-never-plaintext';
try{
 assert.equal(providerCredentialStatus().find(p=>p.id==='openai').configured,false);
 const saved=saveProviderCredential('openai',secret); assert.equal(saved.reconnect_applied,true);
 assert.equal(providerCredentialStatus().find(p=>p.id==='openai').status,'configured');
 assert.equal(fs.readFileSync(process.env.ORCA_PROVIDER_VAULT,'utf8').includes(secret),false);
 assert.equal(JSON.stringify(providerCredentialStatus()).includes(secret),false);
 removeProviderCredential('openai'); assert.equal(providerCredentialStatus().find(p=>p.id==='openai').configured,false);
 console.log(JSON.stringify({ok:true,node:'provider-credentials',encrypted:true,reconnect:true,secret_exposed:false}));
}finally{for(const f of [process.env.ORCA_PROVIDER_VAULT,process.env.ORCA_PROVIDER_KEY_FILE])if(fs.existsSync(f))fs.unlinkSync(f)}
