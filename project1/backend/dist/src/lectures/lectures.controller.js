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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LecturesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lectures_service_1 = require("./lectures.service");
const create_lecture_dto_1 = require("./dto/create-lecture.dto");
const update_lecture_dto_1 = require("./dto/update-lecture.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let LecturesController = class LecturesController {
    lecturesService;
    constructor(lecturesService) {
        this.lecturesService = lecturesService;
    }
    create(sectionId, dto) {
        return this.lecturesService.create(sectionId, dto);
    }
    findOne(id) {
        return this.lecturesService.findOne(id);
    }
    update(sectionId, id, dto) {
        return this.lecturesService.update(sectionId, id, dto);
    }
    remove(sectionId, id) {
        return this.lecturesService.remove(sectionId, id);
    }
};
exports.LecturesController = LecturesController;
__decorate([
    (0, common_1.Post)('sections/:sectionId/lectures'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '강의 단위 생성 (관리자)' }),
    __param(0, (0, common_1.Param)('sectionId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_lecture_dto_1.CreateLectureDto]),
    __metadata("design:returntype", void 0)
], LecturesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('lectures/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '강의 단위 조회 (수강자)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LecturesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('sections/:sectionId/lectures/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '강의 단위 수정 (관리자)' }),
    __param(0, (0, common_1.Param)('sectionId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_lecture_dto_1.UpdateLectureDto]),
    __metadata("design:returntype", void 0)
], LecturesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('sections/:sectionId/lectures/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: '강의 단위 삭제 (관리자)' }),
    __param(0, (0, common_1.Param)('sectionId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], LecturesController.prototype, "remove", null);
exports.LecturesController = LecturesController = __decorate([
    (0, swagger_1.ApiTags)('Lectures'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [lectures_service_1.LecturesService])
], LecturesController);
//# sourceMappingURL=lectures.controller.js.map