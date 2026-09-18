import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  AutomationFlowRequestDto,
  BlueprintRunRequestDto,
  CredentialWriteRequestDto,
  InteractionScriptRequestDto,
  PipelineRunRequestDto,
  TestFlowRequestDto,
  WorkflowBlueprintRequestDto,
} from './dto/orchestrator.dto';

export interface WorkflowJobRecord {
  id: string;
  workflow_type: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  model_id: string;
  input_payload: Record<string, unknown>;
  output_markdown: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

@Injectable()
export class OrchestratorService {
  private readonly workspaceRoot = resolve(process.cwd(), '..', '..');
  private readonly blueprintsPath = resolve(this.workspaceRoot, 'data/workflow_blueprints.json');
  private readonly credentialsPath = resolve(this.workspaceRoot, 'data/user_credentials.json');
  private readonly jobs = new Map<string, WorkflowJobRecord>();
  private readonly pipelineRuns = new Map<string, Record<string, unknown>>();
  private readonly defaultModel = 'gpt-4o';
  private readonly availableModels = [
    { id: 'gpt-4o', provider: 'openai', model: 'gpt-4o' },
    { id: 'claude-3-5-sonnet', provider: 'anthropic', model: 'claude-3-5-sonnet' },
    { id: 'gemini-2.0-flash', provider: 'google', model: 'gemini-2.0-flash' },
  ];

  rowboatStatus() {
    return {
      configured: false,
      workspace_id: null,
      agent_id: null,
      endpoint: null,
      mock_mode: true,
      message: 'Rowboat mock mode enabled in Nest migration.',
    };
  }

  listModels() {
    return {
      default_model: this.defaultModel,
      items: this.availableModels,
    };
  }

  stats() {
    const values = [...this.jobs.values()];
    return {
      total: values.length,
      pending: values.filter((job) => job.status === 'pending').length,
      running: values.filter((job) => job.status === 'running').length,
      completed: values.filter((job) => job.status === 'completed').length,
      failed: values.filter((job) => job.status === 'failed').length,
    };
  }

  listWorkflows(limit = 50) {
    const items = [...this.jobs.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
    return { items };
  }

  getWorkflow(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) throw new NotFoundException('Workflow not found.');
    return job;
  }

  submitTestFlow(request: TestFlowRequestDto) {
    return this.createAndRunJob('test-flow', request.project, request.model ?? this.defaultModel, { ...request });
  }

  submitAutomationFlow(request: AutomationFlowRequestDto) {
    return this.createAndRunJob('automation-flow', request.goal, request.model ?? this.defaultModel, { ...request });
  }

  submitInteractionScript(request: InteractionScriptRequestDto) {
    return this.createAndRunJob('interaction-script', request.objective, request.model ?? this.defaultModel, { ...request });
  }

  runHermes(prompt: string) {
    return {
      response: {
        mode: 'mock',
        summary: `Hermes run accepted for prompt: ${prompt.slice(0, 120)}`,
      },
    };
  }

  rowboatChat(message: string, conversationId?: string) {
    return {
      conversation_id: conversationId ?? randomUUID(),
      output_text: `Mock Rowboat response: ${message}`,
      raw: {
        provider: 'rowboat-mock',
        message,
      },
    };
  }

  credentialStatus(userId = 'default') {
    const supported = ['openai', 'gemini', 'claude', 'manus'];
    const envMap: Record<string, string> = {
      openai: 'OPENAI_API_KEY',
      gemini: 'GEMINI_API_KEY',
      claude: 'CLAUDE_API_KEY',
      manus: 'MANUS_API_KEY',
    };
    const data = this.readJson(this.credentialsPath, { global: {}, users: {} }) as {
      global: Record<string, string>;
      users: Record<string, Record<string, string>>;
    };
    const userValues = data.users[userId] ?? {};
    const providers = supported.map((provider) => {
      const user = userValues[provider];
      const global = data.global[provider];
      const env = process.env[envMap[provider]];
      const value = user ?? global ?? env;
      const source = user ? 'user_store' : global ? 'global_store' : env ? 'environment' : null;
      const scope = user ? 'user' : value ? 'global' : null;
      return {
        provider,
        configured: Boolean(value),
        scope,
        source,
        masked_value: value ? this.maskSecret(value) : null,
        env_name: envMap[provider],
      };
    });
    return { providers };
  }

  credentialsUpsertGlobal(request: CredentialWriteRequestDto) {
    const data = this.readJson(this.credentialsPath, { global: {}, users: {} }) as {
      global: Record<string, string>;
      users: Record<string, Record<string, string>>;
    };
    const updated = this.sanitizeCredentialValues(request.values ?? {});
    data.global = { ...data.global, ...updated };
    this.writeJson(this.credentialsPath, data);
    return { updated: Object.keys(updated).sort() };
  }

  credentialsUpsertUser(request: CredentialWriteRequestDto) {
    const userId = request.user_id ?? 'default';
    const data = this.readJson(this.credentialsPath, { global: {}, users: {} }) as {
      global: Record<string, string>;
      users: Record<string, Record<string, string>>;
    };
    const updated = this.sanitizeCredentialValues(request.values ?? {});
    const userValues = data.users[userId] ?? {};
    data.users[userId] = { ...userValues, ...updated };
    this.writeJson(this.credentialsPath, data);
    return { updated: Object.keys(updated).sort() };
  }

  credentialsDeleteGlobal(provider: string) {
    const data = this.readJson(this.credentialsPath, { global: {}, users: {} }) as {
      global: Record<string, string>;
      users: Record<string, Record<string, string>>;
    };
    const existed = provider in data.global;
    delete data.global[provider];
    this.writeJson(this.credentialsPath, data);
    return existed;
  }

  credentialsDeleteUser(provider: string, userId = 'default') {
    const data = this.readJson(this.credentialsPath, { global: {}, users: {} }) as {
      global: Record<string, string>;
      users: Record<string, Record<string, string>>;
    };
    const userValues = data.users[userId] ?? {};
    const existed = provider in userValues;
    delete userValues[provider];
    data.users[userId] = userValues;
    this.writeJson(this.credentialsPath, data);
    return existed;
  }

  listBlueprints(userId = 'default') {
    const items = (this.readJson(this.blueprintsPath, []) as Array<Record<string, unknown>>)
      .filter((item) => String(item.user_id ?? '') === userId)
      .sort((a, b) => String(b.updated_at ?? '').localeCompare(String(a.updated_at ?? '')));
    return { items };
  }

  upsertBlueprint(request: WorkflowBlueprintRequestDto) {
    const userId = request.user_id ?? 'default';
    const data = this.readJson(this.blueprintsPath, []) as Array<Record<string, unknown>>;
    const now = new Date().toISOString();
    const idx = data.findIndex((item) => item.id === request.id && item.user_id === userId);
    if (idx >= 0) {
      const updated = {
        ...data[idx],
        name: request.name,
        objective: request.objective,
        status: request.status ?? 'draft',
        nodes: request.nodes ?? [],
        edges: request.edges ?? [],
        settings: request.settings ?? {},
        updated_at: now,
      };
      data[idx] = updated;
      this.writeJson(this.blueprintsPath, data);
      return updated;
    }
    const created = {
      id: request.id ?? randomUUID(),
      user_id: userId,
      name: request.name,
      objective: request.objective,
      status: request.status ?? 'draft',
      nodes: request.nodes ?? [],
      edges: request.edges ?? [],
      settings: request.settings ?? {},
      created_at: now,
      updated_at: now,
    };
    data.push(created);
    this.writeJson(this.blueprintsPath, data);
    return created;
  }

  deleteBlueprint(blueprintId: string, userId = 'default') {
    const data = this.readJson(this.blueprintsPath, []) as Array<Record<string, unknown>>;
    const filtered = data.filter((item) => !(item.id === blueprintId && item.user_id === userId));
    if (filtered.length === data.length) return false;
    this.writeJson(this.blueprintsPath, filtered);
    return true;
  }

  runBlueprint(blueprintId: string, request: BlueprintRunRequestDto) {
    const userId = request.user_id ?? 'default';
    const data = this.readJson(this.blueprintsPath, []) as Array<Record<string, unknown>>;
    const blueprint = data.find((item) => item.id === blueprintId && item.user_id === userId);
    if (!blueprint) throw new NotFoundException('Blueprint not found.');
    return this.createAndRunJob(
      'automation-flow',
      String(blueprint.name ?? 'Blueprint'),
      request.model ?? this.defaultModel,
      {
        goal: String(blueprint.objective ?? ''),
        systems: 'Orca',
        context: JSON.stringify(blueprint),
      },
    );
  }

  pipelineRun(request: PipelineRunRequestDto) {
    const id = randomUUID();
    const now = new Date().toISOString();
    const run = {
      id,
      task_type: request.task_type,
      title: request.title,
      objective: request.objective,
      status: 'running',
      current_stage: 'assign',
      revision_count: 0,
      stages: [],
      final_output: null,
      error_message: null,
      created_at: now,
      updated_at: now,
    };
    this.pipelineRuns.set(id, run);
    setTimeout(() => {
      const current = this.pipelineRuns.get(id);
      if (!current) return;
      this.pipelineRuns.set(id, {
        ...current,
        status: 'done',
        current_stage: 'done',
        final_output: `Pipeline completed for ${request.title}`,
        updated_at: new Date().toISOString(),
      });
    }, 250);
    return { run_id: id, status: 'running', message: 'Pipeline started' };
  }

  pipelineList(limit = 50) {
    return [...this.pipelineRuns.values()]
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, limit);
  }

  pipelineGet(runId: string) {
    const run = this.pipelineRuns.get(runId);
    if (!run) throw new NotFoundException('Pipeline run not found');
    return run;
  }

  pipelineStats() {
    const runs = [...this.pipelineRuns.values()];
    const stats = {
      pending: runs.filter((r) => r.status === 'pending').length,
      running: runs.filter((r) => r.status === 'running').length,
      done: runs.filter((r) => r.status === 'done').length,
      failed: runs.filter((r) => r.status === 'failed').length,
    };
    const models_by_role = {
      worker: ['gpt-4o [free]'],
      reviewer: ['claude-3-5-sonnet [paid]'],
      tester: ['gemini-2.0-flash [paid]'],
      qa: ['gpt-4o [paid]'],
    };
    return { stats: { ...stats, total: runs.length }, models_by_role };
  }

  private createAndRunJob(
    workflowType: string,
    title: string,
    modelId: string,
    payload: Record<string, unknown>,
  ): WorkflowJobRecord {
    const now = new Date().toISOString();
    const id = randomUUID();
    const job: WorkflowJobRecord = {
      id,
      workflow_type: workflowType,
      title,
      status: 'pending',
      model_id: modelId,
      input_payload: payload,
      output_markdown: null,
      error_message: null,
      created_at: now,
      updated_at: now,
      started_at: null,
      completed_at: null,
    };
    this.jobs.set(id, job);

    setTimeout(() => {
      const running = this.jobs.get(id);
      if (!running) return;
      const startedAt = new Date().toISOString();
      this.jobs.set(id, {
        ...running,
        status: 'running',
        started_at: startedAt,
        updated_at: startedAt,
      });
    }, 30);

    setTimeout(() => {
      const done = this.jobs.get(id);
      if (!done) return;
      const completedAt = new Date().toISOString();
      this.jobs.set(id, {
        ...done,
        status: 'completed',
        output_markdown: `# ${workflowType}\n\nGenerated output for ${title}`,
        completed_at: completedAt,
        updated_at: completedAt,
      });
    }, 120);

    return job;
  }

  private readJson(path: string, fallback: unknown) {
    if (!existsSync(path)) return fallback;
    try {
      const raw = readFileSync(path, 'utf8');
      return raw.trim() ? (JSON.parse(raw) as unknown) : fallback;
    } catch {
      return fallback;
    }
  }

  private writeJson(path: string, data: unknown) {
    const dir = dirname(path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  }

  private maskSecret(value: string) {
    if (value.length <= 8) return '*'.repeat(value.length);
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }

  private sanitizeCredentialValues(values: Record<string, string>) {
    const supported = new Set(['openai', 'gemini', 'claude', 'manus']);
    const sanitized: Record<string, string> = {};
    for (const [provider, value] of Object.entries(values)) {
      if (!supported.has(provider)) continue;
      const cleaned = value.trim();
      if (cleaned) sanitized[provider] = cleaned;
    }
    return sanitized;
  }
}
