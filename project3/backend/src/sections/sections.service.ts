import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  private assertDraft(status: string) {
    if (status === 'APPROVED' || status === 'PENDING') {
      throw new ForbiddenException('승인된 강의 또는 심의 중인 강의는 수정할 수 없습니다.');
    }
  }

  async create(courseId: number, dto: CreateSectionDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    this.assertDraft(course.status);
    return this.prisma.section.create({ data: { ...dto, courseId } });
  }

  async update(courseId: number, id: number, dto: UpdateSectionDto) {
    const section = await this.prisma.section.findFirst({
      where: { id, courseId },
      include: { course: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    this.assertDraft(section.course.status);
    return this.prisma.section.update({ where: { id }, data: dto });
  }

  async remove(courseId: number, id: number) {
    const section = await this.prisma.section.findFirst({
      where: { id, courseId },
      include: { course: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    this.assertDraft(section.course.status);
    await this.prisma.section.delete({ where: { id } });
    return null;
  }
}
