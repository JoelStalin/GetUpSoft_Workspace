import { Command } from "commander";

const program = new Command();
const baseUrl = process.env.ORCA_API_URL ?? "http://localhost:8788/api/v1";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}

program.name("orca").description("ORCA Admin CLI").version("0.1.0");

program
  .command("health")
  .description("Health check placeholder")
  .option("--pretty", "Pretty output")
  .action((opts: { pretty?: boolean }) => {
    const payload = {
      status: "ok",
      service: "orca-admin-cli",
      timestamp: new Date().toISOString()
    };
    if (opts.pretty) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    console.log(JSON.stringify(payload));
  });

program
  .command("tenant:create")
  .requiredOption("--name <name>")
  .requiredOption("--slug <slug>")
  .action(async (opts: { name: string; slug: string }) => {
    console.log(JSON.stringify(await api("/tenants", "POST", opts), null, 2));
  });

program
  .command("pairing:issue")
  .requiredOption("--tenantId <tenantId>")
  .action(async (opts: { tenantId: string }) => {
    console.log(JSON.stringify(await api(`/tenants/${opts.tenantId}/pairing-codes`, "POST"), null, 2));
  });

program
  .command("device:enroll")
  .requiredOption("--pairingCode <pairingCode>")
  .requiredOption("--deviceName <deviceName>")
  .action(async (opts: { pairingCode: string; deviceName: string }) => {
    console.log(
      JSON.stringify(
        await api("/agent/devices/enroll", "POST", {
          pairingCode: opts.pairingCode,
          deviceName: opts.deviceName,
          os: "windows",
          arch: "x64",
          agentVersion: "1.0.0",
          publicKey: "BASE64_PUBLIC_KEY"
        }),
        null,
        2
      )
    );
  });

program.parseAsync(process.argv);
