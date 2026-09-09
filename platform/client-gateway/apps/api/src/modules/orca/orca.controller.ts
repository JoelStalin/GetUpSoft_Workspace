import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InterpretRequestDto } from './dto/interpret-request.dto';
import { OrcaService } from './orca.service';

@ApiTags('orca')
@Controller()
export class OrcaController {
  constructor(private readonly orcaService: OrcaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Compatibility endpoint migrated from orca/service/app.py' })
  health() {
    return this.orcaService.health();
  }

  @Post('interpret')
  @ApiOperation({ summary: 'Interpret prompt through the ORCA core bridge' })
  async interpret(@Body() request: InterpretRequestDto) {
    if (!['text', 'script', 'audio'].includes(request.source_type)) {
      throw new BadRequestException('Unsupported source_type');
    }
    return this.orcaService.interpret(request);
  }

  @Post('n8n-payload')
  @ApiOperation({ summary: 'Build n8n payload through the migrated NestJS endpoint' })
  async n8nPayload(@Body() request: InterpretRequestDto) {
    if (!['text', 'script', 'audio'].includes(request.source_type)) {
      throw new BadRequestException('Unsupported source_type');
    }
    return this.orcaService.n8nPayload(request);
  }
}
