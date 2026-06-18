import {
  Controller,
  Get,
  Patch,
  Post,
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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { RejectCourseDto } from './dto/reject-course.dto';
import type { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
    private webhooksService: WebhooksService,
    private schedulerService: SchedulerService,
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

  @Get('courses/:id')
  @ApiOperation({ summary: '강의 상세 조회 (관리자, 섹션/강의 포함)' })
  getCourseDetail(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: { select: { id: true, nickname: true, email: true } },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lectures: { orderBy: { order: 'asc' } },
          },
        },
      },
    });
  }

  @Patch('courses/:id/approve')
  @ApiOperation({ summary: '강의 승인 (PENDING → APPROVED)' })
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() admin: AuthUser,
  ) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.APPROVED, rejectionReason: null },
      include: { category: true },
    });

    // 감사 로그
    await this.auditService.log(admin.id, 'COURSE_APPROVE', 'COURSE', id, {
      courseTitle: course.title,
    });

    // 구독자 알림 발송
    this.notificationsService.notifyCourseApproved(id, course.title).catch(() => {});

    // 강사 Webhook 알림
    if (course.instructorWebhookUrl) {
      this.webhooksService
        .sendWebhook(
          course.instructorWebhookUrl,
          {
            event: 'course.approved',
            courseId: id,
            courseTitle: course.title,
            status: 'APPROVED',
            timestamp: new Date().toISOString(),
          },
          id,
        )
        .catch(() => {});
    }

    return course;
  }

  @Patch('courses/:id/reject')
  @ApiOperation({ summary: '강의 반려 (PENDING → REJECTED)' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectCourseDto,
    @CurrentUser() admin: AuthUser,
  ) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.REJECTED, rejectionReason: dto.reason ?? null },
      include: { category: true },
    });

    // 감사 로그
    await this.auditService.log(admin.id, 'COURSE_REJECT', 'COURSE', id, {
      courseTitle: course.title,
      reason: dto.reason,
    });

    // 강사 Webhook 알림
    if (course.instructorWebhookUrl) {
      this.webhooksService
        .sendWebhook(
          course.instructorWebhookUrl,
          {
            event: 'course.rejected',
            courseId: id,
            courseTitle: course.title,
            status: 'REJECTED',
            reason: dto.reason,
            timestamp: new Date().toISOString(),
          },
          id,
        )
        .catch(() => {});
    }

    return course;
  }

  @Get('webhook-logs')
  @ApiOperation({ summary: 'Webhook 발송 이력 조회 (관리자)' })
  getWebhookLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.webhooksService.findAll(page, limit);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: '감사 로그 조회 (관리자)' })
  getAuditLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('action') action?: string,
  ) {
    return this.auditService.findAll(page, limit, action);
  }

  @Post('scheduler/weekly-summary')
  @ApiOperation({ summary: '주간 강의 요약 메일 수동 실행 (관리자)' })
  runWeeklySummary() {
    return this.schedulerService.runWeeklySummaryManually();
  }

  @Post('scheduler/inactive-reminder')
  @ApiOperation({ summary: '수강 독려 메일 수동 실행 (관리자)' })
  runInactiveReminder() {
    return this.schedulerService.runInactiveReminderManually();
  }

  @Post('scheduler/cleanup-logs')
  @ApiOperation({ summary: '오래된 로그 정리 수동 실행 (관리자)' })
  runCleanupLogs() {
    return this.schedulerService.runCleanupLogsManually();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: '사용자 역할 변경 (관리자)' })
  changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: Role,
  ) {
    return this.usersService.changeRole(id, role);
  }
}
