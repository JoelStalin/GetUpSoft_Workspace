const baseUrl = process.env.ORCA_TEST_URL || 'http://127.0.0.1:4173';
const response = await fetch(`${baseUrl}/api/careerai/prepare-only?fixture=indeed-remote-valid`);
if (!response.ok) throw new Error(`Expected prepare-only endpoint to return 200, got ${response.status}`);
const payload = await response.json();
if (payload.mode !== 'prepare-only') throw new Error('Expected prepare-only mode');
if (payload.submit_performed !== false) throw new Error('Prepare-only endpoint must never submit');
if (payload.approval_required !== true) throw new Error('Prepare-only endpoint must require approval');
const expectedGates = { indeed: 'prepare-only', linkedin: 'discovery-only', gmail: 'draft-only', google_drive: 'read-only', hermes: 'requires_configuration' };
for (const [connector, status] of Object.entries(expectedGates)) {
  if (payload.connector_gates?.[connector] !== status) throw new Error(`Unexpected ${connector} gate`);
}
const connectorResponse = await fetch(`${baseUrl}/api/careerai/connectors`);
if (!connectorResponse.ok) throw new Error(`Expected connector status endpoint to return 200, got ${connectorResponse.status}`);
const connectorPayload = await connectorResponse.json();
if (JSON.stringify(connectorPayload.connector_gates) !== JSON.stringify(expectedGates)) throw new Error('Connector status endpoint mismatch');
if (connectorPayload.linkedin?.mode !== 'discovery-only' || connectorPayload.linkedin?.capabilities?.prepareApplication !== false) {
  throw new Error('LinkedIn capability status endpoint mismatch');
}
if (connectorPayload.indeed?.mode !== 'prepare-only' || connectorPayload.indeed?.capabilities?.submitApplication !== false) {
  throw new Error('Indeed capability status endpoint mismatch');
}
console.log(JSON.stringify({ ok: true, fixture_id: payload.fixture_id, submit_performed: payload.submit_performed }));
