/* eslint-disable no-console */
const fs = require("fs");
const os = require("os");
const path = require("path");

const BASE_URL = process.env.ORCA_BASE_URL || "https://ethernet-deck-frog-holds.trycloudflare.com";

async function req(urlPath, method = "GET", body) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) throw new Error(`${method} ${urlPath} -> HTTP ${res.status} ${JSON.stringify(json)}`);
  return json;
}

function getSandboxRoot() {
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "GetUpSoft", "OrcaAgent", "sandbox");
  }
  if (process.platform === "linux") {
    return path.join(os.homedir(), ".local", "share", "GetUpSoft", "OrcaAgent", "sandbox");
  }
  const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
  return path.join(appData, "GetUpSoft", "OrcaAgent", "sandbox");
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function runSandboxCommand(command) {
  const sandboxRoot = getSandboxRoot();
  const jobDir = path.join(sandboxRoot, command.id);
  ensureDir(jobDir);

  const inputFile = path.join(jobDir, "input.json");
  const outputFile = path.join(jobDir, "output.json");
  const runtimeLog = path.join(jobDir, "runtime.log");

  fs.writeFileSync(inputFile, JSON.stringify(command.payload || {}, null, 2), "utf8");
  fs.writeFileSync(
    runtimeLog,
    `[${new Date().toISOString()}] RUN_FLOW ${command.id}\n`,
    "utf8"
  );

  const output = {
    commandId: command.id,
    executedAt: new Date().toISOString(),
    message: "Sandbox flow executed by ORCA desktop client MVP",
    payloadEcho: command.payload || {}
  };
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), "utf8");

  return { jobDir, inputFile, outputFile, runtimeLog };
}

async function main() {
  const slug = `prod-link-${Math.floor(Date.now() / 1000)}`;

  const tenant = await req("/api/v1/tenants", "POST", { name: "Prod Link QA", slug });
  const pairing = await req(`/api/v1/tenants/${tenant.id}/pairing-codes`, "POST", {});
  const enroll = await req("/api/v1/agent/devices/enroll", "POST", {
    pairingCode: pairing.pairingCode,
    deviceName: "Desktop-Sandbox-QA",
    os: "windows",
    arch: "x64",
    agentVersion: "0.1.0",
    publicKey: `DESKTOP-QA-${Date.now()}`
  });

  await req(`/api/v1/agent/devices/${enroll.deviceId}/heartbeat`, "POST", {
    status: "connected",
    agentVersion: "0.1.0",
    runtimeVersion: "0.1.0",
    tunnelStatus: "connected",
    lastError: null,
    localTime: new Date().toISOString()
  });

  const command = await req(`/api/v1/devices/${enroll.deviceId}/commands`, "POST", {
    type: "RUN_FLOW",
    flowId: "flow-demo-hello",
    payload: { input: "from-prod", mode: "sandbox" },
    ttlSeconds: 300,
    idempotencyKey: `idem-${Date.now()}`
  });

  const poll = await req(`/api/v1/agent/devices/${enroll.deviceId}/commands/poll`);
  const received = poll.commands && poll.commands[0];
  if (!received) throw new Error("No command received by client poll.");

  const sandbox = runSandboxCommand(received);

  const result = await req(
    `/api/v1/agent/devices/${enroll.deviceId}/commands/${received.id}/result`,
    "POST",
    {
      status: "succeeded",
      startedAt: new Date().toISOString(),
      finishedAt: new Date(Date.now() + 500).toISOString(),
      exitCode: 0,
      safeLogs: `Sandbox executed at ${sandbox.jobDir}`,
      artifacts: [{ type: "file", path: sandbox.outputFile }]
    }
  );

  const audit = await req(`/api/v1/devices/${enroll.deviceId}/audit`);

  const summary = {
    baseUrl: BASE_URL,
    tenantId: tenant.id,
    pairingCode: pairing.pairingCode,
    deviceId: enroll.deviceId,
    commandIssuedId: command.id,
    commandReceivedId: received.id,
    resultOk: result.ok === true,
    sandbox,
    auditCount: Array.isArray(audit) ? audit.length : 0
  };

  const outDir = path.join(process.cwd(), "evidence");
  ensureDir(outDir);
  const outFile = path.join(outDir, `prod-link-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2), "utf8");

  console.log(JSON.stringify({ ...summary, evidenceFile: outFile }, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
