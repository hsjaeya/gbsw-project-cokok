import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CompleteLectureDto } from './dto/complete-lecture.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post('complete')
  @HttpCode(200)
  @ApiOperation({ summary: '강의 단위 완료 처리' })
  completeLecture(
    @CurrentUser() user: { id: number },
    @Body() dto: CompleteLectureDto,
  ) {
    return this.progressService.completeLecture(user.id, dto);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: '강의 진도 조회' })
  getCourseProgress(
    @CurrentUser() user: { id: number },
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.progressService.getCourseProgress(user.id, courseId);
  }
}
