import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
  imports: [UsersModule, AuditModule, NotificationsModule, WebhooksModule, SchedulerModule],
  controllers: [AdminController],
})
export class AdminModule {}
