import {
  Controller,
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
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Sections')
@Controller('courses/:courseId/sections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class SectionsController {
  constructor(private sectionsService: SectionsService) {}

  @Post()
  @ApiOperation({ summary: '섹션 생성 (관리자)' })
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateSectionDto,
  ) {
    return this.sectionsService.create(courseId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '섹션 수정 (관리자)' })
  update(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(courseId, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '섹션 삭제 (관리자)' })
  remove(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.sectionsService.remove(courseId, id);
  }
}
