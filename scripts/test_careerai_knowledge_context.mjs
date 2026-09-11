import assert from 'node:assert/strict';
import { getCareerKnowledgeContext } from '../platform/orca/src/careerai/knowledge-context.mjs';

const context = getCareerKnowledgeContext();
assert.equal(context.ok, true);
assert.equal(context.module, 'edX course enrichment');
assert.equal(context.public_course_links, 5);
assert.deepEqual(context.topics, ['MCP agents', 'AI agents automation', 'workflow automation']);
assert.match(context.source_policy, /public metadata only/i);
console.log(JSON.stringify(context));
