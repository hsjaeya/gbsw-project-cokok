import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async create(courseId: number, dto: CreateSectionDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.section.create({ data: { ...dto, courseId } });
  }

  async update(courseId: number, id: number, dto: UpdateSectionDto) {
    const section = await this.prisma.section.findFirst({ where: { id, courseId } });
    if (!section) throw new NotFoundException('Section not found');
    return this.prisma.section.update({ where: { id }, data: dto });
  }

  async remove(courseId: number, id: number) {
    const section = await this.prisma.section.findFirst({ where: { id, courseId } });
    if (!section) throw new NotFoundException('Section not found');
    await this.prisma.section.delete({ where: { id } });
    return null;
  }
}
