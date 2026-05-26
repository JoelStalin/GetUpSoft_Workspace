import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { InterpretRequestDto } from './dto/interpret-request.dto';
import { AuditLogRequestDto } from './dto/audit-log-request.dto';
import { FiscalSyncRequestDto } from './dto/fiscal-sync-request.dto';
import { OrcaService } from './orca.service';

@ApiTags('orca')
@Controller()
export class OrcaController {
  constructor(private readonly orcaService: OrcaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Compatibility endpoint migrated from orca/service/app.py' })
  health() {
    return this.orcaService.health();
  }

  @Post('interpret')
  @ApiOperation({ summary: 'Interpret prompt through the ORCA core bridge' })
  async interpret(@Body() request: InterpretRequestDto) {
    if (!['text', 'script', 'audio'].includes(request.source_type)) {
      throw new BadRequestException('Unsupported source_type');
    }
    return this.orcaService.interpret(request);
  }

  @Post('n8n-payload')
  @ApiOperation({ summary: 'Build n8n payload through the migrated NestJS endpoint' })
  async n8nPayload(@Body() request: InterpretRequestDto) {
    if (!['text', 'script', 'audio'].includes(request.source_type)) {
      throw new BadRequestException('Unsupported source_type');
    }
    return this.orcaService.n8nPayload(request);
  }

  @Post('audit-log')
  @ApiOperation({ summary: 'Record audit log from Odoo module' })
  @ApiResponse({ status: 201, description: 'Audit log recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request payload' })
  async auditLog(@Body() request: AuditLogRequestDto) {
    if (!['create', 'write', 'unlink', 'sync'].includes(request.action)) {
      throw new BadRequestException('Unsupported action type');
    }
    return this.orcaService.recordAuditLog(request);
  }

  @Post('fiscal-sync')
  @ApiOperation({ summary: 'Sync fiscal operation from Odoo module' })
  @ApiResponse({ status: 201, description: 'Fiscal operation synced successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request payload' })
  async fiscalSync(@Body() request: FiscalSyncRequestDto) {
    return this.orcaService.processFiscalSync(request);
  }
}
