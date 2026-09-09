import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class TestFlowRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  project!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  context!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;
}

export class AutomationFlowRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  goal!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  systems!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  context!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;
}

export class InteractionScriptRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  audience!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  objective!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  tone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  context!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;
}

export class RowboatChatRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conversation_id?: string;
}

export class HermesRunRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  prompt!: string;
}

export class CredentialWriteRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  values?: Record<string, string>;
}

export class WorkflowBlueprintRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ default: 'default' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  objective!: string;

  @ApiPropertyOptional({ default: 'draft' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: [Object], default: [] })
  @IsOptional()
  @IsArray()
  nodes?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [Object], default: [] })
  @IsOptional()
  @IsArray()
  edges?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: Object, default: {} })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}

export class BlueprintRunRequestDto {
  @ApiPropertyOptional({ default: 'default' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;
}

export class PipelineRunRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  task_type!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  objective!: string;
}
