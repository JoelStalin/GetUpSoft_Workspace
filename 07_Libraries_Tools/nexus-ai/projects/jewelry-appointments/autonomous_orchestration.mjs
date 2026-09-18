import { HANDLERS } from "../../src/workers/agentWorker.ts";
import fse from "fs-extra";

/**
 * ORQUESTACIÓN AUTÓNOMA DE AIHUB
 * Flujo: Cliente -> translator-worker -> recruiter-worker (PM) -> Workers Especializados
 */

async function main() {
  const rawClientPrompt = "Hola, necesito agendar una reparación para mi reloj de oro que tiene una pieza suelta, y también quiero consultar el precio de un diseño personalizado para un anillo de compromiso para el 15 de mayo a las 10am. Mi correo es juan@example.com.";

  console.log("--- INICIANDO FLUJO AUTÓNOMO AIHUB ---");
  console.log(`[CLIENTE]: ${rawClientPrompt}\n`);

  // 1. TRADUCTOR: Detecta idioma, segmenta tareas y prepara el payload para el Reclutador.
  console.log("[EXECUTING] Step 1: translator-worker (NLP & Segmentation)");
  const translatorResult = await HANDLERS["translator-worker"]({
    jobId: "job-trans-001",
    agentType: "translator-worker",
    jobType: "translate_and_segment",
    payload: {
      prompt: rawClientPrompt,
      workerTasks: [
        { worker: "integration-engineer", goal: "Diseñar contrato de Google Calendar" },
        { worker: "workflow-automation-worker", goal: "Crear flujo n8n" },
        { worker: "data-miner", goal: "Analizar disponibilidad local" }
      ],
      targetLanguage: "es"
    },
    workerId: "w-translator",
    executionMode: "local"
  });

  console.log(`[RESULT] Traductor segmentó ${translatorResult.workerTaskPrompts.length} tareas.\n`);

  // 2. RECLUTADOR (Project Manager): Recibe la segmentación y planifica la ejecución.
  console.log("[EXECUTING] Step 2: agent-recruiter (Project Manager Mode)");
  const recruiterResult = await HANDLERS["agent-recruiter"]({
    jobId: "job-rec-001",
    agentType: "agent-recruiter",
    jobType: "recruit_and_plan",
    payload: translatorResult.recruiterPayload, // El traductor entrega directamente al reclutador
    workerId: "w-recruiter",
    executionMode: "local" // Aquí el reclutador usa su lógica interna de PM
  });

  console.log("[PLAN DEL RECLUTADOR]:");
  recruiterResult.assignments.forEach((asg, i) => {
    console.log(`  ${i+1}. Worker: ${asg.agentType} | Modelo: ${asg.model} | Tarea: ${asg.taskPrompt.slice(0, 50)}...`);
  });
  console.log("\n");

  // 3. EJECUCIÓN DISTRIBUIDA: Los workers especializados realizan el trabajo real.
  console.log("--- EJECUCIÓN DE TAREAS PLANIFICADAS ---");
  
  for (const assignment of recruiterResult.assignments) {
    console.log(`[EXECUTING] Worker: ${assignment.agentType} (Asignado por Reclutador)`);
    
    const workerResult = await HANDLERS[assignment.agentType]({
      jobId: `job-spec-${Date.now()}`,
      agentType: assignment.agentType,
      jobType: "execute_task",
      payload: { 
        prompt: assignment.taskPrompt,
        context: translatorResult.promptUnderstanding 
      },
      workerId: `w-${assignment.agentType}`,
      executionMode: "local"
    });

    console.log(`[RESULT] ${workerResult.summary}\n`);
    
    // Persistencia de artefactos por el worker correspondiente
    if (assignment.agentType === "integration-engineer") {
      fse.writeJsonSync("projects/jewelry-appointments/contracts/integration_v3.json", workerResult, { spaces: 2 });
    }
  }

  console.log("--- FLUJO COMPLETADO CON ÉXITO ---");
}

main().catch(console.error);
