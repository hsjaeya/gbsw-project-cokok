import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    adminId: number,
    action: string,
    targetType: string,
    targetId?: number,
    detail?: Record<string, unknown>,
  ) {
    return this.prisma.auditLog.create({
      data: { adminId, action, targetType, targetId, detail: detail as any },
    });
  }

  async findAll(page = 1, limit = 20, action?: string) {
    const where = action ? { action } : {};
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { id: true, nickname: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, total, page, limit };
  }
}
