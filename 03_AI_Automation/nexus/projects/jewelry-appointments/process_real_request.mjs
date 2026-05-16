import { HANDLERS } from "../../src/workers/agentWorker.ts";

async function executeStep(agentType, jobType, payload) {
  const job = {
    jobId: `job-${Date.now()}`,
    agentType,
    jobType,
    payload,
    workerId: `worker-${agentType}`,
    executionMode: "local"
  };
  return await HANDLERS[agentType](job);
}

async function main() {
  console.log("--- PROCESANDO SOLICITUD DE CITA (AIHUB) ---");

  const inputRequest = {
    clientName: "Juan Pérez",
    clientEmail: "juan.perez@example.com",
    description: "Mi reloj de oro dejó de funcionar y parece tener una pieza suelta adentro.",
    requestedDate: "2026-05-10",
    requestedTime: "10:00"
  };

  // 1. Translator Worker (Local-First Classification)
  console.log("\n[STEP 1] Clasificando solicitud...");
  const classificationRules = {
    REPARACIÓN: ["reloj no funciona", "pieza suelta", "reparar", "reloj stopped"],
    CONSULTA: ["precio", "presupuesto"],
    DISEÑO: ["anillo", "crear"]
  };

  const description = inputRequest.description.toLowerCase();
  let category = "CONSULTA"; // default
  for (const [cat, keywords] of Object.entries(classificationRules)) {
    if (keywords.some(k => description.includes(k))) {
      category = cat;
      break;
    }
  }
  console.log(`[RESULT] Categoría detectada localmente: ${category}`);

  // 2. Integration Engineer (Building Google Calendar Payload)
  console.log("\n[STEP 2] Preparando integración con Google Calendar...");
  const integrationContract = {
    summary: `Cita Joyería: ${category} - ${inputRequest.clientName}`,
    description: inputRequest.description,
    start: { dateTime: `${inputRequest.requestedDate}T${inputRequest.requestedTime}:00Z` },
    end: { dateTime: `${inputRequest.requestedDate}T11:00:00Z` }
  };
  console.log("[RESULT] Payload de Google Calendar generado.");

  // 3. Worker Compliance (Final Verification)
  console.log("\n[STEP 3] Verificando cumplimiento de la cita...");
  const compliance = await executeStep("worker-compliance", "validate_appointment", {
    result: integrationContract,
    expectedSignals: ["summary", "start", "end"]
  });

  if (compliance.compliant) {
    console.log("\n[SUCCESS] Cita lista para agendar en Google Calendar.");
    console.log("--------------------------------------------------");
    console.log(JSON.stringify(integrationContract, null, 2));
    console.log("--------------------------------------------------");
  } else {
    console.log("[ERROR] Error en la validación final.");
  }
}

main();
