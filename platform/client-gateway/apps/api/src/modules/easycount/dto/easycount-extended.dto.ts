import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class EasyCountUiTourUpdateDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  tourVersion!: number;

  @IsString()
  @MaxLength(20)
  status!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lastStep?: number;
}

export class EasyCountTenantApiCreateInvoiceDto {
  @IsString()
  @MaxLength(120)
  customer_name!: string;

  @Type(() => Number)
  @IsNumber()
  amount_total!: number;
}

export class EasyCountPartnerEmitDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  tenant_id!: number;

  @Type(() => Number)
  @IsNumber()
  amount_total!: number;
}

export class EasyCountOdooRncSearchQueryDto {
  @IsString()
  @MaxLength(120)
  term!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class EasyCountOdooInvoiceLineDto {
  @IsString()
  @MaxLength(160)
  product_name!: string;

  @Type(() => Number)
  @IsNumber()
  quantity!: number;

  @Type(() => Number)
  @IsNumber()
  unit_price!: number;
}

export class EasyCountOdooTransmitDto {
  @Type(() => Number)
  @IsNumber()
  odooInvoiceId!: number;

  @IsString()
  @MaxLength(20)
  eCfType!: string;

  @IsString()
  @MaxLength(30)
  issueDate!: string;

  @Type(() => Number)
  @IsNumber()
  totalAmount!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EasyCountOdooInvoiceLineDto)
  lines!: EasyCountOdooInvoiceLineDto[];
}
