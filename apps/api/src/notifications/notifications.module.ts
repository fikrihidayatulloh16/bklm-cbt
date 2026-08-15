// apps/api/src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { VolatileEventsGateway } from './adapter/volatile-events.gateway';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, VolatileEventsGateway],
})
export class NotificationsModule {}
