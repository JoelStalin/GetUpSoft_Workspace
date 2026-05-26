import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { OrcaModule } from './modules/orca/orca.module';
import { WorkersModule } from './modules/workers/workers.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { AiAutomationModule } from './modules/ai-automation/ai-automation.module';
import { AuthModule } from './modules/auth/auth.module';
import { EasyCountModule } from './modules/easycount/easycount.module';

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
    AuthModule,
    EasyCountModule,
  ],
})
export class AppModule {}
