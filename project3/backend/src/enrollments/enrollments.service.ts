import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async autoEnroll(userId: number, courseId: number) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    // 유료 강의는 결제 후에만 수강 가능
    if (course.price > 0) {
      const paid = await this.prisma.payment.findFirst({
        where: { userId, courseId, status: 'PAID' },
      });
      if (!paid) {
        throw new ForbiddenException('유료 강의는 결제 후 수강할 수 있습니다.');
      }
    }

    const enrollment = await this.prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });

    return { enrollmentId: enrollment.id, courseId };
  }

  async getMyEnrollments(userId: number) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            sections: {
              include: { lectures: true },
            },
          },
        },
        lectureProgress: true,
      },
    });

    return enrollments.map((enrollment) => {
      const totalLectures = enrollment.course.sections.reduce(
        (sum, section) => sum + section.lectures.length,
        0,
      );
      const completedLectures = enrollment.lectureProgress.filter(
        (p) => p.isCompleted,
      ).length;
      const progressRate =
        totalLectures > 0
          ? Math.round((completedLectures / totalLectures) * 100 * 10) / 10
          : 0;

      return {
        courseId: enrollment.courseId,
        title: enrollment.course.title,
        thumbnailUrl: enrollment.course.thumbnailUrl,
        progressRate,
      };
    });
  }
}
