import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { OrcaModule } from './modules/orca/orca.module';
import { WorkersModule } from './modules/workers/workers.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { AiAutomationModule } from './modules/ai-automation/ai-automation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    OrcaModule,
    WorkersModule,
    WorkspaceModule,
    AiAutomationModule,
  ],
})
export class AppModule {}
