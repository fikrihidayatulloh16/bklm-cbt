import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 🔥 PAKSA PRISMA MENGGUNAKAN URL DARI ENVIRONMENT
    // Jika tidak ada ini, Prisma akan diam-diam membaca file .env utama!
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL, 
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database Connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database Disconnected');
  }
}
