import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async autoEnroll(userId: number, courseId: number) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      return { enrollmentId: existing.id, courseId };
    }

    const enrollment = await this.prisma.enrollment.create({
      data: { userId, courseId },
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
