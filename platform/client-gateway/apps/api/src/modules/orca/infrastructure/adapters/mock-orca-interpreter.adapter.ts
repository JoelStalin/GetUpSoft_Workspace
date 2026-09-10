// A02 — adapter: implementacion del puerto para desarrollo sin depender de Python real.
// Comportamiento identico al metodo privado mockInterpretation() que vivia antes en
// orca.service.ts -- solo se movio, no se cambio.
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InterpretRequest, OrcaInterpreterPort } from '../../domain/ports/orca-interpreter.port';
import { InterpretationOutput } from '../../domain/entities/interpretation.entity';

@Injectable()
export class MockOrcaInterpreterAdapter implements OrcaInterpreterPort {
  constructor(private readonly config: ConfigService) {}

  async interpret(request: InterpretRequest): Promise<InterpretationOutput> {
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
}
