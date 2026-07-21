import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ICacheRepository } from './cache.repository.port';

@Injectable()
export class RedisCacheAdapter implements ICacheRepository {
  private readonly logger = new Logger(RedisCacheAdapter.name);

  // Redis instance akan disuntikkan via Dependency Injection
  constructor(private readonly redisClient: Redis) {}

  async getObj<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;

      // Setara dengan bincode::deserialize, kita gunakan JSON
      return JSON.parse(data) as T;
    } catch (error) {
      // Graceful degradation: Log error, kembalikan null (Cache Miss)
      this.logger.warn(`Cache GET Error [${key}]: ${(error as Error).message}`);
      return null;
    }
  }

  async setObj<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      const stringified = JSON.stringify(value);
      // Setara dengan set_ex di Rust
      await this.redisClient.setex(key, ttlSeconds, stringified);
    } catch (error) {
      this.logger.warn(`Cache SET Error [${key}]: ${(error as Error).message}`);
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      let deletedCount = 0;
      
      // Keajaiban ioredis: stream ini menggantikan loop cursor SCAN manual Anda
      const stream = this.redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      for await (const keys of stream) {
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
          deletedCount += keys.length;
        }
      }

      if (deletedCount > 0) {
        this.logger.log(`🧹 Cache invalidated: ${pattern} (Deleted: ${deletedCount})`);
      }
    } catch (error) {
      this.logger.warn(`Cache INVALIDATE Error [${pattern}]: ${(error as Error).message}`);
    }
  }
}