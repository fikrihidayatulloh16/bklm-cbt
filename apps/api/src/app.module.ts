import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AssessmentModule } from './assessment/assessment.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientLoggerModule } from './client-logger/client-logger.module';
import { RedisBufferModule } from './shared/redis/redis-buffer.module';
import { WorkersModule } from './workers/workers.module';
import { ClassModule } from './class/class.module';
import { GlobalCacheModule } from './common/cache/cache.module';

// import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'; // Opsional jika mau simpan hitungan di Redis
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // Import
// import { APP_GUARD } from '@nestjs/core';
import { AssessmentSessionModule } from './assessment-session/assessment-session.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      isGlobal: true,
      
      // isGlobal: true, envFilePath: '.env',// Biar bisa dibaca di semua module (Auth, User, dll)
    }),
    
    // 👇 THROTTLER DINONAKTIFKAN SEMENTARA (DIBUAT KOMENTAR)
    /*
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000, // 60 detik
            limit: 2,  // 10 request
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
          db: 1, 
        }),
      }),
    }),
    */
    // 👆 BATAS KOMENTAR THROTTLER

    PrismaModule, 
    AssessmentModule, 
    UsersModule, 
    AuthModule, 
    QuestionBankModule, 
    SubmissionsModule, 
    ClientLoggerModule,
    ScheduleModule.forRoot(),
    RedisBufferModule,
    WorkersModule,
    ClassModule,
    AssessmentSessionModule,
    GlobalCacheModule,
    EventEmitterModule.forRoot(),
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    // 👇 GUARD THROTTLER DINONAKTIFKAN
    /*
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    */
    // 👆 BATAS KOMENTAR GUARD
    
    AppService
  ],
})
export class AppModule {}