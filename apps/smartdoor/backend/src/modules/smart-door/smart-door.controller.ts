import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateQrGrantDto } from './dto/create-qr-grant.dto';
import { LockActionRequestDto } from './dto/lock-action-request.dto';
import { RegisterLockDto } from './dto/register-lock.dto';
import { SmartDoorService } from './smart-door.service';

@ApiTags('smart-door')
@Controller('api/smartdoor')
export class SmartDoorController {
  constructor(private readonly smartDoorService: SmartDoorService) {}

  @Get('blueprint')
  @ApiOperation({ summary: 'Get Smart Door product blueprint and ORCA integration summary' })
  getBlueprint() {
    return this.smartDoorService.getBlueprint();
  }

  @Get('locks')
  @ApiOperation({ summary: 'List registered smart locks in the Smart Door scaffold' })
  listLocks() {
    return this.smartDoorService.listLocks();
  }

  @Post('locks/register')
  @ApiOperation({ summary: 'Register a Smart Door lock in the scaffold service' })
  registerLock(@Body() dto: RegisterLockDto) {
    return this.smartDoorService.registerLock(dto);
  }

  @Get('locks/:id')
  @ApiOperation({ summary: 'Get Smart Door lock details' })
  getLock(@Param('id') id: string) {
    return this.smartDoorService.getLock(id);
  }

  @Get('locks/:id/events')
  @ApiOperation({ summary: 'List Smart Door lock events' })
  getLockEvents(@Param('id') id: string) {
    return this.smartDoorService.getLockEvents(id);
  }

  @Post('locks/:id/open')
  @ApiOperation({ summary: 'Open a Smart Door lock through the business command path' })
  openLock(@Param('id') id: string, @Body() dto: LockActionRequestDto) {
    return this.smartDoorService.openLock(id, dto);
  }

  @Post('qr-grants')
  @ApiOperation({ summary: 'Create a QR grant with configurable stay-time window' })
  createQrGrant(@Body() dto: CreateQrGrantDto) {
    return this.smartDoorService.createQrGrant(dto);
  }

  @Get('qr/:token')
  @ApiOperation({ summary: 'Resolve a QR grant landing-page context' })
  resolveQrGrant(@Param('token') token: string) {
    return this.smartDoorService.resolveQrGrant(token);
  }

  @Post('qr/:token/open')
  @ApiOperation({ summary: 'Open a Smart Door lock using a valid QR grant flow' })
  openLockWithQr(@Param('token') token: string, @Body() dto: LockActionRequestDto) {
    return this.smartDoorService.openLockWithQr(token, dto);
  }

  @Get('orca/workflows')
  @ApiOperation({ summary: 'Expose ORCA automation workflow guardrails for Smart Door' })
  getOrcaWorkflows() {
    return this.smartDoorService.getOrcaWorkflowSummary();
  }
}
