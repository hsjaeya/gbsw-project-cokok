import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CourseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstructorCourseDto } from './dto/create-instructor-course.dto';
import { UpdateInstructorCourseDto } from './dto/update-instructor-course.dto';

@Injectable()
export class InstructorService {
  constructor(private prisma: PrismaService) {}

  /** 내 강의 목록 */
  async findMyCourses(instructorId: number) {
    return this.prisma.course.findMany({
      where: { instructorId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 내 강의 단건 조회 */
  async findMyCourse(id: number, instructorId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        sections: {
          orderBy: { order: 'asc' },
          include: { lectures: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId)
      throw new ForbiddenException('Not your course');
    return course;
  }

  /** 강의 초안 생성 */
  async create(dto: CreateInstructorCourseDto, instructorId: number) {
    return this.prisma.course.create({
      data: { ...dto, instructorId, status: CourseStatus.DRAFT },
      include: { category: true },
    });
  }

  /** 강의 수정 (DRAFT 또는 REJECTED 상태만) */
  async update(id: number, dto: UpdateInstructorCourseDto, instructorId: number) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId)
      throw new ForbiddenException('Not your course');
    if (course.status === CourseStatus.PENDING || course.status === CourseStatus.APPROVED)
      throw new ForbiddenException('심의 중이거나 승인된 강의는 수정할 수 없습니다');

    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  /** 강의 삭제 (DRAFT / REJECTED만) */
  async remove(id: number, instructorId: number) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId)
      throw new ForbiddenException('Not your course');
    if (course.status === CourseStatus.PENDING || course.status === CourseStatus.APPROVED)
      throw new ForbiddenException('심의 중이거나 승인된 강의는 삭제할 수 없습니다');

    await this.prisma.course.delete({ where: { id } });
    return null;
  }

  /** 심의 신청 (DRAFT / REJECTED → PENDING) */
  async submit(id: number, instructorId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { sections: { include: { lectures: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId)
      throw new ForbiddenException('Not your course');
    if (course.status === CourseStatus.PENDING)
      throw new ForbiddenException('이미 심의 신청된 강의입니다');
    if (course.status === CourseStatus.APPROVED)
      throw new ForbiddenException('이미 승인된 강의입니다');

    // 섹션 및 강의가 1개 이상 있어야 심의 신청 가능
    const totalLectures = course.sections.reduce((s, sec) => s + sec.lectures.length, 0);
    if (course.sections.length === 0 || totalLectures === 0) {
      throw new ForbiddenException('강의 단위(영상)가 최소 1개 이상 있어야 심의 신청할 수 있습니다.');
    }

    return this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.PENDING, rejectionReason: null },
      include: { category: true },
    });
  }
}
