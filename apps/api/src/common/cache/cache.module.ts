import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { I_CACHE_REPOSITORY } from './cache.repository.port';
import { RedisCacheAdapter } from './redis-cache.adapter';

@Global() // Jadikan global agar tidak perlu import di setiap modul
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        // Konfigurasi bisa diambil dari ConfigService (.env)
        return new Redis({
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          // Jangan crash jika Redis mati, terus coba hubungkan
          retryStrategy: (times) => Math.min(times * 50, 2000),
        });
      },
    },
    {
      // Suntikkan REDIS_CLIENT ke dalam RedisCacheAdapter
      provide: I_CACHE_REPOSITORY,
      useFactory: (redisClient: Redis) => {
        return new RedisCacheAdapter(redisClient);
      },
      inject: ['REDIS_CLIENT'],
    },
  ],
  exports: [I_CACHE_REPOSITORY], // Export Port-nya saja, bukan Adapter-nya!
})
export class GlobalCacheModule {}