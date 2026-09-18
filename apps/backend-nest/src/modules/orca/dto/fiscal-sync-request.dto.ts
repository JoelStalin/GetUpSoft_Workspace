import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsISO8601, IsOptional } from 'class-validator';

export class FiscalSyncRequestDto {
  @ApiProperty({ description: 'Odoo module name' })
  @IsString()
  module!: string;

  @ApiProperty({ description: 'Odoo model name (technical)' })
  @IsString()
  model!: string;

  @ApiProperty({ description: 'Database record ID' })
  @IsNumber()
  record_id!: number;

  @ApiProperty({ description: 'Type of fiscal sync (invoice, report, etc)', required: false })
  @IsString()
  @IsOptional()
  sync_type?: string;

  @ApiProperty({ description: 'Fiscal operation data to sync' })
  @IsObject()
  sync_data!: Record<string, any>;

  @ApiProperty({ description: 'ISO 8601 timestamp of sync', required: false })
  @IsISO8601()
  @IsOptional()
  date?: string;

  @ApiProperty({ description: 'Odoo user ID requesting sync', required: false })
  @IsNumber()
  @IsOptional()
  user_id?: number;
}
