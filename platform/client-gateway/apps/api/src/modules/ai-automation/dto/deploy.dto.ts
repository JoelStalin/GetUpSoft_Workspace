import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class DeployRequestDto {
  @ApiPropertyOptional({ enum: ['dev', 'staging', 'prod'], default: 'dev' })
  @IsOptional()
  @IsIn(['dev', 'staging', 'prod'])
  target?: 'dev' | 'staging' | 'prod';
}

export class VersionBumpRequestDto {
  @ApiPropertyOptional({ enum: ['major', 'minor', 'patch'], default: 'patch' })
  @IsOptional()
  @IsIn(['major', 'minor', 'patch'])
  bump_type?: 'major' | 'minor' | 'patch';
}

export class DeploymentHistoryQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  project_id?: string;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 500 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}

