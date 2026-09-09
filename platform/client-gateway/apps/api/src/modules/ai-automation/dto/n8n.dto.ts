import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class N8nNodeDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  typeVersion?: number;

  @ApiProperty({ type: [Number] })
  @IsArray()
  position!: number[];

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class N8nWorkflowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ type: [N8nNodeDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => N8nNodeDto)
  nodes?: N8nNodeDto[];

  @ApiPropertyOptional({ type: Object, default: {} })
  @IsOptional()
  @IsObject()
  connections?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object, default: { executionOrder: 'v1' } })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object, default: {} })
  @IsOptional()
  @IsObject()
  orca_meta?: Record<string, unknown>;
}

export class N8nImportDirectoryDto {
  @ApiProperty()
  @IsString()
  source_path!: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 10000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  limit?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  dry_run?: boolean;
}

export class N8nGenerateWorkflowDto {
  @ApiProperty()
  @IsString()
  prompt!: string;

  @ApiPropertyOptional({ default: 'gpt-4' })
  @IsOptional()
  @IsString()
  model_id?: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  context?: string;
}
