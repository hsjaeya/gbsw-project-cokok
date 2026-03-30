"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function ytThumbnail(videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
function resolveThumbnail(url, firstVideoId) {
    if (url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (match)
            return ytThumbnail(match[1]);
        return url;
    }
    return firstVideoId ? ytThumbnail(firstVideoId) : null;
}
let CoursesService = class CoursesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page = 1, limit = 12, categoryId, level, keyword } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (categoryId)
            where.categoryId = categoryId;
        if (level)
            where.level = level;
        if (keyword)
            where.title = { contains: keyword, mode: 'insensitive' };
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
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.course.count({ where }),
        ]);
        const enriched = courses.map(({ sections, ...course }) => ({
            ...course,
            thumbnailUrl: resolveThumbnail(course.thumbnailUrl, sections[0]?.lectures[0]?.youtubeVideoId ?? null),
        }));
        return {
            courses: enriched,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                category: true,
                sections: {
                    orderBy: { order: 'asc' },
                    include: {
                        lectures: { orderBy: { order: 'asc' } },
                    },
                },
            },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        return {
            ...course,
            thumbnailUrl: resolveThumbnail(course.thumbnailUrl, course.sections[0]?.lectures[0]?.youtubeVideoId ?? null),
        };
    }
    async create(dto) {
        return this.prisma.course.create({
            data: dto,
            include: { category: true },
        });
    }
    async update(id, dto) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        return this.prisma.course.update({
            where: { id },
            data: dto,
            include: { category: true },
        });
    }
    async remove(id) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        await this.prisma.course.delete({ where: { id } });
        return null;
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map