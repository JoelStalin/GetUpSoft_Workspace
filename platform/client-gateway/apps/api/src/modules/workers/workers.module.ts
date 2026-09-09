import { Module } from '@nestjs/common';
import { OrcaApiKeyGuard } from '../../common/guards/orca-api-key.guard';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';

@Module({
  controllers: [WorkersController],
  providers: [WorkersService, OrcaApiKeyGuard],
})
export class WorkersModule {}
