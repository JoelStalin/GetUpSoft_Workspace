import { BadRequestException, Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { InterpretRequestDto } from './dto/interpret-request.dto';
import { AuditLogRequestDto, AuditLogResponseDto } from './dto/audit-log-request.dto';
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
  @ApiResponse({ status: 201, description: 'Audit log recorded successfully', type: AuditLogResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request payload' })
  async auditLog(@Body() request: AuditLogRequestDto): Promise<AuditLogResponseDto> {
    if (!['create', 'write', 'unlink', 'sync', 'error'].includes(request.action)) {
      throw new BadRequestException('Unsupported action type');
    }
    return this.orcaService.recordAuditLog(request);
  }

  @Get('audit-log/:id')
  @ApiOperation({ summary: 'Retrieve a specific audit log by ID' })
  @ApiResponse({ status: 200, description: 'Audit log retrieved successfully', type: AuditLogResponseDto })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async getAuditLog(@Param('id') id: string): Promise<AuditLogResponseDto> {
    return this.orcaService.getAuditLog(id);
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Query audit logs by project, module, or model' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully', type: [AuditLogResponseDto] })
  async queryAuditLogs(
    @Query('project_id') project_id?: string,
    @Query('module_name') module_name?: string,
    @Query('model_name') model_name?: string,
    @Query('record_id') record_id?: string,
    @Query('action') action?: string,
    @Query('limit') limit: string = '100',
  ): Promise<AuditLogResponseDto[]> {
    return this.orcaService.queryAuditLogs({
      project_id,
      module_name,
      model_name,
      record_id: record_id ? parseInt(record_id, 10) : undefined,
      action,
      limit: Math.min(parseInt(limit, 10), 1000),
    });
  }

  @Post('fiscal-sync')
  @ApiOperation({ summary: 'Sync fiscal operation from Odoo module' })
  @ApiResponse({ status: 201, description: 'Fiscal operation synced successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request payload' })
  async fiscalSync(@Body() request: FiscalSyncRequestDto) {
    return this.orcaService.processFiscalSync(request);
  }
}
