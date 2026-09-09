import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('healthz')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'NestJS backend liveness probe' })
  healthz() {
    return {
      status: 'ok',
      service: 'backend-nest',
    };
  }
}
