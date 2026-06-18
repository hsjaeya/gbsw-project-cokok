import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeEmailDto } from './dto/subscribe-email.dto';
import { SubscribeDiscordDto } from './dto/subscribe-discord.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async subscribeEmail(dto: SubscribeEmailDto, userId?: number) {
    const existing = await this.prisma.subscription.findFirst({
      where: { type: 'EMAIL', email: dto.email, isActive: true },
    });
    if (existing) throw new BadRequestException('이미 구독 중인 이메일입니다.');

    return this.prisma.subscription.create({
      data: { type: 'EMAIL', email: dto.email, userId, isActive: true },
    });
  }

  async unsubscribeEmail(email: string) {
    await this.prisma.subscription.updateMany({
      where: { type: 'EMAIL', email, isActive: true },
      data: { isActive: false },
    });
    return { message: '이메일 구독이 해지되었습니다.' };
  }

  async subscribeDiscord(dto: SubscribeDiscordDto, userId: number) {
    const existing = await this.prisma.subscription.findFirst({
      where: { type: 'DISCORD', userId, isActive: true },
    });
    if (existing) throw new BadRequestException('이미 디스코드 구독 중입니다.');

    return this.prisma.subscription.create({
      data: {
        type: 'DISCORD',
        discordWebhookUrl: dto.discordWebhookUrl,
        userId,
        isActive: true,
      },
    });
  }

  async unsubscribeDiscord(userId: number) {
    await this.prisma.subscription.updateMany({
      where: { type: 'DISCORD', userId, isActive: true },
      data: { isActive: false },
    });
    return { message: '디스코드 구독이 해지되었습니다.' };
  }

  async getMySubscriptions(userId: number) {
    return this.prisma.subscription.findMany({
      where: { userId, isActive: true },
    });
  }
}
