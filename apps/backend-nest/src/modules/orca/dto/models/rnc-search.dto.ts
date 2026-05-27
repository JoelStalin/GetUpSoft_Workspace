import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { BaseAuditLogDto } from '../base-audit-log.dto';

/**
 * RncSearch DTO for l10n_do_rnc_search (all Odoo versions)
 * Tracks Dominican RNC (Taxpayer Registration Number) searches and validations
 */
export class RncSearchAuditLogDto extends BaseAuditLogDto {
  @ApiProperty({ description: 'RNC number searched', required: false })
  @IsString()
  @IsOptional()
  rnc?: string;

  @ApiProperty({ description: 'Legal name from DGII', required: false })
  @IsString()
  @IsOptional()
  legal_name?: string;

  @ApiProperty({ description: 'Commercial name from DGII', required: false })
  @IsString()
  @IsOptional()
  commercial_name?: string;

  @ApiProperty({ description: 'Validation status (valid, invalid, expired, unknown)', required: false })
  @IsString()
  @IsOptional()
  validation_status?: string;

  @ApiProperty({ description: 'Full DGII API response (JSON)', required: false })
  @IsString()
  @IsOptional()
  dgii_response?: string;

  @ApiProperty({ description: 'Partner ID matched or created', required: false })
  @IsNumber()
  @IsOptional()
  partner_id?: number;

  @ApiProperty({ description: 'Whether RNC was found in DGII', required: false })
  @IsBoolean()
  @IsOptional()
  found_in_dgii?: boolean;

  @ApiProperty({ description: 'DGII API call error if any', required: false })
  @IsString()
  @IsOptional()
  dgii_error?: string;

  @ApiProperty({ description: 'Response time in milliseconds', required: false })
  @IsNumber()
  @IsOptional()
  response_time_ms?: number;
}

/**
 * Response DTO for RncSearch audit log queries
 */
export class RncSearchAuditLogResponseDto extends RncSearchAuditLogDto {
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
