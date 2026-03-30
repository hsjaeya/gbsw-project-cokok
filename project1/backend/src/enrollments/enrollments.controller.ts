import { Controller, Post, Get, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { AutoEnrollDto } from './dto/auto-enroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post('auto')
  @HttpCode(200)
  @ApiOperation({ summary: '자동 수강 등록 (시청 페이지 진입 시)' })
  autoEnroll(
    @CurrentUser() user: { id: number },
    @Body() dto: AutoEnrollDto,
  ) {
    return this.enrollmentsService.autoEnroll(user.id, dto.courseId);
  }

  @Get('me')
  @ApiOperation({ summary: '내 수강 목록 조회' })
  getMyEnrollments(@CurrentUser() user: { id: number }) {
    return this.enrollmentsService.getMyEnrollments(user.id);
  }
}
