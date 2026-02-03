import { Module } from '@nestjs/common';
import { ClientLoggerService } from './client-logger.service';
import { ClientLoggerController } from './client-logger.controller';

@Module({
  controllers: [ClientLoggerController],
  providers: [],
})
export class ClientLoggerModule {}
