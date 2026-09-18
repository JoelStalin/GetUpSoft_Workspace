// A02 — presentation/http: valida y delega, nunca ejecuta workflows ni contiene SQL
// (regla del diseno GetUpSoft+ORCA). Toda la logica real vive en application/use-cases.
import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InterpretRequestDto } from '../../dto/interpret-request.dto';
import { InterpretPromptUseCase } from '../../application/use-cases/interpret-prompt.use-case';
import { BuildN8nPayloadUseCase } from '../../application/use-cases/build-n8n-payload.use-case';

const VALID_SOURCE_TYPES = ['text', 'script', 'audio'];

@ApiTags('orca')
@Controller()
export class OrcaController {
  constructor(
    private readonly interpretPrompt: InterpretPromptUseCase,
    private readonly buildN8nPayload: BuildN8nPayloadUseCase,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Compatibility endpoint migrated from orca/service/app.py' })
  health() {
    return this.interpretPrompt.health();
  }

  @Post('interpret')
  @ApiOperation({ summary: 'Interpret prompt through the ORCA core bridge' })
  async interpret(@Body() request: InterpretRequestDto) {
    if (!VALID_SOURCE_TYPES.includes(request.source_type)) {
      throw new BadRequestException('Unsupported source_type');
    }
    return this.interpretPrompt.execute(request);
  }

  @Post('n8n-payload')
  @ApiOperation({ summary: 'Build n8n payload through the migrated NestJS endpoint' })
  async n8nPayload(@Body() request: InterpretRequestDto) {
    if (!VALID_SOURCE_TYPES.includes(request.source_type)) {
      throw new BadRequestException('Unsupported source_type');
    }
    return this.buildN8nPayload.execute(request);
  }
}
