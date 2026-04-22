import {
  ForbiddenException,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateReviewDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: dto.courseId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('수강 중인 강의에만 리뷰를 작성할 수 있습니다.');
    }

    const existing = await this.prisma.review.findUnique({
      where: { userId_courseId: { userId, courseId: dto.courseId } },
    });
    if (existing) {
      throw new ConflictException('이미 이 강의에 리뷰를 작성하셨습니다.');
    }

    return this.prisma.review.create({
      data: { ...dto, userId },
      include: { user: { select: { nickname: true, profileImageUrl: true } } },
    });
  }

  async findByCourse(courseId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      this.prisma.review.findMany({
        where: { courseId },
        include: { user: { select: { nickname: true, profileImageUrl: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { courseId } }),
    ]);

    const allRatings = await this.prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
    });

    const avgRating = allRatings._avg.rating
      ? Math.round(allRatings._avg.rating * 10) / 10
      : null;

    return {
      reviews,
      avgRating,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async update(userId: number, reviewId: number, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    if (review.userId !== userId) throw new ForbiddenException('본인의 리뷰만 수정할 수 있습니다.');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: dto,
      include: { user: { select: { nickname: true, profileImageUrl: true } } },
    });
  }

  async remove(userId: number, reviewId: number) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    if (review.userId !== userId) throw new ForbiddenException('본인의 리뷰만 삭제할 수 있습니다.');

    await this.prisma.review.delete({ where: { id: reviewId } });
    return null;
  }

  async getMyReview(userId: number, courseId: number) {
    return this.prisma.review.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
  }

  async getMyReviews(userId: number) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true, thumbnailUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
