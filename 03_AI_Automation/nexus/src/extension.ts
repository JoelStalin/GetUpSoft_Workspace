import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { openDatabase } from "./storage/Database.ts";
import { AgentContinuityHubService } from "./services/AgentContinuityHubService.ts";
import { ContextPacketBuilderService } from "./services/ContextPacketBuilderService.ts";
import { MetricsInstrumentationService } from "./services/MetricsInstrumentationService.ts";
import { PromptCoverageService } from "./services/PromptCoverageService.ts";
import { TaskExtractionService } from "./services/TaskExtractionService.ts";
import { ChangeAuditService } from "./services/ChangeAuditService.ts";
import { WorkspaceResolverService } from "./services/WorkspaceResolverService.ts";
import { ConversationCaptureService } from "./services/ConversationCaptureService.ts";
import { ProjectMemoryProvider } from "./ui/sidebar/ProjectMemoryProvider.ts";
import { PendingTasksProvider } from "./ui/sidebar/PendingTasksProvider.ts";
import { ChangeLogProvider } from "./ui/sidebar/ChangeLogProvider.ts";
import { PromptProgressProvider } from "./ui/sidebar/PromptProgressProvider.ts";
import { AgentsProvider } from "./ui/sidebar/AgentsProvider.ts";
import { ConversationsProvider } from "./ui/sidebar/ConversationsProvider.ts";
import { SkillsProvider } from "./ui/sidebar/SkillsProvider.ts";
import { JobQueueProvider } from "./ui/sidebar/JobQueueProvider.ts";
import { JobQueueService } from "./services/JobQueueService.ts";
import { WorkerPoolService } from "./services/WorkerPoolService.ts";
import { AgentRosterService } from "./services/AgentRosterService.ts";
import { DailyResearchSchedulerService } from "./services/DailyResearchSchedulerService.ts";
import { ModelRoutingService } from "./services/ModelRoutingService.ts";
import { defaultRegistry } from "./adapters/adapterRegistry.ts";
import { DEFAULT_BUDGET } from "./hub.ts";
import type { Database } from "./storage/Database.ts";

type Providers = {
  memory: ProjectMemoryProvider;
  tasks: PendingTasksProvider;
  changelog: ChangeLogProvider;
  progress: PromptProgressProvider;
  agents: AgentsProvider;
  conversations: ConversationsProvider;
  skills: SkillsProvider;
  jobQueue: JobQueueProvider;
};

function resolveDbPath(context: vscode.ExtensionContext): string {
  const config = vscode.workspace.getConfiguration("aihub");
  const custom = config.get<string>("dbPath");
  if (custom && custom.trim()) return custom.trim();
  const storageDir = context.globalStorageUri.fsPath;
  fs.mkdirSync(storageDir, { recursive: true });
  return path.join(storageDir, "continuity.sqlite");
}

function resolveWorkspacePath(): string {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}

function registerProviders(db: Database, workspaceId: string): Providers {
  return {
    memory: new ProjectMemoryProvider(db, workspaceId),
    tasks: new PendingTasksProvider(db, workspaceId),
    changelog: new ChangeLogProvider(db, workspaceId),
    progress: new PromptProgressProvider(db, workspaceId),
    agents: new AgentsProvider(db, workspaceId),
    conversations: new ConversationsProvider(db, workspaceId),
    skills: new SkillsProvider(db, workspaceId),
    jobQueue: new JobQueueProvider(db, workspaceId),
  };
}

function refreshAll(providers: Providers): void {
  providers.memory.refresh();
  providers.tasks.refresh();
  providers.changelog.refresh();
  providers.progress.refresh();
  providers.agents.refresh();
  providers.conversations.refresh();
  providers.skills.refresh();
  providers.jobQueue.refresh();
}

export function activate(context: vscode.ExtensionContext): void {
  const dbPath = resolveDbPath(context);
  const db = openDatabase(dbPath);

  const wsPath = resolveWorkspacePath();
  const wsName = path.basename(wsPath);
  const wsResolver = new WorkspaceResolverService(db);
  const workspace = wsResolver.resolve(wsPath, wsName);

  const hub = new AgentContinuityHubService(db);
  const contextSvc = new ContextPacketBuilderService(db, DEFAULT_BUDGET);
  const metricsSvc = new MetricsInstrumentationService(db);
  const coverageSvc = new PromptCoverageService(db);
  const taskExtractor = new TaskExtractionService(db);
  const auditSvc = new ChangeAuditService(db);
  const captureSvc = new ConversationCaptureService(db);
  const jobQueueSvc = new JobQueueService(db);
  const rosterSvc = new AgentRosterService(db);
  const workerPool = new WorkerPoolService(db);
  const dailyResearchSvc = new DailyResearchSchedulerService(db);
  const routingSvc = new ModelRoutingService(db);
  _workerPool = workerPool;

  const providers = registerProviders(db, workspace.id);

  const ensurePool = (agentName: string): void => {
    const agent = rosterSvc.findByAgentType(workspace.id, agentName);
    if (!agent) return;
    const config = JSON.parse(agent.configJson) as { maxConcurrent?: number };
    if (!workerPool.activeAgentTypes().includes(agentName)) {
      workerPool.startPool(agentName, config.maxConcurrent ?? 1);
    }
  };

  const seedDailyResearch = (): void => {
    const roster = rosterSvc.rosterWithConfig(workspace.id);
    dailyResearchSvc.ensureDailySchedules(
      workspace.id,
      roster.map(({ agent, config }) => ({
        agentType: agent.name,
        role: config.role,
        capabilities: config.capabilities,
        config,
      })),
    );
  };

  const enqueueDueResearch = (): void => {
    const dueJobs = dailyResearchSvc.enqueueDueSchedules();
    if (dueJobs.length > 0) {
      ensurePool("worker-auditor");
      ensurePool("context-storage-worker");
      ensurePool("web-researcher");
      ensurePool("agent-recruiter");
      providers.jobQueue.refresh();
      providers.agents.refresh();
    }
  };

  vscode.window.registerTreeDataProvider("aihub.projectMemory", providers.memory);
  vscode.window.registerTreeDataProvider("aihub.pendingTasks", providers.tasks);
  vscode.window.registerTreeDataProvider("aihub.changelog", providers.changelog);
  vscode.window.registerTreeDataProvider("aihub.promptProgress", providers.progress);
  vscode.window.registerTreeDataProvider("aihub.agents", providers.agents);
  vscode.window.registerTreeDataProvider("aihub.conversations", providers.conversations);
  vscode.window.registerTreeDataProvider("aihub.skills", providers.skills);
  vscode.window.registerTreeDataProvider("aihub.jobQueue", providers.jobQueue);

  const cmds: vscode.Disposable[] = [
    vscode.commands.registerCommand("aihub.openProjectMemory", () => {
      vscode.commands.executeCommand("workbench.view.extension.aihub-sidebar");
    }),

    vscode.commands.registerCommand("aihub.refresh", () => {
      refreshAll(providers);
      vscode.window.setStatusBarMessage("$(sync) AIHUB refreshed", 2000);
    }),

    vscode.commands.registerCommand("aihub.showPendingTasks", () => {
      vscode.commands.executeCommand("aihub.pendingTasks.focus");
    }),

    vscode.commands.registerCommand("aihub.showChangeLog", () => {
      vscode.commands.executeCommand("aihub.changelog.focus");
    }),

    vscode.commands.registerCommand("aihub.showPromptProgress", () => {
      vscode.commands.executeCommand("aihub.promptProgress.focus");
    }),

    vscode.commands.registerCommand("aihub.importConversation", async () => {
      const adapterKey = await vscode.window.showQuickPick(
        defaultRegistry.list().map((a) => ({ label: a.displayName, description: a.key })),
        { title: "Select source agent" },
      );
      if (!adapterKey) return;

      const content = await vscode.window.showInputBox({
        title: "Paste conversation content",
        prompt: "Paste the full conversation text to import",
        ignoreFocusOut: true,
      });
      if (!content) return;

      const adapter = defaultRegistry.createManualImport({
        sourceAgent: "manual_import",
        title: `Import from ${adapterKey.label}`,
        messages: [{ role: "user", content }],
      });

      await captureSvc.captureFromAdapter(workspace.id, adapter);
      refreshAll(providers);
      vscode.window.showInformationMessage("Conversation imported successfully.");
    }),

    vscode.commands.registerCommand("aihub.extractTasks", async () => {
      const editor = vscode.window.activeTextEditor;
      const text = editor?.document.getText() ?? "";
      if (!text.trim()) {
        vscode.window.showWarningMessage("Open a file or editor with conversation text first.");
        return;
      }

      const epic = await vscode.window.showInputBox({
        title: "Epic name",
        prompt: "Which epic do these tasks belong to?",
        value: "general",
      });
      if (!epic) return;

      const tasks = taskExtractor.extractFromText(workspace.id, epic, text);
      refreshAll(providers);
      vscode.window.showInformationMessage(`Extracted ${tasks.length} tasks.`);
    }),

    vscode.commands.registerCommand("aihub.startContextualChat", async () => {
      const snapshot = hub.buildContinuitySnapshot(workspace.id, {});

      const taskLines = snapshot.pendingTasks.map(
        (t) => `- [${t.status}] ${t.title}`,
      );
      const skillLines = snapshot.skills.map(
        (s) => `- ${s.name}: ${s.skillBody ?? ""}`.slice(0, 120),
      );
      const changeLines = auditSvc.summarize(workspace.id, 5);

      const blocks: string[] = [
        `# Agent Continuity Hub — Context Packet`,
        `Workspace: ${wsName}`,
        `Path: ${wsPath}`,
        ``,
        `## Pending Tasks (${snapshot.pendingTasks.length})`,
        ...taskLines,
        ``,
        `## Skills Active (${snapshot.skills.length})`,
        ...skillLines,
        ``,
        `## Recent Changes`,
        ...changeLines.map((c) => `- ${c}`),
        ``,
        `## Coverage: ${snapshot.coverage.overallPercent.toFixed(1)}%`,
        `Token savings: ${(snapshot.dashboard.tokenSavingsRatio * 100).toFixed(1)}%`,
        `Budget used: ${snapshot.packet.budgetUsed} chars`,
      ];

      const contextText = blocks.join("\n");
      await vscode.env.clipboard.writeText(contextText);

      metricsSvc.record(workspace.id, {
        rawContextTokens: snapshot.packet.budgetUsed * 4,
        compactedTokens: Math.round(snapshot.packet.budgetUsed * 0.4),
      });

      vscode.window.showInformationMessage(
        `Context packet copied (${snapshot.packet.budgetUsed} chars). Paste into your AI chat.`,
      );
    }),

    vscode.commands.registerCommand("aihub.rebuildMemoryIndex", async () => {
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: "Rebuilding memory index..." },
        async () => {
          wsResolver.resolve(wsPath, wsName);
          refreshAll(providers);
        },
      );
      vscode.window.showInformationMessage("Memory index rebuilt.");
    }),

    vscode.commands.registerCommand("aihub.showJobQueue", () => {
      vscode.commands.executeCommand("aihub.jobQueue.focus");
    }),

    vscode.commands.registerCommand("aihub.ensureRoster", () => {
      const agents = rosterSvc.ensureRoster(workspace.id);
      providers.agents.refresh();
      routingSvc.ensureDefaults(workspace.id);
      seedDailyResearch();

      // Start a worker pool thread for each roster agent type
      for (const agent of agents) {
        const cfg = JSON.parse(agent.configJson) as { maxConcurrent?: number };
        const concurrency = cfg.maxConcurrent ?? 1;
        if (!workerPool.activeAgentTypes().includes(agent.name)) {
          workerPool.startPool(agent.name, concurrency);
        }
      }

      providers.jobQueue.refresh();
      vscode.window.showInformationMessage(
        `Seeded ${agents.length} agents and started worker pool.`,
      );
    }),

    vscode.commands.registerCommand("aihub.enqueueJob", async () => {
      const agentTypes = rosterSvc
        .rosterWithConfig(workspace.id)
        .map(({ agent, config }) => ({
          label: agent.name,
          description: config.role,
        }));

      const pick = await vscode.window.showQuickPick(agentTypes, {
        title: "Select agent type",
      });
      if (!pick) return;

      const jobType = await vscode.window.showInputBox({
        title: "Job type",
        prompt: "e.g. code_review, deploy, incident_response",
        value: "analysis",
      });
      if (!jobType) return;

      const payloadRaw = await vscode.window.showInputBox({
        title: "Payload (JSON)",
        prompt: "Job payload as JSON object",
        value: "{}",
        ignoreFocusOut: true,
      });
      if (payloadRaw === undefined) return;

      let payload: object;
      try {
        payload = JSON.parse(payloadRaw);
      } catch {
        vscode.window.showErrorMessage("Invalid JSON payload.");
        return;
      }

      const job = jobQueueSvc.enqueue({
        workspaceId: workspace.id,
        agentType: pick.label,
        jobType,
        payload,
        priority: 5,
      });
      ensurePool(pick.label);

      providers.jobQueue.refresh();
      providers.agents.refresh();
      vscode.window.showInformationMessage(
        `Job ${job.id.slice(0, 8)} enqueued for ${pick.label}.`,
      );
    }),

    vscode.commands.registerCommand("aihub.runDailyResearch", () => {
      seedDailyResearch();
      enqueueDueResearch();
      vscode.window.showInformationMessage("Daily worker governance and model research jobs queued.");
    }),

    vscode.commands.registerCommand("aihub.preChangePrecedentLookup", async () => {
      const intent = await vscode.window.showInputBox({
        title: "Describe the change you are about to make",
        prompt: "What are you implementing? (e.g. 'add JWT authentication')",
        ignoreFocusOut: true,
      });
      if (!intent) return;

      const result = hub.buildContinuitySnapshot(workspace.id, {
        intent: { intent, stack: "unknown", filesAffected: [] },
      });

      const precedent = result.packet as unknown as Record<string, unknown>;
      if (!result) {
        vscode.window.showInformationMessage("No similar precedent found for this change.");
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        "aihub.precedentView",
        "Precedent Found",
        vscode.ViewColumn.Beside,
        {},
      );

      panel.webview.html = buildPrecedentHtml(intent, precedent as Record<string, unknown>);

      auditSvc.record({
        workspaceId: workspace.id,
        changeType: "refactor",
        title: `Pre-change lookup: ${intent}`,
        reason: "Precedent lookup before implementing change",
        agentId: "user",
        filesAffected: [],
      });
    }),
  ];

  context.subscriptions.push(...cmds);

  vscode.workspace.onDidChangeWorkspaceFolders(() => {
    const newPath = resolveWorkspacePath();
    const newName = path.basename(newPath);
    const newWs = wsResolver.resolve(newPath, newName);
    refreshAll(providers);
    (Object.values(providers) as Array<{ refresh(id: string): void }>).forEach((p) =>
      p.refresh(newWs.id),
    );
  });

  coverageSvc.ensureDefaultCoverage(workspace.id);
  rosterSvc.ensureRoster(workspace.id);
  routingSvc.ensureDefaults(workspace.id);
  seedDailyResearch();
  enqueueDueResearch();
  ensurePool("memory-agent");
  ensurePool("worker-auditor");
  ensurePool("worker-police");
  ensurePool("worker-judge");
  ensurePool("worker-compliance");
  ensurePool("context-storage-worker");
  ensurePool("web-researcher");
  ensurePool("agent-recruiter");

  const researchTimer = setInterval(() => {
    enqueueDueResearch();
  }, 60 * 60 * 1000);

  // Subscribe worker pool shutdown to extension lifecycle
  context.subscriptions.push({ dispose: () => workerPool.stop() });
  context.subscriptions.push({ dispose: () => clearInterval(researchTimer) });
}

let _workerPool: WorkerPoolService | undefined;

export function deactivate(): void {
  _workerPool?.stop();
}

function buildPrecedentHtml(intent: string, precedent: Record<string, unknown>): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Precedent</title>
  <style>
    :root {
      --bg: #000;
      --border: #222;
      --text: #fff;
      --muted: #666;
      --accent: #ff0038;
    }
    body { 
      font-family: -apple-system, "BlinkMacSystemFont", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
      padding: 40px; 
      background: var(--bg); 
      color: var(--text);
      letter-spacing: -0.02em;
    }
    h2 { font-size: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.05em; margin: 0 0 40px 0; }
    pre { 
      background: rgba(255,255,255,0.03); 
      padding: 32px; 
      border-radius: 24px; 
      border: 1px solid var(--border);
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      color: #ccc;
    }
    .label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
    .card {
      border: 1px solid var(--border);
      border-radius: 32px;
      padding: 32px;
      background: rgba(18, 18, 18, 0.8);
      backdrop-filter: blur(40px);
    }
    .orca { position: fixed; bottom: 20px; right: 20px; font-family: monospace; opacity: 0.3; font-size: 8px; color: var(--muted); line-height: 1; }
  </style>
</head>
<body>
  <div class="card">
    <div class="label">Intent Captured</div>
    <h2>${escapeHtml(intent)}</h2>
    
    <div class="label">Historical Evidence</div>
    <pre>${escapeHtml(JSON.stringify(precedent, null, 2))}</pre>
  </div>

  <div class="orca">
<pre>
      .
     _"\
   _/@  \
  /      \
 |        |
  \      /
   \____/
     ||
</pre>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
