import fs from 'node:fs';

const auditPath = process.argv[2] || 'data/careerai/form-audit.json';
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const packet = {
  schema_version: 'careerai.model-review.v1',
  task: 'Review an external job application form mapping. Do not submit, upload, or authenticate.',
  candidates: ['gemini', 'chatgpt', 'claude'],
  audit,
  required_output: ['field_mapping', 'missing_required_data', 'ambiguities', 'risk_flags', 'confidence'],
  policy: { human_review_required: true, submission_allowed: false, credentials_excluded: true, cv_content_excluded: true },
};
console.log(JSON.stringify(packet, null, 2));
