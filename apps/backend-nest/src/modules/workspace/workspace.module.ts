import { Module } from '@nestjs/common';
import { OrcaApiKeyGuard } from '../../common/guards/orca-api-key.guard';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspaceService, OrcaApiKeyGuard],
})
export class WorkspaceModule {}
