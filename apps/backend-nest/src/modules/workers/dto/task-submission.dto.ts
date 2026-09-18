import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class TaskSubmissionDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  goal!: string;

  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  project_id!: string;

  @ApiProperty({ enum: ['LOW', 'NORMAL', 'HIGH'], default: 'NORMAL', required: false })
  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH'])
  priority?: 'LOW' | 'NORMAL' | 'HIGH' = 'NORMAL';
}
