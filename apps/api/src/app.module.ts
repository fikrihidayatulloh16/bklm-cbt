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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // Import
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'; // Opsional jika mau simpan hitungan di Redis
import { ClientLoggerModule } from './client-logger/client-logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, envFilePath: '.env',// Biar bisa dibaca di semua module (Auth, User, dll)
      
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000, // 60 detik
            limit: 150,  // 10 request
          },
        ],
        // 👇 KITA HUBUNGKAN KE REDIS DOCKER
        storage: new ThrottlerStorageRedisService({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
          db: 1, // Kita pisahkan DB Throttler (DB 1) biar gak campur sama Cache App (DB 0)
        }),
      }),
    }),
    PrismaModule, AssessmentModule, UsersModule, AuthModule, QuestionBankModule, SubmissionsModule, ClientLoggerModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService
  ],
})
export class AppModule {}
