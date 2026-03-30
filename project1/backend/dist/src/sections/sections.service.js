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
exports.SectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SectionsService = class SectionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(courseId, dto) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        return this.prisma.section.create({ data: { ...dto, courseId } });
    }
    async update(courseId, id, dto) {
        const section = await this.prisma.section.findFirst({ where: { id, courseId } });
        if (!section)
            throw new common_1.NotFoundException('Section not found');
        return this.prisma.section.update({ where: { id }, data: dto });
    }
    async remove(courseId, id) {
        const section = await this.prisma.section.findFirst({ where: { id, courseId } });
        if (!section)
            throw new common_1.NotFoundException('Section not found');
        await this.prisma.section.delete({ where: { id } });
        return null;
    }
};
exports.SectionsService = SectionsService;
exports.SectionsService = SectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SectionsService);
//# sourceMappingURL=sections.service.js.map