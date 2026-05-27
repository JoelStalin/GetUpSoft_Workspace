import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { InterpretRequestDto } from './dto/interpret-request.dto';
import { AuditLogRequestDto, AuditLogResponseDto } from './dto/audit-log-request.dto';
import { FiscalSyncRequestDto } from './dto/fiscal-sync-request.dto';

const execFileAsync = promisify(execFile);

@Injectable()
export class OrcaService {
  private readonly logger = new Logger(OrcaService.name);

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
