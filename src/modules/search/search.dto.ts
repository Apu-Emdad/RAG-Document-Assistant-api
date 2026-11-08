import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDto {
  @ApiProperty({ example: 'What is ingest?' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Question must be text' })
  @IsNotEmpty({ message: 'Question is required' })
  question: string;
}
