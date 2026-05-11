import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InstructorService } from './instructor.service';
import { CreateInstructorCourseDto } from './dto/create-instructor-course.dto';
import { UpdateInstructorCourseDto } from './dto/update-instructor-course.dto';

@ApiTags('Instructor')
@Controller('instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR, Role.ADMIN)
@ApiBearerAuth()
export class InstructorController {
  constructor(private instructorService: InstructorService) {}

  @Get('courses')
  @ApiOperation({ summary: '내 강의 목록 (강사)' })
  findMyCourses(@CurrentUser() user: { id: number }) {
    return this.instructorService.findMyCourses(user.id);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: '내 강의 단건 조회 (강사)' })
  findMyCourse(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.instructorService.findMyCourse(id, user.id);
  }

  @Post('courses')
  @ApiOperation({ summary: '강의 초안 생성 (강사)' })
  create(
    @Body() dto: CreateInstructorCourseDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.instructorService.create(dto, user.id);
  }

  @Patch('courses/:id')
  @ApiOperation({ summary: '강의 수정 (강사, DRAFT/REJECTED 상태만)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInstructorCourseDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.instructorService.update(id, dto, user.id);
  }

  @Delete('courses/:id')
  @HttpCode(200)
  @ApiOperation({ summary: '강의 삭제 (강사, DRAFT/REJECTED 상태만)' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.instructorService.remove(id, user.id);
  }

  @Patch('courses/:id/submit')
  @ApiOperation({ summary: '심의 신청 (강사, DRAFT/REJECTED → PENDING)' })
  submit(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.instructorService.submit(id, user.id);
  }
}
