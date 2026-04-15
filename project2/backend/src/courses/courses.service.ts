import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';

function ytThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function resolveThumbnail(url: string | null, firstVideoId: string | null): string | null {
  if (url) {
    // 관리자가 YouTube 영상 URL을 입력했을 경우 썸네일 URL로 변환
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (match) return ytThumbnail(match[1]);
    return url;
  }
  return firstVideoId ? ytThumbnail(firstVideoId) : null;
}

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCourseDto) {
    const { page = 1, limit = 12, categoryId, level, keyword } = query;
    const skip = (page - 1) * limit;

    const where: any = { status: CourseStatus.APPROVED };
    if (categoryId) where.categoryId = categoryId;
    if (level) where.level = level;
    if (keyword) where.title = { contains: keyword, mode: 'insensitive' };

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          sections: {
            orderBy: { order: 'asc' },
            include: {
              lectures: { orderBy: { order: 'asc' } },
            },
          },
          reviews: { select: { rating: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    const enriched = courses.map(({ sections, reviews, _count, ...course }) => {
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
          : null;
      return {
        ...course,
        thumbnailUrl: resolveThumbnail(
          course.thumbnailUrl,
          sections[0]?.lectures[0]?.youtubeVideoId ?? null,
        ),
        avgRating,
        reviewCount,
        enrollmentCount: _count.enrollments,
      };
    });

    return {
      courses: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id, status: CourseStatus.APPROVED },
      include: {
        category: true,
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lectures: { orderBy: { order: 'asc' } },
          },
        },
        reviews: { select: { rating: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const reviewCount = course.reviews.length;
    const avgRating =
      reviewCount > 0
        ? Math.round(
            (course.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10,
          ) / 10
        : null;

    const { reviews, _count, ...rest } = course;
    return {
      ...rest,
      thumbnailUrl: resolveThumbnail(
        course.thumbnailUrl,
        course.sections[0]?.lectures[0]?.youtubeVideoId ?? null,
      ),
      avgRating,
      reviewCount,
      enrollmentCount: _count.enrollments,
    };
  }

  async create(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: { ...dto, status: CourseStatus.APPROVED },
      include: { category: true },
    });
  }

  async update(id: number, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: number) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    await this.prisma.course.delete({ where: { id } });
    return null;
  }
}
