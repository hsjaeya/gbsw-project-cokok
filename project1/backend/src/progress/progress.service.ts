import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteLectureDto } from './dto/complete-lecture.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async completeLecture(userId: number, dto: CompleteLectureDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
      include: {
        course: {
          include: {
            sections: { include: { lectures: true } },
          },
        },
      },
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.userId !== userId) throw new ForbiddenException();

    await this.prisma.lectureProgress.upsert({
      where: {
        enrollmentId_lectureId: {
          enrollmentId: dto.enrollmentId,
          lectureId: dto.lectureId,
        },
      },
      update: { isCompleted: true, completedAt: new Date() },
      create: {
        enrollmentId: dto.enrollmentId,
        lectureId: dto.lectureId,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    const totalLectures = enrollment.course.sections.reduce(
      (sum, section) => sum + section.lectures.length,
      0,
    );

    const completedCount = await this.prisma.lectureProgress.count({
      where: { enrollmentId: dto.enrollmentId, isCompleted: true },
    });

    const progressRate =
      totalLectures > 0
        ? Math.round((completedCount / totalLectures) * 100 * 10) / 10
        : 0;

    return {
      lectureId: dto.lectureId,
      isCompleted: true,
      progressRate,
    };
  }

  async getCourseProgress(userId: number, courseId: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: {
          include: {
            sections: { include: { lectures: true } },
          },
        },
        lectureProgress: { where: { isCompleted: true } },
      },
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const totalLectures = enrollment.course.sections.reduce(
      (sum, section) => sum + section.lectures.length,
      0,
    );
    const completedLectures = enrollment.lectureProgress.length;
    const progressRate =
      totalLectures > 0
        ? Math.round((completedLectures / totalLectures) * 100 * 10) / 10
        : 0;

    return {
      totalLectures,
      completedLectures,
      progressRate,
      isCompleted: totalLectures > 0 && completedLectures === totalLectures,
      completedLectureIds: enrollment.lectureProgress.map((p) => p.lectureId),
    };
  }
}
