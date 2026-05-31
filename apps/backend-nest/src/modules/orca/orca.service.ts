import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { promisify } from 'node:util';
import type { Response } from 'express';
import { InterpretRequestDto } from './dto/interpret-request.dto';
import { AuditLogRequestDto, AuditLogResponseDto } from './dto/audit-log-request.dto';
import { FiscalSyncRequestDto } from './dto/fiscal-sync-request.dto';

const execFileAsync = promisify(execFile);

type WorkflowNodeRecord = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
};

type WorkflowConnectionRecord = Record<string, Array<{ node_id: string; type?: string }>>;

type StoredWorkflowRecord = {
  id: string;
  name: string;
  active: boolean;
  nodes: WorkflowNodeRecord[];
  connections: WorkflowConnectionRecord;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  orca_meta?: Record<string, unknown>;
};

type StoredWorkflowStore = {
  workflows: StoredWorkflowRecord[];
};

type ExecutionSession = {
  executionId: string;
  workflowId: string;
  workflowName: string;
  nodeIds: string[];
  startedAt: string;
  inputData: Record<string, unknown>;
};

type UploadedWorkflowFile = {
  buffer: Buffer;
};

@Injectable()
export class OrcaService {
  private readonly logger = new Logger(OrcaService.name);
  private readonly executionSessions = new Map<string, ExecutionSession>();
  private readonly defaultNodeTypes: Record<
    string,
    { label: string; color: string; description: string; category?: string }
  > = {
    'orca-nodes-base.trigger': {
      label: 'Trigger',
      color: '#ff6d5a',
      description: 'Start a workflow execution',
      category: 'Triggers',
    },
    'orca-nodes-base.aiPrompt': {
      label: 'AI Prompt',
      color: '#7c4dff',
      description: 'Call an AI model with a prompt',
      category: 'AI',
    },
    'orca-nodes-base.httpRequest': {
      label: 'HTTP Request',
      color: '#1a9ba1',
      description: 'Make an HTTP request',
      category: 'Network',
    },
    'orca-nodes-base.condition': {
      label: 'Condition',
      color: '#ff9f43',
      description: 'Conditional branching',
      category: 'Control Flow',
    },
    'orca-nodes-base.loop': {
      label: 'Loop',
      color: '#10ac84',
      description: 'Iterate over a list',
      category: 'Control Flow',
    },
    'orca-nodes-base.setVariable': {
      label: 'Set Variable',
      color: '#576574',
      description: 'Store a value in a variable',
      category: 'Utils',
    },
    'orca-nodes-base.executeCommand': {
      label: 'Execute',
      color: '#ee5a24',
      description: 'Execute a command or script',
      category: 'Agent Core',
    },
    'orca-nodes-base.end': {
      label: 'End',
      color: '#353b48',
      description: 'End the workflow',
      category: 'Utils',
    },
  };

  constructor(private readonly config: ConfigService) {}

  health() {
    return {
      status: 'ok',
      canonical_language: this.config.get<string>('ORCA_CANONICAL_LANGUAGE') ?? 'es',
      low_confidence_threshold: Number(this.config.get<string>('ORCA_LOW_CONFIDENCE_THRESHOLD') ?? 0.55),
      completion_policy: 'autonomous_until_done_with_tests',
    };
  }

  async interpret(request: InterpretRequestDto): Promise<unknown> {
    const bridgeMode = (this.config.get<string>('ORCA_BRIDGE_MODE') ?? 'mock').toLowerCase();
    if (bridgeMode !== 'python') {
      return this.mockInterpretation(request);
    }
    const command = this.commandForSource(request.source_type);
    return this.runOrcaCli(command, request.content);
  }

  async n8nPayload(request: InterpretRequestDto): Promise<unknown> {
    const interpreted = await this.interpret(request);
    if (!this.isInterpretationOutput(interpreted)) {
      throw new InternalServerErrorException('ORCA interpreter returned an invalid payload');
    }
    return {
      source: interpreted.source_type,
      detected_intent: interpreted.detected_intent,
      selected_skill: interpreted.selected_skill,
      normalized_prompt: interpreted.normalized_prompt,
      tasks: interpreted.scrum.tasks,
      risks: interpreted.scrum.risks,
      dependencies: interpreted.scrum.dependencies,
      paid_model_prompt: interpreted.model_prompt.paid_model_prompt,
      free_model_followup_prompt: interpreted.model_prompt.free_model_followup_prompt,
      error_recovery_prompt: interpreted.model_prompt.error_recovery_prompt,
    };
  }

  private commandForSource(sourceType: InterpretRequestDto['source_type']) {
    if (sourceType === 'text') return 'interpret';
    if (sourceType === 'script') return 'interpret';
    if (sourceType === 'audio') return 'interpret-audio';
    return 'interpret';
  }

  private async runOrcaCli(command: string, content: string): Promise<unknown> {
    const workspaceRoot = this.config.get<string>('WORKSPACE_ROOT') ?? this.resolveWorkspaceRoot();
    const python = this.config.get<string>('PYTHON_BIN') ?? 'python';
    try {
      const { stdout, stderr } = await execFileAsync(python, ['-m', 'orca.cli', command, content], {
        cwd: workspaceRoot,
        env: {
          ...process.env,
          PYTHONPATH: workspaceRoot,
        },
        maxBuffer: 1024 * 1024 * 10,
      });
      if (stderr.trim().length > 0) {
        throw new Error(stderr.trim());
      }
      return JSON.parse(stdout);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown ORCA bridge error';
      throw new InternalServerErrorException(`ORCA core bridge failed: ${message}`);
    }
  }

  private resolveWorkspaceRoot() {
    return process.cwd().replace(/\\apps\\backend-nest$/, '').replace(/\/apps\/backend-nest$/, '');
  }

  getNodeTypes() {
    return this.defaultNodeTypes;
  }

  async listN8nWorkflows({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }) {
    const workflows = await this.readWorkflowStore();
    const ordered = [...workflows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return {
      data: ordered.slice(offset, offset + limit),
      total: ordered.length,
      limit,
      offset,
    };
  }

  async getN8nWorkflow(id: string) {
    const workflows = await this.readWorkflowStore();
    const workflow = workflows.find((item) => item.id === id);
    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }
    return workflow;
  }

  async createN8nWorkflow(payload: Record<string, unknown>) {
    const requestedId = typeof payload.id === 'string' && payload.id.trim().length > 0 ? payload.id.trim() : randomUUID();
    return this.upsertN8nWorkflow(requestedId, payload);
  }

  async upsertN8nWorkflow(id: string, payload: Record<string, unknown>) {
    const workflows = await this.readWorkflowStore();
    const now = new Date().toISOString();
    const existing = workflows.find((item) => item.id === id);
    const normalized = this.normalizeWorkflowRecord(id, payload, existing?.createdAt ?? now);
    normalized.updatedAt = now;

    if (existing) {
      const index = workflows.findIndex((item) => item.id === id);
      workflows[index] = normalized;
    } else {
      workflows.push(normalized);
    }

    await this.writeWorkflowStore(workflows);
    return normalized;
  }

  async deleteN8nWorkflow(id: string) {
    const workflows = await this.readWorkflowStore();
    const next = workflows.filter((item) => item.id !== id);
    if (next.length === workflows.length) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }
    await this.writeWorkflowStore(next);
    return { success: true, id };
  }

  async importN8nWorkflow(file?: UploadedWorkflowFile) {
    if (!file?.buffer?.length) {
      throw new InternalServerErrorException('No workflow file received');
    }

    try {
      const raw = JSON.parse(file.buffer.toString('utf8')) as Record<string, unknown>;
      if (raw.workflow && typeof raw.workflow === 'object') {
        const imported = raw.workflow as Record<string, unknown>;
        const stored = await this.createN8nWorkflow({
          id: raw.workflow_id,
          name: raw.name,
          nodes: imported.nodes,
          connections: imported.connections ?? this.connectionsFromGeneratedEdges(imported.edges),
          active: false,
          settings: imported.settings,
          orca_meta: imported.orca_meta,
          createdAt: imported.createdAt,
          updatedAt: imported.updatedAt,
        });
        return { success: true, workflow: stored };
      }

      const stored = await this.createN8nWorkflow(raw);
      return { success: true, workflow: stored };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown import error';
      throw new InternalServerErrorException(`Workflow import failed: ${message}`);
    }
  }

  async generateN8nWorkflow(request: {
    prompt?: string;
    model_id?: string;
    context?: string;
  }) {
    const prompt = String(request.prompt ?? '').trim();
    if (!prompt) {
      throw new InternalServerErrorException('Prompt is required to generate a workflow');
    }

    const lowerPrompt = prompt.toLowerCase();
    const middleType = lowerPrompt.includes('http') || lowerPrompt.includes('api')
      ? 'orca-nodes-base.httpRequest'
      : lowerPrompt.includes('condicion') || lowerPrompt.includes('condition')
        ? 'orca-nodes-base.condition'
        : 'orca-nodes-base.aiPrompt';
    const middleLabel = this.defaultNodeTypes[middleType]?.label ?? 'AI Prompt';
    const createdAt = new Date().toISOString();
    const workflowId = `wf-${randomUUID()}`;
    const generatedNodes = [
      {
        id: `node-${randomUUID()}`,
        name: 'Trigger',
        type: 'orca-nodes-base.trigger',
        parameters: {
          prompt,
        },
        position: [140, 140],
      },
      {
        id: `node-${randomUUID()}`,
        name: middleLabel,
        type: middleType,
        parameters: {
          model_id: request.model_id ?? 'kimi-k2-6',
          context: request.context ?? '',
          prompt,
        },
        position: [420, 140],
      },
      {
        id: `node-${randomUUID()}`,
        name: 'End',
        type: 'orca-nodes-base.end',
        parameters: {
          status: 'ready',
        },
        position: [700, 140],
      },
    ];

    const stored = await this.upsertN8nWorkflow(workflowId, {
      id: workflowId,
      name: `ORCA ${prompt.slice(0, 48)}`.trim(),
      active: false,
      nodes: generatedNodes.map((node) => ({
        id: node.id,
        type: 'default',
        data: {
          label: node.name,
          type: node.type,
          parameters: node.parameters,
          color: this.defaultNodeTypes[node.type]?.color ?? '#7c4dff',
          status: 'pending',
        },
        position: {
          x: node.position[0],
          y: node.position[1],
        },
      })),
      connections: {
        [generatedNodes[0].id]: [{ node_id: generatedNodes[1].id, type: 'smoothstep' }],
        [generatedNodes[1].id]: [{ node_id: generatedNodes[2].id, type: 'smoothstep' }],
      },
      settings: {
        mode: 'production-like',
        model_id: request.model_id ?? 'kimi-k2-6',
      },
      orca_meta: {
        prompt,
        context: request.context ?? '',
        source: 'backend-nest',
      },
      createdAt,
      updatedAt: createdAt,
    });

    return {
      workflow_id: stored.id,
      name: stored.name,
      workflow: {
        nodes: generatedNodes,
        connections: stored.connections,
        createdAt: stored.createdAt,
        updatedAt: stored.updatedAt,
        orca_meta: stored.orca_meta,
      },
    };
  }

  async startN8nExecution(workflowId: string, inputData: Record<string, unknown>) {
    const workflow = await this.getN8nWorkflow(workflowId);
    const executionId = `exec-${randomUUID()}`;
    this.executionSessions.set(executionId, {
      executionId,
      workflowId,
      workflowName: workflow.name,
      nodeIds: workflow.nodes.map((node) => node.id),
      startedAt: new Date().toISOString(),
      inputData,
    });

    return {
      execution_id: executionId,
      workflow_id: workflowId,
      status: 'running',
    };
  }

  async streamN8nExecution(executionId: string, res: Response): Promise<() => void> {
    const execution = this.executionSessions.get(executionId);
    if (!execution) {
      throw new NotFoundException(`Execution ${executionId} not found`);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const timers: NodeJS.Timeout[] = [];
    const writeEvent = (payload: Record<string, unknown>) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    writeEvent({
      type: 'execution-start',
      execution_id: execution.executionId,
      workflow_id: execution.workflowId,
      workflow_name: execution.workflowName,
      timestamp: execution.startedAt,
    });

    execution.nodeIds.forEach((nodeId, index) => {
      timers.push(
        setTimeout(() => {
          writeEvent({
            type: 'execution-node-start',
            execution_id: execution.executionId,
            workflow_id: execution.workflowId,
            node_id: nodeId,
            node_name: nodeId,
            status: 'running',
            timestamp: new Date().toISOString(),
          });
        }, index * 800),
      );

      timers.push(
        setTimeout(() => {
          writeEvent({
            type: 'execution-node-complete',
            execution_id: execution.executionId,
            workflow_id: execution.workflowId,
            node_id: nodeId,
            node_name: nodeId,
            status: 'completed',
            output: {
              ok: true,
              input_data: execution.inputData,
            },
            timestamp: new Date().toISOString(),
          });
        }, index * 800 + 450),
      );
    });

    timers.push(
      setTimeout(() => {
        writeEvent({
          type: 'execution-complete',
          execution_id: execution.executionId,
          workflow_id: execution.workflowId,
          status: 'done',
          timestamp: new Date().toISOString(),
        });
        res.end();
        this.executionSessions.delete(executionId);
      }, execution.nodeIds.length * 800 + 600),
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      if (!res.writableEnded) {
        res.end();
      }
    };
  }

  private isInterpretationOutput(value: unknown): value is {
    source_type: string;
    detected_intent: string;
    selected_skill: string;
    normalized_prompt: string;
    scrum: { tasks: string[]; risks: string[]; dependencies: string[] };
    model_prompt: {
      paid_model_prompt: string;
      free_model_followup_prompt: string;
      error_recovery_prompt: string;
    };
  } {
    if (!value || typeof value !== 'object') return false;
    const payload = value as Record<string, unknown>;
    return typeof payload.source_type === 'string' && typeof payload.scrum === 'object' && typeof payload.model_prompt === 'object';
  }

  private mockInterpretation(request: InterpretRequestDto) {
    const normalized = String(request.content ?? '').trim().toLowerCase();
    const isBugfix = normalized.includes('bug') || normalized.includes('error') || normalized.includes('fix');
    const intent = isBugfix ? 'bugfix' : 'automation';
    const skill = isBugfix ? 'bugfix_skill' : 'automation_skill';
    return {
      source_type: request.source_type,
      original_input: request.content,
      normalized_prompt: normalized,
      canonical_language: this.config.get<string>('ORCA_CANONICAL_LANGUAGE') ?? 'es',
      detected_intent: intent,
      confidence: 0.75,
      selected_skill: skill,
      scrum: {
        tasks: ['Analizar requerimiento', 'Implementar cambio', 'Validar con pruebas'],
        risks: isBugfix ? ['Regresion funcional'] : [],
        dependencies: [],
      },
      model_prompt: {
        paid_model_prompt: `Intent: ${intent}\nSkill: ${skill}\nPrompt: ${request.content}`,
        free_model_followup_prompt: `Refina alcance para: ${request.content}`,
        error_recovery_prompt: `Diagnosticar y recuperar para: ${request.content}`,
      },
    };
  }

  private auditLogs: Map<number, AuditLogResponseDto> = new Map();
  private auditLogId = 0;

  private workflowStorePath() {
    return path.join(this.config.get<string>('WORKSPACE_ROOT') ?? this.resolveWorkspaceRoot(), 'data', 'n8n_workflows.json');
  }

  private async ensureWorkflowStore() {
    const filePath = this.workflowStorePath();
    await mkdir(path.dirname(filePath), { recursive: true });
    try {
      await readFile(filePath, 'utf8');
    } catch {
      const initial: StoredWorkflowStore = { workflows: [] };
      await writeFile(filePath, JSON.stringify(initial, null, 2), 'utf8');
    }
  }

  private async readWorkflowStore(): Promise<StoredWorkflowRecord[]> {
    await this.ensureWorkflowStore();
    const content = await readFile(this.workflowStorePath(), 'utf8');
    try {
      const parsed = JSON.parse(content) as StoredWorkflowStore;
      return Array.isArray(parsed.workflows) ? parsed.workflows : [];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown workflow store error';
      throw new InternalServerErrorException(`Workflow storage is invalid: ${message}`);
    }
  }

  private async writeWorkflowStore(workflows: StoredWorkflowRecord[]) {
    await this.ensureWorkflowStore();
    await writeFile(this.workflowStorePath(), JSON.stringify({ workflows }, null, 2), 'utf8');
  }

  private normalizeWorkflowRecord(
    id: string,
    payload: Record<string, unknown>,
    createdAt: string,
  ): StoredWorkflowRecord {
    const nodes = Array.isArray(payload.nodes)
      ? payload.nodes.map((node, index) => this.normalizeNode(node, index))
      : [];
    const connections = this.normalizeConnections(payload.connections);
    const rawName = typeof payload.name === 'string' ? payload.name.trim() : '';
    return {
      id,
      name: rawName || `Workflow ${id}`,
      active: Boolean(payload.active),
      nodes,
      connections,
      settings: this.ensureRecord(payload.settings),
      createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : createdAt,
      updatedAt: typeof payload.updatedAt === 'string' ? payload.updatedAt : new Date().toISOString(),
      orca_meta: this.ensureOptionalRecord(payload.orca_meta),
    };
  }

  private normalizeNode(node: unknown, index: number): WorkflowNodeRecord {
    const record = this.ensureRecord(node);
    const position = this.ensureRecord(record.position);
    const data = this.ensureRecord(record.data);
    return {
      id: typeof record.id === 'string' && record.id.trim().length > 0 ? record.id : `node-${index + 1}`,
      type: typeof record.type === 'string' && record.type.trim().length > 0 ? record.type : 'default',
      data,
      position: {
        x: typeof position.x === 'number' ? position.x : 120 + index * 240,
        y: typeof position.y === 'number' ? position.y : 160,
      },
    };
  }

  private normalizeConnections(value: unknown): WorkflowConnectionRecord {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return Object.entries(value as Record<string, unknown>).reduce<WorkflowConnectionRecord>((acc, [source, targets]) => {
      if (!Array.isArray(targets)) {
        return acc;
      }
      acc[source] = targets
        .map((target) => this.ensureRecord(target))
        .filter((target) => typeof target.node_id === 'string')
        .map((target) => ({
          node_id: String(target.node_id),
          type: typeof target.type === 'string' ? target.type : 'smoothstep',
        }));
      return acc;
    }, {});
  }

  private connectionsFromGeneratedEdges(edges: unknown): WorkflowConnectionRecord {
    if (!Array.isArray(edges)) {
      return {};
    }

    return edges.reduce<WorkflowConnectionRecord>((acc, edge) => {
      const record = this.ensureRecord(edge);
      if (typeof record.source !== 'string' || typeof record.target !== 'string') {
        return acc;
      }
      if (!acc[record.source]) {
        acc[record.source] = [];
      }
      acc[record.source].push({
        node_id: record.target,
        type: typeof record.type === 'string' ? record.type : 'smoothstep',
      });
      return acc;
    }, {});
  }

  private ensureRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private ensureOptionalRecord(value: unknown): Record<string, unknown> | undefined {
    const record = this.ensureRecord(value);
    return Object.keys(record).length > 0 ? record : undefined;
  }

  async recordAuditLog(request: AuditLogRequestDto): Promise<AuditLogResponseDto> {
    try {
      this.logger.log(
        `Recording audit log: ${request.module_name}.${request.model_name}[${request.record_id}] action=${request.action}`,
      );

      // TODO: Implement persistent storage of audit logs (database, data warehouse, or logging service)
      // Currently stores in-memory and returns success response for Odoo modules to mark as synced
      // In production, this should:
      // 1. Store to database with full before/after snapshots
      // 2. Trigger any configured webhooks or downstream processors
      // 3. Update metrics and monitoring dashboards

      const now = new Date().toISOString();
      const id = ++this.auditLogId;

      const response: AuditLogResponseDto = {
        id,
        project_id: request.project_id,
        module_name: request.module_name,
        model_name: request.model_name,
        record_id: request.record_id,
        action: request.action,
        user_id: request.user_id,
        date: request.date,
        before_values: request.before_values,
        after_values: request.after_values,
        orca_synced: request.orca_synced ?? true,
        orca_sync_error: request.orca_sync_error,
        orca_request_id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: now,
        updated_at: now,
      };

      this.auditLogs.set(id, response);

      this.logger.log(`Audit log recorded successfully: ID=${id}, request_id=${response.orca_request_id}`);

      return response;
    } catch (error) {
      this.logger.error(`Failed to record audit log: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new InternalServerErrorException('Failed to record audit log');
    }
  }

  async getAuditLog(id: string): Promise<AuditLogResponseDto> {
    const numId = parseInt(id, 10);
    const log = this.auditLogs.get(numId);

    if (!log) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return log;
  }

  async queryAuditLogs(filters: {
    project_id?: string;
    module_name?: string;
    model_name?: string;
    record_id?: number;
    action?: string;
    limit: number;
  }): Promise<AuditLogResponseDto[]> {
    try {
      let results = Array.from(this.auditLogs.values());

      if (filters.project_id) {
        results = results.filter((log) => log.project_id === filters.project_id);
      }
      if (filters.module_name) {
        results = results.filter((log) => log.module_name === filters.module_name);
      }
      if (filters.model_name) {
        results = results.filter((log) => log.model_name === filters.model_name);
      }
      if (filters.record_id !== undefined) {
        results = results.filter((log) => log.record_id === filters.record_id);
      }
      if (filters.action) {
        results = results.filter((log) => log.action === filters.action);
      }

      // Sort by created_at descending (newest first)
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Apply limit
      return results.slice(0, filters.limit);
    } catch (error) {
      this.logger.error(`Failed to query audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new InternalServerErrorException('Failed to query audit logs');
    }
  }

  async processFiscalSync(request: FiscalSyncRequestDto) {
    try {
      this.logger.log(
        `Processing fiscal sync: ${request.module}.${request.model}[${request.record_id}] type=${request.sync_type}`,
      );

      // TODO: Implement fiscal operation sync logic
      // Currently returns success response for Odoo modules
      // In production, this should:
      // 1. Validate fiscal data according to jurisdiction rules (DO DGII, ES AEAT, etc.)
      // 2. Route to appropriate fiscal authority API (DGII, SAT, etc.)
      // 3. Store submission records with government response data
      // 4. Update Odoo module with sync status and any government-assigned identifiers
      // 5. Trigger compliance monitoring and audit trails

      return {
        success: true,
        request_id: `fiscal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        module: request.module,
        model: request.model,
        record_id: request.record_id,
        sync_type: request.sync_type,
        timestamp: new Date().toISOString(),
        message: 'Fiscal operation sync initiated successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to process fiscal sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new InternalServerErrorException('Failed to process fiscal sync');
    }
  }
}
