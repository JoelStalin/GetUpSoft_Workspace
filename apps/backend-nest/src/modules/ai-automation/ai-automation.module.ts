import { Module } from '@nestjs/common';
import { OrcaApiKeyGuard } from '../../common/guards/orca-api-key.guard';
import { AuthModule } from '../auth/auth.module';
import { DeployController } from './deploy.controller';
import { DeployService } from './deploy.service';
import { N8nController } from './n8n.controller';
import { N8nService } from './n8n.service';
import { OrchestratorController } from './orchestrator.controller';
import { OrchestratorService } from './orchestrator.service';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { WebUiController } from './web-ui.controller';
import { TinderController } from './tinder.controller';
import { TinderService } from './tinder.service';

@Module({
  imports: [AuthModule],
  controllers: [
    ProvidersController,
    DeployController,
    N8nController,
    OrchestratorController,
    WebUiController,
    TinderController,
  ],
  providers: [
    ProvidersService,
    DeployService,
    N8nService,
    OrchestratorService,
    OrcaApiKeyGuard,
    TinderService,
  ],
})
export class AiAutomationModule {}
