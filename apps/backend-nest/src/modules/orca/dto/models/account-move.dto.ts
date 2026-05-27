import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { BaseAuditLogDto } from '../base-audit-log.dto';

/**
 * AccountMove DTO for l10n_do_accounting (all Odoo versions)
 * Tracks fiscal invoice/document state changes
 */
export class AccountMoveAuditLogDto extends BaseAuditLogDto {
  @ApiProperty({ description: 'e-CF (Comprobante Fiscal) number assigned by DGII', required: false })
  @IsString()
  @IsOptional()
  encf?: string;

  @ApiProperty({ description: 'Invoice fiscal state (draft, posted, cancelled, etc.)', required: false })
  @IsString()
  @IsOptional()
  fiscal_state?: string;

  @ApiProperty({ description: 'UUID assigned by DGII for this fiscal document', required: false })
  @IsString()
  @IsOptional()
  dgii_uuid?: string;

  @ApiProperty({ description: 'Document type (invoice, credit note, debit note)', required: false })
  @IsString()
  @IsOptional()
  document_type?: string;

  @ApiProperty({ description: 'Customer/Partner ID', required: false })
  @IsNumber()
  @IsOptional()
  partner_id?: number;

  @ApiProperty({ description: 'Invoice total amount', required: false })
  @IsNumber()
  @IsOptional()
  amount_total?: number;

  @ApiProperty({ description: 'Journal ID used for posting', required: false })
  @IsNumber()
  @IsOptional()
  journal_id?: number;

  @ApiProperty({ description: 'Whether synced to EasyCount', required: false })
  @IsBoolean()
  @IsOptional()
  easycount_synced?: boolean;

  @ApiProperty({ description: 'EasyCount sync error message', required: false })
  @IsString()
  @IsOptional()
  easycount_sync_error?: string;
}

/**
 * Response DTO for AccountMove audit log queries
 */
export class AccountMoveAuditLogResponseDto extends AccountMoveAuditLogDto {
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
