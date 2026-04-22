import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CourseStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RejectCourseDto } from './dto/reject-course.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  @Get('users')
  @ApiOperation({ summary: '전체 회원 목록 조회 (관리자)' })
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get('courses')
  @ApiOperation({ summary: '전체 강의 목록 (관리자, 상태 필터 가능)' })
  @ApiQuery({ name: 'status', enum: CourseStatus, required: false })
  getCourses(@Query('status') status?: CourseStatus) {
    return this.prisma.course.findMany({
      where: status ? { status } : undefined,
      include: {
        category: true,
        instructor: { select: { id: true, nickname: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch('courses/:id/approve')
  @ApiOperation({ summary: '강의 승인 (PENDING → APPROVED)' })
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.APPROVED, rejectionReason: null },
      include: { category: true },
    });
  }

  @Patch('courses/:id/reject')
  @ApiOperation({ summary: '강의 반려 (PENDING → REJECTED)' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectCourseDto,
  ) {
    return this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.REJECTED, rejectionReason: dto.reason ?? null },
      include: { category: true },
    });
  }
}
