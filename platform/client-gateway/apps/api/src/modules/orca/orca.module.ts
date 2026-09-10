// A02 — wiring: el modulo decide, via un provider factory, cual adapter implementa el
// puerto del dominio segun ORCA_BRIDGE_MODE -- misma condicion que antes vivia inline
// dentro de OrcaService.interpret() ('python' -> adapter real, cualquier otro -> mock).
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrcaController } from './presentation/http/orca.controller';
import { InterpretPromptUseCase } from './application/use-cases/interpret-prompt.use-case';
import { BuildN8nPayloadUseCase } from './application/use-cases/build-n8n-payload.use-case';
import { ORCA_INTERPRETER_PORT } from './domain/ports/orca-interpreter.port';
import { PythonCliOrcaInterpreterAdapter } from './infrastructure/adapters/python-cli-orca-interpreter.adapter';
import { MockOrcaInterpreterAdapter } from './infrastructure/adapters/mock-orca-interpreter.adapter';

@Module({
  imports: [ConfigModule],
  controllers: [OrcaController],
  providers: [
    PythonCliOrcaInterpreterAdapter,
    MockOrcaInterpreterAdapter,
    {
      provide: ORCA_INTERPRETER_PORT,
      useFactory: (config: ConfigService, python: PythonCliOrcaInterpreterAdapter, mock: MockOrcaInterpreterAdapter) => {
        const bridgeMode = (config.get<string>('ORCA_BRIDGE_MODE') ?? 'mock').toLowerCase();
        return bridgeMode === 'python' ? python : mock;
      },
      inject: [ConfigService, PythonCliOrcaInterpreterAdapter, MockOrcaInterpreterAdapter],
    },
    InterpretPromptUseCase,
    BuildN8nPayloadUseCase,
  ],
})
export class OrcaModule {}
