import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CompleteLectureDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  lectureId: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  enrollmentId: number;
}
