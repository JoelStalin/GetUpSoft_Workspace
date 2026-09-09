import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AdminListInvoicesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  size?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  tenant_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  estado_dgii?: string;
}

export class AdminTenantPayloadDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  rnc?: string;
}

export class AdminPlanPayloadDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_monthly!: number;
}

export class AdminTenantPlanAssignmentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  plan_id!: number;
}

export class AdminLedgerEntryCreateDto {
  @IsString()
  @MaxLength(200)
  description!: string;

  @Type(() => Number)
  @IsNumber()
  amount!: number;
}

export class AdminTenantSettingsPayloadDto {
  @IsOptional()
  @IsBoolean()
  allow_manual_ncf?: boolean;

  @IsOptional()
  @IsBoolean()
  ai_enabled?: boolean;
}

export class AdminPlatformAIProviderPayloadDto {
  @IsString()
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  kind?: string;
}

export class AdminTenantAIProviderPayloadDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  provider_id!: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class AdminUserAIProviderPayloadDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  provider_id!: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
