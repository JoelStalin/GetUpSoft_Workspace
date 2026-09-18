import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString, MinLength } from 'class-validator';

export class LockActionRequestDto {
  @ApiProperty({ example: 'idem-smartdoor-0001' })
  @IsString()
  @MinLength(8)
  idempotency_key!: string;

  @ApiProperty({ example: 'corr-smartdoor-0001' })
  @IsString()
  @MinLength(8)
  correlation_id!: string;

  @ApiProperty({ example: 'mobile-biometric-assertion-123' })
  @IsString()
  @MinLength(8)
  biometric_assertion_id!: string;

  @ApiProperty({ example: 'Remote guest unlock' })
  @IsString()
  reason!: string;

  @ApiProperty({ example: '2026-06-25T14:10:00.000Z' })
  @IsISO8601()
  client_timestamp!: string;
}
