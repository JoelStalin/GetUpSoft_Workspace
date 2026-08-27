const baseUrl = process.env.ORCA_TEST_URL || 'http://127.0.0.1:4173';

const started = await (await fetch(`${baseUrl}/api/careerai/runs`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ fixture_id: 'indeed-remote-valid', provider: 'linkedin' }),
})).json();
if (!started.ok || started.mode !== 'prepare-only') throw new Error('Run must start in prepare-only mode');
if (started.submit_performed !== false || started.approval_required !== true) throw new Error('Run start violated submit guard');
if (!started.steps?.some((step) => step.node_id === 'external-form-fill')) throw new Error('Missing external form fill step');
if (!started.steps?.some((step) => step.node_id === 'live-browser-monitor' && step.status === 'streaming')) throw new Error('Live browser monitor step must stream');
if (started.live_browser?.read_only_until_approval !== true) throw new Error('Live browser must be read-only until approval');
if (started.form_fill?.submit_performed !== false) throw new Error('Form fill must never submit');
for (const gate of ['login', 'captcha', 'mfa', 'submit']) {
  if (!started.form_fill?.pause_on?.includes(gate)) throw new Error(`Form fill must pause on ${gate}`);
}

const detail = await (await fetch(`${baseUrl}/api/careerai/runs/${started.run_id}`)).json();
if (detail.run_id !== started.run_id) throw new Error('Run detail lookup failed');

const listed = await (await fetch(`${baseUrl}/api/careerai/runs`)).json();
if (!listed.runs?.some((run) => run.run_id === started.run_id)) throw new Error('Run must be listed for ORCA tracking');

const stream = await fetch(`${baseUrl}/api/careerai/runs/${started.run_id}/stream`);
const streamBody = await stream.text();
if (!stream.headers.get('content-type')?.includes('text/event-stream')) throw new Error('Stream must be SSE');
if (!streamBody.includes('event: live_browser')) throw new Error('Stream must publish live browser session');

const session = await (await fetch(`${baseUrl}/api/careerai/live-browser?run_id=${started.run_id}&provider=workday`)).json();
if (session.provider !== 'workday' || session.fill_mode !== 'prepare_only') throw new Error('Live browser provider gate failed');

const bad = await fetch(`${baseUrl}/api/careerai/live-browser?run_id=${started.run_id}&provider=unknown-board`);
if (bad.status !== 400) throw new Error('Unsupported provider must be rejected');

const missing = await fetch(`${baseUrl}/api/careerai/runs/run-does-not-exist`);
if (missing.status !== 404) throw new Error('Unknown run must return 404');

console.log(JSON.stringify({ ok: true, run_id: started.run_id, tracking: 'enabled', live_browser: 'streaming', submit_performed: false }));
