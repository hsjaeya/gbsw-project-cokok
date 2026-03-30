import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: '1장. 파스타 기초 재료' })
  @IsString()
  title: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  order: number;
}
