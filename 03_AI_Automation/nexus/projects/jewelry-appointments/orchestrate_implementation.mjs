import { HANDLERS } from "../../src/workers/agentWorker.ts";

async function executeStep(agentType, jobType, payload) {
  console.log(`[EXECUTING] Worker: ${agentType} | Job: ${jobType}`);
  const job = {
    jobId: `job-${Date.now()}`,
    agentType,
    jobType,
    payload,
    workerId: `worker-${agentType}`,
    executionMode: "local"
  };
  const result = await HANDLERS[agentType](job);
  console.log(`[RESULT] ${result.summary}`);
  return result;
}

async function main() {
  // PASO 1: integration-engineer - Diseño de Contrato
  const integrationContract = {
    standardPayload: {
      clientName: "string",
      clientEmail: "string (email)",
      serviceType: "REPARACIÓN | CONSULTA | DISEÑO",
      description: "string",
      date: "YYYY-MM-DD",
      time: "HH:mm"
    },
    googleCalendar: {
      endpoint: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      method: "POST",
      auth: "OAuth2",
      bodyTemplate: {
        summary: "Cita Joyería: {{serviceType}} - {{clientName}}",
        description: "{{description}}",
        start: { dateTime: "{{date}}T{{time}}:00Z" },
        end: { dateTime: "{{date}}T{{time_end}}:00Z" }
      }
    }
  };

  console.log("[ARTIFACT] Generando integrationContract.json...");
  // Aquí simulamos que el worker-compliance valida este contrato.
  const complianceCheck = await executeStep("worker-compliance", "validate_contract", {
    result: integrationContract,
    expectedSignals: ["standardPayload", "googleCalendar"]
  });

  if (complianceCheck.compliant) {
    console.log("[SUCCESS] Contrato validado por worker-compliance.");
    // PASO 2: workflow-automation-worker - Diseño de flujo n8n
    const workflowSpec = await executeStep("workflow-automation-worker", "design_workflow", {
      platform: "n8n",
      workflowGoal: "Agendamiento de Citas Google Calendar",
      integrations: ["Webhook", "AIHUB Translator", "Google Calendar API"]
    });

    // PASO 3: translator-worker - Clasificador determinista local
    const classificationRules = await executeStep("translator-worker", "design_classifier", {
      prompt: "Clasifica el problema del cliente sin usar tokens externos.",
      targetLanguage: "es"
    });

    console.log("\n--- RESULTADOS FINALES DE IMPLEMENTACIÓN ---");
    console.log("Contrato Integración:", JSON.stringify(integrationContract, null, 2));
    console.log("Workflow Spec:", workflowSpec.workflowSpec);
    console.log("Translator Summary:", classificationRules.summary);
  } else {
    console.log("[ERROR] El contrato no cumple con los estándares. Solicitando corrección al investigador...");
    const research = await executeStep("web-researcher", "fix_contract", {
      sources: [{ url: "https://developers.google.com/calendar/api/v3/reference/events/insert" }],
      focusAreas: ["Google Calendar API insert event schema"]
    });
    console.log("[RESEARCH] Hallazgos:", research.findings[0]?.title);
  }
}

main();
