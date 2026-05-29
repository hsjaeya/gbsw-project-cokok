import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';

function parseYoutubeVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  throw new BadRequestException('유효한 YouTube URL이 아닙니다.');
}

@Injectable()
export class LecturesService {
  constructor(private prisma: PrismaService) {}

  async create(sectionId: number, dto: CreateLectureDto) {
    const section = await this.prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) throw new NotFoundException('Section not found');

    const { youtubeUrl, ...rest } = dto;
    const youtubeVideoId = parseYoutubeVideoId(youtubeUrl.trim());

    return this.prisma.lecture.create({
      data: { ...rest, youtubeVideoId, sectionId },
    });
  }

  async findOne(id: number) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      include: { section: { include: { course: true } } },
    });
    if (!lecture) throw new NotFoundException('Lecture not found');
    return lecture;
  }

  async update(sectionId: number, id: number, dto: UpdateLectureDto) {
    const lecture = await this.prisma.lecture.findFirst({ where: { id, sectionId } });
    if (!lecture) throw new NotFoundException('Lecture not found');

    const { youtubeUrl, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (youtubeUrl) {
      data.youtubeVideoId = parseYoutubeVideoId(youtubeUrl.trim());
    }

    return this.prisma.lecture.update({ where: { id }, data });
  }

  async remove(sectionId: number, id: number) {
    const lecture = await this.prisma.lecture.findFirst({ where: { id, sectionId } });
    if (!lecture) throw new NotFoundException('Lecture not found');
    await this.prisma.lecture.delete({ where: { id } });
    return null;
  }
}
