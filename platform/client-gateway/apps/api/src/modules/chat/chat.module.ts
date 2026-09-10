import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrcaModule } from '../orca/orca.module';
import { ModelRoutingModule } from '../model-routing/model-routing.module';
import { ChatOrchestrationUseCase } from './application/chat-orchestration.use-case';

@Module({
  imports: [ConfigModule, OrcaModule, ModelRoutingModule],
  providers: [ChatOrchestrationUseCase],
  exports: [ChatOrchestrationUseCase],
})
export class ChatModule {}
