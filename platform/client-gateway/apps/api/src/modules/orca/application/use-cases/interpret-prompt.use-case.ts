// A02 — caso de uso: decide QUE adapter usar (ORCA_BRIDGE_MODE) y delega en el puerto.
// El controller nunca ve execFile ni el mock directamente -- solo este caso de uso.
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ORCA_INTERPRETER_PORT, OrcaInterpreterPort, InterpretRequest } from '../../domain/ports/orca-interpreter.port';
import { InterpretationOutput } from '../../domain/entities/interpretation.entity';

@Injectable()
export class InterpretPromptUseCase {
  constructor(
    @Inject(ORCA_INTERPRETER_PORT) private readonly interpreter: OrcaInterpreterPort,
    private readonly config: ConfigService,
  ) {}

  health() {
    return {
      status: 'ok',
      canonical_language: this.config.get<string>('ORCA_CANONICAL_LANGUAGE') ?? 'es',
      low_confidence_threshold: Number(this.config.get<string>('ORCA_LOW_CONFIDENCE_THRESHOLD') ?? 0.55),
      completion_policy: 'autonomous_until_done_with_tests',
    };
  }

  async execute(request: InterpretRequest): Promise<InterpretationOutput> {
    return this.interpreter.interpret(request);
  }
}
