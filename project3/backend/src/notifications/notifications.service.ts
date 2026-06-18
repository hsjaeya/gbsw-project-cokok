import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private webhooksService: WebhooksService,
  ) {
    const port = Number(process.env.MAIL_PORT ?? 587);
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Email send failed to ${to}: ${String(err)}`);
    }
  }

  async sendDiscord(webhookUrl: string, content: string, courseId?: number) {
    await this.webhooksService.sendWebhook(webhookUrl, { content }, courseId);
  }

  async notifyCourseApproved(courseId: number, courseTitle: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { isActive: true },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const courseUrl = `${frontendUrl}/courses/${courseId}`;
    const subject = `[COKOK] 새 강의가 등록됐어요: ${courseTitle}`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;">
        <h2 style="color:#f97316;margin-top:0;">📚 새 강의 알림</h2>
        <p style="color:#374151;">새 강의 <strong>${courseTitle}</strong>이 승인되어 수강 가능합니다.</p>
        <a href="${courseUrl}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          강의 바로가기
        </a>
        <p style="margin-top:20px;font-size:12px;color:#9ca3af;">COKOK 알림 서비스 · 구독 해지는 마이페이지에서 가능합니다.</p>
      </div>
    `;
    const discordContent = `📚 새 강의가 등록됐어요! **${courseTitle}** — 지금 확인해보세요.\n${courseUrl}`;

    for (const sub of subscriptions) {
      if (sub.type === 'EMAIL' && sub.email) {
        await this.sendEmail(sub.email, subject, html);
      } else if (sub.type === 'DISCORD' && sub.discordWebhookUrl) {
        await this.sendDiscord(sub.discordWebhookUrl, discordContent, courseId);
      }
    }
  }
}
