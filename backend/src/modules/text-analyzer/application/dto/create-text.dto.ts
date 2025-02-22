import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTextDto {
  @ApiProperty({
    description: 'The text to analyze',
    example: 'The quick brown fox jumps over the lazy dog.',
  })
  @IsString()
  @IsNotEmpty()
  // @MaxLength(10000)
  content: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  userId?: string;
}
