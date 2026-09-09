import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class EasyCountInternalSignXmlDto {
  @IsString()
  xml!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  tenantId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  tenantRnc?: string;
}

export class EasyCountEcfGenerateDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  certia_tenant_id!: number;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  l10n_latam_document_type?: string;
}

export class EasyCountCertificateIntakeDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  case_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  rnc?: string;
}

export class EasyCountCertificateStatusDto {
  @IsString()
  @MaxLength(64)
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

export class EasyCountReminderCreateDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  hours!: number;
}

export class EasyCountWorkflowCheckpointDto {
  @IsString()
  execution_id!: string;

  @IsString()
  step!: string;

  @IsString()
  action!: string;

  @IsString()
  result!: string;
}

export class EasyCountDgiiLiveDto {
  @IsOptional()
  @IsBoolean()
  live?: boolean;
}
