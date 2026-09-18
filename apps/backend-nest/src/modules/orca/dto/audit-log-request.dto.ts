import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsIn, IsISO8601, IsJSON, IsOptional, IsBoolean } from 'class-validator';

export class AuditLogRequestDto {
  @ApiProperty({ description: 'GetUpSoft project identifier for multi-tenant tracking' })
  @IsString()
  project_id!: string;

  @ApiProperty({ description: 'Odoo module name' })
  @IsString()
  module_name!: string;

  @ApiProperty({ description: 'Odoo model name (technical)' })
  @IsString()
  model_name!: string;

  @ApiProperty({ description: 'Database record ID' })
  @IsNumber()
  record_id!: number;

  @ApiProperty({ enum: ['create', 'write', 'unlink', 'sync', 'error'], description: 'Action type' })
  @IsIn(['create', 'write', 'unlink', 'sync', 'error'])
  action!: 'create' | 'write' | 'unlink' | 'sync' | 'error';

  @ApiProperty({ description: 'Odoo user ID' })
  @IsNumber()
  user_id!: number;

  @ApiProperty({ description: 'ISO 8601 timestamp of change' })
  @IsISO8601()
  date!: string;

  @ApiProperty({ description: 'JSON snapshot of fields before change', required: false })
  @IsJSON()
  @IsOptional()
  before_values?: string;

  @ApiProperty({ description: 'JSON snapshot of fields after change', required: false })
  @IsJSON()
  @IsOptional()
  after_values?: string;

  @ApiProperty({ description: 'Whether this log was synced to ORCA', required: false })
  @IsBoolean()
  @IsOptional()
  orca_synced?: boolean;

  @ApiProperty({ description: 'Error message if ORCA sync failed', required: false })
  @IsString()
  @IsOptional()
  orca_sync_error?: string;

  @ApiProperty({ description: 'Request ID returned by ORCA on successful sync', required: false })
  @IsString()
  @IsOptional()
  orca_request_id?: string;
}

export class AuditLogResponseDto extends AuditLogRequestDto {
  @ApiProperty({ description: 'Internal ORCA log ID' })
  @IsNumber()
  id!: number;

  @ApiProperty({ description: 'Creation timestamp in ORCA' })
  @IsString()
  created_at!: string;

  @ApiProperty({ description: 'Last update timestamp in ORCA' })
  @IsString()
  updated_at!: string;
}
