import { Module } from '@nestjs/common';
import { OrcaApiKeyGuard } from '../../common/guards/orca-api-key.guard';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService, OrcaApiKeyGuard],
})
export class AiAutomationModule {}
