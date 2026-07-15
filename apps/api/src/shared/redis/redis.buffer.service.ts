import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisBufferService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisBufferService.name);
  private readonly redisClient: Redis; // Jadikan readonly agar immutable setelah constructor

  constructor() {
    // Boilerplate Rule #16: Fail-Fast System
    // Pastikan konfigurasi dibaca dan di-cast dengan aman
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
    
    // Asumsikan Redis bisa jalan tanpa password di local, 
    // namun beri undefined secara eksplisit jika kosong agar ioredis tidak protes.
    const password = process.env.REDIS_PASSWORD || undefined;
    const db = process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0;

    // Inisialisasi langsung di dalam Constructor
    this.redisClient = new Redis({ host, port, password, db });

    this.redisClient.on('connect', () => {
      this.logger.log('Berhasil terhubung ke Redis Buffer (AOF Active)');
    });

    this.redisClient.on('error', (err) => {
      this.logger.error('Koneksi Redis Buffer Gagal', err);
    });
  }

  // Lifecycle hook untuk membersihkan koneksi dengan elegan
  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  /**
   * Domain-Agnostic Hash Setter
   */
  async setHash(key: string, field: string, data: any, ttlSeconds = 86400): Promise<void> {
    await this.redisClient.hset(key, field, JSON.stringify(data));
    await this.redisClient.expire(key, ttlSeconds);
  }

  /**
   * Domain-Agnostic Pattern Harvester
   */
  async harvestPattern(pattern: string): Promise<{ key: string; data: Record<string, string> }[]> {
    const keys = await this.redisClient.keys(pattern);
    
    if (keys.length === 0) return [];

    const harvestedData: { key: string; data: Record<string, string> }[] = [];
    const pipeline = this.redisClient.pipeline();

    // 1. Masukkan perintah ke dalam pipa antrean
    for (const key of keys) {
      pipeline.hgetall(key);
      pipeline.del(key); 
    }

    // 2. Eksekusi semua secara atomik
    const results = await pipeline.exec();
    if (!results) return harvestedData;

    // 3. Proses hasil dengan melompati perintah DEL
    // Ingat: Setiap 1 kunci memiliki 2 perintah (HGETALL dan DEL).
    // Jadi indeks HGETALL selalu genap (0, 2, 4, 6...)
    for (let i = 0; i < keys.length; i++) {
      // Ambil hasil dari indeks genap saja (hasil dari HGETALL)
      const hgetResultIndex = i * 2;
      const result = results[hgetResultIndex];

      const err = result[0];
      const data = result[1];

      // Jika tidak ada error dan data tidak kosong (bukan { })
      if (!err && data && Object.keys(data).length > 0) {
        harvestedData.push({
          key: keys[i], // Sekarang indeks 'i' selalu cocok 1:1 dengan panjang array 'keys'
          data: data as Record<string, string>,
        });
      }
    }

    return harvestedData;
  }
}