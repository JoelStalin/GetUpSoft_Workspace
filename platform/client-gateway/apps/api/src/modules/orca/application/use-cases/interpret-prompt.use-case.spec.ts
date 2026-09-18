// A02 — verifica que la separacion en capas preservo el comportamiento EXACTO del
// OrcaService original: deteccion de bugfix por palabras clave, shape de scrum/model_prompt,
// y que build-n8n-payload transforma correctamente el resultado del caso de uso de interpretar.
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InterpretPromptUseCase } from './interpret-prompt.use-case';
import { BuildN8nPayloadUseCase } from './build-n8n-payload.use-case';
import { ORCA_INTERPRETER_PORT } from '../../domain/ports/orca-interpreter.port';
import { MockOrcaInterpreterAdapter } from '../../infrastructure/adapters/mock-orca-interpreter.adapter';

describe('InterpretPromptUseCase + BuildN8nPayloadUseCase (mock adapter)', () => {
  let interpretPrompt: InterpretPromptUseCase;
  let buildN8nPayload: BuildN8nPayloadUseCase;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockOrcaInterpreterAdapter,
        { provide: ORCA_INTERPRETER_PORT, useExisting: MockOrcaInterpreterAdapter },
        InterpretPromptUseCase,
        BuildN8nPayloadUseCase,
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    interpretPrompt = moduleRef.get(InterpretPromptUseCase);
    buildN8nPayload = moduleRef.get(BuildN8nPayloadUseCase);
  });

  it('health() reporta canonical_language por defecto y la politica de completitud', () => {
    const health = interpretPrompt.health();
    expect(health.status).toBe('ok');
    expect(health.canonical_language).toBe('es');
    expect(health.completion_policy).toBe('autonomous_until_done_with_tests');
  });

  it('detecta bugfix por palabra clave y agrega el riesgo de regresion', async () => {
    const result = await interpretPrompt.execute({ source_type: 'text', content: 'hay un bug en el login' });
    expect(result.detected_intent).toBe('bugfix');
    expect(result.selected_skill).toBe('bugfix_skill');
    expect(result.scrum.risks).toContain('Regresion funcional');
  });

  it('sin palabra clave de bug, clasifica como automation sin riesgos', async () => {
    const result = await interpretPrompt.execute({ source_type: 'text', content: 'crea un reporte semanal' });
    expect(result.detected_intent).toBe('automation');
    expect(result.scrum.risks).toEqual([]);
  });

  it('build-n8n-payload transforma la interpretacion al shape que espera n8n', async () => {
    const payload = await buildN8nPayload.execute({ source_type: 'text', content: 'fix error de conexion' });
    expect(payload).toMatchObject({
      source: 'text',
      detected_intent: 'bugfix',
      tasks: ['Analizar requerimiento', 'Implementar cambio', 'Validar con pruebas'],
      risks: ['Regresion funcional'],
      dependencies: [],
    });
    expect(payload.paid_model_prompt).toContain('Intent: bugfix');
  });
});
