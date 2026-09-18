// A02 — adapter: implementacion del puerto que invoca el orquestador Python real via CLI
// (execFile, nunca HTTP directo -- ver A01). Comportamiento identico al que vivia antes
// en orca.service.ts (runOrcaCli/resolveWorkspaceRoot/commandForSource) -- solo se movio.
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { InterpretRequest, OrcaInterpreterPort } from '../../domain/ports/orca-interpreter.port';
import { InterpretationOutput } from '../../domain/entities/interpretation.entity';

const execFileAsync = promisify(execFile);

@Injectable()
export class PythonCliOrcaInterpreterAdapter implements OrcaInterpreterPort {
  constructor(private readonly config: ConfigService) {}

  async interpret(request: InterpretRequest): Promise<InterpretationOutput> {
    const command = this.commandForSource(request.source_type);
    return this.runOrcaCli(command, request.content);
  }

  private commandForSource(sourceType: InterpretRequest['source_type']) {
    if (sourceType === 'text') return 'interpret';
    if (sourceType === 'script') return 'interpret';
    if (sourceType === 'audio') return 'interpret-audio';
    return 'interpret';
  }

  private async runOrcaCli(command: string, content: string): Promise<InterpretationOutput> {
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
}
