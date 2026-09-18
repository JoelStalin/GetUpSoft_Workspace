import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class EasyCountLoginRequestDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;

  @ApiPropertyOptional({ enum: ['admin', 'client', 'seller'] })
  @IsOptional()
  @IsString()
  portal?: 'admin' | 'client' | 'seller';
}

export class EasyCountMfaRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  challenge_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class EasyCountSocialExchangeRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  ticket!: string;

  @ApiProperty({ enum: ['admin', 'client', 'seller'] })
  @IsString()
  portal!: 'admin' | 'client' | 'seller';
}

