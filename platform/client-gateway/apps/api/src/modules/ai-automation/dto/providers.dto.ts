import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class ProviderValidationRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  api_key?: string;
}

export class ProviderConfigRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  user_id!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  provider_id!: string;

  @ApiProperty({ type: Object })
  @IsObject()
  config!: Record<string, unknown>;
}

export class ProviderTestRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  provider_id!: string;
}
