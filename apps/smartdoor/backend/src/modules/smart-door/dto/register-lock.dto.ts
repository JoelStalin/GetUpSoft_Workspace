import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class RegisterLockDto {
  @ApiProperty({ example: 'tenant-getupsoft-demo' })
  @IsString()
  tenant_id!: string;

  @ApiProperty({ example: 'Front Door' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'tuya_cloud' })
  @IsString()
  provider!: string;

  @ApiProperty({ example: 'tuya-device-frontdoor-01' })
  @IsString()
  provider_device_id!: string;

  @ApiProperty({ example: 'property-demo-main' })
  @IsString()
  property_id!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  supports_remote_unlock!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  supports_qr_web_access!: boolean;
}
