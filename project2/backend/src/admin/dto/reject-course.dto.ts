import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectCourseDto {
  @ApiPropertyOptional({ example: '강의 내용이 부적절합니다.' })
  @IsOptional()
  @IsString()
  reason?: string;
}
