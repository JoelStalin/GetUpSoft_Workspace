import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';

export class InterpretRequestDto {
  @ApiProperty({ enum: ['text', 'script', 'audio'], default: 'text' })
  @IsIn(['text', 'script', 'audio'])
  source_type: 'text' | 'script' | 'audio' = 'text';

  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  content!: string;
}
