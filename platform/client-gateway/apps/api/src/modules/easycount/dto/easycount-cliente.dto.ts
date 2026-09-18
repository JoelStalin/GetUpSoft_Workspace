import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class EasyCountPlanChangeRequestDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  plan_id!: number;
}

export class EasyCountInvoiceEmitRequestDto {
  @ApiProperty()
  @IsString()
  customer_name!: string;

  @ApiProperty()
  @IsString()
  customer_rnc!: string;

  @ApiProperty()
  @IsString()
  ncf_type!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  amount_total!: number;
}

export class EasyCountInvoiceListQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  size?: number;
}

export class EasyCountOnboardingUpdateDto {
  @ApiProperty()
  @IsString()
  company_name!: string;
}

export class EasyCountApiTokenCreateDto {
  @ApiProperty()
  @IsString()
  label!: string;
}

export class EasyCountRecurringCreateDto {
  @ApiProperty()
  @IsString()
  name!: string;
}

export class EasyCountChatAskDto {
  @ApiProperty()
  @IsString()
  question!: string;
}

export class EasyCountChatMemoryCreateDto {
  @ApiProperty()
  @IsString()
  content!: string;
}

export class EasyCountInvoiceSendEmailDto {
  @ApiProperty()
  @IsString()
  recipient!: string;
}

export class EasyCountOdooSyncDto {
  @ApiProperty()
  @IsBoolean()
  include_customers!: boolean;

  @ApiProperty()
  @IsBoolean()
  include_vendors!: boolean;

  @ApiProperty()
  @IsBoolean()
  include_products!: boolean;

  @ApiProperty()
  @IsBoolean()
  include_invoices!: boolean;

  @ApiProperty()
  @IsInt()
  @Min(1)
  limit!: number;
}
