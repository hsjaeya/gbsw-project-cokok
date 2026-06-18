import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { Level } from '@prisma/client';

export class CreateInstructorCourseDto {
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

  @ApiPropertyOptional({ example: 29000, description: '강의 가격 (0 = 무료)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'https://discord.com/api/webhooks/...', description: '강사 Webhook URL (승인/반려 시 이벤트 수신)' })
  @IsOptional()
  @IsString()
  instructorWebhookUrl?: string;
}
