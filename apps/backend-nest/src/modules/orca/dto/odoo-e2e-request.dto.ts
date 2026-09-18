import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * Request DTO for the ORCA + Odoo E2E invoice creation flow.
 * Called by AIMode.tsx → POST /api/orca/odoo-e2e
 */
export class OdooE2eRequestDto {
  @ApiProperty({ description: 'Product name to find or create in Odoo' })
  @IsString()
  product_name!: string;

  @ApiProperty({ description: 'Customer name to find or create in Odoo' })
  @IsString()
  customer_name!: string;

  @ApiPropertyOptional({ description: 'Unit price for the product', default: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Quantity of the product', default: 1 })
  @IsNumber()
  @Min(0.001)
  @IsOptional()
  qty?: number;

  @ApiPropertyOptional({ description: 'Allow updating price on existing product', default: false })
  @IsBoolean()
  @IsOptional()
  allow_price_update_existing?: boolean;
}

/**
 * Response shape returned to the frontend for live-browser step navigation.
 */
export interface OdooE2eResult {
  ok: boolean;
  result?: {
    productId?: number;
    productName?: string;
    partnerId?: number;
    partnerName?: string;
    saleOrderId?: number;
    saleOrderName?: string;
    invoiceId?: number;
    invoiceName?: string;
    invoiceState?: string;
    paymentState?: string;
    pdfPath?: string;
  };
  detail?: string;
}
