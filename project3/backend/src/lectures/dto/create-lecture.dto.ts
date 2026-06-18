import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class CreateLectureDto {
  @ApiProperty({ example: '파스타 면 종류 알아보기' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=VIDEO_ID' })
  @IsString()
  youtubeUrl: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  order: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean = false;

  @ApiPropertyOptional({ example: 480 })
  @IsOptional()
  @IsInt()
  durationSeconds?: number;
}
