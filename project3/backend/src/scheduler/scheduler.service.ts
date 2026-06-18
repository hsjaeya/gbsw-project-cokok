import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  @Cron('0 9 * * 1')
  async sendWeeklySummary() {
    this.logger.log('Running weekly summary job');
    const topCourses = await this.prisma.course.findMany({
      where: { status: 'APPROVED' },
      orderBy: { enrollments: { _count: 'desc' } },
      take: 5,
      select: { id: true, title: true },
    });

    const courseList = topCourses
      .map((c, i) => `${i + 1}. ${c.title}`)
      .join('\n');

    const subscriptions = await this.prisma.subscription.findMany({
      where: { isActive: true, type: 'EMAIL' },
    });

    const subject = '[COKOK] 이번 주 인기 강의 Top 5';
    const html = `<h2>이번 주 인기 강의</h2><pre>${courseList}</pre>`;

    for (const sub of subscriptions) {
      if (sub.email) {
        await this.notifications.sendEmail(sub.email, subject, html);
      }
    }
    this.logger.log(`Weekly summary sent to ${subscriptions.length} subscribers`);
  }

  @Cron('0 10 * * *')
  async sendInactiveReminder() {
    this.logger.log('Running inactive reminder job');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const staleEnrollments = await this.prisma.enrollment.findMany({
      where: {
        updatedAt: { lt: sevenDaysAgo },
        lectureProgress: {
          some: { isCompleted: false },
        },
      },
      include: {
        user: { select: { email: true, nickname: true } },
        course: { select: { title: true } },
      },
    });

    for (const enrollment of staleEnrollments) {
      await this.notifications.sendEmail(
        enrollment.user.email,
        `[COKOK] ${enrollment.course.title} 강의를 계속 들어보세요!`,
        `<p>${enrollment.user.nickname}님, <strong>${enrollment.course.title}</strong> 강의를 7일 이상 듣지 않으셨어요. 지금 바로 이어서 들어보세요!</p>`,
      );
    }
    this.logger.log(`Inactive reminders sent to ${staleEnrollments.length} users`);
  }

  @Cron('0 3 * * *')
  async cleanupOldLogs() {
    this.logger.log('Running log cleanup job');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.prisma.systemLog.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });
    this.logger.log(`Deleted ${result.count} old system logs`);
  }

  async runWeeklySummaryManually() {
    return this.sendWeeklySummary();
  }

  async runInactiveReminderManually() {
    return this.sendInactiveReminder();
  }

  async runCleanupLogsManually() {
    return this.cleanupOldLogs();
  }
}
