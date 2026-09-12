import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Dirent, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { AuthService } from '../auth/auth.service';
import { N8nGenerateWorkflowDto, N8nImportDirectoryDto, N8nWorkflowDto } from './dto/n8n.dto';

export interface NodeTypeInfo {
  type: string;
  label: string;
  color: string;
  inputs: number;
  outputs: number;
  category: string;
  description: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  user_id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  result: Record<string, unknown> | null;
  error: string | null;
  logs: Array<Record<string, unknown>>;
}

@Injectable()
export class N8nService {
  private readonly workspaceRoot = resolve(process.cwd(), '..', '..');
  private readonly workflowsPath = resolve(this.workspaceRoot, '.runtime/data/n8n_workflows.json');
  private readonly executionsPath = resolve(this.workspaceRoot, '.runtime/data/n8n_executions.json');
  private readonly executionLogs = new Map<string, Array<Record<string, unknown>>>();

  private readonly nodeTypeCatalog: Record<string, NodeTypeInfo> = {
    'orca-nodes-base.trigger': {
      type: 'orca-nodes-base.trigger',
      label: 'Trigger',
      color: '#ff6d5a',
      inputs: 0,
      outputs: 1,
      category: 'core',
      description: 'Workflow trigger/start point',
    },
    'orca-nodes-base.aiPrompt': {
      type: 'orca-nodes-base.aiPrompt',
      label: 'AI Prompt',
      color: '#7c4dff',
      inputs: 1,
      outputs: 1,
      category: 'ai',
      description: 'Send prompt to AI model',
    },
    'orca-nodes-base.httpRequest': {
      type: 'orca-nodes-base.httpRequest',
      label: 'HTTP Request',
      color: '#1a9ba1',
      inputs: 1,
      outputs: 1,
      category: 'integration',
      description: 'Make HTTP API request',
    },
    'orca-nodes-base.condition': {
      type: 'orca-nodes-base.condition',
      label: 'Condition',
      color: '#ff9f43',
      inputs: 1,
      outputs: 2,
      category: 'logic',
      description: 'Conditional branching',
    },
  };

  constructor(private readonly authService: AuthService) {}

  getNodeTypes(sessionId?: string) {
    this.requireAuth(sessionId);
    return { types: Object.values(this.nodeTypeCatalog), count: Object.keys(this.nodeTypeCatalog).length };
  }

  listWorkflows(sessionId?: string) {
    this.requireAuth(sessionId);
    const workflows = Object.values(this.readWorkflows());
    return { workflows, count: workflows.length };
  }

  createWorkflow(payload: N8nWorkflowDto, sessionId?: string) {
    const userId = this.requireAuth(sessionId);
    const workflows = this.readWorkflows();
    const id = randomUUID();
    const now = new Date().toISOString();
    const workflow = {
      id,
      name: payload.name,
      active: payload.active ?? false,
      nodes: payload.nodes ?? [],
      connections: payload.connections ?? {},
      settings: payload.settings ?? { executionOrder: 'v1' },
      createdAt: now,
      updatedAt: now,
      orca_meta: { ...(payload.orca_meta ?? {}), user_id: userId },
    };
    workflows[id] = workflow;
    this.writeWorkflows(workflows);
    return { workflow, message: 'Workflow created' };
  }

  getWorkflow(workflowId: string, sessionId?: string) {
    this.requireAuth(sessionId);
    const workflow = this.readWorkflows()[workflowId];
    if (!workflow) throw new NotFoundException('Workflow not found');
    return { workflow };
  }

  updateWorkflow(workflowId: string, payload: N8nWorkflowDto, sessionId?: string) {
    const userId = this.requireAuth(sessionId);
    const workflows = this.readWorkflows();
    if (!workflows[workflowId]) throw new NotFoundException('Workflow not found');
    const current = workflows[workflowId];
    const updated = {
      ...current,
      ...payload,
      id: workflowId,
      updatedAt: new Date().toISOString(),
      orca_meta: { ...(payload.orca_meta ?? current.orca_meta ?? {}), user_id: userId },
    };
    workflows[workflowId] = updated;
    this.writeWorkflows(workflows);
    return { workflow: updated, message: 'Workflow updated' };
  }

  deleteWorkflow(workflowId: string, sessionId?: string) {
    this.requireAuth(sessionId);
    const workflows = this.readWorkflows();
    if (!workflows[workflowId]) throw new NotFoundException('Workflow not found');
    delete workflows[workflowId];
    this.writeWorkflows(workflows);
    return { message: `Workflow ${workflowId} deleted` };
  }

  runWorkflow(workflowId: string, sessionId?: string) {
    const userId = this.requireAuth(sessionId);
    const workflows = this.readWorkflows();
    if (!workflows[workflowId]) throw new NotFoundException('Workflow not found');
    const executions = this.readExecutions();
    const execution: WorkflowExecution = {
      id: randomUUID(),
      workflow_id: workflowId,
      user_id: userId,
      status: 'pending',
      startedAt: new Date().toISOString(),
      completedAt: null,
      result: null,
      error: null,
      logs: [],
    };
    executions[execution.id] = execution;
    this.writeExecutions(executions);
    this.executionLogs.set(execution.id, [
      {
        execution_id: execution.id,
        workflow_id: workflowId,
        status: 'running',
        timestamp: new Date().toISOString(),
        message: 'Workflow execution started',
      },
    ]);
    setTimeout(() => {
      const logs = this.executionLogs.get(execution.id) ?? [];
      logs.push({
        execution_id: execution.id,
        workflow_id: workflowId,
        status: 'completed',
        timestamp: new Date().toISOString(),
        message: 'Workflow execution completed',
      });
      this.executionLogs.set(execution.id, logs);
    }, 150);
    return { execution_id: execution.id, status: 'pending', message: 'Workflow execution started' };
  }

  exportWorkflow(workflowId: string, sessionId?: string) {
    this.requireAuth(sessionId);
    const workflow = this.readWorkflows()[workflowId];
    if (!workflow) throw new NotFoundException('Workflow not found');
    const exportPath = resolve(this.workspaceRoot, `data/${workflowId}.json`);
    this.writeJsonFile(exportPath, workflow);
    const fileName = `${String(workflow.name ?? workflowId)}.json`;
    return { exportPath, fileName };
  }

  importWorkflowFromJson(rawJson: string, sessionId?: string) {
    const userId = this.requireAuth(sessionId);
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawJson) as Record<string, unknown>;
    } catch (error) {
      throw new BadRequestException(`Invalid JSON or schema: ${String(error)}`);
    }
    if (!Array.isArray(data.nodes) || typeof data.connections !== 'object' || data.connections === null) {
      throw new BadRequestException('Invalid JSON or schema: payload is not an n8n workflow export');
    }

    const workflows = this.readWorkflows();
    const workflowId = typeof data.id === 'string' && data.id.length > 0 ? data.id : randomUUID();
    const now = new Date().toISOString();
    const workflow = {
      id: workflowId,
      name: String(data.name ?? `Imported workflow ${workflowId}`),
      active: Boolean(data.active ?? false),
      nodes: data.nodes,
      connections: data.connections,
      settings: (data.settings as Record<string, unknown>) ?? { executionOrder: 'v1' },
      createdAt: String(data.createdAt ?? now),
      updatedAt: String(data.updatedAt ?? now),
      orca_meta: {
        ...((data.orca_meta as Record<string, unknown>) ?? {}),
        user_id: userId,
        source: 'n8n-json',
      },
    };
    workflows[workflowId] = workflow;
    this.writeWorkflows(workflows);
    return {
      id: workflowId,
      name: workflow.name,
      node_count: Array.isArray(workflow.nodes) ? workflow.nodes.length : 0,
      message: 'Workflow imported successfully',
    };
  }

  importWorkflowDirectory(request: N8nImportDirectoryDto, sessionId?: string) {
    this.requireAuth(sessionId);
    const sourcePath = resolve(request.source_path);
    if (!existsSync(sourcePath)) {
      throw new NotFoundException(`Directory not found: ${sourcePath}`);
    }
    const allJsonFiles = this.collectJsonFiles(sourcePath);
    const selected = request.limit ? allJsonFiles.slice(0, request.limit) : allJsonFiles;
    const workflows = this.readWorkflows();
    const imported: Array<Record<string, unknown>> = [];
    const failed: Array<Record<string, unknown>> = [];

    for (const file of selected) {
      try {
        const content = readFileSync(file, 'utf8');
        const parsed = JSON.parse(content) as Record<string, unknown>;
        if (!Array.isArray(parsed.nodes) || typeof parsed.connections !== 'object' || parsed.connections === null) {
          continue;
        }
        const workflowId = typeof parsed.id === 'string' && parsed.id.length > 0 ? parsed.id : randomUUID();
        const now = new Date().toISOString();
        const workflow = {
          id: workflowId,
          name: String(parsed.name ?? file.split(/[\\/]/).pop() ?? workflowId),
          active: Boolean(parsed.active ?? false),
          nodes: parsed.nodes,
          connections: parsed.connections,
          settings: (parsed.settings as Record<string, unknown>) ?? { executionOrder: 'v1' },
          createdAt: String(parsed.createdAt ?? now),
          updatedAt: String(parsed.updatedAt ?? now),
          orca_meta: {
            ...((parsed.orca_meta as Record<string, unknown>) ?? {}),
            imported_from: file,
            source: 'n8n-workflows-repository',
          },
        };
        if (!request.dry_run) {
          workflows[workflowId] = workflow;
        }
        imported.push({
          id: workflowId,
          name: workflow.name,
          node_count: Array.isArray(workflow.nodes) ? workflow.nodes.length : 0,
          path: file,
        });
      } catch (error) {
        failed.push({ path: file, reason: String(error) });
      }
    }

    if (!request.dry_run) {
      this.writeWorkflows(workflows);
    }

    return {
      source_path: sourcePath,
      discovered: allJsonFiles.length,
      selected: selected.length,
      imported: imported.length,
      skipped: allJsonFiles.length - selected.length,
      failed: failed.length,
      dry_run: Boolean(request.dry_run),
      items: imported,
      failures: failed.slice(0, 50),
      skipped_samples: [],
    };
  }

  listWorkflowExecutions(workflowId: string, sessionId?: string) {
    this.requireAuth(sessionId);
    const workflow = this.readWorkflows()[workflowId];
    if (!workflow) throw new NotFoundException('Workflow not found');
    return { workflow_id: workflowId, executions: [] };
  }

  getExecutionStatus(executionId: string, sessionId?: string) {
    this.requireAuth(sessionId);
    const logs = this.executionLogs.get(executionId);
    if (!logs) throw new NotFoundException('Execution not found');
    const status = logs.length > 0 ? String(logs[logs.length - 1].status ?? 'pending') : 'pending';
    return {
      execution_id: executionId,
      status,
      logs,
      log_count: logs.length,
    };
  }

  generateWorkflow(request: N8nGenerateWorkflowDto, sessionId?: string) {
    this.requireAuth(sessionId);
    const workflowId = randomUUID();
    const prompt = request.prompt.trim();
    const tasks = prompt
      .split(/[.;\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);
    const taskList = tasks.length > 0 ? tasks : [prompt];
    const now = new Date().toISOString();

    const nodes: Array<Record<string, unknown>> = [
      {
        id: randomUUID(),
        name: 'Trigger',
        type: 'orca-nodes-base.trigger',
        typeVersion: 1,
        position: [100, 300],
        parameters: {},
      },
    ];

    const names = ['Trigger'];
    for (let i = 0; i < taskList.length; i += 1) {
      const task = taskList[i];
      const type = this.inferNodeType(task);
      const name = task.length > 50 ? `${task.slice(0, 47)}...` : task;
      names.push(name);
      nodes.push({
        id: randomUUID(),
        name,
        type,
        typeVersion: 1,
        position: [350 + i * 250, 300],
        parameters: type.includes('aiPrompt') ? { prompt: task } : {},
        notes: task,
      });
    }

    nodes.push({
      id: randomUUID(),
      name: 'End',
      type: 'orca-nodes-base.end',
      typeVersion: 1,
      position: [350 + taskList.length * 250, 300],
      parameters: {},
    });
    names.push('End');

    const connections: Record<string, unknown> = {};
    for (let i = 0; i < names.length - 1; i += 1) {
      connections[names[i]] = { main: [[{ node: names[i + 1], type: 'main', index: 0 }]] };
    }

    const workflow = {
      id: workflowId,
      name: prompt.slice(0, 50),
      active: false,
      nodes,
      connections,
      settings: { executionOrder: 'v1' },
      createdAt: now,
      updatedAt: now,
      orca_meta: {
        source_prompt: request.prompt,
        model_id: request.model_id ?? 'gpt-4',
        generated_at: now,
        task_count: taskList.length,
      },
    };

    const workflows = this.readWorkflows();
    workflows[workflowId] = workflow;
    this.writeWorkflows(workflows);
    return {
      workflow_id: workflowId,
      name: workflow.name,
      node_count: nodes.length,
      workflow,
    };
  }

  private requireAuth(sessionId?: string) {
    const userId = this.authService.getSessionUserId(sessionId);
    if (!userId) throw new UnauthorizedException('Not authenticated');
    return userId;
  }

  private readWorkflows(): Record<string, Record<string, unknown>> {
    return this.readJsonFile(this.workflowsPath);
  }

  private writeWorkflows(workflows: Record<string, Record<string, unknown>>) {
    this.writeJsonFile(this.workflowsPath, workflows);
  }

  private readExecutions(): Record<string, WorkflowExecution> {
    return this.readJsonFile(this.executionsPath);
  }

  private writeExecutions(executions: Record<string, WorkflowExecution>) {
    this.writeJsonFile(this.executionsPath, executions);
  }

  private readJsonFile<T extends Record<string, unknown>>(path: string): T {
    if (!existsSync(path)) return {} as T;
    try {
      const data = readFileSync(path, 'utf8');
      return JSON.parse(data) as T;
    } catch {
      return {} as T;
    }
  }

  private writeJsonFile(path: string, data: Record<string, unknown>) {
    if (!existsSync(dirname(path))) mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  }

  private collectJsonFiles(sourcePath: string) {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true }) as Dirent[]) {
        const fullPath = resolve(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
          files.push(fullPath);
        }
      }
    };
    walk(sourcePath);
    return files.sort();
  }

  private inferNodeType(taskText: string) {
    const text = taskText.toLowerCase();
    if (/(api|http|request|call|fetch)/.test(text)) return 'orca-nodes-base.httpRequest';
    if (/(validate|check|verify|if|condition|when)/.test(text)) return 'orca-nodes-base.condition';
    if (/(loop|iterate|repeat|for each)/.test(text)) return 'orca-nodes-base.loop';
    if (/(variable|store|save|set)/.test(text)) return 'orca-nodes-base.setVariable';
    if (/(run|execute|command|script|bash|shell)/.test(text)) return 'orca-nodes-base.executeCommand';
    return 'orca-nodes-base.aiPrompt';
  }
}
