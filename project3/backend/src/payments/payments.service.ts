import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  private getTossAuthHeader(): string {
    const secretKey = this.config.get<string>('TOSS_SECRET_KEY', '');
    return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
  }

  async confirm(userId: number, dto: ConfirmPaymentDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');

    const existing = await this.prisma.payment.findUnique({
      where: { orderId: dto.orderId },
    });
    if (existing) throw new BadRequestException('이미 처리된 주문입니다.');

    // 무료 강의는 결제 불가
    if (course.price === 0) {
      throw new BadRequestException('무료 강의는 결제가 필요하지 않습니다.');
    }

    // 금액 검증
    if (course.price !== dto.amount) {
      throw new BadRequestException('결제 금액이 올바르지 않습니다.');
    }

    // 이미 결제한 강의 중복 결제 방지
    const alreadyPaid = await this.prisma.payment.findFirst({
      where: { userId, courseId: dto.courseId, status: 'PAID' },
    });
    if (alreadyPaid) throw new BadRequestException('이미 결제한 강의입니다.');

    // 토스페이먼츠 결제 승인 API 호출
    try {
      await firstValueFrom(
        this.httpService.post(
          'https://api.tosspayments.com/v1/payments/confirm',
          {
            paymentKey: dto.paymentKey,
            orderId: dto.orderId,
            amount: dto.amount,
          },
          {
            headers: {
              Authorization: this.getTossAuthHeader(),
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (err: any) {
      const tossError = err?.response?.data;
      throw new BadRequestException(
        tossError?.message ?? '토스페이먼츠 결제 승인에 실패했습니다.',
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        paymentKey: dto.paymentKey,
        userId,
        courseId: dto.courseId,
        amount: dto.amount,
        status: 'PAID',
        paidAt: new Date(),
      },
      include: { course: { select: { id: true, title: true, thumbnailUrl: true } } },
    });

    // 수강 이력 생성
    await this.prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: dto.courseId } },
      update: {},
      create: { userId, courseId: dto.courseId },
    });

    return payment;
  }

  async getMyPayments(userId: number) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { course: { select: { id: true, title: true, thumbnailUrl: true } } },
    });
  }

  async getAllPayments(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nickname: true, email: true } },
          course: { select: { id: true, title: true } },
        },
      }),
      this.prisma.payment.count(),
    ]);
    return { items, total, page, limit };
  }

  async refund(id: number) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('결제 내역을 찾을 수 없습니다.');
    if (payment.status !== 'PAID') throw new BadRequestException('환불 가능한 상태가 아닙니다.');
    if (!payment.paymentKey) throw new InternalServerErrorException('paymentKey가 없습니다.');

    // 토스페이먼츠 환불 API 호출
    try {
      await firstValueFrom(
        this.httpService.post(
          `https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`,
          { cancelReason: '관리자 환불 처리' },
          {
            headers: {
              Authorization: this.getTossAuthHeader(),
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (err: any) {
      const tossError = err?.response?.data;
      throw new BadRequestException(
        tossError?.message ?? '토스페이먼츠 환불 처리에 실패했습니다.',
      );
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    });

    // 수강 이력 및 진도 데이터 삭제
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
    });
    if (enrollment) {
      await this.prisma.lectureProgress.deleteMany({
        where: { enrollmentId: enrollment.id },
      });
      await this.prisma.enrollment.delete({ where: { id: enrollment.id } });
    }

    return updated;
  }
}
