import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEnum, IsUrl } from 'class-validator';
import { Level } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: '초보자를 위한 파스타' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ enum: Level, example: Level.BEGINNER })
  @IsEnum(Level)
  level: Level;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoryId: number;
}
