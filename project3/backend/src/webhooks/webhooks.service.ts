import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  async sendWebhook(
    targetUrl: string,
    payload: Record<string, unknown>,
    courseId?: number,
    maxRetries = 3,
  ) {
    let retryCount = 0;
    let statusCode: number | null = null;
    let isSuccess = false;
    let responseMs: number | null = null;

    while (retryCount < maxRetries) {
      const start = Date.now();
      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        statusCode = res.status;
        responseMs = Date.now() - start;
        isSuccess = res.ok;
        if (isSuccess) break;
      } catch {
        responseMs = Date.now() - start;
      }
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise((r) => setTimeout(r, 60000));
      }
    }

    await this.prisma.webhookLog.create({
      data: {
        targetUrl,
        payload: payload as any,
        statusCode,
        isSuccess,
        retryCount,
        responseMs,
        courseId,
      },
    });

    return isSuccess;
  }

  async findAll(page = 1, limit = 20, isSuccess?: boolean) {
    const where = isSuccess !== undefined ? { isSuccess } : {};
    const [items, total] = await Promise.all([
      this.prisma.webhookLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.webhookLog.count({ where }),
    ]);
    return { items, total, page, limit };
  }
}
