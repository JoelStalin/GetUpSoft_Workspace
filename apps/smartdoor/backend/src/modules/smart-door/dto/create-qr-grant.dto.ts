import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateQrGrantDto {
  @ApiProperty({ example: 'tenant-getupsoft-demo' })
  @IsString()
  tenant_id!: string;

  @ApiProperty({ example: 'lock-tuya-frontdoor-01' })
  @IsString()
  smart_lock_id!: string;

  @ApiProperty({ example: 'owner-demo-01' })
  @IsString()
  issued_by_user_id!: string;

  @ApiProperty({ example: 'Guest Pedro' })
  @IsString()
  guest_label!: string;

  @ApiProperty({ example: '2026-06-25T14:00:00.000Z' })
  @IsDateString()
  valid_from!: string;

  @ApiProperty({
    example: 180,
    description: 'Stay-time validity window in minutes from valid_from.',
  })
  @IsInt()
  @Min(1)
  @Max(10080)
  stay_duration_minutes!: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['08:00-18:00'],
    description: 'Optional allowed time windows for the QR grant.',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowed_hours?: string[];

  @ApiPropertyOptional({ example: 3, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  max_uses?: number;
}
