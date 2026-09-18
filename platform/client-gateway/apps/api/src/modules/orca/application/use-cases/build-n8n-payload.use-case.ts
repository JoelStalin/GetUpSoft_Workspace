// A02 — caso de uso: transforma una interpretacion en el payload que espera n8n.
// Comportamiento identico al metodo n8nPayload() que vivia antes en orca.service.ts.
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InterpretPromptUseCase } from './interpret-prompt.use-case';
import { InterpretRequest } from '../../domain/ports/orca-interpreter.port';
import { isInterpretationOutput } from '../../domain/entities/interpretation.entity';

@Injectable()
export class BuildN8nPayloadUseCase {
  constructor(private readonly interpretPrompt: InterpretPromptUseCase) {}

  async execute(request: InterpretRequest) {
    const interpreted = await this.interpretPrompt.execute(request);
    if (!isInterpretationOutput(interpreted)) {
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
}
