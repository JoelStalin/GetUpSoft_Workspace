import { Module } from '@nestjs/common';
import { OrcaN8nController } from './orca-n8n.controller';
import { OrcaController } from './orca.controller';
import { OrcaService } from './orca.service';

@Module({
  controllers: [OrcaController, OrcaN8nController],
  providers: [OrcaService],
})
export class OrcaModule {}
