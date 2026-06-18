import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message: 'Password must contain letters, numbers, and special characters',
  })
  password: string;

  @ApiProperty({ example: '요리왕' })
  @IsString()
  nickname: string;

  @ApiPropertyOptional({ example: 'STUDENT', enum: ['STUDENT', 'INSTRUCTOR'] })
  @IsOptional()
  @IsIn(['STUDENT', 'INSTRUCTOR'])
  role?: 'STUDENT' | 'INSTRUCTOR';
}
