import { Controller, Post, Delete, Get, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeEmailDto } from './dto/subscribe-email.dto';
import { SubscribeDiscordDto } from './dto/subscribe-discord.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post('email')
  @ApiOperation({ summary: '이메일 구독 등록' })
  subscribeEmail(@Body() dto: SubscribeEmailDto) {
    return this.subscriptionsService.subscribeEmail(dto);
  }

  @Delete('email')
  @ApiOperation({ summary: '이메일 구독 해지' })
  unsubscribeEmail(@Query('email') email: string) {
    return this.subscriptionsService.unsubscribeEmail(email);
  }

  @Post('discord')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '디스코드 구독 등록' })
  subscribeDiscord(@CurrentUser() user: AuthUser, @Body() dto: SubscribeDiscordDto) {
    return this.subscriptionsService.subscribeDiscord(dto, user.id);
  }

  @Delete('discord')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '디스코드 구독 해지' })
  unsubscribeDiscord(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.unsubscribeDiscord(user.id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 구독 목록 조회' })
  getMySubscriptions(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.getMySubscriptions(user.id);
  }
}
