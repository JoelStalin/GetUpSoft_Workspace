import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsIn, IsISO8601, IsJSON, IsOptional } from 'class-validator';

export class AuditLogRequestDto {
  @ApiProperty({ description: 'Odoo module name' })
  @IsString()
  module!: string;

  @ApiProperty({ description: 'Odoo model name (technical)' })
  @IsString()
  model!: string;

  @ApiProperty({ description: 'Database record ID' })
  @IsNumber()
  record_id!: number;

  @ApiProperty({ enum: ['create', 'write', 'unlink', 'sync'], description: 'Action type' })
  @IsIn(['create', 'write', 'unlink', 'sync'])
  action!: 'create' | 'write' | 'unlink' | 'sync';

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
}
