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
exports.CreateLectureDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateLectureDto {
    title;
    youtubeUrl;
    order;
    isPreview = false;
    durationSeconds;
}
exports.CreateLectureDto = CreateLectureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '파스타 면 종류 알아보기' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLectureDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://www.youtube.com/watch?v=VIDEO_ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLectureDto.prototype, "youtubeUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLectureDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLectureDto.prototype, "isPreview", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 480 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLectureDto.prototype, "durationSeconds", void 0);
//# sourceMappingURL=create-lecture.dto.js.map