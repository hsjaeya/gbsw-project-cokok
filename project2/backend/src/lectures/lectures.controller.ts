import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LecturesService } from './lectures.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Lectures')
@Controller()
export class LecturesController {
  constructor(private lecturesService: LecturesService) {}

  @Post('sections/:sectionId/lectures')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '강의 단위 생성 (강사)' })
  create(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateLectureDto,
  ) {
    return this.lecturesService.create(sectionId, dto);
  }

  @Get('lectures/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '강의 단위 조회 (수강자)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lecturesService.findOne(id);
  }

  @Patch('sections/:sectionId/lectures/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '강의 단위 수정 (강사)' })
  update(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLectureDto,
  ) {
    return this.lecturesService.update(sectionId, id, dto);
  }

  @Delete('sections/:sectionId/lectures/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '강의 단위 삭제 (강사)' })
  remove(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lecturesService.remove(sectionId, id);
  }
}
