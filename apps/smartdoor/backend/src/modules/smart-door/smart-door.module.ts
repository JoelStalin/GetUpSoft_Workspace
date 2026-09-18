import { Module } from '@nestjs/common';
import { SmartDoorController } from './smart-door.controller';
import { SmartDoorService } from './smart-door.service';

@Module({
  controllers: [SmartDoorController],
  providers: [SmartDoorService],
})
export class SmartDoorModule {}
