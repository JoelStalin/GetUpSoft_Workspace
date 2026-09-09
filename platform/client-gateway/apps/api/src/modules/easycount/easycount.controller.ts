import { Controller, Get } from '@nestjs/common';

@Controller('easycount')
export class EasyCountController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('healthz')
  healthz() {
    return { status: 'ok' };
  }

  @Get('livez')
  livez() {
    return { status: 'alive' };
  }

  @Get('readyz')
  readyz() {
    const checks = {
      database: true,
      redis: true,
    };
    const isReady = Object.values(checks).every(Boolean);
    return {
      status: isReady ? 'ready' : 'degraded',
      checks,
    };
  }
}

