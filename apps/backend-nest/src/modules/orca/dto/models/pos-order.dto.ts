import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { BaseAuditLogDto } from '../base-audit-log.dto';

/**
 * PosOrder DTO for l10n_do_pos (all Odoo versions)
 * Tracks Point of Sale order state changes and fiscal receipt generation
 */
export class PosOrderAuditLogDto extends BaseAuditLogDto {
  @ApiProperty({ description: 'NCF (Comprobante Fiscal) number for POS order', required: false })
  @IsString()
  @IsOptional()
  ncf?: string;

  @ApiProperty({ description: 'POS order state (draft, paid, invoiced, done)', required: false })
  @IsString()
  @IsOptional()
  order_state?: string;

  @ApiProperty({ description: 'Fiscal type at time of log creation', required: false })
  @IsString()
  @IsOptional()
  fiscal_type?: string;

  @ApiProperty({ description: 'Customer/Partner ID', required: false })
  @IsNumber()
  @IsOptional()
  partner_id?: number;

  @ApiProperty({ description: 'Order total amount', required: false })
  @IsNumber()
  @IsOptional()
  amount_total?: number;

  @ApiProperty({ description: 'POS session ID', required: false })
  @IsNumber()
  @IsOptional()
  session_id?: number;

  @ApiProperty({ description: 'Payment method used', required: false })
  @IsString()
  @IsOptional()
  payment_method?: string;

  @ApiProperty({ description: 'Number of line items', required: false })
  @IsNumber()
  @IsOptional()
  line_count?: number;

  @ApiProperty({ description: 'Whether this order generated a fiscal document', required: false })
  @IsBoolean()
  @IsOptional()
  fiscal_document_generated?: boolean;

  @ApiProperty({ description: 'Error in fiscal document generation', required: false })
  @IsString()
  @IsOptional()
  fiscal_error?: string;
}

/**
 * Response DTO for PosOrder audit log queries
 */
export class PosOrderAuditLogResponseDto extends PosOrderAuditLogDto {
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
