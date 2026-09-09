import { Module } from '@nestjs/common';
import { OrcaController } from './orca.controller';
import { OrcaService } from './orca.service';

@Module({
  controllers: [OrcaController],
  providers: [OrcaService],
})
export class OrcaModule {}
