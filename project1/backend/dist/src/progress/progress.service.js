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
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProgressService = class ProgressService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async completeLecture(userId, dto) {
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
        if (!enrollment)
            throw new common_1.NotFoundException('Enrollment not found');
        if (enrollment.userId !== userId)
            throw new common_1.ForbiddenException();
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
        const totalLectures = enrollment.course.sections.reduce((sum, section) => sum + section.lectures.length, 0);
        const completedCount = await this.prisma.lectureProgress.count({
            where: { enrollmentId: dto.enrollmentId, isCompleted: true },
        });
        const progressRate = totalLectures > 0
            ? Math.round((completedCount / totalLectures) * 100 * 10) / 10
            : 0;
        return {
            lectureId: dto.lectureId,
            isCompleted: true,
            progressRate,
        };
    }
    async getCourseProgress(userId, courseId) {
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
        if (!enrollment)
            throw new common_1.NotFoundException('Enrollment not found');
        const totalLectures = enrollment.course.sections.reduce((sum, section) => sum + section.lectures.length, 0);
        const completedLectures = enrollment.lectureProgress.length;
        const progressRate = totalLectures > 0
            ? Math.round((completedLectures / totalLectures) * 100 * 10) / 10
            : 0;
        return {
            totalLectures,
            completedLectures,
            progressRate,
            completedLectureIds: enrollment.lectureProgress.map((p) => p.lectureId),
        };
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgressService);
//# sourceMappingURL=progress.service.js.map