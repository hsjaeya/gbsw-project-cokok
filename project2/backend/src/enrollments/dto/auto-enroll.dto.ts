import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AutoEnrollDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  courseId: number;
}
