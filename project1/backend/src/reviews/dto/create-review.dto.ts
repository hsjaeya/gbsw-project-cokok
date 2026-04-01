import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, description: '별점 (1~5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: '정말 유익한 강의였습니다!' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;

  @ApiProperty({ example: 1, description: '강의 ID' })
  @IsInt()
  courseId: number;
}
