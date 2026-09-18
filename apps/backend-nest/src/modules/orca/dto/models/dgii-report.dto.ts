import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsISO8601, IsBoolean } from 'class-validator';
import { BaseAuditLogDto } from '../base-audit-log.dto';

/**
 * DgiiReport DTO for l10n_do_accounting_report (all Odoo versions)
 * Tracks DGII fiscal report submission state changes
 */
export class DgiiReportAuditLogDto extends BaseAuditLogDto {
  @ApiProperty({ description: 'Report period in MM/YYYY format', required: false })
  @IsString()
  @IsOptional()
  report_period?: string;

  @ApiProperty({ description: 'Report state (draft, generated, sent, error)', required: false })
  @IsString()
  @IsOptional()
  report_state?: string;

  @ApiProperty({ description: 'Company ID generating the report', required: false })
  @IsNumber()
  @IsOptional()
  company_id?: number;

  @ApiProperty({ description: 'Report start date', required: false })
  @IsISO8601()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ description: 'Report end date', required: false })
  @IsISO8601()
  @IsOptional()
  end_date?: string;

  @ApiProperty({ description: 'DGII submission confirmation number', required: false })
  @IsString()
  @IsOptional()
  dgii_confirmation_number?: string;

  @ApiProperty({ description: 'Report type (monthly, quarterly, annual)', required: false })
  @IsString()
  @IsOptional()
  report_type?: string;

  @ApiProperty({ description: 'Whether submitted to DGII', required: false })
  @IsBoolean()
  @IsOptional()
  dgii_submitted?: boolean;

  @ApiProperty({ description: 'DGII submission error if any', required: false })
  @IsString()
  @IsOptional()
  dgii_error?: string;
}

/**
 * Response DTO for DgiiReport audit log queries
 */
export class DgiiReportAuditLogResponseDto extends DgiiReportAuditLogDto {
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
