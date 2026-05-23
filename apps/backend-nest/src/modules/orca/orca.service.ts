import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { InterpretRequestDto } from './dto/interpret-request.dto';

const execFileAsync = promisify(execFile);

@Injectable()
export class OrcaService {
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
}
