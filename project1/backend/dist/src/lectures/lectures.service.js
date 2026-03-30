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
exports.LecturesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function parseYoutubeVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match)
            return match[1];
    }
    return url;
}
let LecturesService = class LecturesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(sectionId, dto) {
        const section = await this.prisma.section.findUnique({ where: { id: sectionId } });
        if (!section)
            throw new common_1.NotFoundException('Section not found');
        const { youtubeUrl, ...rest } = dto;
        const youtubeVideoId = parseYoutubeVideoId(youtubeUrl);
        return this.prisma.lecture.create({
            data: { ...rest, youtubeVideoId, sectionId },
        });
    }
    async findOne(id) {
        const lecture = await this.prisma.lecture.findUnique({
            where: { id },
            include: { section: { include: { course: true } } },
        });
        if (!lecture)
            throw new common_1.NotFoundException('Lecture not found');
        return lecture;
    }
    async update(sectionId, id, dto) {
        const lecture = await this.prisma.lecture.findFirst({ where: { id, sectionId } });
        if (!lecture)
            throw new common_1.NotFoundException('Lecture not found');
        const { youtubeUrl, ...rest } = dto;
        const data = { ...rest };
        if (youtubeUrl) {
            data.youtubeVideoId = parseYoutubeVideoId(youtubeUrl);
        }
        return this.prisma.lecture.update({ where: { id }, data });
    }
    async remove(sectionId, id) {
        const lecture = await this.prisma.lecture.findFirst({ where: { id, sectionId } });
        if (!lecture)
            throw new common_1.NotFoundException('Lecture not found');
        await this.prisma.lecture.delete({ where: { id } });
        return null;
    }
};
exports.LecturesService = LecturesService;
exports.LecturesService = LecturesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LecturesService);
//# sourceMappingURL=lectures.service.js.map