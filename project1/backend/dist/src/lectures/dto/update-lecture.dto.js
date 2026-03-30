"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLectureDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_lecture_dto_1 = require("./create-lecture.dto");
class UpdateLectureDto extends (0, swagger_1.PartialType)(create_lecture_dto_1.CreateLectureDto) {
}
exports.UpdateLectureDto = UpdateLectureDto;
//# sourceMappingURL=update-lecture.dto.js.map