import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class FileReadRequestDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  path!: string;
}

export class FileWriteRequestDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  path!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  create_dirs?: boolean = true;
}

export class FileDeleteRequestDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  path!: string;
}

export class GitCommitRequestDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}

export class GitPushRequestDto {
  @ApiProperty({ default: 'main', required: false })
  @IsOptional()
  @IsString()
  branch?: string = 'main';

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  force?: boolean = false;
}

export class GitPullRequestDto {
  @ApiProperty({ default: 'main', required: false })
  @IsOptional()
  @IsString()
  branch?: string = 'main';
}

export class CommandExecuteRequestDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  command!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cwd?: string;

  @ApiProperty({ default: 300, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeout?: number = 300;
}
